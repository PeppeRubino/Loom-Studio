import { useEffect, useMemo, useRef } from 'react';

import { useAuth } from '@/features/auth/useAuth';
import { useLanguage } from '@/features/i18n/useLanguage';
import {
  loadConfirmPreference,
  loadHoverInfoPreference,
  loadProfileGender,
  saveConfirmPreference,
  saveHoverInfoPreference,
  saveProfileGender,
} from '@/lib/storage';

const DEFAULT_CATEGORIES = ['Maglietta', 'Felpa', 'Pantaloni', 'Giacca', 'Cappotto'];

type UserPreferences = {
  locale?: 'IT' | 'EN' | 'JA' | 'RU';
  confirmDelete?: boolean;
  showHoverInfo?: boolean;
  categories?: string[];
  profileGender?: 'female' | 'male';
};

const readLocalCategories = (profileKey: string): string[] => {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
  try {
    const raw = localStorage.getItem(`ws-categories-${profileKey}`);
    if (!raw) return DEFAULT_CATEGORIES;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return DEFAULT_CATEGORIES;
    const out = parsed.filter((v) => typeof v === 'string') as string[];
    return out.length ? out : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
};

const writeLocalCategories = (profileKey: string, categories: string[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`ws-categories-${profileKey}`, JSON.stringify(categories));
    window.dispatchEvent(new CustomEvent('ws-categories-updated', { detail: { profile: profileKey, categories } }));
  } catch {
    // ignore
  }
};

export const UserPreferencesSync = () => {
  const { user } = useAuth();
  const { locale, setLocale } = useLanguage();

  const profileKey = useMemo(() => user?.email || user?.uid || 'guest', [user?.email, user?.uid]);
  const uid = user?.provider !== 'local' ? user?.uid || null : null;
  const enabled = Boolean(uid);

  const hydratingRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !uid) return;

    let cancelled = false;
    hydratingRef.current = true;

    const hydrate = async () => {
      try {
        const store = await import('@/services/userPreferencesStore');
        const remote = await store.loadUserPreferences(uid);
        if (cancelled) return;

        if (remote) {
          if (remote.locale && remote.locale !== locale) setLocale(remote.locale);
          if (typeof remote.confirmDelete === 'boolean') saveConfirmPreference(profileKey, remote.confirmDelete);
          if (typeof remote.showHoverInfo === 'boolean') saveHoverInfoPreference(profileKey, remote.showHoverInfo);
          if (Array.isArray(remote.categories)) writeLocalCategories(profileKey, remote.categories);
          if (remote.profileGender) saveProfileGender(profileKey, remote.profileGender);
          return;
        }

        // No remote prefs yet: persist the current local ones once.
        if (!store.hasAnyLocalPreferences(profileKey)) {
          await store.saveUserPreferences(uid, { locale });
          return;
        }

        await store.saveUserPreferences(uid, {
          locale,
          confirmDelete: loadConfirmPreference(profileKey),
          showHoverInfo: loadHoverInfoPreference(profileKey),
          categories: readLocalCategories(profileKey),
          profileGender: loadProfileGender(profileKey),
        });
      } catch (err) {
        console.warn('[prefs] hydrate failed, keeping localStorage only', err);
      } finally {
        hydratingRef.current = false;
      }
    };

    hydrate();
    return () => {
      cancelled = true;
      hydratingRef.current = false;
    };
  }, [enabled, locale, profileKey, setLocale, uid]);

  useEffect(() => {
    if (!enabled || !uid) return;

    const scheduleSave = (patch: UserPreferences) => {
      if (hydratingRef.current) return;
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = window.setTimeout(async () => {
        try {
          const store = await import('@/services/userPreferencesStore');
          await store.saveUserPreferences(uid, patch);
        } catch (err) {
          console.warn('[prefs] save failed, keeping localStorage only', err);
        }
      }, 600);
    };

    const onPrefs = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        profile?: string;
        confirmDelete?: boolean;
        showHoverInfo?: boolean;
      };
      if (!detail || detail.profile !== profileKey) return;
      const patch: UserPreferences = {};
      if (typeof detail.confirmDelete === 'boolean') patch.confirmDelete = detail.confirmDelete;
      if (typeof detail.showHoverInfo === 'boolean') patch.showHoverInfo = detail.showHoverInfo;
      if (Object.keys(patch).length) scheduleSave(patch);
    };

    const onCategories = (e: Event) => {
      const detail = (e as CustomEvent).detail as { profile?: string; categories?: unknown };
      if (!detail || detail.profile !== profileKey) return;
      if (!Array.isArray(detail.categories)) return;
      scheduleSave({ categories: detail.categories.filter((v) => typeof v === 'string') as string[] });
    };

    const onProfile = (e: Event) => {
      const detail = (e as CustomEvent).detail as { profile?: string; gender?: unknown };
      if (!detail || detail.profile !== profileKey) return;
      if (detail.gender === 'female' || detail.gender === 'male') scheduleSave({ profileGender: detail.gender });
    };

    const onLang = (e: Event) => {
      const detail = (e as CustomEvent).detail as { locale?: unknown };
      if (!detail || !detail.locale) return;
      if (detail.locale === 'IT' || detail.locale === 'EN' || detail.locale === 'JA' || detail.locale === 'RU') {
        scheduleSave({ locale: detail.locale });
      }
    };

    window.addEventListener('ws-preferences-updated', onPrefs as EventListener);
    window.addEventListener('ws-categories-updated', onCategories as EventListener);
    window.addEventListener('ws-profile-updated', onProfile as EventListener);
    window.addEventListener('ws-lang-updated', onLang as EventListener);
    return () => {
      window.removeEventListener('ws-preferences-updated', onPrefs as EventListener);
      window.removeEventListener('ws-categories-updated', onCategories as EventListener);
      window.removeEventListener('ws-profile-updated', onProfile as EventListener);
      window.removeEventListener('ws-lang-updated', onLang as EventListener);
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [enabled, profileKey, uid]);

  return null;
};
