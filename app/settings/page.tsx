'use client';

import React, { useMemo, useSyncExternalStore } from 'react';
import Card from '@/components/Card';
import Field from '@/components/Field';
import Button from '@/components/Button';
import Segment from '@/components/Segment';
import { getSnapshot, getServerSnapshot, subscribe, updateSettings } from '@/lib/store';
import { money } from '@/lib/finance';

function useFin() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function SettingsPage() {
  const state = useFin();

  const [mode, setMode] = React.useState<'fixed' | 'percent'>(() => state.settings.savingsMode);
  const [value, setValue] = React.useState<string>(() => String(state.settings.savingsValue ?? 0));

  React.useEffect(() => {
    setMode(state.settings.savingsMode);
    setValue(String(state.settings.savingsValue ?? 0));
  }, [state.settings.savingsMode, state.settings.savingsValue]);

  const parsed = useMemo(() => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }, [value]);

  function save() {
    // IMPORTANT: if user types "150" and wants monthly savings dollars,
    // mode must be 'fixed' to reflect on Dashboard even when income is 0.
    updateSettings({
      savingsMode: mode,
      savingsValue: mode === 'percent' ? Math.max(0, Math.min(100, parsed)) : Math.max(0, parsed),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-3xl font-extrabold tracking-tight">Settings</div>
        <div className="mt-1 text-sm text-white/60">Edit values used across Dashboard + Budgets.</div>
      </div>

      <Card
        title="Savings target (monthly)"
        right={
          <Segment
            value={mode}
            onChange={setMode}
            options={[
              { value: 'fixed', label: 'Fixed ($)' },
              { value: 'percent', label: 'Percent (%)' },
            ]}
          />
        }
      >
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <Field
            label={mode === 'fixed' ? 'Savings target (USD)' : 'Savings target (%)'}
            hint={mode === 'fixed' ? 'Example: 150' : 'Example: 20'}
          >
            <input
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={mode === 'fixed' ? '150' : '20'}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
            />
          </Field>

          <div className="flex md:justify-end">
            <Button onClick={save}>Save</Button>
          </div>
        </div>

        <div className="mt-2 text-xs text-white/55">
          Current:{' '}
          <span className="text-white/80">
            {state.settings.savingsMode === 'fixed'
              ? `$${money(state.settings.savingsValue)}`
              : `${money(state.settings.savingsValue)}%`}
          </span>
        </div>
      </Card>

      <Card title="Notes">
        <div className="text-sm text-white/60">
          Work logs update Dashboard/Budgets automatically. Subscriptions are deducted automatically.
        </div>
      </Card>
    </div>
  );
}
