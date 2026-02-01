import { type ReactNode } from 'react';

type Tone = 'accent' | 'neutral' | 'muted';

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
}

const toneClasses: Record<Tone, string> = {
  accent: 'border border-transparent text-[#b11226]',
  neutral: 'border border-[rgba(0,0,0,0.08)] text-[#0f172a]',
  muted: 'border border-[rgba(0,0,0,0.06)] text-[#475569]',
};

export const Badge = ({ children, tone = 'neutral' }: BadgeProps) => {
  const toneKey: Tone = tone ?? 'neutral';
  return (
    <span
      className={`user-select-none inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium antialiased shadow-[0_6px_14px_-10px_rgba(15,23,42,0.14)] transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a]/20 sm:text-[12px] ${toneClasses[toneKey]}`}
    >
      {children}
    </span>
  );
};
