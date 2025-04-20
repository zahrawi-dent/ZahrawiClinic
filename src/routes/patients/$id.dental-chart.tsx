import { createFileRoute } from '@tanstack/solid-router'
import { Show, createMemo, JSXElement } from 'solid-js'
import { DentalChart } from '../../components/DentalChart/DentalChart'
import { getDentalChartState, saveDentalChartState } from '../../services/pocketbase'
import { initialCombinedTeethData } from '../../components/DentalChart/constants/initialData'
import type { SavedChartState, PatientInfo, HistoryEntry, Tooth } from '../../components/DentalChart/types/dental.types'
import { dentalOps } from 'src/operations'
import { useQuery } from '@tanstack/solid-query'
import { Patient } from 'src/types/dental'

// Define a default empty PatientInfo object conforming to the type
const defaultPatientInfo: PatientInfo = {
  id: '',
  name: 'Loading...',
  dob: '',
  lastVisit: '',
  nextAppointment: '',
}

export const Route = createFileRoute('/patients/$id/dental-chart')({
  component: PatientDentalChartPage,
})

function PatientDentalChartPage(): JSXElement {
  const { id: patient_id } = Route.useParams()() as { id: string }


  const patientDetailsQuery = useQuery(() => ({
    queryKey: ['patient-details', patient_id],
    queryFn: async () => {
      const patient = await dentalOps.patients.getById(patient_id);
      // Optional: Throw an error if patient not found to trigger isError state
      if (!patient) {
        throw new Error(`Patient with ID ${patient_id} not found.`);
      }
      return patient;
    },
    // staleTime: 1000 * 60 * 5 // Optional: Keep data fresh for 5 minutes
  }));


  const chartStateQuery = useQuery(() => ({
    queryKey: ['chart-data', patient_id],
    queryFn: async () => {
      const chartState = await getDentalChartState(patient_id);
      return chartState;
    },
    // staleTime: 1000 * 60 * 5 // Optional: Keep data fresh for 5 minutes
  }));

  // Loading state derived from resources
  const isLoading = createMemo(() => patientDetailsQuery.isLoading || chartStateQuery.isLoading)
  const hasError = createMemo(() => patientDetailsQuery.isError || chartStateQuery.isError)

  // Handler for saving the chart state
  const handleSaveChart = async (currentState: SavedChartState) => {
    if (!patient_id) {
      console.error("Cannot save chart, patient ID is missing.")
      alert("Error: Patient ID not found.")
      return
    }
    try {
      // currentState: is the chart data to be saved
      await saveDentalChartState(patient_id, currentState)
    } catch (error) {
      console.error("Failed to save chart state from page:", error)
      // Consider showing a user-facing error notification here
    }
  }

  // Memoize the props for DentalChart
  const chartProps = createMemo(() => {
    const savedState = chartStateQuery.data
    const currentPatientDetails = patientDetailsQuery.data
    const currentId = patient_id

    // Return null immediately if ID is missing
    if (!currentId) return null

    // Determine the base patient info
    const basePatientInfo = currentPatientDetails

    let combinedPatientInfo: Patient
    let teethData: Tooth[] = initialCombinedTeethData
    let historyData: HistoryEntry[] = []

    if (savedState) {
      // Merge: Start with default, layer saved state, then layer current fetched details
      combinedPatientInfo = {
        ...defaultPatientInfo,
        ...(savedState.patientInfo || {}),
        ...basePatientInfo
      }

      teethData = savedState.teeth || initialCombinedTeethData
      historyData = savedState.history || []
    } else {
      combinedPatientInfo = basePatientInfo
    }

    // Final check to ensure all required fields are present
    const finalPatientInfo: Patient = basePatientInfo

    return {
      patientId: currentId,
      initialPatientInfo: finalPatientInfo,
      initialTeeth: teethData,
      initialHistory: historyData,
      onSaveChart: handleSaveChart,
    }
  })

  return (
    <div class="container mx-auto p-4">
      <Show when={isLoading()}><div>Loading dental chart...</div></Show>
      <Show when={hasError() && !isLoading()}><div>Error loading chart data. Please try again.</div></Show>
      <Show when={chartProps()} keyed>
        {(props) => <DentalChart {...props} />}
      </Show>
    </div>
  )
}

// const [patientDetails] = createResource(patientIdSignal, async (id) => {
//   if (!id) return null
//   try {
//     const pb = getPocketBase()
//     const patientRecord = await pb.collection('patients').getOne(id)
//     // Ensure the returned object matches PatientInfo
//     const info: PatientInfo = {
//       id: patientRecord.id,
//       name: patientRecord.name || 'Unknown Patient',
//       dob: patientRecord.dob || '',
//       lastVisit: patientRecord.lastVisit || '',
//       nextAppointment: patientRecord.nextAppointment || '',
//     }
//     return info
//   } catch (error) {
//     console.error(`Error fetching patient details for ${id}:`, error)
//     return null
//   }
// })

// Resource to fetch the saved chart state - use the signal/memo here
// const [chartStateResource] = createResource<SavedChartState | null, string>(patientIdSignal, getDentalChartState)
