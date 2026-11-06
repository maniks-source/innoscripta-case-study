import type { Article, ArticleQuery, NewsSourceId } from '../../shared/types.ts'

export interface NewsSource {
  readonly id: NewsSourceId
  readonly name: string
  isConfigured(): boolean
  search(query: ArticleQuery): Promise<Article[]>
}
