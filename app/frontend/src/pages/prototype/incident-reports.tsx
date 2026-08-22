/**
 * Incident Reports Page
 *
 * Purpose: Digital replica of Hope House's paper Incident Report form
 *
 * Data flow:
 *   incidentReports.ts (store) => this page SELECTs pendingReport => form fields dispatch updates
 *
 * Notes:
 *   - pendingReport starts as null in the slice. We must initialize a draft
 *     before reading .date / .clients / .witnesses or the page will crash.
 *   - MUI v9 Grid uses size={...}, not the old item xs={...} API.
 */

import { useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Checkbox,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";

import type { RootState } from "../../store";
import {
  initializeNewReport,
  updateDate,
  updateTime,
  updateLocation,
  updateIncidentType,
  updateDescription,
  updateMedicalAttention,
  addEmergencyService,
  removeEmergencyService,
  addResponder,
  removeResponder,
  updateResponder,
  updateFollowUp,
  updateClient,
  addClient,
  removeClient,
  updateWitness,
  addWitness,
  removeWitness,
  updateClientSignature,
  markClientUnableOrRefused,
  updateAdminSignature,
  submitReport,
} from "../../store/slices/prototype/incidentReports";
import type { IncidentType } from "../../store/slices/prototype/incidentReports";
// Same tablet signature pad used on the UA form
import SignatureCanvas from "../../components/SignatureCanvas";
import IncidentReportsNav from "./incident-reports/IncidentReportsNav";

// --- Text helpers (same idea as UA form + kitchen menus) ---

/**
 * Names / places: Title Case each word.
 * "john SMITH" → "John Smith"; keeps spaces while typing.
 * Hyphenated: "mary-jane" → "Mary-Jane"
 */
const toTitleCase = (s: string): string =>
  s
    .split(/(\s+)/)
    .map((part) => {
      if (part.length === 0 || /^\s+$/.test(part)) return part;
      return part
        .split("-")
        .map((word) =>
          word.length === 0
            ? word
            : word[0]!.toUpperCase() + word.slice(1).toLowerCase()
        )
        .join("-");
    })
    .join("");

/**
 * Narrative text: trim, collapse spaces, capitalize sentence starts,
 * ensure ending . ! or ?
 * Applied on blur so mid-typing is not jerky.
 */
const cleanSentence = (s: string): string => {
  let t = s.trim().replace(/\s+/g, " ");
  if (!t) return "";
  // Capitalize first alphabetic char
  const firstAlpha = t.search(/[a-zA-Z]/);
  if (firstAlpha >= 0) {
    t =
      t.slice(0, firstAlpha) +
      t[firstAlpha]!.toUpperCase() +
      t.slice(firstAlpha + 1);
  }
  // After . ! ? + space, capitalize next letter
  t = t.replace(/([.!?]\s+)([a-z])/g, (_m, punc: string, letter: string) => {
    return punc + letter.toUpperCase();
  });
  if (!/[.!?]$/.test(t)) {
    t = `${t}.`;
  }
  return t;
};

/** Phone: digits only → (XXX) XXX-XXXX when 10 digits (UA pattern) */
const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  // Allow partial typing without fighting the user
  return value;
};

