import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Discover' },
  { to: '/feed', label: 'My Feed' },
  { to: '/preferences', label: 'Preferences' },
]

export function AppShell() {
  return (
    <div className="min-h-dvh">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="border-b border-rule bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <NavLink to="/" className="font-serif text-2xl tracking-tight text-ink">
            Briefing
          </NavLink>
          <nav aria-label="Primary" className="flex items-center gap-1 text-sm">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 transition ${
                    isActive ? 'bg-ink text-paper' : 'text-muted hover:bg-chip hover:text-ink'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}
