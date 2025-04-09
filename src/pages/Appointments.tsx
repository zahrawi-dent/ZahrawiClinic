import { createSignal, onMount, For, JSX } from 'solid-js'
import { Appointment } from '../types'
import { mockApi } from '../mockApi'
import { A } from '@solidjs/router'

// TODO: appoints and view schedule. what to use?
export default function Appointments(): JSX.Element {
  const [appointments, setAppointments] = createSignal<Appointment[]>([])
  const [selectedDate, setSelectedDate] = createSignal(new Date().toISOString().split('T')[0])
  const [view, setView] = createSignal('day') // day, week, month

  onMount(async () => {
    const data = await mockApi.getAllAppointments()
    setAppointments(data)
  })

  // Filter appointments for the selected date
  const filteredAppointments = (): Appointment[] => {
    return appointments().filter((appointment) => {
      const appointmentDate = new Date(appointment.time).toISOString().split('T')[0]
      return appointmentDate === selectedDate()
    })
  }

  const hours = Array.from({ length: 10 }, (_, i) => i + 8) // 8 AM to 5 PM

  return (
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Appointments</h1>
        <A
          href="/new-appointment"
          class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          New Appointment
        </A>
      </div>

      {/* Calendar Controls */}
      <div class="bg-white shadow rounded-lg p-4 mb-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-2">
            <button class="p-1 rounded hover:bg-gray-100">
              <svg
                class="h-6 w-6 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <input
              type="date"
              value={selectedDate()}
              onInput={(e) => setSelectedDate(e.target.value)}
              class="border border-gray-300 rounded-md p-2"
            />
            <button class="p-1 rounded hover:bg-gray-100">
              <svg
                class="h-6 w-6 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          <div class="flex rounded-md shadow-sm">
            <button
              onClick={() => setView('day')}
              class={`px-4 py-2 text-sm font-medium ${view() === 'day'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-300 rounded-l-md`}
            >
              Day
            </button>
            <button
              onClick={() => setView('week')}
              class={`px-4 py-2 text-sm font-medium ${view() === 'week'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                } border-t border-b border-r border-gray-300`}
            >
              Week
            </button>
            <button
              onClick={() => setView('month')}
              class={`px-4 py-2 text-sm font-medium ${view() === 'month'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                } border-t border-b border-r border-gray-300 rounded-r-md`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Day View */}
      {view() === 'day' && (
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="border-b border-gray-200 px-6 py-2">
            <h2 class="text-lg font-medium text-gray-900">
              {new Date(selectedDate()).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h2>
          </div>

          <div class="divide-y divide-gray-200">
            <For each={hours}>
              {(hour) => {
                const timeAppointments = filteredAppointments().filter((appointment) => {
                  const appointmentHour = new Date(appointment.time).getHours()
                  return appointmentHour === hour
                })

                return (
                  <div class="flex">
                    <div class="w-20 py-4 text-right pr-4 text-sm text-gray-500 border-r border-gray-200">
                      {hour % 12 || 12} {hour >= 12 ? 'PM' : 'AM'}
                    </div>
                    <div class="flex-1 p-2 relative min-h-16">
                      {timeAppointments.length > 0 ? (
                        <div class="space-y-2">
                          <For each={timeAppointments}>
                            {(appointment) => (
                              <div class="bg-indigo-100 border-l-4 border-indigo-500 p-2 rounded-r">
                                <div class="flex justify-between items-start">
                                  <div>
                                    <p class="font-medium text-indigo-700">
                                      {new Date(appointment.time).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}{' '}
                                      - {appointment.patientName}
                                    </p>
                                    <p class="text-sm text-gray-600">{appointment.procedure}</p>
                                  </div>
                                  <span
                                    class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${appointment.status === 'Confirmed'
                                      ? 'bg-green-100 text-green-800'
                                      : appointment.status === 'Pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                      }`}
                                  >
                                    {appointment.status}
                                  </span>
                                </div>
                              </div>
                            )}
                          </For>
                        </div>
                      ) : (
                        <div class="h-full flex items-center justify-center">
                          <p class="text-sm text-gray-400">No appointments</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              }}
            </For>
          </div>
        </div>
      )}

      {/* Week View Placeholder */}
      {view() === 'week' && (
        <div class="bg-white shadow rounded-lg p-6">
          <p class="text-gray-500 text-center">Week view calendar would appear here</p>
        </div>
      )}

      {/* Month View Placeholder */}
      {view() === 'month' && (
        <div class="bg-white shadow rounded-lg p-6">
          <p class="text-gray-500 text-center">Month view calendar would appear here</p>
        </div>
      )}
    </div>
  )
}
