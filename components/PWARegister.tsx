'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    // Never register SW in dev — it will cache pages and you'll keep seeing "old UI".
    if (process.env.NODE_ENV !== 'production') return;

    if (!('serviceWorker' in navigator)) return;

    const onLoad = () => {
      navigator.serviceWorker
        .register('/sw.js')
        .catch(() => {
          // ignore
        });
    };

    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  return null;
}
