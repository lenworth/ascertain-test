import type {
  ApiError,
  PaginatedPatients,
  Patient,
  PatientFormData,
  PatientListParams,
  PatientNote,
  PatientSummary,
} from '../types/patient'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })

  if (!response.ok) {
    let error: ApiError
    try {
      error = await response.json()
    } catch {
      error = { detail: response.statusText || 'Request failed' }
    }
    throw error
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.set(key, String(value))
    }
  })
  const query = search.toString()
  return query ? `?${query}` : ''
}

export const api = {
  health: () => request<{ status: string }>('/health'),

  listPatients: (params: PatientListParams = {}) =>
    request<PaginatedPatients>(
      `/patients${buildQuery({
        page: params.page,
        page_size: params.page_size,
        search: params.search,
        status: params.status,
        sort_by: params.sort_by,
        sort_order: params.sort_order,
      })}`,
    ),

  getPatient: (id: number) => request<Patient>(`/patients/${id}`),

  createPatient: (data: PatientFormData) =>
    request<Patient>('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePatient: (id: number, data: Partial<PatientFormData>) =>
    request<Patient>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deletePatient: (id: number) =>
    request<void>(`/patients/${id}`, { method: 'DELETE' }),

  listNotes: (patientId: number) =>
    request<PatientNote[]>(`/patients/${patientId}/notes`),

  createNote: (patientId: number, content: string, note_timestamp?: string) =>
    request<PatientNote>(`/patients/${patientId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content, note_timestamp }),
    }),

  deleteNote: (patientId: number, noteId: number) =>
    request<void>(`/patients/${patientId}/notes/${noteId}`, {
      method: 'DELETE',
    }),

  getSummary: (patientId: number) =>
    request<PatientSummary>(`/patients/${patientId}/summary`),
}

export function formatApiError(error: unknown): string {
  if (!error || typeof error !== 'object' || !('detail' in error)) {
    return 'An unexpected error occurred'
  }
  const detail = (error as ApiError).detail
  if (typeof detail === 'string') return detail
  return detail.map((e) => e.msg).join(', ')
}
