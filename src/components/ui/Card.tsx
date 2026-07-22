import type { HTMLAttributes, ReactNode } from 'react';
import { twMerge } from './tw';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  glow?: boolean;
}

export function Card({ children, className, hover, glow, ...props }: CardProps) {
  return (
    <div
      className={twMerge(
        'rounded-2xl border border-bg-border bg-bg-surface shadow-card',
        'transition-all duration-200',
        hover && 'hover:border-ink-faint/60 hover:bg-bg-raised',
        glow && 'shadow-glow',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={twMerge('flex items-start justify-between gap-3 p-5 pb-0', className)}>
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <div className="mt-0.5 text-lime-400 shrink-0 [&_svg]:w-5 [&_svg]:h-5">{icon}</div>
        )}
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-ink-high truncate">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-ink-mid">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
