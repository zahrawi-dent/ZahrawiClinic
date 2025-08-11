import { type Component, createMemo, Show } from 'solid-js';
import { useParams, useNavigate } from '@tanstack/solid-router';
import { Collections } from '../../types/pocketbase-types';
import { useDetailQuery, useDeleteMutation } from '../../data';
import { useRealtimeRecordSubscription } from '../../optimistic/optimistic-hooks';

const ArrowLeftIcon = () => (
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const PatientDetailPage: Component = () => {
  const navigate = useNavigate();
  const params = useParams({ from: '/patients/$id' });
  const patientId = () => params().id;

  const patientQuery = useDetailQuery(Collections.Patients, patientId());
  const deletePatient = useDeleteMutation(Collections.Patients);

  const patient = createMemo(() => patientQuery.data);

  // Live updates for this patient
  useRealtimeRecordSubscription(Collections.Patients, patientId());

  return (
    <div class="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: '/patients' })}
            class="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon />
            <span>Back</span>
          </button>
        </div>
        <div class="text-right">
          <h1 class="text-2xl font-bold text-gray-900">Patient Profile</h1>
          <p class="text-sm text-gray-600">Overview and actions</p>
        </div>
      </div>

      <Show when={patientQuery.isLoading}>
        <div class="flex items-center justify-center h-64 text-gray-600">Loading...</div>
      </Show>
      <Show when={patientQuery.isError}>
        <div class="flex items-center justify-center h-64 text-red-600">Failed to load patient</div>
      </Show>

      <Show when={patient()}>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Identity card */}
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center gap-4">
              <div class={`h-16 w-16 rounded-full flex items-center justify-center text-lg font-semibold ${patient()!.sex === 'male' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                {(patient()!.first_name[0] + patient()!.last_name[0]).toUpperCase()}
              </div>
              <div>
                <div class="text-xl font-semibold text-gray-900">{patient()!.first_name} {patient()!.last_name}</div>
                <div class="text-sm text-gray-500">ID: {patient()!.id}</div>
              </div>
            </div>

            <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div class="text-gray-600">Date of birth</div>
                <div class="font-medium">{new Date(patient()!.dob).toLocaleDateString()}</div>
              </div>
              <div>
                <div class="text-gray-600">Sex</div>
                <div>
                  <span class={`px-2 py-1 rounded-full text-xs font-medium ${patient()!.sex === 'male' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                    {patient()!.sex}
                  </span>
                </div>
              </div>
              <div>
                <div class="text-gray-600">Phone</div>
                <div class="font-medium">{patient()!.phone}</div>
              </div>
              <div>
                <div class="text-gray-600">Email</div>
                <div class="font-medium">{patient()!.email || '-'}</div>
              </div>
              <div class="sm:col-span-2">
                <div class="text-gray-600">Address</div>
                <div class="font-medium">{patient()!.address || '-'}</div>
              </div>
            </div>
          </div>

          {/* Right: Actions & future sections */}
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick actions</h2>
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
                <button
                  class="px-4 py-2 rounded-md border text-sm text-red-600 hover:bg-red-50"
                  onClick={() => deletePatient.mutate({ id: patientId() })}
                >
                  Delete patient
                </button>
              </div>
            </div>

            {/* Placeholder for history sections to make UI richer */}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 class="text-md font-semibold text-gray-900 mb-2">Upcoming appointments</h3>
                <div class="text-sm text-gray-500">No upcoming appointments</div>
              </div>
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 class="text-md font-semibold text-gray-900 mb-2">Recent treatments</h3>
                <div class="text-sm text-gray-500">No recent treatments</div>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default PatientDetailPage;
