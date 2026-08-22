/**
 * UA Management — FE access policy (mock only).
 * Phases 0–8 FE mock. Frontend hide ≠ security.
 *
 * PRODUCT (locked for this mock):
 * - Full UA Management page (tracker, pool, staff pick, DEV seal) = admin only
 * - Revealed Random UAs Today (the five) + check-off = houseleader + admin + staff
 *   (lives on dashboard later; mock can preview that desk on this page)
 * - viewer = no UA access (negative test chip)
 * Resume: pages/ua-management/index.tsx STATUS + Desktop plan.
 */
import type { UaManagementCapabilities, UaManagementRoleHint } from "./types";

/** Normalize role tokens for comparison. */
export function normalizeRoleToken(role: string): string {
  return role.trim().toLowerCase();
}

/**
 * Map mock role hints → capabilities.
 * Aliases: ua-admin → same as admin. houseleader spelling variants accepted.
 */
export function capabilitiesForRoles(
  roles: readonly string[],
): UaManagementCapabilities {
  const set = new Set(roles.map(normalizeRoleToken));

  const isAdmin = set.has("admin") || set.has("ua-admin");

  // Floor desk: see the revealed five and mark pending/done
  const isHouseleader =
    set.has("houseleader") ||
    set.has("house-leader") ||
    set.has("house_leader");
  const isStaff = set.has("staff");
  const isTodayDesk = isAdmin || isHouseleader || isStaff;

  return {
    // Route/chrome: real nav later gates /ua-management to admin
    canAccessUaManagementPage: isAdmin,
    // Admin management tools
    canViewTracker: isAdmin,
    canManageStaffPool: isAdmin,
    canPickRandomStaff: isAdmin,
    canUseDevSealTools: isAdmin,
    // Dashboard desk (houseleader / staff / admin)
    canViewRandomUaToday: isTodayDesk,
    canMarkRandomUaToday: isTodayDesk,
  };
}

/** Default DEV mock roles when page loads (admin so full management UI shows). */
export const DEFAULT_MOCK_UA_ROLES: UaManagementRoleHint[] = ["admin"];

/**
 * Selectable mock roles for the DEV simulator.
 * Order: admin tools first, then desk roles, then no-access.
 */
export const MOCK_UA_ROLE_OPTIONS: UaManagementRoleHint[] = [
  "admin",
  "ua-admin",
  "houseleader",
  "staff",
  "viewer",
];
