/**
* ============================================================================
* MAINTENANCE REQUESTS — living STATUS (authoritative for this feature)
* Branch: feature/maintenance-requests (off develop)
* Updated: 2026-08-22 — Phase 4 My list/detail/timeline COMPLETE (await commit)
* STOPPING POINT: Phase 4 UI done. Manual test in progress or done.
*   Commit Phase 4 when approved. Do not start Phase 5 (Add info / cancel)
*   until Phase 4 approved.
* ============================================================================
* MODEL
* - Client submits one item per request (MR-YYYY-#### mock FE; BE later).
* - Client-visible statuses: Submitted → … → Completed / Cancellation
*   Requested / Closed - No Work Needed.
* - Original request immutable; Add Information / cancel = timeline later (Ph5).
* - Locations seeded; staff catalog admin later. Specific Area/Room optional
*   free text (helps locate; blank OK). Item free text later suggestions.
* - Dup/recurring advisory only (parked Phase 6). No Mike UI in client v1.
* - Confirm copy: includes real MR# + in queue — never claim acknowledged.
* - Photos: optional max 3; FE mock data URLs; BE blob storage later.
* - My Requests: filter by DEV client id now; auth user later.
*
* DONE — Phase 1 (commit 08d1ff3)
* - features/maintenance-requests: types, config, devFixtures, api notes
* - Redux slice + store register; route/nav Handyman
* - Page shell New|My; one-item notice; DEV as-client + reset
*
* DONE — Phase 2 COMPLETE (e30fb00 form · bf48e01 normalize · + confirm MR#)
* - Submit form fields 1–7; MR#; queue confirm; normalize free-text
*
* DONE — Phase 3 photos (e7a22bf)
* - Optional photos max 3; picker + previews; mock data URLs
*
* DONE — Phase 4 My Requests (code on disk; commit when approved)
* - Filter tickets to active DEV client (later auth)
* - List: MR#, status Chip, Chicago submitted, location/area/item, photo count
* - Click row → detail (original fields read-only) + photo thumbs
* - Timeline read (oldest first); submitted event from create
* - Empty state; Close detail / toggle select
*
* NEXT — Phase 5 (not started)
* - Client Add Information + Request Cancellation (timeline events;
*   cancel ≠ auto-close)
*
* PARKED
* - Dup/recurring (Ph6), full DEV seed + Mike status sim (Ph7)
* - Staff-on-behalf; location admin UI; backend/API; Open/Closed filters
* - Explicit Take photo vs Upload buttons (picker only today)
*
* DEV NOTES
* - import.meta.env.DEV only for as-client UI + localStorage
* - Key: hhg-dev-maintenance-requests-v1 (DEV_MR_STORAGE_KEY)
* - devFixtures.ts load/save/clear; Reset → Alex + empty requests
* - Large data-URL photos may bloat DEV localStorage — mock only
* - Not security; removable for production
*
* PATHS
* - pages/maintenance-requests/index.tsx     ← UI + this STATUS
* - features/maintenance-requests/types.ts
* - features/maintenance-requests/config.ts
* - features/maintenance-requests/mrNumber.ts
* - features/maintenance-requests/normalizeClientText.ts
* - features/maintenance-requests/devFixtures.ts
* - features/maintenance-requests/apiBoundaryNotes.ts
* - store/slices/maintenanceRequests.ts
* - routes.tsx → /maintenance-requests
*
* HARD LOCKS
* - Client-side only; no Mike management UI this phase
* - Single route /maintenance-requests
* - America/Chicago for MR year + display when dates shown
* - FE hide / DEV chips ≠ security
* - Ignore removed old MaintenanceTicket model
* - Confirmation must NOT say Maintenance acknowledged
* - Max 3 optional photos; never required for submit
* - Original body immutable; Ph4 is read-only list/detail/timeline
*
* ============================================================================
* Backend Handoff / Notes for TJ
* ============================================================================
* See features/maintenance-requests/apiBoundaryNotes.ts
* Current: in-memory + DEV localStorage mock; no API.
* Submit payload shape: SubmitMaintenanceRequestInput (+ optional photos[]) +
*   server fills id, requestNumber, submittedAt, submitter, status=Submitted,
*   timeline; photos → blob storage (not long-term base64 in JSON).
* List/detail: GET own tickets only; timeline append-only events.
* ============================================================================
*/


