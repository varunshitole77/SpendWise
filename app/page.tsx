// app/page.tsx
'use client';

import React, { useMemo, useSyncExternalStore } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { getSnapshot, getServerSnapshot, subscribe, resetAll } from '@/lib/store';
import { computeMonthRollup, money } from '@/lib/finance';
import { monthKey as mk, parseMonthKey } from '@/lib/dates';

function useFin() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

type Tone = 'income' | 'expense' | 'neutral';

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function StatValue({ value, tone }: { value: number; tone: Tone }) {
  const cls =
    tone === 'income' ? 'text-emerald-400' : tone === 'expense' ? 'text-red-400' : 'text-white';
  return <div className={['text-2xl font-extrabold', cls].join(' ')}>${money(value)}</div>;
}

function TinyBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-white/70">
      {children}
    </span>
  );
}

function LegendDot({ className }: { className: string }) {
  return <span className={['inline-block h-2 w-2 rounded-full', className].join(' ')} />;
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <div className="text-sm font-semibold text-white">{title}</div>
        {subtitle ? <div className="mt-0.5 text-xs text-white/55">{subtitle}</div> : null}
      </div>
    </div>
  );
}

/** FIX: top stat cards have identical internal layout + aligned baselines */
function TopStatCard({
  title,
  kicker,
  value,
  tone,
  footer,
  footerRight,
}: {
  title: string;
  kicker?: React.ReactNode;
  value: number;
  tone: Tone;
  footer: React.ReactNode;
  footerRight?: React.ReactNode;
}) {
  return (
    <Card title={title}>
      <div className="flex h-full flex-col">
        {/* kicker row — ALWAYS reserved height so all values align */}
        <div className="min-h-[18px] text-xs text-white/50">
          {kicker ?? <span className="opacity-0">.</span>}
        </div>

        <div className="mt-2">
          <StatValue value={value} tone={tone} />
        </div>

        {/* footer row — pinned to bottom so all cards match */}
        <div className="mt-auto pt-3">
          <div className="flex items-center justify-between gap-3 text-sm text-white/60">
            <div className="min-w-0 truncate">{footer}</div>
            {footerRight ? <div className="shrink-0">{footerRight}</div> : null}
          </div>
        </div>
      </div>
    </Card>
  );
}

