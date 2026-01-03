// app/reports/page.tsx
'use client';

import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Field from '@/components/Field';
import { subscribe, getSnapshot, getServerSnapshot, addReportEntry, clearReportHistory } from '@/lib/store';
import { computeMonthRollup, monthKeyFromISO } from '@/lib/finance';

function useFin() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const state = useFin();

  // hydration-safe render
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const nowMK = monthKeyFromISO(new Date().toISOString().slice(0, 10)) || '2026-01';
  const [month, setMonth] = useState(nowMK);

  const roll = useMemo(() => computeMonthRollup(state, month), [state, month]);

  async function exportPDF() {
    // save history first (so you can see it even if download blocked)
    addReportEntry(month, roll);

    const res = await fetch('/api/report/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month, roll }),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => '');
      alert(`PDF export failed (${res.status}). ${t}`);
      return;
    }

    const blob = await res.blob();
    if (!blob || blob.size < 100) {
      alert('PDF export produced an empty file.');
      return;
    }

    downloadBlob(blob, `SpendWise_Report_${month}.pdf`);
  }

  if (!mounted) {
    return <div className="text-sm text-white/60">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-3xl font-extrabold tracking-tight">Reports</div>
        <div className="mt-1 text-sm text-white/60">
          Export a monthly PDF snapshot (income − subscriptions − savings).
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Export">
          <div className="space-y-4">
            <Field label="Month">
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              />
            </Field>

            <div className="text-xs text-white/60">
              This export uses your current saved work logs + subscriptions + settings.
            </div>

            <Button onClick={exportPDF}>Download PDF</Button>
          </div>
        </Card>

        <Card title="This month snapshot">
          <div className="space-y-2 text-sm text-white/80">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Income</span>
              <span>${roll.income.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Subscriptions (expenses)</span>
              <span>${roll.expenses.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Savings target</span>
              <span>${roll.savingsTarget.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Net after target</span>
              <span>${roll.net.toFixed(2)}</span>
            </div>
            <div className="pt-2 text-xs text-white/55">
              Active set: <span className="text-white/75">{roll.activeSubGroupName}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card title="History">
        <div className="flex items-center justify-between pb-3">
          <div className="text-sm text-white/60">{state.reports.length} saved exports</div>
          <Button variant="ghost" onClick={() => clearReportHistory()}>
            Clear history
          </Button>
        </div>

        {state.reports.length === 0 ? (
          <div className="text-sm text-white/60">No exports yet.</div>
        ) : (
          <div className="space-y-2">
            {state.reports.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2"
              >
                <div>
                  <div className="text-sm font-semibold text-white/80">{h.month}</div>
                  <div className="text-xs text-white/50">
                    Saved: {new Date(h.createdAt).toLocaleString()}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  onClick={async () => {
                    const res = await fetch('/api/report/pdf', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ month: h.month, roll: h.roll }),
                    });
                    if (!res.ok) {
                      alert(`PDF export failed (${res.status}).`);
                      return;
                    }
                    const blob = await res.blob();
                    downloadBlob(blob, `SpendWise_Report_${h.month}.pdf`);
                  }}
                >
                  Download PDF
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
