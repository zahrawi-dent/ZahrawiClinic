import { createFileRoute } from '@tanstack/solid-router'
import { JSX } from 'solid-js'
import PatientsList from 'src/pages/PatientsList/PatientsList'

export const Route = createFileRoute('/patients/')({
  component: RouteComponent,
})

function RouteComponent(): JSX.Element {
  return <PatientsList />
}
