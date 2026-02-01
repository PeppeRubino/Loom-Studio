import { useContext } from 'react';

import { useAuthContext } from '@/features/auth/AuthProvider';

export const useAuth = () => {
  const ctx = useContext(useAuthContext());
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
