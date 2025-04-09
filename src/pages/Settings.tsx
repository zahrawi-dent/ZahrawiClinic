import { createSignal, JSX } from 'solid-js'

export default function Settings(): JSX.Element {
  const [clinicInfo, setClinicInfo] = createSignal({
    name: 'DentaCare Pro Clinic',
    address: '123 Healthcare Blvd, Medical District, NY 10001',
    phone: '(555) 123-4567',
    email: 'contact@dentacarepro.com',
    website: 'www.dentacarepro.com',
    hours: '9:00 AM - 6:00 PM, Monday to Friday'
  })

  const [notificationSettings, setNotificationSettings] = createSignal({
    emailAppointmentReminders: true,
    smsAppointmentReminders: true,
    emailBillingNotifications: true,
    smsBillingNotifications: false
  })

  const handleClinicInfoChange = (field: string, value: string): void => {
    setClinicInfo({ ...clinicInfo(), [field]: value })
  }

  const handleNotificationSettingChange = (
    field: keyof ReturnType<typeof notificationSettings>
  ): void => {
    setNotificationSettings({
      ...notificationSettings(),
      [field]: !notificationSettings()[field]
    })
  }

  return (
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>

      <div class="space-y-8">
        {/* Clinic Information */}
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Clinic Information</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label for="clinic-name" class="block text-sm font-medium text-gray-700">
                  Clinic Name
                </label>
                <input
                  type="text"
                  id="clinic-name"
                  value={clinicInfo().name}
                  onInput={(e) => handleClinicInfoChange('name', e.target.value)}
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label for="clinic-phone" class="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="text"
                  id="clinic-phone"
                  value={clinicInfo().phone}
                  onInput={(e) => handleClinicInfoChange('phone', e.target.value)}
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label for="clinic-email" class="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="clinic-email"
                  value={clinicInfo().email}
                  onInput={(e) => handleClinicInfoChange('email', e.target.value)}
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label for="clinic-website" class="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="text"
                  id="clinic-website"
                  value={clinicInfo().website}
                  onInput={(e) => handleClinicInfoChange('website', e.target.value)}
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div class="sm:col-span-2">
                <label for="clinic-address" class="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  id="clinic-address"
                  rows="3"
                  value={clinicInfo().address}
                  onInput={(e) => handleClinicInfoChange('address', e.target.value)}
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div class="sm:col-span-2">
                <label for="clinic-hours" class="block text-sm font-medium text-gray-700">
                  Business Hours
                </label>
                <input
                  type="text"
                  id="clinic-hours"
                  value={clinicInfo().hours}
                  onInput={(e) => handleClinicInfoChange('hours', e.target.value)}
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div class="mt-6">
              <button
                type="button"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Notification Settings</h2>
          </div>
          <div class="p-6">
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">Email Appointment Reminders</h3>
                  <p class="text-sm text-gray-500">
                    Send email reminders for upcoming appointments to patients
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotificationSettingChange('emailAppointmentReminders')}
                  class={`${notificationSettings().emailAppointmentReminders ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  aria-pressed={notificationSettings().emailAppointmentReminders}
                >
                  <span class="sr-only">Enable email appointment reminders</span>
                  <span
                    class={`${notificationSettings().emailAppointmentReminders ? 'translate-x-5' : 'translate-x-0'} pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                  >
                    <span
                      class={`${notificationSettings().emailAppointmentReminders ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200'} absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                      aria-hidden="true"
                    >
                      <svg class="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                        <path
                          d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>
                    <span
                      class={`${notificationSettings().emailAppointmentReminders ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100'} absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                      aria-hidden="true"
                    >
                      <svg class="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                      </svg>
                    </span>
                  </span>
                </button>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">SMS Appointment Reminders</h3>
                  <p class="text-sm text-gray-500">
                    Send SMS text reminders for upcoming appointments to patients
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotificationSettingChange('smsAppointmentReminders')}
                  class={`${notificationSettings().smsAppointmentReminders ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  aria-pressed={notificationSettings().smsAppointmentReminders}
                >
                  <span class="sr-only">Enable SMS appointment reminders</span>
                  <span
                    class={`${notificationSettings().smsAppointmentReminders ? 'translate-x-5' : 'translate-x-0'} pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                  >
                    <span
                      class={`${notificationSettings().smsAppointmentReminders ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200'} absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                      aria-hidden="true"
                    >
                      <svg class="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                        <path
                          d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>
                    <span
                      class={`${notificationSettings().smsAppointmentReminders ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100'} absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                      aria-hidden="true"
                    >
                      <svg class="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                      </svg>
                    </span>
                  </span>
                </button>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">Email Billing Notifications</h3>
                  <p class="text-sm text-gray-500">
                    Send email notifications for billing updates and invoices
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotificationSettingChange('emailBillingNotifications')}
                  class={`${notificationSettings().emailBillingNotifications ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  aria-pressed={notificationSettings().emailBillingNotifications}
                >
                  <span class="sr-only">Enable email billing notifications</span>
                  <span
                    class={`${notificationSettings().emailBillingNotifications ? 'translate-x-5' : 'translate-x-0'} pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                  >
                    <span
                      class={`${notificationSettings().emailBillingNotifications ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200'} absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                      aria-hidden="true"
                    >
                      <svg class="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                        <path
                          d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>
                    <span
                      class={`${notificationSettings().emailBillingNotifications ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100'} absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                      aria-hidden="true"
                    >
                      <svg class="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                      </svg>
                    </span>
                  </span>
                </button>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">SMS Billing Notifications</h3>
                  <p class="text-sm text-gray-500">
                    Send SMS text notifications for billing updates and invoices
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotificationSettingChange('smsBillingNotifications')}
                  class={`${notificationSettings().smsBillingNotifications ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  aria-pressed={notificationSettings().smsBillingNotifications}
                >
                  <span class="sr-only">Enable SMS billing notifications</span>
                  <span
                    class={`${notificationSettings().smsBillingNotifications ? 'translate-x-5' : 'translate-x-0'} pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                  >
                    <span
                      class={`${notificationSettings().smsBillingNotifications ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200'} absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                      aria-hidden="true"
                    >
                      <svg class="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                        <path
                          d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>
                    <span
                      class={`${notificationSettings().smsBillingNotifications ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100'} absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                      aria-hidden="true"
                    >
                      <svg class="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                      </svg>
                    </span>
                  </span>
                </button>
              </div>

              <div class="mt-6">
                <button
                  type="button"
                  class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Notification Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Security Settings</h2>
          </div>
          <div class="p-6">
            <div class="space-y-6">
              <div>
                <h3 class="text-sm font-medium text-gray-900">Change Password</h3>
                <p class="text-sm text-gray-500 mb-4">
                  Ensure your account is using a secure password
                </p>

                <div class="space-y-4">
                  <div>
                    <label for="current-password" class="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="current-password"
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label for="new-password" class="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="new-password"
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label for="confirm-password" class="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirm-password"
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div class="mt-6">
                  <button
                    type="button"
                    class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              <div class="pt-6 border-t border-gray-200">
                <h3 class="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                <p class="text-sm text-gray-500 mb-4">
                  Add additional security to your account using two-factor authentication
                </p>

                <div class="flex items-center justify-between">
                  <button
                    type="button"
                    class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Enable Two-Factor Auth
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Data Management</h2>
          </div>
          <div class="p-6">
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">Backup Data</h3>
                  <p class="text-sm text-gray-500">
                    Schedule automatic backups of your clinic data
                  </p>
                </div>
                <button
                  type="button"
                  class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Configure Backups
                </button>
              </div>

              <div class="pt-6 border-t border-gray-200">
                <h3 class="text-sm font-medium text-gray-900">Data Export</h3>
                <p class="text-sm text-gray-500 mb-4">
                  Export your clinic data for record keeping or migration
                </p>

                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Export Patient Records
                  </button>
                  <button
                    type="button"
                    class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Export Financial Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
