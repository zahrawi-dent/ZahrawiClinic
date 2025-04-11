import { createFileRoute } from '@tanstack/solid-router'
import { JSX } from 'solid-js'
import PatientsList from 'src/pages/PatientList/PatientsList'

export const Route = createFileRoute('/Patients')({
  component: RouteComponent,
})

function RouteComponent(): JSX.Element {
  return <PatientsList />
}

