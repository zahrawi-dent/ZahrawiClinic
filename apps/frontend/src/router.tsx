import { createRootRoute, createRoute, createRouter, RouterProvider, Outlet } from '@tanstack/solid-router';
import NotFoundPage from './pages/NotFoundPage.tsx';
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
import NewAppointmentPage from './pages/appointments/NewAppointmentPage.tsx';
import PatientDetailPage from './pages/patients/PatientDetailPage.tsx';
import NewPatientPage from './pages/patients/NewPatientPage.tsx';
import SettingsLayout from './pages/settings/SettingsLayout.tsx';
import SettingsHomePage from './pages/settings/SettingsHomePage.tsx';
import OrganizationSettingsPage from './pages/settings/OrganizationSettingsPage.tsx';
import ClinicsSettingsPage from './pages/settings/ClinicsSettingsPage.tsx';
import TreatmentsSettingsPage from './pages/settings/TreatmentsSettingsPage.tsx';

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
  notFoundComponent: NotFoundPage,
});

// Public routes (relative to root)
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

// Pathless app layout route
const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app',
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/',
  component: Dashboard,
});

// App-level routes
const patientsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'patients',
  component: PatientsListPage,
});

const patientDetailRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'patients/$id',
  component: PatientDetailPage,
});

const newPatientRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'patients/new',
  component: NewPatientPage,
});

const appointmentsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'appointments',
  component: AppointmentsPage,
});

const appointmentDetailRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'appointments/$id',
  component: AppointmentDetailPage,
});

const newAppointmentRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'appointments/new',
  component: NewAppointmentPage,
});

// // Settings layout route
const settingsLayoutRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  id: 'settings',
  component: SettingsLayout,
});
//
// // An index route is a route with no 'path' property
const settingsIndexRoute = createRoute({
  getParentRoute: () => settingsLayoutRoute,
  path: "settings",
  component: SettingsHomePage,
});
//
const settingsOrgRoute = createRoute({
  getParentRoute: () => settingsLayoutRoute,
  path: 'settings/organization',
  component: OrganizationSettingsPage,
});

const settingsClinicsRoute = createRoute({
  getParentRoute: () => settingsLayoutRoute,
  path: 'settings/clinics',
  component: ClinicsSettingsPage,
});

const settingsTreatmentsRoute = createRoute({
  getParentRoute: () => settingsLayoutRoute,
  path: 'settings/treatments',
  component: TreatmentsSettingsPage,
});

// The route tree structure remains the same
const routeTree = rootRoute.addChildren([
  loginRoute,
  signupRoute,
  adminLoginRoute,
  appLayoutRoute.addChildren([
    indexRoute, // Dashboard at /
    patientsRoute,
    patientDetailRoute,
    newPatientRoute,
    appointmentsRoute,
    appointmentDetailRoute,
    newAppointmentRoute,
    settingsLayoutRoute.addChildren([
      settingsIndexRoute, // Settings home at /settings
      settingsOrgRoute,
      settingsClinicsRoute,
      settingsTreatmentsRoute,
    ]),
  ]),
]);

export const router = createRouter({
  routeTree,
});

export function AppRouterProvider() {
  return <RouterProvider router={router} />;
}
