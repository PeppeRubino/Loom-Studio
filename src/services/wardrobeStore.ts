import {
  collection,
  doc,
  getDocs,
  getDoc,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';

import type { AuthUser } from '@/features/auth/context';
import { getFirebaseFirestore } from '@/lib/firebase';
import type { Item } from '@/types/item';

const knownWardrobeIdsByUid = new Map<string, Set<string>>();

const ensureKnownSet = (uid: string) => {
  let set = knownWardrobeIdsByUid.get(uid);
  if (!set) {
    set = new Set<string>();
    knownWardrobeIdsByUid.set(uid, set);
  }
  return set;
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const stripUndefinedDeep = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(stripUndefinedDeep);
  }
  if (isRecord(value)) {
    const out: Record<string, unknown> = {};
    Object.keys(value).forEach((k) => {
      const v = value[k];
      if (typeof v === 'undefined') return;
      out[k] = stripUndefinedDeep(v);
    });
    return out;
  }
  return value;
};

type HasToDate = { toDate: () => Date };
const hasToDate = (value: unknown): value is HasToDate =>
  isRecord(value) && typeof (value as Record<string, unknown>).toDate === 'function';

const toIsoDate = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (hasToDate(value)) {
    const d = value.toDate();
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
  }
  return null;
};

const dedupeItemsById = (items: Item[]) => {
  const map = new Map<string, Item>();
  items.forEach((item) => {
    const id = typeof item?.id === 'string' ? item.id.trim() : '';
    if (!id) return;
    map.set(id, item);
  });
  return [...map.values()];
};

export const getUserDocRef = (uid: string) => doc(getFirebaseFirestore(), 'users', uid);

export const upsertUserProfileFromAuth = async (user: AuthUser) => {
  try {
    const uid = user.uid;
    if (!uid) return;

    const ref = getUserDocRef(uid);
    const base = {
      displayName: user.name ?? null,
      email: user.email ?? null,
      photoUrl: user.picture ?? null,
      providerId: user.provider ?? null,
      updatedAt: serverTimestamp(),
    };

    try {
      await updateDoc(ref, base);
      return;
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code !== 'not-found') throw err;
    }

    await setDoc(ref, { ...base, createdAt: serverTimestamp(), tier: 'standard' }, { merge: true });
  } catch (err) {
    console.warn('[firestore] upsertUserProfileFromAuth failed', err);
    throw err;
  }
};

export const loadUserTierFromFirestore = async (uid: string): Promise<'standard' | 'pro' | 'premium'> => {
  try {
    const snap = await getDoc(getUserDocRef(uid));
    if (!snap.exists()) return 'standard';
    const data = snap.data() as Record<string, unknown>;
    const tier = data.tier;
    return tier === 'pro' || tier === 'premium' || tier === 'standard' ? tier : 'standard';
  } catch (err) {
    console.warn('[firestore] loadUserTierFromFirestore failed', err);
    throw err;
  }
};

const getWardrobeCollectionRef = (uid: string) => collection(getFirebaseFirestore(), 'users', uid, 'wardrobe');

export const loadWardrobeFromFirestore = async (uid: string): Promise<Item[]> => {
  try {
    const snap = await getDocs(getWardrobeCollectionRef(uid));
    const out: Item[] = [];
    const known = ensureKnownSet(uid);
    known.clear();

    snap.forEach((docSnap) => {
      const data = docSnap.data() as Record<string, unknown>;
      const id = docSnap.id;
      known.add(id);

      const season = typeof data.season === 'string' ? data.season : 'Primavera';
      const status = typeof data.status === 'string' ? data.status : 'Ready';
      const updatedAt = toIsoDate(data.updatedAt) ?? new Date().toISOString().split('T')[0];

      out.push({
        id,
        name: typeof data.name === 'string' ? data.name : undefined,
        category: typeof data.category === 'string' ? data.category : '',
        color: typeof data.color === 'string' ? data.color : '',
        season: season as Item['season'],
        tags: Array.isArray(data.tags) ? (data.tags.filter((t) => typeof t === 'string') as string[]) : [],
        status: status as Item['status'],
        note: typeof data.note === 'string' ? data.note : '',
        location: typeof data.location === 'string' ? data.location : undefined,
        updatedAt,
        image: isRecord(data.image) ? (stripUndefinedDeep(data.image) as Item['image']) : undefined,
      });
    });

    return out;
  } catch (err) {
    console.warn('[firestore] loadWardrobeFromFirestore failed', err);
    throw err;
  }
};

export const saveWardrobeToFirestore = async (uid: string, items: Item[]): Promise<void> => {
  try {
    const firestore = getFirebaseFirestore();
    const wardrobeRef = getWardrobeCollectionRef(uid);
    const known = ensureKnownSet(uid);

    const uniqueItems = dedupeItemsById(items);
    const currentIds = new Set(uniqueItems.map((i) => i.id));

    const batch = writeBatch(firestore);

    // Deletes for items removed locally (only if we have a known baseline from a previous load/save).
    known.forEach((id) => {
      if (!currentIds.has(id)) {
        batch.delete(doc(wardrobeRef, id));
      }
    });

    uniqueItems.forEach((item) => {
      const id = item.id?.trim();
      if (!id) return;

      const isNew = !known.has(id);
      const payload: Record<string, unknown> = stripUndefinedDeep({
        ...item,
        createdAt: isNew ? serverTimestamp() : undefined,
        updatedAt: serverTimestamp(),
      }) as Record<string, unknown>;

      // Ensure the doc id matches the stored id.
      payload.id = id;

      batch.set(doc(wardrobeRef, id), payload, { merge: true });
    });

    await batch.commit();

    // Update known ids after a successful commit.
    known.clear();
    currentIds.forEach((id) => known.add(id));
  } catch (err) {
    console.warn('[firestore] saveWardrobeToFirestore failed', err);
    throw err;
  }
};

export const migrateLocalToFirestoreIfNeeded = async (
  uid: string,
  localItems: Item[]
): Promise<{ migrated: boolean }> => {
  try {
    const wardrobeRef = getWardrobeCollectionRef(uid);
    const first = await getDocs(query(wardrobeRef, limit(1)));
    if (!first.empty) {
      return { migrated: false };
    }
    const uniqueItems = dedupeItemsById(localItems);
    if (!uniqueItems.length) {
      return { migrated: false };
    }

    // Reset known ids baseline so all items are treated as new (createdAt set).
    ensureKnownSet(uid).clear();
    await saveWardrobeToFirestore(uid, uniqueItems);

    // Double-check at least one doc exists after migration.
    const check = await getDocs(query(wardrobeRef, limit(1)));
    return { migrated: !check.empty };
  } catch (err) {
    console.warn('[firestore] migrateLocalToFirestoreIfNeeded failed', err);
    throw err;
  }
};
