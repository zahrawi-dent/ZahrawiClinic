import { createFileRoute } from '@tanstack/solid-router'
import NewAppointment from 'src/pages/Patients/NewAppointment'

export const Route = createFileRoute('/appointments/new')({
  component: RouteComponent,
})

function RouteComponent() {
  const { patientId, patientName } = Route.useSearch()() as { patientId: string, patientName: string }
  return <NewAppointment patientId={patientId} patientName={patientName} />
}
