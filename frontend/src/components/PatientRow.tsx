import { memo } from 'react'
import { Link } from 'react-router-dom'
import { StatusBadge } from './ui'
import type { PatientListItem } from '../types/patient'

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString()
}

export const PatientRow = memo(function PatientRow({
  patient,
}: {
  patient: PatientListItem
}) {
  return (
    <Link
      to={`/patients/${patient.id}`}
      className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="font-medium text-slate-900 dark:text-white">
          {patient.first_name} {patient.last_name}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Age {patient.age}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-slate-600 dark:text-slate-300">
          Last visit: {formatDate(patient.last_visit)}
        </span>
        <StatusBadge status={patient.status} />
      </div>
    </Link>
  )
})
