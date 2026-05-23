export type PatientStatus = 'active' | 'inactive' | 'critical' | 'discharged'

export interface Patient {
  id: number
  first_name: string
  last_name: string
  date_of_birth: string
  email: string | null
  phone: string | null
  address: string | null
  blood_type: string | null
  allergies: string | null
  conditions: string | null
  status: PatientStatus
  last_visit: string | null
  age: number
  created_at: string
  updated_at: string
}

export interface PatientListItem {
  id: number
  first_name: string
  last_name: string
  age: number
  last_visit: string | null
  status: PatientStatus
}

export interface PaginatedPatients {
  items: PatientListItem[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface PatientNote {
  id: number
  patient_id: number
  content: string
  note_timestamp: string
  created_at: string
}

export interface PatientSummary {
  patient_id: number
  name: string
  age: number
  blood_type: string | null
  conditions: string | null
  allergies: string | null
  status: PatientStatus
  narrative: string
  key_points: string[]
}

export interface PatientFormData {
  first_name: string
  last_name: string
  date_of_birth: string
  email?: string
  phone?: string
  address?: string
  blood_type?: string
  allergies?: string
  conditions?: string
  status: PatientStatus
  last_visit?: string
}

export interface ApiError {
  detail: string | Array<{ loc: string[]; msg: string; type: string }>
}

export interface PatientListParams {
  page?: number
  page_size?: number
  search?: string
  status?: PatientStatus
  sort_by?: 'name' | 'age' | 'last_visit' | 'status'
  sort_order?: 'asc' | 'desc'
}
