import type { CartStatus } from '@/lib/store';

const labels: Record<CartStatus, string> = { FREE: 'FREE', IN_USE: 'IN USE', MINE: 'MINE', OVERDUE: 'OVERDUE', BROKEN: 'BROKEN', LOST: 'LOST' };

export default function CartStatusBadge({ status, size = 'sm' }: { status: CartStatus; size?: 'sm' | 'lg' }) {
	return <span className={`status-${status.toLowerCase()} rounded-full font-bold whitespace-nowrap ${size === 'lg' ? 'px-3 py-1 text-xs' : 'px-1.5 py-0.5 text-[9px]'}`}>{labels[status]}</span>;
}
