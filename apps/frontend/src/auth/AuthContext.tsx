import { createContext, useContext, type ParentComponent, onMount } from 'solid-js';
import { useQueryClient } from '@tanstack/solid-query';
import { auth as authLayer } from '../data/auth';
import { authStore } from './auth-store';
import type { AuthContextValue, LoginCredentials, RegisterData } from './auth-types';

const AuthContext = createContext<AuthContextValue>();

export const AuthProvider: ParentComponent = (props) => {
  const queryClient = useQueryClient();
  const { authState, setLoading, setError, clearError, initializeAuth } = authStore;

  // Validation helpers
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    return errors;
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      clearError();
      setLoading(true);

      // Validate input
      if (!validateEmail(credentials.email)) {
        throw new Error('Please enter a valid email address');
      }
      if (!credentials.password) {
        throw new Error('Password is required');
      }

      await authLayer.login(credentials.email.toLowerCase().trim(), credentials.password);

      // Invalidate all queries to refresh data with new auth context
      queryClient.invalidateQueries();

      console.log('Login successful');
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Login failed. Please check your credentials.';

      console.error('Login error:', error);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const loginAsAdmin = async (email: string, password: string): Promise<void> => {
    try {
      clearError();
      setLoading(true);

      // Validate input
      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }
      if (!password) {
        throw new Error('Password is required');
      }

      await authLayer.loginAsAdmin(email.toLowerCase().trim(), password);

      queryClient.invalidateQueries();
      console.log('Admin login successful');
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Admin login failed. Please check your credentials.';

      console.error('Admin login error:', error);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      clearError();
      setLoading(true);

      // Validate input
      if (!validateEmail(data.email)) {
        throw new Error('Please enter a valid email address');
      }

      const passwordErrors = validatePassword(data.password);
      if (passwordErrors.length > 0) {
        throw new Error(passwordErrors.join('. '));
      }

      if (data.password !== data.passwordConfirm) {
        throw new Error('Passwords do not match');
      }

      if (data.name && data.name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }

      // Create user
      const userData = {
        email: data.email.toLowerCase().trim(),
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        name: data.name?.trim() || '',
      };

      await authLayer.register(userData.email, userData.password, userData.name);

      queryClient.invalidateQueries();
      console.log('Registration and login successful');
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Registration failed. Please try again.';

      console.error('Registration error:', error);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);

      await authLayer.logout();

      // Clear all cached data
      queryClient.clear();

      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw here, always allow logout to complete
    } finally {
      setLoading(false);
    }
  };

  const refreshAuth = async (): Promise<void> => {
    try {
      setLoading(true);
      await authLayer.refreshAuth();

      console.log('Auth token refreshed');
    } catch (error) {
      console.error('Auth refresh failed:', error);
      // If refresh fails, clear the auth state
      await logout();
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh token before expiration
  onMount(() => {
    const setupAutoRefresh = () => {
      // Refresh token every 24 hours (adjust based on your token expiration)
      const interval = setInterval(() => {
        if (authState.isAuthenticated) {
          refreshAuth().catch(console.error);
        }
      }, 24 * 60 * 60 * 1000); // 24 hours

      return () => clearInterval(interval);
    };

    const cleanup = setupAutoRefresh();

    // Cleanup on unmount
    return cleanup;
  });

  const contextValue: AuthContextValue = {
    authState: () => authState,
    login,
    loginAsAdmin,
    register,
    logout,
    clearError,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value= { contextValue } >
    { props.children }
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
