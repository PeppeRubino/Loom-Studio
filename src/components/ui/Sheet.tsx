import { type ReactNode } from 'react';

interface SheetProps {
  open: boolean;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
}

export const Sheet = ({ open, title, children, onClose }: SheetProps) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40">
      <div className="mx-4 mb-10 w-full max-w-md rounded-[16px] border border-[#e6e6e8] bg-white p-4 shadow-xl">
        <header className="flex items-center justify-between border-b border-[#e6e6e8] pb-3">
          <p className="text-base font-semibold text-[#111111]">{title}</p>
          <button
            aria-label="Close"
            className="text-sm font-semibold text-[#5e5e5e]"
            onClick={onClose}
          >
            Close
          </button>
        </header>
        <div className="mt-3 space-y-3">{children}</div>
      </div>
    </div>
  );
};

