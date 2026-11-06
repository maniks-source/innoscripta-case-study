import { normalizeCategory } from '../../shared/categories.ts'
import { PAGE_SIZE, pageNumber, paginate, requestedCategories } from '../../shared/query.ts'
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
  world: 'world',
  business: 'business',
  technology: 'technology',
  science: 'science',
  sports: 'sport',
  health: 'society',
  entertainment: 'culture',
  politics: 'politics',
  culture: 'culture',
}

const RSS_FEEDS: Record<string, string> = {
  general: 'https://www.theguardian.com/international/rss',
  world: 'https://www.theguardian.com/world/rss',
  business: 'https://www.theguardian.com/uk/business/rss',
  technology: 'https://www.theguardian.com/uk/technology/rss',
  science: 'https://www.theguardian.com/science/rss',
  sports: 'https://www.theguardian.com/uk/sport/rss',
  health: 'https://www.theguardian.com/society/rss',
  entertainment: 'https://www.theguardian.com/uk/culture/rss',
  politics: 'https://www.theguardian.com/politics/rss',
  culture: 'https://www.theguardian.com/uk/culture/rss',
}

type GuardianSearchResponse = {
  response?: {
    results?: Array<{
      id: string
      webTitle: string
      webUrl: string
      webPublicationDate: string
      sectionName?: string
      fields?: {
        trailText?: string
        thumbnail?: string
        byline?: string
        headline?: string
      }
    }>
  }
}

export class GuardianSource implements NewsSource {
  readonly id = 'guardian' as const
  readonly name = 'The Guardian'
  private apiKey: string | undefined

  constructor(apiKey: string | undefined) {
    this.apiKey = apiKey && apiKey !== 'test' ? apiKey : undefined
  }

  isConfigured() {
    return true
  }

  async search(query: ArticleQuery): Promise<Article[]> {
    if (this.apiKey) return this.searchApi(query)
    return this.searchRss(query)
  }

  private async searchApi(query: ArticleQuery): Promise<Article[]> {
    const params = compactParams({
      'api-key': this.apiKey,
      q: query.q,
      section:
        requestedCategories(query)
          .map((category) => SECTION_MAP[category])
          .filter(Boolean)
          .join('|') || undefined,
      'from-date': query.from,
      'to-date': query.to,
      'order-by': query.q ? 'relevance' : 'newest',
      page: String(pageNumber(query)),
      'page-size': String(PAGE_SIZE),
      'show-fields': 'thumbnail,trailText,byline,headline',
      type: 'article',
    })

    const data = await fetchJson<GuardianSearchResponse>(
      `https://content.guardianapis.com/search?${params.toString()}`,
    )

    return (data.response?.results ?? []).map((item) => ({
      id: `guardian:${item.id}`,
      title: item.fields?.headline || item.webTitle,
      description: stripHtml(item.fields?.trailText ?? ''),
      url: item.webUrl,
      imageUrl: item.fields?.thumbnail ?? null,
      publishedAt: item.webPublicationDate,
      sourceId: this.id,
      sourceName: this.name,
      category: normalizeCategory(item.sectionName ?? query.category),
      author: item.fields?.byline ?? null,
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
        id: `guardian:${url}`,
        title: item.title ?? 'Untitled',
        description: stripHtml(item.description ?? ''),
        url,
        imageUrl: rssImage(item),
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        sourceId: this.id,
        sourceName: this.name,
        category: normalizeCategory(category as ArticleCategory),
        author: rssAuthor(item),
      }
    })
  }
}
