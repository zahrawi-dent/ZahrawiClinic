import { createRootRoute, createRoute, createRouter, RouterProvider, Outlet } from '@tanstack/solid-router';
import type { Component } from 'solid-js';
import { AuthProvider } from './auth/AuthContext';
import { QueryClientProvider } from '@tanstack/solid-query';
import { queryClient } from './lib/queryClient';
import { pb, PocketBaseContext } from './lib/pocketbase';
import AppLayout from './components/layout/AppLayout.tsx';
import LoginPage from './pages/auth/LoginPage.tsx';
import SignupPage from './pages/auth/SignupPage.tsx';
import AdminLoginPage from './pages/auth/AdminLoginPage.tsx';
import Dashboard from './pages/Dashboard.tsx';
import PatientsListPage from './pages/patients/PatientsListPage.tsx';
import AppointmentsPage from './pages/appointments/AppointmentsPage.tsx';
import AppointmentDetailPage from './pages/appointments/AppointmentDetailPage.tsx';

// Root shell with providers
const ProvidersShell: Component = () => {
  return (
    <PocketBaseContext.Provider value={pb}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      </QueryClientProvider>
    </PocketBaseContext.Provider>
  );
};

const rootRoute = createRootRoute({
  component: ProvidersShell,
});

// Public routes
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignupPage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin-login',
  component: AdminLoginPage,
});

// App protected layout
const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: AppLayout,
});

// App pages
const dashboardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/dashboard',
  component: Dashboard,
});

const patientsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/patients',
  component: PatientsListPage,
});

const appointmentsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/appointments',
  component: AppointmentsPage,
});

const appointmentDetailRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/appointments/$id',
  component: AppointmentDetailPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  signupRoute,
  adminLoginRoute,
  appLayoutRoute.addChildren([
    dashboardRoute,
    patientsRoute,
    appointmentsRoute,
    appointmentDetailRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
});

export function AppRouterProvider() {
  return <RouterProvider router={router} />;
}


