import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Mars, Venus } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SupportLoomPanel } from "@/components/profile/SupportLoomPanel";
import { useAuth } from "@/features/auth/useAuth";
import { useLanguage } from "@/features/i18n/useLanguage";
import {
  loadItems,
  loadProfileAvatar,
  loadProfileGender,
  saveProfileAvatar,
  saveProfileGender,
  type ProfileGender,
} from "@/lib/storage";
import { compressImage } from "@/lib/image";
import type { Item } from "@/types/item";
import fallbackFemale from "@/assets/fallback_f.png";
import fallbackMale from "@/assets/fallback_m.png";

export const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const profileKey = user?.email || user?.uid || "guest";
  const supportUrl = import.meta.env.VITE_SUPPORT_URL as string | undefined;

  return (
    <ProfilePageInner
      key={profileKey}
      user={user}
      signOut={signOut}
      t={t}
      profileKey={profileKey}
      supportUrl={supportUrl}
    />
  );
};

type TranslateFn = (key: string, fallback?: string, vars?: Record<string, string | number>) => string;

interface ProfilePageInnerProps {
  user: ReturnType<typeof useAuth>["user"];
  signOut: ReturnType<typeof useAuth>["signOut"];
  t: TranslateFn;
  profileKey: string;
  supportUrl?: string;
}

const ProfilePageInner = ({ user, signOut, t, profileKey, supportUrl }: ProfilePageInnerProps) => {
  const [items, setItems] = useState<Item[]>(() => loadItems(profileKey));
  const [gender, setGender] = useState<ProfileGender>(() => loadProfileGender(profileKey));
  const [avatarOverride, setAvatarOverride] = useState<string | null>(() => loadProfileAvatar(profileKey));
  const [avatarError, setAvatarError] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || detail.profile !== profileKey) return;
      setItems(loadItems(profileKey));
    };
    window.addEventListener("ws-items-updated", handler as EventListener);
    return () => window.removeEventListener("ws-items-updated", handler as EventListener);
  }, [profileKey]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { profile?: string; gender?: unknown; avatar?: unknown };
      if (!detail || detail.profile !== profileKey) return;
      if (detail.gender === "female" || detail.gender === "male") {
        setGender(detail.gender);
      }
      if (typeof detail.avatar === "string" || detail.avatar === null) {
        setAvatarOverride(loadProfileAvatar(profileKey));
        setAvatarError(false);
      }
    };
    window.addEventListener("ws-profile-updated", handler as EventListener);
    return () => window.removeEventListener("ws-profile-updated", handler as EventListener);
  }, [profileKey]);

  const fallbackAvatar = gender === "male" ? fallbackMale : fallbackFemale;
  const avatarSrc = avatarError ? fallbackAvatar : avatarOverride || user?.picture || fallbackAvatar;

  const handleAvatarPick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl } = await compressImage(file);
      setAvatarOverride(dataUrl);
      setAvatarError(false);
      saveProfileAvatar(profileKey, dataUrl);
    } catch {
      // ignore, keep current avatar
    }
  };

  const stats = useMemo(() => {
    if (!items.length) {
      return { total: 0, topCategory: "—", topTag: "—", topSeason: "—" };
    }
    const count = <T extends string>(arr: T[]) =>
      Object.entries(arr.reduce<Record<string, number>>((acc, v) => ((acc[v] = (acc[v] || 0) + 1), acc), {})).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] || "—";

    const topCategory = count(items.map((i) => i.category));
    const topSeason = count(items.map((i) => i.season));
    const topTag = count(items.flatMap((i) => i.tags || []));

    const countsColor = Object.entries(
      items.reduce<Record<string, number>>((acc, i) => ((acc[i.color] = (acc[i.color] || 0) + 1), acc), {})
    ).sort((a, b) => b[1] - a[1]);
    const [colorName, colorCount] = countsColor[0] || ["", 0];
    const colorShare = colorCount / items.length;
    const redundancy =
      colorCount >= 3 && colorShare >= 0.3
        ? t("profile.stat.redundancy", "Colore prevalente: {count} capi {color} ({percent}%).", {
            count: colorCount,
            color: colorName.toLowerCase(),
            percent: Math.round(colorShare * 100),
          })
        : null;

    return { total: items.length, topCategory, topTag, topSeason, redundancy };
  }, [items, t]);

  return (
    <div className="space-y-4">
      <Card className="bg-white/90">
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24">
              <div className="h-full w-full overflow-hidden rounded-full border border-[#e2e8f0] bg-white">
                <img
                  src={avatarSrc}
                  alt={t("profile.avatarAlt", "Avatar profilo")}
                  className="h-full w-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              </div>
              <button
                type="button"
                onClick={handleAvatarPick}
                aria-label={t("profile.avatar.change", "Cambia foto profilo")}
                className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#475569] shadow-sm transition duration-[120ms] hover:text-[#0f172a]"
              >
                <Camera size={16} />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#94a3b8]">{t("profile.title", "Profilo")}</p>
              <p className="text-lg font-semibold text-[#0f172a]">{user?.name || "Ospite"}</p>
              <p className="text-sm text-[#475569]">{user?.email || "guest@example.com"}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-[#475569] transition ${
                  gender === "female" ? "border-transparent bg-[#0f172a] text-white" : "border-[#e2e8f0] bg-white"
                }`}
                aria-label={t("profile.gender.female", "Donna")}
                onClick={() => {
                  setGender("female");
                  saveProfileGender(profileKey, "female");
                }}
              >
                <Venus size={12} />
              </button>
              <button
                type="button"
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-[#475569] transition ${
                  gender === "male" ? "border-transparent bg-[#0f172a] text-white" : "border-[#e2e8f0] bg-white"
                }`}
                aria-label={t("profile.gender.male", "Uomo")}
                onClick={() => {
                  setGender("male");
                  saveProfileGender(profileKey, "male");
                }}
              >
                <Mars size={12} />
              </button>
            </div>
            <Button
              variant="ghost"
              className="rounded-full px-4 text-[#ef4444] hover:text-[#b91c1c]"
              onClick={signOut}
            >
              {t("profile.logout", "Logout")}
            </Button>
          </div>
      </Card>

      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: t("profile.stat.total", "Capi totali"), value: stats.total },
            { label: t("profile.stat.cat", "Categoria più frequente"), value: stats.topCategory },
            { label: t("profile.stat.tag", "Tag più usato"), value: stats.topTag },
            { label: t("profile.stat.season", "Stagione top"), value: stats.topSeason },
          ].map((item) => (
            <motion.div
              key={item.label}
              layout
              initial={{ opacity: 0.8, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.12 }}
              className="rounded-2xl border border-[#e6e6e8] bg-white/80 p-3 shadow-sm"
            >
              <div className="flex h-full flex-col">
                <p className="min-h-[32px] text-[12px] uppercase tracking-[0.3em] text-[#94a3b8] sm:text-[13px] leading-tight">
                  {item.label}
                </p>
                {item.value === "—" ? (
                  <p className="mt-auto text-sm text-[#94a3b8] italic">{t("profile.stat.empty", "Non disponibile")}</p>
                ) : (
                  <p className="mt-auto text-base font-medium text-[#0f172a]">{item.value}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {stats.redundancy && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className="rounded-2xl border border-[#e6e6e8] bg-white/80 px-3 py-2 text-sm text-[#475569]"
            >
              {stats.redundancy}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <div className="pt-2">
        <SupportLoomPanel supportUrl={supportUrl} />
      </div>
    </div>
  );
};














