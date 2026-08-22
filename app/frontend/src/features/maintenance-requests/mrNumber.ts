/**
 * Mock Maintenance Request numbers (FE only).
 * BACKEND: server must issue authoritaive MR-YYYY-####.
 */

/**
 * @param year full year, e.g. 2026
 * @param seq 1-based sequence within that yaer (slice owns the counter)
 */
export function formatMaintenanceRequestNumber(
  year: number,
  seq: number,
): string {
  const padded = String(seq).padStart(4, "0");
  return `MR-${year}-${padded}`;
}

/** Chicago calendar year for mock MR# (house timezone). */
export function chicagoYearNow(date: Date = new Date()): number {
  const y = date.toLocaleDateString("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
  });
  return Number(y);
}
