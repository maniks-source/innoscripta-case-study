import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  hasCustomFeed,
  loadPreferences,
  savePreferences,
  type UserPreferences,
} from '../lib/preferences.ts'

type PreferencesContextValue = {
  preferences: UserPreferences
  updatePreferences: (next: UserPreferences) => void
  customized: boolean
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences)

  const updatePreferences = useCallback((next: UserPreferences) => {
    setPreferences(next)
    savePreferences(next)
  }, [])

  const value = useMemo(
    () => ({
      preferences,
      updatePreferences,
      customized: hasCustomFeed(preferences),
    }),
    [preferences, updatePreferences],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider')
  }
  return context
}
