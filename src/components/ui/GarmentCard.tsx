import { ChevronDown, ChevronUp, MoreHorizontal, RefreshCw, Replace, Trash2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/features/i18n/useLanguage";
import { translateCategory, translateColor, translateSeason } from "@/lib/terms";
import type { Item } from "@/types/item";

interface Props {
  item: Item;
  onSelectTerm?: (value: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (item: Item) => void;
  onReplacePhoto?: (item: Item) => void;
  showHoverInfo?: boolean;
  fallbackImage?: string;
}

export const GarmentCard = ({
  item,
  onSelectTerm,
  onDelete,
  onEdit,
  onReplacePhoto,
  showHoverInfo = true,
  fallbackImage = "",
}: Props) => {
  const { t } = useLanguage();
  const [showTags, setShowTags] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSelect = (value: string) => {
    if (!value) return;
    onSelectTerm?.(value);
  };

  const sortedTags = [...item.tags].sort((a, b) => a.localeCompare(b, "it", { sensitivity: "base" }));
  const imageSrc = item.image?.url || fallbackImage;
  const showMenu = Boolean(onDelete || onEdit || onReplacePhoto);
  const title = translateCategory(item.name || item.category, t);
  const categoryLabel = translateCategory(item.category, t);
  const colorLabel = translateColor(item.color, t);
  const seasonLabel = translateSeason(item.season, t);

  return (
    <div className="transition-shadow duration-[120ms]">
      <Card className="p-3">
        <div className="group relative aspect-square overflow-hidden rounded-[14px] bg-[#f8fafc] p-3 flex items-center justify-center">
          <img
            src={imageSrc}
            alt={item.name}
            className="max-h-[60%] w-full object-contain"
            loading="lazy"
            onError={(e) => {
              if (fallbackImage) {
                (e.target as HTMLImageElement).src = fallbackImage;
              }
            }}
          />
          {showHoverInfo && (
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/55 via-black/20 to-transparent p-3 text-white opacity-0 transition-opacity duration-[120ms] group-hover:opacity-100">
              {item.note ? (
                <p className="text-[12px] text-white/90 line-clamp-3 sm:text-[13px]">{item.note}</p>
              ) : (
                <p className="text-[12px] text-white/70 sm:text-[13px]">{t("garment.noNote", "Nessuna nota")}</p>
              )}
            </div>
          )}
        </div>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-[#0f172a] leading-tight">{title}</p>
            <p className="text-sm text-[#64748b]">
              {colorLabel} · {seasonLabel}
            </p>
          </div>
          {showMenu && (
            <div className="relative">
              <button
                type="button"
                className="rounded-full bg-white/70 p-2 text-[#94a3b8] shadow-sm hover:text-[#0f172a]"
                aria-label={t("garment.menu", "Menu")}
                onClick={() => setMenuOpen((v) => !v)}
              >
                <MoreHorizontal size={14} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 z-20 mt-2 w-44 rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white p-2 shadow-lg">
                  <button
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#0f172a] hover:bg-[#f7f7f8]"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete?.(item.id);
                    }}
                  >
                    <Trash2 size={14} /> {t("garment.remove", "Rimuovi")}
                  </button>
                  <button
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#475569] hover:bg-[#f7f7f8]"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit?.(item);
                    }}
                    disabled={!onEdit}
                  >
                    <RefreshCw size={14} /> {t("garment.edit", "Modifica")}
                  </button>
                  <button
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#475569] hover:bg-[#f7f7f8]"
                    onClick={() => {
                      setMenuOpen(false);
                      onReplacePhoto?.(item);
                    }}
                    disabled={!onReplacePhoto}
                  >
                    <Replace size={14} /> {t("garment.replacePhoto", "Sostituisci foto")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => handleSelect(item.category)} className="focus:outline-none">
            <Badge tone="neutral">{categoryLabel}</Badge>
          </button>
          <button type="button" onClick={() => handleSelect(item.color)} className="focus:outline-none">
            <Badge tone="neutral">{colorLabel}</Badge>
          </button>
          <button type="button" onClick={() => handleSelect(item.season)} className="focus:outline-none">
            <Badge tone="neutral">{seasonLabel}</Badge>
          </button>
        </div>
        {item.tags.length > 0 && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setShowTags((v) => !v)}
              className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#475569] hover:text-[#0f172a] sm:text-[13px]"
            >
              {showTags ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {t("garment.tags", "Tag")}
            </button>
            {showTags && (
              <div className="mt-2 rounded-[14px] bg-[#f1f5f9] px-3 py-2">
                <div className="flex flex-wrap gap-2">
                  {sortedTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleSelect(tag)}
                      className="focus:outline-none"
                    >
                      <Badge tone="muted">#{tag}</Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
