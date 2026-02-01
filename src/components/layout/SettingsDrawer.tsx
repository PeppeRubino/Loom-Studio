import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Plus, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { UndoToast } from '@/components/ui/UndoToast';
import { useCategorySettings } from '@/hooks/useCategorySettings';
import { useAuth } from '@/features/auth/useAuth';
import { useLanguage } from '@/features/i18n/useLanguage';
import {
  loadHoverInfoPreference,
  saveHoverInfoPreference,
  loadConfirmPreference,
  saveConfirmPreference,
} from '@/lib/storage';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsDrawer = ({ open, onClose }: SettingsDrawerProps) => {
  const { user } = useAuth();
  const profileKey = user?.email || user?.uid || 'guest';
  const { categories, addCategory, removeCategory } = useCategorySettings(profileKey);
  const { t } = useLanguage();
  const [newCategory, setNewCategory] = useState('');
  const [showHoverInfo, setShowHoverInfo] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(true);
  const [openCategories, setOpenCategories] = useState(false);
  const [openPrefs, setOpenPrefs] = useState(false);
  const [undoCategory, setUndoCategory] = useState<string | null>(null);
  const undoTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setShowHoverInfo(loadHoverInfoPreference(profileKey));
    setConfirmDelete(loadConfirmPreference(profileKey));
  }, [profileKey]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        profile?: string;
        confirmDelete?: boolean;
        showHoverInfo?: boolean;
      };
      if (!detail || detail.profile !== profileKey) return;
      if (typeof detail.confirmDelete === 'boolean') setConfirmDelete(detail.confirmDelete);
      if (typeof detail.showHoverInfo === 'boolean') setShowHoverInfo(detail.showHoverInfo);
    };
    window.addEventListener('ws-preferences-updated', handler as EventListener);
    return () => window.removeEventListener('ws-preferences-updated', handler as EventListener);
  }, [profileKey]);

  useEffect(() => {
    saveHoverInfoPreference(profileKey, showHoverInfo);
  }, [profileKey, showHoverInfo]);

  useEffect(() => {
    saveConfirmPreference(profileKey, confirmDelete);
  }, [profileKey, confirmDelete]);

  const handleAddCategory = () => {
    addCategory(newCategory.trim());
    setNewCategory('');
  };

  const handleRemoveCategory = (value: string) => {
    removeCategory(value);
    setUndoCategory(value);
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
    undoTimerRef.current = window.setTimeout(() => setUndoCategory(null), 4000);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex justify-end bg-black/25 "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="h-full w-full" onClick={onClose} aria-hidden />
            <motion.aside
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="relative z-50 flex h-full w-[360px] flex-col gap-4 border-l border-[#e2e8f0] bg-white p-5 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.55)]"
            >
            <header className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#0f172a]">{t('drawer.categories', 'Categorie personalizzate')}</p>
                <p className="text-[12px] text-[#64748b] sm:text-[13px]">
                  {t('drawer.profile', 'Profilo')}: {user?.email || 'ospite'}
                </p>
              </div>
              <button
                aria-label={t('common.close', 'Chiudi')}
                onClick={onClose}
                className="rounded-full p-2 text-[#94a3b8] hover:bg-[#f1f5f9]"
              >
                <X size={16} />
              </button>
            </header>

            <section className="rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)]">
              <button
                type="button"
                onClick={() => setOpenCategories((v) => !v)}
                className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold text-[#0f172a]"
              >
                <span>{t('drawer.categories', 'Categorie personalizzate')}</span>
                <ChevronDown
                  size={16}
                  className={`text-[#94a3b8] transition-transform duration-[120ms] ${openCategories ? '' : 'rotate-180'}`}
                />
              </button>
              {openCategories && (
                <div className="space-y-3 px-3 pb-3">
                  <Input
                    placeholder={t('drawer.newCategory', 'Nuova categoria (es. Maglietta)')}
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <Button variant="secondary" className="w-full rounded-full" onClick={handleAddCategory}>
                    <Plus size={14} className="mr-2" /> {t('drawer.addCategory', 'Aggiungi categoria')}
                  </Button>
                  <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                    {categories.map((category) => (
                      <div
                        key={category}
                        className="flex items-center justify-between rounded-2xl border border-[#e2e8f0] bg-white px-3 py-2 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)]"
                      >
                        <p className="text-sm font-semibold text-[#0f172a]">{category}</p>
                        <button
                          aria-label={`${t('common.remove', 'Rimuovi')} ${category}`}
                          onClick={() => handleRemoveCategory(category)}
                          className="rounded-full p-2 text-[#cbd5e1] hover:bg-[#f8fafc] hover:text-[#ef4444]"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)]">
              <button
                type="button"
                onClick={() => setOpenPrefs((v) => !v)}
                className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold text-[#0f172a]"
              >
                <span>{t('drawer.prefs', 'Preferenze card')}</span>
                <ChevronDown
                  size={16}
                  className={`text-[#94a3b8] transition-transform duration-[120ms] ${openPrefs ? '' : 'rotate-180'}`}
                />
              </button>
              {openPrefs && (
                <div className="space-y-2 px-3 pb-3">
                  <label className="flex items-center justify-between text-sm text-[#475569]">
                    <span>{t('drawer.askDelete', 'Chiedi conferma eliminazione')}</span>
                    <input
                      type="checkbox"
                      checked={confirmDelete}
                      onChange={(e) => setConfirmDelete(e.target.checked)}
                      className="accent-[#0f172a]"
                    />
                  </label>
                  <label className="flex items-center justify-between text-sm text-[#475569]">
                    <span>{t('drawer.hoverInfo', 'Mostra dettagli al passaggio')}</span>
                    <input
                      type="checkbox"
                      checked={showHoverInfo}
                      onChange={(e) => setShowHoverInfo(e.target.checked)}
                      className="accent-[#0f172a]"
                    />
                  </label>
                  <p className="text-[12px] text-[#94a3b8] sm:text-[13px]">
                    Disattiva se preferisci card minimal; la preferenza resta salvata sul profilo.
                  </p>
                </div>
              )}
            </section>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
      <UndoToast
        open={Boolean(undoCategory)}
        message={t('toast.categoryRemoved', 'Categoria rimossa')}
        actionLabel={t('toast.undo', 'Annulla')}
        onUndo={() => {
          if (!undoCategory) return;
          addCategory(undoCategory);
        }}
        onClose={() => setUndoCategory(null)}
      />
    </>
  );
};
