import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from '@/features/auth/AuthProvider';
import { LanguageProvider } from '@/features/i18n/LanguageProvider';
import { UserPreferencesSync } from '@/app/providers/UserPreferencesSync';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  const baseUrl = import.meta.env.BASE_URL as string | undefined;
  const basename = baseUrl && baseUrl !== '/' ? baseUrl.replace(/\/$/, '') : undefined;
  return (
    <BrowserRouter basename={basename}>
      <LanguageProvider>
        <AuthProvider>
          <UserPreferencesSync />
          {children}
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};
