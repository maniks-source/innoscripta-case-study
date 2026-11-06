export const NEWS_SOURCE_IDS = ['guardian', 'nyt', 'newsapi', 'bbc'] as const
export type NewsSourceId = (typeof NEWS_SOURCE_IDS)[number]

export const ARTICLE_CATEGORIES = [
  'world',
  'business',
  'technology',
  'science',
  'sports',
  'health',
  'entertainment',
  'politics',
  'culture',
  'general',
] as const
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number]

export type Article = {
  id: string
  title: string
  description: string
  url: string
  imageUrl: string | null
  publishedAt: string
  sourceId: NewsSourceId
  sourceName: string
  category: ArticleCategory
  author: string | null
}

export type ArticleQuery = {
  q?: string
  from?: string
  to?: string
  category?: ArticleCategory
  categories?: ArticleCategory[]
  sources?: NewsSourceId[]
  authors?: string[]
  page?: number
}

export type SourceStatus = {
  id: NewsSourceId
  name: string
  configured: boolean
}

export type ArticlesResponse = {
  articles: Article[]
  errors: Array<{ sourceId: NewsSourceId; message: string }>
  sources: SourceStatus[]
  page: number
  hasMore: boolean
}

export const SOURCE_LABELS: Record<NewsSourceId, string> = {
  guardian: 'The Guardian',
  nyt: 'New York Times',
  newsapi: 'NewsAPI',
  bbc: 'BBC News',
}

export const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  world: 'World',
  business: 'Business',
  technology: 'Technology',
  science: 'Science',
  sports: 'Sports',
  health: 'Health',
  entertainment: 'Entertainment',
  politics: 'Politics',
  culture: 'Culture',
  general: 'General',
}
