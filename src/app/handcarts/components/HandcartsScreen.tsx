'use client';

import React, { useState } from 'react';
import {
  usePhoolFlowStore,
  Cart,
  getOverdueMinutes,
  formatSlotTime,
} from '@/lib/store';
import BottomNav from '@/components/BottomNav';
import LiveBadge from '@/components/LiveBadge';
import CartStatusBadge from '@/components/CartStatusBadge';
import BottomSheet from '@/components/BottomSheet';
import VendorSetupGate from '@/components/VendorSetupGate';
import ToastProvider from '@/components/ToastProvider';
import { toast } from 'sonner';
import {
  Flower,
  Wrench,
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Search,
} from 'lucide-react';

type FilterType = 'ALL' | 'FREE' | 'MINE' | 'ISSUES';

// ── Cart Detail Sheet ────────────────────────────────────────────────────────

export function CartDetailSheet({
  cart,
  onClose,
}: {
  cart: Cart | null;
  onClose: () => void;
}) {
  const vendor = usePhoolFlowStore((s) => s.vendor);
  const claimCart = usePhoolFlowStore((s) => s.claimCart);
  const releaseCart = usePhoolFlowStore((s) => s.releaseCart);
  const reportIssue = usePhoolFlowStore((s) => s.reportIssue);
  const resolveIssue = usePhoolFlowStore((s) => s.resolveIssue);
  const handoffCart = usePhoolFlowStore((s) => s.handoffCart);

  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'main' | 'issue' | 'handoff' | 'release-confirm'>('main');
  const [issueNote, setIssueNote] = useState('');
  const [handoffStall, setHandoffStall] = useState('');
  const [handoffName, setHandoffName] = useState('');

  if (!cart) return null;

  const isMine = cart.currentHolderVendorId === vendor?.id;
  const overdue = cart.status === 'OVERDUE' ? getOverdueMinutes(cart.expectedReleaseAt) : 0;
  const displayStatus = isMine ? 'MINE' : cart.status;

  const run = (fn: () => { success: boolean; message: string }) => {
    setLoading(true);
    setTimeout(() => {
      const result = fn();
      if (result.success) {
        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.message);
      }
      setLoading(false);
    }, 200);
  };

  const handleIssue = (type: 'BROKEN' | 'LOST') => {
    setLoading(true);
    setTimeout(() => {
      reportIssue(cart.id, type, issueNote || undefined);
      toast.success(`Cart ${cart.cartNumber} marked ${type}.`);
      setLoading(false);
      onClose();
    }, 200);
  };

  const handleHandoff = () => {
    const recipientStall = Number(handoffStall);
    if (!Number.isInteger(recipientStall) || recipientStall < 1 || recipientStall > 100) {
      toast.error('Enter a receiving stall number from 1 to 100.');
      return;
    }
    const recipientStallText = String(recipientStall);
    if (recipientStallText === vendor?.stallNumber) {
      toast.error('You cannot hand off a cart to yourself.');
      return;
    }
    run(() =>
      handoffCart(
        cart.id,
        recipientStallText,
        handoffName.trim() || `Stall ${recipientStallText}`,
        `vendor-stall${recipientStallText}`
      )
    );
  };

  const handleClose = () => {
    setView('main');
    setIssueNote('');
    setHandoffStall('');
    setHandoffName('');
    onClose();
  };

  const sheetTitle =
    view === 'issue'
      ? `Report Issue · Cart ${cart.cartNumber}`
      : view === 'handoff'
      ? `Hand Off Cart ${cart.cartNumber}`
      : view === 'release-confirm'
      ? `Release Cart ${cart.cartNumber}?`
      : `Cart ${cart.cartNumber}`;

  return (
    <BottomSheet open={!!cart} onClose={handleClose} title={sheetTitle}>
      {/* MAIN VIEW */}
      {view === 'main' && (
        <div className="flex flex-col gap-4">
          {/* Cart header */}
          <div className="flex items-center justify-between p-4 bg-secondary rounded-xl">
            <div>
              <p className="text-4xl font-extrabold text-foreground font-tabular leading-none">
                {cart.cartNumber}
              </p>
              {cart.currentHolderStall && (
                <p className="text-sm text-muted-foreground mt-1">
                  Stall {cart.currentHolderStall} · {cart.currentHolderName}
                </p>
              )}
              {cart.claimedAt && (
                <p className="text-xs text-muted-foreground">
                  Claimed {formatSlotTime(cart.claimedAt)}
                  {cart.expectedReleaseAt && ` · Expected ${formatSlotTime(cart.expectedReleaseAt)}`}
                </p>
              )}
              {overdue > 0 && (
                <p className="text-sm font-bold text-red-600 mt-1">
                  ⚠ Overdue by {overdue} min
                </p>
              )}
            </div>
            <CartStatusBadge status={displayStatus} size="lg" />
          </div>

          {/* Issue note */}
          {cart.issueNote && (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-200">
              <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{cart.issueNote}</p>
            </div>
          )}

          {/* FREE cart */}
          {cart.status === 'FREE' && (
            <>
              <p className="text-sm text-muted-foreground text-center">Available now</p>
              <button
                onClick={() => run(() => claimCart(cart.cartNumber))}
                disabled={loading}
                className="w-full h-14 rounded-xl bg-primary text-white text-base font-bold flex items-center justify-center gap-2 active:scale-95 transition-all duration-150 disabled:opacity-60"
              >
                {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'CLAIM CART'}
              </button>
            </>
          )}

          {/* MINE cart */}
          {isMine && (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-primary font-semibold text-center">You are using this cart</p>
              <button
                onClick={() => setView('release-confirm')}
                className="w-full h-12 rounded-xl border-2 border-red-400 text-red-600 text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all duration-150"
              >
                <XCircle size={16} />
                RELEASE CART
              </button>
              <button
                onClick={() => setView('handoff')}
                className="w-full h-12 rounded-xl border-2 border-border text-foreground text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all duration-150"
              >
                <ArrowRightLeft size={16} />
                HAND OFF
              </button>
              <button
                onClick={() => setView('issue')}
                className="w-full h-12 rounded-xl border-2 border-border text-muted-foreground text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all duration-150"
              >
                <Wrench size={16} />
                REPORT ISSUE
              </button>
            </div>
          )}

          {/* IN_USE / OVERDUE (not mine) */}
          {(cart.status === 'IN_USE' || cart.status === 'OVERDUE') && !isMine && (
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-muted rounded-xl text-center">
                <p className="text-sm text-muted-foreground">
                  Currently held by <strong className="text-foreground">Stall {cart.currentHolderStall} · {cart.currentHolderName}</strong>
                </p>
                {cart.expectedReleaseAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Expected release: {formatSlotTime(cart.expectedReleaseAt)}
                  </p>
                )}
              </div>
              {cart.status === 'OVERDUE' && (
                <button
                  onClick={() => setView('issue')}
                  className="w-full h-12 rounded-xl border-2 border-amber-400 text-amber-700 text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all duration-150"
                >
                  <AlertTriangle size={16} />
                  Report Bay Still Occupied
                </button>
              )}
            </div>
          )}

          {/* BROKEN / LOST */}
          {(cart.status === 'BROKEN' || cart.status === 'LOST') && (
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-red-50 rounded-xl text-center border border-red-200">
                <p className="text-sm text-red-700 font-semibold">
                  {cart.status === 'BROKEN' ? '🔧 This cart is marked BROKEN' : '❌ This cart is reported LOST'}
                </p>
                <p className="text-xs text-red-600 mt-1">Market team has been notified.</p>
              </div>
              <button
                onClick={() => {
                  resolveIssue(cart.id);
                  toast.success(`Cart ${cart.cartNumber} is available again.`);
                  handleClose();
                }}
                className="w-full h-12 rounded-xl border-2 border-green-400 text-green-700 text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all duration-150"
              >
                <RotateCcw size={16} />
                {cart.status === 'BROKEN' ? 'Mark as Repaired' : 'Mark as Found'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* RELEASE CONFIRM VIEW */}
      {view === 'release-confirm' && (
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-secondary rounded-xl text-center">
            <p className="text-3xl font-extrabold text-foreground font-tabular">Cart {cart.cartNumber}</p>
            <p className="text-sm text-muted-foreground mt-1">Ready to release?</p>
          </div>
          <button
            onClick={() => run(() => releaseCart(cart.id))}
            disabled={loading}
            className="w-full h-14 rounded-xl bg-red-500 text-white text-base font-bold flex items-center justify-center gap-2 active:scale-95 transition-all duration-150 disabled:opacity-60"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Release'}
          </button>
          <button
            onClick={() => setView('main')}
            className="w-full h-12 rounded-xl border-2 border-border text-foreground text-sm font-bold active:scale-95 transition-all duration-150"
          >
            Keep Using It
          </button>
        </div>
      )}

      {/* ISSUE VIEW */}
      {view === 'issue' && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground text-center">What is wrong with Cart {cart.cartNumber}?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleIssue('BROKEN')}
              disabled={loading}
              className="h-20 rounded-xl border-2 border-amber-400 bg-amber-50 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all duration-150 disabled:opacity-60"
            >
              <span className="text-2xl">🔧</span>
              <span className="text-sm font-bold text-amber-800">BROKEN</span>
            </button>
            <button
              onClick={() => handleIssue('LOST')}
              disabled={loading}
              className="h-20 rounded-xl border-2 border-red-400 bg-red-50 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all duration-150 disabled:opacity-60"
            >
              <span className="text-2xl">❌</span>
              <span className="text-sm font-bold text-red-800">LOST</span>
            </button>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Add note (optional)
            </label>
            <input
              type="text"
              value={issueNote}
              onChange={(e) => setIssueNote(e.target.value)}
              placeholder="Wheel broken, handle damaged..."
              className="w-full h-11 px-3 text-sm rounded-xl border border-border bg-input focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button
            onClick={() => setView('main')}
            className="w-full h-11 rounded-xl border border-border text-muted-foreground text-sm font-semibold active:scale-95 transition-all duration-150"
          >
            Cancel
          </button>
        </div>
      )}

      {/* HANDOFF VIEW */}
      {view === 'handoff' && (
        <div className="flex flex-col gap-4">
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">Give Cart {cart.cartNumber} to...</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">
              Vendor Stall Number
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={handoffStall}
              onChange={(e) => setHandoffStall(e.target.value.replace(/\D/g, '').slice(0, 3))}
              placeholder="31"
              min={1}
              max={100}
              className="w-full h-14 text-3xl font-extrabold text-center rounded-xl border-2 border-border bg-input focus:outline-none focus:border-primary transition-colors font-tabular"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">
              Vendor Name (optional)
            </label>
            <input
              type="text"
              value={handoffName}
              onChange={(e) => setHandoffName(e.target.value)}
              placeholder="Lakshmi"
              className="w-full h-11 px-3 text-sm rounded-xl border border-border bg-input focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          {handoffStall && Number(handoffStall) >= 1 && Number(handoffStall) <= 100 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
              <p className="text-sm font-semibold text-blue-800">
                Stall {handoffStall}{handoffName ? ` · ${handoffName}` : ''}
              </p>
            </div>
          )}
          <button
            onClick={handleHandoff}
            disabled={loading || !handoffStall || Number(handoffStall) < 1 || Number(handoffStall) > 100}
            className="w-full h-14 rounded-xl bg-primary text-white text-base font-bold flex items-center justify-center gap-2 active:scale-95 transition-all duration-150 disabled:opacity-40"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
              <>
                <ArrowRightLeft size={18} />
                Transfer Cart
              </>
            )}
          </button>
          <button
            onClick={() => setView('main')}
            className="w-full h-11 rounded-xl border border-border text-muted-foreground text-sm font-semibold active:scale-95 transition-all duration-150"
          >
            Cancel
          </button>
        </div>
      )}
    </BottomSheet>
  );
}

