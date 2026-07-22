import { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  Check,
  Calendar,
  Target,
  Flag,
  ChevronDown,
  ChevronRight,
  Pencil,
  X,
} from 'lucide-react';
import type { AppState, ID, WeekPlan } from '../types';
import { currentWeek } from '../utils/calc';
import { todayISO, formatDate, daysBetween, addDaysISO } from '../utils/date';
import type { Actions } from '../lib/actions';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Input, Field, Textarea } from './ui/Field';
import { EmptyState } from './ui/EmptyState';
import { confirm } from './ui/Confirm';
import { toast } from './ui/Toast';
import { twMerge } from './ui/tw';

export function WeeklyPlanPage({
  state,
  actions,
}: {
  state: AppState;
  actions: Actions;
}) {
  const weeks = [...state.weeks].sort((a, b) => a.index - b.index);
  const { weekIndex: curIdx } = currentWeek(state);
  const [editingId, setEditingId] = useState<ID | null>(null);
  const [expanded, setExpanded] = useState<Set<ID>>(() => new Set());

  const toggleExpand = (id: ID) =>
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink-high">Rencana mingguan</h1>
          <p className="text-sm text-ink-mid mt-0.5">
            {weeks.length > 0
              ? `${weeks.length} minggu · minggu berjalan: ${curIdx ? `Minggu ${curIdx}` : '—'}`
              : 'Susun rencana kerja per minggu untuk challenge ini.'}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => actions.addWeek()}>
          <Plus className="w-4 h-4" /> Minggu
        </Button>
      </div>

      {weeks.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Calendar />}
            title="Belum ada minggu"
            description="Tambahkan minggu pertama untuk mulai menyusun rencana kerja. Tiap minggu punya fokus, deskripsi, dan daftar target."
            action={
              <Button variant="primary" onClick={() => actions.addWeek()}>
                <Plus className="w-4 h-4" /> Tambah minggu pertama
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {weeks.map((w) => {
            const isCurrent = curIdx === w.index;
            const done = w.targets.filter((t) => t.done).length;
            const total = w.targets.length;
            const isOpen = expanded.has(w.id) || isCurrent;
            return (
              <WeekCard
                key={w.id}
                week={w}
                isCurrent={isCurrent}
                isOpen={isOpen}
                done={done}
                total={total}
                actions={actions}
                onToggle={() => toggleExpand(w.id)}
                onEdit={() => setEditingId(w.id)}
              />
            );
          })}
        </div>
      )}

      <WeekEditModal
        open={editingId !== null}
        week={weeks.find((w) => w.id === editingId) ?? null}
        onClose={() => setEditingId(null)}
        onSave={(patch) => {
          if (editingId) {
            actions.updateWeek(editingId, patch);
            toast('Minggu diperbarui', 'success');
            setEditingId(null);
          }
        }}
        onDelete={() => {
          if (!editingId) return;
          confirm({
            title: 'Hapus minggu?',
            body: 'Minggu beserta semua target di dalamnya akan dihapus.',
            confirmLabel: 'Hapus',
            danger: true,
          }).then((ok) => {
            if (ok) {
              actions.deleteWeek(editingId);
              toast('Minggu dihapus', 'success');
              setEditingId(null);
            }
          });
        }}
      />
    </div>
  );
}

