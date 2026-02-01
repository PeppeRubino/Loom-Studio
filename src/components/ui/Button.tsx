import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { colors } from '@/lib/theme';

const baseStyles =
  'inline-flex items-center justify-center rounded-[12px] border px-4 py-2 text-sm font-semibold transition duration-[120ms] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0f0f10] active:translate-y-[1px]';

const variantStyles: Record<string, string> = {
  primary: `bg-[${colors.ACCENT}] text-[${colors.ACCENT_INK}] border-transparent hover:-translate-y-[1px] hover:shadow-[0_10px_26px_-18px_rgba(0,0,0,0.4)]`,
  secondary: `bg-white text-[${colors.TEXT}] border-[${colors.BORDER}] hover:-translate-y-[1px] hover:shadow-[0_12px_28px_-20px_rgba(0,0,0,0.35)]`,
  danger: `bg-[${colors.DANGER}] text-white border-transparent hover:-translate-y-[1px] hover:shadow-[0_12px_30px_-18px_rgba(0,0,0,0.45)]`,
  ghost: `bg-white text-[${colors.TEXT}] border border-transparent hover:-translate-y-[1px] hover:bg-[#f1f5f9] hover:shadow-[0_8px_20px_-14px_rgba(0,0,0,0.25)]`,
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', ...rest }, ref) => {
    return (
      <button
        ref={ref}
        className={`user-select-none ${baseStyles} ${variantStyles[variant]} ${className}`.trim()}
        type={rest.type ?? 'button'}
        {...rest}
      />
    );
  }
);

Button.displayName = 'Button';
