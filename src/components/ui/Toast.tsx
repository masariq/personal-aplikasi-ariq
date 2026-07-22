import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from './tw';

type ToastVariant = 'success' | 'info' | 'error';

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

let pushToastExternal: ((message: string, variant?: ToastVariant) => void) | null = null;

export function toast(message: string, variant: ToastVariant = 'info') {
  pushToastExternal?.(message, variant);
}

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-lime-400/40 bg-lime-400/10 text-lime-100',
  info: 'border-bg-border bg-bg-raised text-ink-high',
  error: 'border-red-500/40 bg-red-500/10 text-red-200',
};

export function ToastViewport() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    pushToastExternal = (message, variant = 'info') => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, message, variant }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
    };
    return () => {
      pushToastExternal = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={twMerge(
            'pointer-events-auto w-full rounded-xl border px-4 py-2.5 text-sm font-medium shadow-card animate-slide-up',
            variantStyles[t.variant],
          )}
        >
          {t.message}
        </div>
      ))}
    </div>,
    document.body,
  );
}
