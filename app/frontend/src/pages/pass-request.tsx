/**
 * PassRequestsPage - Manage pass request for residents.
 * 
 *  Data folw:
 *       passRequest.ts (store) => this page SELECTs request => displays + actions
 * 
 *  Features:
 *       - Submit new pass request (clients name + purpose)
 *       - View pending/approved/denied requests.
 *       - Approve with one click
 *       - Deny with optional comment
 *       - Enter key works on comment input (submit deny)
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
  Radio,
  RadioGroup,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addPassRequest, approvePassRequest, denyPassRequest } from "@/store/slices/passRequest";
import type { PassRequest } from "@/store/slices/passRequest";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PassRequestsPage() {
  // --- State ---
  const dispatch = useAppDispatch();
  const requests = useAppSelector((state) => state.passRequest.requests);

  const [residentName, setResidentName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [clientName, setClientName] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [passDateStart, setPassDateStart] = useState("");
  const [passDateEnd, setPassDateEnd] = useState("");
  const [is24HourPass, setIs24HourPass] = useState(false);
  const [canPassUA, setCanPassUA] = useState<"yes" | "no" | "idk">("idk");
  const [choreCovered, setChoreCovered] = useState(false);
  const [choreCoveredBy, setChoreCoveredBy] = useState("");
  const [onPremises, setOnPremises] = useState(false);
  const [offPremises, setOffPremises] = useState(false);
  const [passDuration, setPassDuration] = useState<"4h" | "12h" | "24h" | "48h">("24h");
  const [showComment, setShowComment] = useState<Record<string, boolean>>({});
  const [denyComments, setDenyComments] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string[]>([]);

  // --- Auto-fill End Date based on Start + Duration ---
  useEffect(() => {
    if (passDateStart && passDuration) {
      const start = new Date(passDateStart);
      const hours = parseInt(passDuration.replace('h', ''), 10);
      const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
      setPassDateEnd(end.toISOString());
    }
  }, [passDateStart, passDuration]);

  // --- Validation ---
  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!residentName.trim()) newErrors.push("Resident Name is required");
    if (!visitorName.trim()) newErrors.push("Visitor Name is required");
    if (!visitorPhone.trim()) newErrors.push("Visitor Phone is required");
    if (!passDateStart) newErrors.push("Pass Start Date is required");

    // 24-hour rule validation
    if (passDateStart) {
      const start = new Date(passDateStart);
      const now = new Date();
      const hoursDiff = (start.getTime() - now.getTime()) / (1000 * 3600);
      if (hoursDiff < 24) {
        newErrors.push("Pass Start Date must be at least 24 hours in advance");
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // --- Handlers ---
  const handleAdd = () => {
    if (!validateForm()) return;

    dispatch(
      addPassRequest({
        residentName: residentName.trim(),
        purpose: purpose.trim(),
        clientName: clientName.trim(),
        visitorName: visitorName.trim(),
        visitorPhone: visitorPhone.trim(),
        passStart: passDateStart,
        passEnd: passDateEnd,
        is24HourPass,
        canPassUA,
        choreCovered,
        choreCoveredBy: choreCoveredBy.trim(),
        onPremises,
        offPremises,
      })
    );

    setResidentName("");
    setPurpose("");
    setClientName("");
    setVisitorName("");
    setVisitorPhone("");
    setPassDateStart("");
    setPassDateEnd("");
    setPassDuration("24h");
    setIs24HourPass(false);
    setCanPassUA("yes");
    setChoreCovered(false);
    setChoreCoveredBy("");
    setOnPremises(false);
    setOffPremises(false);
    setErrors([]);
  };

  const handleApproved = (id: string) => {
    dispatch(approvePassRequest(id));
  };

  const handleDenySubmit = (id: string) => {
    dispatch(denyPassRequest({ id, comment: denyComments[id] || "" }));
    setShowComment((prev) => ({ ...prev, [id]: false }));
  };

  // --- Helper ---
  const capitalize = (s: string) => {
    if (!s) return s;
    return s.split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.substr(0, 3)}) ${digits.substr(3, 3)}-${digits.substr(6)}`;
    }
    return value;
  };

  // --- Render ---
  const pending = requests.filter((r) => r.status === "pending");
  const history = requests.filter((r) => r.status !== "pending");

  return (
    <Box sx={{ p: 3, maxWidth: 800 }}>
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

      {/* Submit Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Pass Request Submission
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl>
              <FormLabel sx={{ fontSize: 20, fontWeight: 1000 }}>Client Name</FormLabel>
              <TextField
                value={residentName}
                onChange={(e) => setResidentName(capitalize(e.target.value))}
                error={!!errors.find((e) => e.includes("Resident Name"))}
                helperText={errors.find((e) => e.includes("Resident Name"))}
              />
            </FormControl>

            <FormControl>
              <FormLabel sx={{ fontSize: 20, fontWeight: 1000 }}>Visitor(s) Name</FormLabel>
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

            <FormControl>
              <FormLabel sx={{ fontSize: 20, fontWeight: 500 }}>Pass Duration</FormLabel>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                  variant={passDuration === "4h" ? "contained" : "outlined"}
                  sx={{ bgcolor: passDuration === "4h" ? "action" : "transparent" }}
                  onClick={() => setPassDuration("4h")}
                >
                  4h
                </Button>
                <Button
                  variant={passDuration === "12h" ? "contained" : "outlined"}
                  color="warning"
                  sx={{ bgcolor: passDuration === "12h" ? "warning.main" : "transparent" }}
                  onClick={() => setPassDuration("12h")}
                >
                  12h
                </Button>
                <Button
                  variant={passDuration === "24h" ? "contained" : "outlined"}
                  color="info"
                  sx={{ bgcolor: passDuration === "24h" ? "info.main" : "transparent" }}
                  onClick={() => setPassDuration("24h")}
                >
                  24h
                </Button>
                <Button
                  variant={passDuration === "48h" ? "contained" : "outlined"}
                  color="secondary"
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
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>

            <FormControl sx={{ display: "flex", alignItems: "center", px: 2, py: 1, bgcolor: "grey.100", borderRadius: 1 }}>
              <FormLabel sx={{ fontSize: 14, fontWeight: 500, mb: 0 }}>End:</FormLabel>
              <Typography variant="body2" sx={{ ml: 1, color: passDateEnd ? "text.primary" : "text.disabled" }}>
                {passDateEnd ? new Date(passDateEnd).toLocaleString() : "Select start date and duration"}
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
              <FormLabel sx={{ fontSize: 20, fontWeight: 500 }}>Is your chore covered? (click for yes)</FormLabel>
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
                <FormLabel sx={{ fontSize: 20, fontWeight: 500 }}>
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

            <Button variant="contained" onClick={handleAdd}>
              Submit Request
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      <Typography variant="h5" gutterBottom>
        Pending Requests
      </Typography>
      {pending.map((req: PassRequest) => (
        <Card key={req.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography>
              <strong>{req.residentName}</strong> - {req.purpose}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {req.clientName && `Client: ${req.clientName}`}
              {req.visitorName && ` | Visitor: ${req.visitorName}`}
            </Typography>
            <Typography variant="caption">
              {new Date(req.submittedAt).toLocaleString()}
            </Typography>
            <Box sx={{ mt: 1, display: "flex", gap: 1, alignItems: "center" }}>
              <Button
                variant="contained"
                onClick={() => handleApproved(req.id)}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setShowComment((prev) => ({ ...prev, [req.id]: true }))}
              >
                Deny
              </Button>
              {showComment[req.id] && (
                <>
                  <TextField
                    size="small"
                    placeholder="Comment..."
                    value={denyComments[req.id] || ""}
                    onChange={(e) =>
                      setDenyComments((prev) => ({
                        ...prev,
                        [req.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleDenySubmit(req.id);
                      }
                    }}
                  />
                  <Button size="small" onClick={() => handleDenySubmit(req.id)}>
                    Submit
                  </Button>
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      ))}

      {/* History */}
      {history.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            History
          </Typography>
          {history.map((req: PassRequest) => (
            <Card key={req.id} variant="outlined">
              <CardContent sx={{ display: "flex", gap: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography>
                    <strong>{req.residentName}</strong> - {req.purpose}
                  </Typography>
                  {req.clientName && (
                    <Typography variant="body2">Client: {req.clientName}</Typography>
                  )}
                  {req.visitorName && (
                    <Typography variant="body2">Visitor: {req.visitorName}</Typography>
                  )}
                  {req.comment && (
                    <Typography variant="caption" color="text.secondary">
                      Comment: {req.comment}
                    </Typography>
                  )}
                </Box>
                <Box
                  sx={{
                    py: 0.5,
                    px: 1,
                    borderRadius: 1,
                    bgcolor:
                      req.status === "approved" ? "success.light" : "error.light",
                    fontWeight: "bold",
                  }}
                >
                  {req.status}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}