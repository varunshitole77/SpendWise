'use client';

import React from 'react';

export default function Segment<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={[
              'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
              active ? 'bg-white text-black' : 'text-white/70 hover:bg-white/10',
            ].join(' ')}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
