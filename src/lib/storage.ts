import type { Item } from '@/types/item';

const ITEMS_KEY = (profile: string) => `ws-items-${profile}`;
const CONFIRM_KEY = (profile: string) => `ws-confirm-delete-${profile}`;
const HOVER_KEY = (profile: string) => `ws-hover-info-${profile}`;
const GENDER_KEY = (profile: string) => `ws-profile-gender-${profile}`;
const AVATAR_KEY = (profile: string) => `ws-profile-avatar-${profile}`;

export type ProfileGender = 'female' | 'male';
export type ProfileAvatar = string | null;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

export const loadItems = (profile: string): Item[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ITEMS_KEY(profile));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((rawItem): Item | null => {
        if (!isRecord(rawItem)) return null;

        const { imageUrl, description, ...rest } = rawItem;
        let item = rest as unknown as Item;

        if (typeof imageUrl === 'string' && !isRecord(item.image)) {
          item = {
            ...item,
            image: {
              url: imageUrl,
              provider: 'legacy',
            },
          };
        }

        if (typeof description === 'string' && (typeof (item as unknown as { note?: unknown }).note !== 'string')) {
          item = { ...item, note: description };
        }

        return item;
      })
      .filter((v): v is Item => Boolean(v));
  } catch {
    return [];
  }
};

export const saveItems = (profile: string, items: Item[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ITEMS_KEY(profile), JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('ws-items-updated', { detail: { profile, items } }));
  } catch {
    // ignore quota errors
  }
};

export const loadConfirmPreference = (profile: string): boolean => {
  if (typeof window === 'undefined') return true;
  const raw = localStorage.getItem(CONFIRM_KEY(profile));
  if (raw === 'false') return false;
  return true;
};

export const saveConfirmPreference = (profile: string, value: boolean) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONFIRM_KEY(profile), String(value));
  window.dispatchEvent(new CustomEvent('ws-preferences-updated', { detail: { profile, confirmDelete: value } }));
};

export const loadHoverInfoPreference = (profile: string): boolean => {
  if (typeof window === 'undefined') return true;
  const raw = localStorage.getItem(HOVER_KEY(profile));
  if (raw === 'false') return false;
  return true;
};

export const saveHoverInfoPreference = (profile: string, value: boolean) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HOVER_KEY(profile), String(value));
  window.dispatchEvent(new CustomEvent('ws-preferences-updated', { detail: { profile, showHoverInfo: value } }));
};

export const loadProfileGender = (profile: string): ProfileGender => {
  if (typeof window === 'undefined') return 'female';
  const raw = localStorage.getItem(GENDER_KEY(profile));
  return raw === 'male' ? 'male' : 'female';
};

export const saveProfileGender = (profile: string, value: ProfileGender) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GENDER_KEY(profile), value);
  window.dispatchEvent(new CustomEvent('ws-profile-updated', { detail: { profile, gender: value } }));
};

export const loadProfileAvatar = (profile: string): ProfileAvatar => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AVATAR_KEY(profile));
    return raw || null;
  } catch {
    return null;
  }
};

export const saveProfileAvatar = (profile: string, value: ProfileAvatar) => {
  if (typeof window === 'undefined') return;
  try {
    if (!value) {
      localStorage.removeItem(AVATAR_KEY(profile));
    } else {
      localStorage.setItem(AVATAR_KEY(profile), value);
    }
    window.dispatchEvent(new CustomEvent('ws-profile-updated', { detail: { profile, avatar: value } }));
  } catch {
    // ignore
  }
};
