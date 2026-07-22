import { useCallback } from 'react';
import type { AppState, DayEntry, Habit, ID, ISODate, WeekPlan, ChallengeSettings } from '../types';
import { uid } from '../utils/id';
import { isoNow, todayISO, addDaysISO } from '../utils/date';
import { defaultState } from './storage';

type SetState = React.Dispatch<React.SetStateAction<AppState>>;

function upsertEntry(state: AppState, date: ISODate, patch: Partial<DayEntry>): AppState {
  const existing = state.entries[date] ?? {
    date,
    completedHabitIds: [],
    income: 0,
    note: '',
  };
  return {
    ...state,
    entries: {
      ...state.entries,
      [date]: { ...existing, ...patch, date },
    },
  };
}

export interface Actions {
  addHabit: (name: string, note?: string) => void;
  updateHabit: (id: ID, patch: Partial<Pick<Habit, 'name' | 'note'>>) => void;
  deleteHabit: (id: ID) => void;
  reorderHabits: (ids: ID[]) => void;
  toggleHabitToday: (habitId: ID, date?: ISODate) => void;
  setDayEntry: (date: ISODate, patch: Partial<DayEntry>) => void;
  clearDayEntry: (date: ISODate) => void;
  addAgendaItem: (date: ISODate, text: string) => void;
  toggleAgendaItem: (date: ISODate, itemId: ID) => void;
  updateAgendaItem: (date: ISODate, itemId: ID, text: string) => void;
  deleteAgendaItem: (date: ISODate, itemId: ID) => void;
  addWeek: () => void;
  updateWeek: (id: ID, patch: Partial<Pick<WeekPlan, 'focus' | 'description' | 'startDate'>>) => void;
  deleteWeek: (id: ID) => void;
  addTarget: (weekId: ID, text: string) => void;
  toggleTarget: (weekId: ID, targetId: ID) => void;
  updateTarget: (weekId: ID, targetId: ID, text: string) => void;
  deleteTarget: (weekId: ID, targetId: ID) => void;
  updateChallenge: (patch: Partial<ChallengeSettings>) => void;
  resetAll: () => void;
  loadSeed: () => void;
}

