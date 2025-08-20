import { createRootRoute, Outlet, redirect } from '@tanstack/solid-router'
import { TanStackRouterDevtools } from '@tanstack/solid-router-devtools'
import { Sidebar, defaultNavItems } from '../components/Sidebar'
import { pb, PocketBaseContext } from '../lib/pocketbase'
import { QueryClientProvider } from '@tanstack/solid-query'
import { AuthProvider } from '../auth/AuthContext'
import { queryClient } from '../lib/queryClient'
import { NotFoundPage } from './-NotFoundPage'
import { Suspense, createMemo } from 'solid-js'
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
    const { authState } = authStore
    const userProfile = createMemo(() => {
      if (!authState.user) return undefined
      const user = authState.user
      return {
        id: user.id,
        name: user.name || user.email,
        email: user.email,
        avatar: user.avatar,
        role: authState.role,
      }
    })
    return (
      <>
        <PocketBaseContext.Provider value={pb}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <div class="bg-slate-900 flex min-h-screen flex-col text-white">
                <div class="flex flex-grow flex-col lg:flex-row">
                  {authState.isAuthenticated && authState.user ? (
                    <Sidebar items={defaultNavItems} userProfile={userProfile()} />
                  ) : null}
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
