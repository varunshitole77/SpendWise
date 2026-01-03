import React from 'react';

export default function Card({
  title,
  children,
  right,
  className = '',
}: {
  title?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        'rounded-2xl border border-white/10 bg-white/5 shadow-sm',
        'backdrop-blur-md',
        className,
      ].join(' ')}
    >
      {(title || right) && (
        <div className="flex items-center justify-between px-5 pt-4">
          {title ? <div className="text-xs font-semibold tracking-wide text-white/70">{title}</div> : <div />}
          {right ? <div>{right}</div> : null}
        </div>
      )}
      <div className="px-5 pb-5 pt-3">{children}</div>
    </div>
  );
}
