/**
 * Friendly Reminders / Client Infraction page
 *
 * ONE reusable infraction form with THREE types:
 * - Chore Infraction
 * - Roll Call / Mandatory Class Absence
 * - Room Inspection Failure
 *
 * Front-end only. History + combined 3-count live in Redux (memory until refresh).
 *
 * Progress:
 * - Steps 1–7: route, fields, mock save/history/count, notice, SignatureCanvas
 * - Resume from history: click a row → finish client / staff signatures (no new count)
 * - Still later: layout polish (8), PDF
 *
 * ---------------------------------------------------------------------------
 * BACKEND TODO / FUTURE INTEGRATION (do not remove — guides BE + later FE):
 * - API persist + clientId picker (count by id, not free-text name)
 * - SEND TO CLIENT: deliver completed Friendly Reminder (portal / email / SMS).
 *   Slice has clientNotifyStatus + queueClientNotify stub; wire real API later.
 * - ROOM INSPECTION PHOTOS: camera/file capture → photoAttachments[] on the
 *   record (dataUrl mock now; upload URLs when storage exists). UI not built yet.
 * - PDF print of notice + signatures + photos
 * - PATCH signatures = updateInfractionSignatures (already FE-ready)
 * ---------------------------------------------------------------------------
 */

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  TextField,
  MenuItem,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import SignatureCanvas from "@/components/SignatureCanvas";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addInfraction,
  clearAllInfractions,
  countInfractionsForClient,
  formatRoomIssues,
  infractionStatusLabel,
  infractionTypeLabel,
  INFRACTION_THRESHOLD,
  normalizeClientKey,
  queueClientNotify,
  ROOM_ISSUE_OPTIONS,
  updateInfractionSignatures,
  type AbsenceType,
  type AttendanceIssue,
  type InfractionRecord,
  type InfractionType,
  type RoomIssueCode,
} from "@/store/slices/prototype/friendlyReminders";

// ---------------------------------------------------------------------------
// Local draft form (unsaved) — shapes match slice submit payload
// ---------------------------------------------------------------------------

/** Draft allows empty type until staff picks */
type DraftInfractionType = "" | InfractionType;

interface InfractionForm {
  clientName: string;
  /** YYYY-MM-DD — day the form was opened (auto) */
  currentDate: string;
  infractionType: DraftInfractionType;
  /** YYYY-MM-DD — day the issue happened */
  infractionDate: string;
  /** Roll Call vs Mandatory Class */
  absenceType: AbsenceType;
  /** Absent vs Late (roll call / class only) */
  attendanceIssue: AttendanceIssue;
  /** Multi-select room failure reasons (room_inspection only) */
  roomIssues: RoomIssueCode[];
  reasonNotes: string;
  /** Raw base64 PNG from SignatureCanvas (no data: prefix) */
  clientSignature: string;
  /** YYYY-MM-DD — type="date" like UA */
  clientSignatureDate: string;
  /** Staff / Facility Director — raw base64 PNG */
  staffSignature: string;
  /** YYYY-MM-DD — type="date" */
  staffSignatureDate: string;
}

