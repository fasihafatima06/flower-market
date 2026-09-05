import type { ReactNode } from 'react';

export default function BottomSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
	if (!open) return null;
	return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}><section className="slide-up max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-4 pb-8" onClick={(event) => event.stopPropagation()}><div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" /><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-extrabold">{title}</h2><button className="tap-target text-2xl" onClick={onClose} aria-label="Close">×</button></div>{children}</section></div>;
}
