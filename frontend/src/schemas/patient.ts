import { z } from 'zod'

export const patientSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  blood_type: z.string().max(10).optional(),
  allergies: z.string().optional(),
  conditions: z.string().optional(),
  status: z.enum(['active', 'inactive', 'critical', 'discharged']),
  last_visit: z.string().optional(),
})

export type PatientFormValues = z.infer<typeof patientSchema>

export const noteSchema = z.object({
  content: z.string().min(1, 'Note content is required').max(10000),
  note_timestamp: z.string().optional(),
})

export type NoteFormValues = z.infer<typeof noteSchema>
