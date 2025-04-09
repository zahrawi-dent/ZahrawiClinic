import { createSignal, JSX } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import { User } from '../types'

export default function Login(props: { setUser: (user: User) => void }): JSX.Element {
  const [username, setUsername] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [error, setError] = createSignal('')
  const navigate = useNavigate()

  const handleLogin = (e: Event): void => {
    e.preventDefault()
    // Mock login - in a real app, this would validate with backend
    if (username() === 'demo' && password() === 'password') {
      props.setUser({ id: 1, name: 'Sarah Jones', role: 'Dentist', email: 'demo@dentacarepro.com' })
      navigate('/dashboard', { replace: true })
    } else {
      setError('Invalid credentials. Try demo/password')
    }
  }

  return (
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-700 to-purple-600 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">DentaCare Pro</h1>
          <p class="text-gray-600 mb-8">Dental Practice Management System</p>
        </div>

        {error() && <div class="bg-red-50 text-red-800 p-3 rounded mb-4 text-sm">{error()}</div>}

        <form onSubmit={handleLogin} class="space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username()}
              onInput={(e) => setUsername(e.target.value)}
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password()}
              onInput={(e) => setPassword(e.target.value)}
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <button
              type="submit"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>

          <div class="text-sm text-center text-gray-600">
            <p>Demo credentials: demo / password</p>
          </div>
        </form>
      </div>
    </div>
  )
}
