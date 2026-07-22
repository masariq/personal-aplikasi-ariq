import { useEffect, useMemo, useState } from 'react';
import { Target, Settings2, TrendingUp, CalendarDays, Check } from 'lucide-react';
import type { AppState, ChallengeSettings, DayEntry, ISODate } from '../../types';
import {
  challengeStats,
  dayIntensity,
  activeHabits,
  getEntry,
} from '../../utils/calc';
import { todayISO, daysBetween, formatDate, monthShort, isToday } from '../../utils/date';
import type { Actions } from '../../lib/actions';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input, Field, Textarea, Select } from '../ui/Field';
import { ProgressBar } from '../ui/Progress';
import { confirm } from '../ui/Confirm';
import { toast } from '../ui/Toast';
import { twMerge } from '../ui/tw';
import { formatMoney, percent } from '../../utils/format';

const INTENSITY_CELL = [
  'bg-bg-raised border-bg-border',
  'bg-lime-900/60 border-lime-700/50',
  'bg-lime-700/70 border-lime-600/50',
  'bg-lime-500/80 border-lime-400/60',
  'bg-lime-400 border-lime-300 shadow-glow',
];

export function ChallengeSection({
  state,
  actions,
}: {
  state: AppState;
  actions: Actions;
}) {
  const stats = useMemo(() => challengeStats(state), [state]);
  const [editorDate, setEditorDate] = useState<ISODate | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { challenge } = state;
  const sym = challenge.currency.symbol;

  return (
    <Card glow={stats.started && stats.progress > 0}>
      <CardHeader
        icon={<Target />}
        title="Challenge"
        subtitle={`${challenge.totalDays}-day run · target ${formatMoney(challenge.targetIncome, sym)}`}
        action={
          <Button size="sm" variant="ghost" onClick={() => setSettingsOpen(true)}>
            <Settings2 className="w-4 h-4" /> Atur
          </Button>
        }
      />

      <div className="px-5 pt-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile
            label="Day"
            value={stats.started ? `${stats.dayNumber}` : '—'}
            sub={stats.started ? `/ ${challenge.totalDays}` : 'belum mulai'}
            accent="lime"
            icon={<CalendarDays className="w-3.5 h-3.5" />}
          />
          <StatTile
            label="Income"
            value={formatMoney(stats.totalIncome, sym, { compact: stats.totalIncome >= 10000 })}
            sub={`of ${formatMoney(challenge.targetIncome, sym, { compact: true })}`}
            accent="amber"
            icon={<TrendingUp className="w-3.5 h-3.5" />}
          />
          <StatTile
            label="Remaining"
            value={stats.ended ? '0' : `${stats.daysRemaining}`}
            sub={stats.ended ? 'finished' : 'days left'}
            accent="lime"
          />
          <StatTile
            label="Per day needed"
            value={
              stats.perDayNeeded === Infinity
                ? '—'
                : formatMoney(stats.perDayNeeded, sym, { compact: stats.perDayNeeded >= 1000 })
            }
            sub="avg to hit target"
            accent="amber"
          />
        </div>
      </div>

      <div className="px-5 pt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-ink-low">Progress to target</span>
          <span className="font-mono text-sm font-semibold text-amber-300">{percent(stats.progress)}</span>
        </div>
        <ProgressBar
          value={stats.progress}
          height={10}
          color="linear-gradient(90deg, #f98e0b, #ffc94a)"
        />
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-ink-low">
          <span className="font-mono">{formatMoney(stats.totalIncome, sym)}</span>
          <span className="font-mono">{formatMoney(challenge.targetIncome, sym)}</span>
        </div>
      </div>

      <div className="px-5 pt-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-ink-low">Activity grid</span>
          <IntensityLegend />
        </div>
        <ContributionGrid
          state={state}
          stats={stats}
          onPick={(d) => setEditorDate(d)}
        />
        <p className="mt-2 text-[11px] text-ink-low">
          Warna kotak = intensitas habit hari itu. Klik kotak untuk isi / edit income & catatan.
        </p>
      </div>

      <DayEditorModal
        open={editorDate !== null}
        date={editorDate}
        state={state}
        onClose={() => setEditorDate(null)}
        onSave={(date, patch) => {
          actions.setDayEntry(date, patch);
          toast('Data hari disimpan', 'success');
          setEditorDate(null);
        }}
        onClear={(date) => {
          confirm({
            title: 'Hapus data hari ini?',
            body: `Income, catatan, dan centang habit untuk ${formatDate(date)} akan dihapus.`,
            confirmLabel: 'Hapus',
            danger: true,
          }).then((ok) => {
            if (ok) {
              actions.clearDayEntry(date);
              toast('Data hari dihapus', 'success');
              setEditorDate(null);
            }
          });
        }}
      />

      <ChallengeSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={challenge}
        onSave={(patch) => {
          actions.updateChallenge(patch);
          toast('Challenge diperbarui', 'success');
          setSettingsOpen(false);
        }}
      />
    </Card>
  );
}

