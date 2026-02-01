import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div
      className={`user-select-none rounded-[18px] border border-[var(--glass-border)] bg-white/70 p-4 shadow-[0_8px_16px_-14px_rgba(15,23,42,0.28)] transition-shadow duration-[120ms] hover:shadow-[0_10px_18px_-16px_rgba(15,23,42,0.32)] ${className}`.trim()}
    >
      {children}
    </div>
  );
};
