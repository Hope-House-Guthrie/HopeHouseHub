/**
 * UA Management — API / backend boundary + Phase 8 handoff notes.
 * Docs only. No network calls. FE mock Phases 0–8.
 * Resume: pages/ua-management/index.tsx STATUS header.
 */

/**
 * Access product (FE mock aligned):
 * - /ua-management full page → admin (ua-admin) only
 * - Revealed five on dashboard → houseleader + admin + staff; check-off allowed
 * - Do not trust FE-only hide for seal secrecy
 */
export const UA_MANAGEMENT_ACCESS_PRODUCT = [
  "UA Management page (tracker, seal tools, staff pool, staff pick): admin only",
  "Random UAs Today (revealed five): dashboard widget for houseleader + admin + staff",
  "Check-off pending/done on Today list: same dashboard desk roles",
  "Seal day/names never leak pre-reveal to any non-authorized surface",
] as const;

/** Short labels for handoff / PR notes (not sent over the wire). */
export const UA_MANAGEMENT_BACKEND_NEEDS = [
  "Active Client-role user feed for tracker + seal pool",
  "UA history (last date/type/reason) per client",
  "Weekly seal job (CT): pick randomDay + five clientIds; persist sealed state",
  "Persistent sealed week: weekId, randomDay, randomDate, clientIds[5], sealedAt, revealedAt",
  "Reveal rules: hide day/names until randomDate; authorize who may see Today list",
  "Random UAs Today completion updates (pending/done) + audit",
  "UA form submit must update lastUaDate / tracker (Mark done on board is not enough)",
  "Dashboard feed for revealed Today board (houseleader / staff / admin)",
  "Staff UA Pool persistence (add/activate/deactivate; not Hub-role derived)",
  "Manual staff random pick result stability + optional audit",
  "Authorization: admin management page vs dashboard Today desk vs DEV tools",
  "Do not trust FE-only hide for seal secrecy",
] as const;

/**
 * Policy still open with TJ (not blocked for FE mock demos).
 */
export const UA_MANAGEMENT_OPEN_POLICY = [
  "Final green/yellow/red day cutoffs (mock uses 14 / 30)",
  "Final client weight multipliers (mock green1 / yellow2 / red4 / never5)",
  "Seal create timing each week (America/Chicago assumed)",
  "Dropout / discharge between seal and reveal (v1 assumption: lock five at seal)",
  "Equal vs weighted Mon–Fri day selection (mock = equal)",
  "Fewer than five eligible clients (mock seals fewer; UI warns)",
  "Same-day non-random UA vs person already on sealed random list",
  "Automatic Staff Random UA schedule (UI ON/OFF placeholder only)",
  "Exact Hub role string for houseleader",
  "Admin void / reseal rules (if any)",
  "Person in both Client and Staff pools — eligibility interaction",
] as const;

/**
 * FE mock already covers (no backend). Useful for PR body.
 */
export const UA_MANAGEMENT_FE_MOCK_DONE = [
  "Client tracker G/Y/R + mock rows",
  "Weighted sealed five + Mon–Fri random day",
  "Hide until reveal + DEV sim today",
  "Random UAs Today pending/done (stable; no reroll)",
  "Staff pool add/deactivate/reactivate",
  "Pick Random Staff (active only) + auto placeholder",
  "Mock role gates: admin mgmt vs houseleader/staff desk",
  "Layout: client list → staff list → pick under staff",
  "Empty / <5 / no-active-staff edge messaging (Phase 8)",
] as const;

/**
 * Suggested future service seams (names only — not implemented).
 */
export const UA_MANAGEMENT_FUTURE_SERVICE_SEAMS = {
  getWeekSeal: "GET /api/ua/seals/current (shape TBD)",
  getRandomUaToday: "GET /api/ua/random-today (shape TBD)",
  markRandomUaTodayDone: "PATCH /api/ua/random-today/{clientId} (shape TBD)",
  staffPool: "GET/POST/PATCH /api/ua/staff-pool (shape TBD)",
  pickStaff: "POST /api/ua/staff-random-pick (shape TBD)",
  uaHistory: "GET/POST /api/ua/history (shape TBD) — drives lastUaDate",
} as const;

/** Numbered backend needs for STATUS / PR body. */
export function uaManagementBackendNeedsSummary(): string {
  return UA_MANAGEMENT_BACKEND_NEEDS.map((n, i) => `${i + 1}. ${n}`).join("\n");
}

/** Short handoff blurb for DEV panel / PR. */
export function uaManagementHandoffSummary(): string {
  const open = UA_MANAGEMENT_OPEN_POLICY.map((n, i) => `${i + 1}. ${n}`).join(
    "\n",
  );
  const be = uaManagementBackendNeedsSummary();
  return [
    "FE mock Phases 0–8 complete. No backend.",
    "",
    "BACKEND NEEDS:",
    be,
    "",
    "OPEN POLICY:",
    open,
  ].join("\n");
}
