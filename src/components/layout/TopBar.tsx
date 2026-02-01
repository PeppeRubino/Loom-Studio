import { Home, Menu, CircleUser } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

import { useLanguage } from '@/features/i18n/useLanguage';

interface TopBarProps {
  onOpenSettings: () => void;
}

export const TopBar = ({ onOpenSettings }: TopBarProps) => {
  const lang = useLanguage();
  const { locale, setLocale } = lang;
  const languages: Array<'IT' | 'EN' | 'JA' | 'RU'> = ['IT', 'EN', 'JA', 'RU'];
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-[var(--glass-border)] px-6 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-6 items-center gap-2 rounded-full bg-white/80 px-3 text-xs font-semibold leading-none text-[#0f172a] shadow-sm">
          <span className="whitespace-nowrap">
            Loom <span className="font-medium text-[#64748b]">Studio</span>
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 text-[#475569]">
        <div className="relative" ref={langRef}>
          <button
            type="button"
            onClick={() => setLangOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#0f172a] shadow-sm transition duration-[120ms] hover:-translate-y-[1px]"
          >
            {locale}
          </button>
          {langOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-2xl border border-[rgba(0,0,0,0.14)] bg-white p-2 shadow-[0_18px_38px_-22px_rgba(15,23,42,0.5)]">
              {languages.map((l) => (
                <button
                  key={l}
                  className={`block w-full rounded-xl px-3.5 py-2.5 text-[13px] font-semibold ${
                    l === locale ? 'bg-[#f7f7f8] text-[#0f172a]' : 'text-[#475569] hover:bg-[#f7f7f8]'
                  }`}
                  onClick={() => {
                    setLocale(l);
                    setLangOpen(false);
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>
        <Link
          to="/app"
          className="rounded-full bg-white/70 p-2 text-[#0f172a] shadow-sm hover:-translate-y-[1px] transition duration-[120ms]"
          aria-label={lang.t('nav.home', 'Home')}
        >
          <Home size={16} />
        </Link>
        <Link
          to="/app/profile"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0f172a] shadow-sm hover:-translate-y-[1px] transition duration-[120ms]"
          >
          <CircleUser size={18} />
        </Link>
        <button
          type="button"
          onClick={onOpenSettings}
          className="h-8 w-8 rounded-full bg-white/70 text-[#475569] shadow-sm hover:-translate-y-[1px] hover:text-[#0f172a] transition duration-[120ms]"
        >
          <Menu size={16} className="mx-auto" />
        </button>
      </div>
    </header>
  );
};
