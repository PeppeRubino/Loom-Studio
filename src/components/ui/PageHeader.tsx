import { type ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export const PageHeader = ({ title, description, actions }: PageHeaderProps) => {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e6e6e8] pb-4">
      <div>
        <p className="text-[22px] font-semibold text-[#111111] drop-shadow-[0_1px_0_rgba(0,0,0,0.06)]">{title}</p>
        {description && <p className="text-sm text-[#5e5e5e]">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};
