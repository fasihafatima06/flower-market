'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartStatus = 'FREE' | 'IN_USE' | 'MINE' | 'OVERDUE' | 'BROKEN' | 'LOST';
export type BayStatus = 'FREE' | 'BOOKED' | 'MINE' | 'ACTIVE' | 'OVERDUE';

export interface Vendor {
  id: string;
  stallNumber: string;
  name: string;
}

export interface Cart {
  id: string; // "cart-01" to "cart-20"
  cartNumber: string; // "01" to "20"
  status: CartStatus;
  currentHolderVendorId: string | null;
  currentHolderName: string | null;
  currentHolderStall: string | null;
  claimedAt: string | null;
  expectedReleaseAt: string | null;
  issueType: 'BROKEN' | 'LOST' | null;
  issueNote: string | null;
  updatedAt: string;
}

export interface BayReservation {
  id: string;
  bayId: string; // "bay-1" to "bay-4"
  bayName: string;
  vendorId: string;
  vendorStall: string;
  vendorName: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  status: BayStatus;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  vendorId: string | null;
  cartId: string | null;
  bayId: string | null;
}

export interface PhoolFlowState {
  vendor: Vendor | null;
  carts: Cart[];
  reservations: BayReservation[];
  activity: ActivityItem[];
  isOnline: boolean;
  lastUpdated: string;

  setVendor: (v: Vendor) => void;
  clearVendor: () => void;
  claimCart: (cartNumber: string) => { success: boolean; message: string };
  releaseCart: (cartId: string) => { success: boolean; message: string };
  handoffCart: (cartId: string, toStall: string, toName: string, toVendorId: string) => { success: boolean; message: string };
  reportIssue: (cartId: string, type: 'BROKEN' | 'LOST', note?: string) => void;
  resolveIssue: (cartId: string) => void;
  bookBay: (bayId: string, startTime: string, endTime: string) => { success: boolean; message: string };
  cancelReservation: (reservationId: string) => { success: boolean; message: string };
  setOnline: (v: boolean) => void;
  resetDemo: () => void;
  populateDemoData: () => void;
  addActivity: (item: Omit<ActivityItem, 'id'>) => void;
}

// ── helpers ──────────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, '0');

function buildInitialCarts(): Cart[] {
  const now = new Date('2026-09-05T05:02:00');
  const vendors = [
    { id: 'vendor-ramesh', stall: '12', name: 'Ramesh' },
    { id: 'vendor-suresh', stall: '18', name: 'Suresh' },
    { id: 'vendor-lakshmi', stall: '31', name: 'Lakshmi' },
    { id: 'vendor-anitha', stall: '42', name: 'Anitha' },
  ];

  type CartSeed = {
    num: string;
    status: CartStatus;
    holderId?: string;
    holderName?: string;
    holderStall?: string;
    minsAgo?: number;
    expectedMins?: number;
    issueType?: 'BROKEN' | 'LOST';
  };

  const seeds: CartSeed[] = [
    { num: '01', status: 'FREE' },
    { num: '02', status: 'IN_USE', holderId: vendors[0].id, holderName: vendors[0].name, holderStall: vendors[0].stall, minsAgo: 8, expectedMins: 15 },
    { num: '03', status: 'FREE' },
    { num: '04', status: 'FREE' },
    { num: '05', status: 'BROKEN', issueType: 'BROKEN' },
    { num: '06', status: 'IN_USE', holderId: vendors[1].id, holderName: vendors[1].name, holderStall: vendors[1].stall, minsAgo: 5, expectedMins: 20 },
    { num: '07', status: 'FREE' },
    { num: '08', status: 'OVERDUE', holderId: vendors[2].id, holderName: vendors[2].name, holderStall: vendors[2].stall, minsAgo: 32, expectedMins: 20 },
    { num: '09', status: 'FREE' },
    { num: '10', status: 'IN_USE', holderId: vendors[3].id, holderName: vendors[3].name, holderStall: vendors[3].stall, minsAgo: 3, expectedMins: 15 },
    { num: '11', status: 'FREE' },
    { num: '12', status: 'FREE' },
    { num: '13', status: 'LOST', issueType: 'LOST' },
    { num: '14', status: 'IN_USE', holderId: vendors[0].id, holderName: vendors[0].name, holderStall: vendors[0].stall, minsAgo: 10, expectedMins: 15 },
    { num: '15', status: 'FREE' },
    { num: '16', status: 'IN_USE', holderId: vendors[1].id, holderName: vendors[1].name, holderStall: vendors[1].stall, minsAgo: 6, expectedMins: 20 },
    { num: '17', status: 'FREE' },
    { num: '18', status: 'FREE' },
    { num: '19', status: 'IN_USE', holderId: vendors[2].id, holderName: vendors[2].name, holderStall: vendors[2].stall, minsAgo: 2, expectedMins: 15 },
    { num: '20', status: 'FREE' },
  ];

  return seeds.map((s) => {
    const claimedAt = s.minsAgo
      ? new Date(now.getTime() - s.minsAgo * 60000).toISOString()
      : null;
    const expectedReleaseAt = s.expectedMins && claimedAt
      ? new Date(new Date(claimedAt).getTime() + s.expectedMins * 60000).toISOString()
      : null;
    return {
      id: `cart-${s.num}`,
      cartNumber: s.num,
      status: s.status,
      currentHolderVendorId: s.holderId ?? null,
      currentHolderName: s.holderName ?? null,
      currentHolderStall: s.holderStall ?? null,
      claimedAt,
      expectedReleaseAt,
      issueType: s.issueType ?? null,
      issueNote: null,
      updatedAt: now.toISOString(),
    };
  });
}

