import { Camera, ImageDown, Plus, Search, Tag } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FilterPill } from "@/components/ui/FilterPill";
import { GarmentCard } from "@/components/ui/GarmentCard";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { UndoToast } from "@/components/ui/UndoToast";
import { useAuth } from "@/features/auth/useAuth";
import { useCategorySettings } from "@/hooks/useCategorySettings";
import { compressImage, uploadImage, removeBackground } from "@/lib/image";
import { translateCategory, translateColor, translateSeason } from "@/lib/terms";
import {
  loadConfirmPreference,
  loadHoverInfoPreference,
  loadItems,
  loadProfileGender,
  saveConfirmPreference,
  saveHoverInfoPreference,
  saveItems,
} from "@/lib/storage";
import {
  loadWardrobeFromFirestore,
  migrateLocalToFirestoreIfNeeded,
  saveWardrobeToFirestore,
  upsertUserProfileFromAuth,
} from "@/services/wardrobeStore";
import type { Item } from "@/types/item";
import { useLanguage } from "@/features/i18n/useLanguage";
import fallbackFemale from "@/assets/fallback_f.png";
import fallbackMale from "@/assets/fallback_m.png";

const emptyNewItem: Item = {
  id: "",
  category: "",
  color: "",
  season: "Primavera",
  tags: [],
  status: "Ready",
  note: "",
  updatedAt: new Date().toISOString().split("T")[0],
  image: undefined,
};

