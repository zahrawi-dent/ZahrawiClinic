import { createFileRoute } from '@tanstack/solid-router'
import { lazy, Suspense, Switch, Match } from 'solid-js'
import { useAuth } from '../../auth/AuthContext'

const ReceptionistDashboard = lazy(() =>
  import('../../components/dashboard/ReceptionistDashBoard').then(m => ({ default: m.ReceptionistDashboard }))
)
const DentistDashboard = lazy(() =>
  import('../../components/dashboard/DentistDashboard').then(m => ({ default: m.DentistDashboard }))
)
const AdministratorDashboard = lazy(() =>
  import('../../components/dashboard/AdministratorDashboard').then(m => ({ default: m.AdministratorDashboard }))
)
const ManagerDashboard = lazy(() =>
  import('../../components/dashboard/ManagerDashboard').then(m => ({ default: m.ManagerDashboard }))
)

export const Route = createFileRoute('/(app)/')({
  component: Dashboard,
})

function Dashboard() {
  const { authState } = useAuth()
  const role = () => authState().role
  console.log("i'm logging in dev mode")
  console.info("i'm info in dev mode")
  console.warn("i'm warn in dev mode")

  return (
    <div class="min-h-screen bg-slate-900 p-6">
      <Suspense fallback={<div>Loading dashboard...</div>}>
        <Switch>
          <Match when={role() === 'receptionist'}>
            <ReceptionistDashboard />
          </Match>
          <Match when={role() === 'dentist'}>
            <DentistDashboard />
          </Match>
          <Match when={role() === 'manager'}>
            <ManagerDashboard />
          </Match>
          <Match when={role() === 'admin'}>
            <AdministratorDashboard />
          </Match>
          <Match when={role() === 'user'}>
            <ReceptionistDashboard />
          </Match>
          <Match when={true}>
            <ReceptionistDashboard />
          </Match>
        </Switch>
      </Suspense>
    </div>
  )
}