function buildInitialReservations(): BayReservation[] {
  const base = new Date('2026-09-05T05:00:00');
  const slot = (h: number, m: number) =>
    new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, m).toISOString();

  return [
    {
      id: 'res-001',
      bayId: 'bay-1',
      bayName: 'Bay 1',
      vendorId: 'vendor-ramesh',
      vendorStall: '12',
      vendorName: 'Ramesh',
      startTime: slot(5, 0),
      endTime: slot(5, 15),
      status: 'ACTIVE',
    },
    {
      id: 'res-002',
      bayId: 'bay-3',
      bayName: 'Bay 3',
      vendorId: 'vendor-suresh',
      vendorStall: '18',
      vendorName: 'Suresh',
      startTime: slot(5, 0),
      endTime: slot(5, 15),
      status: 'ACTIVE',
    },
    {
      id: 'res-003',
      bayId: 'bay-1',
      bayName: 'Bay 1',
      vendorId: 'vendor-lakshmi',
      vendorStall: '31',
      vendorName: 'Lakshmi',
      startTime: slot(5, 15),
      endTime: slot(5, 30),
      status: 'BOOKED',
    },
    {
      id: 'res-004',
      bayId: 'bay-3',
      bayName: 'Bay 3',
      vendorId: 'vendor-anitha',
      vendorStall: '42',
      vendorName: 'Anitha',
      startTime: slot(5, 30),
      endTime: slot(5, 45),
      status: 'BOOKED',
    },
    {
      id: 'res-005',
      bayId: 'bay-2',
      bayName: 'Bay 2',
      vendorId: 'vendor-ramesh',
      vendorStall: '12',
      vendorName: 'Ramesh',
      startTime: slot(5, 15),
      endTime: slot(5, 30),
      status: 'BOOKED',
    },
  ];
}

function buildInitialActivity(): ActivityItem[] {
  const base = new Date('2026-09-05T05:02:00');
  const t = (minsAgo: number) =>
    new Date(base.getTime() - minsAgo * 60000).toISOString();

  return [
    { id: 'act-001', timestamp: t(0), type: 'CLAIM', message: 'Stall 12 claimed Cart 14', vendorId: 'vendor-ramesh', cartId: 'cart-14', bayId: null },
    { id: 'act-002', timestamp: t(1), type: 'BOOK', message: 'Bay 2 booked by Stall 31', vendorId: 'vendor-lakshmi', cartId: null, bayId: 'bay-2' },
    { id: 'act-003', timestamp: t(2), type: 'ISSUE', message: 'Cart 05 marked BROKEN', vendorId: null, cartId: 'cart-05', bayId: null },
    { id: 'act-004', timestamp: t(3), type: 'CLAIM', message: 'Stall 18 claimed Cart 16', vendorId: 'vendor-suresh', cartId: 'cart-16', bayId: null },
    { id: 'act-005', timestamp: t(4), type: 'RELEASE', message: 'Stall 42 released Cart 03', vendorId: 'vendor-anitha', cartId: 'cart-03', bayId: null },
    { id: 'act-006', timestamp: t(5), type: 'ISSUE', message: 'Cart 13 reported LOST', vendorId: null, cartId: 'cart-13', bayId: null },
    { id: 'act-007', timestamp: t(6), type: 'BOOK', message: 'Bay 1 booked by Stall 12', vendorId: 'vendor-ramesh', cartId: null, bayId: 'bay-1' },
    { id: 'act-008', timestamp: t(8), type: 'CLAIM', message: 'Stall 31 claimed Cart 19', vendorId: 'vendor-lakshmi', cartId: 'cart-19', bayId: null },
  ];
}

