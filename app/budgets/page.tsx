'use client';

import React, { useMemo, useSyncExternalStore } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { getSnapshot, getServerSnapshot, subscribe } from '@/lib/store';
import { computeMonthRollup, money } from '@/lib/finance';
import { monthKey as mk, parseMonthKey } from '@/lib/dates';

function useFin() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Convert YYYY-MM-DD -> YYYY-MM
function monthKeyFromISODate(isoDate: string) {
  // isoDate expected: YYYY-MM-DD
  if (!isoDate || isoDate.length < 7) return mk(new Date());
  return isoDate.slice(0, 7);
}

// Today's YYYY-MM-DD
function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export default function BudgetsPage() {
  const state = useFin();

  // user selects ANY date
  const [date, setDate] = React.useState(() => todayISO());

  // we compute monthKey from that date
  const month = useMemo(() => monthKeyFromISODate(date), [date]);

  const roll = useMemo(() => computeMonthRollup(state, month), [state, month]);
  const monthDate = useMemo(() => parseMonthKey(month), [month]);

  const income = roll.workIncome + roll.otherIncome;
  const availableAfterFixed = Math.max(0, income - roll.subsMonthly - roll.savingsTarget);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-3xl font-extrabold tracking-tight">Budgets</div>
          <div className="mt-1 text-sm text-white/60">
            Pick any date: budgets auto show that month. Work logs + subscriptions + savings update automatically.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-white/60">Date</div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value || todayISO())}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
          />
          <Button variant="ghost" onClick={() => setDate(todayISO())}>
            Today
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Income (from Work)">
          <div className="text-2xl font-extrabold text-emerald-400">${money(income)}</div>
          <div className="mt-2 text-xs text-white/55">
            Add weekly/monthly logs in <span className="text-white/70">Work</span>.
          </div>
        </Card>

        <Card title="Subscriptions (deducted)">
          <div className="text-2xl font-extrabold text-red-400">${money(roll.subsMonthly)}</div>
          <div className="mt-2 text-xs text-white/55">Managed in Subscriptions.</div>
        </Card>

        <Card title="Available after fixed costs">
          <div className="text-2xl font-extrabold text-white">${money(availableAfterFixed)}</div>
          <div className="mt-2 text-xs text-white/55">Income − subs − savings.</div>
        </Card>
      </div>

      <Card title="Budget usage">
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-semibold text-white/75">Available spend</div>
              <div className="text-sm font-bold text-white/80">0% used</div>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-white/70" style={{ width: `0%` }} />
            </div>
            <div className="mt-2 text-xs text-white/55">
              Spent $0.00 / Available ${money(availableAfterFixed)} • Remaining ${money(availableAfterFixed)}
            </div>
          </div>

          <div className="text-xs text-white/40">
            Showing month:{' '}
            <span className="text-white/60">
              {monthDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
            </span>
            <span className="text-white/40"> • (from selected date {date})</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
