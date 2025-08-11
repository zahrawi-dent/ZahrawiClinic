import { type Component, createSignal } from 'solid-js';
import { useNavigate } from '@tanstack/solid-router';
import { Collections } from '../../types/pocketbase-types';
import { useCreateMutation } from '../../data';

const NewPatientPage: Component = () => {
  const navigate = useNavigate();
  const createPatient = useCreateMutation(Collections.Patients);
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    try {
      setIsSubmitting(true);
      await createPatient.mutateAsync({
        data: {
          first_name: String(data.get('first_name') || ''),
          last_name: String(data.get('last_name') || ''),
          phone: String(data.get('phone') || ''),
          email: String(data.get('email') || ''),
          address: String(data.get('address') || ''),
          dob: String(data.get('dob') || new Date().toISOString()),
          sex: String(data.get('sex') || 'male') as any,
          primary_clinic: [],
        },
      } as any);
      navigate({ to: '/patients' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div class="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900">New Patient</h1>
          <p class="text-gray-600">Create a patient profile to start tracking appointments and treatments</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">First name</label>
            <input name="first_name" required class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Last name</label>
            <input name="last_name" required class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input name="phone" required class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input name="address" class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date of birth</label>
            <input name="dob" type="date" class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Sex</label>
            <select name="sex" class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-4">
          <button type="button" onClick={() => navigate({ to: '/patients' })} class="rounded-md border px-4 py-2 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={isSubmitting()} class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
            {isSubmitting() ? 'Saving…' : 'Save patient'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewPatientPage;
