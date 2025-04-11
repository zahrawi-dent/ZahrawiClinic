import { For } from "solid-js";
import { Appointment, getAppointmentStatusColor } from "src/types/appointments";
import { formatTime, generateCalendarDays } from "src/utils/appointmetUtils";
import { actions, selectors } from "./appointmentStore";

export default function CalendarView() {
  return (

    <div class="bg-white shadow-md rounded-lg p-4">
      <div class="mb-4 text-center">
        <p class="text-lg font-medium text-gray-900">
          Calendar view placeholder - Would integrate with a full calendar component
        </p>
        <p class="text-sm text-gray-500 mt-2">
          This would normally display a fully interactive calendar with appointment slots
        </p>
      </div>
      <div class="grid grid-cols-7 gap-2 text-center mb-2">
        <For each={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}>
          {(day) => <div class="py-2 bg-gray-50 font-medium">{day}</div>}
        </For>
      </div>
      <div class="grid grid-cols-7 gap-2 min-h-[400px]">
        <For each={generateCalendarDays()}>
          {(day) => (
            <div class={`border rounded-md p-1 ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'} min-h-[80px]`}>
              <div class={`text-right mb-1 ${day.isToday ? 'bg-indigo-100 text-indigo-800 rounded-full w-6 h-6 flex items-center justify-center ml-auto' : ''}`}>
                {day.day}
              </div>
              <div class="space-y-1">
                <For each={selectors.getAppointmentsForDay(day.fullDate)}>
                  {(appt: Appointment) => (
                    <div
                      class={`text-xs p-1 rounded truncate cursor-pointer ${getAppointmentStatusColor(appt.status).bg || 'bg-gray-100'} ${getAppointmentStatusColor(appt.status).text || 'text-gray-800'}`}
                      onClick={() => actions.selectAppointment(appt)}
                    >
                      {formatTime(appt.date)} - {appt.expand?.patient.firstName + appt.expand?.patient.lastName}
                    </div>
                  )}
                </For>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
