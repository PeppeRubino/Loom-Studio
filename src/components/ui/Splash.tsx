import { useLanguage } from '@/features/i18n/useLanguage';

export const Splash = () => {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent">
      <div className="flex items-center gap-3 rounded-[20px] border border-[rgba(0,0,0,0.06)] bg-white/80 px-4 py-3 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur-sm">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#0f172a] border-t-transparent" aria-hidden />
        <div className="text-sm font-medium text-[#0f172a]">{t('splash.loading')}</div>
      </div>
    </div>
  );
};
