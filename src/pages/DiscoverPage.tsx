import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ARTICLE_CATEGORIES,
  NEWS_SOURCE_IDS,
  SOURCE_LABELS,
  type ArticleCategory,
  type NewsSourceId,
} from '../../shared/types.ts'
import { SearchFilters, type FilterState } from '../components/filters/SearchFilters.tsx'
import { ArticleResults } from '../components/results/ArticleResults.tsx'
import { useArticles } from '../hooks/useArticles.ts'
import { useDebouncedValue } from '../hooks/useDebouncedValue.ts'
import { useConfiguredSources } from '../hooks/useSources.ts'

export function DiscoverPage() {
  const [params, setParams] = useSearchParams()
  const filters = parseFilters(params)
  const debouncedQuery = useDebouncedValue(filters.q)

  const request = useMemo(
    () => ({
      q: debouncedQuery || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
      category: filters.category || undefined,
      sources: filters.sources.length ? filters.sources : undefined,
    }),
    [debouncedQuery, filters.category, filters.from, filters.sources, filters.to],
  )

  const result = useArticles(request)
  const { data: availableSources = [] } = useConfiguredSources()
  const sourceNames = availableSources.map((source) => SOURCE_LABELS[source]).join(', ')

  return (
    <div className="grid gap-6">
      <header className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">News aggregator</p>
        <h1 className="mt-2 font-serif text-4xl leading-none sm:text-5xl">Today’s briefing</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
          Search and filter stories from {sourceNames || 'your configured newsrooms'} in one place.
        </p>
      </header>
      <SearchFilters
        value={filters}
        availableSources={availableSources}
        onChange={(next) => setParams(toSearchParams(next), { replace: true })}
      />
      <ArticleResults
        data={result.data}
        isPending={result.isPending}
        isError={result.isError}
        isFetchingNextPage={result.isFetchingNextPage}
        hasNextPage={Boolean(result.hasNextPage)}
        fetchNextPage={result.fetchNextPage}
        emptyTitle="No matching stories"
        emptyDescription="Try a broader keyword, another category, or a wider date range."
      />
    </div>
  )
}

function parseFilters(params: URLSearchParams): FilterState {
  const category = params.get('category')
  const sources = (params.get('sources') ?? '')
    .split(',')
    .filter((value): value is NewsSourceId => NEWS_SOURCE_IDS.includes(value as NewsSourceId))

  return {
    q: params.get('q') ?? '',
    from: params.get('from') ?? '',
    to: params.get('to') ?? '',
    category: ARTICLE_CATEGORIES.includes(category as ArticleCategory)
      ? (category as ArticleCategory)
      : '',
    sources: sources.length ? sources : [...NEWS_SOURCE_IDS],
  }
}

function toSearchParams(filters: FilterState) {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  if (filters.category) params.set('category', filters.category)
  if (filters.sources.length && filters.sources.length !== NEWS_SOURCE_IDS.length) {
    params.set('sources', filters.sources.join(','))
  }
  return params
}
