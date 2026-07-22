import { useEffect, useState } from 'react';
import { Check, Flame, Plus, Pencil, Trash2, CalendarCheck } from 'lucide-react';
import type { AppState, Habit, ID } from '../../types';
import { activeHabits, getEntry, habit7DayGrid, currentStreak, weeklyConsistency, todayProgress, last7Days } from '../../utils/calc';
import { todayISO, weekdayShort, dayOfMonth, formatDateShort, isToday } from '../../utils/date';
import type { Actions } from '../../lib/actions';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input, Field, Textarea } from '../ui/Field';
import { EmptyState } from '../ui/EmptyState';
import { ProgressRing } from '../ui/Progress';
import { confirm } from '../ui/Confirm';
import { toast } from '../ui/Toast';
import { twMerge } from '../ui/tw';
import { percent } from '../../utils/format';

export function HabitTracker({
  state,
  actions,
}: {
  state: AppState;
  actions: Actions;
}) {
  const habits = activeHabits(state);
  const [editId, setEditId] = useState<ID | null>(null);
  const [adding, setAdding] = useState(false);

  const streak = currentStreak(state);
  const weekly = weeklyConsistency(state);
  const todayEntry = getEntry(state, todayISO());
  const completedToday = todayEntry.completedHabitIds.length;
  const tp = todayProgress(state);
  const last7 = last7Days();

  return (
    <Card>
      <CardHeader
        icon={<CalendarCheck />}
        title="Hari ini"
        subtitle={formatDateShort(todayISO())}
        action={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setAdding(true)}>
              <Plus className="w-4 h-4" /> Habit
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-px bg-bg-border mt-4 mx-5 rounded-xl overflow-hidden border border-bg-border">
        <SummaryCell
          label="Streak"
          value={streak > 0 ? `${streak}` : '0'}
          suffix={streak === 1 ? 'day' : 'days'}
          accent="lime"
          icon={<Flame className="w-3.5 h-3.5" />}
        />
        <SummaryCell
          label="Today"
          value={`${completedToday}/${habits.length || 0}`}
          suffix="done"
          accent="lime"
        />
        <SummaryCell
          label="Week"
          value={percent(weekly.percent)}
          suffix={`${weekly.completed}/${weekly.total}`}
          accent="amber"
        />
      </div>

      <div className="p-5 pt-4">
        {habits.length === 0 ? (
          <EmptyState
            icon={<CalendarCheck />}
            title="Belum ada habit"
            description="Tambahkan kebiasaan harian yang ingin kamu track — misalnya kirim proposal, bikin karya, atau outreach."
            action={
              <Button variant="primary" onClick={() => setAdding(true)}>
                <Plus className="w-4 h-4" /> Tambah habit pertama
              </Button>
            }
          />
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="flex-1 text-[11px] font-medium uppercase tracking-wider text-ink-low">Habit</div>
              <div className="flex items-center gap-1.5">
                {last7.map((d) => (
                  <div
                    key={d}
                    className={twMerge(
                      'w-7 text-center text-[10px] font-mono',
                      isToday(d) ? 'text-lime-400' : 'text-ink-low',
                    )}
                  >
                    <div>{weekdayShort(d)}</div>
                    <div className="text-ink-faint">{dayOfMonth(d)}</div>
                  </div>
                ))}
              </div>
              <div className="w-8" />
            </div>

            {habits.map((habit) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                state={state}
                actions={actions}
                onEdit={() => setEditId(habit.id)}
              />
            ))}
          </div>
        )}
      </div>

      {habits.length > 0 && (
        <div className="flex items-center justify-between gap-3 border-t border-bg-border px-5 py-3 bg-bg-muted/40">
          <div className="flex items-center gap-2">
            <ProgressRing value={tp} size={34} stroke={4}>
              <span className="text-[10px] font-mono font-semibold text-lime-400">
                {Math.round(tp * 100)}
              </span>
            </ProgressRing>
            <div>
              <div className="text-xs font-medium text-ink-high">Progress hari ini</div>
              <div className="text-[11px] text-ink-low">
                {completedToday} dari {habits.length} habit selesai
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-ink-low uppercase tracking-wider">Konsistensi mingguan</div>
            <div className="text-sm font-mono font-semibold text-amber-300">{percent(weekly.percent)}</div>
          </div>
        </div>
      )}

      <HabitEditModal
        open={editId !== null}
        onClose={() => setEditId(null)}
        habit={habits.find((h) => h.id === editId) ?? null}
        onSave={(name, note) => {
          if (editId) {
            actions.updateHabit(editId, { name, note });
            toast('Habit diperbarui', 'success');
          }
          setEditId(null);
        }}
        onDelete={() => {
          if (!editId) return;
          const h = habits.find((x) => x.id === editId);
          confirm({
            title: 'Hapus habit?',
            body: `"${h?.name}" akan dihapus dari daftar. Riwayat 7-day grid untuk habit ini juga akan hilang.`,
            confirmLabel: 'Hapus',
            danger: true,
          }).then((ok) => {
            if (ok) {
              actions.deleteHabit(editId);
              toast('Habit dihapus', 'success');
              setEditId(null);
            }
          });
        }}
      />

      <HabitAddModal
        open={adding}
        onClose={() => setAdding(false)}
        onAdd={(name, note) => {
          actions.addHabit(name, note);
          toast('Habit ditambahkan', 'success');
          setAdding(false);
        }}
      />
    </Card>
  );
}

