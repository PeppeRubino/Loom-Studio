import { useContext } from 'react';

import { LanguageContext } from '@/features/i18n/context';

export const useLanguage = () => {
  return useContext(LanguageContext);
};
