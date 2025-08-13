import { createFileRoute } from '@tanstack/solid-router'
import {
  type Component,
  createSignal,
  createMemo,
  Show,
} from 'solid-js';
import { createForm } from '@tanstack/solid-form';
import { useNavigate, useParams } from '@tanstack/solid-router';
import { Collections } from '../../types/pocketbase-types';
import { useDetailQuery, useUpdateMutation, useDeleteMutation } from '../../data';
import { useRealtimeRecordSubscription } from '../../optimistic/optimistic-hooks';

export const Route = createFileRoute('/appointments/$appointmentId')({
  component: AppointmentDetailPage,
})



// ===== ICONS =====
const ArrowLeftIcon = () => (
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const CalendarIcon = () => (
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserIcon = () => (
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const StethoscopeIcon = () => (
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const BuildingIcon = () => (
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const EditIcon = () => (
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const SaveIcon = () => (
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const CancelIcon = () => (
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TrashIcon = () => (
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// ===== UTILITY FUNCTIONS =====
const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDate = (dateTime: string) => {
  return new Date(dateTime).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled': return 'bg-blue-100 text-blue-800';
    case 'confirmed': return 'bg-green-100 text-green-800';
    case 'in-progress': return 'bg-yellow-100 text-yellow-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    case 'no_show': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'scheduled': return 'Scheduled';
    case 'confirmed': return 'Confirmed';
    case 'in-progress': return 'In Progress';
    case 'completed': return 'Completed';
    case 'cancelled': return 'Cancelled';
    case 'no_show': return 'No Show';
    default: return status;
  }
};

// ===== COMPONENTS =====
const InfoCard = (props: {
  title: string;
  children: any;
  icon?: Component;
  class?: string;
}) => (
  <div class={`rounded-lg shadow-sm border border-gray-200 p-6 ${props.class || ''}`}>
    <div class="flex items-center gap-3 mb-4">
      {props.icon && <props.icon />}
      <h3 class="text-lg font-semibold text-gray-100">{props.title}</h3>
    </div>
    {props.children}
  </div>
);

const InfoRow = (props: { label: string; value: string | number; class?: string }) => (
  <div class={`flex items-center justify-between py-2 ${props.class || ''}`}>
    <span class="text-sm font-medium text-gray-200">{props.label}</span>
    <span class="text-sm text-gray-100">{props.value}</span>
  </div>
);

const EditForm = (props: {
  appointment: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) => {
  const form = createForm(() => ({
    defaultValues: {
      start_time: props.appointment.start_time ? new Date(props.appointment.start_time).toISOString().slice(0, 16) : '',
      end_time: props.appointment.end_time ? new Date(props.appointment.end_time).toISOString().slice(0, 16) : '',
      reason: props.appointment.reason || '',
      notes: props.appointment.notes || '',
      status: props.appointment.status || 'scheduled',
    },
    onSubmit: async ({ value }) => {
      props.onSave(value);
    },
  }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      class="space-y-4"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-200 mb-1">Start Time</label>
          <form.Field name="start_time" validators={{ onChange: ({ value }) => (!value ? 'Start time is required' : undefined) }}>
            {(field) => (
              <input
                type="datetime-local"
                value={field().state.value || ''}
                onInput={(e) => field().handleChange(e.currentTarget.value)}
                onBlur={field().handleBlur}
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </form.Field>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-200 mb-1">End Time</label>
          <form.Field name="end_time">
            {(field) => (
              <input
                type="datetime-local"
                value={field().state.value || ''}
                onInput={(e) => field().handleChange(e.currentTarget.value)}
                onBlur={field().handleBlur}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </form.Field>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-200 mb-1">Reason</label>
        <form.Field name="reason">
          {(field) => (
            <input
              type="text"
              value={field().state.value || ''}
              onInput={(e) => field().handleChange(e.currentTarget.value)}
              onBlur={field().handleBlur}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </form.Field>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-200 mb-1">Status</label>
        <form.Field name="status">
          {(field) => (
            <select
              value={field().state.value || 'scheduled'}
              onInput={(e) => field().handleChange(e.currentTarget.value)}
              onBlur={field().handleBlur}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          )}
        </form.Field>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-200 mb-1">Notes</label>
        <form.Field name="notes">
          {(field) => (
            <textarea
              value={field().state.value || ''}
              onInput={(e) => field().handleChange(e.currentTarget.value)}
              onBlur={field().handleBlur}
              rows={4}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </form.Field>
      </div>

      <div class="flex items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={props.isLoading}
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <SaveIcon />
          <span>{props.isLoading ? 'Saving...' : 'Save Changes'}</span>
        </button>

        <button
          type="button"
          onClick={props.onCancel}
          disabled={props.isLoading}
          class="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <CancelIcon />
          <span>Cancel</span>
        </button>
      </div>
    </form>
  );
};

// ===== MAIN COMPONENT =====
function AppointmentDetailPage() {
  const navigate = useNavigate();
  const appointmentId = () => Route.useParams()().appointmentId

  const [isEditing, setIsEditing] = createSignal(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false);

  const appointmentQuery = useDetailQuery(Collections.Appointments, appointmentId());
  const updateAppointment = useUpdateMutation(Collections.Appointments);
  const deleteAppointment = useDeleteMutation(Collections.Appointments);

  const appointment = createMemo(() => appointmentQuery.data);

  // Live updates for this appointment
  useRealtimeRecordSubscription(Collections.Appointments, appointmentId());

  const handleSave = async (data: any) => {
    try {
      await updateAppointment.mutateAsync({
        id: appointmentId(),
        data: {
          start_time: new Date(data.start_time).toISOString(),
          end_time: data.end_time ? new Date(data.end_time).toISOString() : undefined,
          reason: data.reason,
          notes: data.notes,
          status: data.status,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update appointment:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAppointment.mutateAsync({ id: appointmentId() });
      navigate({ to: '/appointments' });
    } catch (error) {
      console.error('Failed to delete appointment:', error);
    }
  };

  const getDuration = () => {
    if (!appointment()?.start_time || !appointment()?.end_time) return 'Not specified';

    const start = new Date(appointment()!.start_time);
    const end = new Date(appointment()!.end_time);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));

    if (diffMins < 60) return `${diffMins} minutes`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div class="min-h-screen p-6">
      {/* Header */}
      <div class="mb-6">
        <button
          onClick={() => navigate({ to: '/appointments' })}
          class="flex items-center gap-2 text-gray-300 hover:text-gray-100 mb-4 transition-colors"
        >
          <ArrowLeftIcon />
          <span>Back to Appointments</span>
        </button>

        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-200">Appointment Details</h1>
            <p class="text-gray-200">View and manage appointment information</p>
          </div>

          <div class="flex items-center gap-3">
            <Show when={!isEditing()}>
              <button
                onClick={() => setIsEditing(true)}
                class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <EditIcon />
                <span>Edit</span>
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                class="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <TrashIcon />
                <span>Delete</span>
              </button>
            </Show>
          </div>
        </div>
      </div>

      <Show when={appointmentQuery.isLoading}>
        <div class="flex items-center justify-center h-64">
          <div class="text-lg text-gray-200">Loading appointment...</div>
        </div>
      </Show>

      <Show when={appointmentQuery.isError}>
        <div class="flex items-center justify-center h-64">
          <div class="text-lg text-red-600">Failed to load appointment</div>
        </div>
      </Show>

      <Show when={appointment()}>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div class="lg:col-span-2 space-y-6">
            {/* Appointment Information */}
            <InfoCard title="Appointment Information" icon={CalendarIcon}>
              <Show when={!isEditing()}>
                <div class="space-y-3">
                  <InfoRow label="Date" value={formatDate(appointment()!.start_time)} />
                  <InfoRow label="Start Time" value={formatTime(appointment()!.start_time)} />
                  <InfoRow label="End Time" value={appointment()!.end_time ? formatTime(appointment()!.end_time) : 'Not specified'} />
                  <InfoRow label="Duration" value={getDuration()} />
                  <InfoRow label="Reason" value={appointment()!.reason || 'Not specified'} />
                  <div class="flex items-center justify-between py-2">
                    <span class="text-sm font-medium text-gray-600">Status</span>
                    <span class={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment()!.status)}`}>
                      {getStatusLabel(appointment()!.status)}
                    </span>
                  </div>
                </div>
              </Show>

              <Show when={isEditing()}>
                <EditForm
                  appointment={appointment()}
                  onSave={handleSave}
                  onCancel={() => setIsEditing(false)}
                  isLoading={updateAppointment.isPending}
                />
              </Show>
            </InfoCard>

            {/* Notes */}
            <Show when={appointment()!.notes && !isEditing()}>
              <InfoCard title="Notes" icon={StethoscopeIcon}>
                <p class="text-gray-700 whitespace-pre-wrap">{appointment()!.notes}</p>
              </InfoCard>
            </Show>

            {/* Patient Information */}
            <InfoCard title="Patient Information" icon={UserIcon}>
              <div class="space-y-3">
                <InfoRow label="Patient ID" value={appointment()!.patient?.[0] || 'Not assigned'} />
                <InfoRow label="Name" value="Patient details would be loaded here" />
                <InfoRow label="Phone" value="Phone number would be loaded here" />
                <InfoRow label="Email" value="Email would be loaded here" />
              </div>
            </InfoCard>

            {/* Doctor Information */}
            <InfoCard title="Doctor Information" icon={StethoscopeIcon}>
              <div class="space-y-3">
                <InfoRow label="Doctor ID" value={appointment()!.doctor?.[0] || 'Not assigned'} />
                <InfoRow label="Name" value="Doctor details would be loaded here" />
                <InfoRow label="Specialty" value="Specialty would be loaded here" />
              </div>
            </InfoCard>

            {/* Clinic Information */}
            <InfoCard title="Clinic Information" icon={BuildingIcon}>
              <div class="space-y-3">
                <InfoRow label="Clinic ID" value={appointment()!.clinic?.[0] || 'Not assigned'} />
                <InfoRow label="Name" value="Clinic details would be loaded here" />
                <InfoRow label="Address" value="Address would be loaded here" />
                <InfoRow label="Phone" value="Phone would be loaded here" />
              </div>
            </InfoCard>
          </div>

          {/* Sidebar */}
          <div class="space-y-6">
            {/* Quick Actions */}
            <InfoCard title="Quick Actions">
              <div class="space-y-3">
                <button class="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div class="font-medium text-gray-100">Reschedule</div>
                  <div class="text-sm text-gray-200">Change appointment time</div>
                </button>

                <button class="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div class="font-medium text-gray-100">Send Reminder</div>
                  <div class="text-sm text-gray-200">Send SMS/Email reminder</div>
                </button>

                <button class="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div class="font-medium text-gray-100">View History</div>
                  <div class="text-sm text-gray-200">Patient appointment history</div>
                </button>
              </div>
            </InfoCard>
          </div>
        </div>
      </Show>

      {/* Delete Confirmation Modal */}
      <Show when={showDeleteConfirm()}>
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40" aria-hidden="true"></div>
          <div class="relative w-full max-w-md rounded-lg bg-slate-800 p-6 shadow-xl">
            <div class="text-center">
              <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                <TrashIcon />
              </div>
              <h3 class="text-lg font-semibold text-gray-100 mb-2">Delete Appointment</h3>
              <p class="text-gray-300 mb-6">
                Are you sure you want to delete this appointment? This action cannot be undone.
              </p>

              <div class="flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteAppointment.isPending}
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deleteAppointment.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};
