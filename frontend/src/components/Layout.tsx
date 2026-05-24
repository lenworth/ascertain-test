import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/patients', label: 'Patients', icon: '👥' },
  { to: '/patients/new', label: 'Add Patient', icon: '➕' },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 md:block">
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => {
          const active =
            location.pathname === '/'
              ? item.to === '/'
              : location.pathname === '/patients/new'
                ? item.to === '/patients/new'
                : location.pathname.startsWith('/patients') && item.to === '/patients'
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-700/20 dark:text-primary-100'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-900 md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-white">
          ⚕
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
            Healthcare Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Patient Management
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm dark:border-slate-600 dark:text-slate-200"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
    </header>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
