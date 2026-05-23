import { useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useQuery } from '@tanstack/react-query'
import { api, formatApiError } from '../api/client'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { PatientRow } from './PatientRow'
import { ErrorAlert, LoadingSpinner } from './ui'
import type { PatientStatus } from '../types/patient'

type SortField = 'name' | 'age' | 'last_visit' | 'status'
type SortOrder = 'asc' | 'desc'

export function PatientList() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<PatientStatus | ''>('')
  const [sortBy, setSortBy] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const debouncedSearch = useDebouncedValue(search, 300)
  const parentRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['patients', page, debouncedSearch, statusFilter, sortBy, sortOrder],
    queryFn: () =>
      api.listPatients({
        page,
        page_size: 20,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
    placeholderData: (prev) => prev,
  })

  const virtualizer = useVirtualizer({
    count: data?.items.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 88,
    overscan: 5,
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Patients
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {data ? `${data.total} total patients` : 'Loading...'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="search"
            placeholder="Search patients..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as PatientStatus | '')
              setPage(1)
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="critical">Critical</option>
            <option value="discharged">Discharged</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortField)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          >
            <option value="name">Sort by name</option>
            <option value="age">Sort by age</option>
            <option value="last_visit">Sort by last visit</option>
            <option value="status">Sort by status</option>
          </select>
          <button
            type="button"
            onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          >
            {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>
      </div>

      {isLoading && <LoadingSpinner />}
      {isError && <ErrorAlert message={formatApiError(error)} />}

      {data && (
        <>
          <div
            ref={parentRef}
            className="h-[600px] overflow-auto rounded-xl border border-slate-200 dark:border-slate-700"
          >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const patient = data.items[virtualRow.index]
                return (
                  <div
                    key={patient.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="px-2 py-1"
                  >
                    <PatientRow patient={patient} />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Page {data.page} of {data.total_pages}
              {isFetching && ' · Updating...'}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50 dark:border-slate-600"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= data.total_pages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50 dark:border-slate-600"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
