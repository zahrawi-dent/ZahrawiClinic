import { UseQueryResult } from "@tanstack/solid-query";
import { PaginatedResult } from "src/operations";
import { Appointment } from "src/types/appointments";
import { actions, appointmentsStore, selectors } from "./appointmentStore";

export default function ViewTypeSelector(props: {
  appointmentsQuery: UseQueryResult<PaginatedResult<Appointment>, Error>;
}) {
  return (

    <div class="flex justify-between items-center pt-3 border-t border-gray-200">
      <div class="text-sm text-gray-500">
        {props.appointmentsQuery.isLoading
          ? 'Loading appointments...'
          : `${selectors.filteredAppointments().length} appointments found`}
      </div>
      <div class="inline-flex rounded-md shadow-sm">
        <button
          onClick={() => actions.setViewMode('list')}
          class={`px-4 py-2 text-sm font-medium rounded-l-md ${appointmentsStore.viewMode === 'list'
            ? 'bg-indigo-100 text-indigo-800 border-indigo-500'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            } border`}
        >
          List
        </button>
        <button
          onClick={() => actions.setViewMode('agenda')}
          class={`px-4 py-2 text-sm font-medium ${appointmentsStore.viewMode === 'agenda'
            ? 'bg-indigo-100 text-indigo-800 border-indigo-500'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            } border-t border-b`}
        >
          Agenda
        </button>
        <button
          onClick={() => actions.setViewMode('calendar')}
          class={`px-4 py-2 text-sm font-medium rounded-r-md ${appointmentsStore.viewMode === 'calendar'
            ? 'bg-indigo-100 text-indigo-800 border-indigo-500'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            } border`}
        >
          Calendar
        </button>
      </div>
    </div>
  )
}
