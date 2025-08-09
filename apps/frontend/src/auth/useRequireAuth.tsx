// import { useNavigate } from '@solidjs/router'; // If using Solid Router
import { createEffect } from 'solid-js';
import { useAuth } from './AuthContext';

export function useRequireAuth(redirectTo: string = '/login') {
  const { authState } = useAuth();
  // Uncomment if using router
  // const navigate = useNavigate();

  createEffect(() => {
    const auth = authState();
    if (!auth.isLoading && !auth.isAuthenticated) {
      console.log('User not authenticated, redirecting to:', redirectTo);
      // navigate(redirectTo);
    }
  });

  return authState;
}
