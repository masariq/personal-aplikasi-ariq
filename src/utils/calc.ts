import type { AppState, DayEntry, Habit, ID, ISODate } from '../types';
import { todayISO, daysBetween, weekDates, dateRange, addDaysISO } from './date';

/** Get or create a blank day entry (does not mutate state). */
export function getEntry(state: AppState, date: ISODate): DayEntry {
  return (
    state.entries[date] ?? {
      date,
      completedHabitIds: [],
      income: 0,
      note: '',
    }
  );
}

export function activeHabits(state: AppState): Habit[] {
  return [...state.habits].sort((a, b) => a.order - b.order);
}

/** Returns 0..1 — fraction of today's habits completed. */
export function todayProgress(state: AppState): number {
  const habits = activeHabits(state);
  if (habits.length === 0) return 0;
  const entry = getEntry(state, todayISO());
  return entry.completedHabitIds.length / habits.length;
}

/**
 * Current streak: consecutive days (ending today or the most recent logged day
 * within the challenge window) where at least one habit was completed.
 */
export function currentStreak(state: AppState): number {
  const habits = activeHabits(state);
  if (habits.length === 0) return 0;

  const { challenge } = state;
  const today = todayISO();
  const offset = daysBetween(challenge.startDate, today);
  const lastAllowed = offset < 0 ? -1 : Math.min(offset, challenge.totalDays - 1);

  let streak = 0;
  let cursor = lastAllowed;
  if (lastAllowed >= 0) {
    const todayEntry = state.entries[addDaysISO(challenge.startDate, lastAllowed)];
    if (!todayEntry || todayEntry.completedHabitIds.length === 0) {
      cursor = lastAllowed - 1;
    }
  }
  while (cursor >= 0) {
    const date = addDaysISO(challenge.startDate, cursor);
    const entry = state.entries[date];
    if (entry && entry.completedHabitIds.length > 0) {
      streak += 1;
      cursor -= 1;
    } else {
      break;
    }
  }
  return streak;
}

/** Last 7 calendar days (ending today) as ISO dates. */
export function last7Days(): ISODate[] {
  const today = todayISO();
  return dateRange(addDaysISO(today, -6), 7);
}

/** Weekly consistency: across the current week (Sun..today), fraction of
 * (day, habit) cells completed out of all possible cells so far. */
export function weeklyConsistency(state: AppState): {
  percent: number;
  completed: number;
  total: number;
} {
  const habits = activeHabits(state);
  if (habits.length === 0) return { percent: 0, completed: 0, total: 0 };

  const today = todayISO();
  const days = weekDates(today).filter((d) => d <= today);
  const total = days.length * habits.length;
  let completed = 0;
  for (const d of days) {
    const entry = state.entries[d];
    if (!entry) continue;
    completed += entry.completedHabitIds.filter((id) =>
      habits.some((h) => h.id === id),
    ).length;
  }
  return { percent: total ? completed / total : 0, completed, total };
}

/** 7-day history grid per habit: for each of last 7 days, completed or not. */
export function habit7DayGrid(state: AppState, habitId: ID): boolean[] {
  return last7Days().map((d) => {
    const entry = state.entries[d];
    return !!entry?.completedHabitIds.includes(habitId);
  });
}

// ---------- Challenge ----------

export interface ChallengeStats {
  dayNumber: number;
  daysRemaining: number;
  totalIncome: number;
  targetIncome: number;
  progress: number;
  remainingNeeded: number;
  perDayNeeded: number;
  started: boolean;
  ended: boolean;
  /** All challenge day ISO dates in order. */
  days: ISODate[];
}

export function challengeStats(state: AppState): ChallengeStats {
  const { challenge } = state;
  const today = todayISO();
  const offset = daysBetween(challenge.startDate, today);
  const days = dateRange(challenge.startDate, challenge.totalDays);

  const started = offset >= 0;
  const ended = offset >= challenge.totalDays;
  const dayNumber = started
    ? Math.min(offset + 1, challenge.totalDays)
    : 0;
  const daysRemaining = ended
    ? 0
    : Math.max(challenge.totalDays - Math.max(offset, 0), 0);

  const totalIncome = days.reduce((sum, d) => {
    const e = state.entries[d];
    return sum + (e?.income ?? 0);
  }, 0);
  const targetIncome = challenge.targetIncome;
  const progress = targetIncome > 0 ? totalIncome / targetIncome : 0;
  const remainingNeeded = Math.max(targetIncome - totalIncome, 0);
  const perDayNeeded = daysRemaining > 0 ? remainingNeeded / daysRemaining : remainingNeeded > 0 ? Infinity : 0;

  return {
    dayNumber,
    daysRemaining,
    totalIncome,
    targetIncome,
    progress: Math.min(progress, 1),
    remainingNeeded,
    perDayNeeded,
    started,
    ended,
    days,
  };
}

/** 0..4 intensity level for a given challenge day, based on habit completions. */
export function dayIntensity(state: AppState, date: ISODate): number {
  const habits = activeHabits(state);
  if (habits.length === 0) return 0;
  const entry = state.entries[date];
  const count = entry?.completedHabitIds.length ?? 0;
  if (count === 0) return 0;
  const ratio = count / habits.length;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

export function currentWeek(state: AppState): { weekIndex: number | null } {
  const today = todayISO();
  const sorted = [...state.weeks].sort((a, b) => a.index - b.index);
  for (const w of sorted) {
    if (!w.startDate) continue;
    const next = sorted.find((x) => x.index === w.index + 1);
    const end = next?.startDate ?? addDaysISO(w.startDate, 7);
    if (today >= w.startDate && today < end) return { weekIndex: w.index };
  }
  return { weekIndex: null };
}

export function weekOfDate(state: AppState, iso: ISODate): number | null {
  const sorted = [...state.weeks]
    .filter((w) => w.startDate)
    .sort((a, b) => (a.startDate! < b.startDate! ? -1 : 1));
  for (const w of sorted) {
    const next = sorted.find((x) => x.index === w.index + 1);
    const end = next?.startDate ?? addDaysISO(w.startDate!, 7);
    if (iso >= w.startDate! && iso < end) return w.index;
  }
  return null;
}
