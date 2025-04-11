import { createFileRoute } from '@tanstack/solid-router'
import { EditPatient } from 'src/pages/Patients/EditPatient'

export const Route = createFileRoute('/patients/$id/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()() as { id: string }
  return <EditPatient patientId={id} />
}
