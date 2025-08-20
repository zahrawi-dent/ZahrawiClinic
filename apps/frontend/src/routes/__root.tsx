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
  beforeLoad: async ({ location }) => {
    const publicPaths = ['/login', '/signup', '/admin-login']
    
    console.log('Root beforeLoad - Location:', location.pathname)
    console.log('Root beforeLoad - PocketBase auth valid:', pb.authStore.isValid)
    console.log('Root beforeLoad - PocketBase auth model:', pb.authStore.model)
    console.log('Root beforeLoad - PocketBase auth token:', pb.authStore.token ? 'Present' : 'Missing')
    console.log('Root beforeLoad - PocketBase auth record:', pb.authStore.record ? 'Present' : 'Missing')
    
    // Check PocketBase auth store directly for immediate authentication state
    const isAuthenticated = pb.authStore.isValid && pb.authStore.model
    
    console.log('Root beforeLoad - Is authenticated:', isAuthenticated)
    
    if (publicPaths.includes(location.pathname)) {
      console.log('Root beforeLoad - Public path, checking auth')
      // If the user is authenticated and visiting an auth route, redirect to the home page
      if (isAuthenticated) {
        console.log('Root beforeLoad - Redirecting authenticated user from public path to home')
        throw redirect({ to: '/' })
      }
      // If the user is not authenticated, allow the route
      console.log('Root beforeLoad - Allowing unauthenticated user to public path')
      return
    }

    // If the user is not authenticated and visiting a non-auth route, redirect to the login page
    if (!isAuthenticated) {
      console.log('Root beforeLoad - Redirecting unauthenticated user to login')
      throw redirect({ to: '/login' })
    }
    
    console.log('Root beforeLoad - User authenticated, initializing auth store')
    // Initialize auth store for the rest of the app
    await authStore.initializeAuth()
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
