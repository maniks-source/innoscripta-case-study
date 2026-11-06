import {
  ARTICLE_CATEGORIES,
  CATEGORY_LABELS,
  NEWS_SOURCE_IDS,
  SOURCE_LABELS,
  type ArticleCategory,
  type NewsSourceId,
} from '../../../shared/types.ts'
import { todayIsoDate } from '../../lib/format.ts'

export type FilterState = {
  q: string
  from: string
  to: string
  category: ArticleCategory | ''
  sources: NewsSourceId[]
}

export const DEFAULT_FILTERS: FilterState = {
  q: '',
  from: '',
  to: '',
  category: '',
  sources: [...NEWS_SOURCE_IDS],
}

export function hasActiveFilters(value: FilterState, availableSources: NewsSourceId[] = [...NEWS_SOURCE_IDS]) {
  const selected = value.sources.filter((source) => availableSources.includes(source))
  return Boolean(
    value.q.trim() ||
      value.from ||
      value.to ||
      value.category ||
      selected.length !== availableSources.length,
  )
}

type SearchFiltersProps = {
  value: FilterState
  onChange: (next: FilterState) => void
  availableSources?: NewsSourceId[]
}

export function SearchFilters({ value, onChange, availableSources = [...NEWS_SOURCE_IDS] }: SearchFiltersProps) {
  const toggleSource = (source: NewsSourceId) => {
    const selected = value.sources.includes(source)
      ? value.sources.filter((item) => item !== source)
      : [...value.sources, source]
    onChange({ ...value, sources: selected.length ? selected : value.sources })
  }

  const canClear = hasActiveFilters(value, availableSources)

  return (
    <form className="grid gap-4 rounded-2xl border border-rule bg-white p-4 sm:p-5" onSubmit={(event) => event.preventDefault()}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="grid flex-1 gap-2">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">Search</span>
          <input
            type="search"
            value={value.q}
            onChange={(event) => onChange({ ...value, q: event.target.value })}
            placeholder="Climate, elections, markets..."
            className="h-11 rounded-xl border border-rule bg-paper px-3 text-base outline-none ring-accent/30 focus:ring-2"
          />
        </label>
        <button
          type="button"
          disabled={!canClear}
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="h-11 shrink-0 rounded-xl border border-rule px-4 text-sm text-ink enabled:hover:bg-chip disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear filters
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">From</span>
          <input
            type="date"
            max={value.to || todayIsoDate()}
            value={value.from}
            onChange={(event) => onChange({ ...value, from: event.target.value })}
            className="h-11 rounded-xl border border-rule bg-paper px-3 outline-none ring-accent/30 focus:ring-2"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">To</span>
          <input
            type="date"
            min={value.from}
            max={todayIsoDate()}
            value={value.to}
            onChange={(event) => onChange({ ...value, to: event.target.value })}
            className="h-11 rounded-xl border border-rule bg-paper px-3 outline-none ring-accent/30 focus:ring-2"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">Category</span>
          <select
            value={value.category}
            onChange={(event) =>
              onChange({ ...value, category: event.target.value as FilterState['category'] })
            }
            className="h-11 rounded-xl border border-rule bg-paper px-3 outline-none ring-accent/30 focus:ring-2"
          >
            <option value="">All categories</option>
            {ARTICLE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset>
        <legend className="mb-2 text-xs uppercase tracking-[0.16em] text-muted">Sources</legend>
        <div className="flex flex-wrap gap-2">
          {availableSources.map((source) => {
            const checked = value.sources.includes(source)
            return (
              <label
                key={source}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${
                  checked ? 'border-ink bg-ink text-paper' : 'border-rule bg-paper text-ink'
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => toggleSource(source)}
                />
                {SOURCE_LABELS[source]}
              </label>
            )
          })}
        </div>
      </fieldset>
    </form>
  )
}
