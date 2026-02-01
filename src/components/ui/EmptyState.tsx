import { type ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export const EmptyState = ({ title, description, action }: EmptyStateProps) => {
  return (
    <div className="rounded-[16px] border border-[#e6e6e8] bg-gradient-to-b from-[#f7f7f8] via-white to-[#f7f7f8] p-8 text-center shadow-sm">
      <p className="text-lg font-semibold text-[#111111]">{title}</p>
      <p className="mt-2 text-sm text-[#5e5e5e]">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
