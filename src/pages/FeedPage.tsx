import { Link } from 'react-router-dom'
import { CATEGORY_LABELS, SOURCE_LABELS } from '../../shared/types.ts'
import { ArticleResults } from '../components/results/ArticleResults.tsx'
import { usePreferences } from '../context/PreferencesContext.tsx'
import { useArticles } from '../hooks/useArticles.ts'

export function FeedPage() {
  const { preferences, customized } = usePreferences()
  const result = useArticles({
    sources: preferences.sources,
    categories: preferences.categories.length ? preferences.categories : undefined,
    authors: preferences.authors.length ? preferences.authors : undefined,
  })

  return (
    <div className="grid gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Personalized</p>
          <h1 className="mt-2 font-serif text-4xl leading-none">My feed</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            Built from the sources, categories, and authors you chose. Preferences stay in this browser.
          </p>
        </div>
        <Link to="/preferences" className="text-sm text-ink underline underline-offset-4">
          Edit preferences
        </Link>
      </header>

      <p className="text-sm text-muted">
        {customized
          ? summarizePreferences(preferences.sources, preferences.categories, preferences.authors)
          : 'You are seeing the default mix. Pick favorites to make this feed yours.'}
      </p>

      <ArticleResults
        data={result.data}
        isPending={result.isPending}
        isError={result.isError}
        isFetchingNextPage={result.isFetchingNextPage}
        hasNextPage={Boolean(result.hasNextPage)}
        fetchNextPage={result.fetchNextPage}
        emptyTitle="Your feed is empty"
        emptyDescription="Widen your preferred sources or categories, or add an author you follow."
      />
    </div>
  )
}

function summarizePreferences(
  sources: Array<keyof typeof SOURCE_LABELS>,
  categories: Array<keyof typeof CATEGORY_LABELS>,
  authors: string[],
) {
  const parts = [
    sources.map((source) => SOURCE_LABELS[source]).join(', '),
    categories.length ? categories.map((category) => CATEGORY_LABELS[category]).join(', ') : 'all categories',
    authors.length ? `authors: ${authors.join(', ')}` : null,
  ].filter(Boolean)
  return `Showing ${parts.join(' · ')}`
}
