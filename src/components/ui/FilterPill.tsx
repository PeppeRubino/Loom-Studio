import classNames from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { useLanguage } from '@/features/i18n/useLanguage';

interface FilterPillProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange: (value?: string) => void;
}

export const FilterPill = ({ label, options, value, onChange }: FilterPillProps) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const selectedLabel = value ? options.find((o) => o.value === value)?.label ?? value : undefined;

  return (
    <div className="relative">
      <button
        type="button"
        className={classNames(
          'flex items-center gap-2 rounded-full border border-[rgba(0,0,0,0.04)] bg-white/55 px-3.5 py-[5px] text-sm text-[#0f172a] shadow-[0_8px_20px_-20px_rgba(15,23,42,0.3)] transition duration-[120ms]',
          open && 'ring-2 ring-[#c1124d]/20'
        )}
        onClick={() => setOpen((p) => !p)}
      >
        <span>{selectedLabel || label}</span>
        <ChevronDown size={14} className="text-[#94a3b8]" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 z-20 mt-2 w-44 rounded-2xl border border-[rgba(255,255,255,0.6)] bg-white/80 p-2 shadow-lg "
          >
            <button
              className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#475569] hover:bg-[#f8fafc]"
              onClick={() => {
                onChange(undefined);
                setOpen(false);
              }}
            >
              {t('common.all', 'Tutti')}
            </button>
            {options.map((option) => (
              <button
                key={option.value}
                className={classNames(
                  'w-full rounded-xl px-3 py-2 text-left text-sm text-[#0f172a] hover:bg-[#f8fafc]',
                  value === option.value && 'bg-[#f1f5f9] font-semibold'
                )}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