// ── store ─────────────────────────────────────────────────────────────────────

export const usePhoolFlowStore = create<PhoolFlowState>()(
  persist(
    (set, get) => ({
      vendor: null,
      carts: buildInitialCarts(),
      reservations: buildInitialReservations(),
      activity: buildInitialActivity(),
      isOnline: true,
      lastUpdated: new Date('2026-09-05T05:02:00').toISOString(),

      setVendor: (v) => set({ vendor: v }),
      clearVendor: () => set({ vendor: null }),

      addActivity: (item) => {
        set((s) => ({
          activity: [
            { ...item, id: `act-${Date.now()}` },
            ...s.activity.slice(0, 49),
          ],
          lastUpdated: new Date().toISOString(),
        }));
      },

      claimCart: (cartNumber) => {
        const s = get();
        if (!s.vendor) return { success: false, message: 'Set up your vendor profile first.' };
        const cart = s.carts.find((c) => c.cartNumber === cartNumber);
        if (!cart) return { success: false, message: `Cart ${cartNumber} does not exist.` };
        if (cart.status === 'BROKEN') return { success: false, message: `Cart ${cartNumber} is unavailable — marked BROKEN.` };
        if (cart.status === 'LOST') return { success: false, message: `Cart ${cartNumber} is currently marked LOST.` };
        if (cart.status !== 'FREE') {
          if (cart.currentHolderVendorId === s.vendor.id) return { success: false, message: `Cart ${cartNumber} is already yours.` };
          return { success: false, message: `Cart ${cartNumber} was just claimed by Stall ${cart.currentHolderStall}.` };
        }
        // One-cart rule: vendor can only hold one cart at a time
        const alreadyHolding = s.carts.find((c) => c.currentHolderVendorId === s.vendor!.id);
        if (alreadyHolding) return { success: false, message: `You already hold Cart ${alreadyHolding.cartNumber}. Release it first.` };
        const now = new Date().toISOString();
        const expected = new Date(Date.now() + 20 * 60000).toISOString();
        set((st) => ({
          carts: st.carts.map((c) =>
            c.id === cart.id
              ? { ...c, status: 'MINE', currentHolderVendorId: s.vendor!.id, currentHolderName: s.vendor!.name, currentHolderStall: s.vendor!.stallNumber, claimedAt: now, expectedReleaseAt: expected, updatedAt: now }
              : c
          ),
        }));
        get().addActivity({ timestamp: now, type: 'CLAIM', message: `Stall ${s.vendor.stallNumber} claimed Cart ${cartNumber}`, vendorId: s.vendor.id, cartId: cart.id, bayId: null });
        return { success: true, message: `Cart ${cartNumber} claimed. You have it now.` };
      },

      releaseCart: (cartId) => {
        const s = get();
        if (!s.vendor) return { success: false, message: 'No vendor profile.' };
        const cart = s.carts.find((c) => c.id === cartId);
        if (!cart) return { success: false, message: 'Cart not found.' };
        if (cart.currentHolderVendorId !== s.vendor.id) return { success: false, message: 'You can only release a cart you currently hold.' };
        const now = new Date().toISOString();
        set((st) => ({
          carts: st.carts.map((c) =>
            c.id === cartId
              ? { ...c, status: 'FREE', currentHolderVendorId: null, currentHolderName: null, currentHolderStall: null, claimedAt: null, expectedReleaseAt: null, updatedAt: now }
              : c
          ),
        }));
        get().addActivity({ timestamp: now, type: 'RELEASE', message: `Stall ${s.vendor.stallNumber} released Cart ${cart.cartNumber}`, vendorId: s.vendor.id, cartId, bayId: null });
        return { success: true, message: `Cart ${cart.cartNumber} is now available.` };
      },

      handoffCart: (cartId, toStall, toName, toVendorId) => {
        const s = get();
        if (!s.vendor) return { success: false, message: 'No vendor profile.' };
        const cart = s.carts.find((c) => c.id === cartId);
        if (!cart) return { success: false, message: 'Cart not found.' };
        if (cart.currentHolderVendorId !== s.vendor.id) return { success: false, message: 'You can only hand off a cart you currently hold.' };
        if (cart.status === 'BROKEN' || cart.status === 'LOST') return { success: false, message: 'Cannot transfer a cart with an active issue.' };
        if (toVendorId === s.vendor.id) return { success: false, message: 'You cannot hand off a cart to yourself.' };
        const now = new Date().toISOString();
        const expected = new Date(Date.now() + 20 * 60000).toISOString();
        set((st) => ({
          carts: st.carts.map((c) =>
            c.id === cartId
              ? { ...c, status: 'IN_USE', currentHolderVendorId: toVendorId, currentHolderName: toName, currentHolderStall: toStall, claimedAt: now, expectedReleaseAt: expected, updatedAt: now }
              : c
          ),
        }));
        get().addActivity({ timestamp: now, type: 'HANDOFF', message: `Cart ${cart.cartNumber} transferred to Stall ${toStall} by Stall ${s.vendor.stallNumber}`, vendorId: s.vendor.id, cartId, bayId: null });
        return { success: true, message: `Cart ${cart.cartNumber} transferred to Stall ${toStall}.` };
      },

      reportIssue: (cartId, type, note) => {
        const current = get();
        const cart = current.carts.find((c) => c.id === cartId);
        if (!cart) return;
        if (cart.currentHolderVendorId && cart.currentHolderVendorId !== current.vendor?.id) return;
        const now = new Date().toISOString();
        set((s) => ({
          carts: s.carts.map((c) =>
            c.id === cartId
              ? { ...c, status: type === 'BROKEN' ? 'BROKEN' : 'LOST', currentHolderVendorId: null, currentHolderName: null, currentHolderStall: null, issueType: type, issueNote: note ?? null, updatedAt: now }
              : c
          ),
        }));
        get().addActivity({ timestamp: now, type: 'ISSUE', message: `Cart ${cart?.cartNumber} marked ${type}`, vendorId: get().vendor?.id ?? null, cartId, bayId: null });
      },

      resolveIssue: (cartId) => {
        const now = new Date().toISOString();
        set((s) => ({
          carts: s.carts.map((c) =>
            c.id === cartId
              ? { ...c, status: 'FREE', issueType: null, issueNote: null, updatedAt: now }
              : c
          ),
        }));
        const cart = get().carts.find((c) => c.id === cartId);
        get().addActivity({ timestamp: now, type: 'RESOLVE', message: `Cart ${cart?.cartNumber} marked available again`, vendorId: get().vendor?.id ?? null, cartId, bayId: null });
      },

      bookBay: (bayId, startTime, endTime) => {
        const s = get();
        if (!s.vendor) return { success: false, message: 'No vendor profile.' };
        const requestedStart = new Date(startTime).getTime();
        const requestedEnd = new Date(endTime).getTime();
        const conflict = s.reservations.find((r) => {
          const existingStart = new Date(r.startTime).getTime();
          const existingEnd = new Date(r.endTime).getTime();
          return r.bayId === bayId && r.status !== 'FREE' && requestedStart < existingEnd && requestedEnd > existingStart;
        });
        if (conflict) return { success: false, message: 'That slot was just taken. Choose another.' };
        const vendorConflict = s.reservations.find(
          (r) => r.vendorId === s.vendor!.id && r.startTime === startTime
        );
        if (vendorConflict) return { success: false, message: 'You already have a booking at that time.' };
        // One-bay rule: vendor can only hold one active/upcoming bay reservation at a time
        const activeReservation = s.reservations.find(
          (r) => r.vendorId === s.vendor!.id && (r.status === 'MINE' || r.status === 'ACTIVE' || r.status === 'BOOKED')
        );
        if (activeReservation) return { success: false, message: `You already have ${activeReservation.bayName} booked. Cancel it first.` };
        const now = new Date().toISOString();
        const newRes: BayReservation = {
          id: `res-${Date.now()}`,
          bayId,
          bayName: `Bay ${bayId.split('-')[1]}`,
          vendorId: s.vendor.id,
          vendorStall: s.vendor.stallNumber,
          vendorName: s.vendor.name,
          startTime,
          endTime,
          status: 'MINE',
        };
        set((st) => ({ reservations: [...st.reservations, newRes] }));
        get().addActivity({ timestamp: now, type: 'BOOK', message: `Bay ${bayId.split('-')[1]} booked by Stall ${s.vendor.stallNumber}`, vendorId: s.vendor.id, cartId: null, bayId });
        return { success: true, message: `Bay ${bayId.split('-')[1]} booked for ${formatSlotTime(startTime)}–${formatSlotTime(endTime)}.` };
      },

      cancelReservation: (reservationId) => {
        const s = get();
        const res = s.reservations.find((r) => r.id === reservationId);
        if (!res) return { success: false, message: 'Reservation not found.' };
        if (res.vendorId !== s.vendor?.id) return { success: false, message: 'You can only cancel your own reservation.' };
        const now = new Date().toISOString();
        set((st) => ({ reservations: st.reservations.filter((r) => r.id !== reservationId) }));
        get().addActivity({ timestamp: now, type: 'CANCEL', message: `Stall ${s.vendor.stallNumber} cancelled Bay ${res.bayName} booking`, vendorId: s.vendor.id, cartId: null, bayId: res.bayId });
        return { success: true, message: `Booking for ${res.bayName} cancelled.` };
      },

      setOnline: (v) => set({ isOnline: v }),

      resetDemo: () => {
        set({
          vendor: null,
          carts: buildInitialCarts(),
          reservations: buildInitialReservations(),
          activity: buildInitialActivity(),
          lastUpdated: new Date('2026-09-05T05:02:00').toISOString(),
        });
      },

      populateDemoData: () => {
        set({
          carts: buildInitialCarts(),
          reservations: buildInitialReservations(),
          activity: buildInitialActivity(),
          lastUpdated: new Date('2026-09-05T05:02:00').toISOString(),
        });
      },
    }),
    {
      name: 'flower-mandi-state',
      partialize: (s) => ({
        vendor: s.vendor,
        carts: s.carts,
        reservations: s.reservations,
        activity: s.activity,
        lastUpdated: s.lastUpdated,
      }),
    }
  )
);

