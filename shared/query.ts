import type { ArticleCategory, ArticleQuery } from './types.ts'

export const PAGE_SIZE = 10

export function requestedCategories(query: ArticleQuery): ArticleCategory[] {
  if (query.categories?.length) return query.categories
  if (query.category) return [query.category]
  return []
}

export function pageNumber(query: ArticleQuery) {
  return Math.max(1, query.page ?? 1)
}

export function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}
