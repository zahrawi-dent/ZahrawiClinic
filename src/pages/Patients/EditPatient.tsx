// import BackButton from '../../components/BackButton'
// import { Patient } from '../../types/dental'
// import { useNavigate } from '@tanstack/solid-router'
// import { createSignal, JSX, onMount, Show } from 'solid-js'
// import PatientForm from './PatientForm'
// import { dentalOps } from 'src/operations'
// import { useQuery } from '@tanstack/solid-query'
//
// export function EditPatient(props: { patientId: string }): JSX.Element {
//   const navigate = useNavigate()
//   const [patient, setPatient] = createSignal<Patient | null>(null)
//   const [loading, setLoading] = createSignal(true)
//   const [error, setError] = createSignal<string | null>(null)
//
//   const patientQuery = useQuery(() => ({
//     queryKey: ['patient-details', props.patientId],
//     queryFn: () => dentalOps.patients.getById(props.patientId),
//     staleTime: 1000 * 60 * 5 // Keep data fresh for 5 minutes
//   }))
//
//
//   onMount(() => {
//     try {
//       const patientData = await dentalOps.patients.getById(props.patientId)
//       if (!patientData) {
//         throw new Error('Patient not found')
//       }
//       setPatient(patientData)
//     } catch (err) {
//       setError('Failed to load patient data. Please try again.')
//       console.error('Error fetching patient data:', err)
//     } finally {
//       setLoading(false)
//     }
//   })
//
//   const handleUpdate = async (updatedPatient: Patient): Promise<void> => {
//     try {
//       await dentalOps.patients.update(props.patientId, updatedPatient)
//       navigate({to: `/patients/${props.patientId}`}).catch(() => { })
//     } catch (err) {
//       setError('Failed to update patient. Please try again.')
//       console.error('Error updating patient:', err)
//     }
//   }
//
//   return (
//     <div class="max-w-4xl mx-auto">
//       <BackButton to={`/patients/${props.patientId}`} label="Back to Patient Details" />
//       <h2 class="text-2xl font-bold my-6">Edit Patient</h2>
//
//       <Show
//         when={!loading()}
//         fallback={
//           <div class="flex justify-center items-center h-32">
//             <div class="text-center">
//               <p class="text-gray-500">Loading patient data...</p>
//             </div>
//           </div>
//         }
//       >
//         <Show
//           when={!error()}
//           fallback={
//             <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//               <p>{error()}</p>
//             </div>
//           }
//         >
//           <Show when={patient()}>
//             <PatientForm patient={patient()} onSubmit={handleUpdate} />
//           </Show>
//         </Show>
//       </Show>
//     </div>
//   )
// }
import { useQuery, useMutation, useQueryClient } from '@tanstack/solid-query';
import { useNavigate } from '@tanstack/solid-router';
import { Show, JSX } from 'solid-js';

import BackButton from '../../components/BackButton';
import { Patient } from '../../types/dental';
import PatientForm from './PatientForm';
import { dentalOps } from 'src/operations';


export function EditPatient(props: { patientId: string }): JSX.Element {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const patientQuery = useQuery(() => ({
    queryKey: ['patients', props.patientId],
    queryFn: async (): Promise<Patient> => {
      const patientData = await dentalOps.patients.getById(props.patientId);
      if (!patientData) {
        throw new Error(`Patient with ID ${props.patientId} not found.`);
      }
      return patientData;
    },
    //  Only run the query if patientId is truthy
    enabled: !!props.patientId,
  }));

  const updateMutation = useMutation(() => ({
    mutationFn: (updatedPatientData: Patient) => {
      return dentalOps.patients.update(props.patientId, updatedPatientData);
    },
    onSuccess: () => {
      // --- Invalidate and Refetch Queries on Success ---
      // 1. Invalidate the specific patient query to refetch its details
      queryClient.invalidateQueries({ queryKey: ['patients', props.patientId] }).catch(() => { });
      // 2. Optionally, invalidate the list query if you have one (e.g., on '/patients')
      // queryClient.invalidateQueries({ queryKey: ['patients'] }); // Adjust key as needed

      navigate({
        to: `/patients/${props.patientId}`,
        replace: true, // Replace history entry so back button goes past edit page
        // Pass the updated data via state if the details page can use it immediately
        // state: { updatedPatient: updatedPatientData } // Optional: pass data
      }).catch((err) => console.error("Navigation failed after update:", err));
    },
    onError: (error) => {
      // TODO: Handle mutation errors (e.g., show a toast notification)
      console.error('Error updating patient:', error);
      // You might want to display this error to the user more prominently
      // e.g., using a toast library or setting a local signal for an error message
      // setErrorSignal(error.message || 'Failed to update patient. Please try again.');
    },
  }));


  // --- Render Logic ---
  return (
    <div class="max-w-4xl mx-auto p-4"> {/* Added padding for better spacing */}
      <BackButton to={`/patients/${props.patientId}`} label="Back to Patient Details" />
      <h2 class="text-2xl font-bold my-6">Edit Patient</h2>

      {/* Loading State for Fetch Query */}
      <Show when={patientQuery.isLoading}>
        <div class="flex justify-center items-center h-32">
          <p class="text-gray-500">Loading patient data...</p>
          {/* Add a spinner component here if desired */}
        </div>
      </Show>

      {/* Error State for Fetch Query */}
      <Show when={patientQuery.isError}>
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error loading patient data:</p>
          <pre class="text-sm mt-1">{patientQuery.error?.message || 'Unknown error'}</pre>
          <button
            onClick={() => patientQuery.refetch()}
            class="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Retry
          </button>
        </div>
      </Show>

      {/* Success State for Fetch Query - Render Form */}
      <Show when={patientQuery.isSuccess && patientQuery.data}>
        {/* Pass patient data and the mutation function to the form */}
        <PatientForm
          patient={patientQuery.data!} // Use non-null assertion or ensure data is defined
          onSubmit={(updatedData) => updateMutation.mutate(updatedData)}
          isSubmitting={updateMutation.isLoading} // Disable form while mutation runs
        />

        {/* Optional: Display mutation error near the form */}
        <Show when={updateMutation.isError}>
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
            <p>Error updating patient:</p>
            <pre class="text-sm mt-1">{updateMutation.error?.message || 'Unknown error'}</pre>
          </div>
        </Show>
      </Show>
    </div>
  );
}
