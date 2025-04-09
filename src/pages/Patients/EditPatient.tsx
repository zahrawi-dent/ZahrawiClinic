import BackButton from '../../components/BackButton'
import { Patient } from '../../types/dental'
import { useNavigate, useParams } from '@solidjs/router'
import { createSignal, JSX, onMount, Show } from 'solid-js'
import PatientForm from './PatientForm'

export function EditPatient(): JSX.Element {
  const params = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = createSignal<Patient | null>(null)
  const [loading, setLoading] = createSignal(true)
  const [error, setError] = createSignal<string | null>(null)

  onMount(async () => {
    try {
      const patientData = await window.dentalApi.getPatientById(parseInt(params.id))
      if (!patientData) {
        throw new Error('Patient not found')
      }
      setPatient(patientData)
    } catch (err) {
      setError('Failed to load patient data. Please try again.')
      console.error('Error fetching patient data:', err)
    } finally {
      setLoading(false)
    }
  })

  const handleUpdate = async (updatedPatient: Patient): Promise<void> => {
    try {
      await window.dentalApi.updatePatient(parseInt(params.id), updatedPatient)
      // Navigate back to patient details
      navigate(`/patients/${params.id}`)
    } catch (err) {
      setError('Failed to update patient. Please try again.')
      console.error('Error updating patient:', err)
    }
  }

  return (
    <div class="max-w-4xl mx-auto">
      <BackButton to={`/patients/${params.id}`} label="Back to Patient Details" />
      <h2 class="text-2xl font-bold my-6">Edit Patient</h2>

      <Show
        when={!loading()}
        fallback={
          <div class="flex justify-center items-center h-32">
            <div class="text-center">
              <p class="text-gray-500">Loading patient data...</p>
            </div>
          </div>
        }
      >
        <Show
          when={!error()}
          fallback={
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{error()}</p>
            </div>
          }
        >
          <Show when={patient()}>
            <PatientForm patient={patient()} onSubmit={handleUpdate} />
          </Show>
        </Show>
      </Show>
    </div>
  )
}
