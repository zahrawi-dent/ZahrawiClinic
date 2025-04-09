import { createRootRoute } from '@tanstack/solid-router'
import { TanStackRouterDevtools } from '@tanstack/solid-router-devtools'
import MainLayout from 'src/layouts/MainLayout'
import NotFound from 'src/pages/NotFound'

export const Route = createRootRoute({
  component: () =>
    <>

      <MainLayout />
      <TanStackRouterDevtools />
    </>,


  // <>
  //   <div class="p-2 flex gap-2">
  //     <Link to="/" class="[&.active]:font-bold">
  //       Home
  //     </Link>{' '}
  //     <Link to="/about" class="[&.active]:font-bold">
  //       About
  //     </Link>
  //   </div>
  //   <hr />
  //   <Outlet />
  // </>

  notFoundComponent: () => <NotFound />
})