/** Today's date as YYYY-MM-DD for type="date" inputs */
function todayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Soft title-case for person names while typing.
 * - Uppercases first letter and after space / hyphen / apostrophe
 * - Does NOT force the rest lowercase (McGalliard, O'Brien stay correct)
 */
function toTitleCase(value: string): string {
  if (!value) return value;
  return value.replace(
    /(^|[\s'-])([a-zA-Z])/g,
    (_match, sep: string, ch: string) => sep + ch.toUpperCase()
  );
}

/** Fresh blank form every time staff starts or cancels */
function createInitialForm(): InfractionForm {
  return {
    clientName: "",
    currentDate: todayDateString(),
    infractionType: "",
    infractionDate: "",
    absenceType: "",
    attendanceIssue: "",
    roomIssues: [],
    reasonNotes: "",
    clientSignature: "",
    clientSignatureDate: "",
    staffSignature: "",
    staffSignatureDate: "",
  };
}

const INFRACTION_TYPE_OPTIONS: { value: InfractionType; label: string }[] = [
  { value: "chore", label: "Chore Infraction" },
  {
    value: "roll_call_class",
    label: "Roll Call / Mandatory Class (Absent or Late)",
  },
  { value: "room_inspection", label: "Room Inspection Failure" },
];

/** Which event — Roll Call vs Mandatory Class */
const ABSENCE_TYPE_OPTIONS: { value: AbsenceType; label: string }[] = [
  { value: "roll_call", label: "Roll Call" },
  { value: "mandatory_class", label: "Mandatory Class" },
];

/** How they missed it — Absent vs Late */
const ATTENDANCE_ISSUE_OPTIONS: { value: AttendanceIssue; label: string }[] = [
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
];

/** Pretty YYYY-MM-DD → local short date for list rows */
function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return "—";
  // Parse as local calendar day (avoid UTC shift)
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Shared 3-strike closer — flag only, no auto-discipline */
const THREE_STRIKE_CLOSER =
  "Receiving three total infractions may result in being placed back on the new-client orientation period or other disciplinary action. Any decision is made by staff or Administration after review — this notice does not apply discipline by itself.";

/**
 * Build Friendly Reminder notice copy from the current draft.
 * Returns null until staff picks an infraction type.
 * Roll call / class: full absence OR late/tardy (both count 1 toward 3).
 */
function buildFriendlyReminderNotice(form: InfractionForm): {
  title: string;
  paragraphs: string[];
} | null {
  if (!form.infractionType) return null;

  const paragraphs: string[] = [];

  if (form.infractionType === "chore") {
    paragraphs.push(
      "Completing assigned chores is part of the NHD/Hope House Guthrie guidelines."
    );
    paragraphs.push(
      "Reason: The client failed to complete their assigned chore."
    );
    if (form.reasonNotes.trim()) {
      paragraphs.push(`Notes: ${form.reasonNotes.trim()}`);
    }
  }

  if (form.infractionType === "roll_call_class") {
    paragraphs.push(
      "Attendance and punctuality are responsibilities of each client at NHD/Hope House Guthrie."
    );

    const eventLabel =
      form.absenceType === "roll_call"
        ? "Roll Call"
        : form.absenceType === "mandatory_class"
          ? "Mandatory Class"
          : "Roll Call or a Mandatory Class";

    // attendanceIssue: full absence OR late/tardy
    if (form.attendanceIssue === "late") {
      paragraphs.push(
        `Reason: The client was late (tardy) to required ${eventLabel}.`
      );
    } else if (form.attendanceIssue === "absent") {
      paragraphs.push(
        `Reason: The client was absent from required ${eventLabel}.`
      );
    } else {
      paragraphs.push(
        `Reason: The client was absent from or late to required ${eventLabel}.`
      );
    }

    if (form.reasonNotes.trim()) {
      paragraphs.push(`Notes: ${form.reasonNotes.trim()}`);
    }
  }

  if (form.infractionType === "room_inspection") {
    paragraphs.push(
      "Keeping the client's room orderly and clean is the client's responsibility."
    );
    paragraphs.push(
      "Reason: The client failed their room inspection or failed to keep their assigned room clean and orderly."
    );

    const issues = formatRoomIssues(form.roomIssues, form.reasonNotes);
    if (issues) {
      paragraphs.push(`Issues found: ${issues}.`);
    } else if (form.reasonNotes.trim()) {
      paragraphs.push(`Notes: ${form.reasonNotes.trim()}`);
    }
  }

  paragraphs.push(THREE_STRIKE_CLOSER);
  return { title: "Friendly Reminder", paragraphs };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FriendlyRemindersPage() {
  const dispatch = useAppDispatch();
  const infractions = useAppSelector(
    (state) => state.friendlyReminders.infractions
  );

  // false = landing + history; true = form open
  const [isCreating, setIsCreating] = useState(false);
  /**
   * When set, form is "finish / update signatures" for that history id.
   * Does not create a new infraction or bump the combined count.
   */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<InfractionForm>(createInitialForm);
  /** Inline validation messages under Save */
  const [formErrors, setFormErrors] = useState<string[]>([]);
  /** Optional filter on history list (by client name substring) */
  const [historyFilter, setHistoryFilter] = useState("");
  /** Flash message after a successful save */
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  /**
   * Bump when opening/closing the form so SignatureCanvas remounts clean
   * (component keeps its own drawing state).
   */
  const [signaturePadKey, setSignaturePadKey] = useState(0);

  const isEditingExisting = editingId !== null;

  /** Open a brand-new form (clears any previous draft) */
  const handleStartNew = () => {
    setEditingId(null);
    setForm(createInitialForm());
    setFormErrors([]);
    setSaveNotice(null);
    setSignaturePadKey((k) => k + 1);
    setIsCreating(true);
  };

  /** Close form and wipe draft so next open is clean */
  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setForm(createInitialForm());
    setFormErrors([]);
    setSignaturePadKey((k) => k + 1);
  };

  /**
   * Open an existing history row so Administration / staff can finish signatures.
   * Identity + type fields stay locked (count already applied on first save).
   */
  const handleOpenFromHistory = (row: InfractionRecord) => {
    setEditingId(row.id);
    setForm({
      clientName: row.clientName,
      currentDate: row.currentDate,
      infractionType: row.infractionType,
      infractionDate: row.infractionDate,
      absenceType: row.absenceType,
      attendanceIssue: row.attendanceIssue,
      roomIssues: [...(row.roomIssues ?? [])],
      reasonNotes: row.reasonNotes ?? "",
      clientSignature: row.clientSignature ?? "",
      clientSignatureDate: row.clientSignatureDate ?? "",
      staffSignature: row.staffSignature ?? "",
      staffSignatureDate: row.staffSignatureDate ?? "",
    });
    setFormErrors([]);
    setSaveNotice(null);
    setSignaturePadKey((k) => k + 1);
    setIsCreating(true);
  };

  /**
   * Live combined count for the name currently typed on the form.
   * When creating: already-saved count (before this save).
   * When editing: includes this row (count does not change on signature save).
   */
  const existingCountForDraftClient = useMemo(
    () => countInfractionsForClient(infractions, form.clientName),
    [infractions, form.clientName]
  );

  /** After a NEW save, count would be existing + 1; editing keeps current total */
  const projectedCount = !form.clientName.trim()
    ? 0
    : isEditingExisting
      ? existingCountForDraftClient
      : existingCountForDraftClient + 1;

  /** Live notice copy for the open draft (null until type picked) */
  const friendlyNotice = useMemo(
    () => buildFriendlyReminderNotice(form),
    [form]
  );

  /** Newest first history; optional name filter */
  const historyRows = useMemo(() => {
    const q = historyFilter.trim().toLowerCase();
    const rows = [...infractions].sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : -1
    );
    if (!q) return rows;
    return rows.filter((r) => r.clientName.toLowerCase().includes(q));
  }, [infractions, historyFilter]);

  /** Clients currently at/over threshold (for landing banner) */
  const clientsNeedingReview = useMemo(() => {
    // Same key rules as the counter (trim + lower + collapse spaces)
    const map = new Map<string, { display: string; count: number }>();
    for (const row of infractions) {
      const key = normalizeClientKey(row.clientName);
      if (!key) continue;
      const prev = map.get(key);
      const count = (prev?.count ?? 0) + 1;
      // Keep the first display spelling we saw for the chip label
      map.set(key, {
        display: prev?.display ?? row.clientName.trim(),
        count,
      });
    }
    return [...map.values()]
      .filter((c) => c.count >= INFRACTION_THRESHOLD)
      .sort((a, b) => b.count - a.count);
  }, [infractions]);

  /**
   * Live combined totals by client key — history chips use this so older rows
   * update to "3 of 3" after the third save (not frozen at save-time 1/2).
   */
  const liveCountByClientKey = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of infractions) {
      const key = normalizeClientKey(row.clientName);
      if (!key) continue;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [infractions]);
  /** Validate + push into Redux history (new) or update signatures only (edit) */
  const handleSave = () => {
    const errors: string[] = [];
    if (!form.clientName.trim()) errors.push("Client Name is required.");
    if (!form.infractionType) errors.push("Infraction Type is required.");
    if (!form.infractionDate) errors.push("Date of Infraction is required.");
    if (form.infractionType === "roll_call_class") {
      if (!form.absenceType) {
        errors.push("Select Roll Call or Mandatory Class.");
      }
      if (!form.attendanceIssue) {
        errors.push("Select Absent or Late.");
      }
    }
    if (form.infractionType === "room_inspection") {
      if (form.roomIssues.length === 0) {
        errors.push("Select at least one room inspection issue.");
      }
      // "Other" needs a typed description so history is clear
      if (
        form.roomIssues.includes("other") &&
        !form.reasonNotes.trim()
      ) {
        errors.push('Describe "Other" in the notes box.');
      }
    }

    // Signatures optional on Save → pending_signature in slice if missing.
    // If a pad is filled, its date is required (same idea as UA).
    if (form.clientSignature && !form.clientSignatureDate) {
      errors.push("Client signature date is required once the client has signed.");
    }
    if (form.staffSignature && !form.staffSignatureDate) {
      errors.push(
        "Staff / Facility Director signature date is required once staff has signed."
      );
    }

    if (errors.length) {
      setFormErrors(errors);
      return;
    }

    const bothSigned = Boolean(form.clientSignature && form.staffSignature);

    // ----- Resume mode: signatures only (no new count) -----
    if (editingId) {
      dispatch(
        updateInfractionSignatures({
          id: editingId,
          clientSignature: form.clientSignature,
          clientSignatureDate: form.clientSignatureDate,
          staffSignature: form.staffSignature,
          staffSignatureDate: form.staffSignatureDate,
        })
      );

      const total = existingCountForDraftClient;
      if (total >= INFRACTION_THRESHOLD) {
        setSaveNotice(
          `Signatures updated. Combined total remains ${total} of ${INFRACTION_THRESHOLD} — Administration Review Needed (flag only).`
        );
      } else if (!bothSigned) {
        setSaveNotice(
          `Signatures updated — still Pending Signature. Combined total: ${total} of ${INFRACTION_THRESHOLD}.`
        );
      } else {
        setSaveNotice(
          `Signatures saved. Status Complete. Combined total: ${total} of ${INFRACTION_THRESHOLD}.`
        );
      }

      setFormErrors([]);
      setIsCreating(false);
      setEditingId(null);
      setForm(createInitialForm());
      setSignaturePadKey((k) => k + 1);
      return;
    }

    // ----- New infraction -----
    const infractionType = form.infractionType as InfractionType;

    dispatch(
      addInfraction({
        clientName: form.clientName.trim(),
        currentDate: form.currentDate,
        infractionType,
        infractionDate: form.infractionDate,
        absenceType: form.absenceType,
        attendanceIssue: form.attendanceIssue,
        roomIssues: form.roomIssues,
        reasonNotes: form.reasonNotes,
        clientSignature: form.clientSignature,
        clientSignatureDate: form.clientSignatureDate,
        staffSignature: form.staffSignature,
        staffSignatureDate: form.staffSignatureDate,
      })
    );

    const after = existingCountForDraftClient + 1;
    if (after >= INFRACTION_THRESHOLD) {
      setSaveNotice(
        `Saved. Combined total is now ${after} of ${INFRACTION_THRESHOLD} — Administration Review Needed (flag only; no auto-discipline).`
      );
    } else if (!bothSigned) {
      setSaveNotice(
        `Saved as Pending Signature. Combined total for this client: ${after} of ${INFRACTION_THRESHOLD}. Click the history row anytime to finish signatures.`
      );
    } else {
      setSaveNotice(
        `Saved. Combined total for this client: ${after} of ${INFRACTION_THRESHOLD}.`
      );
    }

    setFormErrors([]);
    setIsCreating(false);
    setEditingId(null);
    setForm(createInitialForm());
    setSignaturePadKey((k) => k + 1);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Page header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ mb: 0.5 }}>
            Friendly Reminders
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Client Infraction / Friendly Reminder forms — one combined count
            across all types
          </Typography>
        </Box>

        {!isCreating && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleStartNew}
          >
            New Infraction
          </Button>
        )}
      </Box>

      {/* Flash after save */}
      {saveNotice && !isCreating && (
        <Alert
          severity={
            saveNotice.includes("Administration Review") ? "warning" : "success"
          }
          onClose={() => setSaveNotice(null)}
          sx={{ mb: 2 }}
        >
          {saveNotice}
        </Alert>
      )}

      {/* Threshold banner — any client at 3+ */}
      {!isCreating && clientsNeedingReview.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            ⚠ {INFRACTION_THRESHOLD} Infractions Reached — Administration Review
            Needed
          </Typography>
          <Typography variant="body2" component="div">
            Flag only — staff decide discipline. Do not auto-place on
            orientation. Count is combined across chore + roll call/class + room
            for the same client name.
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
            {clientsNeedingReview.map((c) => (
              <Chip
                key={c.display}
                color="warning"
                label={`${c.display}: ${c.count} of ${INFRACTION_THRESHOLD}`}
                size="small"
              />
            ))}
          </Box>
        </Alert>
      )}

      {/* Tip when staff saved 3+ rows but used different names (common test miss) */}
      {!isCreating &&
        infractions.length >= INFRACTION_THRESHOLD &&
        clientsNeedingReview.length === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              No client is at {INFRACTION_THRESHOLD} yet
            </Typography>
            <Typography variant="body2">
              You have {infractions.length} saved reminder(s), but the combined
              count only stacks when the <strong>Client Name matches</strong>{" "}
              (chore + room + roll call can mix). Use the same name on each test
              (e.g. all three as &quot;Test Client&quot;) to see Administration
              Review Needed.
            </Typography>
          </Alert>
        )}

      {/* ---------- Landing: history list ---------- */}
      {!isCreating && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                No form open. Click <strong>+ New Infraction</strong> to start a
                Friendly Reminder, or click a history row to finish signatures.
                Saves stay in this browser session only (Redux mock — refresh
                clears).
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 1,
                  mb: 2,
                }}
              >
                <Typography variant="h6">Infraction History</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip
                    size="small"
                    label={`${infractions.length} total`}
                    variant="outlined"
                  />
                  {infractions.length > 0 && (
                    <Button
                      size="small"
                      color="inherit"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Clear all mock infraction history in this session?"
                          )
                        ) {
                          dispatch(clearAllInfractions());
                          setSaveNotice(null);
                        }
                      }}
                    >
                      Clear mock data
                    </Button>
                  )}
                </Box>
              </Box>

              <TextField
                fullWidth
                size="small"
                label="Filter by client name"
                placeholder="Type to filter…"
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
                sx={{ mb: 2 }}
              />

              {historyRows.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {infractions.length === 0
                    ? "No infractions saved yet."
                    : "No rows match this filter."}
                </Typography>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {historyRows.map((row, index) => (
                    <Box key={row.id}>
                      {index > 0 && <Divider sx={{ mb: 1.5 }} />}
                      <HistoryRow
                        row={row}
                        liveCombinedCount={
                          liveCountByClientKey.get(
                            normalizeClientKey(row.clientName)
                          ) ?? row.combinedCountAfter
                        }
                        onOpen={() => handleOpenFromHistory(row)}
                        onQueueNotify={() => {
                          // FUTURE: real send-to-client API
                          dispatch(queueClientNotify({ id: row.id }));
                          setSaveNotice(
                            `Notify queued for ${row.clientName} (FE stub only — no message sent until backend).`
                          );
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* ---------- Form ---------- */}
      {isCreating && (
        <Card>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1,
                mb: 2,
              }}
            >
              <Typography variant="h6">
                {isEditingExisting
                  ? "Finish signatures / review"
                  : "New Infraction"}
              </Typography>
              <Button variant="outlined" color="inherit" onClick={handleCancel}>
                Cancel
              </Button>
            </Box>

            {isEditingExisting && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Opened from history. Type, client, and details are locked so the
                combined count does not change. Add or update signatures below,
                then save. Administration can sign here without creating a new
                infraction.
              </Alert>
            )}

            {/* Live counter for the typed client name */}
            {form.clientName.trim() !== "" && (
              <Alert
                severity={
                  (isEditingExisting
                    ? existingCountForDraftClient
                    : existingCountForDraftClient) >= INFRACTION_THRESHOLD
                    ? "warning"
                    : !isEditingExisting &&
                        existingCountForDraftClient === INFRACTION_THRESHOLD - 1
                      ? "info"
                      : "success"
                }
                sx={{ mb: 2 }}
              >
                <strong>
                  Infractions:{" "}
                  {isEditingExisting
                    ? existingCountForDraftClient
                    : existingCountForDraftClient}{" "}
                  of {INFRACTION_THRESHOLD}
                </strong>
                {isEditingExisting ? (
                  <> already on file for {form.clientName.trim()} (editing — count unchanged)</>
                ) : (
                  <>
                    {" already on file for "}
                    {form.clientName.trim()}
                    {projectedCount > 0 && (
                      <>
                        {" "}
                        · After this save:{" "}
                        <strong>
                          {projectedCount} of {INFRACTION_THRESHOLD}
                        </strong>
                        {projectedCount >= INFRACTION_THRESHOLD
                          ? " → will flag Administration Review Needed"
                          : null}
                      </>
                    )}
                  </>
                )}
              </Alert>
            )}

            {/* Infraction type */}
            <TextField
              select
              required
              fullWidth
              label="Infraction Type"
              value={form.infractionType}
              disabled={isEditingExisting}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  infractionType: e.target.value as DraftInfractionType,
                  // Clear type-only fields so they can't stick on another type
                  absenceType: "",
                  attendanceIssue: "",
                  roomIssues: [],
                  reasonNotes: "",
                }))
              }
              sx={{ mb: 2 }}
            >
              <MenuItem value="">
                <em>Select type…</em>
              </MenuItem>
              {INFRACTION_TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>

            {/* Common fields */}
            <TextField
              required
              fullWidth
              label="Client Name"
              placeholder="First Last"
              value={form.clientName}
              disabled={isEditingExisting}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  clientName: toTitleCase(e.target.value),
                }))
              }
              helperText="Count is combined across chore / roll call·class / room (same name)."
              sx={{ mb: 2 }}
            />

            <TextField
              required
              fullWidth
              type="date"
              label="Current Date"
              value={form.currentDate}
              disabled={isEditingExisting}
              slotProps={{
                input: { readOnly: true },
                inputLabel: { shrink: true },
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              required
              fullWidth
              type="date"
              label="Date of Infraction"
              value={form.infractionDate}
              disabled={isEditingExisting}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  infractionDate: e.target.value,
                }))
              }
              slotProps={{
                inputLabel: { shrink: true },
              }}
              sx={{ mb: 2 }}
            />

            {/* Type-specific */}
            {form.infractionType === "chore" && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Chore Infraction details
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1.5 }}
                >
                  Reason: The client failed to complete their assigned chore.
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Additional notes (optional)"
                  placeholder="e.g. which chore, what was observed"
                  value={form.reasonNotes}
                  disabled={isEditingExisting}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      reasonNotes: e.target.value,
                    }))
                  }
                />
              </Box>
            )}

            {form.infractionType === "roll_call_class" && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Roll Call / Mandatory Class details
                </Typography>

                {/* Which event */}
                <TextField
                  select
                  required
                  fullWidth
                  label="Event"
                  value={form.absenceType}
                  disabled={isEditingExisting}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      absenceType: e.target.value as AbsenceType,
                    }))
                  }
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="">
                    <em>Select Roll Call or Mandatory Class…</em>
                  </MenuItem>
                  {ABSENCE_TYPE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Absent vs Late — required for both events */}
                <TextField
                  select
                  required
                  fullWidth
                  label="Absent or Late"
                  value={form.attendanceIssue}
                  disabled={isEditingExisting}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      attendanceIssue: e.target.value as AttendanceIssue,
                    }))
                  }
                  helperText="Both Absent and Late count toward the combined 3-infraction total."
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="">
                    <em>Select Absent or Late…</em>
                  </MenuItem>
                  {ATTENDANCE_ISSUE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1.5 }}
                >
                  Reason:{" "}
                  {form.attendanceIssue === "late"
                    ? "The client was late to required Roll Call or a Mandatory Class."
                    : form.attendanceIssue === "absent"
                      ? "The client was absent from required Roll Call or a Mandatory Class."
                      : "The client was absent from or late to required Roll Call or a Mandatory Class."}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Additional notes (optional)"
                  placeholder="e.g. class name, how late, what was observed"
                  value={form.reasonNotes}
                  disabled={isEditingExisting}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      reasonNotes: e.target.value,
                    }))
                  }
                />
              </Box>
            )}

            {form.infractionType === "room_inspection" && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Room Inspection details
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1.5 }}
                >
                  Reason: The client failed their room inspection or failed to
                  keep their assigned room clean and orderly. Select all that
                  apply.
                </Typography>

                {/* Multi-select failure reasons */}
                <FormControl
                  component="fieldset"
                  variant="standard"
                  required
                  disabled={isEditingExisting}
                  sx={{ mb: 2, width: "100%" }}
                >
                  <FormLabel component="legend">Issues found</FormLabel>
                  <FormGroup>
                    {ROOM_ISSUE_OPTIONS.map((opt) => {
                      const checked = form.roomIssues.includes(opt.value);
                      return (
                        <FormControlLabel
                          key={opt.value}
                          control={
                            <Checkbox
                              checked={checked}
                              disabled={isEditingExisting}
                              onChange={(e) => {
                                const on = e.target.checked;
                                setForm((prev) => {
                                  const next = on
                                    ? prev.roomIssues.includes(opt.value)
                                      ? prev.roomIssues
                                      : [...prev.roomIssues, opt.value]
                                    : prev.roomIssues.filter(
                                        (c) => c !== opt.value
                                      );
                                  return { ...prev, roomIssues: next };
                                });
                              }}
                            />
                          }
                          label={opt.label}
                        />
                      );
                    })}
                  </FormGroup>
                  <FormHelperText>
                    Check every issue observed on this inspection.
                  </FormHelperText>
                </FormControl>

                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  required={form.roomIssues.includes("other")}
                  disabled={isEditingExisting}
                  label={
                    form.roomIssues.includes("other")
                      ? "Notes / describe Other (required)"
                      : "Additional notes (optional)"
                  }
                  placeholder={
                    form.roomIssues.includes("other")
                      ? "Describe the other issue…"
                      : "e.g. location in room, severity"
                  }
                  value={form.reasonNotes}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      reasonNotes: e.target.value,
                    }))
                  }
                />

                {/*
                  FUTURE — Room inspection photos (not built yet)
                  - input type=file accept="image/*" capture="environment"
                  - push into form.photoAttachments / record.photoAttachments
                  - BE: multipart upload → store URL on InfractionPhotoAttachment
                  - Keep FE base64 only for local mock; do not ship large base64 to API long-term
                */}
                {!isEditingExisting && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    component="p"
                    sx={{ mt: 1.5 }}
                  >
                    Photo attach from tablet camera is planned (not wired yet).
                    Record shape already has photoAttachments for backend.
                  </Typography>
                )}
              </Box>
            )}

            {/* Friendly Reminder notice - wording follows type / event / absent|late */}
            {friendlyNotice && (
              <Card
                variant="outlined"
                sx={{ mb: 2, bgcolor: "action.hover" }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {friendlyNotice.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1.5 }}
                  >
                    NHD / Hope House Guthrie
                    {form.clientName.trim()
                      ? ` - ${form.clientName.trim()}`
                      : ""}
                    {form.infractionDate
                      ? ` - Infraction date: ${formatDisplayDate(form.infractionDate)}`
                      : ""}
                  </Typography>
                  {friendlyNotice.paragraphs.map((p, i) => (
                    <Typography
                      key={i}
                      variant="body1"
                      sx={{ mb: 1.25 }}
                    >
                      {p}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* ---------------------------------------------------------------
                Signatures — same SignatureCanvas as UA form
                - Client pad + date
                - Staff / Facility Director (Administration) pad + date
                - Save allowed without signatures → Pending Signature status
                - Open history row anytime to finish / replace signatures
                --------------------------------------------------------------- */}
            <Typography variant="h6" sx={{ mt: 1, mb: 1.5 }}>
              Signatures
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Use a finger or stylus on a tablet. Save without signatures keeps
              Pending Signature — click the history row later for Administration
              or staff to sign. Reaching 3 combined infractions still flags
              Administration Review Needed only (signatures do not change the
              count). Existing ink shows as preview; draw again to replace.
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
                mb: 2,
              }}
            >
              {/* Client signature (UA pattern) */}
              <Card variant="outlined" sx={{ flex: 1, minWidth: 0 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Client Signature
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Please sign using your finger or stylus on this tablet screen.
                  </Typography>
                  <SignatureCanvas
                    key={`client-sig-${signaturePadKey}`}
                    height={150}
                    onSignatureChange={(base64) =>
                      setForm((prev) => ({
                        ...prev,
                        clientSignature: base64,
                        // Auto-fill date on first stroke; clear date if pad cleared
                        clientSignatureDate: base64
                          ? prev.clientSignatureDate || todayDateString()
                          : "",
                      }))
                    }
                  />
                  <TextField
                    fullWidth
                    type="date"
                    label="Client signature date"
                    value={form.clientSignatureDate}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        clientSignatureDate: e.target.value,
                      }))
                    }
                    disabled={!form.clientSignature}
                    required={Boolean(form.clientSignature)}
                    slotProps={{
                      inputLabel: { shrink: true },
                    }}
                    sx={{ mt: 1 }}
                  />
                  {form.clientSignature && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Preview
                      </Typography>
                      <Box
                        component="img"
                        src={`data:image/png;base64,${form.clientSignature}`}
                        alt="Client signature preview"
                        sx={{
                          display: "block",
                          maxWidth: 220,
                          border: "1px solid",
                          borderColor: "divider",
                          p: 0.5,
                          mt: 0.5,
                          bgcolor: "common.white",
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Staff / Facility Director (spec wording; same canvas) */}
              <Card variant="outlined" sx={{ flex: 1, minWidth: 0 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Staff / Facility Director Signature
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Staff may sign now or leave blank and finish later (Pending
                    Signature).
                  </Typography>
                  <SignatureCanvas
                    key={`staff-sig-${signaturePadKey}`}
                    height={150}
                    onSignatureChange={(base64) =>
                      setForm((prev) => ({
                        ...prev,
                        staffSignature: base64,
                        staffSignatureDate: base64
                          ? prev.staffSignatureDate || todayDateString()
                          : "",
                      }))
                    }
                  />
                  <TextField
                    fullWidth
                    type="date"
                    label="Staff signature date"
                    value={form.staffSignatureDate}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        staffSignatureDate: e.target.value,
                      }))
                    }
                    disabled={!form.staffSignature}
                    required={Boolean(form.staffSignature)}
                    slotProps={{
                      inputLabel: { shrink: true },
                    }}
                    sx={{ mt: 1 }}
                  />
                  {form.staffSignature && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Preview
                      </Typography>
                      <Box
                        component="img"
                        src={`data:image/png;base64,${form.staffSignature}`}
                        alt="Staff signature preview"
                        sx={{
                          display: "block",
                          maxWidth: 220,
                          border: "1px solid",
                          borderColor: "divider",
                          p: 0.5,
                          mt: 0.5,
                          bgcolor: "common.white",
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>

            {formErrors.length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formErrors.map((msg) => (
                  <div key={msg}>{msg}</div>
                ))}
              </Alert>
            )}

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Button variant="contained" onClick={handleSave}>
                {isEditingExisting
                  ? "Save signatures"
                  : "Save Infraction"}
              </Button>
              <Button variant="outlined" color="inherit" onClick={handleCancel}>
                Cancel
              </Button>
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              component="p"
              sx={{ mt: 1.5 }}
            >
              Mock save only (this browser session). Photos, send-to-client, PDF,
              and layout polish are scaffolded for backend later.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// History row (presentational)
// ---------------------------------------------------------------------------

function HistoryRow({
  row,
  liveCombinedCount,
  onOpen,
  onQueueNotify,
}: {
  row: InfractionRecord;
  /** Current total for this client name (all types) — updates as more are saved */
  liveCombinedCount: number;
  /** Open form to finish / review signatures (no new count) */
  onOpen: () => void;
  /**
   * FUTURE send-to-client stub — queues notify status only.
   * BACKEND TODO: replace with real delivery API.
   */
  onQueueNotify: () => void;
}) {
  const atThreshold = liveCombinedCount >= INFRACTION_THRESHOLD;
  const bothSigned = Boolean(row.clientSignature && row.staffSignature);
  const anySigned = Boolean(row.clientSignature || row.staffSignature);
  // Prefer live threshold flag so older rows flip when the client hits 3
  const displayStatus = atThreshold
    ? "admin_review_needed"
    : row.status === "admin_review_needed"
      ? // stale flag if count somehow dropped (should not happen in mock)
        row.status
      : row.status;

  const notifyLabel =
    row.clientNotifyStatus === "queued"
      ? "Notify queued"
      : row.clientNotifyStatus === "sent"
        ? "Sent to client"
        : row.clientNotifyStatus === "failed"
          ? "Notify failed"
          : "Notify client (stub)";

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 1,
        alignItems: "flex-start",
        justifyContent: "space-between",
        py: 0.5,
        // Soft highlight when this client is at the threshold
        ...(atThreshold
          ? {
              bgcolor: "warning.main",
              backgroundColor: "rgba(237, 108, 2, 0.08)",
              borderRadius: 1,
              px: 1,
            }
          : {}),
      }}
    >
      <Box sx={{ minWidth: 0, flex: "1 1 220px" }}>
        <Typography variant="subtitle2">
          {formatDisplayDate(row.infractionDate)} —{" "}
          {infractionTypeLabel(
            row.infractionType,
            row.absenceType,
            row.attendanceIssue
          )}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {row.clientName}
          {row.infractionType === "room_inspection" &&
          row.roomIssues?.length
            ? ` · ${formatRoomIssues(row.roomIssues, row.reasonNotes)}`
            : row.reasonNotes
              ? ` · ${row.reasonNotes}`
              : null}
        </Typography>
        <Typography variant="caption" color="text.secondary" component="p">
          Click Open to finish client or Administration / staff signatures
          {row.photoAttachments?.length
            ? ` · ${row.photoAttachments.length} photo(s)`
            : ""}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <Chip
          size="small"
          label={`${liveCombinedCount} of ${INFRACTION_THRESHOLD}`}
          color={atThreshold ? "warning" : "default"}
          variant={atThreshold ? "filled" : "outlined"}
        />
        <Chip
          size="small"
          label={
            bothSigned
              ? "Signed"
              : anySigned
                ? "Partially signed"
                : "No signatures"
          }
          variant="outlined"
          color={bothSigned ? "success" : "default"}
        />
        <Chip
          size="small"
          label={infractionStatusLabel(displayStatus)}
          color={
            displayStatus === "admin_review_needed"
              ? "warning"
              : displayStatus === "complete"
                ? "success"
                : "default"
          }
          variant="outlined"
        />
        <Button size="small" variant="contained" onClick={onOpen}>
          {bothSigned ? "Open / re-sign" : "Open to sign"}
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          onClick={onQueueNotify}
          disabled={
            row.clientNotifyStatus === "queued" ||
            row.clientNotifyStatus === "sent"
          }
        >
          {notifyLabel}
        </Button>
      </Box>
    </Box>
  );
}