export function useActions(setState: SetState): Actions {
  const addHabit = useCallback(
    (name: string, note?: string) => {
      setState((s) => ({
        ...s,
        habits: [
          ...s.habits,
          { id: uid(), name: name.trim(), note: note?.trim() || undefined, order: s.habits.length, createdAt: isoNow() },
        ],
      }));
    },
    [setState],
  );

  const updateHabit = useCallback(
    (id: ID, patch: Partial<Pick<Habit, 'name' | 'note'>>) => {
      setState((s) => ({
        ...s,
        habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
      }));
    },
    [setState],
  );

  const deleteHabit = useCallback(
    (id: ID) => {
      setState((s) => {
        const habits = s.habits.filter((h) => h.id !== id).map((h, i) => ({ ...h, order: i }));
        const entries: AppState['entries'] = {};
        for (const [date, entry] of Object.entries(s.entries)) {
          const completed = entry.completedHabitIds.filter((x) => x !== id);
          entries[date] = { ...entry, completedHabitIds: completed };
        }
        return { ...s, habits, entries };
      });
    },
    [setState],
  );

  const reorderHabits = useCallback(
    (ids: ID[]) => {
      setState((s) => ({
        ...s,
        habits: s.habits.map((h) => {
          const order = ids.indexOf(h.id);
          return order >= 0 ? { ...h, order } : h;
        }),
      }));
    },
    [setState],
  );

  const toggleHabitToday = useCallback(
    (habitId: ID, date?: ISODate) => {
      const d = date ?? todayISO();
      setState((s) => {
        const entry = s.entries[d] ?? { date: d, completedHabitIds: [], income: 0, note: '' };
        const has = entry.completedHabitIds.includes(habitId);
        const completedHabitIds = has
          ? entry.completedHabitIds.filter((x) => x !== habitId)
          : [...entry.completedHabitIds, habitId];
        return upsertEntry(s, d, { completedHabitIds });
      });
    },
    [setState],
  );

  const setDayEntry = useCallback(
    (date: ISODate, patch: Partial<DayEntry>) => {
      setState((s) => upsertEntry(s, date, patch));
    },
    [setState],
  );

  const clearDayEntry = useCallback(
    (date: ISODate) => {
      setState((s) => {
        const entries = { ...s.entries };
        delete entries[date];
        return { ...s, entries };
      });
    },
    [setState],
  );

  const addAgendaItem = useCallback(
    (date: ISODate, text: string) => {
      const t = text.trim();
      if (!t) return;
      setState((s) => {
        const items = s.agenda[date] ?? [];
        return {
          ...s,
          agenda: { ...s.agenda, [date]: [...items, { id: uid(), text: t, done: false, createdAt: isoNow() }] },
        };
      });
    },
    [setState],
  );

  const toggleAgendaItem = useCallback(
    (date: ISODate, itemId: ID) => {
      setState((s) => {
        const items = s.agenda[date] ?? [];
        return {
          ...s,
          agenda: {
            ...s.agenda,
            [date]: items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)),
          },
        };
      });
    },
    [setState],
  );

  const updateAgendaItem = useCallback(
    (date: ISODate, itemId: ID, text: string) => {
      const t = text.trim();
      setState((s) => {
        const items = s.agenda[date] ?? [];
        return {
          ...s,
          agenda: {
            ...s.agenda,
            [date]: items.map((i) => (i.id === itemId ? { ...i, text: t } : i)),
          },
        };
      });
    },
    [setState],
  );

  const deleteAgendaItem = useCallback(
    (date: ISODate, itemId: ID) => {
      setState((s) => {
        const items = (s.agenda[date] ?? []).filter((i) => i.id !== itemId);
        const agenda = { ...s.agenda };
        if (items.length === 0) delete agenda[date];
        else agenda[date] = items;
        return { ...s, agenda };
      });
    },
    [setState],
  );

  const addWeek = useCallback(() => {
    setState((s) => {
      const nextIndex = (s.weeks.reduce((m, w) => Math.max(m, w.index), 0) || 0) + 1;
      const sortedStarts = s.weeks
        .filter((w) => w.startDate)
        .map((w) => w.startDate!)
        .sort();
      const lastStart = sortedStarts.length ? sortedStarts[sortedStarts.length - 1] : undefined;
      const startDate = lastStart ? addDaysISO(lastStart, 7) : todayISO();
      const week: WeekPlan = {
        id: uid(),
        index: nextIndex,
        focus: 'Fokus mingguan baru',
        description: '',
        startDate,
        targets: [],
      };
      return { ...s, weeks: [...s.weeks, week] };
    });
  }, [setState]);

  const updateWeek = useCallback(
    (id: ID, patch: Partial<Pick<WeekPlan, 'focus' | 'description' | 'startDate'>>) => {
      setState((s) => ({
        ...s,
        weeks: s.weeks.map((w) => (w.id === id ? { ...w, ...patch } : w)),
      }));
    },
    [setState],
  );

  const deleteWeek = useCallback(
    (id: ID) => {
      setState((s) => ({
        ...s,
        weeks: s.weeks.filter((w) => w.id !== id),
      }));
    },
    [setState],
  );

  const addTarget = useCallback(
    (weekId: ID, text: string) => {
      const t = text.trim();
      if (!t) return;
      setState((s) => ({
        ...s,
        weeks: s.weeks.map((w) =>
          w.id === weekId
            ? { ...w, targets: [...w.targets, { id: uid(), text: t, done: false }] }
            : w,
        ),
      }));
    },
    [setState],
  );

  const toggleTarget = useCallback(
    (weekId: ID, targetId: ID) => {
      setState((s) => ({
        ...s,
        weeks: s.weeks.map((w) =>
          w.id === weekId
            ? {
                ...w,
                targets: w.targets.map((t) =>
                  t.id === targetId ? { ...t, done: !t.done } : t,
                ),
              }
            : w,
        ),
      }));
    },
    [setState],
  );

  const updateTarget = useCallback(
    (weekId: ID, targetId: ID, text: string) => {
      setState((s) => ({
        ...s,
        weeks: s.weeks.map((w) =>
          w.id === weekId
            ? {
                ...w,
                targets: w.targets.map((t) =>
                  t.id === targetId ? { ...t, text } : t,
                ),
              }
            : w,
        ),
      }));
    },
    [setState],
  );

  const deleteTarget = useCallback(
    (weekId: ID, targetId: ID) => {
      setState((s) => ({
        ...s,
        weeks: s.weeks.map((w) =>
          w.id === weekId
            ? { ...w, targets: w.targets.filter((t) => t.id !== targetId) }
            : w,
        ),
      }));
    },
    [setState],
  );

  const updateChallenge = useCallback(
    (patch: Partial<ChallengeSettings>) => {
      setState((s) => ({ ...s, challenge: { ...s.challenge, ...patch } }));
    },
    [setState],
  );

  const resetAll = useCallback(() => {
    setState((s) => ({
      version: s.version,
      habits: [],
      entries: {},
      agenda: {},
      weeks: [],
      challenge: {
        startDate: todayISO(),
        totalDays: 60,
        targetIncome: 5000,
        currency: { code: 'USD', symbol: '$', label: 'USD' },
      },
      seeded: false,
    }));
  }, [setState]);

  const loadSeed = useCallback(() => {
    setState(() => ({ ...defaultState(), seeded: true }));
  }, [setState]);

  return {
    addHabit,
    updateHabit,
    deleteHabit,
    reorderHabits,
    toggleHabitToday,
    setDayEntry,
    clearDayEntry,
    addAgendaItem,
    toggleAgendaItem,
    updateAgendaItem,
    deleteAgendaItem,
    addWeek,
    updateWeek,
    deleteWeek,
    addTarget,
    toggleTarget,
    updateTarget,
    deleteTarget,
    updateChallenge,
    resetAll,
    loadSeed,
  };
}
