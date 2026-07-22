import { type ReactNode } from 'react';
import { twMerge } from './tw';

interface ProgressRingProps {
  /** 0..1 */
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  children?: ReactNode;
  color?: string;
  trackColor?: string;
}

export function ProgressRing({
  value,
  size = 64,
  stroke = 6,
  className,
  children,
  color = '#9ee62a',
  trackColor = '#1f241a',
}: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, value));
  const offset = c * (1 - clamped);
  return (
    <div className={twMerge('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 400ms cubic-bezier(0.2, 0.9, 0.3, 1.1)' }}
        />
      </svg>
      {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  );
}

interface ProgressBarProps {
  value: number; // 0..1
  className?: string;
  color?: string;
  trackColor?: string;
  height?: number;
  animate?: boolean;
}

export function ProgressBar({
  value,
  className,
  color = 'linear-gradient(90deg, #9ee62a, #b5f94a)',
  trackColor = '#161a13',
  height = 8,
  animate = true,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <div
      className={twMerge('w-full rounded-full overflow-hidden', className)}
      style={{ height, backgroundColor: trackColor }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${clamped * 100}%`,
          background: color,
          transition: animate ? 'width 500ms cubic-bezier(0.2, 0.9, 0.3, 1.1)' : undefined,
        }}
      />
    </div>
  );
}
