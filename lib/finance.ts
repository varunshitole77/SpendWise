// lib/finance.ts
import type { PeriodMode, StoreState, MonthRollup } from '@/lib/types';

export function money(n: number) {
  const x = Number.isFinite(n) ? n : 0;
  return x.toFixed(2);
}

export function monthKeyFromISO(iso: string) {
  if (!iso || iso.length < 7) return '';
  return iso.slice(0, 7); // YYYY-MM
}

export function normalizeWorkDateISO(mode: PeriodMode, input: string) {
  if (mode === 'weekly') return input; // store exactly Date 1
  if (/^\d{4}-\d{2}$/.test(input)) return `${input}-01`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  return input;
}

function n(v: unknown) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

// Suggested savings: simple default = 12% of income (change anytime)
function suggestedSavingsFromIncome(income: number) {
  const pct = 12;
  return { amount: (income * pct) / 100, pct };
}

export function computeMonthRollup(state: StoreState, monthKey: string): MonthRollup {
  const workIncome = state.work.reduce((sum, w) => {
    if (w.mode === 'monthly') return monthKeyFromISO(w.dateISO) === monthKey ? sum + n(w.amount) : sum;

    // weekly: count it if start OR end is in the selected month
    const startMK = monthKeyFromISO(w.dateISO);
    const endMK = w.endISO ? monthKeyFromISO(w.endISO) : '';
    if (startMK === monthKey || endMK === monthKey) return sum + n(w.amount);
    return sum;
  }, 0);

  const otherIncome = 0;
  const income = workIncome + otherIncome;

  // subscriptions are your only expense right now
  const subsMonthly = state.subs.filter((s) => s.active).reduce((a, b) => a + n(b.monthlyAmount), 0);
  const expenses = subsMonthly;

  const savingsMode = state.settings.savingsMode;
  const savingsValue = n(state.settings.savingsValue);

  const savingsTarget =
    savingsMode === 'percent'
      ? (income * savingsValue) / 100
      : savingsValue;

  const { amount: suggestedSavings, pct: suggestedSavingsPct } = suggestedSavingsFromIncome(income);

  const netAfterTarget = income - expenses - savingsTarget;
  const netAfterSuggested = income - expenses - suggestedSavings;

  // weekly guidance
  const safeWeeklySpendTarget = Math.max(0, netAfterTarget / 4);
  const safeWeeklySpendSuggested = Math.max(0, netAfterSuggested / 4);
  const safeMonthlySpendSuggested = Math.max(0, netAfterSuggested);

  // active group name
  const activeGroup =
    state.settings.activeSubGroupId
      ? state.subGroups.find((g) => g.id === state.settings.activeSubGroupId)
      : null;

  return {
    workIncome,
    otherIncome,
    income,

    subsMonthly,
    expenses,

    savingsMode,
    savingsValue,
    savingsTarget,

    suggestedSavings,
    suggestedSavingsPct,

    // keep net for your dashboard typings
    net: netAfterTarget,
    netAfterTarget,
    netAfterSuggested,

    // legacy alias
    safeWeeklySpend: safeWeeklySpendTarget,
    safeWeeklySpendTarget,
    safeWeeklySpendSuggested,

    safeMonthlySpendSuggested,

    activeSubGroupName: activeGroup?.name || 'All subscriptions',
  };
}
