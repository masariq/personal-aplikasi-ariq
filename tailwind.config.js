/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0a0c0a',
          surface: '#11140f',
          raised: '#161a13',
          border: '#1f241a',
          muted: '#0d100b',
        },
        ink: {
          high: '#eef2e6',
          mid: '#a8b09c',
          low: '#6b7263',
          faint: '#3d4238',
        },
        lime: {
          50: '#f6ffe8',
          100: '#e9ffbf',
          200: '#d3ff8c',
          300: '#b5f94a',
          400: '#9ee62a',
          500: '#7ec81a',
          600: '#5e9d12',
          700: '#477512',
          800: '#385c14',
          900: '#2f4d16',
        },
        amber: {
          50: '#fffaeb',
          100: '#fff0c6',
          200: '#ffe08a',
          300: '#ffc94a',
          400: '#ffb01f',
          500: '#f98e0b',
          600: '#dd6a02',
          700: '#b74a06',
          800: '#94380c',
          900: '#7a2f0d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(158, 230, 42, 0.15), 0 0 24px -8px rgba(158, 230, 42, 0.4)',
        'glow-amber': '0 0 0 1px rgba(255, 176, 31, 0.18), 0 0 24px -8px rgba(255, 176, 31, 0.45)',
        card: '0 1px 0 rgba(255,255,255,0.02) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'scale-in': 'scaleIn 180ms cubic-bezier(0.2, 0.9, 0.3, 1.2)',
        'slide-up': 'slideUp 240ms cubic-bezier(0.2, 0.9, 0.3, 1.1)',
        'pulse-once': 'pulseOnce 600ms ease-out',
        shimmer: 'shimmer 2.4s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        scaleIn: { '0%': { opacity: 0, transform: 'scale(0.96)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        pulseOnce: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
