import { createRootRoute, Outlet, redirect } from '@tanstack/solid-router'
import { TanStackRouterDevtools } from '@tanstack/solid-router-devtools'
import { AppSidebar } from '../components/layout/AppLayout'
import { pb, PocketBaseContext } from '../lib/pocketbase'
import { QueryClientProvider } from '@tanstack/solid-query'
import { AuthProvider } from '../auth/AuthContext'
import { queryClient } from '../lib/queryClient'
import { NotFoundPage } from './-NotFoundPage'
import { Suspense } from 'solid-js'
import RouteLoading from '../components/RouteLoading'
import { authStore } from '../auth/auth-store'

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const publicPaths = ['/login', '/signup', '/admin-login']
    const { authState } = authStore

    if (publicPaths.includes(location.pathname)) {
      // If the user is authenticated and visiting an auth route, redirect to the home page
      if (authState.isAuthenticated) {
        throw redirect({ to: '/' })
      }
      // If the user is not authenticated, allow the route
      return
    }

    // If the user is not authenticated and visiting a non-auth route, redirect to the login page
    if (!authState.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },

  notFoundComponent: () => NotFoundPage,
  component: () => {
    return (
      <>
        <PocketBaseContext.Provider value={pb}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <div class="bg-slate-900 flex min-h-screen flex-col text-white">
                <div class="flex flex-grow flex-col lg:flex-row">
                  <AppSidebar />
                  <main class="px-4 py-6 pt-16 lg:flex-1 lg:px-8">
                    <Suspense fallback={<RouteLoading />}>
                      <Outlet />
                    </Suspense>
                  </main>
                </div>
              </div>
            </AuthProvider>
          </QueryClientProvider>
        </PocketBaseContext.Provider>

        <TanStackRouterDevtools />
      </>
    )
  }
})
