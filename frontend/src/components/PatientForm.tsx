import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { patientSchema, type PatientFormValues } from '../schemas/patient'
import type { Patient } from '../types/patient'

interface PatientFormProps {
  defaultValues?: Partial<Patient>
  onSubmit: (data: PatientFormValues) => Promise<void>
  submitLabel?: string
  serverError?: string | null
}

const emptyDefaults: PatientFormValues = {
  first_name: '',
  last_name: '',
  date_of_birth: '',
  email: '',
  phone: '',
  address: '',
  blood_type: '',
  allergies: '',
  conditions: '',
  status: 'active',
  last_visit: '',
}

function patientToFormValues(patient: Partial<Patient>): PatientFormValues {
  return {
    first_name: patient.first_name ?? '',
    last_name: patient.last_name ?? '',
    date_of_birth: patient.date_of_birth ?? '',
    email: patient.email ?? '',
    phone: patient.phone ?? '',
    address: patient.address ?? '',
    blood_type: patient.blood_type ?? '',
    allergies: patient.allergies ?? '',
    conditions: patient.conditions ?? '',
    status: patient.status ?? 'active',
    last_visit: patient.last_visit ?? '',
  }
}

export function PatientForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save Patient',
  serverError,
}: PatientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: defaultValues
      ? patientToFormValues(defaultValues)
      : emptyDefaults,
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      noValidate
    >
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {serverError}
        </div>
      )}

      <section>
        <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
          Personal Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" error={errors.first_name?.message}>
            <input {...register('first_name')} className={inputClass} />
          </Field>
          <Field label="Last name" error={errors.last_name?.message}>
            <input {...register('last_name')} className={inputClass} />
          </Field>
          <Field label="Date of birth" error={errors.date_of_birth?.message}>
            <input type="date" {...register('date_of_birth')} className={inputClass} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <input type="email" {...register('email')} className={inputClass} />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <input {...register('phone')} className={inputClass} />
          </Field>
          <Field label="Address" error={errors.address?.message}>
            <input {...register('address')} className={inputClass} />
          </Field>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
          Medical Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Blood type" error={errors.blood_type?.message}>
            <input {...register('blood_type')} className={inputClass} placeholder="e.g. O+" />
          </Field>
          <Field label="Status" error={errors.status?.message}>
            <select {...register('status')} className={inputClass}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="critical">Critical</option>
              <option value="discharged">Discharged</option>
            </select>
          </Field>
          <Field label="Allergies" error={errors.allergies?.message}>
            <textarea {...register('allergies')} className={inputClass} rows={2} />
          </Field>
          <Field label="Conditions" error={errors.conditions?.message}>
            <textarea {...register('conditions')} className={inputClass} rows={2} />
          </Field>
          <Field label="Last visit" error={errors.last_visit?.message}>
            <input type="date" {...register('last_visit')} className={inputClass} />
          </Field>
        </div>
      </section>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white'

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
      {children}
      {error && <span className="text-red-600">{error}</span>}
    </label>
  )
}