export const HomePage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const profileKey = user?.email || user?.uid || "guest";
  const firestoreUid = user?.provider !== "local" ? user?.uid || null : null;
  const firestoreEnabled = Boolean(firestoreUid);
  const { categories: savedCategories } = useCategorySettings(profileKey);

  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [color, setColor] = useState<string | undefined>();
  const [season, setSeason] = useState<string | undefined>();
  const [openFilter, setOpenFilter] = useState<'category' | 'color' | 'season' | null>(null);
  const [newItem, setNewItem] = useState<Item>(emptyNewItem);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState("");
  const [creationMode, setCreationMode] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageMeta, setImageMeta] = useState<Pick<Item, "image">["image"] | undefined>();
  const [uploading, setUploading] = useState(false);
  const [removeBg, setRemoveBg] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(20);
  const [showHoverInfo, setShowHoverInfo] = useState(true);
  const [profileGender, setProfileGender] = useState(loadProfileGender(profileKey));
  const [undoItem, setUndoItem] = useState<{ item: Item; index: number } | null>(null);
  const undoTimerRef = useRef<number | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement | null>(null);
  const itemsRef = useRef<Item[]>([]);
  const loadedRef = useRef(false);
  const loadedProfileRef = useRef<string | null>(null);
  const firestoreAvailableRef = useRef(true);
  const firestoreSyncStateRef = useRef<'idle' | 'hydrating' | 'ready'>('idle');
  const firestoreSaveTimerRef = useRef<number | null>(null);
  const [replacePhotoId, setReplacePhotoId] = useState<string | null>(null);
  const [replacingPhotoId, setReplacingPhotoId] = useState<string | null>(null);

  useEffect(() => {
    if (loadedProfileRef.current === profileKey) return;
    loadedProfileRef.current = profileKey;
    loadedRef.current = false;
    setItems(loadItems(profileKey));
    setConfirmDelete(loadConfirmPreference(profileKey));
    setShowHoverInfo(loadHoverInfoPreference(profileKey));
    setProfileGender(loadProfileGender(profileKey));
    loadedRef.current = true;
  }, [profileKey]);

  useEffect(() => {
    if (loadedRef.current) {
      saveItems(profileKey, items);
    }
  }, [items, profileKey]);

  useEffect(() => {
    if (loadedRef.current) {
      saveConfirmPreference(profileKey, confirmDelete);
    }
  }, [confirmDelete, profileKey]);

  useEffect(() => {
    if (loadedRef.current) {
      saveHoverInfoPreference(profileKey, showHoverInfo);
    }
  }, [profileKey, showHoverInfo]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || detail.profile !== profileKey) return;
      if (detail.gender) {
        setProfileGender(detail.gender);
      }
    };
    window.addEventListener("ws-profile-updated", handler as EventListener);
    return () => window.removeEventListener("ws-profile-updated", handler as EventListener);
  }, [profileKey]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        profile?: string;
        confirmDelete?: boolean;
        showHoverInfo?: boolean;
      };
      if (!detail || detail.profile !== profileKey) return;
      if (typeof detail.confirmDelete === "boolean") setConfirmDelete(detail.confirmDelete);
      if (typeof detail.showHoverInfo === "boolean") setShowHoverInfo(detail.showHoverInfo);
    };
    window.addEventListener("ws-preferences-updated", handler as EventListener);
    return () => window.removeEventListener("ws-preferences-updated", handler as EventListener);
  }, [profileKey]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    const handler = () => {
      if (!firestoreEnabled || !firestoreUid) return;
      firestoreAvailableRef.current = true;
      if (firestoreSyncStateRef.current !== 'ready') return;
      if (!loadedRef.current) return;
      saveWardrobeToFirestore(firestoreUid, itemsRef.current).catch((err) => {
        console.warn('[firestore] save failed after reconnect, continuing with localStorage', err);
      });
    };
    window.addEventListener('online', handler);
    return () => window.removeEventListener('online', handler);
  }, [firestoreEnabled, firestoreUid]);

  useEffect(() => {
    firestoreAvailableRef.current = true;
    firestoreSyncStateRef.current = 'idle';
    if (firestoreSaveTimerRef.current) {
      window.clearTimeout(firestoreSaveTimerRef.current);
      firestoreSaveTimerRef.current = null;
    }

    if (!firestoreEnabled || !firestoreUid || !user) return;

    let cancelled = false;
    (async () => {
      firestoreSyncStateRef.current = 'hydrating';

      try {
        await upsertUserProfileFromAuth(user);
      } catch (err) {
        console.warn('[firestore] profile upsert failed, continuing with localStorage', err);
      }

      try {
        const remoteItems = await loadWardrobeFromFirestore(firestoreUid);
        if (cancelled) return;

        if (remoteItems.length) {
          setItems(remoteItems);
          return;
        }

        const localById = new Map<string, Item>();
        [profileKey, user.uid, user.email].filter(Boolean).forEach((key) => {
          loadItems(String(key)).forEach((item) => {
            if (item?.id) localById.set(item.id, item);
          });
        });
        const localItems = [...localById.values()];
        if (localItems.length) {
          try {
            await migrateLocalToFirestoreIfNeeded(firestoreUid, localItems);
          } catch (err) {
            console.warn('[firestore] migration failed, continuing with localStorage', err);
          }
        }
      } catch (err) {
        firestoreAvailableRef.current = false;
        console.warn('[firestore] load failed, continuing with localStorage', err);
      } finally {
        firestoreSyncStateRef.current = 'ready';
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [firestoreEnabled, firestoreUid, profileKey, user]);

  useEffect(() => {
    if (!firestoreEnabled || !firestoreUid) return;
    if (!firestoreAvailableRef.current) return;
    if (firestoreSyncStateRef.current !== 'ready') return;
    if (!loadedRef.current) return;

    if (firestoreSaveTimerRef.current) {
      window.clearTimeout(firestoreSaveTimerRef.current);
    }

    firestoreSaveTimerRef.current = window.setTimeout(() => {
      saveWardrobeToFirestore(firestoreUid, items).catch((err) => {
        firestoreAvailableRef.current = false;
        console.warn('[firestore] save failed, continuing with localStorage', err);
      });
    }, 900);

    return () => {
      if (firestoreSaveTimerRef.current) {
        window.clearTimeout(firestoreSaveTimerRef.current);
      }
    };
  }, [firestoreEnabled, firestoreUid, items]);

  const colors = useMemo(() => Array.from(new Set(items.map((i) => i.color))), [items]);
  const seasons = useMemo(() => Array.from(new Set(items.map((i) => i.season))), [items]);
  const categories = useMemo(
    () => Array.from(new Set([...savedCategories, ...items.map((i) => i.category)])).filter(Boolean),
    [items, savedCategories]
  );

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c, label: translateCategory(c, t) })),
    [categories, t]
  );
  const colorOptions = useMemo(
    () => colors.filter(Boolean).map((c) => ({ value: c, label: translateColor(c, t) })),
    [colors, t]
  );
  const seasonOptions = useMemo(
    () => seasons.filter(Boolean).map((s) => ({ value: s, label: translateSeason(s, t) })),
    [seasons, t]
  );

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const term = search.trim().toLowerCase();
      const searchable = [item.name, item.category, item.color, item.season];
      const matchesSearch =
        !term ||
        searchable.some((field) => field?.toString().toLowerCase().includes(term)) ||
        (item.tags || []).some((tag) => tag.toLowerCase().includes(term));
      const matchesCategory = !category || item.category === category;
      const matchesColor = !color || item.color === color;
      const matchesSeason = !season || item.season === season;
      return matchesSearch && matchesCategory && matchesColor && matchesSeason;
    });
  }, [category, color, season, search, items]);

  const visibleItems = useMemo(() => filtered.slice(0, pageSize), [filtered, pageSize]);
  const sampleItem = useMemo<Item>(
    () => ({
      id: "sample",
      name: t("sample.item.name", "Maglietta"),
      category: t("sample.item.category", "Maglietta"),
      color: t("sample.item.color", "Nero"),
      season: "Primavera",
      tags: [t("sample.tag.casual", "Casual"), t("sample.tag.office", "Ufficio")],
      status: "Ready",
      note: t("sample.item.note", "Esempio di capo con tag e note."),
      updatedAt: new Date().toISOString().split("T")[0],
      image: undefined,
    }),
    [t]
  );
  const showSample =
    !creationMode && items.length === 0 && !search && !category && !color && !season;
  const listItems = showSample ? [sampleItem] : visibleItems;

  const addTagToNew = () => {
    const clean = tagDraft.trim();
    if (!clean) return;
    if (!newItem.tags.includes(clean)) {
      setNewItem({ ...newItem, tags: [...newItem.tags, clean] });
    }
    setTagDraft("");
  };

  const removeTagFromNew = (tag: string) => {
    setNewItem({ ...newItem, tags: newItem.tags.filter((t) => t !== tag) });
  };

  const enqueueUndo = (payload: { item: Item; index: number }) => {
    setUndoItem(payload);
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
    undoTimerRef.current = window.setTimeout(() => setUndoItem(null), 4000);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const index = prev.findIndex((i) => i.id === id);
      if (index === -1) return prev;
      const removed = prev[index];
      const next = prev.filter((_, i) => i !== index);
      enqueueUndo({ item: removed, index });
      return next;
    });
  };

  const requestDelete = (id: string) => {
    if (!confirmDelete) {
      removeItem(id);
      return;
    }
    setPendingDelete(id);
  };

  const confirmRemoval = () => {
    if (pendingDelete) {
      removeItem(pendingDelete);
      setPendingDelete(null);
    }
  };

  const fallbackImage = profileGender === "male" ? fallbackMale : fallbackFemale;

  const resetEditor = () => {
    setNewItem(emptyNewItem);
    setTagDraft("");
    setImagePreview("");
    setImageMeta(undefined);
    setEditingId(null);
    setCreationMode(false);
  };

  const beginEdit = (item: Item) => {
    setEditingId(item.id);
    setNewItem(item);
    setTagDraft("");
    setImagePreview(item.image?.url || "");
    setImageMeta(item.image);
    setCreationMode(true);
  };

  const beginReplacePhoto = (item: Item) => {
    setReplacePhotoId(item.id);
    replaceFileInputRef.current?.click();
  };

  const handleCreate = () => {
    if (!newItem.category.trim()) return;
    const finalImage: Item["image"] = imageMeta || newItem.image;

    if (editingId) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...newItem,
                id: editingId,
                name: newItem.category,
                image: finalImage,
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : item
        )
      );
      resetEditor();
      return;
    }

    const id = `user-${Date.now()}`;
    setItems((prev) => [
      ...prev,
      {
        ...newItem,
        name: newItem.category,
        id,
        image: finalImage,
        updatedAt: new Date().toISOString().split("T")[0],
      },
    ]);
    resetEditor();
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploading(true);
    try {
      const { blob, dataUrl } = await compressImage(file);
      let processedBlob = blob;
      if (removeBg) {
        processedBlob = await removeBackground(blob);
      }
      const previewUrl = URL.createObjectURL(processedBlob);
      setImagePreview(previewUrl || dataUrl);
      const uploaded = await uploadImage(processedBlob, { removeBackground: false });
      setImageMeta(uploaded);
    } catch (err) {
      console.error("image handling error", err);
      const fallbackUrl = URL.createObjectURL(file);
      setImagePreview(fallbackUrl);
      setImageMeta({
        url: fallbackUrl,
        provider: "local",
        uploadedAt: new Date().toISOString(),
      });
    }
    setUploading(false);
  };

  const handleReplacePhoto = async (file: File, targetId: string) => {
    setReplacingPhotoId(targetId);
    try {
      const { blob } = await compressImage(file);
      const uploaded = await uploadImage(blob, { removeBackground: false });
      setItems((prev) =>
        prev.map((item) =>
          item.id === targetId
            ? {
                ...item,
                image: uploaded,
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : item
        )
      );
    } catch (err) {
      console.error("replace photo error", err);
      const fallbackUrl = URL.createObjectURL(file);
      setItems((prev) =>
        prev.map((item) =>
          item.id === targetId
            ? {
                ...item,
                image: {
                  url: fallbackUrl,
                  provider: "local",
                  uploadedAt: new Date().toISOString(),
                },
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : item
        )
      );
    } finally {
      setReplacingPhotoId(null);
    }
  };

  const openFilePicker = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    fileInputRef.current?.click();
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const onReplaceFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetId = replacePhotoId;
    e.target.value = "";
    if (!file || !targetId) return;
    setReplacePhotoId(null);
    await handleReplacePhoto(file, targetId);
  };

  const showCameraButton = () => {
    const ua = navigator.userAgent.toLowerCase();
    return /iphone|ipad|android|mobile/.test(ua);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="w-full flex-1 min-w-[260px]">
          <Input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('home.search')}
            prefixIcon={<Search size={16} />}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <FilterPill
            label={t('home.filter.category', 'Capo')}
            options={categoryOptions}
            value={category}
            onChange={setCategory}
            open={openFilter === 'category'}
            onOpenChange={(next) => setOpenFilter(next ? 'category' : (prev) => (prev === 'category' ? null : prev))}
          />
          <FilterPill
            label={t('home.filter.color', 'Colore')}
            options={colorOptions}
            value={color}
            onChange={setColor}
            open={openFilter === 'color'}
            onOpenChange={(next) => setOpenFilter(next ? 'color' : (prev) => (prev === 'color' ? null : prev))}
          />
          <FilterPill
            label={t('home.filter.season', 'Stagione')}
            options={seasonOptions}
            value={season}
            onChange={setSeason}
            open={openFilter === 'season'}
            onOpenChange={(next) => setOpenFilter(next ? 'season' : (prev) => (prev === 'season' ? null : prev))}
          />
          {!creationMode && (
            <Button variant="primary" className="rounded-full px-4" onClick={() => setCreationMode(true)}>
              <Plus size={14} className="mr-2" /> {t('home.addItem')}
            </Button>
          )}
        </div>
      </div>

      {creationMode ? (
        <Card className="bg-white/90 ">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#0f172a]">
                {editingId ? t("home.edit.title", "Modifica capo") : t("home.new.title")}
              </p>
              <p className="text-[12px] text-[#64748b] sm:text-[13px]">
                {editingId ? t("home.edit.subtitle", "Aggiorna i dettagli della card.") : t("home.new.subtitle")}
              </p>
            </div>
            <div className="flex gap-2">
                <Button variant="ghost" className="rounded-full px-4" onClick={resetEditor}>
                  {editingId ? t("home.edit.cancel", "Annulla") : t("home.new.cancel")}
                </Button>
                <Button variant="primary" className="rounded-full px-4" onClick={handleCreate}>
                  {editingId ? t("home.edit.save", "Salva modifiche") : t("home.new.save")}
                </Button>
              </div>
            </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#cbd5e1] bg-white/80 p-6 text-center text-[#475569] shadow-[0_20px_50px_-40px_rgba(15,23,42,0.55)] "
              onClick={openFilePicker}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-48 w-full rounded-xl object-contain bg-[#f8fafc]" />
              ) : (
                <div className="space-y-2">
                  <ImageDown className="mx-auto text-[#94a3b8]" />
                  <p className="text-sm font-semibold">{t('home.upload.drag')}</p>
                  <p className="text-[12px] text-[#94a3b8] sm:text-[13px]">{t('home.upload.click')}</p>
                </div>
              )}
              <div className="mt-3 flex gap-2">
                {uploading ? (
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-[#475569] shadow-sm">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#0f172a] border-t-transparent" />
                    <span>{t('home.upload.loading', 'Caricamento...')}</span>
                  </div>
                ) : !imagePreview && !imageMeta ? (
                  <>
                    <Button variant="secondary" className="rounded-full px-3" onClick={openFilePicker}>
                      <ImageDown size={14} className="mr-2" /> {t('home.upload.click')}
                    </Button>
                    {showCameraButton() && (
                      <Button variant="ghost" className="rounded-full px-3" onClick={openFilePicker}>
                        <Camera size={14} className="mr-2" /> {t('home.upload.click')}
                      </Button>
                    )}
                  </>
                ) : null}
              </div>
              <div className="mt-2 flex items-center gap-2 text-[12px] text-[#475569] sm:text-[13px]">
                <input
                  type="checkbox"
                  id="remove-bg"
                  checked={removeBg}
                  onChange={(e) => setRemoveBg(e.target.checked)}
                  className="accent-[#0f172a]"
                />
                <label htmlFor="remove-bg">{t('home.upload.removeBg')}</label>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture={showCameraButton() ? "environment" : undefined}
                className="hidden"
                onChange={onFileChange}
              />
            </div>

            <div className="space-y-3">
              <Input
                placeholder={t('home.fields.category', 'Categoria')}
                list="category-options"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              />
              <datalist id="category-options">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <Input
                placeholder={t('home.fields.color', 'Colore')}
                value={newItem.color}
                onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
              />
              <Input
                placeholder={t('home.fields.season', 'Stagione (Primavera/Estate/Autunno/Inverno)')}
                value={newItem.season}
                onChange={(e) => setNewItem({ ...newItem, season: e.target.value as Item["season"] })}
              />
              <Input
                placeholder={t('home.fields.note', 'Note')}
                value={newItem.note}
                onChange={(e) => setNewItem({ ...newItem, note: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-[12px] uppercase tracking-[0.3em] text-[#94a3b8] sm:text-[13px]">{t('home.tags.label', 'Tag (facoltativi)')}</label>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {newItem.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-sm text-[#0f172a] shadow-sm "
                >
                  {tag}
                  <button
                    aria-label={`${t('common.remove', 'Rimuovi')} ${tag}`}
                    onClick={() => removeTagFromNew(tag)}
                    className="text-[#cbd5e1] hover:text-[#ef4444]"
                  >
                    ×
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.45)] bg-white/70 px-3 py-1 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.6)] ">
                <Tag size={14} className="text-[#94a3b8]" />
                <input
                  className="w-32 bg-transparent text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
                  placeholder={t('home.tags.add', 'Aggiungi tag')}
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTagToNew();
                    }
                  }}
                />
                <button
                  type="button"
                  className="text-[12px] font-semibold text-[#475569] hover:text-[#0f172a] sm:text-[13px]"
                  onClick={addTagToNew}
                >
                  {t('common.add', 'Add')}
                </button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listItems.map((item) => (
              <GarmentCard
                key={item.id}
                item={item}
                fallbackImage={fallbackImage}
                onSelectTerm={
                  showSample
                    ? undefined
                    : (term) => {
                        setSearch(term);
                        setCategory(undefined);
                        setColor(undefined);
                        setSeason(undefined);
                      }
                }
                onDelete={showSample ? undefined : requestDelete}
                onEdit={showSample ? undefined : beginEdit}
                onReplacePhoto={
                  showSample || replacingPhotoId === item.id
                    ? undefined
                    : beginReplacePhoto
                }
                showHoverInfo={showHoverInfo}
              />
            ))}
          </div>
          {filtered.length > visibleItems.length && (
            <div className="flex justify-center">
              <Button variant="secondary" className="rounded-full px-4" onClick={() => setPageSize((s) => s + 20)}>
                {t('home.showMore', 'Mostra altri {count}', { count: 20 })}
              </Button>
            </div>
          )}
        </>
      )}
      {!creationMode && items.length === 0 && !showSample && (
        <div className="flex justify-center pt-4">
          <p className="text-[11px] text-[#94a3b8]/70 sm:text-[12px]">{t('home.emptyHint')}</p>
        </div>
      )}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={t('dialog.delete.title', 'Eliminare il capo?')}
        description={t('dialog.delete.desc', 'Questa operazione rimuove la card dal tuo guardaroba.')}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmRemoval}
        extraAction={
          <label className="flex items-center gap-2 text-[12px] font-semibold text-[#475569] sm:text-[13px]">
            <input
              type="checkbox"
              checked={!confirmDelete}
              onChange={(e) => setConfirmDelete(!e.target.checked)}
              className="accent-[#0f172a]"
            />
            {t('dialog.delete.noAsk', 'Non chiedere più')}
          </label>
        }
      />
      <UndoToast
        open={Boolean(undoItem)}
        message={t('toast.itemRemoved', 'Capo rimosso')}
        actionLabel={t('toast.undo', 'Annulla')}
        onUndo={() => {
          if (!undoItem) return;
          setItems((prev) => {
            const next = [...prev];
            next.splice(Math.min(undoItem.index, next.length), 0, undoItem.item);
            return next;
          });
        }}
        onClose={() => setUndoItem(null)}
      />
      <input
        ref={replaceFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onReplaceFileChange}
      />
    </div>
  );
};
