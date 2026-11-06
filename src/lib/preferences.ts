import {
  ARTICLE_CATEGORIES,
  NEWS_SOURCE_IDS,
  type ArticleCategory,
  type NewsSourceId,
} from '../../shared/types.ts'

export type UserPreferences = {
  sources: NewsSourceId[]
  categories: ArticleCategory[]
  authors: string[]
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  sources: [...NEWS_SOURCE_IDS],
  categories: [],
  authors: [],
}

const STORAGE_KEY = 'briefing.preferences'

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PREFERENCES
    const parsed = JSON.parse(raw) as Partial<UserPreferences>
    return {
      sources: sanitizeList(parsed.sources, NEWS_SOURCE_IDS, DEFAULT_PREFERENCES.sources),
      categories: sanitizeList(parsed.categories, ARTICLE_CATEGORIES, []),
      authors: Array.isArray(parsed.authors)
        ? parsed.authors.map((name) => String(name).trim()).filter(Boolean)
        : [],
    }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export function savePreferences(preferences: UserPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
}

export function hasCustomFeed(preferences: UserPreferences) {
  return (
    preferences.sources.length !== NEWS_SOURCE_IDS.length ||
    preferences.categories.length > 0 ||
    preferences.authors.length > 0
  )
}

function sanitizeList<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T[],
): T[] {
  if (!Array.isArray(value)) return fallback
  const next = value.filter((item): item is T => allowed.includes(item as T))
  return next.length ? next : fallback
}
