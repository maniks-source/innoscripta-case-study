import { useInfiniteQuery } from '@tanstack/react-query'
import type { ArticleQuery } from '../../shared/types.ts'
import { fetchArticles } from '../api/news.ts'

export function useArticles(query: Omit<ArticleQuery, 'page'>, enabled = true) {
  return useInfiniteQuery({
    queryKey: ['article-pages', query],
    queryFn: ({ pageParam }) => fetchArticles({ ...query, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.hasMore || !lastPage.articles?.length) return undefined
      return (lastPage.page ?? 1) + 1
    },
    enabled,
    staleTime: 60_000,
  })
}
