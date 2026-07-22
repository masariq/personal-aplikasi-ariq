import { type ReactNode } from 'react';
import { twMerge } from './tw';

interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={twMerge(
        'flex flex-col items-center justify-center text-center py-12 px-6',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-bg-border bg-bg-raised text-ink-low [&_svg]:w-7 [&_svg]:h-7">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-ink-high tracking-tight">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-mid leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
