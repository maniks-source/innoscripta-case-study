import { useQuery } from '@tanstack/react-query'
import { fetchSources } from '../api/news.ts'

export function useConfiguredSources() {
  return useQuery({
    queryKey: ['sources'],
    queryFn: fetchSources,
    staleTime: 60_000,
    select: (sources) => sources.filter((source) => source.configured).map((source) => source.id),
  })
}
