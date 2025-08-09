// lib/auth-store.ts
import { createStore } from 'solid-js/store';
import { pb } from '../lib/pocketbase';
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

  // Initialize from PocketBase auth store
  const initializeAuth = () => {
    try {
      const isValid = pb.authStore.isValid;
      const record = pb.authStore.record;

      if (isValid && record) {
        const user: AuthUser = {
          id: record.id,
          email: record.email,
          name: record.name,
          avatar: record.avatar,
          verified: record.verified || false,
          created: record.created,
          updated: record.updated,
        };

        // Determine role based on collection
        const role = pb.authStore.token && pb.authStore.record?.collectionName === '_superusers'
          ? 'admin' as const
          : 'user' as const;

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          role,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          role: null,
        });
      }
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

  // Listen to PocketBase auth changes
  pb.authStore.onChange((token, model) => {
    console.log('Auth store changed:', { hasToken: !!token, hasModel: !!model });
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