// ── Cart Card ────────────────────────────────────────────────────────────────

function CartCard({ cart, onTap }: { cart: Cart; onTap: (c: Cart) => void }) {
  const vendor = usePhoolFlowStore((s) => s.vendor);
  const isMine = cart.currentHolderVendorId === vendor?.id;
  const displayStatus = isMine ? 'MINE' : cart.status;
  const overdue = cart.status === 'OVERDUE' ? getOverdueMinutes(cart.expectedReleaseAt) : 0;

  return (
    <button
      onClick={() => onTap(cart)}
      className={[
        'flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 text-left active:scale-95 transition-all duration-150 tap-target',
        displayStatus === 'FREE' ? 'bg-card border-border hover:border-green-400' :
        displayStatus === 'MINE' ? 'bg-blue-50 border-primary' :
        displayStatus === 'OVERDUE' ? 'bg-red-50 border-red-400' :
        displayStatus === 'BROKEN' ? 'bg-red-50 border-red-300' :
        displayStatus === 'LOST'? 'bg-purple-50 border-purple-300' : 'bg-amber-50 border-amber-300',
      ].join(' ')}
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-2xl font-extrabold text-foreground font-tabular leading-none">
          {cart.cartNumber}
        </span>
        <CartStatusBadge status={displayStatus} size="sm" />
      </div>
      {cart.currentHolderStall && (
        <p className="text-[11px] text-muted-foreground font-medium leading-tight">
          Stall {cart.currentHolderStall} · {cart.currentHolderName}
        </p>
      )}
      {overdue > 0 && (
        <p className="text-[11px] font-bold text-red-600">+{overdue}m overdue</p>
      )}
      {(cart.status === 'BROKEN' || cart.status === 'LOST') && (
        <p className="text-[11px] text-red-600 font-semibold">
          {cart.status === 'BROKEN' ? '🔧 Broken' : '❌ Lost'}
        </p>
      )}
    </button>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

function HandcartsContent() {
  const carts = usePhoolFlowStore((s) => s.carts);
  const vendor = usePhoolFlowStore((s) => s.vendor);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null);
  const [search, setSearch] = useState('');

  const filterButtons: Array<{ key: FilterType; label: string }> = [
    { key: 'ALL', label: 'All' },
    { key: 'FREE', label: 'Free' },
    { key: 'MINE', label: 'Mine' },
    { key: 'ISSUES', label: 'Issues' },
  ];

  const filtered = carts.filter((c) => {
    const isMine = c.currentHolderVendorId === vendor?.id;
    const matchesSearch = search === '' || c.cartNumber.includes(search.padStart(2, '0')) || (c.currentHolderName?.toLowerCase().includes(search.toLowerCase()));
    if (!matchesSearch) return false;
    if (filter === 'FREE') return c.status === 'FREE';
    if (filter === 'MINE') return isMine;
    if (filter === 'ISSUES') return c.status === 'BROKEN' || c.status === 'LOST';
    return true;
  });

  const freeCarts = carts.filter((c) => c.status === 'FREE').length;
  const overdueCarts = carts.filter((c) => c.status === 'OVERDUE').length;
  const issueCarts = carts.filter((c) => c.status === 'BROKEN' || c.status === 'LOST').length;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background border-b border-border px-4">
        <div className="max-w-lg mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <Flower size={18} className="text-primary" />
            <h1 className="text-base font-extrabold text-foreground">Handcarts</h1>
          </div>
          <LiveBadge />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Summary row */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <div className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-50 border border-green-200">
            <CheckCircle2 size={14} className="text-green-600" />
            <span className="text-sm font-bold text-green-700 font-tabular">{freeCarts} Free</span>
          </div>
          {overdueCarts > 0 && (
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 border border-red-300">
              <AlertTriangle size={14} className="text-red-600" />
              <span className="text-sm font-bold text-red-700 font-tabular">{overdueCarts} Overdue</span>
            </div>
          )}
          {issueCarts > 0 && (
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 border border-red-300">
              <Wrench size={14} className="text-red-600" />
              <span className="text-sm font-bold text-red-700 font-tabular">{issueCarts} Issues</span>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by cart # or vendor name"
            className="w-full h-11 pl-9 pr-4 text-sm rounded-xl border border-border bg-card focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2">
          {filterButtons.map((btn) => (
            <button
              key={`filter-${btn.key}`}
              onClick={() => setFilter(btn.key)}
              className={[
                'flex-1 h-9 rounded-xl text-sm font-bold transition-all duration-150 active:scale-95',
                filter === btn.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:border-primary hover:text-primary',
              ].join(' ')}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Cart grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <Flower size={28} className="text-muted-foreground" />
            </div>
            <p className="text-base font-bold text-foreground">No carts found</p>
            <p className="text-sm text-muted-foreground text-center">
              {filter === 'MINE'
                ? "You don't currently hold a cart."
                : filter === 'FREE' ?'All carts are currently in use.' :'No carts match your search.'}
            </p>
            {filter === 'MINE' && (
              <button
                onClick={() => setFilter('FREE')}
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold active:scale-95 transition-all duration-150"
              >
                Show Free Carts
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filtered.map((cart) => (
              <CartCard key={cart.id} cart={cart} onTap={setSelectedCart} />
            ))}
          </div>
        )}
      </main>

      <CartDetailSheet cart={selectedCart} onClose={() => setSelectedCart(null)} />
      <BottomNav />
      <ToastProvider />
    </div>
  );
}

export default function HandcartsScreen() {
  return (
    <VendorSetupGate>
      <HandcartsContent />
    </VendorSetupGate>
  );
}