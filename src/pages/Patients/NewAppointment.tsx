/// import { Appointment } from 'src/types/appointments'
// import BackButton from '../../components/BackButton'
// import { createSignal, JSX, createResource } from 'solid-js'
// import { dentalOps } from 'src/operations'
//
// // Define appointment form props interface
// interface AppointmentFormProps {
//   patientName: string;
//   patientId: string;
//   dentists: Array<{ id: string; name: string }>;
//   onSubmit: (data: Appointment) => Promise<void>;
// }
//
// // AppointmentForm component
// function AppointmentForm(props: AppointmentFormProps): JSX.Element {
//   const [form, setForm] = createSignal({
//     date: '',
//     time: '',
//     status: 'pending',
//     reasonForVisit: '',
//     notes: '',
//     duration: '30',
//     type: '',
//     dentistId: '', // Added dentist ID field
//     patientId: props.patientId // Set patient ID from props
//   })
//
//   const handleSubmit = async (e: Event): Promise<void> => {
//     e.preventDefault();
//
//     try {
//       // Create ISO date format by combining date and time
//       const dateTime = new Date(`${form().date}T${form().time}:00`);
//
//       await props.onSubmit({
//         ...form(),
//         date: dateTime.toISOString(),
//         patient: props.patientId, // Set the patient field for PocketBase
//         dentist: form().dentistId, // Set the dentist field for PocketBase
//       });
//
//       // Reset form after successful submission
//       setForm({
//         date: '',
//         time: '',
//         status: 'pending',
//         reasonForVisit: '',
//         notes: '',
//         duration: '30',
//         type: '',
//         dentistId: '',
//         patientId: props.patientId
//       });
//     } catch (err) {
//       console.error("Error submitting appointment:", err);
//       alert("Please ensure all fields are valid.");
//     }
//   };
//
//   const handleChange = (e: Event & {
//     currentTarget: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
//   }) => {
//     const { name, value } = e.currentTarget;
//     setForm(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };
//
//   return (
//     <form onSubmit={handleSubmit} class="bg-white shadow-md rounded p-6">
//       {/* Display Patient Name (Read-only) */}
//       <div class="mb-4">
//         <label class="block text-gray-700 text-sm font-bold mb-1">Patient</label>
//         <p class="text-gray-900 p-2 border rounded bg-gray-100">{props.patientName}</p>
//       </div>
//
//       <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {/* Dentist Select */}
//         <div>
//           <label class="block text-gray-700 text-sm font-bold mb-1" for="dentistId">Dentist</label>
//           <select
//             id="dentistId"
//             name="dentistId"
//             value={form().dentistId}
//             onInput={handleChange}
//             required
//             class="w-full p-2 border rounded shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
//           >
//             <option value="" disabled>Select Dentist</option>
//             {props.dentists.map(dentist => (
//               <option value={dentist.id}>{dentist.name}</option>
//             ))}
//           </select>
//         </div>
//
//         {/* Type Select */}
//         <div>
//           <label class="block text-gray-700 text-sm font-bold mb-1" for="type">Type</label>
//           <select
//             id="type"
//             name="type"
//             value={form().type}
//             onInput={handleChange}
//             required
//             class="w-full p-2 border rounded shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
//           >
//             <option value="" disabled>Select Type</option>
//             <option value="check-up">Regular Check-up</option>
//             <option value="cleaning">Cleaning</option>
//             <option value="filling">Filling</option>
//             <option value="root-canal">Root Canal</option>
//             <option value="extraction">Extraction</option>
//             <option value="other">Other</option>
//           </select>
//         </div>
//
//         {/* Date Input */}
//         <div>
//           <label class="block text-gray-700 text-sm font-bold mb-1" for="date">Date</label>
//           <input
//             id="date"
//             name="date"
//             type="date"
//             value={form().date}
//             onInput={handleChange}
//             required
//             class="w-full p-2 border rounded shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
//           />
//         </div>
//
//         {/* Time Input */}
//         <div>
//           <label class="block text-gray-700 text-sm font-bold mb-1" for="time">Time</label>
//           <input
//             id="time"
//             name="time"
//             type="time"
//             value={form().time}
//             onInput={handleChange}
//             required
//             class="w-full p-2 border rounded shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
//           />
//         </div>
//
//         {/* Duration Select */}
//         <div>
//           <label class="block text-gray-700 text-sm font-bold mb-1" for="duration">Duration (minutes)</label>
//           <select
//             id="duration"
//             name="duration"
//             value={form().duration}
//             onInput={handleChange}
//             required
//             class="w-full p-2 border rounded shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
//           >
//             <option value="15">15 min</option>
//             <option value="30">30 min</option>
//             <option value="45">45 min</option>
//             <option value="60">60 min</option>
//             <option value="90">90 min</option>
//             <option value="120">120 min</option>
//           </select>
//         </div>
//       </div>
//
//       {/* Reason For Visit */}
//       <div class="mt-4">
//         <label class="block text-gray-700 text-sm font-bold mb-1" for="reasonForVisit">Reason for Visit</label>
//         <input
//           id="reasonForVisit"
//           name="reasonForVisit"
//           type="text"
//           value={form().reasonForVisit}
//           onInput={handleChange}
//           required
//           class="w-full p-2 border rounded shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
//         />
//       </div>
//
//       {/* Notes Textarea */}
//       <div class="mt-4">
//         <label class="block text-gray-700 text-sm font-bold mb-1" for="notes">Notes</label>
//         <textarea
//           id="notes"
//           name="notes"
//           value={form().notes}
//           onInput={handleChange}
//           class="w-full p-2 border rounded shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
//           rows="3"
//         />
//       </div>
//
//       {/* Submit Button */}
//       <div class="mt-6">
//         <button
//           type="submit"
//           class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
//         >
//           Schedule Appointment
//         </button>
//       </div>
//     </form>
//   );
// }
//
// // Main NewAppointment component
// function NewAppointment(props: { patientId: string, patientName: string }): JSX.Element {
//
//   // Fetch dentists for dropdown selection
//   const [dentists] = createResource(async () => {
//     try {
//       const dentistData = await dentalOps.dentists.getAll();
//       return dentistData.map(d => ({
//         id: d.id,
//         name: `${d.firstName} ${d.lastName}`
//       }));
//     } catch (error) {
//       console.error("Failed to fetch dentists:", error);
//       return [];
//     }
//   });
//
//   const handleCreateAppointment = async (appointment: Appointment): Promise<void> => {
//     try {
//       await dentalOps.appointments.create(appointment);
//       // TODO: snackbar success message
//     } catch (error) {
//       // TODO: snack bar error
//
//       // console.error("Failed to create appointment:", error);
//       // Show more detailed error message
//       if (error.response?.data?.message) {
//         alert(`Error: ${error.response.data.message}`);
//       } else {
//         alert("Failed to create appointment. Please try again.");
//       }
//     }
//   }
//
//   return (
//     <div class="max-w-4xl mx-auto">
//       <div class="py-4">
//         <BackButton to="/" label="Back to Dashboard" />
//       </div>
//       <h2 class="text-2xl font-bold my-6">New Appointment</h2>
//
//       {/* Show loading state while fetching dentists */}
//       {dentists.loading && <p class="text-gray-600">Loading dentists...</p>}
//
//       {/* Show error if dentist fetch fails */}
//       {dentists.error && <p class="text-red-600">Error loading dentists. Please refresh page.</p>}
//
//       {/* Show form when dentists are available */}
//       {dentists() && dentists()?.length > 0 && (
//         <AppointmentForm
//           onSubmit={handleCreateAppointment}
//           patientName={props.patientName}
//           patientId={props.patientId}
//           dentists={dentists() || []}
//         />
//       )}
//
//       {/* Show warning if no dentists are available */}
//       {dentists() && dentists()?.length === 0 && (
//         <p class="text-red-600">No dentists available. Please add dentists to the system first.</p>
//       )}
//     </div>
//   )
// }
//
// export default NewAppointment




