import {
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type SelectHTMLAttributes,
  forwardRef,
  type ReactNode,
} from 'react';
import { twMerge } from './tw';

const baseField =
  'w-full bg-bg-raised border border-bg-border rounded-xl text-ink-high placeholder:text-ink-low ' +
  'focus:outline-none focus:border-lime-400/60 focus:ring-2 focus:ring-lime-400/15 ' +
  'transition-all duration-150 disabled:opacity-50';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={twMerge(
        baseField,
        'h-10 px-3.5 text-sm',
        invalid && 'border-red-500/60 focus:border-red-500/60 focus:ring-red-500/15',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, rows = 3, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={twMerge(baseField, 'px-3.5 py-2.5 text-sm leading-relaxed resize-y', invalid && 'border-red-500/60', className)}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={twMerge(baseField, 'h-10 px-3 text-sm appearance-none cursor-pointer pr-9', className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23a8b09c'%3E%3Cpath d='M5.5 7.5l4.5 5 4.5-5'/%3E%3C/svg%3E\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.75rem center',
        backgroundSize: '1.1rem',
      }}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = 'Select';

export function Field({
  label,
  hint,
  error,
  children,
  className,
  htmlFor,
}: {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <div className={twMerge('space-y-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-xs font-medium uppercase tracking-wider text-ink-mid">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-low">{hint}</p>
      ) : null}
    </div>
  );
}