export default function IncidentReportsPage() {
  const dispatch = useDispatch();

  // pendingReport is null until we start a draft
  const pendingReport = useSelector((state: RootState) => state.incidentReports.pendingReport);

  // Create one empty draft when the page opens
  useEffect(() => {
    if (!pendingReport) {
      dispatch(initializeNewReport());
    }
  }, [pendingReport, dispatch]);

  const incidentTypeOptions: IncidentType[] = [
    "Injury",
    "Client Conflict",
    "Rule / Policy Violation",
    "Property Damage",
    "Medical",
    "Behavioral",
    "Safety / Security",
    "Accident",
    "Other",
  ];

  // Slice starts as null — do not read .date until a draft exists
  if (!pendingReport) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading incident report...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Incident Report
      </Typography>
      <IncidentReportsNav />

      {/* Incident Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontSize: 20, fontWeight: 1000 }}>
            Incident Information
          </Typography>
          <Grid size={12}>
            <Typography variant="body1">Incident #</Typography>
            <TextField
              fullWidth
              value={pendingReport.incidentNumber}
              // MUI v9: slotProps replaces older InputProps
              slotProps={{ input: { readOnly: true } }}
              sx={{ backgroundColor: "grey.100" }}
            />
          </Grid>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body1">Date</Typography>
              {/* date only — not datetime-local */}
              <TextField
                type="date"
                fullWidth
                value={pendingReport.date}
                onChange={(e) => dispatch(updateDate(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body1">Time</Typography>
              <TextField
                type="time"
                fullWidth
                value={pendingReport.time}
                onChange={(e) => dispatch(updateTime(e.target.value))}
              />
            </Grid>
            <Grid size={12}>
              <Typography variant="body1">Location</Typography>
              <TextField
                fullWidth
                value={pendingReport.location}
                onChange={(e) =>
                  dispatch(updateLocation(toTitleCase(e.target.value)))
                }
                placeholder="e.g., Dining Room, Bedroom 3, etc."
              />
            </Grid>
            <Grid size={12}>
              <Typography variant="body1">Incident Type</Typography>
              <TextField
                select
                fullWidth
                value={pendingReport.incidentType}
                onChange={(e) => dispatch(updateIncidentType(e.target.value as IncidentType))}
              >
                {incidentTypeOptions.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Clients Involved */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontSize: 20, fontWeight: 1000 }}>
            Clients Involved
          </Typography>

          {pendingReport.clients.map((client) => (
            <Grid container spacing={1} key={client.id} sx={{ mb: 1 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  value={client.firstName}
                  onChange={(e) =>
                    dispatch(
                      updateClient({
                        clientId: client.id,
                        updates: { firstName: toTitleCase(e.target.value) },
                      })
                    )
                  }
                  placeholder="First Name"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  value={client.lastName}
                  onChange={(e) =>
                    dispatch(
                      updateClient({
                        clientId: client.id,
                        updates: { lastName: toTitleCase(e.target.value) },
                      })
                    )
                  }
                  placeholder="Last Name"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  select
                  fullWidth
                  value={client.relationship}
                  onChange={(e) =>
                    dispatch(
                      updateClient({
                        clientId: client.id,
                        updates: { relationship: e.target.value },
                      })
                    )
                  }
                >
                  <MenuItem value="Primary">Primary</MenuItem>
                  <MenuItem value="Secondary">Secondary</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => dispatch(removeClient(client.id))}
                >
                  Remove
                </Button>
              </Grid>
            </Grid>
          ))}

          {/* Add stays outside the map so it is not repeated on every row */}
          <Button variant="outlined" onClick={() => dispatch(addClient())}>
            Add Client
          </Button>
        </CardContent>
      </Card>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontSize: 20, fontWeight: 1000 }}>
            Description of Incident
          </Typography>
          {/* maxRows={#} add this under minRow={6} if you need a cap on how many lines in future */}
          <TextField
            fullWidth
            multiline
            minRows={6}
            value={pendingReport.description}
            onChange={(e) => dispatch(updateDescription(e.target.value))}
            onBlur={(e) =>
              dispatch(updateDescription(cleanSentence(e.target.value)))
            }
            placeholder="Describe what happened, who was involved, and any injury or damage..."
          />
        </CardContent>
      </Card>

      {/* Witnesses */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontSize: 20, fontWeight: 1000 }}>
            Witnesses
          </Typography>

          {pendingReport.witnesses.map((witness) => (
            <Grid container spacing={1} key={witness.id} sx={{ mb: 1 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  value={witness.name}
                  onChange={(e) =>
                    dispatch(
                      updateWitness({
                        witnessId: witness.id,
                        updates: { name: toTitleCase(e.target.value) },
                      })
                    )
                  }
                  placeholder="Witness Name"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  select
                  fullWidth
                  value={witness.relationship}
                  onChange={(e) =>
                    dispatch(
                      updateWitness({
                        witnessId: witness.id,
                        updates: {
                          relationship: e.target.value as "Client" | "Staff" | "Volunteer" | "Other",
                        },
                      })
                    )
                  }
                >
                  <MenuItem value="Client">Client</MenuItem>
                  <MenuItem value="Staff">Staff</MenuItem>
                  <MenuItem value="Volunteer">Volunteer</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  value={witness.phone || ""}
                  onChange={(e) =>
                    dispatch(
                      updateWitness({
                        witnessId: witness.id,
                        updates: { phone: formatPhone(e.target.value) },
                      })
                    )
                  }
                  placeholder="Phone"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  fullWidth
                  type="email"
                  value={witness.email || ""}
                  onChange={(e) =>
                    dispatch(
                      updateWitness({
                        witnessId: witness.id,
                        updates: { email: e.target.value },
                      })
                    )
                  }
                  placeholder="Email"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 1 }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => dispatch(removeWitness(witness.id))}
                >
                  Remove
                </Button>
              </Grid>
            </Grid>
          ))}

          <Button variant="outlined" onClick={() => dispatch(addWitness())}>
            Add Witness
          </Button>
        </CardContent>
      </Card>
      {/* Medical — detail fields only when needed is on */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontSize: 20, fontWeight: 1000 }}>
            Medical Attention
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={pendingReport.medicalAttention.needed}
                onChange={(e) =>
                  dispatch(
                    // Switch on/off is boolean — use .checked, not .value
                    updateMedicalAttention({ needed: e.target.checked })
                  )
                }
              />
            }
            label="Was medical attention needed or provided?"
          />

          {pendingReport.medicalAttention.needed && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={pendingReport.medicalAttention.firstAidGiven}
                      onChange={(e) =>
                        dispatch(
                          updateMedicalAttention({
                            firstAidGiven: e.target.checked,
                          })
                        )
                      }
                    />
                  }
                  label="First aid given?"
                />
              </Grid>

              {pendingReport.medicalAttention.firstAidGiven && (
                <Grid size={12}>
                  <Typography variant="body1">Who provided first aid?</Typography>
                  <TextField
                    fullWidth
                    value={pendingReport.medicalAttention.firstAidProvider || ""}
                    onChange={(e) =>
                      dispatch(
                        updateMedicalAttention({
                          firstAidProvider: toTitleCase(e.target.value),
                        })
                      )
                    }
                    placeholder="Name / role"
                  />
                </Grid>
              )}

              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={pendingReport.medicalAttention.called911}
                      onChange={(e) =>
                        dispatch(
                          updateMedicalAttention({
                            called911: e.target.checked,
                          })
                        )
                      }
                    />
                  }
                  label="911 called?"
                />
              </Grid>

              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={pendingReport.medicalAttention.ambulanceCalled}
                      onChange={(e) =>
                        dispatch(
                          updateMedicalAttention({
                            ambulanceCalled: e.target.checked,
                          })
                        )
                      }
                    />
                  }
                  label="Ambulance / EMS called?"
                />
              </Grid>

              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={pendingReport.medicalAttention.transported}
                      onChange={(e) =>
                        dispatch(
                          updateMedicalAttention({
                            transported: e.target.checked,
                          })
                        )
                      }
                    />
                  }
                  label="Transported for medical care?"
                />
              </Grid>

              <Grid size={12}>
                <Typography variant="body1">Medical notes</Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  value={pendingReport.medicalAttention.medicalNotes || ""}
                  onChange={(e) =>
                    dispatch(
                      updateMedicalAttention({
                        medicalNotes: e.target.value,
                      })
                    )
                  }
                  onBlur={(e) =>
                    dispatch(
                      updateMedicalAttention({
                        medicalNotes: cleanSentence(e.target.value),
                      })
                    )
                  }
                  placeholder="Injuries, treatment, hospital, etc."
                />
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Emergency / outside services — multi-select + responder rows
          BACKEND TODO: persist responders; no outside case numbers */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontSize: 20, fontWeight: 1000 }}>
            Emergency / Outside Services
          </Typography>

          <Typography variant="body2" sx={{ mb: 1 }}>
            Were emergency/outside services contacted? Check all that apply.
          </Typography>

          {(
            [
              "Police",
              "Fire Department",
              "EMS / Ambulance",
              "Other",
            ] as const
          ).map((service) => {
            const checked = pendingReport.emergencyServices.includes(service);
            return (
              <FormControlLabel
                key={service}
                control={
                  <Checkbox
                    checked={checked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        dispatch(addEmergencyService(service));
                      } else {
                        dispatch(removeEmergencyService(service));
                      }
                    }}
                  />
                }
                label={service}
              />
            );
          })}

          {pendingReport.emergencyServices.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Responders
              </Typography>

              {pendingReport.responders.map((responder) => (
                <Grid container spacing={1} key={responder.id} sx={{ mb: 1 }}>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      select
                      fullWidth
                      label="Service"
                      value={responder.service}
                      onChange={(e) =>
                        dispatch(
                          updateResponder({
                            responderId: responder.id,
                            updates: {
                              service: e.target.value as
                                | "Police"
                                | "Fire Department"
                                | "EMS / Ambulance"
                                | "Other",
                            },
                          })
                        )
                      }
                    >
                      {pendingReport.emergencyServices.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={responder.name || ""}
                      onChange={(e) =>
                        dispatch(
                          updateResponder({
                            responderId: responder.id,
                            updates: { name: toTitleCase(e.target.value) },
                          })
                        )
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 2 }}>
                    <TextField
                      fullWidth
                      label="Badge / ID"
                      value={responder.badgeId || ""}
                      onChange={(e) =>
                        dispatch(
                          updateResponder({
                            responderId: responder.id,
                            updates: { badgeId: e.target.value },
                          })
                        )
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 2 }}>
                    <TextField
                      fullWidth
                      label="Agency"
                      value={responder.agency || ""}
                      onChange={(e) =>
                        dispatch(
                          updateResponder({
                            responderId: responder.id,
                            updates: { agency: toTitleCase(e.target.value) },
                          })
                        )
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 1 }}>
                    <TextField
                      fullWidth
                      label="Unit #"
                      value={responder.unit || ""}
                      onChange={(e) =>
                        dispatch(
                          updateResponder({
                            responderId: responder.id,
                            updates: { unit: e.target.value },
                          })
                        )
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 1 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => dispatch(removeResponder(responder.id))}
                    >
                      Remove
                    </Button>
                  </Grid>
                </Grid>
              ))}

              <Button variant="outlined" onClick={() => dispatch(addResponder())}>
                Add Responder
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontSize: 20, fontWeight: 1000 }}>
            Follow-up
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={pendingReport.followUp.requiresFollowUp}
                onChange={(e)=>
                  dispatch(
                    updateFollowUp({
                      requiresFollowUp: e.target.checked,
                    })
                  )
                }
              />
            }
            label="Does this incident require follow-up"
          />

          {pendingReport.followUp.requiresFollowUp && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">Follow-up notes</Typography>
              <TextField
                fullWidth
                multiline
                minRows={3}
                value={pendingReport.followUp.notes || ""}
                onChange={(e) =>
                  dispatch(
                    updateFollowUp({
                      requiresFollowUp: true,
                      notes: e.target.value,
                    })
                  )
                }
                onBlur={(e) =>
                  dispatch(
                    updateFollowUp({
                      requiresFollowUp: true,
                      notes: cleanSentence(e.target.value),
                    })
                  )
                }
                placeholder="What still needs to happen, who owns it, target date..."
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Signatures — one pad per involved client + Administration
          Pattern copied from ua-form.tsx (SignatureCanvas → Base64 PNG)
          BACKEND TODO: store signature images with the incident record */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontSize: 20, fontWeight: 1000 }}>
            Signatures
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Each involved client signs below (tablet finger/stylus). Use Unable / Refused if a
            signature cannot be collected so the report is not stuck forever.
          </Typography>

          {pendingReport.clients.map((client, index) => {
            const displayName =
              [client.firstName, client.lastName].filter(Boolean).join(" ").trim() ||
              `Client ${index + 1}`;
            const unable = Boolean(client.unableOrRefusedToSign);

            return (
              <Box
                key={client.id}
                sx={{
                  mb: 3,
                  p: 2,
                  border: "1px solid",
                  borderColor: "grey.300",
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  {displayName}
                  {client.relationship ? ` (${client.relationship})` : ""}
                </Typography>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={unable}
                      onChange={(e) =>
                        dispatch(
                          markClientUnableOrRefused({
                            clientId: client.id,
                            unableOrRefused: e.target.checked,
                            // Keep prior reason when re-checking; clear handled below if unchecked
                            reason: e.target.checked
                              ? client.unableOrRefusedReason || ""
                              : "",
                          })
                        )
                      }
                    />
                  }
                  label="Unable / Refused to Sign"
                />

                {unable ? (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body1">Reason (required)</Typography>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      value={client.unableOrRefusedReason || ""}
                      onChange={(e) =>
                        dispatch(
                          markClientUnableOrRefused({
                            clientId: client.id,
                            unableOrRefused: true,
                            reason: e.target.value,
                          })
                        )
                      }
                      onBlur={(e) =>
                        dispatch(
                          markClientUnableOrRefused({
                            clientId: client.id,
                            unableOrRefused: true,
                            reason: cleanSentence(e.target.value),
                          })
                        )
                      }
                      placeholder="Why the client could not or would not sign..."
                    />
                  </Box>
                ) : (
                  <>
                    <SignatureCanvas
                      height={150}
                      onSignatureChange={(base64) => {
                        // Auto-stamp signature date (type=date) when pad captures ink
                        const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD local
                        dispatch(
                          updateClientSignature({
                            clientId: client.id,
                            signature: base64,
                            date: base64
                              ? client.signatureDate || today
                              : "",
                          })
                        );
                      }}
                    />

                    <Typography variant="body1" sx={{ mt: 1 }}>
                      Signature Date
                    </Typography>
                    <TextField
                      type="date"
                      fullWidth
                      value={client.signatureDate || ""}
                      onChange={(e) =>
                        dispatch(
                          updateClient({
                            clientId: client.id,
                            updates: { signatureDate: e.target.value },
                          })
                        )
                      }
                      disabled={!client.signature}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />

                    {client.signature ? (
                      <Box sx={{ mt: 2 }}>
                        <img
                          src={`data:image/png;base64,${client.signature}`}
                          alt={`${displayName} signature preview`}
                          style={{
                            maxWidth: "200px",
                            border: "1px solid #ddd",
                            padding: "5px",
                          }}
                        />
                      </Box>
                    ) : null}
                  </>
                )}
              </Box>
            );
          })}

          {/* Administration — same wording as UA form */}
          <Box
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "grey.300",
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Administration
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Administration may sign after reviewing the report.
            </Typography>

            <SignatureCanvas
              height={150}
              onSignatureChange={(base64) => {
                const today = new Date().toLocaleDateString("en-CA");
                dispatch(
                  updateAdminSignature({
                    signature: base64,
                    date: base64
                      ? pendingReport.adminSignatureDate || today
                      : "",
                  })
                );
              }}
            />

            <Typography variant="body1" sx={{ mt: 1 }}>
              Signature Date
            </Typography>
            <TextField
              type="date"
              fullWidth
              value={pendingReport.adminSignatureDate || ""}
              onChange={(e) =>
                dispatch(
                  updateAdminSignature({
                    signature: pendingReport.adminSignature || "",
                    date: e.target.value,
                  })
                )
              }
              disabled={!pendingReport.adminSignature}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            {pendingReport.adminSignature ? (
              <Box sx={{ mt: 2 }}>
                <img
                  src={`data:image/png;base64,${pendingReport.adminSignature}`}
                  alt="Administration signature preview"
                  style={{
                    maxWidth: "200px",
                    border: "1px solid #ddd",
                    padding: "5px",
                  }}
                />
              </Box>
            ) : null}
          </Box>
        </CardContent>
      </Card>

      {/* Submit — mock only; pushes draft into reports[] as pending
          BACKEND TODO: POST incident + real validation rules */}
      <Box sx={{ display: "flex", gap: 2, mt: 2, mb: 4 }}>
        <Button
          variant="contained"
          onClick={() => {
            // Lightweight front-end guard — expand later if needed
            if (!pendingReport.date || !pendingReport.time) {
              window.alert("Date and Time are required before submit.");
              return;
            }
            if (!pendingReport.location.trim()) {
              window.alert("Location is required before submit.");
              return;
            }
            // Each client: signature OR unable/refused with a reason
            for (const client of pendingReport.clients) {
              const name =
                [client.firstName, client.lastName].filter(Boolean).join(" ") ||
                "A client";
              if (client.unableOrRefusedToSign) {
                if (!client.unableOrRefusedReason?.trim()) {
                  window.alert(
                    `${name}: add a reason for Unable / Refused to Sign.`
                  );
                  return;
                }
              } else if (!client.signature) {
                window.alert(
                  `${name}: signature required, or mark Unable / Refused.`
                );
                return;
              }
            }
            dispatch(submitReport());
            // initializeNewReport runs again via useEffect when pendingReport becomes null
            window.alert("Incident report submitted (pending). Mock only.");
          }}
        >
          Submit Incident Report
        </Button>
      </Box>
    </Box>
  );
}
