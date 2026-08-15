/**
 * UA / Rapid Drug Screen Form Page
 *
 * Purpose: Digital replica of Hope House's paper UA / Rapid Drug Screen form.
 *
 * Workflow:
 * - Staff fill results + client signs → Submit UA (history row).
 * - Administration may Open from history later to countersign (no second row).
 * - Complete when client + Administration both signed.
 *
 * ---------------------------------------------------------------------------
 * BACKEND TODO / FUTURE INTEGRATION:
 * - POST /api/ua-forms; PUT /api/ua-forms/:id/signatures
 * - Role gate: staff collect; Administration open + countersign
 * - Client lookup for intake / last UA dates
 * - Multi-device persist (Redux is session mock only)
 * ---------------------------------------------------------------------------
 */

import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addUAForm,
  createDrugPanels,
  updateUAFormSignatures,
  uaStatusLabel,
  type UAForm,
  type DrugResult,
} from "@/store/slices/uaForm";
import SignatureCanvas from "@/components/SignatureCanvas";

/** Fresh blank form every New / after submit */
const createInitialForm = (): UAForm => ({
  id: crypto.randomUUID(),
  clientName: "",
  intakeDate: "",
  lastUaDate: "",
  drugPanels: createDrugPanels(),
  observedBy: { staffName: "", time: "", observed: "Yes" },
  uaReason: "Random",
  remarks: "",
  collectorInfo: { collectorName: "", collectorPhone: "", collectionDate: "" },
  specimenTemp: "In Range",
  clientSignature: "",
  clientSignatureDate: "",
  adminSignature: "",
  adminSignatureDate: "",
  submittedAt: new Date().toISOString(),
  status: "pending",
});

/**
 * Soft title-case for person names (McGalliard-safe).
 * Uppercases first letter and after space / hyphen / apostrophe only.
 */
