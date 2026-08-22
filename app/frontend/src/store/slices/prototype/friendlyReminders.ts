/**
 * Friendly Reminders / Client Infraction — Redux slice (FE mock store)
 *
 * ONE combined infraction count across all three types:
 *   chore | roll_call_class | room_inspection
 *
 * At 3 total → status "admin_review_needed" (flag only).
 * NEVER auto-applies orientation / discipline.
 *
 * Signatures do NOT affect the count — only client name match does.
 *
 * ---------------------------------------------------------------------------
 * BACKEND TODO / FUTURE INTEGRATION (keep FE shapes friendly for these):
 * - Persist records; load history per stable clientId (not free-text name)
 * - Real client picker + multi-device / server-side combined count
 * - Notifications when threshold hit (staff + Administration)
 * - SEND TO CLIENT: after form is filled (and optionally signed), deliver the
 *   Friendly Reminder to that client (portal message / email / SMS). Needs
 *   client contact on Hub record + notify API. FE can later call
 *   notifyClient(infractionId) — stub only until BE exists.
 * - ROOM INSPECTION PHOTOS: optional image attachments on room_inspection
 *   rows (capture from tablet camera or file picker). FE will store
 *   photoAttachments[]; BE should accept multipart/upload and return URLs
 *   (do not keep large base64 forever on the server).
 * - PDF / print of Friendly Reminder (wording + signatures + photos)
 * - Finish-signatures is FE-ready via updateInfractionSignatures (PATCH later)
 * ---------------------------------------------------------------------------
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Which paper form this digital notice maps to */
export type InfractionType =
  | "chore"
  | "roll_call_class"
  | "room_inspection";

/** Roll Call vs Mandatory Class — only when type is roll_call_class */
export type AbsenceType = "" | "roll_call" | "mandatory_class";

/**
 * Absent vs Late — only when type is roll_call_class.
 * Both still count as one combined infraction toward the threshold of 3.
 */
export type AttendanceIssue = "" | "absent" | "late";

/**
 * Room inspection failure reasons (multi-select).
 * "other" should be paired with free-text notes when selected.
 */
export type RoomIssueCode =
  | "unmade_bed"
  | "trash"
  | "clothes_on_floor"
  | "odor"
  | "other";

/** All codes in display order (for checkboxes + labels) */
export const ROOM_ISSUE_OPTIONS: { value: RoomIssueCode; label: string }[] = [
  { value: "unmade_bed", label: "Unmade bed" },
  { value: "trash", label: "Trash" },
  { value: "clothes_on_floor", label: "Clothes on the floor" },
  { value: "odor", label: "Odor" },
  { value: "other", label: "Other" },
];

/** Staff-facing label for one room issue code */
export function roomIssueLabel(code: RoomIssueCode): string {
  return ROOM_ISSUE_OPTIONS.find((o) => o.value === code)?.label ?? code;
}

/** Join selected room issues for history / notices */
export function formatRoomIssues(
  codes: RoomIssueCode[] | undefined,
  otherNotes?: string
): string {
  if (!codes || codes.length === 0) {
    return otherNotes?.trim() ?? "";
  }
  const notes = otherNotes?.trim() ?? "";
  const parts = codes.map((c) => {
    // Fold free-text into the Other label when that box is checked
    if (c === "other" && notes) {
      return `Other (${notes})`;
    }
    return roomIssueLabel(c);
  });
  // Notes with no Other: still show them after the checklist labels
  if (notes && !codes.includes("other")) {
    parts.push(notes);
  }
  return parts.join(", ");
}

/**
 * Workflow status
 * - pending_signature: draft / not fully signed (future)
 * - complete: under threshold after record
 * - admin_review_needed: combined count reached 3+ (flag only)
 */
export type InfractionStatus =
  | "pending_signature"
  | "complete"
  | "admin_review_needed";

/** Saved history row (what staff see in the list) */
export interface InfractionRecord {
  id: string;
  /** When staff saved this row (ISO) */
  createdAt: string;
  clientName: string;
  /** YYYY-MM-DD — day the form was filled */
  currentDate: string;
  infractionType: InfractionType;
  /** YYYY-MM-DD — day the issue happened */
  infractionDate: string;
  absenceType: AbsenceType;
  /** Absent or Late (roll call / class only) */
  attendanceIssue: AttendanceIssue;
  /** Multi-select room failure reasons (room_inspection only) */
  roomIssues: RoomIssueCode[];
  /**
   * Free-text notes:
   * - chore / roll call: optional detail
   * - room + other: describe "other"; also general room notes
   */
  reasonNotes: string;
  status: InfractionStatus;
  /**
   * Combined count for this client AFTER this record was added (1..n of 3).
   * Stored so history can show "2 of 3" without re-scanning if order changes later.
   */
  combinedCountAfter: number;
  /** Raw base64 PNG (no data: prefix) — same as UA SignatureCanvas */
  clientSignature: string;
  /** YYYY-MM-DD — type="date" */
  clientSignatureDate: string;
  /** Staff / Facility Director — raw base64 PNG */
  staffSignature: string;
  /** YYYY-MM-DD — type="date" */
  staffSignatureDate: string;
  /**
   * FUTURE — Room inspection photos (and maybe other types later).
   * FE mock may fill base64 data URLs; backend should store files and keep URLs.
   * Empty array until photo UI ships.
   */
  photoAttachments: InfractionPhotoAttachment[];
  /**
   * FUTURE — deliver Friendly Reminder to client (portal/email/SMS).
   * null = never attempted; set when notify API exists.
   */
  clientNotifyStatus: ClientNotifyStatus;
}

