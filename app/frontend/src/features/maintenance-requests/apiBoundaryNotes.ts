/**
 * Maintenance Requests — Backend Handoff notes (file only; not Hub chrome)
 *
 * FE is client mock. Real auth, MR numbers, photos, and staff status are API.
 *
 * Phase 2–3 FE submit (mock):
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
 * - Max 3 photos per request (and later per client update)
 * - locationName snapshot from locationId at submit time
 * - Response should return full ticket so UI can show real MR# (+ photo urls)
 * - Do not auto-acknowledge; client copy must stay “in queue”
 */

/**
 * OPEN / PLANNED FOR BACKEND
 * - Auth: submittedBy = logged-in user; Client role sees own tickets only
 * - MR-YYYY-#### server-authoritative (FE mock counter is temporary)
 * - Locations table: seed + staff Add/Rename/Archive/Restore; store id + name snapshot
 * - Area/Room + Item free text now; later suggest prior values
 * - Original body immutable after submit; updates = timeline events
 * - Photos: real blob storage, not base64 in JSON
 * - Status transitions + notifications = staff/Mike side (not built)
 * - Cancellation Requested does not auto-close
 * - Dup/recurring flags advisory only (Location + Area + Item)
 * - DEV localStorage / as-client chips are NOT production persistence or security
 *
 * PARKED PRODUCT
 * - Staff submit on behalf of client
 * - Recurring “recently completed” day window
 * - Open/Closed list filters (closed stay in history)
 * - Mike management UI
 */