import { useQuery, useMutation, useQueryClient } from '@tanstack/solid-query';
import { Show, JSX, createSignal, createMemo } from 'solid-js';

import BackButton from '../../components/BackButton';
import { Appointment, AppointmentStatus, AppointmentType } from 'src/types/appointments';
import { Dentist } from 'src/types/dental';
import { dentalOps } from 'src/operations';
import { useNavigate } from '@tanstack/solid-router';
import SearchableSelect from '../appointments/SearchableSelect';


// Define the expected shape for the dentist selection dropdown
interface DentistSelectionItem {
  id: string;
  name: string;
}

function NewAppointment(props: { patientId: string, patientName: string }): JSX.Element {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // // For displaying success/error messages (replace with a toast library ideally)
  // const [feedbackMessage, setFeedbackMessage] = createSignal<{ type: 'success' | 'error'; text: string } | null>(null);

  const dentistsQuery = useQuery(() => ({
    queryKey: ['dentists'],
    queryFn: async (): Promise<DentistSelectionItem[]> => {
      const dentistData: Dentist[] = await dentalOps.dentists.getAll();
      // Transform data for the dropdown
      return dentistData.map(d => ({
        id: d.id,
        name: `${d.firstName} ${d.lastName}`
      }));
    },
    staleTime: 5 * 60 * 1000,
  }));

  const createAppointmentMutation = useMutation(() => ({
    mutationFn: (newAppointmentData: Appointment) => {
      return dentalOps.appointments.create(newAppointmentData);
    },
    onSuccess: (createdAppointment) => {
      console.log('Appointment created successfully:', createdAppointment);
      // setFeedbackMessage({ type: 'success', text: 'Appointment scheduled successfully!' });

      // --- Invalidate relevant queries ---
      // Invalidate general appointments list if you have one
      queryClient.invalidateQueries({ queryKey: ['appointments'] }).catch(() => { });
      // Invalidate appointments specific to this patient if tracked separately
      queryClient.invalidateQueries({ queryKey: ['appointments', 'patient', props.patientId] }).catch(() => { });
      // Maybe invalidate appointments for the specific dentist?
      // queryClient.invalidateQueries({ queryKey: ['appointments', 'dentist', createdAppointment.dentist] });

      navigate({ to: `/patients/${props.patientId}` }).catch(() => { });
    },
    onError: (error: Error) => {
      console.error('Failed to create appointment:', error);
      // setFeedbackMessage({ type: 'error', text: `Failed to schedule appointment: ${error.message || 'Please try again.'}` });
    },
  }));

  // Callback to pass to the form for triggering reset after successful mutation
  const handleSuccess = () => {
    // setTimeout(() => setFeedbackMessage(null), 3000); // Clear message after 3s
  };

  return (
    <div class="max-w-4xl mx-auto p-4">
      <div class="py-4">
        <BackButton to={props.patientId ? `/patients/${props.patientId}` : '/patients'} label="Back" />
      </div>
      <h2 class="text-2xl font-bold my-6">New Appointment</h2>

      {/* Display Loading State for Dentists */}
      <Show when={dentistsQuery.isLoading}>
        <p class="text-gray-600 text-center p-4">Loading available dentists...</p>
      </Show>

      {/* Display Error State for Dentists */}
      <Show when={dentistsQuery.isError}>
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error loading dentists:</p>
          <pre class="text-sm mt-1">{dentistsQuery.error?.message || 'Unknown error'}</pre>
          <button
            onClick={() => dentistsQuery.refetch()}
            class="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Retry
          </button>
        </div>
      </Show>

      {/* Display Feedback Messages (Success/Error for Mutation) */}
      {/* <Show when={feedbackMessage()}> */}
      {/*   {(msg) => ( */}
      {/*     <div */}
      {/*       class={`p-3 rounded mb-4 text-sm ${msg().type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`} */}
      {/*     > */}
      {/*       {msg().text} */}
      {/*     </div> */}
      {/*   )} */}
      {/* </Show> */}

      {/* Display Form when Dentists are Loaded Successfully */}
      <Show when={dentistsQuery.isSuccess && dentistsQuery.data}>
        {(dentistList) => (
          <Show when={dentistList().length > 0} fallback={
            <p class="text-orange-600 text-center p-4">No dentists available. Please add dentists to the system first.</p>
          }>
            <AppointmentForm
              patientId={props.patientId}
              patientName={props.patientName ?? 'N/A'} // Provide fallback for name
              dentists={dentistList()}
              // Pass the mutation function and its loading state
              onSubmit={(formData: Appointment) => createAppointmentMutation.mutate(formData)}
              isSubmitting={createAppointmentMutation.isLoading}
              // Pass callback to trigger on mutation success
              onSuccessCallback={handleSuccess}
            />
          </Show>
        )}
      </Show>
    </div>
  );
}



