import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { twMerge } from './tw';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-bg-base/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={twMerge(
          'relative w-full bg-bg-surface border border-bg-border shadow-card rounded-t-2xl sm:rounded-2xl',
          'animate-slide-up max-h-[92vh] flex flex-col',
          sizes[size],
        )}
      >
        {(title || subtitle) && (
          <div className="flex items-start justify-between gap-4 p-5 pb-4 border-b border-bg-border">
            <div className="min-w-0">
              {title && <h2 className="text-base font-semibold tracking-tight text-ink-high">{title}</h2>}
              {subtitle && <p className="mt-0.5 text-sm text-ink-mid">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 -m-1 p-1 text-ink-low hover:text-ink-high transition-colors rounded-lg hover:bg-bg-raised"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5">{children}</div>
        {footer && (
          <div className="p-4 border-t border-bg-border flex items-center justify-end gap-2 bg-bg-muted/50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
