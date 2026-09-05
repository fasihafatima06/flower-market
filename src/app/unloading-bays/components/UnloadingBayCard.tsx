'use client';

import React, { useState } from 'react';
import {
  usePhoolFlowStore,
  BayReservation,
  getSlots,
  formatSlotTime,
  BAY_IDS,
  BAY_NAMES,
} from '@/lib/store';
import BottomNav from '@/components/BottomNav';
import LiveBadge from '@/components/LiveBadge';
import BottomSheet from '@/components/BottomSheet';
import VendorSetupGate from '@/components/VendorSetupGate';
import ToastProvider from '@/components/ToastProvider';
import { toast } from 'sonner';
import {
  Warehouse,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';

// ── Bay cell status ──────────────────────────────────────────────────────────

type CellState = 'FREE' | 'BOOKED' | 'MINE' | 'ACTIVE' | 'OVERDUE';

function getCellState(
  bayId: string,
  slotStart: string,
  reservations: BayReservation[],
  vendorId: string | null
): { state: CellState; res: BayReservation | null } {
  const res = reservations.find((r) => r.bayId === bayId && r.startTime === slotStart);
  if (!res) return { state: 'FREE', res: null };
  if (res.vendorId === vendorId) {
    if (res.status === 'ACTIVE') return { state: 'ACTIVE', res };
    if (res.status === 'OVERDUE') return { state: 'OVERDUE', res };
    return { state: 'MINE', res };
  }
  if (res.status === 'ACTIVE') return { state: 'ACTIVE', res };
  if (res.status === 'OVERDUE') return { state: 'OVERDUE', res };
  return { state: 'BOOKED', res };
}

const cellConfig: Record<CellState, { bg: string; border: string; text: string; label: string }> = {
  FREE: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', label: 'FREE' },
  BOOKED: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-800', label: 'BOOKED' },
  MINE: { bg: 'bg-blue-50', border: 'border-primary', text: 'text-primary', label: 'YOURS' },
  ACTIVE: { bg: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-800', label: 'ACTIVE' },
  OVERDUE: { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-700', label: 'OVERDUE' },
};

// ── Bay Cell ─────────────────────────────────────────────────────────────────

function BayCell({
  bayId,
  bayName,
  slotStart,
  slotEnd,
  onTap,
}: {
  bayId: string;
  bayName: string;
  slotStart: string;
  slotEnd: string;
  onTap: (bayId: string, slotStart: string, slotEnd: string, state: CellState, res: BayReservation | null) => void;
}) {
  const reservations = usePhoolFlowStore((s) => s.reservations);
  const vendor = usePhoolFlowStore((s) => s.vendor);
  const { state, res } = getCellState(bayId, slotStart, reservations, vendor?.id ?? null);
  const cfg = cellConfig[state];

  return (
    <button
      onClick={() => onTap(bayId, slotStart, slotEnd, state, res)}
      className={[
        'flex flex-col items-center justify-center gap-0.5 py-3 px-1 rounded-xl border-2 tap-target w-full active:scale-95 transition-all duration-150',
        cfg.bg,
        cfg.border,
        state === 'OVERDUE' ? 'bg-red-50 border-red-400' : '',
      ].join(' ')}
    >
      <span className={['text-[10px] font-extrabold tracking-wider', cfg.text].join(' ')}>
        {cfg.label}
      </span>
      {res && (
        <span className="text-[9px] text-muted-foreground font-medium">
          {state === 'MINE' || state === 'ACTIVE' || state === 'OVERDUE'
            ? `Stall ${res.vendorStall}`
            : `Stall ${res.vendorStall}`}
        </span>
      )}
    </button>
  );
}

// ── Book Bay Sheet ────────────────────────────────────────────────────────────

function BayActionSheet({
  open,
  bayId,
  bayName,
  slotStart,
  slotEnd,
  cellState,
  reservation,
  onClose,
}: {
  open: boolean;
  bayId: string;
  bayName: string;
  slotStart: string;
  slotEnd: string;
  cellState: CellState;
  reservation: BayReservation | null;
  onClose: () => void;
}) {
  const bookBay = usePhoolFlowStore((s) => s.bookBay);
  const cancelReservation = usePhoolFlowStore((s) => s.cancelReservation);
  const vendor = usePhoolFlowStore((s) => s.vendor);
  const [loading, setLoading] = useState(false);

  const slotLabel = `${formatSlotTime(slotStart)}–${formatSlotTime(slotEnd)}`;

  const handleBook = () => {
    setLoading(true);
    setTimeout(() => {
      const result = bookBay(bayId, slotStart, slotEnd);
      if (result.success) {
        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.message);
      }
      setLoading(false);
    }, 200);
  };

  const handleCancel = () => {
    if (!reservation) return;
    setLoading(true);
    setTimeout(() => {
      const result = cancelReservation(reservation.id);
      if (result.success) {
        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.message);
      }
      setLoading(false);
    }, 200);
  };

  const title =
    cellState === 'FREE'
      ? `Book ${bayName}`
      : cellState === 'MINE'
      ? `Your Booking · ${bayName}`
      : cellState === 'OVERDUE'
      ? `Overdue · ${bayName}`
      : `${bayName} · ${cellState}`;

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        {/* Slot info */}
        <div className="flex items-center justify-between p-4 bg-secondary rounded-xl">
          <div>
            <p className="text-xl font-extrabold text-foreground">{bayName}</p>
            <p className="text-sm text-muted-foreground font-medium">{slotLabel}</p>
          </div>
          <span className={[
            'text-xs font-bold px-2.5 py-1 rounded-full',
            cellConfig[cellState].bg,
            cellConfig[cellState].text,
            'border',
            cellConfig[cellState].border,
          ].join(' ')}>
            {cellConfig[cellState].label}
          </span>
        </div>

        {/* FREE — book it */}
        {cellState === 'FREE' && (
          <>
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-center">
              <p className="text-sm font-semibold text-green-800">Available · {slotLabel}</p>
            </div>
            <button
              onClick={handleBook}
              disabled={loading}
              className="w-full h-14 rounded-xl bg-primary text-white text-base font-bold flex items-center justify-center gap-2 active:scale-95 transition-all duration-150 disabled:opacity-60"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Calendar size={18} />
                  Confirm Booking
                </>
              )}
            </button>
          </>
        )}

        {/* MINE — view or cancel */}
        {cellState === 'MINE' && reservation && (
          <>
            <div className="p-3 bg-blue-50 border border-primary rounded-xl text-center">
              <p className="text-sm font-semibold text-primary">
                Your booking · Stall {vendor?.stallNumber}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{slotLabel}</p>
            </div>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="w-full h-12 rounded-xl border-2 border-red-400 text-red-600 text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all duration-150 disabled:opacity-60"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <XCircle size={16} />
                  Cancel Booking
                </>
              )}
            </button>
          </>
        )}

        {/* BOOKED — someone else */}
        {cellState === 'BOOKED' && reservation && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-center">
            <p className="text-sm font-semibold text-amber-800">
              Booked by Stall {reservation.vendorStall} · {reservation.vendorName}
            </p>
            <p className="text-xs text-amber-700 mt-1">Choose a different slot or bay.</p>
          </div>
        )}

        {/* ACTIVE */}
        {cellState === 'ACTIVE' && reservation && (
          <div className="flex items-start gap-2.5 p-3 bg-emerald-50 border border-emerald-300 rounded-xl">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-emerald-800">Currently Active</p>
              <p className="text-sm text-emerald-700">
                Stall {reservation.vendorStall} · {reservation.vendorName} is unloading now.
              </p>
            </div>
          </div>
        )}

        {/* OVERDUE */}
        {cellState === 'OVERDUE' && reservation && (
          <>
            <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-300 rounded-xl">
              <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700">Overdue</p>
                <p className="text-sm text-red-600">
                  Stall {reservation.vendorStall} · {reservation.vendorName} — booked until{' '}
                  {formatSlotTime(reservation.endTime)}
                </p>
              </div>
            </div>
            {reservation.vendorId === vendor?.id && (
              <button
                onClick={handleCancel}
                disabled={loading}
                className="w-full h-12 rounded-xl border-2 border-red-400 text-red-600 text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all duration-150 disabled:opacity-60"
              >
                <XCircle size={16} />
                Release Bay
              </button>
            )}
            {reservation.vendorId !== vendor?.id && (
              <div className="p-3 bg-muted rounded-xl text-center">
                <p className="text-sm text-muted-foreground">
                  This bay is occupied. You can report it if needed.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </BottomSheet>
  );
}

// ── Quick Book Sheet ──────────────────────────────────────────────────────────

function QuickBookSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reservations = usePhoolFlowStore((s) => s.reservations);
  const bookBay = usePhoolFlowStore((s) => s.bookBay);
  const vendor = usePhoolFlowStore((s) => s.vendor);
  const [loading, setLoading] = useState(false);

  const slots = getSlots(8);

  const available: Array<{
    bayId: string; bayName: string; slotStart: string; slotEnd: string; label: string;
  }> = [];

  for (const slot of slots) {
    for (let i = 0; i < BAY_IDS.length; i++) {
      const existing = reservations.find(
        (r) => r.bayId === BAY_IDS[i] && r.startTime === slot.start
      );
      if (!existing) {
        available.push({
          bayId: BAY_IDS[i],
          bayName: BAY_NAMES[i],
          slotStart: slot.start,
          slotEnd: slot.end,
          label: slot.label,
        });
      }
    }
  }

  const handleBook = (opt: typeof available[0]) => {
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

  const myBookings = reservations.filter((r) => r.vendorId === vendor?.id);

  return (
    <BottomSheet open={open} onClose={onClose} title="Book a Bay">
      <div className="flex flex-col gap-3">
        {myBookings.length > 0 && (
          <div className="p-3 bg-blue-50 border border-primary rounded-xl">
            <p className="text-xs font-bold text-primary mb-1">Your current bookings:</p>
            {myBookings.map((r) => (
              <p key={r.id} className="text-sm text-foreground">
                {r.bayName} · {formatSlotTime(r.startTime)}–{formatSlotTime(r.endTime)}
              </p>
            ))}
          </div>
        )}

        <p className="text-sm text-muted-foreground font-medium">Next available slots:</p>

        {available.length === 0 ? (
          <div className="text-center py-8">
            <Clock size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-base font-semibold text-foreground">All slots filled</p>
            <p className="text-sm text-muted-foreground mt-1">Check back as vendors release bays.</p>
          </div>
        ) : (
          available.slice(0, 8).map((opt) => (
            <button
              key={`qb-${opt.bayId}-${opt.slotStart}`}
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

// ── Main Screen ───────────────────────────────────────────────────────────────

function UnloadingBaysContent() {
  const reservations = usePhoolFlowStore((s) => s.reservations);
  const vendor = usePhoolFlowStore((s) => s.vendor);

  const [quickBookOpen, setQuickBookOpen] = useState(false);
  const [actionSheet, setActionSheet] = useState<{
    open: boolean;
    bayId: string;
    bayName: string;
    slotStart: string;
    slotEnd: string;
    state: CellState;
    res: BayReservation | null;
  } | null>(null);

  const slots = getSlots(6);

  const myBookings = reservations.filter((r) => r.vendorId === vendor?.id);

  const freeSlots = slots.reduce((acc, slot) => {
    const freeBays = BAY_IDS.filter(
      (bid) => !reservations.find((r) => r.bayId === bid && r.startTime === slot.start)
    ).length;
    return acc + freeBays;
  }, 0);

  const handleCellTap = (
    bayId: string,
    slotStart: string,
    slotEnd: string,
    state: CellState,
    res: BayReservation | null
  ) => {
    const bayIndex = BAY_IDS.indexOf(bayId);
    setActionSheet({
      open: true,
      bayId,
      bayName: BAY_NAMES[bayIndex],
      slotStart,
      slotEnd,
      state,
      res,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background border-b border-border px-4">
        <div className="max-w-lg mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <Warehouse size={18} className="text-primary" />
            <h1 className="text-base font-extrabold text-foreground">Unloading Bays</h1>
          </div>
          <LiveBadge />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Summary */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-extrabold text-foreground font-tabular">4 Bays</p>
            <p className="text-xs text-muted-foreground font-medium">15-minute slots · 5:00–6:30 AM</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-extrabold text-green-600 font-tabular">{freeSlots}</p>
            <p className="text-xs text-muted-foreground">free slots</p>
          </div>
        </div>

        {/* My bookings */}
        {myBookings.length > 0 && (
          <div className="bg-blue-50 border border-primary rounded-2xl p-4">
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Your Bookings</p>
            <div className="flex flex-col gap-2">
              {myBookings.map((r) => (
                <div key={r.id} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-foreground">{r.bayName}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatSlotTime(r.startTime)}–{formatSlotTime(r.endTime)}
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-primary">
                    {r.status === 'ACTIVE' ? 'ACTIVE' : 'BOOKED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Book button */}
        <button
          onClick={() => setQuickBookOpen(true)}
          className="w-full h-14 rounded-xl bg-primary text-white text-base font-bold flex items-center justify-center gap-2 active:scale-95 transition-all duration-150 shadow-sm"
        >
          <Calendar size={18} />
          Book a Bay
        </button>

        {/* Timeline grid */}
        <div className="flex flex-col gap-3">
          {slots.map((slot, slotIdx) => {
            const isNow = slotIdx === 0;
            return (
              <div key={`slot-${slot.start}`} className="bg-card rounded-2xl border border-border overflow-hidden">
                {/* Slot header */}
                <div className={[
                  'flex items-center gap-2 px-4 py-2.5 border-b border-border',
                  isNow ? 'bg-amber-50' : 'bg-background',
                ].join(' ')}>
                  {isNow ? (
                    <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider px-1.5 py-0.5 bg-amber-100 rounded-full">
                      NOW
                    </span>
                  ) : (
                    <Clock size={12} className="text-muted-foreground" />
                  )}
                  <span className="text-sm font-bold text-foreground">{slot.label}</span>
                </div>

                {/* Bay cells */}
                <div className="grid grid-cols-4 gap-2 p-3">
                  {BAY_IDS.map((bayId, bayIdx) => (
                    <BayCell
                      key={`cell-${slot.start}-${bayId}`}
                      bayId={bayId}
                      bayName={BAY_NAMES[bayIdx]}
                      slotStart={slot.start}
                      slotEnd={slot.end}
                      onTap={handleCellTap}
                    />
                  ))}
                </div>

                {/* Bay labels */}
                <div className="grid grid-cols-4 gap-2 px-3 pb-2">
                  {BAY_NAMES.map((name) => (
                    <p key={`label-${slot.start}-${name}`} className="text-[10px] text-muted-foreground font-semibold text-center">
                      {name}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Status Legend</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(cellConfig) as Array<[CellState, typeof cellConfig[CellState]]>).map(([state, cfg]) => (
              <div key={`legend-${state}`} className="flex items-center gap-2">
                <span className={['w-3 h-3 rounded-full border', cfg.bg, cfg.border].join(' ')} />
                <span className="text-xs text-muted-foreground font-medium">{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Action sheet */}
      {actionSheet && (
        <BayActionSheet
          open={actionSheet.open}
          bayId={actionSheet.bayId}
          bayName={actionSheet.bayName}
          slotStart={actionSheet.slotStart}
          slotEnd={actionSheet.slotEnd}
          cellState={actionSheet.state}
          reservation={actionSheet.res}
          onClose={() => setActionSheet(null)}
        />
      )}

      <QuickBookSheet open={quickBookOpen} onClose={() => setQuickBookOpen(false)} />
      <BottomNav />
      <ToastProvider />
    </div>
  );
}

export default function UnloadingBaysScreen() {
  return (
    <VendorSetupGate>
      <UnloadingBaysContent />
    </VendorSetupGate>
  );
}