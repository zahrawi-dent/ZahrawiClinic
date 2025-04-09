import { A } from '@solidjs/router'
import { JSX } from 'solid-js'

export default function NotFound(): JSX.Element {
  return (
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="text-center">
          <h1 class="text-9xl font-extrabold text-indigo-600">404</h1>
          <h2 class="mt-4 text-3xl font-medium text-gray-900">Page not found</h2>
          <p class="mt-3 text-lg text-gray-500">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div class="text-center">
            <p class="text-sm text-gray-500">
              The page you are looking for might have been removed, had its name changed, or is
              temporarily unavailable.
            </p>

            <div class="mt-6 space-y-4">
              <A
                href="/"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Home
              </A>

              <A
                href="/settings"
                class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to Settings
              </A>
            </div>
          </div>
        </div>

        <div class="mt-8 text-center">
          <p class="text-sm text-gray-500">
            Need assistance?{' '}
            <a href="/support" class="font-medium text-indigo-600 hover:text-indigo-500">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
