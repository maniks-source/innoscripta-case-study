import { useCallback, useMemo } from 'react'
import type { InfiniteData } from '@tanstack/react-query'
import type { ArticlesResponse } from '../../../shared/types.ts'
import { SOURCE_LABELS } from '../../../shared/types.ts'
import { useOnVisible } from '../../hooks/useOnVisible.ts'
import { ArticleGrid } from '../article/ArticleGrid.tsx'
import { ArticleSkeleton, StatusPanel } from '../common/StatusPanel.tsx'

type ArticleResultsProps = {
  data?: InfiniteData<ArticlesResponse>
  isPending: boolean
  isError: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
  emptyTitle: string
  emptyDescription: string
}

export function ArticleResults({
  data,
  isPending,
  isError,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  emptyTitle,
  emptyDescription,
}: ArticleResultsProps) {
  const articles = useMemo(() => {
    const seen = new Set<string>()
    return (data?.pages ?? []).flatMap((page) => page.articles).filter((article) => {
      if (seen.has(article.id)) return false
      seen.add(article.id)
      return true
    })
  }, [data])

  const errors = data?.pages[0]?.errors ?? []
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])
  const sentinelRef = useOnVisible(loadMore, Boolean(hasNextPage && !isFetchingNextPage))

  if (isPending) return <ArticleSkeleton />
  if (isError) {
    return (
      <StatusPanel
        title="The newsroom is unreachable"
        description="One or more upstream APIs failed. Check your connection and API keys, then try again."
      />
    )
  }
  if (!articles.length) {
    return <StatusPanel title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="grid gap-4">
      {errors.length ? (
        <p className="rounded-xl border border-accent/20 bg-white px-4 py-3 text-sm text-accent">
          Some sources were skipped:{' '}
          {errors.map((error) => `${SOURCE_LABELS[error.sourceId]} (${error.message})`).join(' · ')}
        </p>
      ) : null}
      <p className="text-sm text-muted">{articles.length} articles</p>
      <ArticleGrid articles={articles} featured />
      <div ref={sentinelRef} className="h-10" />
      {isFetchingNextPage ? (
        <p className="py-2 text-center text-sm text-muted">Loading more stories…</p>
      ) : null}
      {!hasNextPage ? (
        <p className="py-2 text-center text-sm text-muted">You’re caught up for now.</p>
      ) : null}
    </div>
  )
}