// ── utility exports ───────────────────────────────────────────────────────────

export function formatSlotTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${pad(m)} ${ampm}`;
}

export function getOverdueMinutes(expectedReleaseAt: string | null): number {
  if (!expectedReleaseAt) return 0;
  const diff = Date.now() - new Date(expectedReleaseAt).getTime();
  return diff > 0 ? Math.floor(diff / 60000) : 0;
}

export function getSlots(count = 6): Array<{ start: string; end: string; label: string }> {
  const now = new Date();
  // Round down to nearest 15-minute boundary for real current time
  const roundedMinutes = Math.floor(now.getMinutes() / 15) * 15;
  const baseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), roundedMinutes, 0, 0);
  const slots = [];
  for (let i = 0; i < count; i++) {
    const startMs = baseDate.getTime() + i * 15 * 60000;
    const endMs = startMs + 15 * 60000;
    const startD = new Date(startMs);
    const endD = new Date(endMs);
    const startH = startD.getHours();
    const startM = startD.getMinutes();
    const endH = endD.getHours();
    const endM = endD.getMinutes();
    const start = startD.toISOString();
    const end = endD.toISOString();
    const ampmS = startH >= 12 ? 'PM' : 'AM';
    const ampmE = endH >= 12 ? 'PM' : 'AM';
    const fmtH = (h: number) => (h % 12 === 0 ? 12 : h % 12);
    const label = `${fmtH(startH)}:${pad(startM)} ${ampmS}–${fmtH(endH)}:${pad(endM)} ${ampmE}`;
    slots.push({ start, end, label });
  }
  return slots;
}

export const BAY_IDS = ['bay-1', 'bay-2', 'bay-3', 'bay-4'];
export const BAY_NAMES = ['Bay 1', 'Bay 2', 'Bay 3', 'Bay 4'];