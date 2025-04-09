import { useNavigate } from '@solidjs/router'
import { createEffect, createSignal, JSX } from 'solid-js'
import Login from '../pages/Login'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import { User } from '../types'

// <div
//   class={`bg-indigo-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${props.isOpen ? 'translate-x-0' : '-translate-x-full'
//     } md:relative md:translate-x-0 transition duration-200 ease-in-out z-10`}
// >
export default function MainLayout(props: { children: JSX.Element }): JSX.Element {
  const [user, setUser] = createSignal<User | null>(null)
  const navigate = useNavigate()

  // make a fake user for now

  setUser({ id: 1, name: 'Sarah Jones', role: 'Dentist', email: '8oK8Q@example.com' })

  // Initialize mock data
  createEffect(() => {
    // initializeMockApi();
  })

  const logout = (): void => {
    setUser(null)
    // make a fake user
    navigate('/login', { replace: true })
  }

  return (
    <div class="min-h-screen bg-gray-50">
      {user() ? (
        <div class="flex h-screen">
          {/* Sidebar */}
          <Sidebar logout={logout} />

          {/* Main content */}
          <div class="flex-1 overflow-auto">
            <header class="bg-white shadow">
              <div class="px-6 py-4 flex justify-between items-center">
                <h2 class="text-xl font-semibold text-gray-800">Welcome, Dr. {user()?.name}</h2>
                <div class="flex items-center">
                  <span class="mr-4 text-sm text-gray-600">{new Date().toLocaleDateString()}</span>
                  <Header name={user()?.name} />
                </div>
              </div>
            </header>

            <main class="p-6">{props.children}</main>
          </div>
        </div>
      ) : (
        <Login setUser={setUser} />
      )}
    </div>
  )
}
