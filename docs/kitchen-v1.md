# Kitchen Board v1

Feature branch work for serving-line menu display + kitchen manager edit (later slices).

## Goal

Kitchen manager (or admin) sets today’s meals and dinner time in the hub.  
Serving-line TV shows only guest-facing info.  
Internal staff notes stay off the TV and can alert admin in a later phase.

## Public (TV / serving line) — SHOW

- Breakfast (text)
- Lunch (text)
- Dinner (text)
- Dinner time (e.g. 4:30 PM, 5:00 PM)

Real kitchen pattern (guidance only, not locked defaults):

- Breakfast is normally cold cereal; occasionally cooked
- Lunch is normally sandwiches and leftovers
- Dinner follows the manager’s menu rotation; occasional specials when product comes in

## Internal only — DO NOT show on TV

- Staff note (e.g. “out of plates”)
- Notify Frankie / admin (phase 2)

## Build slices

1. Spec (this doc)
2. Display page with hard-coded sample B/L/D + dinner time ← current
3. Route to open display in browser
4. Manager edit page (local/fake save first)
5. Backend save/load; TV reads real data → PR for TJ
6. Internal notes + admin notify (phase 2)

## Out of scope for v1

- Full recipe book / monthly planner
- Inventory
- SMS
- Polished TV branding/animation (after data path works)

## Routes (planned)

- `/kitchen/display` — read-only TV page (no internal notes)
- `/kitchen` — manager edit tab (later slice)
