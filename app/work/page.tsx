// app/work/page.tsx
'use client';

import React, { useMemo, useSyncExternalStore } from 'react';
import Card from '@/components/Card';
import Field from '@/components/Field';
import Button from '@/components/Button';
import Segment from '@/components/Segment';
import { addWork, deleteWork, getSnapshot, getServerSnapshot, subscribe } from '@/lib/store';
import { PeriodMode } from '@/lib/types';
import { normalizeWorkDateISO, money } from '@/lib/finance';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function monthISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function useFin() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function WorkPage() {
  const state = useFin();

  const [mode, setMode] = React.useState<PeriodMode>('weekly');

  const [weekStart, setWeekStart] = React.useState(() => todayISO());
  const [weekEnd, setWeekEnd] = React.useState(() => todayISO());

  const [monthDate, setMonthDate] = React.useState(() => monthISO());

  const [hours, setHours] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [note, setNote] = React.useState('');

  const normalizedISO = useMemo(
    () => normalizeWorkDateISO(mode, mode === 'weekly' ? weekStart : monthDate),
    [mode, weekStart, monthDate]
  );

  const list = useMemo(() => state.work, [state.work]);

  function submit() {
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return;

    const hrs = hours.trim() ? Number(hours) : undefined;
    const hoursVal = hrs != null && Number.isFinite(hrs) && hrs >= 0 ? hrs : undefined;

    addWork({
      mode,
      dateISO: normalizedISO,
      endISO: mode === 'weekly' ? weekEnd : undefined,
      amount: Math.round(amt * 100) / 100,
      hours: hoursVal,
      note: note.trim() || undefined,
    });

    setAmount('');
    setHours('');
    setNote('');
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-3xl font-extrabold tracking-tight">Work</div>
        <div className="mt-1 text-sm text-white/60">
          Log work income weekly or monthly. Amount is manual (tax varies). Hours are optional.
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card
          title="Add work income"
          right={
            <Segment
              value={mode}
              onChange={setMode}
              options={[
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
              ]}
            />
          }
        >
          <div className="space-y-4">
            {mode === 'weekly' ? (
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Week start (Date 1)">
                  <input
                    type="date"
                    value={weekStart}
                    onChange={(e) => setWeekStart(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                  />
                </Field>
                <Field label="Week end (Date 7)">
                  <input
                    type="date"
                    value={weekEnd}
                    onChange={(e) => setWeekEnd(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                  />
                </Field>
              </div>
            ) : (
              <Field label="Month">
                <input
                  type="month"
                  value={monthDate}
                  onChange={(e) => setMonthDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                />
              </Field>
            )}

            <Field label="Hours worked (optional)" hint="Example: 19.7">
              <input
                inputMode="decimal"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="19.7"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              />
            </Field>

            <Field label="Amount (USD)" hint="Type your actual pay amount.">
              <input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1198"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              />
            </Field>

            <Field label="Note (optional)">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="ex: paycheck"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              />
            </Field>

            <div className="flex items-center justify-between">
              <div className="text-xs text-white/55">
                Stored key date: <span className="text-white/75">{normalizedISO}</span>
              </div>
              <Button onClick={submit}>Add</Button>
            </div>
          </div>
        </Card>

        <Card title="Latest work logs">
          {list.length === 0 ? (
            <div className="text-sm text-white/60">No work logs yet.</div>
          ) : (
            <div className="space-y-2">
              {list.slice(0, 12).map((w) => (
                <div key={w.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                  <div>
                    <div className="text-sm font-semibold text-white/80">
                      <span className="text-white/55">{w.mode.toUpperCase()}</span> • {w.dateISO}
                      {w.endISO ? <span className="text-white/50"> → {w.endISO}</span> : null}
                    </div>
                    <div className="text-xs text-white/50">
                      {w.hours != null ? <>Hours: {w.hours} • </> : null}
                      {w.note ? w.note : '—'}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm font-extrabold text-emerald-400">${money(w.amount)}</div>
                    <Button variant="ghost" onClick={() => deleteWork(w.id)}>Delete</Button>
                  </div>
                </div>
              ))}
              {list.length > 12 ? <div className="text-xs text-white/40">Showing latest 12 of {list.length}.</div> : null}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
