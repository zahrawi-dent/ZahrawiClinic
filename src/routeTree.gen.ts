/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as AboutImport } from './routes/about'
import { Route as IndexImport } from './routes/index'
import { Route as PatientsIndexImport } from './routes/patients/index'
import { Route as AppointmentsIndexImport } from './routes/appointments/index'
import { Route as PatientsPatientIdImport } from './routes/patients/$patientId'
import { Route as AppointmentsNewImport } from './routes/appointments/new'
import { Route as PatientsIdEditImport } from './routes/patients/$id.edit'
import { Route as PatientsIdDentalChartImport } from './routes/patients/$id.dental-chart'

// Create/Update Routes

const AboutRoute = AboutImport.update({
  id: '/about',
  path: '/about',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const PatientsIndexRoute = PatientsIndexImport.update({
  id: '/patients/',
  path: '/patients/',
  getParentRoute: () => rootRoute,
} as any)

const AppointmentsIndexRoute = AppointmentsIndexImport.update({
  id: '/appointments/',
  path: '/appointments/',
  getParentRoute: () => rootRoute,
} as any)

const PatientsPatientIdRoute = PatientsPatientIdImport.update({
  id: '/patients/$patientId',
  path: '/patients/$patientId',
  getParentRoute: () => rootRoute,
} as any)

const AppointmentsNewRoute = AppointmentsNewImport.update({
  id: '/appointments/new',
  path: '/appointments/new',
  getParentRoute: () => rootRoute,
} as any)

const PatientsIdEditRoute = PatientsIdEditImport.update({
  id: '/patients/$id/edit',
  path: '/patients/$id/edit',
  getParentRoute: () => rootRoute,
} as any)

const PatientsIdDentalChartRoute = PatientsIdDentalChartImport.update({
  id: '/patients/$id/dental-chart',
  path: '/patients/$id/dental-chart',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/solid-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/about': {
      id: '/about'
      path: '/about'
      fullPath: '/about'
      preLoaderRoute: typeof AboutImport
      parentRoute: typeof rootRoute
    }
    '/appointments/new': {
      id: '/appointments/new'
      path: '/appointments/new'
      fullPath: '/appointments/new'
      preLoaderRoute: typeof AppointmentsNewImport
      parentRoute: typeof rootRoute
    }
    '/patients/$patientId': {
      id: '/patients/$patientId'
      path: '/patients/$patientId'
      fullPath: '/patients/$patientId'
      preLoaderRoute: typeof PatientsPatientIdImport
      parentRoute: typeof rootRoute
    }
    '/appointments/': {
      id: '/appointments/'
      path: '/appointments'
      fullPath: '/appointments'
      preLoaderRoute: typeof AppointmentsIndexImport
      parentRoute: typeof rootRoute
    }
    '/patients/': {
      id: '/patients/'
      path: '/patients'
      fullPath: '/patients'
      preLoaderRoute: typeof PatientsIndexImport
      parentRoute: typeof rootRoute
    }
    '/patients/$id/dental-chart': {
      id: '/patients/$id/dental-chart'
      path: '/patients/$id/dental-chart'
      fullPath: '/patients/$id/dental-chart'
      preLoaderRoute: typeof PatientsIdDentalChartImport
      parentRoute: typeof rootRoute
    }
    '/patients/$id/edit': {
      id: '/patients/$id/edit'
      path: '/patients/$id/edit'
      fullPath: '/patients/$id/edit'
      preLoaderRoute: typeof PatientsIdEditImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/about': typeof AboutRoute
  '/appointments/new': typeof AppointmentsNewRoute
  '/patients/$patientId': typeof PatientsPatientIdRoute
  '/appointments': typeof AppointmentsIndexRoute
  '/patients': typeof PatientsIndexRoute
  '/patients/$id/dental-chart': typeof PatientsIdDentalChartRoute
  '/patients/$id/edit': typeof PatientsIdEditRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/about': typeof AboutRoute
  '/appointments/new': typeof AppointmentsNewRoute
  '/patients/$patientId': typeof PatientsPatientIdRoute
  '/appointments': typeof AppointmentsIndexRoute
  '/patients': typeof PatientsIndexRoute
  '/patients/$id/dental-chart': typeof PatientsIdDentalChartRoute
  '/patients/$id/edit': typeof PatientsIdEditRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/about': typeof AboutRoute
  '/appointments/new': typeof AppointmentsNewRoute
  '/patients/$patientId': typeof PatientsPatientIdRoute
  '/appointments/': typeof AppointmentsIndexRoute
  '/patients/': typeof PatientsIndexRoute
  '/patients/$id/dental-chart': typeof PatientsIdDentalChartRoute
  '/patients/$id/edit': typeof PatientsIdEditRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/about'
    | '/appointments/new'
    | '/patients/$patientId'
    | '/appointments'
    | '/patients'
    | '/patients/$id/dental-chart'
    | '/patients/$id/edit'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/about'
    | '/appointments/new'
    | '/patients/$patientId'
    | '/appointments'
    | '/patients'
    | '/patients/$id/dental-chart'
    | '/patients/$id/edit'
  id:
    | '__root__'
    | '/'
    | '/about'
    | '/appointments/new'
    | '/patients/$patientId'
    | '/appointments/'
    | '/patients/'
    | '/patients/$id/dental-chart'
    | '/patients/$id/edit'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AboutRoute: typeof AboutRoute
  AppointmentsNewRoute: typeof AppointmentsNewRoute
  PatientsPatientIdRoute: typeof PatientsPatientIdRoute
  AppointmentsIndexRoute: typeof AppointmentsIndexRoute
  PatientsIndexRoute: typeof PatientsIndexRoute
  PatientsIdDentalChartRoute: typeof PatientsIdDentalChartRoute
  PatientsIdEditRoute: typeof PatientsIdEditRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AboutRoute: AboutRoute,
  AppointmentsNewRoute: AppointmentsNewRoute,
  PatientsPatientIdRoute: PatientsPatientIdRoute,
  AppointmentsIndexRoute: AppointmentsIndexRoute,
  PatientsIndexRoute: PatientsIndexRoute,
  PatientsIdDentalChartRoute: PatientsIdDentalChartRoute,
  PatientsIdEditRoute: PatientsIdEditRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/about",
        "/appointments/new",
        "/patients/$patientId",
        "/appointments/",
        "/patients/",
        "/patients/$id/dental-chart",
        "/patients/$id/edit"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/about": {
      "filePath": "about.tsx"
    },
    "/appointments/new": {
      "filePath": "appointments/new.tsx"
    },
    "/patients/$patientId": {
      "filePath": "patients/$patientId.tsx"
    },
    "/appointments/": {
      "filePath": "appointments/index.tsx"
    },
    "/patients/": {
      "filePath": "patients/index.tsx"
    },
    "/patients/$id/dental-chart": {
      "filePath": "patients/$id.dental-chart.tsx"
    },
    "/patients/$id/edit": {
      "filePath": "patients/$id.edit.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
