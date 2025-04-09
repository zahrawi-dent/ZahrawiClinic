import { createSignal, createEffect, Show, For } from 'solid-js'
import type { Patient, Dentist } from '../../types/dental-api'

/**
 * Example component demonstrating how to use the database API from the frontend
 * Implemented using SolidJS
 */
export default function ApiExample() {
  const [patients, setPatients] = createSignal<Patient[]>([])
  const [dentists, setDentists] = createSignal<Dentist[]>([])
  const [loading, setLoading] = createSignal<boolean>(true)
  const [error, setError] = createSignal<string | null>(null)

  // Fetch data on component initialization
  createEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Access the API exposed through the preload script
        const fetchedPatients = await window.dentalApi.getPatients()
        const fetchedDentists = await window.dentalApi.getDentists()

        setPatients(fetchedPatients)
        setDentists(fetchedDentists)
        setError(null)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to fetch data. See console for details.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  })

  // Example function to create a new patient
  const handleAddPatient = async () => {
    try {
      const newPatient = await window.dentalApi.createPatient({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        gender: 'Male',
        phone: '555-123-4567',
        email: 'john.doe@example.com',
        address: '123 Main St',
        insuranceProvider: 'Example Insurance',
        insuranceNumber: 'INS12345',
        medicalHistory: 'No significant medical history',
        allergies: 'None',
        notes: 'New patient'
      })

      // Update the list of patients
      setPatients([...patients(), newPatient])
    } catch (err) {
      console.error('Error creating patient:', err)
      setError('Failed to create patient. See console for details.')
    }
  }

  // Example function to delete a patient
  const handleDeletePatient = async (id: number) => {
    try {
      const success = await window.dentalApi.deletePatient(id)
      if (success) {
        // Remove the deleted patient from the list
        setPatients(patients().filter((patient) => patient.id !== id))
      }
    } catch (err) {
      console.error(`Error deleting patient ${id}:`, err)
      setError('Failed to delete patient. See console for details.')
    }
  }

  return (
    <div class="api-example">
      <h2>Database API Example</h2>

      <Show when={loading()}>
        <div>Loading...</div>
      </Show>

      <Show when={error()}>
        <div class="error">{error()}</div>
      </Show>

      <Show when={!loading() && !error()}>
        <div class="data-section">
          <h3>Patients ({patients().length})</h3>
          <button onClick={handleAddPatient}>Add Sample Patient</button>
          <ul>
            <For each={patients()}>
              {(patient) => (
                <li>
                  {patient.firstName} {patient.lastName} - {patient.phone}
                  <button onClick={() => handleDeletePatient(patient.id)}>Delete</button>
                </li>
              )}
            </For>
          </ul>
        </div>

        <div class="data-section">
          <h3>Dentists ({dentists().length})</h3>
          <ul>
            <For each={dentists()}>
              {(dentist) => (
                <li>
                  Dr. {dentist.firstName} {dentist.lastName} -{' '}
                  {dentist.specialization || 'General Dentistry'}
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>
    </div>
  )
}