function WeekCard({
  week,
  isCurrent,
  isOpen,
  done,
  total,
  actions,
  onToggle,
  onEdit,
}: {
  week: WeekPlan;
  isCurrent: boolean;
  isOpen: boolean;
  done: number;
  total: number;
  actions: Actions;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const [newTarget, setNewTarget] = useState('');
  const pct = total > 0 ? done / total : 0;
  const today = todayISO();
  const daysUntil = week.startDate ? daysBetween(today, week.startDate) : null;
  const weekEnd = week.startDate ? addDaysISO(week.startDate, 6) : null;

  return (
    <Card
      className={twMerge(
        'transition-all',
        isCurrent && 'border-lime-400/50 shadow-glow',
      )}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <button
            onClick={onToggle}
            className="mt-0.5 -ml-1 rounded-md p-1 text-ink-low hover:text-ink-high hover:bg-bg-raised transition-colors"
            aria-label={isOpen ? 'Collapse' : 'Expand'}
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={twMerge(
                  'font-mono text-xs font-semibold px-2 py-0.5 rounded-md',
                  isCurrent ? 'bg-lime-400 text-bg-base' : 'bg-bg-raised text-ink-mid border border-bg-border',
                )}
              >
                MINGGU {week.index}
              </span>
              {isCurrent && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-lime-300">
                  <Flag className="w-3 h-3" /> Sedang berjalan
                </span>
              )}
              {!isCurrent && daysUntil !== null && daysUntil > 0 && (
                <span className="text-[11px] text-ink-low">in {daysUntil}d</span>
              )}
              {!isCurrent && daysUntil !== null && daysUntil < 0 && weekEnd && (
                <span className="text-[11px] text-ink-low">ended {formatDate(weekEnd)}</span>
              )}
            </div>
            <h3 className="mt-2 text-base font-semibold text-ink-high tracking-tight">{week.focus}</h3>
            {week.description && (
              <p className="mt-1 text-sm text-ink-mid leading-relaxed">{week.description}</p>
            )}
            {week.startDate && (
              <p className="mt-1.5 text-[11px] font-mono text-ink-low">
                {formatDate(week.startDate)} → {formatDate(addDaysISO(week.startDate, 6))}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="font-mono text-sm font-semibold text-lime-300">
                {done}/{total}
              </div>
              <div className="text-[10px] text-ink-low uppercase tracking-wider">targets</div>
            </div>
            <button
              onClick={onEdit}
              className="rounded-md p-1.5 text-ink-low hover:text-ink-high hover:bg-bg-raised transition-colors"
              aria-label="Edit week"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        </div>

        {total > 0 && (
          <div className="mt-3 h-1.5 w-full rounded-full bg-bg-raised overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-lime-500 to-lime-300 transition-all duration-500"
              style={{ width: `${pct * 100}%` }}
            />
          </div>
        )}

        {isOpen && (
          <div className="mt-4 animate-slide-up">
            <div className="text-[11px] font-medium uppercase tracking-wider text-ink-low mb-2 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Target minggu ini
            </div>
            {week.targets.length === 0 ? (
              <p className="text-sm text-ink-low py-2">Belum ada target. Tambahkan di bawah.</p>
            ) : (
              <ul className="space-y-1">
                {week.targets.map((t) => (
                  <TargetRow
                    key={t.id}
                    text={t.text}
                    done={t.done}
                    onToggle={() => actions.toggleTarget(week.id, t.id)}
                    onDelete={() => actions.deleteTarget(week.id, t.id)}
                    onEdit={(text) => actions.updateTarget(week.id, t.id, text)}
                  />
                ))}
              </ul>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newTarget.trim()) {
                  actions.addTarget(week.id, newTarget);
                  setNewTarget('');
                }
              }}
              className="mt-3 flex gap-2"
            >
              <Input
                placeholder="Tambah target…"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="h-9 text-sm"
              />
              <Button type="submit" variant="secondary" size="sm" disabled={!newTarget.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </Card>
  );
}

function TargetRow({
  text,
  done,
  onToggle,
  onDelete,
  onEdit,
}: {
  text: string;
  done: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: (text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);

  useEffect(() => {
    setValue(text);
  }, [text]);

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
              setValue(text);
            }
          }}
          autoFocus
          className="h-9 text-sm"
        />
        <Button size="icon" variant="ghost" onClick={() => { onEdit(value.trim()); setEditing(false); }}>
          <Check className="w-4 h-4 text-lime-400" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => { setEditing(false); setValue(text); }}>
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
          done ? 'border-lime-400 bg-lime-400 text-bg-base' : 'border-bg-border bg-bg-raised text-transparent hover:border-lime-400/50',
        )}
      >
        <Check className="w-3.5 h-3.5" strokeWidth={3} />
      </button>
      <button
        onClick={() => setEditing(true)}
        className={twMerge(
          'flex-1 text-left text-sm truncate',
          done ? 'text-ink-low line-through' : 'text-ink-high',
        )}
      >
        {text}
      </button>
      <button
        onClick={onDelete}
        className="shrink-0 rounded-md p-1 text-ink-low opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
        aria-label="Delete target"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </li>
  );
}

function WeekEditModal({
  open,
  week,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  week: WeekPlan | null;
  onClose: () => void;
  onSave: (patch: Partial<Pick<WeekPlan, 'focus' | 'description' | 'startDate'>>) => void;
  onDelete: () => void;
}) {
  const [focus, setFocus] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');

  useEffect(() => {
    if (open && week) {
      setFocus(week.focus);
      setDescription(week.description);
      setStartDate(week.startDate ?? '');
    }
  }, [open, week]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={week ? `Edit Minggu ${week.index}` : 'Edit minggu'}
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="danger" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4" /> Hapus
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Batal</Button>
            <Button
              variant="primary"
              disabled={!focus.trim()}
              onClick={() =>
                onSave({
                  focus: focus.trim(),
                  description: description.trim(),
                  startDate: startDate || undefined,
                })
              }
            >
              Simpan
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <Field label="Fokus minggu" htmlFor="week-focus">
          <Input id="week-focus" value={focus} onChange={(e) => setFocus(e.target.value)} autoFocus />
        </Field>
        <Field label="Deskripsi singkat" htmlFor="week-desc">
          <Textarea
            id="week-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <Field label="Tanggal mulai (opsional)" htmlFor="week-start" hint="Dipakai untuk menandai minggu berjalan.">
          <Input id="week-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
