import type React from 'react';
import { forwardRef, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  prefixIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ prefixIcon, ...rest }, ref) => {
  return (
    <label className="flex items-center gap-2 rounded-full border border-[rgba(0,0,0,0.035)] bg-white/55 px-3.5 py-[5px] text-sm text-[#0f172a] shadow-[0_8px_20px_-20px_rgba(15,23,42,0.3)]">
      {prefixIcon && <span className="text-[#94a3b8]">{prefixIcon}</span>}
      <input
        ref={ref}
        className="w-full bg-transparent text-sm text-[#0f172a] placeholder:text-[#a0aec0] focus:outline-none"
        {...rest}
      />
    </label>
  );
});

Input.displayName = 'Input';
