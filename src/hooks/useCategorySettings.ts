import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = (profile: string) => `ws-categories-${profile}`;
const DEFAULTS = ['Maglietta', 'Felpa', 'Pantaloni', 'Giacca', 'Cappotto'];

const load = (profile: string): string[] => {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY(profile));
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as string[];
    return parsed.length ? parsed : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
};

const save = (profile: string, categories: string[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY(profile), JSON.stringify(categories));
    window.dispatchEvent(new CustomEvent('ws-categories-updated', { detail: { profile, categories } }));
  } catch {
    // ignore
  }
};

export const useCategorySettings = (profileKey: string) => {
  const [categories, setCategories] = useState<string[]>(DEFAULTS);

  useEffect(() => {
    setCategories(load(profileKey));
  }, [profileKey]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { profile?: string; categories?: unknown };
      if (!detail || detail.profile !== profileKey) return;
      if (!Array.isArray(detail.categories)) return;
      const next = detail.categories.filter((v) => typeof v === 'string') as string[];
      setCategories(next.length ? next : DEFAULTS);
    };
    window.addEventListener('ws-categories-updated', handler as EventListener);
    return () => window.removeEventListener('ws-categories-updated', handler as EventListener);
  }, [profileKey]);

  const addCategory = useCallback(
    (value: string) => {
      const clean = value.trim();
      if (!clean) return;
      setCategories((prev) => {
        if (prev.includes(clean)) return prev;
        const next = [...prev, clean].sort();
        save(profileKey, next);
        return next;
      });
    },
    [profileKey]
  );

  const removeCategory = useCallback(
    (value: string) => {
      setCategories((prev) => {
        const next = prev.filter((c) => c !== value);
        save(profileKey, next);
        return next.length ? next : DEFAULTS;
      });
    },
    [profileKey]
  );

  return { categories, addCategory, removeCategory };
};
