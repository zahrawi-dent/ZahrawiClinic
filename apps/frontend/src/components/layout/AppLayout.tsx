import { type Component, createMemo } from 'solid-js';
import { Sidebar, defaultNavItems } from '../Sidebar';
import { useAuth } from '../../auth/AuthContext';


export const AppSidebar: Component = () => {
  const { authState } = useAuth();

  const userProfile = createMemo(() => {
    const auth = authState();
    if (!auth.user) return undefined;

    return {
      name: auth.user.name || auth.user.email,
      email: auth.user.email,
      avatar: auth.user.avatar,
      role: auth.role === 'admin' ? 'Administrator' : 'User'
    };
  });

  return (
    <div class="flex flex-col h-full">
      <Sidebar
        items={defaultNavItems}
        userProfile={userProfile()}
      />
    </div>
  );
};

// const AppLayout: Component = () => {
//   return (
//     <div class="flex min-h-screen flex-col text-white">
//       <div class="flex flex-grow flex-col lg:flex-row">
//         <AppSidebar />
//         <main class="px-4 py-6 pt-16 lg:flex-1 lg:px-8">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// };
//
// export default AppLayout;

// appLayout

{/* <div class="min-h-screen bg-gray-50 text-gray-900 flex"> */ }
{/*   <AppSidebar /> */ }
{/*   <div class="flex-1 flex flex-col min-w-0"> */ }
{/*     <header class="sticky top-0 bg-white border-b px-4 md:px-6 py-3 flex items-center justify-between"> */ }
{/*       <h1 class="text-lg font-semibold">Zahrawi Clinic</h1> */ }
{/*     </header> */ }
{/*     <main class="flex-1 p-4 md:p-6"> */ }
{/*       <Outlet /> */ }
{/*     </main> */ }
{/*   </div> */ }
{/* </div> */ }


// const Breadcrumb: Component = () => {
//   const location = useLocation();
//   const segments = () => location().pathname.split('/').filter(Boolean);
//
//   const pathForIndex = (idx: number) => '/' + segments().slice(0, idx + 1).join('/');
//
//   return (
//     <nav aria-label="Breadcrumb" class="text-sm" role="navigation">
//       <ol class="flex items-center gap-2">
//         <li>
//           <Link to="/dashboard" class="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded px-1">
//             Home
//           </Link>
//         </li>
//         <For each={segments()}>
//           {(seg, i) => (
//             <li class="flex items-center gap-2">
//               <span aria-hidden="true" class="text-gray-400">/</span>
//               <Show when={i() < segments().length - 1} fallback={<span class="text-gray-900 font-medium capitalize">{seg.replaceAll('-', ' ')}</span>}>
//                 <Link
//                   to={pathForIndex(i())}
//                   class="capitalize text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded px-1"
//                 >
//                   {seg.replaceAll('-', ' ')}
//                 </Link>
//               </Show>
//             </li>
//           )}
//         </For>
//       </ol>
//     </nav>
//   );
// };