function SummaryCell({
  label,
  value,
  suffix,
  accent,
  icon,
}: {
  label: string;
  value: string;
  suffix?: string;
  accent: 'lime' | 'amber';
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-bg-surface px-3 py-2.5 flex flex-col">
      <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-ink-low">
        {icon}
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span
          className={twMerge(
            'font-mono text-lg font-semibold tabular-nums',
            accent === 'lime' ? 'text-lime-300' : 'text-amber-300',
          )}
        >
          {value}
        </span>
        {suffix && <span className="text-[10px] text-ink-low">{suffix}</span>}
      </div>
    </div>
  );
}

function HabitRow({
  habit,
  state,
  actions,
  onEdit,
}: {
  habit: Habit;
  state: AppState;
  actions: Actions;
  onEdit: () => void;
}) {
  const grid = habit7DayGrid(state, habit.id);
  const todayEntry = getEntry(state, todayISO());
  const doneToday = todayEntry.completedHabitIds.includes(habit.id);
  const last7 = last7Days();

  return (
    <div
      className={twMerge(
        'group flex items-center gap-2 rounded-xl px-2 py-2 transition-colors',
        doneToday ? 'bg-lime-400/[0.06]' : 'hover:bg-bg-raised',
      )}
    >
      <button
        onClick={() => actions.toggleHabitToday(habit.id)}
        className={twMerge(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-all duration-150 active:scale-90',
          doneToday
            ? 'border-lime-400 bg-lime-400 text-bg-base shadow-glow'
            : 'border-bg-border bg-bg-raised text-transparent hover:border-lime-400/50',
        )}
        aria-label={doneToday ? 'Mark incomplete' : 'Mark complete'}
      >
        <Check className="w-4 h-4" strokeWidth={3} />
      </button>

      <div className="flex-1 min-w-0">
        <div
          className={twMerge(
            'text-sm font-medium truncate',
            doneToday ? 'text-lime-100' : 'text-ink-high',
          )}
        >
          {habit.name}
        </div>
        {habit.note && <div className="text-[11px] text-ink-low truncate">{habit.note}</div>}
      </div>

      <div className="flex items-center gap-1.5">
        {grid.map((done, i) => {
          const d = last7[i];
          const isTodayCell = isToday(d);
          return (
            <div
              key={d}
              title={`${formatDateShort(d)} — ${done ? 'selesai' : 'kosong'}`}
              className={twMerge(
                'h-5 w-5 rounded-[5px] border transition-colors',
                done
                  ? 'bg-lime-400/80 border-lime-400'
                  : 'bg-bg-raised border-bg-border',
                isTodayCell && !done && 'border-lime-400/40',
                isTodayCell && 'ring-1 ring-lime-400/30 ring-offset-0',
              )}
            />
          );
        })}
      </div>

      <button
        onClick={onEdit}
        className="shrink-0 rounded-md p-1.5 text-ink-low opacity-0 group-hover:opacity-100 hover:text-ink-high hover:bg-bg-border transition-all"
        aria-label="Edit habit"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function HabitAddModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, note?: string) => void;
}) {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  useEffectReset(open, () => {
    setName('');
    setNote('');
  });
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tambah habit"
      subtitle="Kebiasaan harian yang ingin kamu track."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button variant="primary" disabled={!name.trim()} onClick={() => onAdd(name.trim(), note.trim())}>
            <Plus className="w-4 h-4" /> Tambah
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Nama habit" htmlFor="habit-name">
          <Input
            id="habit-name"
            autoFocus
            placeholder="mis. Bikin karya portofolio"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && name.trim()) onAdd(name.trim(), note.trim());
            }}
          />
        </Field>
        <Field label="Catatan (opsional)" htmlFor="habit-note">
          <Textarea
            id="habit-note"
            rows={2}
            placeholder="Detail kecil atau target spesifik"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}

function HabitEditModal({
  open,
  onClose,
  habit,
  onSave,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  habit: Habit | null;
  onSave: (name: string, note?: string) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  useEffectReset(open, () => {
    setName(habit?.name ?? '');
    setNote(habit?.note ?? '');
  }, [habit]);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit habit"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="danger" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4" /> Hapus
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button variant="primary" disabled={!name.trim()} onClick={() => onSave(name.trim(), note.trim())}>
              Simpan
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <Field label="Nama habit" htmlFor="habit-edit-name">
          <Input
            id="habit-edit-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Catatan" htmlFor="habit-edit-note">
          <Textarea
            id="habit-edit-note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}

function useEffectReset(open: boolean, reset: () => void, deps: unknown[] = []) {
  useEffect(() => {
    if (open) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ...deps]);
}
