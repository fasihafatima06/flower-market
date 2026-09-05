'use client';

import React, { useState, useEffect } from 'react';
import { usePhoolFlowStore, getOverdueMinutes, getSlots, BAY_IDS, BAY_NAMES } from '@/lib/store';
import BottomNav from '@/components/BottomNav';
import LiveBadge from '@/components/LiveBadge';
import CartStatusBadge from '@/components/CartStatusBadge';
import BottomSheet from '@/components/BottomSheet';
import VendorSetupGate from '@/components/VendorSetupGate';
import ToastProvider from '@/components/ToastProvider';
import { toast } from 'sonner';
import { CartDetailSheet } from '@/app/handcarts/components/HandcartsScreen';
import {
  Flower,
  Zap,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  ChevronRight,
  ShoppingCart,
  Warehouse,
} from 'lucide-react';

type ActivityIconType = 'CLAIM' | 'RELEASE' | 'BOOK' | 'CANCEL' | 'ISSUE' | 'HANDOFF' | 'RESOLVE' | string;

function activityIcon(type: ActivityIconType) {
  const base = 'shrink-0 mt-0.5';
  switch (type) {
    case 'CLAIM': return <CheckCircle2 size={14} className={`${base} text-primary`} />;
    case 'RELEASE': return <CheckCircle2 size={14} className={`${base} text-green-600`} />;
    case 'BOOK': return <Calendar size={14} className={`${base} text-primary`} />;
    case 'CANCEL': return <Clock size={14} className={`${base} text-muted-foreground`} />;
    case 'ISSUE': return <AlertTriangle size={14} className={`${base} text-red-500`} />;
    case 'HANDOFF': return <ChevronRight size={14} className={`${base} text-amber-500`} />;
    case 'RESOLVE': return <CheckCircle2 size={14} className={`${base} text-green-600`} />;
    default: return <Activity size={14} className={`${base} text-muted-foreground`} />;
  }
}

function formatActivityTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, '0')} ${ampm}`;
}

// ── Claim Cart Sheet ─────────────────────────────────────────────────────────

function ClaimCartSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState<null | { cart: ReturnType<typeof usePhoolFlowStore.getState>['carts'][0] }>(null);
  const [loading, setLoading] = useState(false);
  const carts = usePhoolFlowStore((s) => s.carts);
  const claimCart = usePhoolFlowStore((s) => s.claimCart);

  const handleInput = (val: string) => {
    if (val.length > 2) return;
    setInput(val);
    if (val.length === 2) {
      const padded = val.padStart(2, '0');
      const found = carts.find((c) => c.cartNumber === padded);
      setPreview(found ? { cart: found } : null);
    } else {
      setPreview(null);
    }
  };

  const handleClaim = () => {
    if (!preview) return;
    setLoading(true);
    setTimeout(() => {
      const result = claimCart(preview.cart.cartNumber);
      if (result.success) {
        toast.success(result.message);
        onClose();
        setInput('');
        setPreview(null);
      } else {
        toast.error(result.message);
      }
      setLoading(false);
    }, 200);
  };

  const handleClose = () => {
    onClose();
    setInput('');
    setPreview(null);
  };

  return (
    <BottomSheet open={open} onClose={handleClose} title="Claim a Cart">
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Enter 2-digit Cart ID
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="12"
            className="w-full h-16 text-4xl font-extrabold text-center rounded-xl border-2 border-border bg-input focus:outline-none focus:border-primary transition-colors font-tabular"
            autoFocus
            max={20}
            min={1}
          />
          <p className="text-xs text-muted-foreground mt-1 text-center">Carts numbered 01–20</p>
        </div>

        {preview && (
          <div className={[
            'rounded-xl p-4 border-2 flex flex-col gap-2',
            preview.cart.status === 'FREE' ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50',
          ].join(' ')}>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold text-foreground font-tabular">
                Cart {preview.cart.cartNumber}
              </span>
              <CartStatusBadge status={preview.cart.status} size="lg" />
            </div>
            {preview.cart.status === 'FREE' && (
              <p className="text-sm text-green-700 font-medium">Available now</p>
            )}
            {preview.cart.status !== 'FREE' && (
              <p className="text-sm text-red-700 font-medium">
                {preview.cart.status === 'BROKEN' ?'Cart is marked BROKEN — unavailable'
                  : preview.cart.status === 'LOST' ?'Cart is marked LOST — unavailable'
                  : `Held by Stall ${preview.cart.currentHolderStall} · ${preview.cart.currentHolderName}`}
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleClaim}
          disabled={!preview || preview.cart.status !== 'FREE' || loading}
          className="w-full h-14 rounded-xl bg-primary text-white text-base font-bold flex items-center justify-center gap-2 active:scale-95 transition-all duration-150 disabled:opacity-40"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : preview?.cart.status === 'FREE' ? (
            `Claim Cart ${preview.cart.cartNumber}`
          ) : (
            'Claim Cart'
          )}
        </button>
      </div>
    </BottomSheet>
  );
}

// ── Book Bay Sheet ────────────────────────────────────────────────────────────

function BookBaySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reservations = usePhoolFlowStore((s) => s.reservations);
  const bookBay = usePhoolFlowStore((s) => s.bookBay);
  const vendor = usePhoolFlowStore((s) => s.vendor);
  const [loading, setLoading] = useState(false);

  const slots = getSlots(6);

  const getSlotStatus = (bayId: string, slotStart: string) => {
    const res = reservations.find((r) => r.bayId === bayId && r.startTime === slotStart);
    if (!res) return 'FREE';
    if (res.vendorId === vendor?.id) return 'MINE';
    return 'BOOKED';
  };

  const availableOptions: Array<{ bayId: string; bayName: string; slotStart: string; slotEnd: string; label: string }> = [];
  for (const slot of slots) {
    for (let i = 0; i < BAY_IDS.length; i++) {
      const st = getSlotStatus(BAY_IDS[i], slot.start);
      if (st === 'FREE') {
        availableOptions.push({ bayId: BAY_IDS[i], bayName: BAY_NAMES[i], slotStart: slot.start, slotEnd: slot.end, label: slot.label });
        if (availableOptions.length >= 6) break;
      }
    }
    if (availableOptions.length >= 6) break;
  }

  const handleBook = (opt: typeof availableOptions[0]) => {
    setLoading(true);
    setTimeout(() => {
      const result = bookBay(opt.bayId, opt.slotStart, opt.slotEnd);
      if (result.success) {
        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.message);
      }
      setLoading(false);
    }, 200);
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Book a Bay">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Next available 15-minute slots:</p>
        {availableOptions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-base font-semibold text-foreground">All slots taken</p>
            <p className="text-sm text-muted-foreground mt-1">Check back soon as vendors release bays.</p>
          </div>
        ) : (
          availableOptions.map((opt, i) => (
            <button
              key={`bay-opt-${opt.bayId}-${opt.slotStart}`}
              onClick={() => handleBook(opt)}
              disabled={loading}
              className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-border bg-background hover:border-primary hover:bg-primary/5 active:scale-95 transition-all duration-150 disabled:opacity-60"
            >
              <div className="text-left">
                <p className="text-base font-bold text-foreground">{opt.bayName}</p>
                <p className="text-sm text-muted-foreground">{opt.label}</p>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-lg bg-green-50 text-green-700 border border-green-300">
                FREE
              </span>
            </button>
          ))
        )}
      </div>
    </BottomSheet>
  );
}

// ── Main Board ────────────────────────────────────────────────────────────────

function LiveMarketBoardContent() {
  const carts = usePhoolFlowStore((s) => s.carts);
  const reservations = usePhoolFlowStore((s) => s.reservations);
  const activity = usePhoolFlowStore((s) => s.activity);
  const vendor = usePhoolFlowStore((s) => s.vendor);

  const [claimOpen, setClaimOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [selectedCart, setSelectedCart] = useState<ReturnType<typeof usePhoolFlowStore.getState>['carts'][0] | null>(null);
  const [clockStr, setClockStr] = useState('5:02 AM');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hh = h % 12 === 0 ? 12 : h % 12;
      setClockStr(`${hh}:${String(m).padStart(2, '0')} ${ampm}`);
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  const freeCarts = carts.filter((c) => c.status === 'FREE').length;
  const inUseCarts = carts.filter((c) => c.status === 'IN_USE' || c.status === 'MINE').length;
  const overdueCarts = carts.filter((c) => c.status === 'OVERDUE').length;
  const issueCarts = carts.filter((c) => c.status === 'BROKEN' || c.status === 'LOST').length;

  // Use real current time for bay slot display
  const nowForSlot = new Date();
  const roundedM = Math.floor(nowForSlot.getMinutes() / 15) * 15;
  const currentSlotDate = new Date(nowForSlot.getFullYear(), nowForSlot.getMonth(), nowForSlot.getDate(), nowForSlot.getHours(), roundedM, 0, 0);
  const currentSlotStart = currentSlotDate.toISOString();
  const currentSlotEnd = new Date(currentSlotDate.getTime() + 15 * 60000).toISOString();
  const currentSlotLabel = (() => {
    const sH = currentSlotDate.getHours();
    const sM = currentSlotDate.getMinutes();
    const eD = new Date(currentSlotDate.getTime() + 15 * 60000);
    const eH = eD.getHours();
    const eM = eD.getMinutes();
    const fmtH = (h: number) => (h % 12 === 0 ? 12 : h % 12);
    const pad2 = (n: number) => String(n).padStart(2, '0');
    return `${fmtH(sH)}:${pad2(sM)} ${sH >= 12 ? 'PM' : 'AM'}–${fmtH(eH)}:${pad2(eM)} ${eH >= 12 ? 'PM' : 'AM'}`;
  })();

  const bayStatuses = BAY_IDS.map((bid, i) => {
    const res = reservations.find((r) => r.bayId === bid && r.startTime === currentSlotStart);
    return {
      id: bid,
      name: BAY_NAMES[i],
      res,
      isMine: res?.vendorId === vendor?.id,
    };
  });
  const freeBays = bayStatuses.filter((b) => !b.res).length;

  const recentActivity = activity.slice(0, 8);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background border-b border-border px-4 pt-safe">
        <div className="max-w-lg mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Flower size={14} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-foreground tracking-tight">Flower Mandi</span>
              <span className="ml-1.5 text-xs text-muted-foreground font-medium">Live Dispatch</span>
            </div>
          </div>
          <LiveBadge />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Time + Rush indicator */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-4xl font-extrabold text-foreground font-tabular tracking-tight leading-none">
              {clockStr}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 pulse-live" />
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Morning Rush</span>
            </div>
          </div>
          {vendor && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-medium">Stall {vendor.stallNumber}</p>
              <p className="text-sm font-bold text-foreground">{vendor.name}</p>
            </div>
          )}
        </div>

        {/* KPI summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-card p-4"><p className="text-3xl font-extrabold text-green-600 font-tabular">{freeCarts}</p><p className="text-xs font-bold text-muted-foreground">Free carts</p><p className="mt-1 text-[11px] text-muted-foreground">{inUseCarts} in use · {overdueCarts} overdue</p></div>
          <div className="rounded-xl border border-border bg-card p-4"><p className="text-3xl font-extrabold text-primary font-tabular">{freeBays}</p><p className="text-xs font-bold text-muted-foreground">Free bays</p><p className="mt-1 text-[11px] text-muted-foreground">4 shared bays · 15 min slots</p></div>
        </div>

        {vendor && (() => {
          const yourCart = carts.find((cart) => cart.currentHolderVendorId === vendor.id);
          return <button onClick={() => yourCart && setSelectedCart(yourCart)} className="flex w-full items-center justify-between rounded-2xl border border-amber-300 bg-amber-50 p-4 text-left active:scale-[.99]">
            <div><p className="text-xs font-bold uppercase tracking-wide text-amber-700">Your cart</p><p className="mt-1 text-lg font-extrabold text-amber-800">{yourCart ? `Cart ${yourCart.cartNumber}` : 'No cart assigned'}</p><p className="text-sm text-amber-700">{yourCart ? 'Tap to release, hand off, or report issue' : 'Claim a cart to see it here'}</p></div><ChevronRight className="text-amber-700" />
          </button>;
        })()}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setClaimOpen(true)}
            className="h-16 rounded-xl bg-primary text-white flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all duration-150 shadow-sm"
          >
            <Zap size={18} className="text-white" />
            <span className="text-sm font-bold">Claim Cart</span>
          </button>
          <button
            onClick={() => setBookOpen(true)}
            className="h-16 rounded-xl bg-secondary border border-border flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all duration-150"
          >
            <Calendar size={18} className="text-foreground" />
            <span className="text-sm font-bold text-foreground">Book Bay</span>
          </button>
        </div>

        {/* Cart grid */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">All 20 Carts</h2>
            {issueCarts > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
                <AlertTriangle size={12} />
                {issueCarts} issue{issueCarts > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="grid grid-cols-5 gap-px bg-border">
            {carts.map((cart) => {
              const isMine = cart.currentHolderVendorId === vendor?.id;
              const displayStatus = isMine ? 'MINE' : cart.status;
              const overdue = cart.status === 'OVERDUE' ? getOverdueMinutes(cart.expectedReleaseAt) : 0;

              return (
                <button
                  key={cart.id}
                  className={[
                    'bg-card flex flex-col items-center justify-center py-2.5 px-1 gap-0.5',
                    displayStatus === 'OVERDUE' ? 'overdue-pulse' : '',
                  ].join(' ')}
                  onClick={() => setSelectedCart(cart)}
                >
                  <span className="text-lg font-extrabold text-foreground font-tabular leading-none">
                    {cart.cartNumber}
                  </span>
                  <CartStatusBadge status={displayStatus} size="sm" />
                  {overdue > 0 && (
                    <span className="text-[8px] font-bold text-red-600 font-tabular">+{overdue}m</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bay status strip */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-bold text-foreground">Unloading Bays · Now</h2>
            <p className="text-xs text-muted-foreground">{currentSlotLabel}</p>
          </div>
          <div className="grid grid-cols-4 gap-px bg-border">
            {bayStatuses.map((bay) => (
              <div
                key={bay.id}
                className={[
                  'flex flex-col items-center justify-center py-3 px-1 gap-1 bg-card',
                ].join(' ')}
              >
                <span className="text-xs font-bold text-foreground">{bay.name}</span>
                {bay.res ? (
                  <>
                    <span className={[
                      'text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                      bay.isMine ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-800',
                    ].join(' ')}>
                      {bay.isMine ? 'YOURS' : 'BOOKED'}
                    </span>
                    <span className="text-[9px] text-muted-foreground font-medium">
                      {bay.isMine ? `Stall ${vendor?.stallNumber}` : `Stall ${bay.res.vendorStall}`}
                    </span>
                  </>
                ) : (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                    FREE
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Live activity feed — split into Cart and Bay sections */}
        <div className="flex flex-col gap-3">
          {/* Cart Activity */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <ShoppingCart size={14} className="text-primary" />
              <h2 className="text-sm font-bold text-foreground">Cart Activity</h2>
            </div>
            <div className="divide-y divide-border">
              {recentActivity.filter((item) => item.cartId !== null).slice(0, 5).length === 0 ? (
                <div className="px-4 py-3 text-xs text-muted-foreground">No cart activity yet.</div>
              ) : (
                recentActivity.filter((item) => item.cartId !== null).slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-start gap-2.5 px-4 py-2.5">
                    {activityIcon(item.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium leading-tight truncate">
                        {item.message}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-tabular shrink-0">
                      {formatActivityTime(item.timestamp)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bay Activity */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Warehouse size={14} className="text-primary" />
              <h2 className="text-sm font-bold text-foreground">Bay Activity</h2>
            </div>
            <div className="divide-y divide-border">
              {recentActivity.filter((item) => item.bayId !== null).slice(0, 5).length === 0 ? (
                <div className="px-4 py-3 text-xs text-muted-foreground">No bay activity yet.</div>
              ) : (
                recentActivity.filter((item) => item.bayId !== null).slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-start gap-2.5 px-4 py-2.5">
                    {activityIcon(item.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium leading-tight truncate">
                        {item.message}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-tabular shrink-0">
                      {formatActivityTime(item.timestamp)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <ClaimCartSheet open={claimOpen} onClose={() => setClaimOpen(false)} />
      <BookBaySheet open={bookOpen} onClose={() => setBookOpen(false)} />
      <CartDetailSheet cart={selectedCart} onClose={() => setSelectedCart(null)} />
      <BottomNav />
      <ToastProvider />
    </div>
  );
}

export default function LiveMarketBoardScreen() {
  return (
    <VendorSetupGate>
      <LiveMarketBoardContent />
    </VendorSetupGate>
  );
}