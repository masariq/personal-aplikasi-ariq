import { useMemo, useState } from 'react';
import { Filter, Inbox, TrendingUp, CheckCircle2, Search } from 'lucide-react';
import type { AppState, ISODate } from '../types';
import { activeHabits, weekOfDate } from '../utils/calc';
import { formatDate, weekdayLong, daysBetween } from '../utils/date';
import { Card } from './ui/Card';
import { Select, Input } from './ui/Field';
import { EmptyState } from './ui/EmptyState';
import { formatMoney } from '../utils/format';

interface HistoryRow {
  date: ISODate;
  completedCount: number;
  totalHabits: number;
  income: number;
  note: string;
  weekIndex: number | null;
}

export function HistoryPage({ state }: { state: AppState }) {
  const habits = activeHabits(state);
  const sym = state.challenge.currency.symbol;

  const rows: HistoryRow[] = useMemo(() => {
    return Object.values(state.entries)
      .filter(
        (e) =>
          e.completedHabitIds.length > 0 ||
          e.income > 0 ||
          e.note.trim().length > 0,
      )
      .map((e) => ({
        date: e.date,
        completedCount: e.completedHabitIds.length,
        totalHabits: habits.length,
        income: e.income,
        note: e.note,
        weekIndex: weekOfDate(state, e.date),
      }))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [state, habits.length]);

  const weekOptions = useMemo(() => {
    const set = new Set<number | null>();
    rows.forEach((r) => set.add(r.weekIndex));
    return Array.from(set)
      .filter((x) => x !== null)
      .sort((a, b) => (a! - b!)) as number[];
  }, [rows]);

  const [weekFilter, setWeekFilter] = useState<string>('all');
  const [query, setQuery] = useState('');

  const filtered = rows.filter((r) => {
    if (weekFilter !== 'all' && r.weekIndex !== Number(weekFilter)) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      const habitNames = state.entries[r.date]?.completedHabitIds
        .map((id) => habits.find((h) => h.id === id)?.name ?? '')
        .join(' ');
      const hay = `${r.date} ${r.note} ${habitNames}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const totalIncome = filtered.reduce((s, r) => s + r.income, 0);
  const totalCompletions = filtered.reduce((s, r) => s + r.completedCount, 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink-high">Riwayat</h1>
        <p className="text-sm text-ink-mid mt-0.5">
          Semua log harian yang sudah diisi — habit, income, dan catatan.
        </p>
      </div>

      <Card>
        <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-ink-mid text-sm shrink-0">
            <Filter className="w-4 h-4" /> Filter
          </div>
          <div className="flex-1 flex flex-col sm:flex-row gap-2">
            <Select
              value={weekFilter}
              onChange={(e) => setWeekFilter(e.target.value)}
              className="sm:w-44"
            >
              <option value="all">Semua minggu</option>
              {weekOptions.map((w) => (
                <option key={w} value={String(w)}>
                  Minggu {w}
                </option>
              ))}
            </Select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-low pointer-events-none" />
              <Input
                placeholder="Cari catatan / habit…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm shrink-0">
            <div className="text-right">
              <div className="font-mono font-semibold text-lime-300">{totalCompletions}</div>
              <div className="text-[10px] text-ink-low uppercase tracking-wider">habits</div>
            </div>
            <div className="text-right">
              <div className="font-mono font-semibold text-amber-300">
                {formatMoney(totalIncome, sym)}
              </div>
              <div className="text-[10px] text-ink-low uppercase tracking-wider">income</div>
            </div>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Inbox />}
            title={rows.length === 0 ? 'Belum ada log' : 'Tidak ada hasil'}
            description={
              rows.length === 0
                ? 'Log harian akan muncul di sini setelah kamu mencentang habit atau mengisi income di grid challenge.'
                : 'Coba ubah filter atau kata kunci pencarian.'
            }
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <HistoryRowCard key={r.date} row={r} state={state} sym={sym} />
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryRowCard({
  row,
  state,
  sym,
}: {
  row: HistoryRow;
  state: AppState;
  sym: string;
}) {
  const entry = state.entries[row.date];
  const habits = activeHabits(state);
  const completedHabits = entry?.completedHabitIds
    .map((id) => habits.find((h) => h.id === id))
    .filter(Boolean) as { name: string }[];
  const offset = daysBetween(state.challenge.startDate, row.date);
  const dayNumber = offset >= 0 && offset < state.challenge.totalDays ? offset + 1 : null;

  return (
    <Card hover className="p-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl border border-bg-border bg-bg-raised">
          <span className="font-mono text-[10px] uppercase text-ink-low">{weekdayLong(row.date).slice(0, 3)}</span>
          <span className="font-mono text-base font-semibold leading-none text-ink-high">
            {new Date(row.date).getDate()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-ink-high">{formatDate(row.date)}</span>
            {dayNumber && (
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-bg-raised text-lime-300 border border-bg-border">
                Day {dayNumber}
              </span>
            )}
            {row.weekIndex && (
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-bg-raised text-ink-mid border border-bg-border">
                Minggu {row.weekIndex}
              </span>
            )}
          </div>

          {row.income > 0 && (
            <div className="mt-1.5 flex items-center gap-1.5 text-amber-300">
              <TrendingUp className="w-4 h-4" />
              <span className="font-mono font-semibold text-sm">{formatMoney(row.income, sym)}</span>
            </div>
          )}

          {completedHabits.length > 0 && (
            <div className="mt-2 flex items-start gap-1.5 flex-wrap">
              <CheckCircle2 className="w-3.5 h-3.5 text-lime-400 mt-0.5 shrink-0" />
              <div className="flex flex-wrap gap-1">
                {completedHabits.map((h, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-1.5 py-0.5 rounded-md bg-lime-400/10 text-lime-200 border border-lime-400/20"
                  >
                    {h.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {row.note && (
            <p className="mt-2 text-sm text-ink-mid leading-relaxed whitespace-pre-wrap">{row.note}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
