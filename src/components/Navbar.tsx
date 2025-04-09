import { A, useLocation } from '@solidjs/router';

export function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav class="bg-white shadow-sm">
      <div class="container mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <span class="text-xl font-bold text-primary-600">Dental Management</span>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <A
                href="/"
                class={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/')
                    ? 'border-primary-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                Dashboard
              </A>
              <A
                href="/patients"
                class={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/patients')
                    ? 'border-primary-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                Patients
              </A>
              <A
                href="/appointments"
                class={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/appointments')
                    ? 'border-primary-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                Appointments
              </A>
              <A
                href="/treatments"
                class={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/treatments')
                    ? 'border-primary-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                Treatments
              </A>
              <A
                href="/payments"
                class={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/payments')
                    ? 'border-primary-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                Payments
              </A>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 