import { useMemo, useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { store } from "@/store";
import {
  resetDevMrState,
  setDevActiveClient,
  submitMaintenanceRequest,
} from "@/store/slices/maintenanceRequests";
import {
  DEV_MOCK_CLIENTS,
  DEV_MR_STORAGE_KEY,
  ONE_ITEM_PER_REQUEST_NOTICE,
  MAINTENANCE_CATEGORIES,
  MAX_MAINTENANCE_PHOTOS,
  INITIAL_MAINTENANCE_LOCATIONS,
  MAINTENANCE_REQUEST_STATUSES,
  SAFETY_UNSAFE_CLIENT_WARNING,
} from "@/features/maintenance-requests/config";
import type {
  MaintenanceCategory,
  MaintenanceRequestsView,
  MaintenanceRequestPhoto,
  SafetyUsableAnswer,
} from "@/features/maintenance-requests/types";
import { normalizeClientText } from "@/features/maintenance-requests/normalizeClientText";

export default function MaintenanceRequestsPage() {
  const dispatch = useAppDispatch();
  const { activeDevClientId, activeDevClientName, locations, requests } =
    useAppSelector((s) => s.maintenanceRequests);

  const [view, setView] = useState<MaintenanceRequestsView>("new");

  // --- Phase 2 - 3 ---
  const [locationId, setLocationId] = useState("");
  const [areaOrRoom, setAreaOrRoom] = useState("");
  const [item, setItem] = useState("");
  const [category, setCategory] = useState<MaintenanceCategory | "">("");
  const [stillUsableSafely, setStillUsableSafely] = useState<
    SafetyUsableAnswer | ""
  >("");
  const [problemDescription, setProblemDescription] = useState("");
  const [hasAdditionalNotes, setHasAdditionalNotes] = useState<"yes" | "no">(
    "no"
  );
  const [additionalNotes, setAdditionalNotes] = useState("");
  /** Optional photos for this submit (max MAX_MAINTENANCE_PHOTOS). */
  const [photos, setPhotos] = useState<MaintenanceRequestPhoto[]>([]);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  /** Set after successful submit — queue message only (not acknowledged). */
  const [submitConfirmation, setSubmitConfirmation] = useState<string | null>(
    null
  );

  // --- Phase 4: MyRequests (list only this step) ---
  /** Which ticket is open in detail - wired in Task 2; keep null for now. */
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );

  /** Tickets for the active DEV client only (later: auth user id). */
  const myRequests = useMemo(() => {
    return requests
      .filter((r) => r.submittedByClientId === activeDevClientId)
      .slice()
      .sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
      );
  }, [requests, activeDevClientId]);

  /** Open detail ticket (must be in myRequests - not other clients). */
  const selectedRequest = useMemo(() => {
    if (!selectedRequestId) return null;
    return myRequests.find((r) => r.id === selectedRequestId) ?? null;
  }, [myRequests, selectedRequestId]);

  const activeLocations = useMemo(
    () => locations.filter((l) => !l.archived),
    [locations]
  );

  const clearNewRequestForm = () => {
    setLocationId("");
    setAreaOrRoom("");
    setItem("");
    setCategory("");
    setStillUsableSafely("");
    setProblemDescription("");
    setHasAdditionalNotes("no");
    setAdditionalNotes("");
    setPhotos([]);
    setFormErrors([]);
  };

  /** Blur/submit free-text cleanup (formatting only). */
  const blurAreaOrRoom = () => {
    setAreaOrRoom((v) => normalizeClientText(v, "phrase"));
  };
  const blurItem = () => {
    setItem((v) => normalizeClientText(v, "phrase"));
  };
  const blurProblemDescription = () => {
    setProblemDescription((v) => normalizeClientText(v, "sentence"));
  };
  const blurAdditionalNotes = () => {
    setAdditionalNotes((v) => normalizeClientText(v, "sentence"));
  };

  /**
   * Phase 3: pick image files → mock MaintenanceRequestPhoto (data URL).
   * Caps at MAX_MAINTENANCE_PHOTOS. Non-images ignored.
   * BACKEND later: real upload, not base64 in Redux/localStorage.
   */
  const handlePhotoFilesSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const room = MAX_MAINTENANCE_PHOTOS - photos.length;
    if (room <= 0) return;

    const picked = Array.from(fileList)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, room);

    if (picked.length === 0) return;

    picked.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = typeof reader.result === "string" ? reader.result : "";
        if (!dataUrl) return;
        const photo: MaintenanceRequestPhoto = {
          id:
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `photo-${Date.now()}-${file.name}`,
          dataUrl,
          fileName: file.name || "photo",
          addedAt: new Date().toISOString(),
        };
        setPhotos((prev) => {
          if (prev.length >= MAX_MAINTENANCE_PHOTOS) return prev;
          return [...prev, photo].slice(0, MAX_MAINTENANCE_PHOTOS);
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhotoAt = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmitNewRequest = (e: FormEvent) => {
    e.preventDefault();
    setSubmitConfirmation(null);

    // Normalize free text before validate + dispatch (blur may have been skipped)
    const cleanArea = normalizeClientText(areaOrRoom, "phrase");
    const cleanItem = normalizeClientText(item, "phrase");
    const cleanProblem = normalizeClientText(problemDescription, "sentence");
    const cleanNotes =
      hasAdditionalNotes === "yes"
        ? normalizeClientText(additionalNotes, "sentence")
        : "";

    setAreaOrRoom(cleanArea);
    setItem(cleanItem);
    setProblemDescription(cleanProblem);
    if (hasAdditionalNotes === "yes") {
      setAdditionalNotes(cleanNotes);
    }

    const errors: string[] = [];
    if (!locationId) errors.push("Location is required.");
    if (!cleanItem.trim()) errors.push("Item is required.");
    if (!category) errors.push("Category is required.");
    if (!stillUsableSafely) {
      errors.push(
        "Please answer whether the area/item can still be used safely."
      );
    }
    if (!cleanProblem.trim()) {
      errors.push("Describe the problem is required.");
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors([]);

    dispatch(
      submitMaintenanceRequest({
        locationId,
        areaOrRoom: cleanArea,
        item: cleanItem,
        category: category as MaintenanceCategory,
        stillUsableSafely: stillUsableSafely as SafetyUsableAnswer,
        problemDescription: cleanProblem,
        hasAdditionalNotes: hasAdditionalNotes === "yes",
        additionalNotes:
          hasAdditionalNotes === "yes" ? cleanNotes || undefined : undefined,
        photos,
      })
    );

    // Actual MR# from the ticket just created (slice unshifts newest first)
    const created =
      store.getState().maintenanceRequests.requests[0] ?? null;
    const mrLabel = created?.requestNumber ?? "MR-????-????";
    setSubmitConfirmation(
      `Maintenance request ${mrLabel} was submitted. Your request has been added to the maintenance queue. Maintenance has not acknowledged it yet. You can check My Requests for updates.`
    );
    clearNewRequestForm();
  };

  const isDev = import.meta.env.DEV;

  const activeLocationCount = useMemo(
    () => locations.filter((l) => !l.archived).length,
    [locations]
  );

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Page title */}
      <Typography variant="h4" component="h1">
        Maintenance Requests
      </Typography>

      {/* DEV foundation — as client + storage note (not production) */}
      {isDev && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderStyle: "dashed",
            borderColor: "warning.main",
            bgcolor: "warning.50",
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            DEV only — mock client (not real auth)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Switch who you are pretending to be. Persistence key:{" "}
            <code>{DEV_MR_STORAGE_KEY}</code>. Full seed pack / status sim =
            later phase.
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
            {DEV_MOCK_CLIENTS.map((c) => (
              <Chip
                key={c.id}
                label={c.displayName}
                color={c.id === activeDevClientId ? "primary" : "default"}
                variant={c.id === activeDevClientId ? "filled" : "outlined"}
                onClick={() => dispatch(setDevActiveClient(c.id))}
                clickable
              />
            ))}
          </Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Active: <strong>{activeDevClientName}</strong> ({activeDevClientId})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Catalog check: {activeLocationCount} locations ·{" "}
            {MAINTENANCE_CATEGORIES.length} categories ·{" "}
            {MAINTENANCE_REQUEST_STATUSES.length} statuses · {requests.length}{" "}
            mock request(s) · seed names: {INITIAL_MAINTENANCE_LOCATIONS.length}
          </Typography>
          <Button
            type="button"
            size="small"
            variant="outlined"
            color="warning"
            onClick={() => {
              dispatch(resetDevMrState());
              dispatch(setDevActiveClient("dev-client-alex"));
            }}
          >
            Reset DEV MR state
          </Button>
        </Paper>
      )}

      {/* New | My Requests */}
      <Tabs
        value={view}
        onChange={(_e, next: MaintenanceRequestsView) => setView(next)}
        aria-label="Maintenance Requests sections"
      >
        <Tab value="new" label="New Request" />
        <Tab value="mine" label="My Requests" />
      </Tabs>

      {view === "new" && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Alert severity="info">{ONE_ITEM_PER_REQUEST_NOTICE}</Alert>

          {submitConfirmation && (
            <Alert
              severity="success"
              onClose={() => setSubmitConfirmation(null)}
            >
              {submitConfirmation}
            </Alert>
          )}

          {formErrors.length > 0 && (
            <Alert severity="error">
              {formErrors.map((err) => (
                <div key={err}>{err}</div>
              ))}
            </Alert>
          )}

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              New Request
            </Typography>
            {isDev && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Submitting as DEV client: {activeDevClientName}
              </Typography>
            )}

            <Box
              component="form"
              id="mr-new-request-form"
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              onSubmit={handleSubmitNewRequest}
            >
              {/* 1. Location */}
              <TextField
                select
                required
                label="Location"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                fullWidth
              >
                <MenuItem value="">
                  <em>Select location</em>
                </MenuItem>
                {activeLocations.map((loc) => (
                  <MenuItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </MenuItem>
                ))}
              </TextField>

              {/* 2. Specific Area / Room (optional) */}
              <TextField
                label="Specific Area / Room (optional)"
                value={areaOrRoom}
                onChange={(e) => setAreaOrRoom(e.target.value)}
                onBlur={blurAreaOrRoom}
                fullWidth
                helperText="Add a room number or more specific area only if it helps locate the problem."
              />

              {/* 3. Item */}
              <TextField
                required
                label="Item"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                onBlur={blurItem}
                fullWidth
              />

              {/* 4. Category */}
              <TextField
                select
                required
                label="Category"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as MaintenanceCategory | "")
                }
                fullWidth
              >
                <MenuItem value="">
                  <em>Select category</em>
                </MenuItem>
                {MAINTENANCE_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>

              {/* 5. Safety */}
              <FormControl required>
                <FormLabel id="mr-safety-label">
                  Can this area/item still be used safely?
                </FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="mr-safety-label"
                  value={stillUsableSafely}
                  onChange={(e) =>
                    setStillUsableSafely(e.target.value as SafetyUsableAnswer)
                  }
                >
                  <FormControlLabel
                    value="Yes"
                    control={<Radio />}
                    label="Yes"
                  />
                  <FormControlLabel value="No" control={<Radio />} label="No" />
                  <FormControlLabel
                    value="Not Sure"
                    control={<Radio />}
                    label="Not Sure"
                  />
                </RadioGroup>
                {stillUsableSafely === "No" && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    {SAFETY_UNSAFE_CLIENT_WARNING}
                  </Alert>
                )}
              </FormControl>

              {/* 6. Describe the problem */}
              <TextField
                required
                label="Describe the problem"
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                onBlur={blurProblemDescription}
                fullWidth
                multiline
                minRows={3}
              />

              {/* 7. Anything else */}
              <FormControl>
                <FormLabel id="mr-extra-label">
                  Anything else Maintenance should know?
                </FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="mr-extra-label"
                  value={hasAdditionalNotes}
                  onChange={(e) =>
                    setHasAdditionalNotes(e.target.value as "yes" | "no")
                  }
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio />}
                    label="Yes"
                  />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>

              {hasAdditionalNotes === "yes" && (
                <TextField
                  label="Additional notes (optional detail)"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  onBlur={blurAdditionalNotes}
                  fullWidth
                  multiline
                  minRows={2}
                />
              )}

              {/* 8. Optional photos (max 3) */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <FormLabel>
                  Photos (optional) — {photos.length} of {MAX_MAINTENANCE_PHOTOS}
                </FormLabel>
                <Typography variant="body2" color="text.secondary">
                  Up to {MAX_MAINTENANCE_PHOTOS} pictures of the problem. Not
                  required.
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  disabled={photos.length >= MAX_MAINTENANCE_PHOTOS}
                >
                  {photos.length >= MAX_MAINTENANCE_PHOTOS
                    ? "Photo limit reached"
                    : "Add photo"}
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      handlePhotoFilesSelected(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </Button>
                {photos.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    {photos.map((p) => (
                      <Box
                        key={p.id}
                        sx={{
                          width: 96,
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        <Box
                          component="img"
                          src={p.dataUrl}
                          alt={p.fileName}
                          sx={{
                            width: 96,
                            height: 96,
                            objectFit: "cover",
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        />
                        <Button
                          type="button"
                          size="small"
                          onClick={() => removePhotoAt(p.id)}
                        >
                          Remove
                        </Button>
                      </Box>
                    ))}
                  </Box>
                )}
                <FormHelperText>
                  One item per request. Photos stay on this device mock until
                  backend upload exists.
                </FormHelperText>
              </Box>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button type="submit" variant="contained">
                  Submit request
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => {
                    clearNewRequestForm();
                    setSubmitConfirmation(null);
                  }}
                >
                  Clear form
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}

      {view === "mine" && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h6">My Requests</Typography>
          <Typography variant="body2" color="text.secondary">
            Only your own requests
            {isDev
              ? " (DEV filter: " + activeDevClientName + ")"
              : ""}
            . Closed stay in history. Click a row for detail and timeline.
          </Typography>

          {myRequests.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                No maintenance requests yet. Submit one on the New Request tab.
              </Typography>
            </Paper>
          ) : (
            myRequests.map((req) => (
              <Paper
                key={req.id}
                variant="outlined"
                sx={{
                  p: 2,
                  cursor: "pointer",
                  borderColor:
                    selectedRequestId === req.id ? "primary.main" : undefined,
                  borderWidth: selectedRequestId === req.id ? 2 : 1,
                }}
                onClick={() =>
                  setSelectedRequestId((prev) =>
                    prev === req.id ? null : req.id,
                  )
                }
              >
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle1" component="span">
                    {req.requestNumber}
                  </Typography>
                  <Chip size="small" label={req.status} />
                </Box>
                <Typography variant="body2">
                  {req.locationName}
                  {req.areaOrRoom.trim()
                    ? " · " + req.areaOrRoom
                    : ""}{" "}
                  · {req.item}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {req.category} ·{" "}
                  {new Date(req.submittedAt).toLocaleString("en-US", {
                    timeZone: "America/Chicago",
                  })}
                </Typography>
                {req.photos.length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    {req.photos.length} photo
                    {req.photos.length === 1 ? "" : "s"}
                  </Typography>
                )}
              </Paper>
            ))
          )}

          {selectedRequest && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" component="span">
                  {selectedRequest.requestNumber}
                </Typography>
                <Chip size="small" label={selectedRequest.status} />
                <Button
                  type="button"
                  size="small"
                  variant="outlined"
                  onClick={() => setSelectedRequestId(null)}
                >
                  Close detail
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Submitted{" "}
                {new Date(selectedRequest.submittedAt).toLocaleString("en-US", {
                  timeZone: "America/Chicago",
                })}{" "}
                by {selectedRequest.submittedByDisplayName}
              </Typography>

              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Location:</strong> {selectedRequest.locationName}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Specific Area / Room:</strong>{" "}
                {selectedRequest.areaOrRoom.trim()
                  ? selectedRequest.areaOrRoom
                  : "(not specified)"}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Item:</strong> {selectedRequest.item}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Category:</strong> {selectedRequest.category}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Still usable safely?:</strong>{" "}
                {selectedRequest.stillUsableSafely}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Problem:</strong>
              </Typography>
              <Typography
                variant="body2"
                sx={{ mb: 1, whiteSpace: "pre-wrap" }}
              >
                {selectedRequest.problemDescription}
              </Typography>

              {selectedRequest.hasAdditionalNotes &&
                selectedRequest.additionalNotes && (
                  <>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Anything else:</strong>
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, whiteSpace: "pre-wrap" }}
                    >
                      {selectedRequest.additionalNotes}
                    </Typography>
                  </>
                )}

              {selectedRequest.photos.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Photos</strong> ({selectedRequest.photos.length})
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {selectedRequest.photos.map((p) => (
                      <Box
                        key={p.id}
                        component="img"
                        src={p.dataUrl}
                        alt={p.fileName}
                        sx={{
                          width: 120,
                          height: 120,
                          objectFit: "cover",
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 2 }}
              >
                Original request is read-only. Updates will show on the timeline
                later (Add Information / status).
              </Typography>

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Timeline
              </Typography>
              {selectedRequest.timeline.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No timeline events yet.
                </Typography>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    borderLeft: "2px solid",
                    borderColor: "divider",
                    pl: 2,
                  }}
                >
                  {selectedRequest.timeline
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(a.at).getTime() - new Date(b.at).getTime(),
                    )
                    .map((ev) => (
                      <Box key={ev.id}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {ev.summary}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block" }}
                        >
                          {new Date(ev.at).toLocaleString("en-US", {
                            timeZone: "America/Chicago",
                          })}
                          {ev.actorLabel ? " · " + ev.actorLabel : ""}
                          {ev.status ? " · " + ev.status : ""}
                        </Typography>
                        {ev.body ? (
                          <Typography
                            variant="body2"
                            sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}
                          >
                            {ev.body}
                          </Typography>
                        ) : null}
                      </Box>
                    ))}
                </Box>
              )}
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
}