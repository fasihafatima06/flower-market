# FlowerMandi

FlowerMandi is a mobile-first dispatch tool for a busy flower market. It helps vendors coordinate **20 shared handcarts** and **4 unloading bays** during the morning rush, when a few seconds and a clear status matter.

## What It Solves

Vendors can identify themselves with a stall number and name, see the current market board, claim a specific cart, reserve a bay, and recover from common problems without waiting for an administrator.

### Core workflows

- **Claim a cart:** enter a two-digit cart ID from `01` to `20`.
- **Manage your cart:** release it, hand it directly to another stall, or report it broken/lost.
- **Book a bay:** choose a 15-minute slot across four shared unloading bays.
- **See the rush at a glance:** the board shows free carts, carts in use, overdue carts, issues, and bay occupancy.
- **Recover exceptions:** overdue, broken, and lost equipment remains visible instead of disappearing from the board.

## Product Decisions

- Large touch targets and short actions support one-thumb use on screens below 380px wide.
- Stall numbers are limited to `1-20`; carts use fixed IDs `01-20` to reduce input mistakes.
- A vendor can hold one cart and one active/upcoming bay booking at a time.
- Overlapping reservations are rejected, including overlaps created by different slot choices.
- No password is required for the demo. The market context provides a lightweight trust model, while every handoff and issue is visible in activity history.

See [TRADEOFFS.md](TRADEOFFS.md) for the one-page rationale behind these choices.

## Tech Stack

- Next.js 15 App Router
- React 19 and TypeScript
- Tailwind CSS
- Zustand with local-storage persistence
- Lucide icons and Sonner notifications

## Run Locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:4028](http://localhost:4028).

Available checks:

```bash
# FlowerMandi

**Deployed app:** add the live app link here after deployment.

FlowerMandi is a simple mobile app for flower vendors who share handcarts and unloading bays during the morning rush.

## Features

- Claim one of 20 handcarts by entering its two-digit number.
- See who is using each cart right now.
- Release a cart or hand it directly to another stall.
- Report a broken or lost cart with one tap.
- Book one of 4 unloading bays in 15-minute slots.
- See free, booked, active, and overdue bays.
- Use the app with a stall number and name. No password is needed.
- Keep the current work after refreshing the page on the same phone.
- Use large buttons designed for small mobile screens.

## Main Screens

- **Board:** a quick view of carts, bays, issues, and recent activity.
- **Carts:** search and manage all 20 carts.
- **Bays:** view the time slots for all 4 unloading bays.
- **My stall:** see the signed-in vendor's cart and bay booking.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:4028`.

## Checks Used

```bash
npm run type-check
npm run lint
npm run build
```

## Data Note

This version saves data in the browser. Refreshing the same phone keeps the work, but different phones do not share updates yet. This keeps the demo fast and free; a future version can add a shared database.

## Project

Source code: [github.com/fasihafatima06/flower-market](https://github.com/fasihafatima06/flower-market)

Product decisions: [TRADEOFFS.md](TRADEOFFS.md)
