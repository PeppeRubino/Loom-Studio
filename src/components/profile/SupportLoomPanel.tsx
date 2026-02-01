import { useEffect, useState } from "react";
import { ExternalLink, X } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/features/i18n/useLanguage";

interface SupportLoomPanelProps {
  supportUrl?: string;
}

export const SupportLoomPanel = ({ supportUrl }: SupportLoomPanelProps) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const hasLink = Boolean(supportUrl && supportUrl.trim().length > 0);
  const showMissing = !hasLink && import.meta.env.DEV;

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      <Card className="bg-white/80">
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#0f172a]">{t("support.title", "Sostieni Loom")}</p>
            <p className="text-sm text-[#64748b]">{t("support.body.line1")}</p>
            <p className="text-sm text-[#64748b]">{t("support.body.line2")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {hasLink ? (
              <a
                href={supportUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={t("support.cta", "Offrimi un caffè ☕")}
              >
                <Button variant="secondary" className="rounded-full">
                  {t("support.cta", "Offrimi un caffè ☕")}
                </Button>
              </a>
            ) : (
              <Button variant="secondary" className="rounded-full opacity-60" disabled>
                {t("support.cta", "Offrimi un caffè ☕")}
              </Button>
            )}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="text-[11px] font-semibold text-[#94a3b8] hover:text-[#64748b] transition duration-[120ms]"
            >
              {t("support.what", "Cosa finanzia?")}
            </button>
          </div>

          {(hasLink || showMissing) && (
            <p className="text-[10px] text-[#94a3b8]/70">
              {hasLink ? t("support.external", "Apri un link esterno") : t("support.missing", "Link non configurato")}
            </p>
          )}
        </div>
      </Card>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-[18px] border border-[rgba(0,0,0,0.06)] bg-white p-5 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ExternalLink size={14} className="text-[#94a3b8]" />
                <p className="text-sm font-semibold text-[#0f172a]">{t("support.modal.title", "Cosa finanzia?")}</p>
              </div>
              <button
                type="button"
                aria-label={t("common.close", "Chiudi")}
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-[#94a3b8] hover:text-[#64748b]"
              >
                <X size={16} />
              </button>
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#64748b]">
              <li>{t("support.modal.bullet1")}</li>
              <li>{t("support.modal.bullet2")}</li>
              <li>{t("support.modal.bullet3")}</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};





