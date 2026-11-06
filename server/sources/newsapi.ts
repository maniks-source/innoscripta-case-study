import { normalizeCategory } from '../../shared/categories.ts'
import { PAGE_SIZE, pageNumber, requestedCategories } from '../../shared/query.ts'
import type { Article, ArticleQuery } from '../../shared/types.ts'
import { compactParams, fetchJson } from '../http.ts'
import type { NewsSource } from './NewsSource.ts'

const TOP_HEADLINE_CATEGORIES = new Set([
  'business',
  'entertainment',
  'general',
  'health',
  'science',
  'sports',
  'technology',
])

type NewsApiResponse = {
  status?: string
  message?: string
  articles?: Array<{
    title?: string
    description?: string
    url?: string
    urlToImage?: string
    publishedAt?: string
    author?: string
    source?: { id?: string | null; name?: string }
  }>
}

export class NewsApiSource implements NewsSource {
  readonly id = 'newsapi' as const
  readonly name = 'NewsAPI'
  private apiKey: string | undefined

  constructor(apiKey: string | undefined) {
    this.apiKey = apiKey
  }

  isConfigured() {
    return Boolean(this.apiKey)
  }

  async search(query: ArticleQuery): Promise<Article[]> {
    if (!this.apiKey) return []

    const categories = requestedCategories(query)
    const useEverything = Boolean(query.q || query.from || query.to || categories.length > 1)
    const url = useEverything
      ? this.everythingUrl(query)
      : this.headlinesUrl(query)

    const data = await fetchJson<NewsApiResponse>(url)
    if (data.status === 'error') {
      throw new Error(data.message || 'NewsAPI request failed')
    }

    return (data.articles ?? [])
      .filter((item) => item.title && item.url && item.title !== '[Removed]')
      .map((item) => ({
        id: `newsapi:${item.url}`,
        title: item.title ?? 'Untitled',
        description: item.description ?? '',
        url: item.url ?? '',
        imageUrl: item.urlToImage ?? null,
        publishedAt: item.publishedAt || new Date().toISOString(),
        sourceId: this.id,
        sourceName: item.source?.name || this.name,
        category: normalizeCategory(query.category ?? categories[0] ?? item.source?.name),
        author: item.author ?? null,
      }))
  }

  private headlinesUrl(query: ArticleQuery) {
    const category = requestedCategories(query).find((item) => TOP_HEADLINE_CATEGORIES.has(item)) ?? 'general'

    const params = compactParams({
      apiKey: this.apiKey,
      country: 'us',
      category,
      pageSize: String(PAGE_SIZE),
      page: String(pageNumber(query)),
    })

    return `https://newsapi.org/v2/top-headlines?${params.toString()}`
  }

  private everythingUrl(query: ArticleQuery) {
    const params = compactParams({
      apiKey: this.apiKey,
      q: query.q || requestedCategories(query).join(' OR ') || 'news',
      from: query.from,
      to: query.to,
      language: 'en',
      sortBy: query.q ? 'relevancy' : 'publishedAt',
      pageSize: String(PAGE_SIZE),
      page: String(pageNumber(query)),
    })

    return `https://newsapi.org/v2/everything?${params.toString()}`
  }
}
