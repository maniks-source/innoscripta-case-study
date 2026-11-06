import type { Article } from '../../../shared/types.ts'
import { ArticleCard } from './ArticleCard.tsx'

type ArticleGridProps = {
  articles: Article[]
  featured?: boolean
}

export function ArticleGrid({ articles, featured = false }: ArticleGridProps) {
  const [first, ...rest] = articles

  if (!first) return null

  return (
    <div className="grid gap-5">
      {featured ? <ArticleCard article={first} featured /> : null}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {(featured ? rest : articles).map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}
