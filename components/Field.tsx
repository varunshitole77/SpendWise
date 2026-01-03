'use client';

import React from 'react';

export default function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold tracking-wide text-white/70">{label}</label>
      {children}
      {hint ? <div className="text-[11px] text-white/45">{hint}</div> : null}
    </div>
  );
}
