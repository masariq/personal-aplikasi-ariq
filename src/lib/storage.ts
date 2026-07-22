import { useEffect, useRef, useState } from 'react';
import type { AppState, Habit, WeekPlan } from '../types';
import { STORAGE_KEY, STATE_VERSION } from '../types';
import { todayISO, addDaysISO, isoNow } from '../utils/date';
import { uid } from '../utils/id';

function defaultHabits(): Habit[] {
  return [
    { id: uid(), name: 'Bikin/update karya portofolio', order: 0, createdAt: isoNow() },
    { id: uid(), name: 'Kirim proposal ke klien', order: 1, createdAt: isoNow() },
    { id: uid(), name: 'Outreach ke calon klien', order: 2, createdAt: isoNow() },
    { id: uid(), name: 'Update LinkedIn / portofolio', order: 3, createdAt: isoNow() },
  ];
}

function defaultWeeks(): WeekPlan[] {
  const start = todayISO();
  return [
    {
      id: uid(),
      index: 1,
      focus: 'Bangun fondasi portofolio',
      description:
        'Fokus menyusun 3–4 karya portofolio berkualitas. Tiap karya diupload online.',
      startDate: start,
      targets: [
        { id: uid(), text: 'Karya portofolio #1 selesai & online', done: false },
        { id: uid(), text: 'Karya portofolio #2 selesai & online', done: false },
        { id: uid(), text: 'Karya portofolio #3 selesai & online', done: false },
        { id: uid(), text: 'Karya portofolio #4 selesai & online', done: false },
      ],
    },
    {
      id: uid(),
      index: 2,
      focus: 'Bangun fondasi portofolio',
      description: 'Lanjutan: melengkapi & memoles karya, memastikan semuanya live.',
      startDate: addDaysISO(start, 7),
      targets: [
        { id: uid(), text: 'Review & poles seluruh karya portofolio', done: false },
        { id: uid(), text: 'Tulis deskripsi case study tiap karya', done: false },
        { id: uid(), text: 'Pastikan semua karya live & bisa diakses', done: false },
      ],
    },
    {
      id: uid(),
      index: 3,
      focus: 'Mulai coba nawarin',
      description: 'Kirim proposal pertama sambil tetap nambah karya.',
      startDate: addDaysISO(start, 14),
      targets: [
        { id: uid(), text: 'Riset 10 klien / platform potensial', done: false },
        { id: uid(), text: 'Kirim proposal pertama', done: false },
        { id: uid(), text: 'Tambah 1 karya baru', done: false },
      ],
    },
    {
      id: uid(),
      index: 4,
      focus: 'Outreach rutin',
      description: 'Kirim proposal & DM rutin tiap minggu, kejar klien pertama.',
      startDate: addDaysISO(start, 21),
      targets: [
        { id: uid(), text: 'Kirim 3 proposal minggu ini', done: false },
        { id: uid(), text: 'DM 5 calon klien', done: false },
        { id: uid(), text: 'Follow up proposal sebelumnya', done: false },
      ],
    },
    {
      id: uid(),
      index: 5,
      focus: 'Outreach rutin',
      description: 'Tingkatkan volume outreach, lanjut kejar klien pertama.',
      startDate: addDaysISO(start, 28),
      targets: [
        { id: uid(), text: 'Kirim 5 proposal minggu ini', done: false },
        { id: uid(), text: 'DM 10 calon klien', done: false },
        { id: uid(), text: 'Iterasi template proposal', done: false },
      ],
    },
    {
      id: uid(),
      index: 6,
      focus: 'Outreach rutin',
      description: 'Konsistensi outreach, mulai dapat respons & percakapan.',
      startDate: addDaysISO(start, 35),
      targets: [
        { id: uid(), text: 'Kirim 5 proposal minggu ini', done: false },
        { id: uid(), text: 'Follow up semua percakapan aktif', done: false },
        { id: uid(), text: 'Tutup 1 klien pertama (target)', done: false },
      ],
    },
    {
      id: uid(),
      index: 7,
      focus: 'Kunci & ulangi',
      description: 'Selesaikan klien pertama, minta testimoni & referral.',
      startDate: addDaysISO(start, 42),
      targets: [
        { id: uid(), text: 'Selesaikan pekerjaan klien pertama', done: false },
        { id: uid(), text: 'Minta testimoni klien', done: false },
        { id: uid(), text: 'Minta referral / intro', done: false },
      ],
    },
    {
      id: uid(),
      index: 8,
      focus: 'Kunci & ulangi',
      description: 'Dokumentasikan proses, ulangi untuk klien berikutnya.',
      startDate: addDaysISO(start, 49),
      targets: [
        { id: uid(), text: 'Publish case study klien pertama', done: false },
        { id: uid(), text: 'Mulai outreach untuk klien kedua', done: false },
        { id: uid(), text: 'Sistemkan template komunikasi', done: false },
      ],
    },
  ];
}

export function defaultState(): AppState {
  return {
    version: STATE_VERSION,
    habits: defaultHabits(),
    entries: {},
    agenda: {},
    weeks: defaultWeeks(),
    challenge: {
      startDate: todayISO(),
      totalDays: 60,
      targetIncome: 5000,
      currency: { code: 'USD', symbol: '$', label: 'USD' },
    },
    seeded: true,
  };
}

export function emptyState(): AppState {
  return {
    version: STATE_VERSION,
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
  };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as AppState;
    if (parsed.version !== STATE_VERSION) {
      const base = defaultState();
      return {
        ...base,
        ...parsed,
        agenda: parsed.agenda ?? base.agenda,
        challenge: { ...base.challenge, ...parsed.challenge },
        currency: parsed.challenge?.currency ?? base.challenge.currency,
      } as AppState;
    }
    return parsed;
  } catch {
    return defaultState();
  }
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
  }
}

export function useAppState() {
  const [state, setState] = useState<AppState>(() => loadState());
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    saveState(state);
  }, [state]);

  return [state, setState] as const;
}
