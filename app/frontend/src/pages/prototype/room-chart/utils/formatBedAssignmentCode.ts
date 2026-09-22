/**
 * Staff-facing bed assignment codes for Room Chart (and future Intake UI).
 *
 * Examples: "6S - A", "12W - B", "4W - C", "3E - A"
 *   = roomNumber + hall letter (W/S/E) + " - " + permanent Bed.slot
 *
 * Display only — not a database key. Persist Bed.id for assignment identity.
 * Uses bed.slot only (never array index, Bed.id, or Bed.label).
 * Returns null for missing roomNumber, unknown hallId, empty slot, or
 * named/non-numbered rooms until product rules exist for those spaces.
 *
 * Intentionally exported for future Intake/UI; Room Chart does not render
 * these codes yet. Bed.id remains the assignment identity when wiring Intake.
 */

import type { Bed, Room } from "../types/roomChart";

const HALL_LETTER: Record<string, string> = {
  west: "W",
  south: "S",
  east: "E",
};

/**
 * Staff-facing bed assignment code from room number + hall + permanent bed.slot.
 * Display only — callers should store Bed.id as the internal identity.
 *
 * Examples: "6S - A", "12W - B", "3E - C"
 * Returns null when the room is unnumbered, hall is unknown, or slot is empty.
 */
export function formatBedAssignmentCode(
  room: Pick<Room, "hallId" | "roomNumber">,
  bed: Pick<Bed, "slot">,
): string | null {
  if (room.roomNumber == null) {
    return null;
  }

  const hallLetter = HALL_LETTER[room.hallId];
  if (!hallLetter) {
    return null;
  }

  const slot = bed.slot?.trim();
  if (!slot) {
    return null;
  }

  return `${room.roomNumber}${hallLetter} - ${slot}`;
}
