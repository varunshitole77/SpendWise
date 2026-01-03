// components/Nav.tsx
'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo';

type NavLink = { href: string; label: string };

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

function Item({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        'rounded-xl px-3 py-1.5 text-sm font-semibold transition',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-0',
        active ? 'bg-white text-black' : 'text-white/70 hover:text-white hover:bg-white/5',
      ].join(' ')}
    >
      {label}
    </Link>
  );
}

function MobileItem({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        'flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition',
        active ? 'bg-white text-black' : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white',
      ].join(' ')}
    >
      <span>{label}</span>
      {active ? <span className="text-xs font-bold opacity-70">Active</span> : null}
    </Link>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);

  const links = useMemo<NavLink[]>(
    () => [
      { href: '/', label: 'Dashboard' },
      { href: '/work', label: 'Work' },
      { href: '/budgets', label: 'Budgets' },
      { href: '/subscriptions', label: 'Subscriptions' },
      { href: '/reports', label: 'Reports' },
      { href: '/settings', label: 'Settings' },
    ],
    []
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur">
      {/* subtle top highlight */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Logo />
          <div className="text-base font-extrabold tracking-tight text-white">SpendWise</div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 md:flex">
          {links.map((x) => (
            <Item key={x.href} href={x.href} label={x.label} />
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 md:hidden"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open ? (
        <div className="md:hidden">
          <div className="mx-auto max-w-6xl px-6 pb-4">
            <div className="rounded-2xl border border-white/10 bg-black/60 p-2">
              <div className="grid gap-2">
                {links.map((x) => (
                  <MobileItem
                    key={x.href}
                    href={x.href}
                    label={x.label}
                    onClick={() => setOpen(false)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
