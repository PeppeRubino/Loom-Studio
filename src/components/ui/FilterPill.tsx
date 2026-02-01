import classNames from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useLanguage } from '@/features/i18n/useLanguage';

interface FilterPillProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange: (value?: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const FilterPill = ({ label, options, value, onChange, open: openProp, onOpenChange }: FilterPillProps) => {
  const { t } = useLanguage();
  const [openState, setOpenState] = useState(false);
  const isControlled = typeof openProp === 'boolean';
  const open = isControlled ? (openProp as boolean) : openState;

  const setOpen = useMemo(() => {
    return (next: boolean | ((prev: boolean) => boolean)) => {
      if (isControlled) {
        const prev = openProp as boolean;
        const resolved = typeof next === 'function' ? (next as (p: boolean) => boolean)(prev) : next;
        onOpenChange?.(resolved);
        return;
      }
      setOpenState((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: boolean) => boolean)(prev) : next;
        onOpenChange?.(resolved);
        return resolved;
      });
    };
  }, [isControlled, onOpenChange, openProp]);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuLeft, setMenuLeft] = useState<number | null>(null);
  const selectedLabel = value ? options.find((o) => o.value === value)?.label ?? value : undefined;
  const optionCount = options.length;

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: Event) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (!rootRef.current) return;
      if (!rootRef.current.contains(target)) setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, setOpen]);

  useEffect(() => {
    if (!open) return;

    const compute = () => {
      const root = rootRef.current;
      const btn = buttonRef.current;
      const menu = menuRef.current;
      if (!root || !btn || !menu) return;

      const rootRect = root.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      const menuWidth = menu.offsetWidth || 176;
      const gutter = 8;
      const viewportWidth = window.innerWidth;

      let left = btnRect.left + btnRect.width / 2 - menuWidth / 2;
      left = Math.max(gutter, Math.min(left, viewportWidth - menuWidth - gutter));
      setMenuLeft(left - rootRect.left);
    };

    const raf = window.requestAnimationFrame(compute);
    window.addEventListener('resize', compute);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', compute);
    };
  }, [label, open, optionCount, selectedLabel]);

  const menuStyle = useMemo(
    () => (menuLeft == null ? undefined : ({ left: menuLeft, right: 'auto' } as const)),
    [menuLeft]
  );

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
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
            ref={menuRef}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12 }}
            className="absolute z-20 mt-2 w-44 rounded-2xl border border-[#e2e8f0] bg-white p-2 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.55)]"
            style={menuStyle}
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
