import { createMemo } from 'solid-js';
import { useAuth } from './AuthContext';

export function useRequireRole(requiredRole: 'user' | 'admin') {
  const { authState } = useAuth();

  const hasRequiredRole = createMemo(() => {
    const auth = authState();
    if (!auth.isAuthenticated || !auth.user) return false;

    if (requiredRole === 'admin') {
      return auth.role === 'admin';
    }

    // Users have access to user-level content, admins have access to everything
    return auth.role === 'user' || auth.role === 'admin';
  });

  const canAccess = createMemo(() => {
    const auth = authState();
    return !auth.isLoading && auth.isAuthenticated && hasRequiredRole();
  });

  return {
    canAccess,
    hasRequiredRole,
    authState,
  };
}
