export type PeriodMode = "weekly" | "monthly";

export type Settings = {
  // Keep currency in DB if you want, but your UI can ignore symbols and just show numbers.
  // Default will be USD.
  currency: "USD" | "INR";

  // Optional legacy fields (safe to keep; you can ignore them in UI)
  maxWeeklyHours: number;
  defaultHourlyRate: number;

  // New: savings target as monthly dollars
  savingsMonthlyTarget: number;
};

export type WorkLog = {
  id?: number;

  // "weekly" or "monthly"
  mode: PeriodMode;

  // ISO date: YYYY-MM-DD
  // weekly: any date inside the week (we compute weekKey)
  // monthly: usually YYYY-MM-01 (we compute monthKey)
  date: string;

  // dollars
  amount: number;

  // derived keys for fast filtering
  weekKey?: string;  // e.g. 2026-W01 (ISO week)
  monthKey: string;  // e.g. 2026-01

  notes?: string;
};

export type Subscription = {
  id?: number;
  name: string;

  // store normalized monthly cost in dollars
  monthlyAmount: number;

  active: boolean;

  // optional category label if you want later
  category?: string;
};

export type Budget = {
  category: string;      // primary key
  limitMonthly: number;  // dollars
};
