import { Appointment } from 'src/types/dental'
import BackButton from '../../components/BackButton'
import { createSignal, JSX, createResource } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { dentalOps } from 'src/operations'

// Define appointment form props interface
interface AppointmentFormProps {
  patientName: string;
  patientId: string;
  dentists: Array<{ id: string; name: string }>;
  onSubmit: (data: Appointment) => Promise<void>;
}

// AppointmentForm component
function AppointmentForm(props: AppointmentFormProps): JSX.Element {
  const [form, setForm] = createSignal({
    date: '',
    time: '',
    status: 'pending',
    reasonForVisit: '',
    notes: '',
    duration: '30',
    type: '',
    dentistId: '', // Added dentist ID field
    patientId: props.patientId // Set patient ID from props
  })

  const handleSubmit = async (e: Event): Promise<void> => {
    e.preventDefault();

    try {
      // Create ISO date format by combining date and time
      const dateTime = new Date(`${form().date}T${form().time}:00`);

      await props.onSubmit({
        ...form(),
        date: dateTime.toISOString(),
        patient: props.patientId, // Set the patient field for PocketBase
        dentist: form().dentistId, // Set the dentist field for PocketBase
      });

      // Reset form after successful submission
      setForm({
        date: '',
        time: '',
        status: 'pending',
        reasonForVisit: '',
        notes: '',
        duration: '30',
        type: '',
        dentistId: '',
        patientId: props.patientId
      });
    } catch (err) {
      console.error("Error submitting appointment:", err);
      alert("Please ensure all fields are valid.");
    }
  };

  const handleChange = (e: Event & {
    currentTarget: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  }) => {
    const { name, value } = e.currentTarget;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} class="bg-white shadow-md rounded p-6">
      {/* Display Patient Name (Read-only) */}
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-1">Patient</label>
        <p class="text-gray-900 p-2 border rounded bg-gray-100">{props.patientName}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dentist Select */}
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-1" for="dentistId">Dentist</label>
          <select
            id="dentistId"
            name="dentistId"
            value={form().dentistId}
            onInput={handleChange}
            required
            class="w-full p-2 border rounded shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="" disabled>Select Dentist</option>
            {props.dentists.map(dentist => (
              <option value={dentist.id}>{dentist.name}</option>
            ))}
          </select>
        </div>

        {/* Type Select */}
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-1" for="type">Type</label>
          <select
            id="type"
            name="type"
            value={form().type}
            onInput={handleChange}
            required
            class="w-full p-2 border rounded shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="" disabled>Select Type</option>
            <option value="check-up">Regular Check-up</option>
            <option value="cleaning">Cleaning</option>
            <option value="filling">Filling</option>
            <option value="root-canal">Root Canal</option>
            <option value="extraction">Extraction</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Date Input */}
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-1" for="date">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            value={form().date}
            onInput={handleChange}
            required
            class="w-full p-2 border rounded shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Time Input */}
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-1" for="time">Time</label>
          <input
            id="time"
            name="time"
            type="time"
            value={form().time}
            onInput={handleChange}
            required
            class="w-full p-2 border rounded shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
            class="w-full p-2 border rounded shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="15">15 min</option>
            <option value="30">30 min</option>
            <option value="45">45 min</option>
            <option value="60">60 min</option>
            <option value="90">90 min</option>
            <option value="120">120 min</option>
          </select>
        </div>
      </div>

      {/* Reason For Visit */}
      <div class="mt-4">
        <label class="block text-gray-700 text-sm font-bold mb-1" for="reasonForVisit">Reason for Visit</label>
        <input
          id="reasonForVisit"
          name="reasonForVisit"
          type="text"
          value={form().reasonForVisit}
          onInput={handleChange}
          required
          class="w-full p-2 border rounded shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
          class="w-full p-2 border rounded shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
          rows="3"
        />
      </div>

      {/* Submit Button */}
      <div class="mt-6">
        <button
          type="submit"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Schedule Appointment
        </button>
      </div>
    </form>
  );
}

// Main NewAppointment component
function NewAppointment(): JSX.Element {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.patientId;
  const patientName = searchParams.patientName;

  // Fetch dentists for dropdown selection
  const [dentists] = createResource(async () => {
    try {
      const dentistData = await dentalOps.dentists.getAll();
      return dentistData.map(d => ({
        id: d.id,
        name: `${d.firstName} ${d.lastName}`
      }));
    } catch (error) {
      console.error("Failed to fetch dentists:", error);
      return [];
    }
  });

  const handleCreateAppointment = async (appointment: Appointment): Promise<void> => {
    try {
      await dentalOps.appointments.create(appointment);
      // TODO: snackbar success message
    } catch (error) {
      // TODO: snack bar error

      // console.error("Failed to create appointment:", error);
      // Show more detailed error message
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert("Failed to create appointment. Please try again.");
      }
    }
  }

  return (
    <div class="max-w-4xl mx-auto">
      <div class="py-4">
        <BackButton to="/" label="Back to Dashboard" />
      </div>
      <h2 class="text-2xl font-bold my-6">New Appointment</h2>

      {/* Show loading state while fetching dentists */}
      {dentists.loading && <p class="text-gray-600">Loading dentists...</p>}

      {/* Show error if dentist fetch fails */}
      {dentists.error && <p class="text-red-600">Error loading dentists. Please refresh page.</p>}

      {/* Show form when dentists are available */}
      {dentists() && dentists()?.length > 0 && (
        <AppointmentForm
          onSubmit={handleCreateAppointment}
          patientName={patientName}
          patientId={patientId}
          dentists={dentists() || []}
        />
      )}

      {/* Show warning if no dentists are available */}
      {dentists() && dentists()?.length === 0 && (
        <p class="text-red-600">No dentists available. Please add dentists to the system first.</p>
      )}
    </div>
  )
}

export default NewAppointment
