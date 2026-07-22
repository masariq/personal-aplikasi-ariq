import { type ReactNode, type ButtonHTMLAttributes, forwardRef } from 'react';
import { twMerge } from './tw';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'amber';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<Variant, string> = {
  primary:
    'bg-lime-400 text-bg-base hover:bg-lime-300 active:bg-lime-500 shadow-glow disabled:bg-lime-400/40 disabled:text-bg-base/50 disabled:shadow-none',
  amber:
    'bg-amber-400 text-bg-base hover:bg-amber-300 active:bg-amber-500 shadow-glow-amber disabled:bg-amber-400/40 disabled:text-bg-base/50 disabled:shadow-none',
  secondary:
    'bg-bg-raised text-ink-high hover:bg-bg-border border border-bg-border hover:border-ink-faint disabled:opacity-40',
  ghost:
    'text-ink-mid hover:text-ink-high hover:bg-bg-raised disabled:opacity-40',
  danger:
    'bg-transparent text-red-400 hover:bg-red-500/10 border border-red-500/30 hover:border-red-500/50 disabled:opacity-40',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
  icon: 'h-9 w-9 rounded-lg',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={twMerge(
        'inline-flex items-center justify-center font-medium tracking-tight',
        'transition-all duration-150 ease-out select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/50 focus-visible:ring-offset-1 focus-visible:ring-offset-bg-base',
        'disabled:cursor-not-allowed active:scale-[0.97]',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
