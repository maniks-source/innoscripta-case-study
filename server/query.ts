import {
  ARTICLE_CATEGORIES,
  NEWS_SOURCE_IDS,
  type ArticleCategory,
  type ArticleQuery,
  type NewsSourceId,
} from '../shared/types.ts'

export function parseArticleQuery(search: URLSearchParams): ArticleQuery {
  const category = search.get('category')
  const sources = split(search.get('sources')).filter(isSourceId)
  const authors = split(search.get('authors'))
  const categories = split(search.get('categories')).filter(isCategory)

  const page = Number(search.get('page') || '1')

  return {
    q: search.get('q')?.trim() || undefined,
    from: search.get('from') || undefined,
    to: search.get('to') || undefined,
    category: isCategory(category) ? category : undefined,
    categories: categories.length ? categories : undefined,
    sources: sources.length ? sources : undefined,
    authors: authors.length ? authors : undefined,
    page: Number.isFinite(page) ? page : 1,
  }
}

function split(value: string | null) {
  return (value ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

function isSourceId(value: string): value is NewsSourceId {
  return (NEWS_SOURCE_IDS as readonly string[]).includes(value)
}

function isCategory(value: string | null): value is ArticleCategory {
  return Boolean(value && (ARTICLE_CATEGORIES as readonly string[]).includes(value))
}
