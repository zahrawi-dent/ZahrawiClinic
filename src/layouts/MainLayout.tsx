import { createSignal, JSX, onMount } from 'solid-js'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import { Navigate, Outlet, useNavigate } from '@tanstack/solid-router'
import LoginPage from 'src/pages/Authenication/Login'
import { restoreConnection, logout } from 'src/services/pocketbase'

// <div
//   class={`bg-indigo-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${props.isOpen ? 'translate-x-0' : '-translate-x-full'
//     } md:relative md:translate-x-0 transition duration-200 ease-in-out z-10`}
// >
export default function MainLayout(): JSX.Element {
  // const [user, setUser] = createSignal<User | null>(null)
  const navigate = useNavigate()

  const [isConnected, setIsConnected] = createSignal(false);
  const [isInitializing, setIsInitializing] = createSignal(true);

  onMount(() => {
    // Check if we have stored connection settings
    const connected = restoreConnection();
    setIsConnected(connected);
    setIsInitializing(false);
    // if connected get user name
  });


  // make a fake user for now

  // setUser({ id: 1, name: 'Sarah Jones', role: 'Dentist', email: '8oK8Q@example.com' })


  const handleLogout = () => {
    logout();
    setIsConnected(false)
    navigate({ to: '/login' }).catch(console.error);
  };

  return (
    <div class="min-h-screen bg-gray-50">
      {isConnected() ? (
        <div class="flex h-screen">
          {/* Sidebar */}
          <Sidebar logout={handleLogout} />

          {/* Main content */}
          <div class="flex-1 overflow-auto">
            <header class="bg-white shadow">
              <div class="px-6 py-4 flex justify-between items-center">
                <h2 class="text-xl font-semibold text-gray-800">Welcome, Dr. l</h2>
                <div class="flex items-center">
                  <span class="mr-4 text-sm text-gray-600">{new Date().toLocaleDateString()}</span>
                  <Header name='l' />
                </div>
              </div>
            </header>

            <main class="p-6">
              <Outlet />
            </main>
          </div>
        </div>
      ) : (
        // TODO: navigate to login
        <LoginPage onConnect={() => setIsConnected(true)} />
      )}
    </div>
  )
};


