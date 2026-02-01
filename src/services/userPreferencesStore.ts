import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

import { getFirebaseFirestore } from '@/lib/firebase';
import type { ProfileGender } from '@/lib/storage';
import type { Locale } from '@/features/i18n/context';

export interface UserPreferences {
  locale?: Locale;
  confirmDelete?: boolean;
  showHoverInfo?: boolean;
  categories?: string[];
  profileGender?: ProfileGender;
}

const isLocale = (value: unknown): value is Locale => value === 'IT' || value === 'EN' || value === 'JA' || value === 'RU';

const isProfileGender = (value: unknown): value is ProfileGender => value === 'female' || value === 'male';

export const getUserPreferencesDocRef = (uid: string) =>
  doc(getFirebaseFirestore(), 'users', uid, 'settings', 'app');

export const loadUserPreferences = async (uid: string): Promise<UserPreferences | null> => {
  try {
    const snap = await getDoc(getUserPreferencesDocRef(uid));
    if (!snap.exists()) return null;

    const data = snap.data() as Record<string, unknown>;
    const prefs: UserPreferences = {};

    if (isLocale(data.locale)) prefs.locale = data.locale;
    if (typeof data.confirmDelete === 'boolean') prefs.confirmDelete = data.confirmDelete;
    if (typeof data.showHoverInfo === 'boolean') prefs.showHoverInfo = data.showHoverInfo;
    if (Array.isArray(data.categories)) {
      prefs.categories = data.categories.filter((v) => typeof v === 'string') as string[];
    }
    if (isProfileGender(data.profileGender)) prefs.profileGender = data.profileGender;

    return prefs;
  } catch (err) {
    console.warn('[firestore] loadUserPreferences failed', err);
    throw err;
  }
};

export const saveUserPreferences = async (uid: string, patch: UserPreferences): Promise<void> => {
  try {
    const ref = getUserPreferencesDocRef(uid);
    const base = {
      ...patch,
      updatedAt: serverTimestamp(),
    };

    try {
      await updateDoc(ref, base);
      return;
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code !== 'not-found') throw err;
    }

    await setDoc(ref, { ...base, createdAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.warn('[firestore] saveUserPreferences failed', err);
    throw err;
  }
};

export const hasAnyLocalPreferences = (profileKey: string) => {
  if (typeof window === 'undefined') return false;
  try {
    const keys = [
      `ws-confirm-delete-${profileKey}`,
      `ws-hover-info-${profileKey}`,
      `ws-categories-${profileKey}`,
      `ws-profile-gender-${profileKey}`,
      'ws-lang',
    ];
    return keys.some((k) => localStorage.getItem(k) !== null);
  } catch {
    return false;
  }
};
