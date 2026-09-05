import { useState, type ReactNode } from 'react';
import { usePhoolFlowStore } from '@/lib/store';
import { toast } from 'sonner';

export default function VendorSetupGate({ children }: { children: ReactNode }) {
	const vendor = usePhoolFlowStore((state) => state.vendor);
	const setVendor = usePhoolFlowStore((state) => state.setVendor);
	const [stall, setStall] = useState('');
	const [name, setName] = useState('');
	if (vendor) return <>{children}</>;
	const save = () => {
		const stallNumber = Number(stall);
		if (!Number.isInteger(stallNumber) || stallNumber < 1 || stallNumber > 100 || !name.trim()) { toast.error('Enter a stall number from 1 to 100 and your name.'); return; }
		setVendor({ id: `vendor-stall${stallNumber}`, stallNumber: String(stallNumber), name: name.trim() });
		toast.success('Profile saved.');
	};
	return <div className="min-h-screen bg-background p-4"><div className="mx-auto mt-16 max-w-sm rounded-2xl border border-border bg-card p-6"><h1 className="text-2xl font-extrabold">Welcome to Flower Mandi</h1><p className="mt-2 text-sm text-muted-foreground">Enter your stall details to claim carts and reserve bays.</p><label className="mt-5 block text-sm font-bold">Stall number<input value={stall} onChange={(event) => setStall(event.target.value)} inputMode="numeric" className="mt-1 h-12 w-full rounded-xl border border-border bg-input px-3" placeholder="12" /></label><label className="mt-3 block text-sm font-bold">Your name<input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-12 w-full rounded-xl border border-border bg-input px-3" placeholder="Ramesh" /></label><button onClick={save} className="mt-5 h-12 w-full rounded-xl bg-primary font-bold text-white">Enter market</button></div></div>;
}