// Define the structure of the form's internal state
export interface AppointmentFormData {
  date: string;       // YYYY-MM-DD string
  time: string;       // HH:mm string
  status: AppointmentStatus;     // e.g., 'pending', 'confirmed'
  reasonForVisit: string;
  notes: string;
  duration: string;   // Duration in minutes as string
  type: AppointmentType;       // e.g., 'check-up'
  dentistId: string;  // ID of the selected dentist
  patientId: string;  // ID of the patient
}

// Raw data type expected by the API 
interface ApiAppointmentData extends Omit<AppointmentFormData, 'date' | 'time' | 'dentistId' | 'patientId'> {
  date: string; // ISO Date String
  patient: string; // Patient Relation ID
  dentist: string; // Dentist Relation ID
}


// Define the props for the form component
interface AppointmentFormProps {
  patientName: string;
  patientId: string;
  dentists: Array<{ id: string; name: string }>;
  onSubmit: (data: ApiAppointmentData) => void; // Expects the mutation trigger function
  isSubmitting: boolean;                        // Loading state from the mutation
  onSuccessCallback: () => void;                // Callback for parent to trigger actions (like reset/feedback)
}

// --- AppointmentForm Component ---
function AppointmentForm(props: AppointmentFormProps): JSX.Element {

  const initialFormState = (): AppointmentFormData => ({
    date: '',
    time: '',
    status: AppointmentStatus.Pending, // Default status
    reasonForVisit: '',
    notes: '',
    duration: '30',    // Default duration
    type: '',
    dentistId: '',
    patientId: props.patientId // Initialize with passed patientId
  });

  const [form, setForm] = createSignal<AppointmentFormData>(initialFormState());
  const [validationError, setValidationError] = createSignal<string | null>(null);

  // --- Create options array from AppointmentType enum ---
  // Use createMemo so this conversion only happens once or when AppointmentType might change (unlikely for enum)
  const appointmentTypeOptions = createMemo(() => {
    return Object.values(AppointmentType).map(value => ({
      value: value,
      label: value
    }));
    // If your API expected the *key* (e.g., "CheckupRoutineExam") instead of the value:
    // return Object.entries(AppointmentType).map(([key, value]) => ({
    //   value: key, // Or value, depending on API needs
    //   label: value
    // }));
  });

  // --- Create options array for Dentists ---
  const dentistOptions = createMemo(() => {
    // Map the received dentist data to the {value, label} format
    return props.dentists.map(dentist => ({
      value: dentist.id, // Use 'id' as the value
      label: dentist.name // Use 'name' as the label
    }));
  });

  // Create options for Appointment Status
  const appointmentStatusOptions = createMemo(() => {
    // Map enum entries: Key becomes label, Value becomes value
    return Object.entries(AppointmentStatus).map(([key, value]) => ({
      value: value, // e.g., 'pending', 'confirmed', 'no_show'
      label: key    // e.g., 'Pending', 'Confirmed', 'NoShow' (more readable)
    }));
  });

  // Specific handler for the SearchableSelect component
  const handleTypeSelect = (selectedValue: string) => {
    setForm(prev => ({
      ...prev,
      type: selectedValue // Update the 'type' field in the form state
    }));
    // Clear validation error when user selects
    if (validationError()) {
      setValidationError(null);
    }
  };

  // Handler for Dentist selection
  const handleDentistSelect = (selectedValue: string) => {
    setForm(prev => ({ ...prev, dentistId: selectedValue }));
    if (validationError()) setValidationError(null);
  };

  // Specific handler for Status SearchableSelect
  const handleStatusSelect = (selectedValue: string) => {
    setForm(prev => ({ ...prev, status: selectedValue as AppointmentStatus })); // Update status
    if (validationError()) setValidationError(null);
  };


  const handleSubmit = (e: Event): void => {
    e.preventDefault();
    setValidationError(null); // Clear previous validation errors

    // Basic validation
    const currentForm = form();

    // Validation should check form().type now
    if (!form().date || !form().time || !form().dentistId || !form().type || !form().reasonForVisit || !form().status) {
      setValidationError("Please fill in all required fields (Dentist, Type, Date, Time, Reason).");
      return;
    }


    // Combine date and time into ISO string safely
    let isoDateTime: string;
    try {
      // Check if date and time are valid before creating Date object
      if (!/^\d{4}-\d{2}-\d{2}$/.test(currentForm.date) || !/^\d{2}:\d{2}$/.test(currentForm.time)) {
        throw new Error("Invalid date or time format.");
      }
      const dateTime = new Date(`${currentForm.date}T${currentForm.time}:00`);
      // Check if the resulting date is valid (handles invalid combinations)
      if (isNaN(dateTime.getTime())) {
        throw new Error("Invalid date/time combination.");
      }
      isoDateTime = dateTime.toISOString();
    } catch (error) {
      console.error("Date/Time formatting error:", error);
      setValidationError(`Invalid date or time provided. Please check the values.`);
      return;
    }


    // Prepare data for the API (matching ApiAppointmentData structure)
    const apiData: ApiAppointmentData = {
      status: currentForm.status,
      reasonForVisit: currentForm.reasonForVisit,
      notes: currentForm.notes,
      duration: currentForm.duration,
      type: currentForm.type,
      date: isoDateTime,             // Use ISO string
      patient: currentForm.patientId, // Use patient ID directly for relation
      dentist: currentForm.dentistId  // Use dentist ID directly for relation
    };

    // Call the mutation function passed via props
    props.onSubmit(apiData);

    // Reset form state *after* triggering submission
    // Parent component's onSuccess/onError will handle feedback/navigation
    setForm(initialFormState());

    // Call the success callback provided by the parent
    // This allows parent to manage feedback visibility etc.
    props.onSuccessCallback();
  };

  // Handles changes for most input types
  const handleChange = (e: Event & { currentTarget: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement }) => {
    const { name, value } = e.currentTarget;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when user types
    if (validationError()) {
      setValidationError(null);
    }
  };

  return (
    // Disable fieldset when submitting
    <fieldset disabled={props.isSubmitting} class="group">
      <form onSubmit={handleSubmit} class="bg-white shadow-md rounded p-6 group-disabled:opacity-60 transition-opacity">

        {/* Display Validation Error */}
        <Show when={validationError()}>
          <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded mb-4 text-sm">
            {validationError()}
          </div>
        </Show>

        {/* Display Patient Name (Read-only) */}
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-1">Patient</label>
          <p class="text-gray-900 p-2 border rounded bg-gray-100">{props.patientName}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dentist Select */}
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-1" for="dentistId">Dentist <span class="text-red-500">*</span></label>
            <SearchableSelect
              id="dentistId"
              name="dentistId"
              options={dentistOptions()} // Use dentist options
              value={form().dentistId}   // Bind to form state
              onInput={handleDentistSelect} // Use specific handler
              placeholder="Select or search dentist..."
              required={true}
              disabled={props.isSubmitting}
              class="w-full"
            />
          </div>



          {/* Type Select */}
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-1" for="type">Type <span class="text-red-500">*</span></label>
            <SearchableSelect
              id="type"
              name="type" // Name attribute for forms
              options={appointmentTypeOptions()} // Pass the generated options
              value={form().type} // Controlled component value
              onInput={handleTypeSelect} // Handler for selection changes
              placeholder="Select or search type..."
              required={true}
              disabled={props.isSubmitting} // Disable when form is submitting
              class="w-full" // Pass width class or others as needed
            />
          </div>



          {/* Date Input */}
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-1" for="date">Date <span class="text-red-500">*</span></label>
            <input
              id="date"
              name="date"
              type="date"
              value={form().date}
              onInput={handleChange}
              required
              class="w-full p-2 border rounded shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-100"
            />
          </div>

          {/* Time Input */}
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-1" for="time">Time <span class="text-red-500">*</span></label>
            <input
              id="time"
              name="time"
              type="time"
              value={form().time}
              onInput={handleChange}
              required
              class="w-full p-2 border rounded shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-100"
            />
          </div>

          {/* Duration Select */}
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-1" for="duration">Duration (minutes)</label>
            <select
              id="duration"
              name="duration"
              value={form().duration}
              onInput={handleChange}
              required
              class="w-full p-2 border rounded shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-100"
            >
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">60 min</option>
              <option value="90">90 min</option>
              <option value="120">120 min</option>
            </select>
          </div>

          {/* --- Status Select --- */}
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-1" for="status">Status <span class="text-red-500">*</span></label>
            <SearchableSelect
              id="status"
              name="status"
              options={appointmentStatusOptions()} // Use status options
              value={form().status}             // Bind to form state
              onInput={handleStatusSelect}      // Use specific handler
              placeholder="Select or search status..."
              required={true}
              disabled={props.isSubmitting}
              class="w-full"
            />
          </div>


        </div>

        {/* Reason For Visit */}
        <div class="mt-4">
          <label class="block text-gray-700 text-sm font-bold mb-1" for="reasonForVisit">Reason for Visit <span class="text-red-500">*</span></label>
          <input
            id="reasonForVisit"
            name="reasonForVisit"
            type="text"
            value={form().reasonForVisit}
            onInput={handleChange}
            required
            class="w-full p-2 border rounded shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-100"
            maxLength={150} // Example length limit
          />
        </div>

        {/* Notes Textarea */}
        <div class="mt-4">
          <label class="block text-gray-700 text-sm font-bold mb-1" for="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={form().notes}
            onInput={handleChange}
            class="w-full p-2 border rounded shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-100"
            rows="3"
            maxLength={500} // Example length limit
          />
        </div>

        {/* Submit Button */}
        <div class="mt-6">
          <button
            type="submit"
            class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={props.isSubmitting} // Disable button when submitting
          >
            <Show when={props.isSubmitting} fallback={<span>Schedule Appointment</span>}>
              {/* Basic Spinner SVG */}
              <svg class="animate-spin -ml-1 mr-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Scheduling...</span>
            </Show>
          </button>
        </div>
      </form>
    </fieldset>
  );
}

export default NewAppointment;
