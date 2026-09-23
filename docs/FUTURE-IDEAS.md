# Hope House Hub — Future Ideas

This file is a parking lot for ideas we want to remember but are not current implementation requirements.

Do not implement anything in this file unless specifically requested.

---

## Hub About / Build Info

### Ducky + TJ Maker's Mark

Add a subtle signature recognizing the original builders of Hope House Hub.

Ideas:

- Developer/source-code signature identifying Ducky + TJ as builders of Hope House Hub.
- Small DevTools console signature when the Hub starts.
- Hidden decorative Easter egg in a future About / Build Info area.
- Possible reveal: click or tap the version/build number 7 times.
- Reveal could display:

  **Hope House Hub**  
  Built by Ducky + TJ  
  Guthrie, Oklahoma

- A small tasteful animation could accompany the reveal.

Rules:

- Decorative only.
- Never tied to authentication, authorization, roles, or permissions.
- Never create a secret route, password, bypass, or privileged feature.
- Normal users should not need to discover or interact with it.
- Final wording and design can be decided when About / Build Info is implemented.

---

## Parking Lot

Add future ideas below this section as they come up.


# Future Ideas

## House Display

### Class / Program Logos
- Allow classes and programs to have an optional assigned logo.
- Examples:
  - I Matter
  - Tech Quest
  - NA / Men's NA / Women's NA
  - DBSA Support / DBSA Wellness
- Do not hard-code logos based only on class names.
- Eventually provide a reusable logo library so future classes can be assigned a logo.
- When a class is currently happening, its logo can become part of the prominent "Now Happening" presentation.
- Classes without a logo continue using the normal presentation.

### Dynamic Display / Spotlight Rotation
- When no class or event is currently happening, use the dynamic side of the House Display for rotating content.
- Possible content:
  - Spotlights
  - Announcements
  - Shout-outs
  - Birthdays
  - Upcoming events
  - Reminders
  - Images
  - Videos

### Video Rotation
- Videos may participate in the normal content rotation.
- Do not play videos while a class or event is currently active.
- Classes/events always take priority over video.
- Allow configurable video hours instead of hard-coding a cutoff.
- After the video cutoff, non-video content may continue rotating.
- Videos should default to muted.
- Sound should be separately configurable.
- Consider limits so a long video cannot take over the display indefinitely.

### Future Display Content Management
- Consider one unified "Display Content" management system instead of separate systems for every content type.
- Possible content types:
  - Announcement
  - Spotlight
  - Shout-out
  - Image
  - Video
- Content could eventually support:
  - Enable/disable
  - Start/end dates
  - Rotation eligibility
  - Display duration
  - Priority

---

## Room Assignment (Intake ↔ Room Chart)

Prototype plan for developers (including TJ). **Do not implement from this section unless asked.** Frontend-only work; no backend/API/DB design here.

### Current UX
- **Room Assignment** and **Medication Room Locker Number** live under Intake → **Program Assignment** (after program radios / initials, with a Divider).
- **Medication Room Locker Number** stays **free-text**.
- **Room Assignment** is still free-text for now (`form.roomNumber`, placeholder like `6S - A`) and **must not stay free-text long-term**.

### Intended Intake UX
- Staff **select** an available room/bed from a **dropdown** (not manual typing).
- Staff should **not** format assignment codes by hand.
- Human-readable codes stay consistent, e.g. `6S - A` (room number + hall letter W/S/E + permanent slot).

### Bed identity (display vs id)
| Concept | Role |
|--------|------|
| **Display** | Human code such as `6S - A` — what staff see and pick in the UI |
| **Identity** | `Bed.id` — stable bed identity for future persisted assignment |
| **`Bed.slot`** | Permanent physical position **A / B / C / …** |

Rules:
- `Bed.slot` is permanent. **Never** recalculate or renumber slots from array order because another bed was removed.
- Display code and identity are **different**. UI shows the code; when the data contract/backend is ready, store **`Bed.id`**, not the string alone as the sole key.
- Use the shared formatter idea already sketched on Room Chart (`formatBedAssignmentCode`) when wiring Intake.

### Shared frontend source
- Intake and Room Chart must use the **same** frontend room/bed definitions.
- **Do not** copy Room Chart seed data into Intake (no duplicate seeds).
- Preferred prototype direction: **one shared in-memory** room/bed state so Room Chart occupancy changes can affect Intake availability **in the same browser session**.

### Availability
- Dropdown should eventually **exclude** beds that are **occupied** or **unavailable**.
- Today, Room Chart occupancy is **prototype / in-memory only** and **resets on refresh**.
- Until shared state or a future backend exists, **do not** describe availability as persistent or live across **independent** page state.

### Eligibility
- Gender / housing eligibility rules are **not** in the Room Chart model today.
- **Do not invent** those rules.
- Future filtering should use **approved Hope House housing rules** once defined.

### Project boundary
- Current work is **frontend-only**.
- Do **not** build backend/API/database/persistence architecture as part of this prototype.
- Leave clean FE integration seams for a future backend.

### Branch note
- Room Chart: branch `prototype/room-chart` (not present on Intake tip by default).
- Intake: branch `feature/intake-drafts`.
- **Branch alignment is required** before implementing the shared model and dropdown correctly.
- Do **not** “fix” the split by duplicating Room Chart data onto Intake.

### Suggested frontend sequence
1. Bring Room Chart and Intake onto a **common line of development**.
2. **Extract/share** Room/Bed types, seed data, and display-code utilities (one source).
3. Point **Room Chart** at the shared model **without** changing its behavior.
4. Establish **shared in-memory occupancy** for the prototype session.
5. Replace Intake free-text Room Assignment with an **available-bed Select**.
6. Later, when the persistent contract is ready: store **`Bed.id`** as assignment identity while still **displaying** codes such as `6S - A`.
