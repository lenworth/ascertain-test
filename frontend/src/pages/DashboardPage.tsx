import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { Card, LoadingSpinner, StatusBadge } from '../components/ui'

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['patients', 'dashboard'],
    queryFn: () => api.listPatients({ page: 1, page_size: 5, sort_by: 'last_visit', sort_order: 'desc' }),
  })

  const statusCounts = useQuery({
    queryKey: ['patients', 'stats'],
    queryFn: () => api.getStats(),
    staleTime: 60_000,
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Overview of your medical practice
        </p>
      </div>

      {statusCounts.data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Active', value: statusCounts.data.active, color: 'text-emerald-600' },
            { label: 'Critical', value: statusCounts.data.critical, color: 'text-red-600' },
            { label: 'Inactive', value: statusCounts.data.inactive, color: 'text-slate-600' },
            { label: 'Discharged', value: statusCounts.data.discharged, color: 'text-amber-600' },
          ].map((stat) => (
            <Card key={stat.label}>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Patients
          </h3>
          <Link to="/patients" className="text-sm text-primary-600 hover:underline">
            View all
          </Link>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {data?.items.map((patient) => (
              <li key={patient.id} className="flex items-center justify-between py-3">
                <Link
                  to={`/patients/${patient.id}`}
                  className="font-medium text-slate-900 hover:text-primary-600 dark:text-white"
                >
                  {patient.first_name} {patient.last_name}
                </Link>
                <StatusBadge status={patient.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
