// lib/store.ts
'use client';

import type {
  PeriodMode,
  StoreState,
  Subscription,
  SubGroup,
  WorkLog,
  Settings,
  ReportEntry,
  MonthRollup,
} from '@/lib/types';

const STORAGE_KEY = 'spendwise_store_v2';

function uid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

const defaultState: StoreState = {
  version: 2,
  work: [],
  subs: [],
  subGroups: [],
  reports: [],
  settings: {
    savingsMode: 'fixed',
    savingsValue: 0,
    activeSubGroupId: null,
  },
};

let state: StoreState = defaultState;
const listeners = new Set<() => void>();

function emit() {
  for (const fn of listeners) fn();
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function sanitizeLoaded(raw: any): StoreState {
  const parsed = (raw && typeof raw === 'object') ? raw : {};

  const work: WorkLog[] = Array.isArray(parsed.work) ? parsed.work.filter(Boolean) : [];
  const subs: Subscription[] = Array.isArray(parsed.subs) ? parsed.subs.filter(Boolean) : [];

  // Fix: ensure every group has subIds as an array
  const subGroups: SubGroup[] = Array.isArray(parsed.subGroups)
    ? parsed.subGroups
        .filter(Boolean)
        .map((g: any) => ({
          id: String(g?.id || uid()),
          name: String(g?.name || 'My Group'),
          subIds: Array.isArray(g?.subIds) ? g.subIds.filter((x: any) => typeof x === 'string') : [],
          createdAt: Number(g?.createdAt) || Date.now(),
        }))
    : [];

  const reports: ReportEntry[] = Array.isArray(parsed.reports)
    ? parsed.reports
        .filter(Boolean)
        .map((r: any) => ({
          id: String(r?.id || uid()),
          month: String(r?.month || ''),
          createdAt: Number(r?.createdAt) || Date.now(),
          roll: (r?.roll && typeof r.roll === 'object') ? r.roll : ({} as MonthRollup),
        }))
    : [];

  const settings: Settings = {
    ...defaultState.settings,
    ...(parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : {}),
    savingsMode:
      parsed?.settings?.savingsMode === 'percent' || parsed?.settings?.savingsMode === 'fixed'
        ? parsed.settings.savingsMode
        : defaultState.settings.savingsMode,
    savingsValue: Number(parsed?.settings?.savingsValue) || 0,
    activeSubGroupId: parsed?.settings?.activeSubGroupId ?? null,
  };

  return {
    ...defaultState,
    ...parsed,
    version: 2,
    work,
    subs,
    subGroups,
    reports,
    settings,
  };
}

function load() {
  // load v2 first
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      state = sanitizeLoaded(JSON.parse(raw));
      return;
    }
  } catch {}

  // migrate from old key if present
  try {
    const old = localStorage.getItem('spendwise_store_v1');
    if (!old) return;
    state = sanitizeLoaded(JSON.parse(old));
    save();
  } catch {}
}

if (typeof window !== 'undefined') load();

export function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getSnapshot() {
  return state;
}

export function getServerSnapshot() {
  return defaultState;
}

function setState(next: StoreState) {
  state = next;
  save();
  emit();
}

// ---------- Work ----------
export function addWork(input: {
  mode: PeriodMode;
  dateISO: string;
  endISO?: string;
  amount: number;
  hours?: number;
  note?: string;
}) {
  const w: WorkLog = {
    id: uid(),
    mode: input.mode,
    dateISO: input.dateISO,
    endISO: input.endISO,
    amount: Number(input.amount) || 0,
    hours: input.hours != null ? Number(input.hours) : undefined,
    note: input.note?.trim() ? input.note.trim() : undefined,
    createdAt: Date.now(),
  };
  setState({ ...state, work: [w, ...state.work] });
}

export function deleteWork(id: string) {
  setState({ ...state, work: state.work.filter((x) => x.id !== id) });
}

// ---------- Subs ----------
export function addSub(input: { name: string; monthlyAmount: number; active: boolean }) {
  const s: Subscription = {
    id: uid(),
    name: input.name.trim(),
    monthlyAmount: Number(input.monthlyAmount) || 0,
    active: !!input.active,
    createdAt: Date.now(),
  };
  setState({ ...state, subs: [...state.subs, s] });
}

export function deleteSub(id: string) {
  const nextGroups = state.subGroups.map((g) => ({ ...g, subIds: g.subIds.filter((sid) => sid !== id) }));
  setState({ ...state, subs: state.subs.filter((x) => x.id !== id), subGroups: nextGroups });
}

export function toggleSub(id: string) {
  setState({
    ...state,
    subs: state.subs.map((s) => (s.id === id ? { ...s, active: !s.active } : s)),
  });
}

// ---------- Settings ----------
export function updateSettings(patch: Partial<Settings>) {
  setState({
    ...state,
    settings: { ...state.settings, ...patch },
  });
}

// ---------- Sub Groups ----------
export function addSubGroup(name: string, subIds: string[]) {
  const g: SubGroup = {
    id: uid(),
    name: name.trim() || 'My Group',
    subIds: Array.from(new Set(subIds)).filter((x) => typeof x === 'string'),
    createdAt: Date.now(),
  };
  setState({ ...state, subGroups: [g, ...state.subGroups] });
  return g.id;
}

export function deleteSubGroup(id: string) {
  const nextSettings =
    state.settings.activeSubGroupId === id ? { ...state.settings, activeSubGroupId: null } : state.settings;

  setState({
    ...state,
    subGroups: state.subGroups.filter((g) => g.id !== id),
    settings: nextSettings,
  });
}

export function setActiveSubGroup(id: string | null) {
  setState({ ...state, settings: { ...state.settings, activeSubGroupId: id } });
}

export function applySubGroup(id: string) {
  const g = state.subGroups.find((x) => x.id === id);
  if (!g) return;

  const set = new Set(g.subIds);
  setState({
    ...state,
    settings: { ...state.settings, activeSubGroupId: id },
    subs: state.subs.map((s) => ({ ...s, active: set.has(s.id) })),
  });
}

// ---------- Report history ----------
export function addReportEntry(month: string, roll: MonthRollup) {
  const entry = {
    id: uid(),
    month,
    createdAt: Date.now(),
    roll,
  } satisfies ReportEntry;

  setState({ ...state, reports: [entry, ...state.reports] });
  return entry.id;
}

export function clearReportHistory() {
  setState({ ...state, reports: [] });
}

// ---------- Reset ----------
export function resetAll() {
  setState(defaultState);
}
