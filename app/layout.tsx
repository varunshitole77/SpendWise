// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: {
    default: 'SpendWise',
    template: '%s • SpendWise',
  },
  description: 'Work income + subscriptions + budgets (weekly/monthly logs).',
  applicationName: 'SpendWise',
  appleWebApp: {
    capable: true,
    title: 'SpendWise',
    statusBarStyle: 'black-translucent',
  },
  // ❌ remove themeColor from metadata (Next warns for App Router)
};

export const viewport = {
  themeColor: '#000000',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="min-h-screen bg-black text-white antialiased">
        <Nav />
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
