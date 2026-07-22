import { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  Trash2,
  X,
  CalendarDays,
  Flag,
  CalendarCheck,
} from 'lucide-react';
import type { AppState, ISODate, AgendaItem } from '../types';
import {
  todayISO,
  addDaysISO,
  startOfWeek,
  fromISODate,
  toISODate,
  formatDate,
  weekdayLong,
  monthShort,
  isToday,
} from '../utils/date';
import { weekOfDate } from '../utils/calc';
import type { Actions } from '../lib/actions';
import { Card, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Field';
import { EmptyState } from './ui/EmptyState';
import { toast } from './ui/Toast';
import { twMerge } from './ui/tw';

const WEEKDAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function firstOfMonth(iso: ISODate): ISODate {
  const d = fromISODate(iso);
  return toISODate(new Date(d.getFullYear(), d.getMonth(), 1));
}

function monthGrid(first: ISODate): ISODate[] {
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => addDaysISO(start, i));
}

function relativeLabel(date: ISODate): string {
  const today = todayISO();
  if (date === today) return 'Hari ini';
  if (date === addDaysISO(today, 1)) return 'Besok';
  return weekdayLong(date);
}

export function AgendaPage({
  state,
  actions,
}: {
  state: AppState;
  actions: Actions;
}) {
  const today = todayISO();
  const [viewMonth, setViewMonth] = useState<ISODate>(() => firstOfMonth(today));
  const [selected, setSelected] = useState<ISODate>(today);

  const grid = useMemo(() => monthGrid(viewMonth), [viewMonth]);
  const items = state.agenda[selected] ?? [];
  const doneCount = items.filter((i) => i.done).length;

  const weekIdx = weekOfDate(state, selected);
  const week = weekIdx != null ? state.weeks.find((w) => w.index === weekIdx) ?? null : null;

  const shiftMonth = (delta: number) => {
    const d = fromISODate(viewMonth);
    setViewMonth(toISODate(new Date(d.getFullYear(), d.getMonth() + delta, 1)));
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink-high">Agenda</h1>
        <p className="text-sm text-ink-mid mt-0.5">
          Rencana harian per tanggal. Klik tanggal untuk lihat atau tambah tugas.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <Card>
          <CardHeader
            icon={<CalendarDays />}
            title="Kalender"
            subtitle={`${monthShort(viewMonth)} ${fromISODate(viewMonth).getFullYear()}`}
            action={
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" onClick={() => shiftMonth(-1)} aria-label="Bulan sebelumnya">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setViewMonth(firstOfMonth(today));
                    setSelected(today);
                  }}
                >
                  Hari ini
                </Button>
                <Button size="icon" variant="ghost" onClick={() => shiftMonth(1)} aria-label="Bulan berikutnya">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            }
          />
          <div className="p-4 sm:p-5 pt-3">
            <div className="grid grid-cols-7 gap-1.5 mb-1.5">
              {WEEKDAY_LABELS.map((w) => (
                <div
                  key={w}
                  className="text-center text-[10px] font-mono font-semibold uppercase tracking-wider text-ink-low"
                >
                  {w}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {grid.map((date) => {
                const inMonth = fromISODate(date).getMonth() === fromISODate(viewMonth).getMonth();
                const isCur = isToday(date);
                const isPast = date < today;
                const isSelected = date === selected;
                const dayItems = state.agenda[date] ?? [];
                const hasItems = dayItems.length > 0;
                const allDone = hasItems && dayItems.every((i) => i.done);
                return (
                  <button
                    key={date}
                    onClick={() => setSelected(date)}
                    className={twMerge(
                      'relative flex h-9 sm:h-11 flex-col items-center justify-center rounded-lg border text-sm font-mono transition-all',
                      'hover:border-ink-faint/60 hover:bg-bg-raised',
                      !inMonth && 'opacity-35',
                      isPast && !isCur && 'text-ink-low',
                      !isPast && !isSelected && 'text-ink-mid',
                      isCur && !isSelected && 'border-lime-400/60 text-lime-300',
                      isSelected && 'border-lime-400 bg-lime-400 text-bg-base shadow-glow hover:bg-lime-400 hover:border-lime-400',
                      !isSelected && 'border-bg-border bg-bg-raised/40',
                    )}
                  >
                    {fromISODate(date).getDate()}
                    {hasItems && (
                      <span
                        className={twMerge(
                          'absolute bottom-1 h-1.5 w-1.5 rounded-full',
                          isSelected ? 'bg-bg-base' : allDone ? 'bg-lime-400' : 'bg-amber-400',
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-4 text-[11px] text-ink-low">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> ada tugas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-lime-400" /> semua selesai
              </span>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          {week && (
            <div className="rounded-xl border border-amber-400/30 bg-amber-400/[0.06] px-4 py-3 flex items-center gap-3 animate-slide-up">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/15 text-amber-300">
                <Flag className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-300/80">
                  Fokus minggu ini
                </div>
                <div className="text-sm text-ink-high font-medium truncate">
                  Minggu {week.index} · {week.focus}
                </div>
              </div>
            </div>
          )}

          <Card>
            <CardHeader
              icon={<CalendarCheck />}
              title={relativeLabel(selected)}
              subtitle={formatDate(selected)}
            />
            <div className="p-4 sm:p-5 pt-3">
              {items.length > 0 && (
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-ink-low">
                    {doneCount}/{items.length} selesai
                  </span>
                  <div className="h-1.5 w-24 rounded-full bg-bg-raised overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-lime-500 to-lime-300 transition-all duration-500"
                      style={{ width: `${(doneCount / items.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {items.length === 0 ? (
                <EmptyState
                  icon={<CalendarCheck />}
                  title="Belum ada agenda"
                  description="Tambahkan tugas atau rencana untuk tanggal ini di bawah."
                />
              ) : (
                <ul className="space-y-1">
                  {items.map((item) => (
                    <AgendaItemRow
                      key={item.id}
                      item={item}
                      onToggle={() => actions.toggleAgendaItem(selected, item.id)}
                      onDelete={() => {
                        actions.deleteAgendaItem(selected, item.id);
                        toast('Tugas dihapus', 'success');
                      }}
                      onEdit={(text) => actions.updateAgendaItem(selected, item.id, text)}
                    />
                  ))}
                </ul>
              )}

              <AddAgendaForm
                onAdd={(text) => {
                  actions.addAgendaItem(selected, text);
                  toast('Tugas ditambahkan', 'success');
                }}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AgendaItemRow({
  item,
  onToggle,
  onDelete,
  onEdit,
}: {
  item: AgendaItem;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: (text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(item.text);

  useEffect(() => {
    setValue(item.text);
  }, [item.text]);

  if (editing) {
    return (
      <li className="flex gap-2 items-center">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onEdit(value.trim());
              setEditing(false);
            } else if (e.key === 'Escape') {
              setEditing(false);
              setValue(item.text);
            }
          }}
          autoFocus
          className="h-9 text-sm"
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            onEdit(value.trim());
            setEditing(false);
          }}
        >
          <Check className="w-4 h-4 text-lime-400" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            setEditing(false);
            setValue(item.text);
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      </li>
    );
  }

  return (
    <li className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-bg-raised transition-colors">
      <button
        onClick={onToggle}
        className={twMerge(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all active:scale-90',
          item.done
            ? 'border-lime-400 bg-lime-400 text-bg-base'
            : 'border-bg-border bg-bg-raised text-transparent hover:border-lime-400/50',
        )}
      >
        <Check className="w-3.5 h-3.5" strokeWidth={3} />
      </button>
      <button
        onClick={() => setEditing(true)}
        className={twMerge(
          'flex-1 text-left text-sm truncate',
          item.done ? 'text-ink-low line-through' : 'text-ink-high',
        )}
      >
        {item.text}
      </button>
      <button
        onClick={onDelete}
        className="shrink-0 rounded-md p-1 text-ink-low opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
        aria-label="Hapus tugas"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </li>
  );
}

function AddAgendaForm({ onAdd }: { onAdd: (text: string) => void }) {
  const [text, setText] = useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim()) {
          onAdd(text.trim());
          setText('');
        }
      }}
      className="mt-3 flex gap-2"
    >
      <Input
        placeholder="Tambah tugas untuk tanggal ini…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="h-9 text-sm"
      />
      <Button type="submit" variant="secondary" size="sm" disabled={!text.trim()}>
        <Plus className="w-4 h-4" />
      </Button>
    </form>
  );
}
