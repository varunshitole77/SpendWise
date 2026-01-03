// app/subscriptions/page.tsx
'use client';

import React, { useMemo, useSyncExternalStore } from 'react';
import Card from '@/components/Card';
import Field from '@/components/Field';
import Button from '@/components/Button';
import {
  addSub,
  deleteSub,
  getSnapshot,
  getServerSnapshot,
  subscribe,
  toggleSub,
  addSubGroup,
  deleteSubGroup,
  applySubGroup,
  setActiveSubGroup,
} from '@/lib/store';
import { money } from '@/lib/finance';

function useFin() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function SubscriptionsPage() {
  const state = useFin();

  const [name, setName] = React.useState('');
  const [monthlyAmount, setMonthlyAmount] = React.useState('');

  // group builder
  const [groupName, setGroupName] = React.useState('');
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});

  const list = useMemo(() => (Array.isArray(state.subs) ? state.subs : []), [state.subs]);
  const groups = useMemo(() => (Array.isArray((state as any).subGroups) ? (state as any).subGroups : []), [state]);

  const total = useMemo(
    () => list.filter((x) => x?.active).reduce((a, b) => a + (Number(b?.monthlyAmount) || 0), 0),
    [list]
  );

  function submit() {
    const amt = Number(monthlyAmount);
    if (!name.trim()) return;
    if (!Number.isFinite(amt) || amt <= 0) return;

    addSub({
      name: name.trim(),
      monthlyAmount: Math.round(amt * 100) / 100,
      active: true,
    });

    setName('');
    setMonthlyAmount('');
  }

  function togglePick(id: string) {
    setSelected((p) => ({ ...p, [id]: !p[id] }));
  }

  function createGroup() {
    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k);

    if (ids.length === 0) return;

    const gid = addSubGroup((groupName || '').trim() || 'My Group', ids);

    // optional: auto apply
    applySubGroup(gid);
    setActiveSubGroup(gid);

    setGroupName('');
    setSelected({});
  }

  const activeGroupId = (state as any)?.settings?.activeSubGroupId ?? null;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-3xl font-extrabold tracking-tight">Subscriptions</div>
        <div className="mt-1 text-sm text-white/60">
          These are treated as <span className="text-white/75">monthly expenses</span> (since transactions are off).
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Add subscription">
          <div className="space-y-4">
            <Field label="Name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Spotify"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              />
            </Field>

            <Field label="Monthly amount (USD)">
              <input
                inputMode="decimal"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(e.target.value)}
                placeholder="21"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              />
            </Field>

            <div className="flex items-center justify-between">
              <div className="text-xs text-white/55">
                Active monthly total: <span className="text-white/80">${money(total)}</span>
              </div>
              <Button onClick={submit}>Add</Button>
            </div>
          </div>
        </Card>

        <Card title="Your subscriptions">
          {list.length === 0 ? (
            <div className="text-sm text-white/60">No subscriptions yet.</div>
          ) : (
            <div className="space-y-2">
              {list.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!!selected[s.id]}
                      onChange={() => togglePick(s.id)}
                      className="h-4 w-4 accent-white"
                    />
                    <div>
                      <div className="text-sm font-semibold text-white/80">{s.name}</div>
                      <div className="text-xs text-white/50">${money(s.monthlyAmount)} / month</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => toggleSub(s.id)}>
                      {s.active ? 'Active' : 'Paused'}
                    </Button>
                    <Button variant="ghost" onClick={() => deleteSub(s.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Subscription groups (save sets you reuse)">
          <div className="space-y-4">
            <Field label="New group name">
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Rent + Bills"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              />
            </Field>

            <div className="text-xs text-white/55">
              Tick subscriptions above, then create a group. You can apply a group anytime to instantly set Active/Pause.
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={createGroup}>Create group</Button>
              <Button variant="ghost" onClick={() => setSelected({})}>
                Clear selection
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Saved groups">
          {groups.length === 0 ? (
            <div className="text-sm text-white/60">No groups yet.</div>
          ) : (
            <div className="space-y-2">
              {groups.map((g: any) => {
                const subIds: string[] = Array.isArray(g?.subIds) ? g.subIds : [];
                const isActive = activeGroupId === g?.id;

                return (
                  <div
                    key={g.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white/80">{g.name}</div>
                      <div className="text-xs text-white/50">{subIds.length} subscriptions</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant={isActive ? 'danger' : 'ghost'}
                        onClick={() => {
                          applySubGroup(g.id);
                          setActiveSubGroup(g.id);
                        }}
                      >
                        {isActive ? 'In use' : 'Apply'}
                      </Button>

                      <Button variant="ghost" onClick={() => deleteSubGroup(g.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}

              <div className="pt-2">
                <Button variant="ghost" onClick={() => setActiveSubGroup(null)}>
                  Use manual active/pause
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
