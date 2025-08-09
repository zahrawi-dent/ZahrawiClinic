export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  passwordConfirm: string;
  name?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  verified: boolean;
  created: string;
  updated: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  role: 'user' | 'admin' | null;
}

export interface AuthContextValue {
  authState: () => AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginAsAdmin: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
}
