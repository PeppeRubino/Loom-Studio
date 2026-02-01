import { type ReactNode, useEffect, useMemo, useState, useCallback, createContext } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth';

import type { AuthContextValue, AuthState, AuthUser } from '@/features/auth/context';
import { getFirebaseAuth, isFirebaseEnabled } from '@/lib/firebase';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const mapFirebaseUser = (user: User): AuthUser => ({
  name: user.displayName || 'Utente',
  email: user.email || 'ospite@local',
  picture: user.photoURL || undefined,
  provider: user.providerData?.[0]?.providerId === 'password' ? 'email' : user.isAnonymous ? 'local' : 'google',
  uid: user.uid,
});

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [state, setState] = useState<AuthState>({ user: null, loading: isFirebaseEnabled, error: undefined });
  const auth = isFirebaseEnabled ? getFirebaseAuth() : null;

  useEffect(() => {
    if (!auth) {
      return;
    }
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        const mapped = mapFirebaseUser(user);
        setState({ user: mapped, loading: false });
        if (mapped.provider !== 'local' && mapped.uid) {
          import('@/services/wardrobeStore')
            .then(({ loadUserTierFromFirestore }) => loadUserTierFromFirestore(mapped.uid!))
            .then((tier) => {
              setState((prev) => {
                if (!prev.user || prev.user.uid !== mapped.uid) return prev;
                return { ...prev, user: { ...prev.user, tier } };
              });
            })
            .catch(() => {
              // ignore, default is 'standard'
            });
        }
      } else {
        setState({ user: null, loading: false });
      }
    });
    return () => unsub();
  }, [auth]);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      setState({ user: null, loading: false, error: 'Configura Firebase per usare Google.' });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: undefined }));
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      console.error(error);
      setState({ user: null, loading: false, error: 'Errore durante il login Google.' });
    }
  }, [auth]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      if (!auth) {
        setState({ user: null, loading: false, error: 'Configura Firebase per usare email/password.' });
        return;
      }
      setState((prev) => ({ ...prev, loading: true, error: undefined }));
      try {
        await signInWithEmailAndPassword(auth, email, password);
        setState((prev) => ({ ...prev, loading: false }));
      } catch (error) {
        console.error(error);
        setState({ user: null, loading: false, error: 'Login email/password non riuscito.' });
      }
    },
    [auth]
  );

  const registerWithEmail = useCallback(
    async (email: string, password: string) => {
      if (!auth) {
        setState({ user: null, loading: false, error: 'Configura Firebase per usare email/password.' });
        return;
      }
      setState((prev) => ({ ...prev, loading: true, error: undefined }));
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        setState((prev) => ({ ...prev, loading: false }));
      } catch (error) {
        console.error(error);
        setState({ user: null, loading: false, error: 'Registrazione non riuscita.' });
      }
    },
    [auth]
  );

  const signInAsGuest = useCallback(async () => {
    if (!auth) {
      setState({ user: { name: 'Ospite', email: 'guest@example.com', provider: 'local' }, loading: false });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: undefined }));
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error(error);
      setState({ user: null, loading: false, error: 'Login ospite non riuscito.' });
    }
  }, [auth]);

  const signOut = useCallback(async () => {
    if (!auth) {
      setState({ user: null, loading: false });
      return;
    }
    await fbSignOut(auth);
    setState({ user: null, loading: false });
  }, [auth]);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, signInWithGoogle, signInAsGuest, signInWithEmail, registerWithEmail, signOut }),
    [signInAsGuest, signInWithEmail, registerWithEmail, signInWithGoogle, signOut, state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => AuthContext;