/**
 * FUTURE photo row — shape locked early so BE can map 1:1.
 * Prefer `url` after upload; `dataUrl` is FE-only mock until storage exists.
 */
export interface InfractionPhotoAttachment {
  id: string;
  /** Optional staff caption ("sink area", etc.) */
  caption: string;
  /** ISO timestamp when attached */
  createdAt: string;
  /** Remote storage URL after backend upload */
  url?: string;
  /** FE mock only — full data URL; do not persist long-term on server */
  dataUrl?: string;
}

/**
 * FUTURE notify-client workflow status (stub until BE).
 * not_sent → queued → sent | failed
 */
export type ClientNotifyStatus =
  | "not_sent"
  | "queued"
  | "sent"
  | "failed";

/** Payload from the form when staff clicks Save (id/status/count assigned in reducer) */
export type InfractionSubmitInput = {
  clientName: string;
  currentDate: string;
  infractionType: InfractionType;
  infractionDate: string;
  absenceType: AbsenceType;
  attendanceIssue: AttendanceIssue;
  roomIssues: RoomIssueCode[];
  reasonNotes: string;
  clientSignature?: string;
  clientSignatureDate?: string;
  staffSignature?: string;
  staffSignatureDate?: string;
  /** FUTURE — pass through when photo UI exists */
  photoAttachments?: InfractionPhotoAttachment[];
};

/**
 * Update signatures on an existing row (Administration / staff finish later).
 * Does NOT add to the combined count.
 */
export type InfractionSignatureUpdateInput = {
  id: string;
  clientSignature: string;
  clientSignatureDate: string;
  staffSignature: string;
  staffSignatureDate: string;
};

export interface FriendlyRemindersState {
  /** All saved infractions (newest not guaranteed — UI sorts) */
  infractions: InfractionRecord[];
}

// ---------------------------------------------------------------------------
// Helpers (pure — safe to import from the page)
// ---------------------------------------------------------------------------

/** Normalize name for matching counts (trim + lower; not for display) */
export function normalizeClientKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Staff-facing label for Absent vs Late */
export function attendanceIssueLabel(issue?: AttendanceIssue): string {
  if (issue === "absent") return "Absent";
  if (issue === "late") return "Late";
  return "";
}

/**
 * Staff-facing type label.
 * For roll call / class: "Roll Call — Late", "Mandatory Class — Absent", etc.
 */
export function infractionTypeLabel(
  type: InfractionType,
  absenceType?: AbsenceType,
  attendanceIssue?: AttendanceIssue
): string {
  switch (type) {
    case "chore":
      return "Chore Infraction";
    case "roll_call_class": {
      const event =
        absenceType === "roll_call"
          ? "Roll Call"
          : absenceType === "mandatory_class"
            ? "Mandatory Class"
            : "Roll Call / Mandatory Class";
      const issue = attendanceIssueLabel(attendanceIssue);
      return issue ? `${event} — ${issue}` : event;
    }
    case "room_inspection":
      return "Room Inspection Failure";
    default:
      return type;
  }
}

/** Staff-facing status label (Administration, not "Admin") */
export function infractionStatusLabel(status: InfractionStatus): string {
  switch (status) {
    case "pending_signature":
      return "Pending Signature";
    case "complete":
      return "Complete";
    case "admin_review_needed":
      return "Administration Review Needed";
    default:
      return status;
  }
}

/**
 * How many saved infractions this client already has (combined across types).
 * Uses normalized name match until real clientId exists.
 */
export function countInfractionsForClient(
  infractions: InfractionRecord[],
  clientName: string
): number {
  const key = normalizeClientKey(clientName);
  if (!key) return 0;
  return infractions.filter(
    (row) => normalizeClientKey(row.clientName) === key
  ).length;
}

/** Threshold from house policy — flag only, never auto-discipline */
export const INFRACTION_THRESHOLD = 3;

/**
 * Status from combined count + signature completeness.
 * Threshold always wins (still flag-only — no auto-discipline).
 * Signatures never change the count.
 */
export function resolveInfractionStatus(
  combinedCount: number,
  bothSigned: boolean
): InfractionStatus {
  if (combinedCount >= INFRACTION_THRESHOLD) {
    return "admin_review_needed";
  }
  if (!bothSigned) {
    return "pending_signature";
  }
  return "complete";
}

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const initialState: FriendlyRemindersState = {
  infractions: [],
};

