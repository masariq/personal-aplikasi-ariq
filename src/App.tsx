import { useMemo, useState, lazy, Suspense } from 'react';
import {
  LayoutDashboard,
  CalendarRange,
  CalendarCheck,
  History,
  Terminal,
  Menu,
  X,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useAppState, defaultState } from './lib/storage';
import { useActions } from './lib/actions';
import { ToastViewport } from './components/ui/Toast';
import { ConfirmHost, confirm } from './components/ui/Confirm';
import { Button } from './components/ui/Button';
import { CardSkeleton } from './components/ui/LoadingSpinner';
import { challengeStats } from './utils/calc';
import { todayISO, formatDate } from './utils/date';
import { twMerge } from './components/ui/tw';

const DashboardPage = lazy(() =>
  import('./components/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const AgendaPage = lazy(() =>
  import('./components/AgendaPage').then((m) => ({ default: m.AgendaPage })),
);
const WeeklyPlanPage = lazy(() =>
  import('./components/WeeklyPlanPage').then((m) => ({ default: m.WeeklyPlanPage })),
);
const HistoryPage = lazy(() =>
  import('./components/HistoryPage').then((m) => ({ default: m.HistoryPage })),
);

type Tab = 'dashboard' | 'agenda' | 'plan' | 'history';

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'agenda', label: 'Agenda', icon: CalendarCheck },
  { id: 'plan', label: 'Rencana', icon: CalendarRange },
  { id: 'history', label: 'Riwayat', icon: History },
];

export default function App() {
  const [state, setState] = useAppState();
  const actions = useActions(setState);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [navOpen, setNavOpen] = useState(false);

  const stats = useMemo(() => challengeStats(state), [state]);
  const today = todayISO();

  return (
    <div className="min-h-screen bg-bg-base text-ink-high grid-pattern">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-bg-border bg-bg-base/80 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-400 text-bg-base shadow-glow">
                <Terminal className="w-4.5 h-4.5" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <div className="font-semibold tracking-tight leading-none truncate">Build Log</div>
                <div className="text-[10px] font-mono text-ink-low mt-0.5 hidden sm:block">
                  {formatDate(today)}
                  {stats.started && ` · day ${stats.dayNumber}/${state.challenge.totalDays}`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  confirm({
                    title: 'Reset semua data?',
                    body: 'Semua habit, log, minggu, dan pengaturan challenge akan dihapus. Tidak bisa dibatalkan.',
                    confirmLabel: 'Reset',
                    danger: true,
                  }).then((ok) => {
                    if (ok) {
                      setState({ ...defaultState(), seeded: true });
                      setTab('dashboard');
                    }
                  })
                }
                className="hidden sm:inline-flex"
                title="Reset data"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </Button>
              <button
                className="sm:hidden rounded-lg p-2 text-ink-mid hover:text-ink-high hover:bg-bg-raised"
                onClick={() => setNavOpen((v) => !v)}
                aria-label="Menu"
              >
                {navOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-5 sm:py-7 pb-24">
        {/* Desktop tabs */}
        <nav className="hidden sm:flex items-center gap-1 mb-5 border-b border-bg-border">
          {TABS.map((t) => (
            <TabButton
              key={t.id}
              active={tab === t.id}
              onClick={() => setTab(t.id)}
              icon={<t.icon className="w-4 h-4" />}
              label={t.label}
            />
          ))}
        </nav>

        {/* Mobile tab bar */}
        <nav className="sm:hidden flex items-center gap-1 mb-4 -mx-4 px-4 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <TabButton
              key={t.id}
              active={tab === t.id}
              onClick={() => { setTab(t.id); setNavOpen(false); }}
              icon={<t.icon className="w-4 h-4" />}
              label={t.label}
              compact
            />
          ))}
        </nav>

        {/* Seed banner */}
        {!state.seeded && (
          <SeedBanner onLoadSeed={() => setState({ ...defaultState(), seeded: true })} />
        )}

        <main className="animate-fade-in">
          <Suspense fallback={<CardSkeleton />}>
            {tab === 'dashboard' && (
              <DashboardPage
                state={state}
                actions={actions}
                onGoToAgenda={() => setTab('agenda')}
              />
            )}
            {tab === 'agenda' && <AgendaPage state={state} actions={actions} />}
            {tab === 'plan' && <WeeklyPlanPage state={state} actions={actions} />}
            {tab === 'history' && <HistoryPage state={state} />}
          </Suspense>
        </main>

        <footer className="mt-12 pt-6 border-t border-bg-border text-center">
          <p className="text-[11px] font-mono text-ink-low">
            build_log · data stored locally in your browser · v{state.version}
          </p>
        </footer>
      </div>

      <ToastViewport />
      <ConfirmHost />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  compact,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={twMerge(
        'relative flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
        active ? 'text-lime-300' : 'text-ink-mid hover:text-ink-high',
        compact && 'rounded-lg hover:bg-bg-raised',
      )}
    >
      {icon}
      {label}
      {!compact && active && (
        <span className="absolute inset-x-0 -bottom-px h-0.5 bg-lime-400 rounded-full" />
      )}
      {compact && active && <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />}
    </button>
  );
}

function SeedBanner({ onLoadSeed }: { onLoadSeed: () => void }) {
  return (
    <div className="mb-5 rounded-2xl border border-amber-400/30 bg-amber-400/[0.06] p-4 sm:p-5 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-ink-high">Mulai dari contoh?</h3>
          <p className="mt-1 text-sm text-ink-mid leading-relaxed">
            Muat data contoh: 4 habit harian, 8 minggu rencana, dan challenge 60 hari menuju $5.000.
            Semua bisa diubah setelahnya.
          </p>
          <div className="mt-3 flex gap-2">
            <Button variant="amber" size="sm" onClick={onLoadSeed}>
              <Sparkles className="w-4 h-4" /> Muat data contoh
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
