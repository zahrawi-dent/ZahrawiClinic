import { createSignal, createResource, JSX } from 'solid-js'
import Calendar from '../components/Calendar'
import BackButton from '../components/BackButton'

function ViewSchedule(): JSX.Element {
  const [selectedDate, setSelectedDate] = createSignal(new Date())

  // In a real app, you would fetch these from your database
  const fetchAppointments = async (): Promise<
    { id: string; patientName: string; start: string; end: string; type: string }[]
  > => {
    // Mock data for example
    return [
      {
        id: '1',
        patientName: 'John Doe',
        start: '2025-04-04T09:00:00',
        end: '2025-04-04T09:30:00',
        type: 'check-up'
      },
      {
        id: '2',
        patientName: 'Jane Smith',
        start: '2025-04-04T10:00:00',
        end: '2025-04-04T11:00:00',
        type: 'root-canal'
      },
      {
        id: '3',
        patientName: 'Mike Johnson',
        start: '2025-04-05T14:00:00',
        end: '2025-04-05T14:30:00',
        type: 'cleaning'
      }
    ]
  }

  const [appointments] = createResource(fetchAppointments)

  return (
    <div class="max-w-4xl mx-auto">
      {/* TODO: make better layout for Backbutton */}
      <BackButton to="/" label="Back to Dashboard" />
      <h2 class="text-2xl font-bold mb-6 mt-4">Schedule</h2>
      <Calendar
        selectedDate={selectedDate()}
        onDateChange={setSelectedDate}
        appointments={appointments() || []}
      />
    </div>
  )
}

export default ViewSchedule
