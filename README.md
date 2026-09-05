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
npm run type-check
npm run lint
npm run build
```

## Deploy to Netlify

Connect the GitHub repository to Netlify:

```text
https://github.com/fasihafatima06/flower-market
```

Recommended settings:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Publish directory | Leave blank; let Netlify detect Next.js |
| Node version | `20` or newer |

Netlify runs the build and serves the generated web app. Visitors only open the deployed URL; they do not need Node.js, `npm install`, or `npm run dev`.

## Data Model and Scope

The demo stores the vendor profile, cart state, bay reservations, and activity feed in the browser using Zustand persistence. Reloading the same browser keeps active work available during spotty connectivity.

This is intentionally a frontend-only prototype. Browser storage is not shared between devices, so two phones will not see each other's updates. A production rollout would keep this interface and replace the local store with a small realtime database plus server-side conflict checks.

No API keys or environment variables are required for the demo. Do not commit real secrets from a local `.env` file.

## Repository

The source code, deployment configuration, and product note are available in this repository:

[github.com/fasihafatima06/flower-market](https://github.com/fasihafatima06/flower-market)
