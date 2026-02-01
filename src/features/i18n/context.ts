import { createContext } from 'react';

export type Locale = 'IT' | 'EN' | 'JA' | 'RU';

export interface LanguageContextValue {
  locale: Locale;
  setLocale: (value: Locale) => void;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}

const defaultT: LanguageContextValue['t'] = (key, fallback, vars) => {
  const template = fallback ?? key;
  if (!vars) return template;
  return Object.keys(vars).reduce((acc, k) => acc.replace(`{${k}}`, String(vars[k])), template);
};

export const LanguageContext = createContext<LanguageContextValue>({
  locale: 'IT',
  setLocale: () => {},
  t: defaultT,
});
