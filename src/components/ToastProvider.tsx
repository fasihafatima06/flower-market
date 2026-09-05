'use client';

import React from 'react';
import { Toaster } from 'sonner';

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-center"
      offset={80}
      toastOptions={{
        style: {
          borderRadius: '12px',
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          fontWeight: '600',
        },
        classNames: {
          toast: 'toast-slide-up',
        },
      }}
    />
  );
}