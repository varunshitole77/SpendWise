// lib/types.ts
export type PeriodMode = 'weekly' | 'monthly';

export type SavingsMode = 'fixed' | 'percent';

export type WorkLog = {
  id: string;
  mode: PeriodMode;
  dateISO: string; // weekly: Date1 (YYYY-MM-DD), monthly: YYYY-MM-01
  endISO?: string; // optional (weekly end)
  amount: number;
  hours?: number;
  note?: string;
  createdAt: number;
};

export type Subscription = {
  id: string;
  name: string;
  monthlyAmount: number;
  active: boolean;
  createdAt: number;
};

export type SubGroup = {
  id: string;
  name: string;
  subIds: string[];
  createdAt: number;
};

export type ReportEntry = {
  id: string;
  month: string; // YYYY-MM
  createdAt: number;
  roll: MonthRollup;
};

export type Settings = {
  savingsMode: SavingsMode;
  savingsValue: number;
  activeSubGroupId: string | null;
};

export type StoreState = {
  version: number;
  work: WorkLog[];
  subs: Subscription[];
  subGroups: SubGroup[];
  reports: ReportEntry[];
  settings: Settings;
};

export type MonthRollup = {
  // income
  workIncome: number;
  otherIncome: number;
  income: number;

  // expenses
  subsMonthly: number;
  expenses: number; // currently equals subsMonthly (since txns removed)

  // savings
  savingsMode: SavingsMode;
  savingsValue: number;
  savingsTarget: number;
  suggestedSavings: number;
  suggestedSavingsPct: number;

  // net / guidance
  net: number; // <-- keep THIS for dashboard compatibility (after subs + target savings)
  netAfterTarget: number; // same as net (kept for report wording)
  netAfterSuggested: number;

  safeWeeklySpend: number; // legacy alias (target-based)
  safeWeeklySpendTarget: number;
  safeWeeklySpendSuggested: number;

  safeMonthlySpendSuggested: number;

  activeSubGroupName: string;
};
