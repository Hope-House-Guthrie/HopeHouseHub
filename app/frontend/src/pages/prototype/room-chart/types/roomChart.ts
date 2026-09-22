/**
 * Room Chart domain types (prototype).
 *
 * Hall → Room[] → Bed[]. These shapes are the FE contract for seed data and
 * in-memory editing; future API payloads should align with the same identities.
 */

export type RoomUse =
  | "bedroom"
  | "office"
  | "computer-lab"
  | "storage"
  | "ovn"
  | "shower"
  | "utility"
  | "laundry"
  | "med-room"
  | "other";

export type BedStatus = "occupied" | "vacant" | "unavailable";

/**
 * One physical bed in a room.
 *
 * Identity vs position (IMPORTANT):
 * - `id` — stable internal identity. Future Intake/backend assignment should
 *   store this id (not the human code string).
 * - `slot` — permanent staff-facing position ("A", "B", "C", …). Never derive
 *   or renumber slot from array index. Removing vacant A must leave B as B;
 *   a freed letter may be reused later by Add Bed via lowest-unused logic.
 * - `label` — legacy/display string from seed (e.g. "Bed 1"); not the slot letter.
 */
export interface Bed {
  id: string;
  label: string;
  /** Permanent staff-facing bed position (A, B, C, ...). Not derived from array index. */
  slot: string;
  status: BedStatus;
  occupantName?: string;
  program?: string;
}

export interface Room {
  id: string;

  // Physical identity
  hallId: string;
  roomNumber?: number;
  physicalName?: string;

  // Current use can change without changing the room itself?
  currentUse: RoomUse;
  currentUseLabel?: string;

  beds: Bed[];

  /** Reserved for future active/inactive room filtering; unused by Room Chart UI today. */
  active: boolean;
  side: "top" | "bottom";
  displayOrder: number;
}

export interface Hall {
  id: string;
  name: string;
  displayOrder: number;
  rooms: Room[];
}
