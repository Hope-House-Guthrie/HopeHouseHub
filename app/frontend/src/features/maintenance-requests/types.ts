/**
 * Maintenance Requests — types (client FE mock)
 * Branch: feature/maintenance-requests
 *
 * Client v1 only. Mike/staff management UI is out of scope here.
 * BACKEND TODO: server owns ids, MR numbers, auth identity, photos, status.
 */

/** Client-visible ticket status (staff/Mike drives transitions later). */
export type MaintenanceRequestStatus =
  | "Submitted"
  | "Acknowledged"
  | "Scheduled"
  | "In Progress"
  | "Waiting on Parts"
  | "Completed"
  | "Cancellation Requested"
  | "Closed - No Work Needed";

/** Problem category on the request form. */
export type MaintenanceCategory =
  | "Plumbing"
  | "Electrical"
  | "Heating / Air"
  | "Appliance / Equipment"
  | "Doors / Locks / Windows"
  | "Furniture"
  | "Building / General Repair"
  | "Pest"
  | "Safety Concern"
  | "Other / Not Sure";

/** Can this area/item still be used safely? */
export type SafetyUsableAnswer = "Yes" | "No" | "Not Sure";

/** Optional photo attachment (mock data URL until real file storage). */
export interface MaintenanceRequestPhoto {
  id: string;
  /** data:image/... mock only — BACKEND: upload id/url */
  dataUrl: string;
  fileName: string;
  /** ISO when photo was attached */
  addedAt: string;
}

/**
 * Append-only history on a ticket.
 * Original submit fields are NOT edited after create.
 */
export type MaintenanceTimelineKind =
  | "submitted"
  | "status_change"
  | "client_update"
  | "cancellation_requested"
  | "note";

export interface MaintenanceTimelineEvent {
  id: string;
  kind: MaintenanceTimelineKind;
  /** ISO timestamp */
  at: string;
  /** Short label for UI timeline */
  summary: string;
  /** Optional longer text (Add Information, etc.) */
  body?: string;
  photoIds?: string[];
  /** Optional status after this event */
  status?: MaintenanceRequestStatus;
  /** Display name; BACKEND: user id */
  actorLabel?: string;
}

/**
 * Seeded / catalog location.
 * Later: staff Add / Rename / Archive / Restore without losing history.
 */
export interface MaintenanceLocation {
  id: string;
  name: string;
  /** Soft-archive; keep rows that used this location */
  archived: boolean;
}

/**
 * One maintenance request (one item per ticket).
 * Fields beyond Phase 1 shell are defined now so later phases extend reducers only.
 */
export interface MaintenanceRequest {
  id: string;
  /** Mock FE: MR-YYYY-#### — BACKEND authoritative later */
  requestNumber: string;
  status: MaintenanceRequestStatus;

  /** Submitter — mock DEV client id/label until real auth */
  submittedByClientId: string;
  submittedByDisplayName: string;
  /** ISO */
  submittedAt: string;

  locationId: string;
  /** Snapshot at submit so rename/archive does not rewrite history */
  locationName: string;
  /**
   * Specific Area / Room — optional free text (blank OK).
   * BACKEND: nullable/optional; never required by location.
   */
  areaOrRoom: string;
  item: string;
  category: MaintenanceCategory;
  stillUsableSafely: SafetyUsableAnswer;
  problemDescription: string;
  /** Anything else Maintenance should know? */
  hasAdditionalNotes: boolean;
  additionalNotes?: string;

  photos: MaintenanceRequestPhoto[];
  timeline: MaintenanceTimelineEvent[];
}

/**
 * DEV-only mock client for “as client” testing.
 * Not security; real auth replaces this later.
 */
export interface DevMockClient {
  id: string;
  displayName: string;
}

/** Page chrome: New Request vs My Requests. */
export type MaintenanceRequestsView = "new" | "mine";

/**
 * Client form payload for create (Phase 2–3).
 * Slice fills id, requestNumber, status, submitter, submittedAt, timeline.
 * photos optional on input; slice copies onto the ticket (max 3).
 */
export interface SubmitMaintenanceRequestInput {
  locationId: string;
  /** Optional; blank string is valid */
  areaOrRoom: string;
  item: string;
  category: MaintenanceCategory;
  stillUsableSafely: SafetyUsableAnswer;
  problemDescription: string;
  hasAdditionalNotes: boolean;
  /** Required trim non-empty when hasAdditionalNotes is true */
  additionalNotes?: string;
  /**
   * Optional photos (max MAX_MAINTENANCE_PHOTOS). Mock data URLs until BE upload.
   * Empty / omitted = no photos.
   */
  photos?: MaintenanceRequestPhoto[];
}

/**
 * Client Add Information (Phase 5).
 * Append-only timeline + optional new photos; does not edit original submit fields.
 * body: required non-empty after trim (page validates before dispatch).
 * photos: optional 0-MAX_MAINTENANCE_PHOTOS new images for this update only.
 */
export interface AddMaintenanceRequestInfoInput {
  requestId: string;
  /** Required non-empty after trim */
  body: string;
  /** Optional new photos for this update (max 3). Empty / omitted = none. */
  photos?: MaintenanceRequestPhoto[];
}

/**
 * Client Request Cancellation (Phase 5).
 * Sets status Cancellation Requested + timeline; does NOT auto-close.
 * reason optional free text.
 */
export interface RequestMaintenanceCancellationInput {
  requestId: string;
  /** Optional; blank / omitted OK */
  reason?: string;
}
