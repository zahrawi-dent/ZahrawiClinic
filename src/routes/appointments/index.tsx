import { createFileRoute } from '@tanstack/solid-router'
import Appointments from 'src/pages/appointments/Appointments'

export const Route = createFileRoute('/appointments/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Appointments />
}
