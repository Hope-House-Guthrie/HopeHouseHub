/**
 * Maintenance Requests — static config (client FE)
 * Categories, client-visible statuses, initial location seeds.
 */

import type {
  DevMockClient,
  MaintenanceCategory,
  MaintenanceLocation,
  MaintenanceRequestStatus,
} from "./types";

/** Form category options (order = UI order). */
export const MAINTENANCE_CATEGORIES: readonly MaintenanceCategory[] = [
  "Plumbing",
  "Electrical",
  "Heating / Air",
  "Appliance / Equipment",
  "Doors / Locks / Windows",
  "Furniture",
  "Building / General Repair",
  "Pest",
  "Safety Concern",
  "Other / Not Sure",
] as const;

/** Client-visible status labels (order for future filters). */
export const MAINTENANCE_REQUEST_STATUSES: readonly MaintenanceRequestStatus[] =
  [
    "Submitted",
    "Acknowledged",
    "Scheduled",
    "In Progress",
    "Waiting on Parts",
    "Completed",
    "Cancellation Requested",
    "Closed - No Work Needed",
  ] as const;

/**
 * Initial house locations (seed).
 * Later authorized staff: Add / Rename / Archive / Restore.
 * Historical requests keep locationName snapshot.
 */
export const INITIAL_MAINTENANCE_LOCATIONS: readonly Omit<
  MaintenanceLocation,
  "id" | "archived"
>[] = [
  { name: "West Yard" },
  { name: "North Yard" },
  { name: "Client Patio" },
  { name: "Front Patio" },
  { name: "East Hall" },
  { name: "West Hall" },
  { name: "South Hall" },
  { name: "Large Dining Room" },
  { name: "Small Dining Room" },
  { name: "Living Room" },
  { name: "Computer Lab" },
  { name: "Elisha's Office" },
  { name: "Brent's Office" },
  { name: "Frankie's Office" },
  { name: "Kitchen" },
  { name: "Serving Line (SLA)" },
  { name: "Clothing Room" },
  { name: "Baby Room" },
  { name: "East Storage" },
  { name: "West Storage" },
  { name: "South Shower Room" },
  { name: "South Double Shower Room" },
  { name: "Guest Bathroom" },
  { name: "Rec Room" },
  { name: "Front Lobby" },
] as const;

/** One-item-per-request notice (client form). */
export const ONE_ITEM_PER_REQUEST_NOTICE =
  "One item per request. If you need to report a problem with a different item, please submit another maintenance request.";

/**
 * Safety = No client warning (no escalation workflow yet).
 * Shown when stillUsableSafely === "No" (Phase 2+ form).
 */
export const SAFETY_UNSAFE_CLIENT_WARNING =
  "You marked this area/item as not safe to use. Do not use it until Maintenance has reviewed the request.";

/** Max optional photos per request (and per client update later). */
export const MAX_MAINTENANCE_PHOTOS = 3;

/**
 * DEV mock clients for “as client” selector (import.meta.env.DEV only in UI).
 * BACKEND: real logged-in Client identity.
 */
export const DEV_MOCK_CLIENTS: readonly DevMockClient[] = [
  { id: "dev-client-alex", displayName: "Alex (DEV Client)" },
  { id: "dev-client-jordan", displayName: "Jordan (DEV Client)" },
  { id: "dev-client-sam", displayName: "Sam (DEV Client)" },
] as const;

/** localStorage key for DEV-only mock MR state — never treat as production. */
export const DEV_MR_STORAGE_KEY = "hhg-dev-maintenance-requests-v1";

/**
 * Build catalog rows with stable seed ids from initial names.
 * FE-only; BACKEND will assign real location ids.
 */
export function buildInitialLocationCatalog(): MaintenanceLocation[] {
  return INITIAL_MAINTENANCE_LOCATIONS.map((row, index) => ({
    id: `loc-seed-${String(index + 1).padStart(3, "0")}`,
    name: row.name,
    archived: false,
  }));
}
