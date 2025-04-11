import { createFileRoute } from '@tanstack/solid-router'
import PatientDetails from 'src/pages/PatientDetails'

export const Route = createFileRoute('/patients/$patientId')({
  component: RouteComponent,

})

function RouteComponent() {
  const { patientId } = Route.useParams()() as { patientId: string }
  return <PatientDetails patientId={patientId} />
}
