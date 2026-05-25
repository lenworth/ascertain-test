import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, formatApiError } from '../api/client'
import { PatientForm } from '../components/PatientForm'
import { PatientNotes, PatientSummaryView } from '../components/PatientNotes'
import { Card, ErrorAlert, LoadingSpinner, StatusBadge } from '../components/ui'
import type { PatientFormValues } from '../schemas/patient'

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const patientId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { data: patient, isLoading, isError, error } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => api.getPatient(patientId),
    enabled: Number.isFinite(patientId),
  })

  const updateMutation = useMutation({
    mutationFn: (values: PatientFormValues) =>
      api.updatePatient(patientId, cleanFormValues(values)),
    onSuccess: (updatedPatient) => {
      queryClient.setQueryData(['patient', patientId], updatedPatient)
      queryClient.invalidateQueries({ queryKey: ['patients'], exact: false })
      queryClient.invalidateQueries({ queryKey: ['summary', patientId] })
      setEditing(false)
      setServerError(null)
    },
    onError: (err) => setServerError(formatApiError(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.deletePatient(patientId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['patient', patientId] })
      queryClient.invalidateQueries({ queryKey: ['patients'], exact: false })
      navigate('/patients')
    },
    onError: (err) => setServerError(formatApiError(err)),
  })

  if (isLoading) return <LoadingSpinner />
  if (isError) return <ErrorAlert message={formatApiError(error)} />
  if (!patient) return <ErrorAlert message="Patient not found" />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/patients" className="text-sm text-primary-600 hover:underline">
            ← Back to patients
          </Link>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {patient.first_name} {patient.last_name}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={patient.status} />
            <span className="text-sm text-slate-500">Age {patient.age}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing((e) => !e)}
            className="rounded-lg border px-3 py-1.5 text-sm dark:border-slate-600"
          >
            {editing ? 'Cancel edit' : 'Edit'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm('Delete this patient?')) deleteMutation.mutate()
            }}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      {editing ? (
        <Card>
          <PatientForm
            defaultValues={patient}
            submitLabel="Update Patient"
            serverError={serverError}
            onSubmit={async (values) => {
              await updateMutation.mutateAsync(values)
            }}
          />
        </Card>
      ) : (
        <Card>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <Info label="Email" value={patient.email} />
            <Info label="Phone" value={patient.phone} />
            <Info label="Address" value={patient.address} />
            <Info label="Blood type" value={patient.blood_type} />
            <Info label="Allergies" value={patient.allergies} />
            <Info label="Conditions" value={patient.conditions} />
            <Info label="Last visit" value={patient.last_visit} />
            <Info label="Date of birth" value={patient.date_of_birth} />
          </div>
        </Card>
      )}

      <PatientSummaryView patientId={patientId} />
      <PatientNotes patientId={patientId} />
    </div>
  )
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <p>
      <span className="font-medium text-slate-700 dark:text-slate-300">{label}: </span>
      <span className="text-slate-600 dark:text-slate-400">{value || '—'}</span>
    </p>
  )
}

function cleanFormValues(values: PatientFormValues) {
  return {
    ...values,
    email: values.email || undefined,
    phone: values.phone || undefined,
    address: values.address || undefined,
    blood_type: values.blood_type || undefined,
    allergies: values.allergies || undefined,
    conditions: values.conditions || undefined,
    last_visit: values.last_visit || undefined,
  }
}

export function PatientCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: (values: PatientFormValues) =>
      api.createPatient(cleanFormValues(values)),
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      navigate(`/patients/${patient.id}`)
    },
    onError: (err) => setServerError(formatApiError(err)),
  })

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Add Patient</h2>
      <Card>
        <PatientForm
          submitLabel="Create Patient"
          serverError={serverError}
          onSubmit={async (values) => {
            await createMutation.mutateAsync(values)
          }}
        />
      </Card>
    </div>
  )
}
