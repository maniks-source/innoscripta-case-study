import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell.tsx'
import { PreferencesProvider } from './context/PreferencesContext.tsx'
import { DiscoverPage } from './pages/DiscoverPage.tsx'
import { FeedPage } from './pages/FeedPage.tsx'
import { PreferencesPage } from './pages/PreferencesPage.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<DiscoverPage />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/preferences" element={<PreferencesPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PreferencesProvider>
    </QueryClientProvider>
  )
}
