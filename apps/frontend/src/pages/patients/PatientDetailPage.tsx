import { type Component, createMemo, Show } from 'solid-js';
import { useParams, useNavigate } from '@tanstack/solid-router';
import { Collections } from '../../types/pocketbase-types';
import { useDetailQuery, useDeleteMutation } from '../../data';

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

  return (
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="mb-6">
        <button
          onClick={() => navigate({ to: '/patients' })}
          class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon />
          <span>Back to Patients</span>
        </button>
        <h1 class="text-2xl font-bold text-gray-900">Patient Details</h1>
      </div>

      <Show when={patientQuery.isLoading}>
        <div class="flex items-center justify-center h-64 text-gray-600">Loading...</div>
      </Show>
      <Show when={patientQuery.isError}>
        <div class="flex items-center justify-center h-64 text-red-600">Failed to load patient</div>
      </Show>

      <Show when={patient()}>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white rounded-lg border border-gray-200 p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div class="text-gray-600">Name</div>
                  <div class="font-medium">{patient()!.first_name} {patient()!.last_name}</div>
                </div>
                <div>
                  <div class="text-gray-600">DOB</div>
                  <div class="font-medium">{new Date(patient()!.dob).toLocaleDateString()}</div>
                </div>
                <div>
                  <div class="text-gray-600">Phone</div>
                  <div class="font-medium">{patient()!.phone}</div>
                </div>
                <div>
                  <div class="text-gray-600">Email</div>
                  <div class="font-medium">{patient()!.email || '-'}</div>
                </div>
                <div class="md:col-span-2">
                  <div class="text-gray-600">Address</div>
                  <div class="font-medium">{patient()!.address || '-'}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="bg-white rounded-lg border border-gray-200 p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-3">Actions</h2>
              <div class="space-y-2">
                <button
                  onClick={() => navigate({ to: `/appointments/new?patient=${patientId()}` })}
                  class="w-full rounded-lg border px-3 py-2 text-left hover:bg-gray-50"
                >
                  Schedule appointment
                </button>
                <button
                  onClick={() => navigate({ to: `/treatments/new?patient=${patientId()}` })}
                  class="w-full rounded-lg border px-3 py-2 text-left hover:bg-gray-50"
                >
                  Add treatment record
                </button>
                <button
                  class="w-full rounded-lg border border-red-200 text-red-600 px-3 py-2 text-left hover:bg-red-50"
                  onClick={() => deletePatient.mutate({ id: patientId() })}
                >
                  Delete patient
                </button>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default PatientDetailPage;
