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