function toTitleCase(value: string): string {
  if (!value) return value;
  return value.replace(
    /(^|[\s'-])([a-zA-Z])/g,
    (_m, sep: string, ch: string) => sep + ch.toUpperCase()
  );
}

/** 10 digits → (XXX) XXX-XXXX */
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return value;
}

/** YYYY-MM-DD for type="date" */
function todayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function UAFormPage() {
  const dispatch = useAppDispatch();
  const requests = useAppSelector((state) => state.uaForm.requests);

  /**
   * When set, form is finishing signatures on that history id.
   * Core fields locked; Save updates signatures only (no second row).
   */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UAForm>(createInitialForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  /** Remount SignatureCanvas when starting new or opening history */
  const [sigPadKey, setSigPadKey] = useState(0);
  const [historyFilter, setHistoryFilter] = useState("");

  const isEditingExisting = editingId !== null;

  const historyRows = useMemo(() => {
    const q = historyFilter.trim().toLowerCase();
    const rows = [...requests].sort((a, b) =>
      a.submittedAt < b.submittedAt ? 1 : -1
    );
    if (!q) return rows;
    return rows.filter((r) => r.clientName.toLowerCase().includes(q));
  }, [requests, historyFilter]);

  const handleStartNew = () => {
    setEditingId(null);
    setForm(createInitialForm());
    setErrors([]);
    setActionNotice(null);
    setSigPadKey((k) => k + 1);
  };

  /** Open existing UA for Administration / staff to finish signatures */
  const handleOpenFromHistory = (row: UAForm) => {
    setEditingId(row.id);
    setForm({
      ...row,
      drugPanels: row.drugPanels.map((p) => ({ ...p })),
      observedBy: { ...row.observedBy },
      collectorInfo: { ...row.collectorInfo },
      clientSignature: row.clientSignature ?? "",
      clientSignatureDate: row.clientSignatureDate ?? "",
      adminSignature: row.adminSignature ?? "",
      adminSignatureDate: row.adminSignatureDate ?? "",
    });
    setErrors([]);
    setActionNotice(null);
    setSigPadKey((k) => k + 1);
    // Scroll form into view for tablet admin
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDrugResultChange = (panelId: string, result: DrugResult) => {
    if (isEditingExisting) return;
    setForm((prev) => ({
      ...prev,
      drugPanels: prev.drugPanels.map((panel) =>
        panel.id === panelId ? { ...panel, result } : panel
      ),
    }));
  };

  const validateForSubmit = (): boolean => {
    const newErrors: string[] = [];
    if (!form.clientName.trim()) newErrors.push("Client Name is required");
    if (!form.observedBy.staffName.trim())
      newErrors.push("Observed By Staff Name is required");
    if (!form.observedBy.time) newErrors.push("Observed By Time is required");
    if (!form.collectorInfo.collectorName.trim())
      newErrors.push("Collector Name is required");
    if (!form.collectorInfo.collectorPhone.trim())
      newErrors.push("Collector Phone is required");
    if (!form.collectorInfo.collectionDate)
      newErrors.push("Collection Date is required");
    // New submit: client signature required (admin may finish later)
    if (!form.clientSignature)
      newErrors.push("Client Signature is required");
    if (form.clientSignature && !form.clientSignatureDate)
      newErrors.push("Client Signature Date is required");
    if (form.adminSignature && !form.adminSignatureDate)
      newErrors.push("Administration Signature Date is required");
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const validateSignaturesOnly = (): boolean => {
    const newErrors: string[] = [];
    // Keep client sig if it was required at original submit; allow fill if missing
    if (form.clientSignature && !form.clientSignatureDate)
      newErrors.push("Client Signature Date is required once client has signed");
    if (form.adminSignature && !form.adminSignatureDate)
      newErrors.push(
        "Administration Signature Date is required once Administration has signed"
      );
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  /** New UA → history */
  const handleSubmit = () => {
    if (!validateForSubmit()) return;

    const payload: UAForm = {
      ...form,
      id: form.id || crypto.randomUUID(),
      clientName: form.clientName.trim(),
      submittedAt: new Date().toISOString(),
      clientSignature: form.clientSignature ?? "",
      clientSignatureDate: form.clientSignatureDate ?? "",
      adminSignature: form.adminSignature ?? "",
      adminSignatureDate: form.adminSignatureDate ?? "",
      status: "pending", // slice will resolve complete if both signed
    };

    dispatch(addUAForm(payload));

    const both =
      Boolean(payload.clientSignature) && Boolean(payload.adminSignature);
    setActionNotice(
      both
        ? `UA saved for ${payload.clientName} — Complete (both signatures).`
        : `UA saved for ${payload.clientName} — Pending Signature. Open from history for Administration to countersign.`
    );
    setEditingId(null);
    setForm(createInitialForm());
    setErrors([]);
    setSigPadKey((k) => k + 1);
  };

  /** Resume: update signatures only */
  const handleSaveSignatures = () => {
    if (!editingId) return;
    if (!validateSignaturesOnly()) return;

    dispatch(
      updateUAFormSignatures({
        id: editingId,
        clientSignature: form.clientSignature ?? "",
        clientSignatureDate: form.clientSignatureDate ?? "",
        adminSignature: form.adminSignature ?? "",
        adminSignatureDate: form.adminSignatureDate ?? "",
      })
    );

    const both =
      Boolean(form.clientSignature?.trim()) &&
      Boolean(form.adminSignature?.trim());
    setActionNotice(
      both
        ? `Signatures saved for ${form.clientName.trim()} — Complete.`
        : `Signatures updated for ${form.clientName.trim()} — still Pending Signature.`
    );
    setEditingId(null);
    setForm(createInitialForm());
    setErrors([]);
    setSigPadKey((k) => k + 1);
  };

  const fieldDisabled = isEditingExisting;

  return (
    <Box sx={{ p: 3, maxWidth: 800 }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 2,
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          UA / Rapid Drug Screen Form
        </Typography>
        {isEditingExisting && (
          <Button variant="outlined" onClick={handleStartNew}>
            Cancel open — New UA
          </Button>
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Staff collect results and client signature, then Submit. Administration
        can open a history row later to countersign. Complete only when both
        have signed. Saves are mock (this browser session) until backend.
      </Typography>

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

      {isEditingExisting && (
        <Card sx={{ mb: 2, bgcolor: "info.light" }}>
          <CardContent>
            <Typography variant="subtitle2" color="info.dark">
              Opened from history — results and identity are locked. Update
              Client and/or Administration signatures, then Save signatures.
            </Typography>
          </CardContent>
        </Card>
      )}

      {errors.length > 0 && (
        <Card sx={{ mb: 3, bgcolor: "error.light" }}>
          <CardContent>
            <Typography variant="subtitle2" color="error.dark">
              Please fix the following:
            </Typography>
            <ul style={{ margin: "8px 0 0 20px", paddingLeft: 0 }}>
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* ---------- History ---------- */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              mb: 2,
            }}
          >
            <Typography variant="h6">UA History</Typography>
            <Chip
              size="small"
              label={`${requests.length} total`}
              variant="outlined"
            />
          </Box>
          <TextField
            fullWidth
            size="small"
            label="Filter by client name"
            value={historyFilter}
            onChange={(e) => setHistoryFilter(e.target.value)}
            sx={{ mb: 2 }}
          />
          {historyRows.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {requests.length === 0
                ? "No UAs saved yet. Submit a form below."
                : "No rows match this filter."}
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {historyRows.map((row, index) => {
                const both =
                  Boolean(row.clientSignature) && Boolean(row.adminSignature);
                return (
                  <Box key={row.id}>
                    {index > 0 && <Divider sx={{ mb: 1.5 }} />}
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ minWidth: 0, flex: "1 1 200px" }}>
                        <Typography variant="subtitle2">
                          {row.clientName} — {row.uaReason}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Collected: {row.collectorInfo.collectionDate || "—"}
                          {row.submittedAt
                            ? ` · Submitted: ${new Date(
                                row.submittedAt
                              ).toLocaleString("en-US", {
                                timeZone: "America/Chicago",
                              })}`
                            : ""}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                          alignItems: "center",
                        }}
                      >
                        <Chip
                          size="small"
                          label={
                            both
                              ? "Both signed"
                              : row.clientSignature
                                ? "Client signed"
                                : "No client sig"
                          }
                          color={both ? "success" : "default"}
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          label={uaStatusLabel(row.status)}
                          color={
                            row.status === "complete" ? "success" : "default"
                          }
                          variant="outlined"
                        />
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleOpenFromHistory(row)}
                        >
                          {both ? "Open / re-sign" : "Open to sign"}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* ---------- Form ---------- */}
      <Typography variant="h5" gutterBottom>
        {isEditingExisting ? "Finish signatures / review" : "New UA"}
      </Typography>

      {/* Client Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontSize: 20, fontWeight: 1000 }}
          >
            Client Information
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Client Name"
              value={form.clientName}
              disabled={fieldDisabled}
              onChange={(e) => {
                const name = toTitleCase(e.target.value);
                setForm((prev) => ({ ...prev, clientName: name }));
              }}
              required
            />
            <FormControl>
              <FormLabel sx={{ fontSize: 20, fontWeight: 1000 }}>
                Intake Date
              </FormLabel>
              <TextField
                type="date"
                value={form.intakeDate}
                disabled={fieldDisabled}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, intakeDate: e.target.value }))
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </FormControl>
            <FormControl>
              <FormLabel sx={{ fontSize: 20, fontWeight: 1000 }}>
                Last UA Date
              </FormLabel>
              <TextField
                type="date"
                value={form.lastUaDate || ""}
                disabled={fieldDisabled}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, lastUaDate: e.target.value }))
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontSize: 20, fontWeight: 1000 }}
          >
            UA Reason
          </Typography>
          <FormControl fullWidth disabled={fieldDisabled}>
            <Select
              value={form.uaReason}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  uaReason: e.target.value as
                    | "Random"
                    | "Pass Return"
                    | "Intake",
                }))
              }
            >
              <MenuItem value="Random">Random</MenuItem>
              <MenuItem value="Pass Return">Pass Return</MenuItem>
              <MenuItem value="Intake">Intake</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontSize: 20, fontWeight: 1000 }}
          >
            Observed By
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <TextField
              label="Staff Name"
              value={form.observedBy.staffName}
              disabled={fieldDisabled}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  observedBy: {
                    ...prev.observedBy,
                    staffName: toTitleCase(e.target.value),
                  },
                }))
              }
              required
            />
            <FormControl>
              <FormLabel sx={{ fontSize: 20, fontWeight: 1000 }}>Time</FormLabel>
              <TextField
                type="time"
                value={form.observedBy.time}
                disabled={fieldDisabled}
                onFocus={() => {
                  if (fieldDisabled) return;
                  if (!form.observedBy.time) {
                    const now = new Date().toLocaleString("en-US", {
                      timeZone: "America/Chicago",
                    });
                    const centralDate = new Date(now);
                    const hours = String(centralDate.getHours()).padStart(
                      2,
                      "0"
                    );
                    const minutes = String(centralDate.getMinutes()).padStart(
                      2,
                      "0"
                    );
                    setForm((prev) => ({
                      ...prev,
                      observedBy: {
                        ...prev.observedBy,
                        time: `${hours}:${minutes}`,
                      },
                    }));
                  }
                }}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    observedBy: {
                      ...prev.observedBy,
                      time: e.target.value,
                    },
                  }))
                }
              />
            </FormControl>
            <FormControl component="fieldset" disabled={fieldDisabled}>
              <FormLabel sx={{ fontSize: 20, fontWeight: 1000 }}>
                Observed
              </FormLabel>
              <RadioGroup
                row
                value={form.observedBy.observed}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    observedBy: {
                      ...prev.observedBy,
                      observed: e.target.value as "Yes" | "No",
                    },
                  }))
                }
              >
                <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="No" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontSize: 20, fontWeight: 1000 }}
          >
            Collector Information
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Collector Name"
              value={form.collectorInfo.collectorName}
              disabled={fieldDisabled}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  collectorInfo: {
                    ...prev.collectorInfo,
                    collectorName: toTitleCase(e.target.value),
                  },
                }))
              }
              required
            />
            <TextField
              type="tel"
              label="Collector Phone Number"
              value={form.collectorInfo.collectorPhone}
              disabled={fieldDisabled}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  collectorInfo: {
                    ...prev.collectorInfo,
                    collectorPhone: formatPhone(e.target.value),
                  },
                }))
              }
              required
            />
            <FormControl>
              <FormLabel sx={{ fontSize: 20, fontWeight: 1000 }}>
                Collection Date
              </FormLabel>
              <TextField
                type="date"
                value={form.collectorInfo.collectionDate}
                disabled={fieldDisabled}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    collectorInfo: {
                      ...prev.collectorInfo,
                      collectionDate: e.target.value,
                    },
                  }))
                }
                required
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontSize: 20, fontWeight: 1000 }}
          >
            Specimen Temperature
          </Typography>
          <FormControl component="fieldset" disabled={fieldDisabled}>
            <RadioGroup
              row
              value={form.specimenTemp}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  specimenTemp: e.target.value as "In Range" | "Not In Range",
                }))
              }
            >
              <FormControlLabel
                value="In Range"
                control={<Radio />}
                label="In Range"
              />
              <FormControlLabel
                value="Not In Range"
                control={<Radio />}
                label="Not In Range"
              />
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontSize: 20, fontWeight: 1000 }}
          >
            Rapid Drug Screen Results
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {form.drugPanels.map((panel, index) => (
              <Box
                key={panel.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  justifyContent: "space-between",
                  backgroundColor: index % 2 === 0 ? "white" : "grey.100",
                }}
              >
                <Typography variant="body2" sx={{ minWidth: 180 }}>
                  {panel.abbreviation} - {panel.full_name}
                </Typography>
                <Select
                  value={panel.result}
                  disabled={fieldDisabled}
                  onChange={(e) =>
                    handleDrugResultChange(
                      panel.id,
                      e.target.value as DrugResult
                    )
                  }
                  sx={{
                    minWidth: 120,
                    backgroundColor:
                      panel.result === "Negative"
                        ? "#d4edda"
                        : panel.result === "Positive"
                          ? "#f8d7da"
                          : "white",
                    "&.MuiSelect-select": {
                      color:
                        panel.result === "Negative"
                          ? "#155724"
                          : panel.result === "Positive"
                            ? "#d32f2f"
                            : "text.primary",
                    },
                  }}
                >
                  <MenuItem value="Verify">Verify</MenuItem>
                  <MenuItem value="Positive">Positive</MenuItem>
                  <MenuItem value="Negative">Negative</MenuItem>
                </Select>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontSize: 20, fontWeight: 1000 }}
          >
            Remarks
          </Typography>
          <FormControl fullWidth>
            <TextField
              multiline
              rows={4}
              value={form.remarks}
              disabled={fieldDisabled}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, remarks: e.target.value }))
              }
              placeholder="Enter notes, explanations, or other relevant information..."
            />
          </FormControl>
        </CardContent>
      </Card>

      {/* Client Signature */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontSize: 20, fontWeight: 1000 }}
          >
            Client Signature
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Please sign using your finger or stylus on this tablet screen.
          </Typography>

          {form.clientSignature && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Saved preview (draw again to replace)
              </Typography>
              <Box
                component="img"
                src={`data:image/png;base64,${form.clientSignature}`}
                alt="Client Signature Preview"
                sx={{
                  display: "block",
                  maxWidth: 200,
                  border: "1px solid",
                  borderColor: "divider",
                  p: 0.5,
                  mt: 0.5,
                  bgcolor: "common.white",
                }}
              />
            </Box>
          )}

          <SignatureCanvas
            key={`client-ua-sig-${sigPadKey}`}
            height={150}
            onSignatureChange={(base64) =>
              setForm((prev) => ({
                ...prev,
                clientSignature: base64,
                clientSignatureDate: base64
                  ? prev.clientSignatureDate || todayDateString()
                  : "",
              }))
            }
          />

          <FormControl fullWidth sx={{ mt: 1 }}>
            <FormLabel sx={{ fontSize: 20, fontWeight: 1000 }}>
              Signature Date
            </FormLabel>
            <TextField
              type="date"
              value={form.clientSignatureDate || ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  clientSignatureDate: e.target.value,
                }))
              }
              required
              disabled={!form.clientSignature}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </FormControl>
        </CardContent>
      </Card>

      {/* Administration Signature */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontSize: 20, fontWeight: 1000 }}
          >
            Administration Signature
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Administration may sign now or later via Open from history.
            FUTURE: role-gate this pad to Administration login.
          </Typography>

          {form.adminSignature && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Saved preview (draw again to replace)
              </Typography>
              <Box
                component="img"
                src={`data:image/png;base64,${form.adminSignature}`}
                alt="Administration Signature Preview"
                sx={{
                  display: "block",
                  maxWidth: 200,
                  border: "1px solid",
                  borderColor: "divider",
                  p: 0.5,
                  mt: 0.5,
                  bgcolor: "common.white",
                }}
              />
            </Box>
          )}

          <SignatureCanvas
            key={`admin-ua-sig-${sigPadKey}`}
            height={150}
            onSignatureChange={(base64) =>
              setForm((prev) => ({
                ...prev,
                adminSignature: base64,
                adminSignatureDate: base64
                  ? prev.adminSignatureDate || todayDateString()
                  : "",
              }))
            }
          />

          <FormControl fullWidth sx={{ mt: 1 }}>
            <FormLabel sx={{ fontSize: 20, fontWeight: 1000 }}>
              Signature Date
            </FormLabel>
            <TextField
              type="date"
              value={form.adminSignatureDate || ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  adminSignatureDate: e.target.value,
                }))
              }
              required={Boolean(form.adminSignature)}
              disabled={!form.adminSignature}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </FormControl>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2, mb: 4 }}>
        {isEditingExisting ? (
          <>
            <Button variant="contained" onClick={handleSaveSignatures}>
              Save signatures
            </Button>
            <Button variant="outlined" color="inherit" onClick={handleStartNew}>
              Cancel
            </Button>
          </>
        ) : (
          <Button variant="contained" onClick={handleSubmit}>
            Submit UA Form
          </Button>
        )}
      </Box>
    </Box>
  );
}
