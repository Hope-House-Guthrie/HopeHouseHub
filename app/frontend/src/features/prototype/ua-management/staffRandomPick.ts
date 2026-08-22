/**
 * UA Management — Phase 6 manual staff random pick (mock/FE only).
 * Stopping point 2026-08-20. Auto schedule = page placeholder only.
 * Resume: page STATUS header.
 */
import { activeStaffUaMembers } from "./staffUaPool";
import type { StaffRandomPickResult, StaffUaPoolMember } from "./types";

/**
 * Pick one active staff member at random.
 * Returns null if no active members.
 * Inject random() for tests; default Math.random (0 <= n < 1).
 */
export function pickRandomActiveStaff(
  pool: StaffUaPoolMember[],
  options: {
    random?: () => number;
    pickedAt?: string;
  } = {},
): StaffRandomPickResult | null {
  const active = activeStaffUaMembers(pool);
  if (active.length === 0) return null;

  const random = options.random ?? Math.random;
  // Index in [0, active.length)
  let idx = Math.floor(random() * active.length);
  if (idx < 0) idx = 0;
  if (idx >= active.length) idx = active.length - 1;

  const m = active[idx];
  if (!m) return null;

  return {
    staffId: m.id,
    displayName: m.displayName,
    pickedAt: options.pickedAt ?? new Date().toISOString(),
  };
}
