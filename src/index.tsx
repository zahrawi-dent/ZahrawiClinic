// import { render } from 'solid-js/web'
// import App from './App'
// import './index.css'
//
// render(() => <App />, document.getElementById('root'))

// import { render } from 'solid-js/web'
// import { Route, HashRouter } from '@solidjs/router'
// import MainLayout from './layouts/MainLayout'
// import { lazy } from 'solid-js'
// import './index.css'
// import RegisterPatient from './pages/Patients/RegisterPatient'
// import NewAppointment from './pages/Patients/NewAppointment'
// import CreateInvoice from './pages/Patients/CreateInvoice'
// import ViewSchedule from './pages/ViewSchedule'
// import { EditPatient } from './pages/Patients/EditPatient'
// import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'
//
// const Dashboard = lazy(() => import('./pages/Dashboard'))
// const PatientDetails = lazy(() => import('./pages/PatientDetails'))
// const Appointments = lazy(() => import('./pages/Appointments'))
// const Billing = lazy(() => import('./pages/Billing'))
// const Settings = lazy(() => import('./pages/Settings'))
// const Login = lazy(() => import('./pages/Login'))
// const PatientsList = lazy(() => import('./pages/PatientsList'))
// const NotFound = lazy(() => import('./pages/NotFound'))
//
// const rootElement = document.getElementById('root')
//
// const queryClient = new QueryClient();
//
// if (rootElement) {
//   render(
//     () => (
//
//       <QueryClientProvider client={queryClient}>
//         <HashRouter>
//           {/* Keep your routes the same */}
//           <Route path="/login" component={Login} />
//           <Route path="/" component={MainLayout}>
//             <Route path="/" component={Dashboard} /> {/* Default route */}
//             {/* Redundant dashboard route, "/" already handles it */}
//             {/* <Route path="/dashboard" component={Dashboard} /> */}
//             <Route path="/patients" component={PatientsList} />
//             <Route path="/patients/:id" component={PatientDetails} />
//             <Route path="/edit-patient/:id" component={EditPatient} />
//             <Route path="/appointments" component={Appointments} />
//             <Route path="/billing" component={Billing} />
//             <Route path="/settings" component={Settings} />
//             <Route path="/register-patient" component={RegisterPatient} />
//             <Route path="/new-appointment" component={NewAppointment} />
//             <Route path="/create-invoice" component={CreateInvoice} />
//             <Route path="/view-schedule" component={ViewSchedule} />
//             {/* <Route path="/view-schedule" component={ViewSchedule} /> */}
//           </Route>
//           <Route path="*" component={NotFound} />
//         </HashRouter>
//       </QueryClientProvider>
//     ),
//     rootElement
//   )
// } else {
//   console.error('Root element not found')
// }

import { render } from 'solid-js/web'
import { RouterProvider, createRouter } from '@tanstack/solid-router'
import './index.css'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/solid-router' {
  interface Register {
    router: typeof router
  }
}

const queryClient = new QueryClient();

// Render the app
const rootElement = document.getElementById('root')
if (!rootElement.innerHTML) {
  render(() =>

    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
    , rootElement)
}
