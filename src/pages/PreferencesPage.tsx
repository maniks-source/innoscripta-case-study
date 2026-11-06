import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ARTICLE_CATEGORIES,
  CATEGORY_LABELS,
  SOURCE_LABELS,
  type ArticleCategory,
  type NewsSourceId,
} from '../../shared/types.ts'
import { usePreferences } from '../context/PreferencesContext.tsx'
import { useConfiguredSources } from '../hooks/useSources.ts'
import { DEFAULT_PREFERENCES } from '../lib/preferences.ts'

export function PreferencesPage() {
  const { preferences, updatePreferences } = usePreferences()
  const { data: availableSources = [] } = useConfiguredSources()
  const [draft, setDraft] = useState(preferences)
  const [authorInput, setAuthorInput] = useState('')
  const [saved, setSaved] = useState(false)

  const toggleSource = (source: NewsSourceId) => {
    const sources = draft.sources.includes(source)
      ? draft.sources.filter((item) => item !== source)
      : [...draft.sources, source]
    setDraft({ ...draft, sources: sources.length ? sources : draft.sources })
    setSaved(false)
  }

  const toggleCategory = (category: ArticleCategory) => {
    const categories = draft.categories.includes(category)
      ? draft.categories.filter((item) => item !== category)
      : [...draft.categories, category]
    setDraft({ ...draft, categories })
    setSaved(false)
  }

  const addAuthor = (event: FormEvent) => {
    event.preventDefault()
    const name = authorInput.trim()
    if (!name || draft.authors.some((item) => item.toLowerCase() === name.toLowerCase())) {
      setAuthorInput('')
      return
    }
    setDraft({ ...draft, authors: [...draft.authors, name] })
    setAuthorInput('')
    setSaved(false)
  }

  const save = () => {
    updatePreferences(draft)
    setSaved(true)
  }

  return (
    <div className="grid max-w-3xl gap-8">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Your newsroom</p>
        <h1 className="mt-2 font-serif text-4xl leading-none">Preferences</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Choose the sources, topics, and authors that should appear in My Feed. Nothing is stored on a server.
        </p>
      </header>

      <section className="grid gap-3">
        <h2 className="font-serif text-2xl">Sources</h2>
        <div className="flex flex-wrap gap-2">
          {availableSources.map((source) => (
            <Chip
              key={source}
              label={SOURCE_LABELS[source]}
              selected={draft.sources.includes(source)}
              onClick={() => toggleSource(source)}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="font-serif text-2xl">Categories</h2>
        <p className="text-sm text-muted">Leave empty to include every topic.</p>
        <div className="flex flex-wrap gap-2">
          {ARTICLE_CATEGORIES.map((category) => (
            <Chip
              key={category}
              label={CATEGORY_LABELS[category]}
              selected={draft.categories.includes(category)}
              onClick={() => toggleCategory(category)}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="font-serif text-2xl">Authors</h2>
        <form className="flex flex-col gap-2 sm:flex-row" onSubmit={addAuthor}>
          <input
            value={authorInput}
            onChange={(event) => setAuthorInput(event.target.value)}
            placeholder="Add an author, then press Enter"
            className="h-11 flex-1 rounded-xl border border-rule bg-white px-3 outline-none ring-accent/30 focus:ring-2"
          />
          <button type="submit" className="h-11 rounded-xl bg-ink px-4 text-sm text-paper">
            Add author
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          {draft.authors.length ? (
            draft.authors.map((author) => (
              <button
                key={author}
                type="button"
                className="rounded-full border border-rule bg-white px-3 py-1.5 text-sm"
                onClick={() => {
                  setDraft({ ...draft, authors: draft.authors.filter((item) => item !== author) })
                  setSaved(false)
                }}
              >
                {author} ×
              </button>
            ))
          ) : (
            <p className="text-sm text-muted">No author filter yet.</p>
          )}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} className="h-11 rounded-full bg-accent px-5 text-sm text-white">
          Save preferences
        </button>
        <button
          type="button"
          onClick={() => {
            setDraft(DEFAULT_PREFERENCES)
            setSaved(false)
          }}
          className="h-11 rounded-full border border-rule px-5 text-sm"
        >
          Reset
        </button>
        <Link to="/feed" className="text-sm underline underline-offset-4">
          Open my feed
        </Link>
        {saved ? <span className="text-sm text-muted">Saved in this browser.</span> : null}
      </div>
    </div>
  )
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm ${
        selected ? 'border-ink bg-ink text-paper' : 'border-rule bg-white text-ink'
      }`}
    >
      {label}
    </button>
  )
}