function StatTile({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: 'lime' | 'amber';
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-bg-border bg-bg-raised/60 px-3 py-2.5">
      <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-ink-low">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5 min-w-0">
        <span
          className={twMerge(
            'font-mono text-xl font-semibold tabular-nums truncate',
            accent === 'lime' ? 'text-lime-300' : 'text-amber-300',
          )}
        >
          {value}
        </span>
        {sub && <span className="text-[10px] text-ink-low truncate">{sub}</span>}
      </div>
    </div>
  );
}

function IntensityLegend() {
  return (
    <div className="flex items-center gap-1 text-[10px] text-ink-low">
      <span>Less</span>
      {INTENSITY_CELL.map((c, i) => (
        <div key={i} className={twMerge('h-2.5 w-2.5 rounded-[3px] border', c)} />
      ))}
      <span>More</span>
    </div>
  );
}

function ContributionGrid({
  state,
  stats,
  onPick,
}: {
  state: AppState;
  stats: ReturnType<typeof challengeStats>;
  onPick: (date: ISODate) => void;
}) {
  const { challenge } = state;
  const today = todayISO();

  const weeks: ISODate[][] = [];
  for (let i = 0; i < stats.days.length; i += 7) {
    weeks.push(stats.days.slice(i, i + 7));
  }

  return (
    <div className="overflow-x-auto scrollbar-thin -mx-1 px-1 pb-1">
      <div className="flex gap-1.5 min-w-min">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1.5">
            <div className="h-3 text-[9px] font-mono text-ink-low">
              {wi === 0 || monthShort(week[0]) !== monthShort(stats.days[wi * 7 - 1] ?? week[0])
                ? monthShort(week[0])
                : ''}
            </div>
            {week.map((date) => {
              const intensity = dayIntensity(state, date);
              const offset = daysBetween(challenge.startDate, date);
              const isCur = isToday(date);
              const isFuture = date > today;
              const entry = state.entries[date];
              const hasIncome = (entry?.income ?? 0) > 0;
              return (
                <button
                  key={date}
                  onClick={() => onPick(date)}
                  title={`Day ${offset + 1} · ${formatDate(date)} · ${entry?.completedHabitIds.length ?? 0} habits${hasIncome ? ` · ${formatMoney(entry!.income, challenge.currency.symbol)}` : ''}`}
                  className={twMerge(
                    'relative h-4 w-4 rounded-[4px] border transition-all duration-150 hover:scale-110 hover:z-10',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/50',
                    INTENSITY_CELL[intensity],
                    isCur && 'ring-1 ring-lime-400 ring-offset-1 ring-offset-bg-surface',
                    isFuture && 'opacity-40 hover:opacity-80',
                  )}
                >
                  {hasIncome && (
                    <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-amber-400 shadow-glow-amber" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'IDR', symbol: 'Rp', label: 'IDR (Rp)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  { code: 'INR', symbol: '₹', label: 'INR (₹)' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥)' },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$)' },
  { code: 'CAD', symbol: 'C$', label: 'CAD (C$)' },
  { code: 'SGD', symbol: 'S$', label: 'SGD (S$)' },
];

function ChallengeSettingsModal({
  open,
  onClose,
  settings,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  settings: ChallengeSettings;
  onSave: (patch: Partial<ChallengeSettings>) => void;
}) {
  const [startDate, setStartDate] = useState(settings.startDate);
  const [totalDays, setTotalDays] = useState(settings.totalDays);
  const [targetIncome, setTargetIncome] = useState(settings.targetIncome);
  const [currency, setCurrency] = useState(settings.currency.code);

  useEffect(() => {
    if (open) {
      setStartDate(settings.startDate);
      setTotalDays(settings.totalDays);
      setTargetIncome(settings.targetIncome);
      setCurrency(settings.currency.code);
    }
  }, [open, settings]);

  const cur = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Atur challenge"
      subtitle="Sesuaikan target, durasi, dan mata uang."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button
            variant="primary"
            disabled={totalDays < 1 || targetIncome < 0}
            onClick={() =>
              onSave({
                startDate,
                totalDays: Math.max(1, Math.round(totalDays)),
                targetIncome: Math.max(0, Number(targetIncome) || 0),
                currency: { code: cur.code, symbol: cur.symbol, label: cur.label },
              })
            }
          >
            Simpan
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tanggal mulai" htmlFor="ch-start">
            <Input id="ch-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Field>
          <Field label="Jumlah hari" htmlFor="ch-days">
            <Input
              id="ch-days"
              type="number"
              min={1}
              max={365}
              value={totalDays}
              onChange={(e) => setTotalDays(Number(e.target.value))}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Target pendapatan" htmlFor="ch-target">
            <Input
              id="ch-target"
              type="number"
              min={0}
              value={targetIncome}
              onChange={(e) => setTargetIncome(Number(e.target.value))}
            />
          </Field>
          <Field label="Mata uang" htmlFor="ch-currency">
            <Select id="ch-currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <p className="text-xs text-ink-low leading-relaxed">
          Mengubah tanggal mulai atau jumlah hari akan menggeser grid aktivitas. Income yang sudah
          diinput per tanggal tetap tersimpan.
        </p>
      </div>
    </Modal>
  );
}

function DayEditorModal({
  open,
  date,
  state,
  onClose,
  onSave,
  onClear,
}: {
  open: boolean;
  date: ISODate | null;
  state: AppState;
  onClose: () => void;
  onSave: (date: ISODate, patch: Partial<DayEntry>) => void;
  onClear: (date: ISODate) => void;
}) {
  const entry = date ? getEntry(state, date) : null;
  const [income, setIncome] = useState('');
  const [note, setNote] = useState('');
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    if (open && date && entry) {
      setIncome(entry.income ? String(entry.income) : '');
      setNote(entry.note ?? '');
      setCompleted(entry.completedHabitIds);
    } else if (open && date) {
      setIncome('');
      setNote('');
      setCompleted([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, date]);

  if (!date) return null;
  const habits = activeHabits(state);
  const offset = daysBetween(state.challenge.startDate, date);
  const dayNumber = offset + 1;
  const sym = state.challenge.currency.symbol;
  const isFutureDay = date > todayISO();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <span className="font-mono text-lime-400">Day {dayNumber}</span>
          <span className="text-ink-low">·</span>
          <span>{formatDate(date)}</span>
        </span>
      }
      subtitle={isFutureDay ? 'Tanggal di masa depan — boleh diisi untuk data susulan/rencana.' : undefined}
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="danger" size="sm" onClick={() => onClear(date)}>
            Hapus data
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Batal</Button>
            <Button
              variant="primary"
              onClick={() =>
                onSave(date, {
                  income: Number(income) || 0,
                  note: note.trim(),
                  completedHabitIds: completed,
                })
              }
            >
              Simpan
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <Field label={`Income (${sym})`} htmlFor="day-income">
          <Input
            id="day-income"
            type="number"
            min={0}
            step="any"
            placeholder="0"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            autoFocus
          />
        </Field>

        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-ink-mid mb-2">Habits selesai</div>
          {habits.length === 0 ? (
            <p className="text-sm text-ink-low">Belum ada habit. Tambahkan dari dashboard.</p>
          ) : (
            <div className="space-y-1">
              {habits.map((h) => {
                const on = completed.includes(h.id);
                return (
                  <button
                    key={h.id}
                    onClick={() =>
                      setCompleted((c) => (on ? c.filter((x) => x !== h.id) : [...c, h.id]))
                    }
                    className={twMerge(
                      'flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-all',
                      on
                        ? 'border-lime-400/50 bg-lime-400/[0.07] text-ink-high'
                        : 'border-bg-border bg-bg-raised text-ink-mid hover:border-ink-faint',
                    )}
                  >
                    <span
                      className={twMerge(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                        on ? 'border-lime-400 bg-lime-400 text-bg-base' : 'border-bg-border text-transparent',
                      )}
                    >
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    </span>
                    <span className="text-sm font-medium truncate">{h.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Field label="Catatan" htmlFor="day-note">
          <Textarea
            id="day-note"
            rows={3}
            placeholder="Apa yang kamu kerjakan hari itu?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}
