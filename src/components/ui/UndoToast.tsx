import { AnimatePresence, motion } from 'framer-motion';

interface UndoToastProps {
  open: boolean;
  message: string;
  actionLabel?: string;
  onUndo: () => void;
  onClose: () => void;
}

export const UndoToast = ({ open, message, actionLabel = 'Annulla', onUndo, onClose }: UndoToastProps) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.18 }}
          className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-[rgba(0,0,0,0.08)] bg-white/95 px-4 py-2 text-sm text-[#0f172a] shadow-[0_12px_30px_-22px_rgba(15,23,42,0.4)] backdrop-blur-sm"
          role="status"
        >
          <span>{message}</span>
          <button
            type="button"
            onClick={() => {
              onUndo();
              onClose();
            }}
            className="rounded-full px-3 py-1 text-sm font-semibold text-[#0f172a] hover:bg-[#f1f5f9] transition duration-[120ms]"
          >
            {actionLabel}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
