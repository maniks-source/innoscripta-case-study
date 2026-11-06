import { matchesAuthorFilter } from '../shared/categories.ts'
import { PAGE_SIZE, pageNumber } from '../shared/query.ts'
import type { Article, ArticleQuery, ArticlesResponse } from '../shared/types.ts'
import type { NewsSource } from './sources/NewsSource.ts'

export class NewsAggregator {
  private sources: NewsSource[]

  constructor(sources: NewsSource[]) {
    this.sources = sources
  }

  status() {
    return this.sources.map((source) => ({
      id: source.id,
      name: source.name,
      configured: source.isConfigured(),
    }))
  }

  async search(query: ArticleQuery): Promise<ArticlesResponse> {
    const selected = this.sources.filter((source) => {
      if (!source.isConfigured()) return false
      if (query.sources?.length) return query.sources.includes(source.id)
      return true
    })

    const settled = await Promise.allSettled(
      selected.map(async (source) => {
        if (!source.isConfigured()) {
          throw new Error(`${source.name} is not configured`)
        }
        return source.search(query)
      }),
    )

    const articles: Article[] = []
    const errors: ArticlesResponse['errors'] = []

    settled.forEach((result, index) => {
      const source = selected[index]
      if (!source) return
      if (result.status === 'fulfilled') {
        articles.push(...result.value)
        return
      }
      const message =
        result.reason instanceof Error ? result.reason.message : 'Unknown source error'
      errors.push({ sourceId: source.id, message })
    })

    const page = pageNumber(query)
    const merged = finalizeArticles(articles, query)

    return {
      articles: merged,
      errors,
      sources: this.status(),
      page,
      hasMore: settled.some(
        (result) => result.status === 'fulfilled' && result.value.length >= PAGE_SIZE,
      ),
    }
  }
}

function finalizeArticles(articles: Article[], query: ArticleQuery) {
  const seen = new Set<string>()

  return articles
    .filter((article) => matchesAuthorFilter(article.author, query.authors))
    .filter((article) => {
      const key = article.url.replace(/\/$/, '').toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
}
