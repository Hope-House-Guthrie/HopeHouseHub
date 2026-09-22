/**
 * Lowest-unused permanent bed slot helpers (Room Chart prototype).
 *
 * `nextLowestUnusedSlot` assigns a new bed's physical letter without touching
 * existing beds' slots. Examples:
 * - only B exists → A
 * - A and C exist → B
 * - A and B exist → C
 *
 * `compareBedsBySlot` orders beds by permanent slot for:
 * - consistent alphabetical display (RoomCard / RoomEditor)
 * - Add Person selecting the lowest vacant slot (A before B, etc.)
 * Sorting/comparing must never redefine, renumber, or mutate Bed.slot.
 */

/**
 * Returns the lowest unused alphabetical bed slot (A–Z) in a room.
 * Does not invent letters past Z; throws if A–Z are all taken.
 */
export function nextLowestUnusedSlot(
  usedSlots: Iterable<string>,
): string {
  const used = new Set(
    [...usedSlots].map((slot) => slot.trim().toUpperCase()).filter(Boolean),
  );

  for (let i = 0; i < 26; i += 1) {
    const slot = String.fromCharCode("A".charCodeAt(0) + i);
    if (!used.has(slot)) {
      return slot;
    }
  }

  throw new Error("No unused bed slots left (A–Z are all taken)");
}

/** Sort by permanent Bed.slot only — does not change slot values on the beds. */
export function compareBedsBySlot(
  a: { slot: string },
  b: { slot: string },
): number {
  return a.slot.localeCompare(b.slot, undefined, { sensitivity: "base" });
}
