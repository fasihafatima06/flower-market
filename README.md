# FlowerMarket

FlowerMarket is a lightweight live dispatch board for a busy flower market. Vendors identify themselves with a stall number and name, then claim handcarts, reserve unloading bays, report equipment issues, and hand carts directly to another stall.

## Features

- Quick-claim any cart from `01` to `20`.
- Track free, held, overdue, broken, and lost carts on the live board.
- Reserve one of four unloading bays in 15-minute slots.
- Release or hand off a cart without administrator involvement.
- Report broken wheels or lost carts with an immediate local status update.
- Persist vendor identity, cart claims, reservations, and activity in browser storage.
- Responsive touch targets for narrow mobile screens.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:4028`.

After deployment, Netlify runs the build for you. Visitors open the deployed URL directly; they do not need to run `npm run dev`.

Useful checks:

```bash
npm run type-check
npm run build
```

## Deploy to Netlify

Import the repository into Netlify. Use:

- Build command: `npm run build`
- Publish directory: leave blank or let Netlify auto-detect Next.js
- Node version: 20 or newer

Netlify's Next.js runtime handles the App Router deployment. No database, API key, or password service is required for the demo.

## Data and trust model

The demo uses Zustand with local storage, so reloads do not erase active work on the same device. Local storage is intentionally simple and is not a multi-device source of truth. In a real market rollout, a small hosted database and server-side conflict checks should replace it.

See [TRADEOFFS.md](TRADEOFFS.md) for the product decisions behind this approach.
