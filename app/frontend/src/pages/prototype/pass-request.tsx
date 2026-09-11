/**
* PassRequestsPage - Manage pass requests for residents.
*
* Workflow (house):
* - Client (later: their login): fill form → Submit. No client signature on Pass.
* - Administration: open pending → see full details → signature + date →
*   Approve or Deny → result back to client (notify later).
*
* Phase 1 (this FE work): review panel + Administration sign + decide.
* Still mock Redux until backend.
*
* ---------------------------------------------------------------------------
* BACKEND TODO / FUTURE INTEGRATION:
* - POST pass on client submit; PATCH /pass-requests/:id/decide (sig + decision)
* - Role gate: client submit only; Administration review/decide only
* - Notify Administration on new submit; notify client on approve/deny
* - Real auth decidedByName on decidePassRequest
* ---------------------------------------------------------------------------
*
* Data flow: passRequest.ts store => this page selects requests => form + lists
*/

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  Checkbox,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import SignatureCanvas from "@/components/SignatureCanvas";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addPassRequest,
  decidePassRequest,
  queueClientPassNotify,
  updatePassRequest,
} from "@/store/slices/prototype/passRequest";
import type { PassRequest, PassType } from "@/store/slices/prototype/passRequest";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PassRequestsPage() {
  // --- State ---
  const dispatch = useAppDispatch();
  const requests = useAppSelector((state) => state.passRequest.requests);

  // Edit mode tracking
  const [editingPendingId, setEditingPendingId] = useState<string | null>(null);

  /**
  * Administration review mode: id of pending pass being reviewed.
  * null = not reviewing. Separate from editingPendingId (fix edit).
  * FUTURE: only Administration role can set this.
  */
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  /** Live row for the open review (pending only) */
  const reviewingRequest = reviewingId
    ? requests.find((r) => r.id === reviewingId) ?? null
    : null;

  // Form state
  const [residentName, setResidentName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [clientName, setClientName] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [passDateStart, setPassDateStart] = useState("");
  const [passDateEnd, setPassDateEnd] = useState("");
  const [canPassUA, setCanPassUA] = useState<"yes" | "no" | "idk">("idk");
  const [choreCovered, setChoreCovered] = useState(false);
  const [choreCoveredBy, setChoreCoveredBy] = useState("");
  const [onPremises, setOnPremises] = useState(false);
  const [offPremises, setOffPremises] = useState(false);
  const [passDuration, setPassDuration] = useState<"12h" | "24h" | "48h">("24h");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  /** Administration signature pad state (review mode only) */
  const [adminSignature, setAdminSignature] = useState("");
  const [adminSignatureDate, setAdminSignatureDate] = useState("");
  /** Remount SignatureCanvas when opening a different review */
  const [reviewSigKey, setReviewSigKey] = useState(0);
  /** Deny reason while in Administration review panel */
  const [reviewDenyComment, setReviewDenyComment] = useState("");
  /** Flash after decide / notify stub */
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  /** Decision errors shown on the review card */
  const [reviewErrors, setReviewErrors] = useState<string[]>([]);

  // --- Auto-fill End Date based on Start + Duration ---
  useEffect(() => {
    if (passDateStart && passDuration) {
      // datetime-local input returns value in format "YYYY-MM-DDTHH:MM" (local time)
      // We must parse this as LOCAL time to avoid timezone interpretation issues
      const hours = parseInt(passDuration.replace('h', ''), 10);
      
      // Split and create Date treating the input as local time
      const parts = passDateStart.split('T');
      const datePart = parts[0] ?? '';
      const timePart = parts[1] ?? '';
      const [year, month, day] = datePart.split('-').map(Number) as [number, number, number];
      const [hour, minute] = timePart.split(':').map(Number) as [number, number];
      
      // Create Date using local time constructor (year, month-1, day, hour, minute)
      const start = new Date(year, month - 1, day, hour, minute);
      const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
      setPassDateEnd(end.toISOString());
    }
  }, [passDateStart, passDuration]);

  // --- Load pending pass into form when editing ---
  useEffect(() => {
    if (editingPendingId) {
      const pendingPass = requests.find((r) => r.id === editingPendingId);
      if (pendingPass) {
        setResidentName(pendingPass.residentName);
        setPurpose(pendingPass.purpose);
        setClientName(pendingPass.clientName);
        setVisitorName(pendingPass.visitorName);
        setVisitorPhone(formatPhone(pendingPass.visitorPhone));
        setPassDateStart(pendingPass.passStart);
        setPassDateEnd(pendingPass.passEnd);
        setCanPassUA(pendingPass.canPassUA);
        setChoreCovered(pendingPass.choreCovered);
        setChoreCoveredBy(pendingPass.choreCoveredBy);
        setOnPremises(pendingPass.onPremises);
        setOffPremises(pendingPass.offPremises);
        setPassDuration(pendingPass.passType);
        setAdditionalInfo(pendingPass.comment || "");
        setErrors([]);
      }
    }
  }, [editingPendingId, requests]);

  // --- Helper: Check if name has both first and last ---
  const hasFullName = (s: string) => {
    if (!s) return false;
    const parts = s.trim().split(/\s+/);
    return parts.length >= 2;
  };

  // --- Helper: parse datetime-local as LOCAL wall clock (not UTC) ---
  const parseLocalDateTime = (value: string): Date | null => {
    if (!value) return null;
    // "YYYY-MM-DDTHH:MM" from <input type="datetime-local" />
    const [datePart, timePart = "0:0"] = value.split("T");
    if (!datePart) return null;
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day, hour || 0, minute || 0);
  };

  /** Today's date as YYYY-MM-DD for type="date" signature fields */
  const todayDateString = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // --- Validation ---
  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    if (!residentName.trim()) newErrors.push("Resident Name is required");
    if (!hasFullName(residentName)) newErrors.push("Resident Name: Please enter both first and last name");
    if (!visitorName.trim()) newErrors.push("Visitor Name is required");
    if (!hasFullName(visitorName)) newErrors.push("Visitor Name: Please enter both first and last name");
    if (!visitorPhone.trim()) newErrors.push("Visitor Phone is required");
    if (!passDateStart) newErrors.push("Pass Start Date is required");
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  /**
   * 24-hour advance notice warning.
   * House rule: warn when the pass START is less than 24 hours from now.
   * (Previously used END time, so 24h/48h duration often hid the warning.)
   * Warning only — does not block submit.
   */
  const getAdvanceNoticeWarning = (): string | null => {
    if (!passDateStart) return null;

    const now = new Date();
    const startTime = parseLocalDateTime(passDateStart);
    if (!startTime) return null;

    // Hours from now until the pass begins
    const hoursUntilStart =
      (startTime.getTime() - now.getTime()) / (1000 * 3600);

    // Already started or in the past still counts as short notice
    if (hoursUntilStart < 24) {
      const durationHours = parseInt(passDuration.replace("h", ""), 10);
      const startFormatted = startTime.toLocaleString("en-US", {
        timeZone: "America/Chicago",
        dateStyle: "medium",
        timeStyle: "short",
      });
      const endFormatted = passDateEnd
        ? new Date(passDateEnd).toLocaleString("en-US", {
            timeZone: "America/Chicago",
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "—";
      const hoursLabel =
        hoursUntilStart < 0
          ? "start time is already past"
          : `${hoursUntilStart.toFixed(1)} hours until start`;
      return `Less than 24 hours notice before pass start (${hoursLabel}). Pass (${durationHours}h: ${startFormatted} - ${endFormatted}). If this is an emergency, add details in the comment box below.`;
    }
    return null;
  };

  // --- Handlers ---
  const handleAdd = () => {
    if (!validateForm()) return;
    
    if (editingPendingId) {
      // Update existing pending pass
      dispatch(updatePassRequest({
        id: editingPendingId,
        residentName: residentName.trim(),
        purpose: purpose.trim(),
        clientName: clientName.trim(),
        visitorName: visitorName.trim(),
        visitorPhone: visitorPhone.trim(),
        passStart: passDateStart,
        passEnd: passDateEnd,
        passType: passDuration,
        canPassUA,
        choreCovered,
        choreCoveredBy: choreCoveredBy.trim(),
        onPremises,
        offPremises,
        comment: additionalInfo.trim(),
      }));
      setEditingPendingId(null);
    } else {
      // Create new pass
      dispatch(
        addPassRequest({
          residentName: residentName.trim(),
          purpose: purpose.trim(),
          clientName: clientName.trim(),
          visitorName: visitorName.trim(),
          visitorPhone: visitorPhone.trim(),
          passStart: passDateStart,
          passEnd: passDateEnd,
          passType: passDuration,
          canPassUA,
          choreCovered,
          choreCoveredBy: choreCoveredBy.trim(),
          onPremises,
          offPremises,
          comment: additionalInfo.trim(),
        })
      );
    }
    
    // Reset form
    setResidentName("");
    setPurpose("");
    setClientName("");
    setVisitorName("");
    setVisitorPhone("");
    setPassDateStart("");
    setPassDateEnd("");
    setPassDuration("24h");
    setCanPassUA("idk");
    setChoreCovered(false);
    setChoreCoveredBy("");
    setOnPremises(false);
    setOffPremises(false);
    setAdditionalInfo("");
    setErrors([]);
  };

  const handleEdit = (id: string) => {
    // Don't mix form edit and Administration review
    setReviewingId(null);
    setEditingPendingId(id);
  };

  const handleCancelEdit = () => {
    setEditingPendingId(null);
  };

  /** Open Administration review for one pending pass (full detail + sign + decide) */
  const handleOpenReview = (id: string) => {
    // Don't mix edit-form and review
    setEditingPendingId(null);
    setReviewingId(id);
    setErrors([]);
    setReviewErrors([]);
    setAdminSignature("");
    setAdminSignatureDate("");
    setReviewDenyComment("");
    setReviewSigKey((k) => k + 1);
    setActionNotice(null);
  };

  /** Close review panel without deciding */
  const handleCloseReview = () => {
    setReviewingId(null);
    setAdminSignature("");
    setAdminSignatureDate("");
    setReviewDenyComment("");
    setReviewErrors([]);
  };

  /**
   * Administration Approve or Deny with required signature + date.
   * FUTURE: role gate — Administration only; decidedByName from login.
   */
  const handleDecide = (decision: "approved" | "denied") => {
    if (!reviewingId) return;

    const errs: string[] = [];
    if (!adminSignature.trim()) {
      errs.push("Administration signature is required.");
    }
    if (!adminSignatureDate.trim()) {
      errs.push("Administration signature date is required.");
    }
    if (decision === "denied" && !reviewDenyComment.trim()) {
      errs.push("Deny requires a comment for the client.");
    }
    if (errs.length) {
      setReviewErrors(errs);
      return;
    }

    dispatch(
      decidePassRequest({
        id: reviewingId,
        decision,
        adminSignature,
        adminSignatureDate,
        denyComment:
          decision === "denied" ? reviewDenyComment.trim() : undefined,
      })
    );

    const name =
      reviewingRequest?.residentName?.trim() ||
      reviewingRequest?.clientName?.trim() ||
      "client";
    setActionNotice(
      decision === "approved"
        ? `Pass approved for ${name}. Client notify queued (FE stub — no message until backend).`
        : `Pass denied for ${name}. Client notify queued (FE stub — no message until backend).`
    );

    // Close review cleanly
    setReviewingId(null);
    setAdminSignature("");
    setAdminSignatureDate("");
    setReviewDenyComment("");
    setReviewErrors([]);
    setReviewSigKey((k) => k + 1);
  };

  // --- Helper ---
  const capitalize = (s: string) => {
    if (!s) return s;
    return s.split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.substr(0, 3)}) ${digits.substr(3, 3)}-${digits.substr(6)}`;
    }
    return value;
  };

  // --- Monthly History Filter ---
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const pending = requests.filter((r) => r.status === "pending");
  const history = requests.filter((r) => r.status !== "pending");
  
  // Filter history to show only current month
  const currentMonthHistory = history.filter((req) => {
    const passDate = new Date(req.submittedAt);
    return passDate.getMonth() === currentMonth && passDate.getFullYear() === currentYear;
  });

  // --- Render ---
  return (
    <Box sx={{ p: 3, maxWidth: 800 }}>
      {/* Flash after Administration decide / notify stub */}
      {actionNotice && (
        <Card sx={{ mb: 2, bgcolor: "success.light" }}>
          <CardContent
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              py: 1.5,
              "&:last-child": { pb: 1.5 },
            }}
          >
            <Typography variant="body2">{actionNotice}</Typography>
            <Button size="small" onClick={() => setActionNotice(null)}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <Card sx={{ mb: 3, bgcolor: "error.light" }}>
          <CardContent>
            <Typography variant="subtitle2" color="error.darker">
              Please fix the following:
            </Typography>
            <ul style={{ margin: "8px 0 0 20px", paddingLeft: 0 }}>
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Edit Mode Indicator */}
      {editingPendingId && (
        <Card sx={{ mb: 2, bgcolor: "info.light" }}>
          <CardContent>
            <Typography variant="subtitle2" color="info.dark">
              Editing pending pass. Click "Submit Request" to save changes or click "Cancel Edit" to discard.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Submit Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Pass Request Submission
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl>
              <FormLabel sx={{ fontSize: 20, fontWeight: 1000 }}>Resident Name (First & Last)</FormLabel>
              <TextField
                value={residentName}
                onChange={(e) => setResidentName(capitalize(e.target.value))}
                error={!!errors.find((e) => e.includes("Resident Name"))}
                helperText={errors.find((e) => e.includes("Resident Name"))}
              />
            </FormControl>

            <FormControl>
              <FormLabel sx={{ fontSize: 20, fontWeight: 1000 }}>Visitor(s) Name (First & Last)</FormLabel>
              <TextField
                value={visitorName}
                onChange={(e) => setVisitorName(capitalize(e.target.value))}
                error={!!errors.find((e) => e.includes("Visitor Name"))}
                helperText={errors.find((e) => e.includes("Visitor Name"))}
              />
            </FormControl>

            <FormControl>
              <FormLabel sx={{ fontSize: 20, fontWeight: 1000 }}>Visitor(s) Phone Number</FormLabel>
              <TextField
                type="tel"
                value={visitorPhone}
                onChange={(e) => setVisitorPhone(formatPhone(e.target.value))}
                error={!!errors.find((e) => e.includes("Visitor Phone"))}
                helperText={errors.find((e) => e.includes("Visitor Phone"))}
              />
            </FormControl>

            {/* 24-hour advance notice warning */}
            {getAdvanceNoticeWarning() && (
              <Card sx={{ mb: 2, bgcolor: "warning.light", border: "1px solid", borderColor: "warning.main" }}>
                <CardContent>
                  <Typography variant="subtitle2" color="warning.dark">
                    {getAdvanceNoticeWarning()}
                  </Typography>
                </CardContent>
              </Card>
            )}

            <FormControl>
              <FormLabel sx={{ fontSize: 20, fontWeight: 500 }}>Pass Duration</FormLabel>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                  variant={passDuration === "12h" ? "contained" : "outlined"}
                  onClick={() => setPassDuration("12h")}
                >
                  12h
                </Button>
                <Button
                  variant={passDuration === "24h" ? "contained" : "outlined"}
                  onClick={() => setPassDuration("24h")}
                >
                  24h
                </Button>
                <Button
                  variant={passDuration === "48h" ? "contained" : "outlined"}
                  onClick={() => setPassDuration("48h")}
                >
                  48h
                </Button>
              </Box>
            </FormControl>

            <FormControl>
              <FormLabel sx={{ fontSize: 20, fontWeight: 1000 }}>Pass Start Date</FormLabel>
              <TextField
                type="datetime-local"
                value={passDateStart}
                onChange={(e) => setPassDateStart(e.target.value)}
              />
            </FormControl>

            <FormControl sx={{ display: "flex", alignItems: "center", px: 2, py: 1, bgcolor: "grey.100", borderRadius: 1 }}>
              <FormLabel sx={{ fontSize: 14, fontWeight: 1000, mb: 0 }}>End:</FormLabel>
              <Typography variant="body2" sx={{ ml: 1, color: passDateEnd ? "text.primary" : "text.disabled" }}>
                {passDateEnd ? new Date(passDateEnd).toLocaleString("en-US", { timeZone: "America/Chicago", dateStyle: "medium", timeStyle: "short" }) : "Select start date and duration"}
              </Typography>
            </FormControl>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 1000 }}>
                Can you pass a UA?
              </Typography>
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                <Button
                  variant={canPassUA === "yes" ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => setCanPassUA("yes")}
                >
                  {canPassUA === "yes" ? "Yes ✓" : "Yes"}
                </Button>
                <Button
                  variant={canPassUA === "no" ? "contained" : "outlined"}
                  color="error"
                  onClick={() => setCanPassUA("no")}
                >
                  {canPassUA === "no" ? "No ✗" : "No"}
                </Button>
                <Button
                  variant={canPassUA === "idk" ? "contained" : "outlined"}
                  color="warning"
                  onClick={() => setCanPassUA("idk")}
                >
                  {canPassUA === "idk" ? "Not Sure ?" : "Not Sure"}
                </Button>
              </Box>
            </Box>

            <FormControl>
              <FormLabel sx={{ fontSize: 20, fontWeight: 1000 }}>Is your chore covered? (check box    )</FormLabel>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={choreCovered}
                    onChange={(e) => setChoreCovered(e.target.checked)}
                  />
                }
                label=""
              />
            </FormControl>

            {choreCovered && (
              <FormControl>
                <FormLabel sx={{ fontSize: 20, fontWeight: 1000 }}>
                  Covered By (or 'self')
                </FormLabel>
                <TextField
                  value={choreCoveredBy}
                  onChange={(e) => setChoreCoveredBy(capitalize(e.target.value))}
                />
              </FormControl>
            )}

            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={onPremises}
                    onChange={(e) => setOnPremises(e.target.checked)}
                  />
                }
                label="On Premises"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={offPremises}
                    onChange={(e) => setOffPremises(e.target.checked)}
                  />
                }
                label="Off Premises"
              />
            </Box>

            {/* Additional Info / Reason for Emergency Pass */}
            <FormControl>
              <FormLabel sx={{ fontSize: 20, fontWeight: 1000 }}>
                Additional Info / Reason for Pass (optional - e.g., emergency, special circumstances)
              </FormLabel>
              <TextField
                multiline
                rows={3}
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Provide any additional details or reason for this pass..."
              />
            </FormControl>

            <Box sx={{ display: "flex", gap: 2 }}>
              {editingPendingId && (
                <Button variant="outlined" onClick={handleCancelEdit}>
                  Cancel Edit
                </Button>
              )}
              <Button variant="contained" onClick={handleAdd}>
                {editingPendingId ? "Update Request" : "Submit Request"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Pending Requests — Review opens full Administration decide flow */}
            <Typography variant="h5" gutterBottom>
              Pending Requests
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Administration: open <strong>Review</strong> to see full details, sign,
              and Approve or Deny. One-click approve/deny is disabled so every decision
              is signed. FUTURE: this queue is Administration-only after login.
            </Typography>
            {pending.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No pending passes.
              </Typography>
            )}
            {pending.map((req: PassRequest) => (
              <Card
                key={req.id}
                sx={{
                  mb: 2,
                  ...(reviewingId === req.id
                    ? { border: "2px solid", borderColor: "primary.main" }
                    : {}),
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography>
                        <strong>{req.residentName}</strong> - {req.purpose}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {req.visitorName && `Visitor: ${req.visitorName}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pass: {new Date(req.passStart).toLocaleString("en-US", { timeZone: "America/Chicago", dateStyle: "medium", timeStyle: "short" })}
                        {" - "}
                        {new Date(req.passEnd).toLocaleString("en-US", { timeZone: "America/Chicago", dateStyle: "medium", timeStyle: "short" })}
                      </Typography>
                      {req.comment && (
                        <Typography variant="caption" color="text.secondary">
                          <br />
                          Note: {req.comment}
                        </Typography>
                      )}
                      <Typography variant="caption">
                        <br />
                        Submitted: {new Date(req.submittedAt).toLocaleString("en-US", { timeZone: "America/Chicago" })}
                      </Typography>
                      {req.lastEditedAt && (
                        <Typography variant="caption" color="text.secondary">
                          <br />
                          Edited: {new Date(req.lastEditedAt).toLocaleString("en-US", { timeZone: "America/Chicago" })}
                        </Typography>
                      )}
                    </Box>
                    <Tooltip title="Edit pending pass details">
                      <IconButton
                        onClick={() => handleEdit(req.id)}
                        disabled={editingPendingId !== null || reviewingId !== null}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
                    <Button
                      variant={reviewingId === req.id ? "contained" : "outlined"}
                      onClick={() => handleOpenReview(req.id)}
                    >
                      {reviewingId === req.id ? "Reviewing…" : "Review & decide"}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}

      {/* ---------- Administration review (full detail) ---------- */}
      {reviewingRequest && reviewingRequest.status === "pending" && (
        <Card sx={{ mb: 3, border: "2px solid", borderColor: "primary.main" }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
                mb: 2,
              }}
            >
              <Typography variant="h5">
                Review pass — Administration
              </Typography>
              <Button variant="outlined" color="inherit" onClick={handleCloseReview}>
                Close review
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Client submitted this request (no client signature on Pass). Check
              every field, sign below, then Approve or Deny. Both decisions need
              Administration signature + date; Deny also needs a comment.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography>
                <strong>Resident:</strong> {reviewingRequest.residentName}
              </Typography>
              <Typography>
                <strong>Client name on form:</strong>{" "}
                {reviewingRequest.clientName || "—"}
              </Typography>
              <Typography>
                <strong>Purpose:</strong> {reviewingRequest.purpose || "—"}
              </Typography>
              <Typography>
                <strong>Visitor:</strong> {reviewingRequest.visitorName} —{" "}
                {reviewingRequest.visitorPhone}
              </Typography>
              <Typography>
                <strong>Pass type:</strong> {reviewingRequest.passType}
              </Typography>
              <Typography>
                <strong>Start:</strong>{" "}
                {new Date(reviewingRequest.passStart).toLocaleString("en-US", {
                  timeZone: "America/Chicago",
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </Typography>
              <Typography>
                <strong>End:</strong>{" "}
                {new Date(reviewingRequest.passEnd).toLocaleString("en-US", {
                  timeZone: "America/Chicago",
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </Typography>
              <Typography>
                <strong>Can pass UA:</strong> {reviewingRequest.canPassUA}
              </Typography>
              <Typography>
                <strong>Chore covered:</strong>{" "}
                {reviewingRequest.choreCovered
                  ? `Yes${
                      reviewingRequest.choreCoveredBy
                        ? ` - ${reviewingRequest.choreCoveredBy}`
                        : ""
                    }`
                  : "No"}
              </Typography>
              <Typography>
                <strong>On premises:</strong>{" "}
                {reviewingRequest.onPremises ? "Yes" : "No"}
                {" · "}
                <strong>Off premises:</strong>{" "}
                {reviewingRequest.offPremises ? "Yes" : "No"}
              </Typography>
              {reviewingRequest.comment ? (
                <Typography>
                  <strong>Note:</strong> {reviewingRequest.comment}
                </Typography>
              ) : null}
              <Typography variant="caption" color="text.secondary">
                Submitted:{" "}
                {new Date(reviewingRequest.submittedAt).toLocaleString("en-US", {
                  timeZone: "America/Chicago",
                })}
                {reviewingRequest.lastEditedAt
                  ? ` - Edited: ${new Date(
                      reviewingRequest.lastEditedAt
                    ).toLocaleString("en-US", {
                      timeZone: "America/Chicago",
                    })}`
                  : ""}
              </Typography>
            </Box>

            {/* Administration signature — required for Approve and Deny */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Administration signature
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Sign with finger or stylus, then set the date. Required for both
                Approve and Deny.
              </Typography>
              <SignatureCanvas
                key={`admin-pass-sig-${reviewSigKey}`}
                height={150}
                onSignatureChange={(base64) => {
                  setAdminSignature(base64);
                  setAdminSignatureDate((prev) =>
                    base64 ? prev || todayDateString() : ""
                  );
                }}
              />
              <TextField
                fullWidth
                type="date"
                label="Administration signature date"
                value={adminSignatureDate}
                onChange={(e) => setAdminSignatureDate(e.target.value)}
                disabled={!adminSignature}
                required={Boolean(adminSignature)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ mt: 1, maxWidth: 320 }}
              />
              {adminSignature && (
                <Box
                  component="img"
                  src={`data:image/png;base64,${adminSignature}`}
                  alt="Administration signature preview"
                  sx={{
                    display: "block",
                    maxWidth: 220,
                    border: "1px solid",
                    borderColor: "divider",
                    p: 0.5,
                    mt: 1,
                    bgcolor: "common.white",
                  }}
                />
              )}
            </Box>

            {/* Deny reason (only needed when denying) */}
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Deny comment (required if denying)"
              placeholder="Reason the client will see…"
              value={reviewDenyComment}
              onChange={(e) => setReviewDenyComment(e.target.value)}
              sx={{ mt: 2 }}
            />

            {reviewErrors.length > 0 && (
              <Card sx={{ mt: 2, bgcolor: "error.light" }}>
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  {reviewErrors.map((msg) => (
                    <Typography key={msg} variant="body2">
                      {msg}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            )}

            <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleDecide("approved")}
              >
                Approve (signed)
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleDecide("denied")}
              >
                Deny (signed)
              </Button>
              <Button variant="outlined" color="inherit" onClick={handleCloseReview}>
                Cancel
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Current Month History */}
      {currentMonthHistory.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            History (Current Month:{" "}
            {now.toLocaleString("default", { month: "long", year: "numeric" })})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Decided passes this month. Client result notify is stubbed until
            backend. FUTURE: client portal only sees their own rows.
          </Typography>
          {currentMonthHistory.map((req: PassRequest) => {
            const signed = Boolean(req.adminSignature);
            return (
              <Card key={req.id} variant="outlined" sx={{ mb: 1 }}>
                <CardContent
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography>
                      <strong>{req.residentName}</strong> - {req.purpose}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Visitor: {req.visitorName} |{" "}
                      {new Date(req.passStart).toLocaleString("en-US", {
                        timeZone: "America/Chicago",
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </Typography>
                    {req.comment && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        component="p"
                        sx={{ display: "block", m: 0 }}
                      >
                        Note: {req.comment}
                      </Typography>
                    )}
                    {req.decidedAt && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        component="p"
                        sx={{ display: "block", m: 0 }}
                      >
                        Decided:{" "}
                        {new Date(req.decidedAt).toLocaleString("en-US", {
                          timeZone: "America/Chicago",
                        })}
                        {req.adminSignatureDate
                          ? ` · Sig date: ${req.adminSignatureDate}`
                          : ""}
                      </Typography>
                    )}
                    {signed && (
                      <Box
                        component="img"
                        src={`data:image/png;base64,${req.adminSignature}`}
                        alt="Administration signature"
                        sx={{
                          display: "block",
                          maxWidth: 160,
                          border: "1px solid",
                          borderColor: "divider",
                          p: 0.5,
                          mt: 1,
                          bgcolor: "common.white",
                        }}
                      />
                    )}
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      alignItems: "flex-end",
                    }}
                  >
                    <Box
                      sx={{
                        py: 0.5,
                        px: 1,
                        borderRadius: 1,
                        bgcolor:
                          req.status === "approved"
                            ? "success.light"
                            : "error.light",
                        fontWeight: "bold",
                        textTransform: "capitalize",
                      }}
                    >
                      {req.status}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {signed
                        ? "Administration signed"
                        : "No signature on file"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Notify: {req.clientNotifyStatus || "not_sent"}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={
                        req.clientNotifyStatus === "queued" ||
                        req.clientNotifyStatus === "sent"
                      }
                      onClick={() => {
                        dispatch(queueClientPassNotify({ id: req.id }));
                        setActionNotice(
                          `Client notify queued for ${req.residentName} (FE stub only).`
                        );
                      }}
                    >
                      {req.clientNotifyStatus === "queued" ||
                      req.clientNotifyStatus === "sent"
                        ? "Notify queued"
                        : "Notify client (stub)"}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}