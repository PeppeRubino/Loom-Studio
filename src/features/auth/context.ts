export interface AuthUser {
  name: string;
  email: string;
  picture?: string;
  provider: 'google' | 'local' | 'email';
  uid?: string;
  tier?: 'standard' | 'pro' | 'premium';
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error?: string;
}

export interface AuthContextValue extends AuthState {
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => void;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}
