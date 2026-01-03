'use client';

import React from 'react';

type Variant = 'primary' | 'ghost' | 'danger';

export default function Button({
  children,
  onClick,
  type = 'button',
  disabled,
  variant = 'primary',
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  variant?: Variant;
  className?: string;
}) {
  const base =
    'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition ' +
    'focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-60 disabled:cursor-not-allowed';

  const styles: Record<Variant, string> = {
    primary: 'bg-white text-black hover:bg-white/90',
    ghost: 'bg-transparent text-white/85 hover:bg-white/10 border border-white/10',
    danger: 'bg-red-500/90 text-white hover:bg-red-500',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[base, styles[variant], className].join(' ')}
    >
      {children}
    </button>
  );
}
