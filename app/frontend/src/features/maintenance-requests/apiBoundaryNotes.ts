/**
 * Maintenance Requests — Backend Handoff notes (file only; not Hub chrome)
 *
 * FE is client mock. Real auth, MR numbers, photos, and staff status are API.
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
