import { normalizeCategory } from '../../shared/categories.ts'
import { pageNumber, paginate, requestedCategories } from '../../shared/query.ts'
import type { Article, ArticleCategory, ArticleQuery } from '../../shared/types.ts'
import { compactParams, fetchJson } from '../http.ts'
import {
  inDateRange,
  loadRssItems,
  matchesKeyword,
  rssAuthor,
  rssImage,
  rssLink,
  stripHtml,
  uniqueFeedKeys,
} from '../rss.ts'
import type { NewsSource } from './NewsSource.ts'

const SECTION_MAP: Record<string, string> = {
  world: 'World',
  business: 'Business',
  technology: 'Technology',
  science: 'Science',
  sports: 'Sports',
  health: 'Health',
  entertainment: 'Arts',
  politics: 'Politics',
  culture: 'Arts',
  general: 'U.S.',
}

const RSS_FEEDS: Record<string, string> = {
  general: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  world: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
  business: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
  technology: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
  science: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml',
  sports: 'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml',
  health: 'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml',
  entertainment: 'https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml',
  politics: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml',
  culture: 'https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml',
}

type NytMultimedia =
  | Array<{ url?: string; subtype?: string }>
  | { default?: { url?: string }; thumbnail?: { url?: string } }
  | undefined

type NytSearchResponse = {
  response?: {
    docs?: Array<{
      _id: string
      web_url: string
      snippet?: string
      abstract?: string
      pub_date?: string
      news_desk?: string
      section_name?: string
      headline?: { main?: string }
      byline?: { original?: string }
      multimedia?: NytMultimedia
    }>
  }
}

export class NytSource implements NewsSource {
  readonly id = 'nyt' as const
  readonly name = 'New York Times'
  private apiKey: string | undefined

  constructor(apiKey: string | undefined) {
    this.apiKey = apiKey || undefined
  }

  isConfigured() {
    return true
  }

  async search(query: ArticleQuery): Promise<Article[]> {
    if (this.apiKey) return this.searchApi(query)
    return this.searchRss(query)
  }

  private async searchApi(query: ArticleQuery): Promise<Article[]> {
    const filters = ['document_type:("article")']
    const sections = requestedCategories(query)
      .map((category) => SECTION_MAP[category])
      .filter(Boolean)
    if (sections.length) {
      filters.push(`section_name:(${sections.map((section) => `"${section}"`).join(' ')})`)
    }

    const params = compactParams({
      'api-key': this.apiKey,
      q: query.q,
      fq: filters.join(' AND '),
      begin_date: toNytDate(query.from),
      end_date: toNytDate(query.to),
      sort: query.q ? 'relevance' : 'newest',
      page: String(pageNumber(query) - 1),
    })

    const data = await fetchJson<NytSearchResponse>(
      `https://api.nytimes.com/svc/search/v2/articlesearch.json?${params.toString()}`,
    )

    return (data.response?.docs ?? []).map((doc) => ({
      id: `nyt:${doc._id}`,
      title: doc.headline?.main || 'Untitled',
      description: doc.abstract || doc.snippet || '',
      url: doc.web_url,
      imageUrl: nytImage(doc.multimedia),
      publishedAt: doc.pub_date || new Date().toISOString(),
      sourceId: this.id,
      sourceName: this.name,
      category: normalizeCategory(doc.section_name || doc.news_desk || query.category),
      author: cleanByline(doc.byline?.original),
    }))
  }

  private async searchRss(query: ArticleQuery): Promise<Article[]> {
    const feedKeys = uniqueFeedKeys(RSS_FEEDS, requestedCategories(query))
    const feeds = await Promise.all(
      feedKeys.map(async (category) => {
        const items = await loadRssItems(RSS_FEEDS[category] ?? RSS_FEEDS.general)
        return items.map((item) => ({ item, category }))
      }),
    )

    const filtered = feeds
      .flat()
      .filter(({ item }) => item.title && rssLink(item))
      .filter(({ item }) => matchesKeyword(item, query.q?.trim().toLowerCase()))
      .filter(({ item }) => inDateRange(item.pubDate, query.from, query.to))
      .sort((a, b) => Date.parse(b.item.pubDate ?? '') - Date.parse(a.item.pubDate ?? ''))

    return paginate(filtered, pageNumber(query)).map(({ item, category }) => {
      const url = rssLink(item) ?? ''
      return {
        id: `nyt:${url}`,
        title: item.title ?? 'Untitled',
        description: stripHtml(item.description ?? ''),
        url,
        imageUrl: rssImage(item),
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        sourceId: this.id,
        sourceName: this.name,
        category: normalizeCategory(category as ArticleCategory),
        author: cleanByline(rssAuthor(item) ?? undefined),
      }
    })
  }
}

function toNytDate(value?: string) {
  return value ? value.replaceAll('-', '') : undefined
}

function cleanByline(value?: string) {
  if (!value) return null
  return value.replace(/^By\s+/i, '').trim() || null
}

function nytImage(multimedia: NytMultimedia): string | null {
  if (!multimedia) return null

  if (Array.isArray(multimedia)) {
    const preferred =
      multimedia.find((item) => item.subtype === 'xlarge' || item.subtype === 'jumbo') ??
      multimedia.find((item) => item.subtype === 'thumbnail') ??
      multimedia[0]
    return absolutizeNytUrl(preferred?.url)
  }

  return absolutizeNytUrl(multimedia.default?.url || multimedia.thumbnail?.url)
}

function absolutizeNytUrl(url?: string) {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `https://www.nytimes.com/${url.replace(/^\//, '')}`
}
