import React from 'react';
import type { CartStatus } from '@/lib/store';

const config: Record<CartStatus, { label: string; className: string }> = {
  FREE: { label: 'FREE', className: 'status-free' },
  MINE: { label: 'MINE', className: 'status-mine' },
  IN_USE: { label: 'IN USE', className: 'status-inuse' },
  OVERDUE: { label: 'OVERDUE', className: 'status-overdue' },
  BROKEN: { label: 'BROKEN', className: 'status-broken' },
  LOST: { label: 'LOST', className: 'status-lost' },
};

interface Props {
  status: CartStatus;
  size?: 'sm' | 'md' | 'lg';
}

export default function CartStatusBadge({ status, size = 'md' }: Props) {
  const { label, className } = config[status];
  const sizeClass =
    size === 'sm' ?'text-[9px] px-1.5 py-0.5'
      : size === 'lg' ?'text-sm px-3 py-1' :'text-[10px] px-2 py-0.5';
  return (
    <span
      className={[
        'inline-flex items-center justify-center rounded-full font-bold tracking-wider shrink-0',
        sizeClass,
        className,
      ].join(' ')}
    >
      {label}
    </span>
  );
}