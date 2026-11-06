import { useState } from 'react'
import type { Article } from '../../../shared/types.ts'
import { CATEGORY_LABELS } from '../../../shared/types.ts'
import { formatPublishedAt } from '../../lib/format.ts'

type ArticleCardProps = {
  article: Article
  featured?: boolean
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(article.imageUrl) && !imageFailed

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-rule bg-white shadow-[0_1px_0_rgba(28,25,23,0.04)] ${
        featured ? 'md:grid md:grid-cols-2 md:gap-0' : ''
      }`}
    >
      <div className={`relative bg-chip ${featured ? 'min-h-56 md:min-h-full' : 'h-44'}`}>
        {showImage ? (
          <img
            src={article.imageUrl ?? ''}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full min-h-44 items-end p-4 text-sm text-muted">
            {article.sourceName}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted">
          <span className="rounded-full bg-chip px-2 py-1 text-ink">{article.sourceName}</span>
          <span>{CATEGORY_LABELS[article.category]}</span>
          <span>{formatPublishedAt(article.publishedAt)}</span>
        </div>
        <h3 className={`font-serif leading-snug text-ink ${featured ? 'text-3xl' : 'text-xl'}`}>
          <a href={article.url} target="_blank" rel="noreferrer" className="hover:underline">
            {article.title}
          </a>
        </h3>
        {article.description ? (
          <p className={`text-sm leading-6 text-muted ${featured ? 'line-clamp-4' : 'line-clamp-3'}`}>
            {article.description}
          </p>
        ) : null}
        <p className="mt-auto pt-2 text-sm text-ink/70">
          {article.author ? article.author : 'Unknown author'}
        </p>
      </div>
    </article>
  )
}
