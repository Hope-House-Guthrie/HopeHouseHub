/**
 * Maintenance Requests — Backend Handoff notes (file only; not Hub chrome)
 *
 * FE STATUS (2026-09-07): Client frontend prototype COMPLETE through Phases 1–5.
 * No Phase 6 (dup/recurring advisory) or Phase 7 (DEV seed / Mike sim) in this
 * FE closeout. Mike/staff management UI is separate future work.
 *
 * FE is client mock only. Real auth, MR numbers, photos, and staff status are API.
 *
 * ---------------------------------------------------------------------------
 * Phase 2–3 FE submit (mock → API)
 * ---------------------------------------------------------------------------
 * - Client POST body ≈ SubmitMaintenanceRequestInput
 *   locationId, areaOrRoom (optional string; empty OK), item, category,
 *   stillUsableSafely, problemDescription, hasAdditionalNotes, additionalNotes?,
 *   photos? (0–3; FE mock = data URLs; omit/empty OK)
 * - areaOrRoom / Specific Area/Room: nullable/optional on backend; never required
 * - FE may normalize free-text casing/spacing before POST (optional server mirror)
 * - Server should assign: id, requestNumber (MR-YYYY-####), submittedAt,
 *   submitter from auth, status=Submitted, timeline event kind=submitted
 * - Photos: accept multipart/form-data (or upload URLs); store blobs + ids/urls
 *   — do NOT persist base64 data URLs as the long-term model
 * - Max 3 photos on initial submit (and 0–3 new photos per later client update)
 * - locationName snapshot from locationId at submit time
 * - Response should return full ticket so UI can show real MR# (+ photo urls)
 * - Do not auto-acknowledge; client copy must stay “in queue”
 *
 * ---------------------------------------------------------------------------
 * Phase 5 FE client follow-ups (mock → API)
 * ---------------------------------------------------------------------------
 * - Auth: client may only mutate own tickets (FE uses active DEV client id now)
 *
 * Add Information:
 * - Body required non-empty (trim); optional 0–3 new photos per update
 * - Ticket may accumulate more than 3 photos across multiple updates
 * - Append-only timeline event kind=client_update (summary + body + photo ids)
 * - Do NOT rewrite original submit fields (location/item/problem/notes/etc.)
 * - New photos → blob/upload storage + ids/urls; not long-term base64 in JSON
 * - Ticket status unchanged by add-info alone
 *
 * Request Cancellation:
 * - Optional reason (free text)
 * - Status → Cancellation Requested only; append kind=cancellation_requested
 * - Does NOT auto-close (not Completed / Closed - No Work Needed)
 * - Block repeat cancel while already Cancellation Requested
 * - Staff/backend decides eventual close / no-work-needed after review
 *
 * ---------------------------------------------------------------------------
 * DEV mock limitation (accepted — do not “fix” with more FE storage hacks)
 * ---------------------------------------------------------------------------
 * - FE stores photo bytes as dataUrls on the ticket for the mock only
 * - DEV localStorage key hhg-dev-maintenance-requests-v1 may hit quota once
 *   several base64 images are present; saveDevMrPersisted swallows write errors
 *   and leaves the last successful (often smaller/text-only) snapshot
 * - Session Redux can show later photos/cancel/timeline while hard refresh
 *   reloads the older snapshot — expected for this mock, not production behavior
 * - Production: blob/media storage + photo ids/urls on request and timeline events
 *
 * ---------------------------------------------------------------------------
 * OPEN / PLANNED FOR BACKEND
 * ---------------------------------------------------------------------------
 * - Auth: submittedBy = logged-in user; Client role sees own tickets only
 * - MR-YYYY-#### server-authoritative (FE mock counter is temporary)
 * - Locations table: seed + staff Add/Rename/Archive/Restore; store id + name snapshot
 * - Area/Room + Item free text now; later suggest prior values
 * - Original body immutable after submit; updates = timeline events
 * - Photos: real blob storage, not base64 in JSON/localStorage
 * - Status transitions + notifications = staff/Mike side (not built in client FE)
 * - Cancellation Requested does not auto-close
 * - DEV localStorage / as-client chips are NOT production persistence or security
 *
 * ---------------------------------------------------------------------------
 * PARKED PRODUCT (not built in client FE prototype closeout)
 * ---------------------------------------------------------------------------
 * - Dup/recurring advisory only (Location + Area + Item; never auto-merge/block)
 * - Full DEV seed pack + removable Mike status simulation (former “Ph7” idea)
 * - Staff submit on behalf of client
 * - Recurring “recently completed” day window
 * - Open/Closed list filters (closed stay in history)
 * - Mike / maintenance management UI
 */
