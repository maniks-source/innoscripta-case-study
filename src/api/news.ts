import type { ArticleQuery, ArticlesResponse, SourceStatus } from '../../shared/types.ts'

export async function fetchArticles(query: ArticleQuery): Promise<ArticlesResponse> {
  const params = new URLSearchParams()
  if (query.q) params.set('q', query.q)
  if (query.from) params.set('from', query.from)
  if (query.to) params.set('to', query.to)
  if (query.category) params.set('category', query.category)
  if (query.categories?.length) params.set('categories', query.categories.join(','))
  if (query.sources?.length) params.set('sources', query.sources.join(','))
  if (query.authors?.length) params.set('authors', query.authors.join(','))
  if (query.page && query.page > 1) params.set('page', String(query.page))

  const response = await fetch(`/api/articles?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Could not load articles. Please try again.')
  }
  return (await response.json()) as ArticlesResponse
}

export async function fetchSources(): Promise<SourceStatus[]> {
  const response = await fetch('/api/sources')
  if (!response.ok) throw new Error('Could not load sources')
  const data = (await response.json()) as { sources: SourceStatus[] }
  return data.sources
}