/** --------- DONUT (responsive size + aligned legend) --------- */
function DonutChart({
  centerLabel,
  segments,
}: {
  centerLabel: { top: string; bottom: string };
  segments: Array<{ label: string; value: number; colorClass: string; stroke: string }>;
}) {
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const [wrapW, setWrapW] = React.useState<number>(0);

  React.useEffect(() => {
    if (!wrapRef.current) return;
    const el = wrapRef.current;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width ?? 0;
      setWrapW(Math.floor(w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // auto fit ring to card width
  const donutSize = useMemo(() => {
    const w = wrapW || 360;
    return Math.floor(clamp(w * 0.52, 140, 190));
  }, [wrapW]);

  const thickness = useMemo(() => Math.floor(clamp(donutSize * 0.08, 12, 16)), [donutSize]);

  const r = (donutSize - thickness) / 2;
  const c = donutSize / 2;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + Math.max(0, s.value), 0) || 1;

  let acc = 0;
  const arcs = segments
    .map((s) => {
      const v = Math.max(0, s.value);
      const frac = v / total;
      const dash = frac * circumference;
      const gap = circumference - dash;
      const offset = acc;
      acc += dash;
      return { ...s, dash, gap, offset };
    })
    .filter((a) => a.dash > 0);

  return (
    <div ref={wrapRef} className="min-w-0">
      {/* Always stacked => never overflows card */}
      <div className="flex min-w-0 flex-col gap-4">
        <div className="relative mx-auto">
          <svg
            width={donutSize}
            height={donutSize}
            viewBox={`0 0 ${donutSize} ${donutSize}`}
            className="drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
          >
            <defs>
              <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feColorMatrix
                  result="tint"
                  in="blur"
                  type="matrix"
                  values="
                    1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 0.9 0"
                />
                <feMerge>
                  <feMergeNode in="tint" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <linearGradient id="ringBase" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
              </linearGradient>
            </defs>

            <circle cx={c} cy={c} r={r} fill="none" stroke="url(#ringBase)" strokeWidth={thickness} />

            <g transform={`rotate(-90 ${c} ${c})`} filter="url(#softGlow)">
              {arcs.map((a, idx) => (
                <circle
                  key={idx}
                  cx={c}
                  cy={c}
                  r={r}
                  fill="none"
                  stroke={a.stroke}
                  strokeWidth={thickness}
                  strokeLinecap="round"
                  strokeDasharray={`${a.dash} ${a.gap}`}
                  strokeDashoffset={-a.offset}
                />
              ))}
            </g>
          </svg>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-[11px] font-semibold text-white/60">{centerLabel.top}</div>
            <div className="mt-1 text-lg font-extrabold text-white">{centerLabel.bottom}</div>
          </div>
        </div>

        {/* legend aligned: label left / value right */}
        <div className="min-w-0 space-y-2">
          {segments.map((s, i) => {
            const pct = total <= 0 ? 0 : (Math.max(0, s.value) / total) * 100;
            return (
              <div key={i} className="grid min-w-0 grid-cols-[1fr_auto] items-center gap-3 text-sm">
                <div className="flex min-w-0 items-center gap-2 text-white/75">
                  <LegendDot className={s.colorClass} />
                  <span className="min-w-0 truncate">{s.label}</span>
                </div>
                <div className="text-right tabular-nums text-white/80">
                  ${money(s.value)} <span className="text-white/45">({pct.toFixed(0)}%)</span>
                </div>
              </div>
            );
          })}
          <div className="pt-2 text-xs text-white/50">
            Tip: this ring shows how your income is allocated for the selected month.
          </div>
        </div>
      </div>
    </div>
  );
}

function GradientBarRow({
  label,
  value,
  max,
  gradient,
  tone,
  rightHint,
}: {
  label: string;
  value: number;
  max: number;
  gradient: string;
  tone: Tone;
  rightHint?: string;
}) {
  const pct = max <= 0 ? 0 : clamp((Math.max(0, value) / max) * 100, 0, 100);
  const valueCls =
    tone === 'income' ? 'text-emerald-300' : tone === 'expense' ? 'text-red-300' : 'text-white';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-white/70">{label}</span>
          {rightHint ? <TinyBadge>{rightHint}</TinyBadge> : null}
        </div>
        <div className={['tabular-nums font-semibold', valueCls].join(' ')}>${money(value)}</div>
      </div>

      <div className="h-2.5 w-full rounded-full bg-white/10 ring-1 ring-white/10">
        <div className={['h-full rounded-full', gradient].join(' ')} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StackedPlanBar({
  title,
  income,
  expenses,
  savings,
}: {
  title: string;
  income: number;
  expenses: number;
  savings: number;
}) {
  const total = Math.max(1, income);
  const expW = clamp((Math.max(0, expenses) / total) * 100, 0, 100);
  const savW = clamp((Math.max(0, savings) / total) * 100, 0, 100 - expW);
  const leftW = clamp(100 - expW - savW, 0, 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-white/70">{title}</div>
        <div className="text-xs text-white/55">
          Income <span className="text-white/75 font-semibold tabular-nums">${money(income)}</span>
        </div>
      </div>

      <div className="h-3.5 w-full overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10">
        <div className="flex h-full w-full">
          <div className="h-full bg-gradient-to-r from-red-500/80 to-rose-400/80" style={{ width: `${expW}%` }} />
          <div className="h-full bg-gradient-to-r from-indigo-500/80 to-sky-400/80" style={{ width: `${savW}%` }} />
          <div className="h-full bg-gradient-to-r from-emerald-500/70 to-lime-400/60" style={{ width: `${leftW}%` }} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-white/65">
        <span className="inline-flex items-center gap-2">
          <LegendDot className="bg-rose-400" />
          Expenses <span className="text-white/80 tabular-nums">${money(expenses)}</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <LegendDot className="bg-sky-400" />
          Savings <span className="text-white/80 tabular-nums">${money(savings)}</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <LegendDot className="bg-lime-400" />
          Remaining{' '}
          <span className="text-white/80 tabular-nums">${money(Math.max(0, income - expenses - savings))}</span>
        </span>
      </div>
    </div>
  );
}

function LineChart({
  title,
  points,
  height = 160,
}: {
  title: string;
  points: Array<{ xLabel: string; y: number }>;
  height?: number;
}) {
  const width = 520;
  const pad = 28;

  const ys = points.map((p) => p.y);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 0);
  const span = Math.max(1, maxY - minY);

  const xStep = points.length <= 1 ? 0 : (width - pad * 2) / (points.length - 1);

  const toX = (i: number) => pad + i * xStep;
  const toY = (v: number) => {
    const t = (v - minY) / span;
    return height - pad - t * (height - pad * 2);
  };

  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(2)} ${toY(p.y).toFixed(2)}`)
    .join(' ');

  const zeroY = toY(0);
  const last = points[points.length - 1]?.y ?? 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-white">{title}</div>
        <TinyBadge>
          Latest:{' '}
          <span className={['ml-1 tabular-nums', last >= 0 ? 'text-emerald-300' : 'text-rose-300'].join(' ')}>
            ${money(last)}
          </span>
        </TinyBadge>
      </div>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[170px] w-full">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(56,189,248,0.95)" />
              <stop offset="55%" stopColor="rgba(99,102,241,0.95)" />
              <stop offset="100%" stopColor="rgba(34,197,94,0.95)" />
            </linearGradient>

            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(56,189,248,0.22)" />
              <stop offset="60%" stopColor="rgba(99,102,241,0.10)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.00)" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75].map((t, idx) => {
            const y = pad + t * (height - pad * 2);
            return (
              <line
                key={idx}
                x1={pad}
                x2={width - pad}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.08)"
              />
            );
          })}

          <line x1={pad} x2={width - pad} y1={zeroY} y2={zeroY} stroke="rgba(255,255,255,0.18)" />

          <path
            d={`${d} L ${toX(points.length - 1)} ${height - pad} L ${toX(0)} ${height - pad} Z`}
            fill="url(#areaGrad)"
          />

          <path d={d} fill="none" stroke="url(#lineGrad)" strokeWidth="3.2" strokeLinecap="round" />

          {points.map((p, i) => (
            <g key={i}>
              <circle cx={toX(i)} cy={toY(p.y)} r="4.4" fill="rgba(0,0,0,0.45)" />
              <circle
                cx={toX(i)}
                cy={toY(p.y)}
                r="3"
                fill={p.y >= 0 ? 'rgba(34,197,94,0.95)' : 'rgba(244,63,94,0.95)'}
              />
            </g>
          ))}

          {points.map((p, i) => {
            const show = points.length <= 6 ? true : i % 2 === 0 || i === points.length - 1;
            if (!show) return null;
            return (
              <text
                key={`x-${i}`}
                x={toX(i)}
                y={height - 8}
                textAnchor="middle"
                fontSize="11"
                fill="rgba(255,255,255,0.55)"
              >
                {p.xLabel}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="text-xs text-white/55">
        This line shows your <span className="text-white/75 font-semibold">net after subs + savings target</span> across recent months.
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const state = useFin();

  const [month, setMonth] = React.useState(() => mk(new Date()));
  const monthDate = useMemo(() => parseMonthKey(month), [month]);

  const roll = useMemo(() => computeMonthRollup(state, month), [state, month]);

  // UI-only clamping to avoid showing "-" in the UI
  const netAfterTargetDisplay = Math.max(0, roll.netAfterTarget);
  const netAfterSuggestedDisplay = Math.max(0, roll.netAfterSuggested);

  const maxForBars = Math.max(
    roll.income,
    roll.expenses + roll.savingsTarget,
    roll.expenses + roll.suggestedSavings,
    1
  );

  const activeSubsCount = useMemo(() => {
    const activeGroupId = state.settings?.activeSubGroupId ?? null;
    const subs = Array.isArray(state.subs) ? state.subs : [];
    const groups = Array.isArray((state as any).subGroups) ? (state as any).subGroups : [];

    if (!activeGroupId) {
      return subs.filter((s: any) => !!s?.active).length;
    }

    const g = groups.find((x: any) => x?.id === activeGroupId);
    const ids: string[] =
      (g?.subIds as string[]) ??
      (g?.subscriptionIds as string[]) ??
      (g?.subs as string[]) ??
      [];

    const set = new Set(ids);
    return subs.filter((s: any) => !!s?.active && set.has(String(s?.id))).length;
  }, [state.subs, (state as any).subGroups, state.settings?.activeSubGroupId]);

  const series = useMemo(() => {
    const base = parseMonthKey(month);
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
      months.push(mk(d));
    }
    return months.map((m) => {
      const r = computeMonthRollup(state, m);
      const label = parseMonthKey(m).toLocaleString(undefined, { month: 'short' });
      return { xLabel: label, y: Math.max(0, r.netAfterTarget) };
    });
  }, [state, month]);

  const topSubs = useMemo(() => {
    const activeGroupId = state.settings?.activeSubGroupId ?? null;
    const subs = Array.isArray(state.subs) ? state.subs : [];
    const groups = Array.isArray((state as any).subGroups) ? (state as any).subGroups : [];

    let allowed: Set<string> | null = null;

    if (activeGroupId) {
      const g = groups.find((x: any) => x?.id === activeGroupId);
      const ids: string[] =
        (g?.subIds as string[]) ??
        (g?.subscriptionIds as string[]) ??
        (g?.subs as string[]) ??
        [];
      allowed = new Set(ids.map(String));
    }

    const filtered = subs.filter((s: any) => {
      if (!s?.active) return false;
      if (!allowed) return true;
      return allowed.has(String(s?.id));
    });

    return filtered
      .slice()
      .sort((a: any, b: any) => (b?.monthlyAmount ?? 0) - (a?.monthlyAmount ?? 0))
      .slice(0, 6)
      .map((s: any) => ({ name: String(s?.name ?? 'Unknown'), amt: Number(s?.monthlyAmount ?? 0) }));
  }, [state.subs, (state as any).subGroups, state.settings?.activeSubGroupId]);


  const donutSegments = useMemo(() => {
    const income = Math.max(0, roll.income);
    const expenses = Math.max(0, roll.expenses);
    const savings = Math.max(0, roll.savingsTarget);
    const remaining = Math.max(0, income - expenses - savings);

    return [
      {
        label: 'Subscriptions (expenses)',
        value: expenses,
        colorClass: 'bg-rose-400',
        stroke: 'rgba(244,63,94,0.95)',
      },
      {
        label: 'Savings target',
        value: savings,
        colorClass: 'bg-sky-400',
        stroke: 'rgba(56,189,248,0.95)',
      },
      {
        label: 'Remaining',
        value: remaining,
        colorClass: 'bg-lime-400',
        stroke: 'rgba(163,230,53,0.95)',
      },
    ];
  }, [roll.income, roll.expenses, roll.savingsTarget]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-3xl font-extrabold tracking-tight">Dashboard</div>
          <div className="mt-1 text-sm text-white/60">
            High-signal visuals • Income, subscription burn, savings, and net.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs font-semibold text-white/60">Month</div>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value || mk(new Date()))}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
          />
          <Button variant="danger" onClick={resetAll}>
            Reset All
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <TopStatCard
          title="Work income"
          kicker="This month"
          value={roll.workIncome}
          tone="income"
          footer={
            <>
              Total income: <span className="text-white/75 font-semibold tabular-nums">${money(roll.income)}</span>
            </>
          }
        />

        <TopStatCard
          title="Subscriptions (expenses)"
          kicker={roll.activeSubGroupName || 'All subscriptions'}
          value={roll.expenses}
          tone="expense"
          footer={
            <>
              Active subs: <span className="text-white/75 font-semibold">{activeSubsCount}</span>
            </>
          }
        />

        <TopStatCard
          title="Savings target"
          kicker={`Mode: ${state.settings.savingsMode}`}
          value={roll.savingsTarget}
          tone="expense"
          footer={
            state.settings.savingsMode === 'percent' ? (
              <>
                Rate: <span className="text-white/75 font-semibold">{money(state.settings.savingsValue)}%</span>
              </>
            ) : (
              <>
                Setting: <span className="text-white/75 font-semibold">fixed</span>
              </>
            )
          }
        />

        <TopStatCard
          title="Net after subs + savings"
          kicker={
            <>
              Suggested net:{' '}
              <span className="text-emerald-300 tabular-nums">${money(netAfterSuggestedDisplay)}</span>
            </>
          }
          value={netAfterTargetDisplay}
          tone="income"
          footer="After subs + target savings"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Allocation ring">
          <DonutChart
            centerLabel={{ top: 'Net after target', bottom: `$${money(netAfterTargetDisplay)}` }}
            segments={donutSegments}
          />
        </Card>

        <Card title="Plan bars (high clarity)">
          <div className="space-y-4">
            <SectionTitle title="Signals" subtitle="Fast glance bars (colored + proportional)" />
            <GradientBarRow
              label="Income"
              value={roll.income}
              max={maxForBars}
              gradient="bg-gradient-to-r from-emerald-500/80 to-lime-400/70"
              tone="income"
              rightHint="Top"
            />
            <GradientBarRow
              label="Subscriptions (expenses)"
              value={roll.expenses}
              max={maxForBars}
              gradient="bg-gradient-to-r from-red-500/80 to-rose-400/70"
              tone="expense"
            />
            <GradientBarRow
              label="Savings target"
              value={roll.savingsTarget}
              max={maxForBars}
              gradient="bg-gradient-to-r from-sky-500/80 to-indigo-400/70"
              tone="neutral"
              rightHint={state.settings.savingsMode === 'percent' ? 'Percent' : 'Fixed'}
            />
            <GradientBarRow
              label="Suggested savings"
              value={roll.suggestedSavings}
              max={maxForBars}
              gradient="bg-gradient-to-r from-indigo-500/80 to-cyan-400/70"
              tone="neutral"
              rightHint={`${roll.suggestedSavingsPct.toFixed(0)}%`}
            />
          </div>
        </Card>

        <Card title="Subscriptions heat">
          <div className="space-y-4">
            <SectionTitle title="Top subscriptions" subtitle="Largest monthly drains (active group)" />
            {topSubs.length === 0 ? (
              <div className="text-sm text-white/60">No active subscriptions in this group.</div>
            ) : (
              <div className="space-y-3">
                {(() => {
                  const max = Math.max(...topSubs.map((s) => s.amt), 1);
                  return topSubs.map((s) => (
                    <div key={s.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/70">{s.name}</span>
                        <span className="text-white/80 tabular-nums font-semibold">${money(s.amt)}</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-white/10 ring-1 ring-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400/70 via-fuchsia-400/70 to-sky-400/70"
                          style={{ width: `${clamp((s.amt / max) * 100, 0, 100)}%` }}
                        />
                      </div>
                    </div>
                  ));
                })()}
                <div className="text-xs text-white/50">Reduce the top 1–2 bars and your net improves immediately.</div>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Income split (stacked)">
          <div className="space-y-6">
            <StackedPlanBar title="Using your Savings Target" income={roll.income} expenses={roll.expenses} savings={roll.savingsTarget} />
            <StackedPlanBar title="Using Suggested Savings" income={roll.income} expenses={roll.expenses} savings={roll.suggestedSavings} />
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              If you set aside <span className="text-white font-semibold">${money(roll.suggestedSavings)}</span> first, then after subscriptions you can spend about:
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="text-xs text-white/60">Safe monthly spend (recommended)</div>
                  <div className="mt-1 text-xl font-extrabold text-white">${money(roll.safeMonthlySpendSuggested)}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="text-xs text-white/60">Safe weekly spend (recommended)</div>
                  <div className="mt-1 text-xl font-extrabold text-white">${money(roll.safeWeeklySpendSuggested)}</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-white/50">Guidance only. Your real savings is whatever you set in Settings.</div>
            </div>
          </div>
        </Card>

        <Card title="Net trend (recent months)">
          <LineChart title="Net after subs + savings target" points={series} />
        </Card>
      </div>

      <div className="text-xs text-white/40">
        Selected month:{' '}
        <span className="text-white/60">{monthDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</span>
      </div>
    </div>
  );
}
