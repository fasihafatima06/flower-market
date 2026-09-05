'use client';

import React, { useEffect, useState } from 'react';
import { usePhoolFlowStore } from '@/lib/store';

export default function LiveBadge() {
  const isOnline = usePhoolFlowStore((s) => s?.isOnline);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleOnline = () => usePhoolFlowStore?.getState()?.setOnline(true);
    const handleOffline = () => usePhoolFlowStore?.getState()?.setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!mounted) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
        LIVE
      </span>
    );
  }

  return (
    <span
      className={[
        'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
        isOnline
          ? 'bg-green-50 text-green-700' :'bg-amber-50 text-amber-700',
      ]?.join(' ')}
    >
      <span
        className={[
          'w-1.5 h-1.5 rounded-full',
          isOnline ? 'bg-green-500 pulse-live' : 'bg-amber-500',
        ]?.join(' ')}
      />
      {isOnline ? 'LIVE' : 'OFFLINE'}
    </span>
  );
}