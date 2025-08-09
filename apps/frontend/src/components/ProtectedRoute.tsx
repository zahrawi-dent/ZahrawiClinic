import { Show, type ParentComponent } from 'solid-js';
import { useAuth } from '../auth/AuthContext';

interface ProtectedRouteProps {
  fallback?: any;
  requiredRole?: 'user' | 'admin';
}

export const ProtectedRoute: ParentComponent<ProtectedRouteProps> = (props) => {
  const { authState } = useAuth();

  return (
    <Show
      when={(() => {
        const auth = authState();
        if (auth.isLoading) return false;
        if (!auth.isAuthenticated) return false;

        // Check role if required
        if (props.requiredRole) {
          if (props.requiredRole === 'admin') {
            return auth.role === 'admin';
          }
          // For 'user' role, both 'user' and 'admin' can access
          return auth.role === 'user' || auth.role === 'admin';
        }

        return true;
      })()}
      fallback={props.fallback || <div>Access denied</div>}
    >
      {props.children}
    </Show>
  );
};

// import { Show, type JSX } from 'solid-js';
// import { isAuthenticated } from '../lib/pocketbase';
//
// interface ProtectedRouteProps {
//   children: JSX.Element;
//   fallback?: JSX.Element;
// }
//
// export function ProtectedRoute(props: ProtectedRouteProps) {
//   return (
//     <Show
//       when={isAuthenticated()}
//       fallback={props.fallback || <div>Please log in to access this page.</div>}
//     >
//       {props.children}
//     </Show>
//   );
// }
