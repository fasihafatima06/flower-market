'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Flower, Pencil, ShoppingCart, Warehouse } from 'lucide-react';
import { toast } from 'sonner';
import { usePhoolFlowStore } from '@/lib/store';
import BottomNav from '@/components/BottomNav';
import ToastProvider from '@/components/ToastProvider';

export default function MeScreen() {
  const vendor = usePhoolFlowStore((state) => state.vendor);
  const setVendor = usePhoolFlowStore((state) => state.setVendor);
  const clearVendor = usePhoolFlowStore((state) => state.clearVendor);
  const carts = usePhoolFlowStore((state) => state.carts);
  const reservations = usePhoolFlowStore((state) => state.reservations);
  const [editing, setEditing] = useState(false);
  const [stall, setStall] = useState(vendor?.stallNumber ?? '');
  const [name, setName] = useState(vendor?.name ?? '');
  const yourCart = carts.find((cart) => cart.currentHolderVendorId === vendor?.id);
  const yourBooking = reservations.find((reservation) => reservation.vendorId === vendor?.id);

  const save = () => {
    const stallNumber = Number(stall);
    if (!Number.isInteger(stallNumber) || stallNumber < 1 || stallNumber > 100 || !name.trim()) {
      toast.error('Enter a stall number from 1 to 100 and your name.');
      return;
    }
    setVendor({ id: `vendor-stall${stallNumber}`, stallNumber: String(stallNumber), name: name.trim() });
    setEditing(false);
    toast.success('Vendor profile saved.');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b border-border bg-background px-4 py-4">
        <div className="mx-auto flex max-w-lg items-center gap-2"><Flower className="text-primary" size={24} /><h1 className="text-xl font-extrabold">My stall</h1></div>
      </header>
      <main className="mx-auto flex max-w-lg flex-col gap-6 p-4">
        <section className="flex items-center justify-between rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-4"><Flower className="text-primary" size={34} /><div><h2 className="text-2xl font-extrabold">{vendor?.name}</h2><p className="text-sm text-muted-foreground">Stall {vendor?.stallNumber}</p><div className="mt-2 flex gap-2"><span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">{yourCart ? `Cart ${yourCart.cartNumber}` : 'No cart'}</span><span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">{yourBooking ? yourBooking.bayName : 'No bay'}</span></div></div></div>
          <button onClick={() => setEditing(!editing)} className="tap-target rounded-xl border border-border px-3 font-bold"><Pencil size={16} className="mr-1 inline" />Edit</button>
        </section>
        {editing && <section className="rounded-2xl border border-border bg-card p-4"><label className="text-sm font-bold">Stall number<input value={stall} onChange={(event) => setStall(event.target.value)} inputMode="numeric" className="mt-1 h-12 w-full rounded-xl border border-border bg-input px-3" /></label><label className="mt-3 block text-sm font-bold">Your name<input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-12 w-full rounded-xl border border-border bg-input px-3" /></label><button onClick={save} className="mt-4 h-12 w-full rounded-xl bg-primary font-bold text-white">Save profile</button></section>}
        <section className="overflow-hidden rounded-2xl border border-border bg-card"><h2 className="flex items-center gap-2 border-b border-border p-4 font-bold"><ShoppingCart className="text-primary" size={20} />My Current Cart</h2><div className="p-6 text-center">{yourCart ? <><p className="text-3xl font-extrabold">Cart {yourCart.cartNumber}</p><p className="mt-1 text-sm text-muted-foreground">Held by your stall</p><Link href="/handcarts" className="mt-4 inline-block rounded-xl bg-primary px-6 py-3 font-bold text-white">Manage Cart</Link></> : <><ShoppingCart className="mx-auto text-muted-foreground" size={42} /><p className="mt-3 text-lg font-bold">No cart assigned</p><p className="mt-1 text-sm text-muted-foreground">You do not currently hold a cart.</p><Link href="/handcarts" className="mt-4 inline-block rounded-xl bg-primary px-6 py-3 font-bold text-white">Claim a Cart</Link></>}</div></section>
        <section className="overflow-hidden rounded-2xl border border-border bg-card"><h2 className="flex items-center gap-2 border-b border-border p-4 font-bold"><Warehouse className="text-primary" size={20} />My Bay Bookings</h2><div className="p-6 text-center">{yourBooking ? <><p className="text-lg font-bold">{yourBooking.bayName}</p><p className="text-sm text-muted-foreground">{new Date(yourBooking.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} booking</p><Link href="/unloading-bays" className="mt-4 inline-block rounded-xl bg-primary px-6 py-3 font-bold text-white">Manage Bays</Link></> : <><Warehouse className="mx-auto text-muted-foreground" size={42} /><p className="mt-3 text-lg font-bold">No booking yet</p><p className="mt-1 text-sm text-muted-foreground">Your next unloading slot will appear here.</p><Link href="/unloading-bays" className="mt-4 inline-block rounded-xl bg-primary px-6 py-3 font-bold text-white">Book a Bay</Link></>}</div></section>
        <button onClick={() => { clearVendor(); toast.success('Profile cleared.'); }} className="tap-target rounded-xl border border-red-300 font-bold text-red-600">Clear profile</button>
      </main>
      <BottomNav /><ToastProvider />
    </div>
  );
}
