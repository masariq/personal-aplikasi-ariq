// Core domain types for Build Log.
// Designed to map cleanly to a future database (each shape is a row, IDs are stable).

export type ISODate = string; // 'YYYY-MM-DD'
export type ID = string;

export interface Habit {
  id: ID;
  name: string;
  /** Optional short note shown under the habit name. */
  note?: string;
  /** ISO timestamp the habit was created. */
  createdAt: string;
  /** Sort order in the list. */
  order: number;
}

export interface DayEntry {
  /** ISO date — this is the primary key. */
  date: ISODate;
  /** IDs of habits completed that day. */
  completedHabitIds: ID[];
  /** Income logged for this day, in major currency units (e.g. dollars). */
  income: number;
  /** Free-form note for the day. */
  note: string;
}

export interface AgendaItem {
  id: ID;
  text: string;
  done: boolean;
  /** ISO timestamp the item was created. */
  createdAt: string;
}

export interface WeekTarget {
  id: ID;
  text: string;
  done: boolean;
}

export interface WeekPlan {
  id: ID;
  /** 1-indexed week number shown as "Minggu 1". */
  index: number;
  focus: string;
  description: string;
  targets: WeekTarget[];
  /** ISO date the week starts. Optional — used to highlight the current week. */
  startDate?: ISODate;
}

export interface ChallengeSettings {
  /** ISO date the challenge starts. */
  startDate: ISODate;
  /** Total days in the challenge. */
  totalDays: number;
  /** Target income in major currency units. */
  targetIncome: number;
  /** Currency code/symbol config. */
  currency: {
    code: string;
    symbol: string;
    label: string;
  };
}

export interface AppState {
  version: number;
  habits: Habit[];
  entries: Record<ISODate, DayEntry>;
  agenda: Record<ISODate, AgendaItem[]>;
  weeks: WeekPlan[];
  challenge: ChallengeSettings;
  /** Whether the user has dismissed the initial seed banner. */
  seeded: boolean;
}

export const STORAGE_KEY = 'buildlog.state.v1';
export const STATE_VERSION = 1;
