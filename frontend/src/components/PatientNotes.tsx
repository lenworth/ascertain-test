import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { api, formatApiError } from '../api/client'
import { noteSchema, type NoteFormValues } from '../schemas/patient'
import { Card, ErrorAlert, LoadingSpinner } from './ui'

export function PatientNotes({ patientId }: { patientId: number }) {
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)

  const { data: notes, isLoading, isError, error } = useQuery({
    queryKey: ['notes', patientId],
    queryFn: () => api.listNotes(patientId),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { content: '', note_timestamp: '' },
  })

  const createMutation = useMutation({
    mutationFn: (values: NoteFormValues) =>
      api.createNote(
        patientId,
        values.content,
        values.note_timestamp || undefined,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', patientId] })
      queryClient.invalidateQueries({ queryKey: ['summary', patientId] })
      reset()
      setServerError(null)
    },
    onError: (err) => setServerError(formatApiError(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (noteId: number) => api.deleteNote(patientId, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', patientId] })
      queryClient.invalidateQueries({ queryKey: ['summary', patientId] })
    },
  })

  if (isLoading) return <LoadingSpinner />
  if (isError) return <ErrorAlert message={formatApiError(error)} />

  return (
    <Card>
      <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
        Clinical Notes
      </h3>

      <form
        onSubmit={handleSubmit((values) => createMutation.mutate(values))}
        className="mb-6 space-y-3"
      >
        {serverError && <ErrorAlert message={serverError} />}
        <textarea
          {...register('content')}
          rows={3}
          placeholder="Add a clinical note..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
        {errors.content && (
          <p className="text-sm text-red-600">{errors.content.message}</p>
        )}
        <div className="flex flex-wrap gap-2">
          <input
            type="datetime-local"
            {...register('note_timestamp')}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
          <button
            type="submit"
            disabled={isSubmitting || createMutation.isPending}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-50"
          >
            Add Note
          </button>
        </div>
      </form>

      <ul className="space-y-3">
        {notes?.length === 0 && (
          <p className="text-sm text-slate-500">No notes recorded yet.</p>
        )}
        {notes?.map((note) => (
          <li
            key={note.id}
            className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <time className="text-xs text-slate-500">
                {new Date(note.note_timestamp).toLocaleString()}
              </time>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(note.id)}
                className="text-xs text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300">{note.content}</p>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export function PatientSummaryView({ patientId }: { patientId: number }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['summary', patientId],
    queryFn: () => api.getSummary(patientId),
  })

  if (isLoading) return <LoadingSpinner />
  if (isError) return <ErrorAlert message={formatApiError(error)} />
  if (!data) return null

  return (
    <Card>
      <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
        Patient Summary
      </h3>
      <div className="mb-4 grid gap-2 text-sm sm:grid-cols-2">
        <p><span className="font-medium">Name:</span> {data.name}</p>
        <p><span className="font-medium">Age:</span> {data.age}</p>
        <p><span className="font-medium">Blood type:</span> {data.blood_type ?? 'Unknown'}</p>
        <p><span className="font-medium">Status:</span> {data.status}</p>
      </div>
      {data.key_points.length > 0 && (
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
          {data.key_points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      )}
      <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        {data.narrative}
      </pre>
    </Card>
  )
}
