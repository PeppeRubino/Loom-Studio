import { type ReactNode } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  extraAction?: ReactNode;
}

export const ConfirmDialog = ({
  open,
  title = 'Conferma',
  description,
  confirmLabel = 'Conferma',
  cancelLabel = 'Annulla',
  onConfirm,
  onCancel,
  extraAction,
}: ConfirmDialogProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
      <div className="w-full max-w-sm rounded-[18px] border border-[rgba(0,0,0,0.06)] bg-white p-5 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.45)]">
        <div className="space-y-2">
          <p className="text-base font-semibold text-[#0f172a]">{title}</p>
          {description && <p className="text-sm text-[#475569]">{description}</p>}
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          {extraAction}
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-2 text-sm font-semibold text-[#475569] hover:bg-[#f1f5f9]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-[#111111] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f172a]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
