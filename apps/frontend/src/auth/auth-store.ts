// lib/auth-store.ts
import { createStore } from 'solid-js/store';
import { auth as authLayer } from '../data/auth';
import type { AuthState, AuthUser } from './auth-types';

class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// Create reactive auth store
function createAuthStore() {
  const [authState, setAuthState] = createStore<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    role: null,
  });

  // Initialize from auth data-layer snapshot
  const initializeAuth = () => {
    try {
      const { user, role } = authLayer.getSnapshot();

        setAuthState({
          user: user,
          isAuthenticated: !!user,
          isLoading: false,
          error: null,
          role: role,
        });
      
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to initialize authentication',
        role: null,
      });
    }
  };

  // Listen to auth data-layer changes
  authLayer.subscribe(() => {
    console.log('Auth state changed via data-layer');
    initializeAuth();
  });

  // Initialize on creation
  initializeAuth();

  const setLoading = (loading: boolean) => {
    setAuthState('isLoading', loading);
  };

  const setError = (error: string | null) => {
    setAuthState('error', error);
  };

  const clearError = () => {
    setAuthState('error', null);
  };

  return {
    authState,
    setLoading,
    setError,
    clearError,
    initializeAuth,
  };
}

export const authStore = createAuthStore();
