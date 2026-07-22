import { useState } from 'react';
import { Sunrise, Plus, Check, ArrowRight } from 'lucide-react';
import type { AppState } from '../../types';
import { todayISO, addDaysISO, formatDateShort } from '../../utils/date';
import type { Actions } from '../../lib/actions';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Field';
import { twMerge } from '../ui/tw';

export function TomorrowCard({
  state,
  actions,
  onGoToAgenda,
}: {
  state: AppState;
  actions: Actions;
  onGoToAgenda: () => void;
}) {
  const tomorrow = addDaysISO(todayISO(), 1);
  const items = state.agenda[tomorrow] ?? [];
  const done = items.filter((i) => i.done).length;
  const [text, setText] = useState('');

  return (
    <Card>
      <CardHeader
        icon={<Sunrise />}
        title="Besok"
        subtitle={formatDateShort(tomorrow)}
        action={
          <button
            onClick={onGoToAgenda}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-mid hover:text-lime-300 transition-colors"
          >
            Lihat di Agenda <ArrowRight className="w-3.5 h-3.5" />
          </button>
        }
      />
      <div className="p-4 sm:p-5 pt-3">
        {items.length > 0 && (
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-ink-low">
              {done}/{items.length} selesai
            </span>
          </div>
        )}
        {items.length === 0 ? (
          <p className="text-sm text-ink-low py-1">Tidak ada rencana untuk besok. Tambahkan di bawah.</p>
        ) : (
          <ul className="space-y-1">
            {items.map((item) => (
              <li
                key={item.id}
                className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-bg-raised transition-colors"
              >
                <button
                  onClick={() => actions.toggleAgendaItem(tomorrow, item.id)}
                  className={twMerge(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all active:scale-90',
                    item.done
                      ? 'border-lime-400 bg-lime-400 text-bg-base'
                      : 'border-bg-border bg-bg-raised text-transparent hover:border-lime-400/50',
                  )}
                >
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </button>
                <span
                  className={twMerge(
                    'flex-1 text-sm truncate',
                    item.done ? 'text-ink-low line-through' : 'text-ink-high',
                  )}
                >
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim()) {
              actions.addAgendaItem(tomorrow, text.trim());
              setText('');
            }
          }}
          className="mt-3 flex gap-2"
        >
          <Input
            placeholder="Tambah rencana untuk besok…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="h-9 text-sm"
          />
          <Button type="submit" variant="secondary" size="sm" disabled={!text.trim()}>
            <Plus className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
