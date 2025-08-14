import { createFileRoute } from '@tanstack/solid-router'
import { createMemo, Show, createSignal, For } from 'solid-js';
import { useParams, useNavigate } from '@tanstack/solid-router';
import { Collections, type DentalChartsRecord, type DentalChartsResponse, type PatientsResponse } from '../../types/pocketbase-types';
import { useDetailQuery, useDeleteMutation, useListQuery, useCreateMutation } from '../../data';
import { useRealtimeRecordSubscription } from '../../optimistic/optimistic-hooks';
import DentalChart, { type ChartState } from '../../components/dental/DentalChart';

export const Route = createFileRoute('/patients/$patientId')({
  component: PatientDetailPage,
})



const ArrowLeftIcon = () => (
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

function PatientDetailPage() {
  const navigate = useNavigate();

  const patientId = () => Route.useParams()().patientId

  const patientQuery = useDetailQuery(Collections.Patients, patientId());
  const deletePatient = useDeleteMutation(Collections.Patients);
  const chartsQuery = useListQuery(Collections.DentalCharts, { perPage: 10, filter: `patient.id = "${patientId()}"`, sort: '-created' })
  const createChart = useCreateMutation(Collections.DentalCharts)

  const patient = createMemo(() => patientQuery.data);

  // Live updates for this patient
  useRealtimeRecordSubscription(Collections.Patients, patientId());

  return (
    <div class="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: '/patients' })}
            class="flex items-center gap-2 text-gray-300 hover:text-gray-100"
          >
            <ArrowLeftIcon />
            <span>Back</span>
          </button>
        </div>
        <div class="text-right">
          <h1 class="text-2xl font-bold text-gray-100">Patient Profile</h1>
          <p class="text-sm text-gray-200">Overview and actions</p>
        </div>
      </div>

      <Show when={patientQuery.isLoading}>
        <div class="flex items-center justify-center h-64 text-gray-200">Loading...</div>
      </Show>
      <Show when={patientQuery.isError}>
        <div class="flex items-center justify-center h-64 text-red-600">Failed to load patient</div>
      </Show>

      <Show when={patient()}>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Identity card */}
          <div class="rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center gap-4">
              <div class={`h-16 w-16 rounded-full flex items-center justify-center text-lg font-semibold ${patient()!.sex === 'male' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                {(patient()!.first_name[0] + patient()!.last_name[0]).toUpperCase()}
              </div>
              <div>
                <div class="text-xl font-semibold text-gray-100">{patient()!.first_name} {patient()!.last_name}</div>
                <div class="text-sm text-gray-200">ID: {patient()!.id}</div>
              </div>
            </div>

            <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div class="text-gray-200">Date of birth</div>
                <div class="font-medium">{new Date(patient()!.dob).toLocaleDateString()}</div>
              </div>
              <div>
                <div class="text-gray-200">Sex</div>
                <div>
                  <span class={`px-2 py-1 rounded-full text-xs font-medium ${patient()!.sex === 'male' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                    {patient()!.sex}
                  </span>
                </div>
              </div>
              <div>
                <div class="text-gray-200">Phone</div>
                <div class="font-medium">{patient()!.phone}</div>
              </div>
              <div>
                <div class="text-gray-200">Email</div>
                <div class="font-medium">{patient()!.email || '-'}</div>
              </div>
              <div class="sm:col-span-2">
                <div class="text-gray-200">Address</div>
                <div class="font-medium">{patient()!.address || '-'}</div>
              </div>
            </div>
          </div>

          {/* Right: Actions & future sections */}
          <div class="lg:col-span-2 space-y-6">
            <div class="rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 class="text-lg font-semibold text-gray-100 mb-4">Quick actions</h2>
              <div class="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate({ to: `/appointments/new?patient=${patientId()}` })}
                  class="px-4 py-2 rounded-md border text-sm hover:bg-gray-50"
                >
                  Schedule appointment
                </button>
                <button
                  onClick={() => navigate({ to: `/treatments/new?patient=${patientId()}` })}
                  class="px-4 py-2 rounded-md border text-sm hover:bg-gray-50"
                >
                  Add treatment record
                </button>
                {/* New dental chart button moved into section */}
                <button
                  class="px-4 py-2 rounded-md border text-sm text-red-600 hover:bg-red-50"
                  onClick={() => deletePatient.mutate({ id: patientId() })}
                >
                  Delete patient
                </button>
              </div>
            </div>

            {/* Dental chart section */}
            <DentalChartsSection
              patient={patient()!}
              charts={chartsQuery.data?.items as any}
              isLoading={chartsQuery.isLoading}
              onCreate={async (initial: ChartState) => {
                await createChart.mutateAsync({ data: {
                  patient: [patientId()],
                  clinic: patient()!.primary_clinic,
                  doctor: [],
                  chart_type: 'initial' as any,
                  notation_system: 'universal' as any,
                  dentition: 'permanent' as any,
                  chart_state: initial as any,
                } as any })
              }}
            />

            {/* Placeholder for history sections to make UI richer */}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 class="text-md font-semibold text-gray-100 mb-2">Upcoming appointments</h3>
                <div class="text-sm text-gray-200">No upcoming appointments</div>
              </div>
              <div class="rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 class="text-md font-semibold text-gray-100 mb-2">Recent treatments</h3>
                <div class="text-sm text-gray-200">No recent treatments</div>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

function DentalChartsSection(props: { patient: PatientsResponse | undefined, charts: DentalChartsResponse[] | undefined, isLoading: boolean, onCreate: (initial: ChartState) => Promise<void> }) {
  const [showNewChart, setShowNewChart] = createSignal(false)

  const initialChartState: ChartState = { teeth: {} }

  return (
    <div class="rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-md font-semibold text-gray-100">Dental charts</h3>
        <button class="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50" onClick={() => setShowNewChart(true)}>New chart</button>
      </div>
      <Show when={!props.isLoading} fallback={<div class="text-gray-200">Loading charts…</div>}>
        <Show when={props.charts && props.charts.length > 0} fallback={<div class="text-sm text-gray-300">No charts yet</div>}>
          <div class="space-y-6">
            <For each={props.charts}>{(chart) => (
              <div class="rounded-md border border-gray-800 p-3">
                <div class="text-xs text-gray-400 mb-2">{chart.chart_type} • {chart.notation_system} • {chart.dentition} • {new Date((chart as any).created).toLocaleString()}</div>
                <DentalChart value={(chart as any).chart_state} readOnly />
              </div>
            )}</For>
          </div>
        </Show>
      </Show>

      <Show when={showNewChart()}>
        <div class="mt-4 rounded-md border border-blue-900 p-3 bg-slate-900">
          <div class="text-sm text-gray-100 mb-2">New dental chart</div>
          <DentalChart value={initialChartState} onChange={() => { /* captured in parent when saving */ }} />
          <div class="mt-3 flex items-center gap-2">
            <button class="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm" onClick={async () => { await props.onCreate(initialChartState); setShowNewChart(false) }}>Save</button>
            <button class="px-3 py-1.5 rounded-md border text-sm" onClick={() => setShowNewChart(false)}>Cancel</button>
          </div>
        </div>
      </Show>
    </div>
  )
}
