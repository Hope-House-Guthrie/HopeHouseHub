/**
 * UA Management — Staff UA Pool helpers (Phase 5, mock/FE only).
 * Stopping point 2026-08-20. Resume: page STATUS header.
 */
import type { StaffUaPoolMember } from "./types";

/** Active members only (eligible for staff random later). */
export function activeStaffUaMembers(
  pool: StaffUaPoolMember[],
): StaffUaPoolMember[] {
  return pool.filter((m) => m.active);
}

/**
 * Add a staff name to the pool (active).
 * Empty/whitespace name → same pool.
 * Duplicate displayName (case-insensitive, trim) → same pool (no second row).
 */
export function addStaffUaMember(
  pool: StaffUaPoolMember[],
  displayName: string,
  nowIso: string = new Date().toISOString(),
  id: string = `mock-s-${Date.now()}`,
): StaffUaPoolMember[] {
  const name = displayName.trim();
  if (!name) return pool;

  const key = name.toLowerCase();
  const exists = pool.some((m) => m.displayName.trim().toLowerCase() === key);
  if (exists) return pool;

  const member: StaffUaPoolMember = {
    id,
    displayName: name,
    active: true,
    addedAt: nowIso,
    deactivatedAt: null,
  };
  return [...pool, member];
}

/** Deactivate by id (keep row). Unknown id → same pool. */
export function deactivateStaffUaMember(
  pool: StaffUaPoolMember[],
  id: string,
  nowIso: string = new Date().toISOString(),
): StaffUaPoolMember[] {
  return pool.map((m) => {
    if (m.id !== id) return m;
    if (!m.active) return m;
    return {
      ...m,
      active: false,
      deactivatedAt: nowIso,
    };
  });
}

/** Reactivate by id. Unknown id → same pool. */
export function reactivateStaffUaMember(
  pool: StaffUaPoolMember[],
  id: string,
): StaffUaPoolMember[] {
  return pool.map((m) => {
    if (m.id !== id) return m;
    if (m.active) return m;
    return {
      ...m,
      active: true,
      deactivatedAt: null,
    };
  });
}