export const friendlyRemindersSlice = createSlice({
  name: "friendlyReminders",
  initialState,
  reducers: {
    /**
     * Save a new infraction into history.
     * Recomputes combined count for that client; if >= 3 → admin_review_needed.
     * Does NOT apply discipline automatically.
     */
    addInfraction: (state, action: PayloadAction<InfractionSubmitInput>) => {
      const input = action.payload;
      const name = input.clientName.trim();
      if (!name || !input.infractionType || !input.infractionDate) {
        // Guard: page should validate first; no-op if incomplete
        return;
      }

      const prior = countInfractionsForClient(state.infractions, name);
      const combinedCountAfter = prior + 1;

      const clientSignature = input.clientSignature ?? "";
      const staffSignature = input.staffSignature ?? "";
      const clientSignatureDate = input.clientSignatureDate ?? "";
      const staffSignatureDate = input.staffSignatureDate ?? "";
      // Both pads filled = fully signed (dates validated on the page)
      const bothSigned = Boolean(clientSignature && staffSignature);
      const status = resolveInfractionStatus(combinedCountAfter, bothSigned);

      const record: InfractionRecord = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        clientName: name,
        currentDate: input.currentDate,
        infractionType: input.infractionType,
        infractionDate: input.infractionDate,
        absenceType: input.absenceType ?? "",
        attendanceIssue: input.attendanceIssue ?? "",
        // Copy array so history keeps the multi-select choices
        roomIssues: [...(input.roomIssues ?? [])],
        reasonNotes: input.reasonNotes ?? "",
        status,
        combinedCountAfter,
        clientSignature,
        clientSignatureDate,
        staffSignature,
        staffSignatureDate,
        // FUTURE hooks — empty until photo UI / notify API
        photoAttachments: [...(input.photoAttachments ?? [])],
        clientNotifyStatus: "not_sent",
      };

      state.infractions.push(record);

      // When this client hits the threshold, flag EVERY row for that name and
      // refresh stored counts so history chips all say "3 of 3" (not only the newest).
      if (combinedCountAfter >= INFRACTION_THRESHOLD) {
        const key = normalizeClientKey(name);
        for (const row of state.infractions) {
          if (normalizeClientKey(row.clientName) === key) {
            row.combinedCountAfter = combinedCountAfter;
            row.status = "admin_review_needed";
          }
        }
      }
    },

    /**
     * Finish / replace signatures on an existing history row.
     * Does NOT create a new infraction and does NOT bump the combined count.
     * BACKEND TODO: PATCH /infractions/:id/signatures
     */
    updateInfractionSignatures: (
      state,
      action: PayloadAction<InfractionSignatureUpdateInput>
    ) => {
      const {
        id,
        clientSignature,
        clientSignatureDate,
        staffSignature,
        staffSignatureDate,
      } = action.payload;
      const row = state.infractions.find((r) => r.id === id);
      if (!row) return;

      row.clientSignature = clientSignature ?? "";
      row.clientSignatureDate = clientSignatureDate ?? "";
      row.staffSignature = staffSignature ?? "";
      row.staffSignatureDate = staffSignatureDate ?? "";

      const bothSigned = Boolean(row.clientSignature && row.staffSignature);
      // Live count for this client (includes this row)
      const combined = countInfractionsForClient(
        state.infractions,
        row.clientName
      );
      row.combinedCountAfter = combined;
      row.status = resolveInfractionStatus(combined, bothSigned);

      // Keep all rows for this client aligned when at threshold
      if (combined >= INFRACTION_THRESHOLD) {
        const key = normalizeClientKey(row.clientName);
        for (const r of state.infractions) {
          if (normalizeClientKey(r.clientName) === key) {
            r.combinedCountAfter = combined;
            r.status = "admin_review_needed";
          }
        }
      }
    },

    /**
     * FUTURE — queue notify-to-client (portal/email/SMS).
     * FE stub only: flips clientNotifyStatus so UI can show "queued".
     * BACKEND TODO: replace body with real API; do not mark sent until confirmed.
     */
    queueClientNotify: (state, action: PayloadAction<{ id: string }>) => {
      const row = state.infractions.find((r) => r.id === action.payload.id);
      if (!row) return;
      // Only allow queue from not_sent / failed for now
      if (row.clientNotifyStatus === "sent" || row.clientNotifyStatus === "queued") {
        return;
      }
      row.clientNotifyStatus = "queued";
    },

    /** Dev / staff cleanup of mock data (no backend yet) */
    clearAllInfractions: (state) => {
      state.infractions = [];
    },
  },
});

export const {
  addInfraction,
  updateInfractionSignatures,
  queueClientNotify,
  clearAllInfractions,
} = friendlyRemindersSlice.actions;

export default friendlyRemindersSlice.reducer;
