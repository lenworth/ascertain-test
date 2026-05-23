import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-4xl font-bold text-slate-900 dark:text-white">404</h2>
      <p className="mt-2 text-slate-500">Page not found</p>
      <Link
        to="/"
        className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700"
      >
        Go home
      </Link>
    </div>
  )
}
