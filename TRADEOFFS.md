# Product Trade-offs

## Designed for the 5 AM rush

The primary actions are visible from the first screen, cart IDs are two digits, and actions use large touch targets. A vendor can identify a cart or bay with one hand and receive an immediate visual or toast confirmation.

## Local-first state

The app persists the vendor profile, cart ownership, reservations, and activity in local storage. This keeps the tool useful during unreliable connectivity and costs nothing on a free hosting tier. The trade-off is that two different devices do not automatically share state. A production version would add a small realtime database while keeping the same local cache as an offline fallback.

## Lightweight identity

Stall number plus name avoids password friction and is appropriate for a trusted physical market. It is not strong authentication, so the interface treats handoffs and issue reports as visible market actions rather than privileged admin operations. Server-side identity would be needed where disputes have financial consequences.

## Fairness rules

Each vendor can hold one cart and one active bay reservation. A cart cannot be claimed when held, broken, lost, or overdue. A bay booking is rejected when its time window overlaps an existing reservation, preventing double booking caused by different slot selections.

## Recovery over punishment

Overdue carts remain visible instead of being silently reclaimed. Vendors can report a broken or lost cart, and the market team can mark it repaired or found. This favors transparency and quick recovery over hidden automatic enforcement during a busy unloading window.