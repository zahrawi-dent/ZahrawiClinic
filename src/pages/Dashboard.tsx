import { createSignal, onMount, For, JSX } from 'solid-js'
import { Appointment } from '../types'
import { A } from '@solidjs/router'

export default function Dashboard(): JSX.Element {
  const [stats, setStats] = createSignal({
    appointmentsToday: 0,
    newPatients: 0,
    pendingPayments: 0,
    revenue: 0
  })

  const [recentAppointments, setRecentAppointments] = createSignal<Appointment[]>([])

  onMount(async () => {
    // In a real app, these would be separate API calls
    setStats({
      appointmentsToday: 12,
      newPatients: 3,
      pendingPayments: 8,
      revenue: 2850
    })

    const appointments: Appointment[] = await mockApi.getAllAppointments()
    setRecentAppointments(appointments.slice(0, 5))
  })

  return (
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Appointments Today"
          value={stats().appointmentsToday.toString()}
          color="bg-blue-500"
        />
        <StatCard
          title="New Patients (This Week)"
          value={stats().newPatients.toString()}
          color="bg-green-500"
        />
        <StatCard
          title="Pending Payments"
          value={stats().pendingPayments.toString()}
          color="bg-yellow-500"
        />
        <StatCard title="Today's Revenue" value={`$${stats().revenue}`} color="bg-purple-500" />
      </div>

      {/* Recent Appointments */}
      <div class="bg-white rounded-lg shadow mb-8">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Recent Appointments</h2>
        </div>
        <div class="p-6">
          <ul class="divide-y divide-gray-200">
            <For each={recentAppointments()}>
              {(appointment) => (
                <li class="py-4 flex justify-between">
                  <div>
                    <p class="font-medium text-gray-900">{appointment.patientName}</p>
                    <p class="text-sm text-gray-500">{appointment.procedure}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">
                      {new Date(appointment.time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p class="text-sm text-gray-500">
                      {new Date(appointment.time).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              )}
            </For>
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <A
              href="/new-appointment"
              class="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              New Appointment
            </A>
            <A
              href="register-patient"
              class="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              Register Patient
            </A>

            <A
              href="create-invoice"
              class="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Invoice
            </A>

            <A
              href="view-schedule"
              class="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
            >
              View Schedule
            </A>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard(props: { title: string; value: string; color: string }): JSX.Element {
  return (
    <div class="bg-white rounded-lg shadow">
      <div class="p-5">
        <div class="flex items-center">
          <div
            class={`flex-shrink-0 h-10 w-10 rounded-md ${props.color} flex items-center justify-center`}
          >
            <span class="text-white text-xl font-bold">+</span>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">{props.title}</p>
            <p class="text-2xl font-semibold text-gray-900">{props.value}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
