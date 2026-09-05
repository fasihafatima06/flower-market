# Product Trade-offs

This note explains the choices made for vendors who may be using an older phone, working quickly, or dealing with weak internet.

## 1. Fast actions over extra screens

The first screen shows the important information: free carts, carts in use, bay availability, and recent activity. Buttons are large enough to tap with one thumb. Cart numbers are two digits so a vendor can type `04` quickly and avoid choosing the wrong cart.

## 2. Simple identity instead of passwords

Vendors enter a stall number and name. This removes password problems during a busy morning. Stall numbers are limited to `1-100`, which prevents typing mistakes while allowing a larger market. This is suitable for a trusted market demo, but it is not strong security for financial or legal disputes.

## 3. One cart and one bay per vendor

Each vendor can hold one cart and one bay booking. This is a simple fairness rule: one vendor cannot accidentally keep many shared resources while others wait. A vendor can release a cart, hand it to another stall, or cancel a booking when finished.

## 4. Clear handling of problems

Broken and lost carts stay visible on the board. Overdue carts are shown in red, but they are not removed automatically. This makes the problem clear without taking a cart away from someone while they may still be unloading. The market team can later mark a cart repaired or found.

## 5. Local saving for weak internet

The app saves the current work on the same phone. A page refresh does not erase a vendor's profile, cart claim, booking, or activity. The downside is that two phones do not share changes in this prototype. A full market version would add a small shared database while keeping local saving as a backup.

## 6. Why this is a prototype

The design favors speed, clarity, and low cost over strict account security and multi-device synchronization. That makes it useful for testing the morning-rush workflow. Before real-world use, shared server data, proper vendor identity, and an admin process for disputes should be added.