/**
 * Hope House Hub — Client Intake prototype (FRONTEND ONLY).
 *
 * Responsibilities:
 * - New Intake form coordination and section rendering
 * - Draft Intake save/open workflow
 * - Completed Intake review / edit workflow
 * - Owns current form field state and workflow flags
 *
 * Prototype boundaries:
 * - In-memory Draft/Completed records only (refresh clears them)
 * - No API/database persistence in this page
 * - Presentation pieces live under ./components; types/constants/utils as extracted
 *
 * Architecture:
 * - Many local useState fields for the live form
 * - buildIntakeData / loadIntakeData bridge UI state ↔ formData snapshots
 * - Do not push backend/persistence concerns into this page
 *
 * FUTURE integration (not implemented here):
 * - Persistent intake/client records
 * - Shared Room/Bed assignment source (display code + Bed.id)
 * - Durable file/document storage
 */

import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import SignatureCanvas from "../../../components/SignatureCanvas";
import { MOCK_CURRENT_USER } from "../../../features/prototype/mockCurrentUser";
import type {
  CompletedIntake,
  IntakeDraft,
  LiveIntakeForm,
} from "./types/intake";
import { createEmptyIntakeForm } from "./types/intake";
import { calculateAge } from "./utils/calculateAge";
import IntakeSectionNav from "./components/IntakeSectionNav";
import DraftIntakesList from "./components/DraftIntakesList";
import CompletedIntakesList from "./components/CompletedIntakesList";
import {
  handbookTabs,
  renderHandbookTabContent,
} from "./content/clientHandbook";
import {
  SnapNoticeAcknowledgmentCopy,
  SnapNoticePolicyContent,
} from "./content/snapNotice";
import {
  AgreementBackgroundTestingSearchCopy,
  AgreementChildSupportDhsCopy,
  AgreementCoEdAccountabilityCopy,
  AgreementConfidentialityCopy,
  AgreementDressForSuccessCopy,
  AgreementFacilityExpectationsCopy,
  AgreementInformationSharingCopy,
  AgreementMedicationResponsibilityCopy,
  AgreementNondiscriminationCopy,
  AgreementPossessionsCopy,
  AgreementProgramGuidelinesCopy,
  AgreementsWaiversTitle,
  AgreementVehicleTransportationCopy,
  AgreementVolunteerReleaseCopy,
} from "./content/agreementsWaivers";
import {
  ProgramLtpCopy,
  ProgramOvnCopy,
  ProgramTempCopy,
} from "./content/programAssignment";
import { AuthorizationsHmisRoiCopy } from "./content/authorizations";

export default function IntakePage() {
  // ---------------------------------------------------------------------------
  // Page / workflow state (tabs, draft/completed lists, active section)
  // In-memory only — not persisted across refresh.
  // ---------------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState(0);
  const [activeDraftId, setActiveDraftId] = useState<number | null>(null);
  const [draftIntakes, setDraftIntakes] = useState<IntakeDraft[]>([]);
  const [activeCompletedIntakeId, setActiveCompletedIntakeId] = useState<
    number | null
  >(null);
  const [isEditingCompletedIntake, setIsEditingCompletedIntake] =
    useState(false);
  const [completedIntakes, setCompletedIntakes] = useState<CompletedIntake[]>(
    [],
  );
  const [activeIntakeSection, setActiveIntakeSection] =
    useState("client-information");
  const [activeHandbookTab, setActiveHandbookTab] = useState("getting-started");

  // ---------------------------------------------------------------------------
  // Live form object (Phase 5F: all live Intake form fields on form; workflow/UI state remains separate).
  // ---------------------------------------------------------------------------
  const [form, setForm] = useState<LiveIntakeForm>(() =>
    createEmptyIntakeForm(),
  );

  const setField = <K extends keyof LiveIntakeForm>(
    key: K,
    value: LiveIntakeForm[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ---------------------------------------------------------------------------
  // Client Information
  // ---------------------------------------------------------------------------
  // Room Assignment: free-text display today (placeholder e.g. "6S - A").
  // FUTURE: pair human-readable code with shared Bed.id from Room Chart data;
  // do not drive Room Chart by mutating its component state from Intake.
  // Suicide risk screening fields live on form (cleared via effect when primary answers are No)

  useEffect(() => {
    if (
      form.suicideWishDead === "No" &&
      form.suicideBetterOffDead === "No" &&
      form.suicideThoughts === "No" &&
      form.suicideAttemptHistory === "No"
    ) {
      setForm((prev) => ({
        ...prev,
        suicideCurrentThoughts: "",
        suicideCurrentThoughtsDescription: "",
      }));
    }
  }, [
    form.suicideWishDead,
    form.suicideBetterOffDead,
    form.suicideThoughts,
    form.suicideAttemptHistory,
  ]);












  // Browser File only for prototype UI — not durable across refresh; FUTURE upload/storage.

  // ---------------------------------------------------------------------------
  // HMIS Authorization / signature capture (frontend strings via SignatureCanvas)
  // FUTURE: persist signature payloads with intake records outside this prototype.
  // ---------------------------------------------------------------------------



  // Resets all live form fields. Must stay aligned with formData / buildIntakeData.
  // Save Draft intentionally calls this afterward so the UI returns to a blank Intake.
  const startNewIntake = () => {
    setActiveDraftId(null);
    setActiveIntakeSection("client-information");
    setActiveHandbookTab("getting-started");
    setForm(createEmptyIntakeForm());
  };

  // Critical bridge: packs the many local useState fields into a formData snapshot
  // for Draft/Completed records. Keep state ↔ build ↔ load ↔ startNewIntake in sync
  // when adding/removing fields or Draft/Completed round-trips will drop data.
  const buildIntakeData = () => {
    const { intakeDate, ...formData } = form;

    return {
      clientName: `${form.firstName} ${form.middleName} ${form.lastName}`
        .replace(/\s+/g, " ")
        .trim(),
      intakeDate,
      lastUpdated: new Date().toLocaleString(),
      startedBy: MOCK_CURRENT_USER.displayName,
      lastUpdatedBy: MOCK_CURRENT_USER.displayName,

      formData,
    };
  };

  // Inverse of buildIntakeData: hydrates local UI state from a Draft/Completed snapshot.
  const loadIntakeData = (intake: IntakeDraft) => {
    setForm({
      ...intake.formData,
      intakeDate: intake.intakeDate,
      // Clone mutable values so edits cannot mutate the stored Draft by reference.
      dietaryNeeds: [...intake.formData.dietaryNeeds],
      minorChildren: intake.formData.minorChildren.map((c) => ({ ...c })),
      race: [...intake.formData.race],
      otherIncomeSources: [...intake.formData.otherIncomeSources],
      substancesUsed: [...intake.formData.substancesUsed],
      healthSupportNeeds: [...intake.formData.healthSupportNeeds],
      healthSupportDetails: { ...intake.formData.healthSupportDetails },
      socialFinancialSupport: [...intake.formData.socialFinancialSupport],
    });
  };

  // Completes the in-memory intake: requires clientProgram, assigns prototype HH#,
  // appends CompletedIntake (Pending Review), drops linked draft, clears form, opens Completed tab.
  const completeIntake = () => {
    if (!form.clientProgram) {
      alert("Please select a program before completing the intake.");
      setActiveIntakeSection("program-assignment");
      return;
    }

    const nextHopeHouseNumber = `HH-${new Date().getFullYear()}-${String(completedIntakes.length + 1).padStart(4, "0")}`;
    const completedAt = new Date().toISOString();
    const intakeData = buildIntakeData();
    const completedIntake: CompletedIntake = {
      id: Date.now(),
      ...intakeData,
      hopeHouseNumber: nextHopeHouseNumber,
      completedAt,
      completedBy: MOCK_CURRENT_USER.displayName,
      reviewedBy: "",
      reviewedAt: "",
      reviewStatus: "Pending Review",
      lastEditedBy: "",
      lastEditedAt: "",
      formData: {
        ...intakeData.formData,
        hopeHouseNumber: nextHopeHouseNumber,
      },
    };

    setCompletedIntakes([...completedIntakes, completedIntake]);

    if (activeDraftId !== null) {
      setDraftIntakes(
        draftIntakes.filter((draft) => draft.id !== activeDraftId),
      );
    }

    startNewIntake();
    setActiveTab(2);
  };

  // Marks the open completed intake Review Complete (frontend workflow only).
  // NOTE: form fields are not currently locked during review; tighter read-only UX is FUTURE.
  const completeReview = () => {
    if (activeCompletedIntakeId === null) return;

    setCompletedIntakes(
      completedIntakes.map((intake) =>
        intake.id === activeCompletedIntakeId
          ? {
              ...intake,
              reviewedBy: MOCK_CURRENT_USER.displayName,
              reviewedAt: new Date().toISOString(),
              reviewStatus: "Review Complete",
            }
          : intake,
      ),
    );

    setActiveCompletedIntakeId(null);
    setActiveTab(2);
  };

  // Writes buildIntakeData() back onto the active completed record; preserves completion/review audit fields.
  const saveCompletedIntakeChanges = () => {
    if (activeCompletedIntakeId === null) return;

    const updatedData = buildIntakeData();

    setCompletedIntakes(
      completedIntakes.map((intake) =>
        intake.id === activeCompletedIntakeId
          ? {
              ...intake,
              ...updatedData,
              startedBy: intake.startedBy,
              completedBy: intake.completedBy,
              completedAt: intake.completedAt,
              reviewedBy: intake.reviewedBy,
              reviewedAt: intake.reviewedAt,
              reviewStatus: intake.reviewStatus,
              hopeHouseNumber: intake.hopeHouseNumber,
              lastEditedBy: MOCK_CURRENT_USER.displayName,
              lastEditedAt: new Date().toISOString(),
            }
          : intake,
      ),
    );

    setIsEditingCompletedIntake(false);
    setActiveCompletedIntakeId(null);
    setActiveTab(2);
  };

  // Reloads the original completed snapshot and exits edit mode without saving.
  const cancelCompletedIntakeEdit = () => {
    if (activeCompletedIntakeId === null) return;

    const originalIntake = completedIntakes.find(
      (intake) => intake.id === activeCompletedIntakeId,
    );

    if (!originalIntake) return;

    loadIntakeData(originalIntake);
    setIsEditingCompletedIntake(false);
  };

  // ---------------------------------------------------------------------------
  // Client Age Calculation (primary client DOB → disabled Age field)
  // ---------------------------------------------------------------------------
  const age = (() => {
    if (!form.dateOfBirth) return "";

    const today = new Date();
    const birthDate = new Date(`${form.dateOfBirth}T00:00:00`);

    let calculatedAge = today.getFullYear() - birthDate.getFullYear();

    const birthdayHasPassed =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() >= birthDate.getDate());

    if (!birthdayHasPassed) {
      calculatedAge--;
    }

    return calculatedAge;
  })();

  // ---------------------------------------------------------------------------
  // Minor Child Helpers (update one field; age from child DOB)
  // ---------------------------------------------------------------------------
  const updateMinorChild = (
    index: number,
    field:
      | "firstName"
      | "lastName"
      | "dateOfBirth"
      | "ssnFirst"
      | "ssnMiddle"
      | "ssnLast",
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      minorChildren: prev.minorChildren.map((child, childIndex) =>
        childIndex === index ? { ...child, [field]: value } : child,
      ),
    }));
  };

  return (
    <Box
      sx={{
        // Intake text +~2px; hierarchy kept (h6 > subtitle > body)
        "& .MuiTypography-body1": {
          fontSize: (t) => `calc(${t.typography.body1.fontSize} + 2px)`,
        },
        "& .MuiTypography-body2": {
          fontSize: (t) => `calc(${t.typography.body2.fontSize} + 2px)`,
        },
        "& .MuiTypography-subtitle1": {
          fontSize: (t) => `calc(${t.typography.subtitle1.fontSize} + 2px)`,
        },
        "& .MuiTypography-subtitle2": {
          fontSize: (t) => `calc(${t.typography.subtitle2.fontSize} + 2px)`,
        },
        "& .MuiTypography-h6": {
          fontSize: (t) => `calc(${t.typography.h6.fontSize} + 2px)`,
        },
        "& .MuiFormControlLabel-label": {
          fontSize: (t) => `calc(${t.typography.body1.fontSize} + 2px)`,
        },
        "& .MuiInputLabel-root": {
          fontSize: (t) => `calc(${t.typography.body1.fontSize} + 2px)`,
        },
        "& .MuiInputBase-input": {
          fontSize: (t) => `calc(${t.typography.body1.fontSize} + 2px)`,
        },
        "& .MuiSelect-select": {
          fontSize: (t) => `calc(${t.typography.body1.fontSize} + 2px)`,
        },
        "& .MuiTab-root": {
          fontSize: (t) => `calc(${t.typography.button.fontSize} + 2px)`,
        },
      }}
    >
      <Typography variant="h6">Client Intake</Typography>

      {/* ------------------------------------------------------------------ */}
      {/* Intake Tabs — New / Draft / Completed                               */}
      {/* ------------------------------------------------------------------ */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
      >
        <Tab label="New Intake" />
        <Tab label="Draft Intakes" />
        <Tab label="Completed Intakes" />
      </Tabs>

      {activeTab === 0 && (
        <>
          {activeCompletedIntakeId !== null && (
            <Paper sx={{ mt: 2, p: 2 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, textAlign: "center" }}
              >
                {isEditingCompletedIntake
                  ? "Editing Completed Intake"
                  : "Completed Intake Review"}
              </Typography>
              <Typography variant="body2" sx={{ textAlign: "center" }}>
                {isEditingCompletedIntake
                  ? "Make the necessary corrections, then save the updated intake."
                  : "Review and confirm the client's completed intake information."}
              </Typography>
              {completedIntakes.find(
                (intake) => intake.id === activeCompletedIntakeId,
              )?.reviewStatus === "Review Complete" && (
                <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                  {isEditingCompletedIntake ? (
                    <>
                      <Button
                        variant="contained"
                        onClick={saveCompletedIntakeChanges}
                      >
                        Save Changes
                      </Button>

                      <Button
                        variant="outlined"
                        onClick={cancelCompletedIntakeEdit}
                        sx={{ ml: 1 }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outlined"
                      onClick={() => setIsEditingCompletedIntake(true)}
                    >
                      Edit Intake
                    </Button>
                  )}
                </Box>
              )}
            </Paper>
          )}

          {activeCompletedIntakeId === null && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 2,
              }}
            >
              <Button variant="outlined" onClick={startNewIntake}>
                Start New Intake
              </Button>

              {/* Drafts are in-memory snapshots via buildIntakeData; not persisted.
                  After save/update, startNewIntake() clears the form by design. */}
              <Button
                variant="contained"
                onClick={() => {
                  const draftData = buildIntakeData();

                  if (activeDraftId !== null) {
                    setDraftIntakes(
                      draftIntakes.map((draft) =>
                        draft.id === activeDraftId
                          ? {
                              ...draft,
                              ...draftData,
                              startedBy: draft.startedBy,
                            }
                          : draft,
                      ),
                    );
                  } else {
                    const newDraftId = Date.now();

                    setDraftIntakes([
                      ...draftIntakes,
                      {
                        id: newDraftId,
                        ...draftData,
                      },
                    ]);

                    setActiveDraftId(newDraftId);
                  }

                  startNewIntake();
                }}
              >
                Save Draft
              </Button>
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              gap: 3,
              mt: 3,
              alignItems: "flex-start",
            }}
          >
            {/* Intake Section Navigation */}
            <IntakeSectionNav
              activeSectionId={activeIntakeSection}
              onSectionChange={setActiveIntakeSection}
            />

            <Box sx={{ flex: 1, minWidth: 0 }}>
              {activeIntakeSection === "client-information" && (
                <Paper sx={{ mt: 3, p: 3 }}>
                  {/* -------------------------------------------------------------- */}
                  {/* Client Information                                            */}
                  {/* -------------------------------------------------------------- */}

                  <Box
                    sx={{
                      backgroundColor: "#D3ECF8",
                      border: "9px solid #93C9E2",
                      borderRadius: 1,
                      p: 2,
                      mb: 3,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        textAlign: "center",
                        fontWeight: 500,
                        color: "rgba(54, 75, 112, 0.55)",
                      }}
                    >
                      ADMINISTRATION USE ONLY
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, minmax(120px, 1fr))",
                        gap: 2,
                        width: "100%",
                        maxWidth: 1100,
                        margin: "32px auto 0",
                      }}
                    >
                      <TextField
                        label="IN DATE"
                        type="date"
                        value={form.intakeDate}
                        onChange={(event) => setField("intakeDate", event.target.value)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#FFFFFF",
                          },
                        }}
                        slotProps={{
                          inputLabel: { shrink: true },
                        }}
                      />

                      <TextField
                        label="OUT DATE"
                        type="date"
                        value={form.outDate}
                        onChange={(event) => setField("outDate", event.target.value)}
                        slotProps={{
                          inputLabel: { shrink: true },
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#FFFFFF",
                          },
                        }}
                      />

                      <TextField
                        label="PROGRAM"
                        value={form.clientProgram}
                        slotProps={{
                          input: {
                            readOnly: true,
                          },
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#FFFFFF",
                          },
                        }}
                      />

                      <TextField
                        label="HOPE HOUSE #"
                        value={form.hopeHouseNumber}
                        slotProps={{
                          input: {
                            readOnly: true,
                          },
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#FFFFFF",
                          },
                        }}
                      />

                      <TextField
                        label="HMIS #"
                        value={form.hmisNumber}
                        onChange={(event) => setField("hmisNumber", event.target.value)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#FFFFFF",
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  <Typography variant="h6">Client Information</Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    <TextField
                      label="First Name"
                      value={form.firstName}
                      onChange={(event) =>
                        setField("firstName", event.target.value)
                      }
                    />

                    <TextField
                      label="Middle Name"
                      value={form.middleName}
                      onChange={(event) => setField("middleName", event.target.value)}
                    />

                    <TextField
                      label="Last Name"
                      value={form.lastName}
                      onChange={(event) => setField("lastName", event.target.value)}
                    />

                    <TextField
                      label="Preferred Name"
                      value={form.preferredName}
                      onChange={(event) => setField("preferredName", event.target.value)}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    <TextField
                      label="Date of Birth"
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(event) => setField("dateOfBirth", event.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />

                    <TextField label="Age" value={age} disabled />

                    <TextField
                      label="Phone Number"
                      value={form.phoneNumber}
                      onChange={(event) => {
                        const digits = event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);

                        let formatted = digits;

                        if (digits.length > 6) {
                          formatted = `${digits.slice(0, 3)}-${digits.slice(
                            3,
                            6,
                          )}-${digits.slice(6)}`;
                        } else if (digits.length > 3) {
                          formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
                        }

                        setField("phoneNumber", formatted);
                      }}
                    />

                    <TextField
                      label="Intake Date"
                      type="date"
                      value={form.intakeDate}
                      onChange={(event) => setField("intakeDate", event.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 4,
                      alignItems: "flex-start",
                    }}
                  >
                    {/* ------------------------------------------------------------ */}
                    {/* Social Security Number                                      */}
                    {/* ------------------------------------------------------------ */}
                    <Box>
                      <Typography sx={{ mt: 1 }}>
                        Social Security Number
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <TextField
                          value={form.ssnFirst}
                          disabled={
                            form.ssnStatus === "dont-know" || form.ssnStatus === "refused"
                          }
                          onChange={(event) => {
                            const value = event.target.value.replace(/\D/g, "");
                            setField("ssnFirst", value);

                            if (value) {
                              setField("ssnStatus", "provided");
                            }
                          }}
                          slotProps={{ htmlInput: { maxLength: 3 } }}
                          sx={{ width: 80 }}
                        />

                        <Typography>-</Typography>

                        <TextField
                          value={form.ssnMiddle}
                          disabled={
                            form.ssnStatus === "dont-know" || form.ssnStatus === "refused"
                          }
                          onChange={(event) => {
                            const value = event.target.value.replace(/\D/g, "");
                            setField("ssnMiddle", value);

                            if (value) {
                              setField("ssnStatus", "provided");
                            }
                          }}
                          slotProps={{ htmlInput: { maxLength: 2 } }}
                          sx={{ width: 70 }}
                        />

                        <Typography>-</Typography>

                        <TextField
                          value={form.ssnLast}
                          disabled={
                            form.ssnStatus === "dont-know" || form.ssnStatus === "refused"
                          }
                          onChange={(event) => {
                            const value = event.target.value.replace(/\D/g, "");
                            setField("ssnLast", value);

                            if (value) {
                              setField("ssnStatus", "provided");
                            }
                          }}
                          slotProps={{ htmlInput: { maxLength: 4 } }}
                          sx={{ width: 70 }}
                        />
                      </Box>

                      <FormControl>
                        <RadioGroup
                          row
                          value={form.ssnStatus}
                          onChange={(event) => {
                            const value = event.target.value;
                            setField("ssnStatus", value);

                            if (value === "dont-know" || value === "refused") {
                              setField("ssnFirst", "");
                              setField("ssnMiddle", "");
                              setField("ssnLast", "");
                            }
                          }}
                        >
                          <FormControlLabel
                            value="provided"
                            control={<Radio />}
                            label="Provided"
                          />

                          <FormControlLabel
                            value="dont-know"
                            control={<Radio />}
                            label="Don't Know"
                          />

                          <FormControlLabel
                            value="refused"
                            control={<Radio />}
                            label="Refused"
                          />
                        </RadioGroup>
                      </FormControl>
                    </Box>

                    {/* ------------------------------------------------------------ */}
                    {/* Veteran Status                                              */}
                    {/* ------------------------------------------------------------ */}
                    <FormControl sx={{ mt: 1 }}>
                      <Typography>Veteran Status</Typography>

                      <RadioGroup
                        row
                        value={form.veteranStatus}
                        onChange={(event) =>
                          setField("veteranStatus", event.target.value)
                        }
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* ------------------------------------------------------------ */}
                    {/* Medical Allergies                                           */}
                    {/* ------------------------------------------------------------ */}
                    <Box sx={{ mt: 1 }}>
                      <Typography>Medical Allergies</Typography>

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={form.noMedicalAllergies}
                            onChange={(event) => {
                              setField(
                                "noMedicalAllergies",
                                event.target.checked,
                              );

                              if (event.target.checked) {
                                setField("medicalAllergies", "");
                              }
                            }}
                          />
                        }
                        label="No Known Medical Allergies"
                      />

                      <TextField
                        sx={{ width: 300 }}
                        label="List Medical Allergies"
                        multiline
                        minRows={2}
                        value={form.medicalAllergies}
                        onChange={(event) =>
                          setField("medicalAllergies", event.target.value)
                        }
                        disabled={form.noMedicalAllergies}
                      />
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 4,
                      alignItems: "flex-start",
                    }}
                  >
                    {/* ------------------------------------------------------------ */}
                    {/* Food Allergies                                              */}
                    {/* ------------------------------------------------------------ */}
                    <Box sx={{ mt: 1 }}>
                      <Typography>Food Allergies</Typography>

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={form.noFoodAllergies}
                            onChange={(event) => {
                              setField("noFoodAllergies", event.target.checked);

                              if (event.target.checked) {
                                setField("foodAllergies", "");
                              }
                            }}
                          />
                        }
                        label="No Known Food Allergies"
                      />

                      <TextField
                        label="List Food Allergies"
                        multiline
                        minRows={2}
                        value={form.foodAllergies}
                        onChange={(event) =>
                          setField("foodAllergies", event.target.value)
                        }
                        disabled={form.noFoodAllergies}
                        sx={{ width: 300 }}
                      />
                    </Box>

                    {/* ------------------------------------------------------------ */}
                    {/* Dietary Needs / Restrictions                                */}
                    {/* ------------------------------------------------------------ */}
                    <Box sx={{ mt: 1 }}>
                      <Typography>Dietary Needs / Restrictions</Typography>

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={form.dietaryNeeds.includes("none")}
                            onChange={(event) => {
                              if (event.target.checked) {
                                setField("dietaryNeeds", ["none"]);
                                setField("otherDietaryNeed", "");
                              } else {
                                setField("dietaryNeeds", []);
                              }
                            }}
                          />
                        }
                        label="No Special Dietary Needs"
                      />

                      {(
                        [
                          ["no-pork", "No Pork"],
                          ["no-beef", "No Beef"],
                          ["vegetarian", "Vegetarian"],
                          ["vegan", "Vegan"],
                          ["dairy-free", "Dairy-Free"],
                          ["gluten-free", "Gluten-Free"],
                          ["diabetic", "Diabetic / Carb-Conscious"],
                          ["low-sodium", "Low Sodium"],
                          [
                            "religious-cultural",
                            "Religious / Cultural Restriction",
                          ],
                          ["other", "Other"],
                        ] as [string, string][]
                      ).map(([value, label]) => (
                        <FormControlLabel
                          key={value}
                          control={
                            <Checkbox
                              checked={form.dietaryNeeds.includes(value)}
                              onChange={(event) => {
                                if (event.target.checked) {
                                  setForm((prev) => ({
                                    ...prev,
                                    dietaryNeeds: [
                                      ...prev.dietaryNeeds.filter(
                                        (item) => item !== "none",
                                      ),
                                      value,
                                    ],
                                  }));
                                } else {
                                  setForm((prev) => ({
                                    ...prev,
                                    dietaryNeeds: prev.dietaryNeeds.filter(
                                      (item) => item !== value,
                                    ),
                                  }));

                                  if (value === "other") {
                                    setField("otherDietaryNeed", "");
                                  }
                                }
                              }}
                            />
                          }
                          label={label}
                        />
                      ))}

                      {form.dietaryNeeds.includes("other") && (
                        <TextField
                          label="Other Dietary Need / Restriction"
                          multiline
                          minRows={2}
                          value={form.otherDietaryNeed}
                          onChange={(event) =>
                            setField("otherDietaryNeed", event.target.value)
                          }
                          sx={{ width: 300, mt: 1 }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* -------------------------------------------------------------- */}
                  {/* Emergency Contact                                             */}
                  {/* -------------------------------------------------------------- */}
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    Emergency Contact
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr",
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    <TextField
                      label="Emergency Contact Name"
                      value={form.emergencyContactName}
                      onChange={(event) =>
                        setField("emergencyContactName", event.target.value)
                      }
                    />

                    <TextField
                      label="Phone Number"
                      value={form.emergencyContactPhoneNumber}
                      onChange={(event) => {
                        const digits = event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);

                        let formatted = digits;

                        if (digits.length > 6) {
                          formatted = `${digits.slice(0, 3)}-${digits.slice(
                            3,
                            6,
                          )}-${digits.slice(6)}`;
                        } else if (digits.length > 3) {
                          formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
                        }

                        setField("emergencyContactPhoneNumber", formatted);
                      }}
                    />

                    <TextField
                      label="Relationship"
                      value={form.emergencyContactRelationship}
                      onChange={(event) =>
                        setField("emergencyContactRelationship", event.target.value)
                      }
                    />
                  </Box>

                  {/* -------------------------------------------------------------- */}
                  {/* Room & Medication Assignment                                  */}
                  {/* -------------------------------------------------------------- */}
                  {/* Room Assignment: free text today. FUTURE shared bed pick stores Bed.id + display code. */}
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    Room & Medication Assignment
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    <TextField
                      label="Room Assignment"
                      value={form.roomNumber}
                      onChange={(event) => setField("roomNumber", event.target.value)}
                      placeholder="Example: 6S - A"
                    />

                    <TextField
                      label="Medication Room Locker Number"
                      value={form.medRoomLockerNumber}
                      onChange={(event) =>
                        setField("medRoomLockerNumber", event.target.value)
                      }
                    />
                  </Box>
                </Paper>
              )}

              {/* ---------------------------------------------------------------- */}
              {/* Suicide Risk Screening                                          */}
              {/* ---------------------------------------------------------------- */}
              {activeIntakeSection === "suicide-risk-screening" && (
                <Paper sx={{ mt: 2, p: 3 }}>
                  <Typography variant="h6">Suicide Risk Screening</Typography>
                  <FormControl fullWidth sx={{ mt: 3 }}>
                    <Typography>
                      1. In the past few weeks, have you wished you were dead?
                    </Typography>

                    <RadioGroup
                      row
                      value={form.suicideWishDead}
                      onChange={(event) =>
                        setField("suicideWishDead", event.target.value)
                      }
                    >
                      <FormControlLabel
                        value="Yes"
                        control={<Radio />}
                        label="Yes"
                      />
                      <FormControlLabel
                        value="No"
                        control={<Radio />}
                        label="No"
                      />
                    </RadioGroup>
                  </FormControl>

                  <FormControl fullWidth sx={{ mt: 3 }}>
                    <Typography>
                      2. In the past few weeks, have you felt that you or your
                      family would be better off if you were dead?
                    </Typography>

                    <RadioGroup
                      row
                      value={form.suicideBetterOffDead}
                      onChange={(event) =>
                        setField("suicideBetterOffDead", event.target.value)
                      }
                    >
                      <FormControlLabel
                        value="Yes"
                        control={<Radio />}
                        label="Yes"
                      />
                      <FormControlLabel
                        value="No"
                        control={<Radio />}
                        label="No"
                      />
                    </RadioGroup>
                  </FormControl>

                  <FormControl fullWidth sx={{ mt: 3 }}>
                    <Typography>
                      3. In the past week, have you been having thoughts about
                      killing yourself?
                    </Typography>

                    <RadioGroup
                      row
                      value={form.suicideThoughts}
                      onChange={(event) =>
                        setField("suicideThoughts", event.target.value)
                      }
                    >
                      <FormControlLabel
                        value="Yes"
                        control={<Radio />}
                        label="Yes"
                      />
                      <FormControlLabel
                        value="No"
                        control={<Radio />}
                        label="No"
                      />
                    </RadioGroup>
                  </FormControl>

                  <FormControl fullWidth sx={{ mt: 3 }}>
                    <Typography>
                      4. Have you ever tried to kill yourself?
                    </Typography>

                    <RadioGroup
                      row
                      value={form.suicideAttemptHistory}
                      onChange={(event) => {
                        const value = event.target.value;
                        setField("suicideAttemptHistory", value);

                        if (value === "No") {
                          setField("suicideAttemptHow", "");
                          setField("suicideAttemptWhen", "");
                        }
                      }}
                    >
                      <FormControlLabel
                        value="Yes"
                        control={<Radio />}
                        label="Yes"
                      />
                      <FormControlLabel
                        value="No"
                        control={<Radio />}
                        label="No"
                      />
                    </RadioGroup>
                  </FormControl>

                  {form.suicideAttemptHistory === "Yes" && (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr",
                        gap: 2,
                        mt: 1,
                      }}
                    >
                      <TextField
                        label="If yes, how?"
                        value={form.suicideAttemptHow}
                        onChange={(event) =>
                          setField("suicideAttemptHow", event.target.value)
                        }
                        multiline
                        minRows={2}
                      />

                      <TextField
                        label="When?"
                        value={form.suicideAttemptWhen}
                        onChange={(event) =>
                          setField("suicideAttemptWhen", event.target.value)
                        }
                      />
                    </Box>
                  )}

                  {form.suicideWishDead === "No" &&
                    form.suicideBetterOffDead === "No" &&
                    form.suicideThoughts === "No" &&
                    form.suicideAttemptHistory === "No" && (
                      <Alert
                        severity="success"
                        sx={{
                          mt: 2,
                          py: 3,
                          fontSize: "1.5rem",
                          "& .MuiAlert-icon": {
                            fontSize: "2.5rem",
                          },
                        }}
                      >
                        <strong>Negative Screen:</strong> No positive responses
                        were reported on Questions 1-4.
                      </Alert>
                    )}

                  {(form.suicideWishDead === "Yes" ||
                    form.suicideBetterOffDead === "Yes" ||
                    form.suicideThoughts === "Yes" ||
                    form.suicideAttemptHistory === "Yes") && (
                    <>
                      <FormControl fullWidth sx={{ mt: 3 }}>
                        <Typography>
                          5. Are you having thoughts of killing yourself right
                          now?
                        </Typography>

                        <RadioGroup
                          row
                          value={form.suicideCurrentThoughts}
                          onChange={(event) => {
                            const value = event.target.value;
                            setField("suicideCurrentThoughts", value);

                            if (value === "No") {
                              setField("suicideCurrentThoughtsDescription", "");
                            }
                          }}
                        >
                          <FormControlLabel
                            value="Yes"
                            control={<Radio />}
                            label="Yes"
                          />
                          <FormControlLabel
                            value="No"
                            control={<Radio />}
                            label="No"
                          />
                        </RadioGroup>
                      </FormControl>

                      {form.suicideCurrentThoughts === "Yes" && (
                        <TextField
                          fullWidth
                          sx={{ mt: 1 }}
                          label="Please describe"
                          value={form.suicideCurrentThoughtsDescription}
                          onChange={(event) =>
                            setField(
                              "suicideCurrentThoughtsDescription",
                              event.target.value,
                            )
                          }
                          multiline
                          minRows={3}
                        />
                      )}

                      {form.suicideCurrentThoughts === "Yes" && (
                        <Alert
                          severity="error"
                          sx={{
                            mt: 2,
                            py: 3,
                            fontSize: "1.5rem",
                            "& .MuiAlert-icon": {
                              fontSize: "2.5rem",
                            },
                          }}
                        >
                          <strong>Acute Positive Screen:</strong> Keep the
                          client in sight and remove dangerous objects from the
                          room.
                        </Alert>
                      )}

                      {form.suicideCurrentThoughts === "No" && (
                        <Alert
                          severity="warning"
                          sx={{
                            mt: 2,
                            py: 3,
                            fontSize: "1.5rem",
                            "& .MuiAlert-icon": {
                              fontSize: "2.5rem",
                            },
                          }}
                        >
                          <strong>Non-Acute Positive Screen:</strong> Arrange a
                          brief suicide safety assessment as soon as possible.
                        </Alert>
                      )}
                    </>
                  )}
                </Paper>
              )}

              {/* ---------------------------------------------------------------- */}
              {/* Household / Family Information                                  */}
              {/* ---------------------------------------------------------------- */}
              {activeIntakeSection === "household-family" && (
                <Paper sx={{ mt: 2, p: 3 }}>
                  <Typography variant="h6">
                    Household / Family Information
                  </Typography>

                  <FormControl sx={{ mt: 2 }}>
                    <Typography>
                      Does the client have minor children?
                    </Typography>

                    <RadioGroup
                      row
                      value={form.hasMinorChildren}
                      onChange={(event) =>
                        setField("hasMinorChildren", event.target.value)
                      }
                    >
                      <FormControlLabel
                        value="yes"
                        control={<Radio />}
                        label="Yes"
                      />
                      <FormControlLabel
                        value="no"
                        control={<Radio />}
                        label="No"
                      />
                    </RadioGroup>
                  </FormControl>

                  {/* -------------------------------------------------------------- */}
                  {/* Minor Children (shown when form.hasMinorChildren === "yes")        */}
                  {/* -------------------------------------------------------------- */}
                  {form.hasMinorChildren === "yes" && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1">
                        Minor Children
                      </Typography>

                      <Button
                        variant="outlined"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            minorChildren: [
                              ...prev.minorChildren,
                              {
                                firstName: "",
                                lastName: "",
                                dateOfBirth: "",
                                ssnFirst: "",
                                ssnMiddle: "",
                                ssnLast: "",
                              },
                            ],
                          }))
                        }
                      >
                        Add Child
                      </Button>
                      {form.minorChildren.map((child, index) => (
                        <Box key={index} sx={{ mt: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              mb: 1,
                            }}
                          >
                            <Typography variant="subtitle2">
                              Child {index + 1}
                            </Typography>

                            <Button
                              size="small"
                              color="error"
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  minorChildren: prev.minorChildren.filter(
                                    (_, childIndex) => childIndex !== index,
                                  ),
                                }))
                              }
                            >
                              Remove
                            </Button>
                          </Box>

                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr 1fr 0.5fr",
                              gap: 2,
                            }}
                          >
                            <TextField
                              label="First Name"
                              value={child.firstName}
                              onChange={(event) =>
                                updateMinorChild(
                                  index,
                                  "firstName",
                                  event.target.value,
                                )
                              }
                            />

                            <TextField
                              label="Last Name"
                              value={child.lastName}
                              onChange={(event) =>
                                updateMinorChild(
                                  index,
                                  "lastName",
                                  event.target.value,
                                )
                              }
                            />

                            <TextField
                              label="Date of Birth"
                              type="date"
                              value={child.dateOfBirth}
                              onChange={(event) =>
                                updateMinorChild(
                                  index,
                                  "dateOfBirth",
                                  event.target.value,
                                )
                              }
                              slotProps={{ inputLabel: { shrink: true } }}
                            />
                            <TextField
                              label="Age"
                              value={calculateAge(child.dateOfBirth)}
                              disabled
                            />
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              mt: 2,
                              alignItems: "center",
                            }}
                          >
                            <Typography>SSN</Typography>

                            <TextField
                              value={child.ssnFirst}
                              onChange={(event) =>
                                updateMinorChild(
                                  index,
                                  "ssnFirst",
                                  event.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 3),
                                )
                              }
                              slotProps={{
                                htmlInput: {
                                  maxLength: 3,
                                  inputMode: "numeric",
                                  style: { width: "3ch" },
                                },
                              }}
                            />

                            <Typography>-</Typography>

                            <TextField
                              value={child.ssnMiddle}
                              onChange={(event) =>
                                updateMinorChild(
                                  index,
                                  "ssnMiddle",
                                  event.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 2),
                                )
                              }
                              slotProps={{
                                htmlInput: {
                                  maxLength: 2,
                                  inputMode: "numeric",
                                  style: { width: "2ch" },
                                },
                              }}
                            />

                            <Typography>-</Typography>

                            <TextField
                              value={child.ssnLast}
                              onChange={(event) =>
                                updateMinorChild(
                                  index,
                                  "ssnLast",
                                  event.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 4),
                                )
                              }
                              slotProps={{
                                htmlInput: {
                                  maxLength: 4,
                                  inputMode: "numeric",
                                  style: { width: "4ch" },
                                },
                              }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>
              )}

              {/* HMIS / Demographics */}
              {activeIntakeSection === "hmis-demographics" && (
                <Paper sx={{ mt: 2, p: 3 }}>
                  <Typography variant="h6">HMIS / Demographics</Typography>

                  {/* Gender */}
                  <Box
                    sx={{
                      mt: 2,
                      pb: 2,
                      borderBottom: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Gender
                    </Typography>

                    <FormControl>
                      <RadioGroup
                        row
                        value={form.gender}
                        onChange={(event) => setField("gender", event.target.value)}
                      >
                        <FormControlLabel
                          value="female"
                          control={<Radio />}
                          label="Female"
                        />
                        <FormControlLabel
                          value="male"
                          control={<Radio />}
                          label="Male"
                        />
                        <FormControlLabel
                          value="transgender"
                          control={<Radio />}
                          label="Transgender"
                        />
                        <FormControlLabel
                          value="nonBinary"
                          control={<Radio />}
                          label="Non-Binary"
                        />
                        <FormControlLabel
                          value="questioning"
                          control={<Radio />}
                          label="Questioning"
                        />
                        <FormControlLabel
                          value="differentIdentity"
                          control={<Radio />}
                          label="Different Identity"
                        />
                        <FormControlLabel
                          value="clientDoesntKnow"
                          control={<Radio />}
                          label="Client Doesn't Know"
                        />
                        <FormControlLabel
                          value="clientPrefersNotToAnswer"
                          control={<Radio />}
                          label="Client Prefers Not to Answer"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>

                  {/* Race */}
                  <Box
                    sx={{
                      py: 2,
                      borderBottom: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Race
                    </Typography>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {(
                        [
                          [
                            "americanIndianAlaskaNative",
                            "American Indian, Alaska Native, or Indigenous",
                          ],
                          ["asian", "Asian or Asian American"],
                          [
                            "blackAfricanAmerican",
                            "Black, African American, or African",
                          ],
                          [
                            "nativeHawaiianPacificIslander",
                            "Native Hawaiian or Pacific Islander",
                          ],
                          ["white", "White"],
                          [
                            "middleEasternNorthAfrican",
                            "Middle Eastern or North African",
                          ],
                          ["clientDoesntKnow", "Client Doesn't Know"],
                          [
                            "clientPrefersNotToAnswer",
                            "Client Prefers Not to Answer",
                          ],
                        ] as [string, string][]
                      ).map(([value, label]) => (
                        <FormControlLabel
                          key={value}
                          control={
                            <Checkbox
                              checked={form.race.includes(value)}
                              onChange={(event) =>
                                setForm((prev) => ({
                                  ...prev,
                                  race: event.target.checked
                                    ? [...prev.race, value]
                                    : prev.race.filter((item) => item !== value),
                                }))
                              }
                            />
                          }
                          label={label}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Ethnicity + Household Type */}
                  <Box
                    sx={{
                      py: 2,
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 4,
                      borderBottom: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Ethnicity
                      </Typography>

                      <FormControl>
                        <RadioGroup
                          value={form.ethnicity}
                          onChange={(event) => setField("ethnicity", event.target.value)}
                        >
                          <FormControlLabel
                            value="hispanicLatinaeo"
                            control={<Radio />}
                            label="Hispanic/Latina/e/o"
                          />
                          <FormControlLabel
                            value="notHispanicLatinaeo"
                            control={<Radio />}
                            label="Not Hispanic/Latina/e/o"
                          />
                          <FormControlLabel
                            value="clientDoesntKnow"
                            control={<Radio />}
                            label="Client Doesn't Know"
                          />
                          <FormControlLabel
                            value="clientPrefersNotToAnswer"
                            control={<Radio />}
                            label="Client Prefers Not to Answer"
                          />
                        </RadioGroup>
                      </FormControl>
                    </Box>

                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Household Type
                      </Typography>

                      <FormControl>
                        <RadioGroup
                          value={form.household}
                          onChange={(event) => setField("household", event.target.value)}
                        >
                          <FormControlLabel
                            value="singleAdult"
                            control={<Radio />}
                            label="Single Adult"
                          />
                          <FormControlLabel
                            value="adultWithChildren"
                            control={<Radio />}
                            label="Adult with Children"
                          />
                          <FormControlLabel
                            value="multipleAdults"
                            control={<Radio />}
                            label="Multiple Adults"
                          />
                          <FormControlLabel
                            value="multipleAdultsWithChildren"
                            control={<Radio />}
                            label="Multiple Adults with Children"
                          />
                        </RadioGroup>
                      </FormControl>
                    </Box>
                  </Box>

                  {/* Special Circumstances */}
                  <Box sx={{ pt: 2 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Special Circumstances
                    </Typography>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={form.domesticViolence}
                            onChange={(event) =>
                              setField("domesticViolence", event.target.checked)
                            }
                          />
                        }
                        label="Domestic Violence"
                      />

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={form.fosterCare}
                            onChange={(event) =>
                              setField("fosterCare", event.target.checked)
                            }
                          />
                        }
                        label="Foster Care"
                      />

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={form.humanTrafficking}
                            onChange={(event) =>
                              setField("humanTrafficking", event.target.checked)
                            }
                          />
                        }
                        label="Human Trafficking"
                      />
                    </Box>

                    {form.domesticViolence && (
                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 2,
                          bgcolor: "action.hover",
                          borderRadius: 1,
                        }}
                      >
                        <Box sx={{ gridColumn: "1 / -1" }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600 }}
                          >
                            Domestic Violence Details
                          </Typography>
                        </Box>

                        <TextField
                          label="Approximate Date of Most Recent Occurrence"
                          type="date"
                          value={form.domesticViolenceDate}
                          onChange={(event) =>
                            setField("domesticViolenceDate", event.target.value)
                          }
                          slotProps={{ inputLabel: { shrink: true } }}
                        />

                        <FormControl>
                          <Typography>Currently Fleeing?</Typography>

                          <RadioGroup
                            row
                            value={form.currentlyFleeing}
                            onChange={(event) =>
                              setField("currentlyFleeing", event.target.value)
                            }
                          >
                            <FormControlLabel
                              value="yes"
                              control={<Radio />}
                              label="Yes"
                            />
                            <FormControlLabel
                              value="no"
                              control={<Radio />}
                              label="No"
                            />
                          </RadioGroup>
                        </FormControl>
                      </Box>
                    )}
                  </Box>
                </Paper>
              )}

              {activeIntakeSection === "homelessness" && (
                <Paper sx={{ mt: 2, p: 3 }}>
                  {/* -------------------------------------------------------------- */}
                  {/* Homelessness / Prior Living Situation                         */}
                  {/* -------------------------------------------------------------- */}
                  <Typography variant="h6">
                    Homelessness / Prior Living Situation
                  </Typography>

                  <FormControl sx={{ mt: 2, display: "block", width: "100%" }}>
                    <Typography>
                      Is this the client's first time experiencing homelessness?
                    </Typography>

                    <RadioGroup
                      row
                      value={form.firstTimeHomeless}
                      onChange={(event) =>
                        setField("firstTimeHomeless", event.target.value)
                      }
                    >
                      <FormControlLabel
                        value="yes"
                        control={<Radio />}
                        label="Yes"
                      />
                      <FormControlLabel
                        value="no"
                        control={<Radio />}
                        label="No"
                      />
                    </RadioGroup>
                  </FormControl>

                  {form.firstTimeHomeless === "no" && (
                    <Box sx={{ mt: 2, width: "100%" }}>
                      <TextField
                        fullWidth
                        sx={{ maxWidth: 560, display: "block" }}
                        label="How many times has the client experienced homelessness in total?"
                        type="number"
                        value={form.totalTimesHomeless}
                        onChange={(event) =>
                          setField("totalTimesHomeless", event.target.value)
                        }
                        slotProps={{
                          htmlInput: {
                            min: 1,
                          },
                        }}
                      />
                    </Box>
                  )}

                  {/* Prior Living Situation */}
                  <Box sx={{ mt: 3 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Prior Living Situation
                    </Typography>

                    <TextField
                      fullWidth
                      label="Where was the client living before coming to Hope House Guthrie?"
                      value={form.priorLivingSituation}
                      onChange={(event) =>
                        setField("priorLivingSituation", event.target.value)
                      }
                    />

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2,
                        mt: 2,
                        maxWidth: 520,
                      }}
                    >
                      <TextField
                        label="Length of Stay"
                        type="number"
                        value={form.priorLivingStayLength}
                        onChange={(event) =>
                          setField("priorLivingStayLength", event.target.value)
                        }
                        slotProps={{
                          htmlInput: {
                            min: 0,
                          },
                        }}
                      />

                      <FormControl fullWidth>
                        <InputLabel id="prior-living-stay-unit-label">
                          Unit
                        </InputLabel>
                        <Select
                          labelId="prior-living-stay-unit-label"
                          label="Unit"
                          value={form.priorLivingStayUnit}
                          onChange={(event) =>
                            setField("priorLivingStayUnit", event.target.value)
                          }
                        >
                          <MenuItem value="days">Days</MenuItem>
                          <MenuItem value="weeks">Weeks</MenuItem>
                          <MenuItem value="months">Months</MenuItem>
                          <MenuItem value="years">Years</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>

                  <TextField
                    sx={{ mt: 3, minWidth: 360, maxWidth: 560, width: "100%" }}
                    label="Approximate Start of Current Homeless Episode"
                    type="date"
                    value={form.homelessnessStartDate}
                    onChange={(event) =>
                      setField("homelessnessStartDate", event.target.value)
                    }
                    slotProps={{ inputLabel: { shrink: true } }}
                  />

                  {/* Homelessness in the Past 3 Years */}
                  <Box sx={{ mt: 3 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Homelessness in the Past 3 Years
                    </Typography>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2,
                        maxWidth: 650,
                      }}
                    >
                      <TextField
                        label="Number of Homeless Episodes"
                        type="number"
                        value={form.homelessEpisodesPastThreeYears}
                        onChange={(event) =>
                          setField("homelessEpisodesPastThreeYears", event.target.value)
                        }
                        slotProps={{
                          htmlInput: {
                            min: 0,
                          },
                        }}
                      />

                      <TextField
                        label="Total Months Homeless"
                        type="number"
                        value={form.homelessMonthsPastThreeYears}
                        onChange={(event) =>
                          setField("homelessMonthsPastThreeYears", event.target.value)
                        }
                        slotProps={{
                          htmlInput: {
                            min: 0,
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Last Place Stayed Before Hope House Guthrie */}
                  <Box sx={{ mt: 3 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Last Place Stayed Before Hope House Guthrie
                    </Typography>

                    <TextField
                      fullWidth
                      label="Place / Facility / Address"
                      value={form.lastPlaceStayed}
                      onChange={(event) =>
                        setField("lastPlaceStayed", event.target.value)
                      }
                    />

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 2,
                        mt: 2,
                      }}
                    >
                      <TextField
                        label="City"
                        value={form.lastPlaceCity}
                        onChange={(event) =>
                          setField("lastPlaceCity", event.target.value)
                        }
                      />

                      <TextField
                        label="County"
                        value={form.lastPlaceCounty}
                        onChange={(event) =>
                          setField("lastPlaceCounty", event.target.value)
                        }
                      />

                      <TextField
                        label="State"
                        value={form.lastPlaceState}
                        onChange={(event) =>
                          setField("lastPlaceState", event.target.value)
                        }
                      />
                    </Box>
                  </Box>
                </Paper>
              )}

              {/* ---------------------------------------------------------------- */}
              {/* Employment, Income & Education                                   */}
              {/* ---------------------------------------------------------------- */}
              {activeIntakeSection === "employment-income" && (
                <Paper sx={{ mt: 2, p: 3 }}>
                  <Typography variant="h6">
                    Employment, Income & Education
                  </Typography>

                  {/* Employment */}
                  <FormControl sx={{ mt: 2, display: "block" }}>
                    <Typography>Is the client currently employed?</Typography>

                    <RadioGroup
                      row
                      value={form.currentlyEmployed}
                      onChange={(event) =>
                        setField("currentlyEmployed", event.target.value)
                      }
                    >
                      <FormControlLabel
                        value="yes"
                        control={<Radio />}
                        label="Yes"
                      />
                      <FormControlLabel
                        value="no"
                        control={<Radio />}
                        label="No"
                      />
                    </RadioGroup>
                  </FormControl>

                  {form.currentlyEmployed === "yes" && (
                    <Box
                      sx={{
                        mt: 1,
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr",
                        gap: 2,
                      }}
                    >
                      <TextField
                        label="Employer"
                        value={form.employerName}
                        onChange={(event) =>
                          setField("employerName", event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Monthly Employment Income"
                        value={form.monthlyEmploymentIncome}
                        onChange={(event) =>
                          setField("monthlyEmploymentIncome", event.target.value)
                        }
                        type="number"
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            ),
                          },
                          htmlInput: { min: 0 },
                        }}
                        fullWidth
                      />
                    </Box>
                  )}

                  {/* Other Income */}
                  <FormControl sx={{ mt: 2, display: "block" }}>
                    <Typography>
                      Does the client have any other source of income?
                    </Typography>

                    <RadioGroup
                      row
                      value={form.hasOtherIncome}
                      onChange={(event) =>
                        setField("hasOtherIncome", event.target.value)
                      }
                    >
                      <FormControlLabel
                        value="yes"
                        control={<Radio />}
                        label="Yes"
                      />
                      <FormControlLabel
                        value="no"
                        control={<Radio />}
                        label="No"
                      />
                    </RadioGroup>
                  </FormControl>

                  {form.hasOtherIncome === "yes" && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2">
                        Other Income Source
                      </Typography>

                      {[
                        "Disability",
                        "SSI / SSDI",
                        "Veteran Benefits",
                        "Retirement",
                        "Child Support",
                        "Other",
                      ].map((source) => (
                        <FormControlLabel
                          key={source}
                          control={
                            <Checkbox
                              checked={form.otherIncomeSources.includes(source)}
                              onChange={(event) => {
                                if (event.target.checked) {
                                  setForm((prev) => ({
                                    ...prev,
                                    otherIncomeSources: [
                                      ...prev.otherIncomeSources,
                                      source,
                                    ],
                                  }));
                                } else {
                                  setForm((prev) => ({
                                    ...prev,
                                    otherIncomeSources: prev.otherIncomeSources.filter(
                                      (item) => item !== source,
                                    ),
                                  }));
                                }
                              }}
                            />
                          }
                          label={source}
                        />
                      ))}

                      {form.otherIncomeSources.includes("Other") && (
                        <TextField
                          label="Other Income Source"
                          value={form.otherIncomeDescription}
                          onChange={(event) =>
                            setField("otherIncomeDescription", event.target.value)
                          }
                          fullWidth
                          sx={{ mt: 2 }}
                        />
                      )}

                      <TextField
                        label="Total Monthly Other Income"
                        value={form.monthlyOtherIncome}
                        onChange={(event) =>
                          setField("monthlyOtherIncome", event.target.value)
                        }
                        type="number"
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            ),
                          },
                          htmlInput: { min: 0 },
                        }}
                        fullWidth
                        sx={{ mt: 2, maxWidth: 400 }}
                      />
                    </Box>
                  )}

                  {/* Education */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Education
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      mt: 1,
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 2,
                    }}
                  >
                    <TextField
                      select
                      label="Highest Level of Education Completed"
                      value={form.highestEducationCompleted}
                      onChange={(event) =>
                        setField("highestEducationCompleted", event.target.value)
                      }
                      fullWidth
                    >
                      <MenuItem value="">Select...</MenuItem>
                      <MenuItem value="less-than-9th">
                        Less than 9th Grade
                      </MenuItem>
                      <MenuItem value="9th-11th">9th–11th Grade</MenuItem>
                      <MenuItem value="high-school">
                        High School Diploma
                      </MenuItem>
                      <MenuItem value="ged">
                        GED / High School Equivalency
                      </MenuItem>
                      <MenuItem value="some-college">Some College</MenuItem>
                      <MenuItem value="associate">Associate Degree</MenuItem>
                      <MenuItem value="bachelor">Bachelor's Degree</MenuItem>
                      <MenuItem value="master">Master's Degree</MenuItem>
                      <MenuItem value="doctoral">
                        Doctoral / Professional Degree
                      </MenuItem>
                      <MenuItem value="trade">
                        Trade / Vocational Certificate
                      </MenuItem>
                      <MenuItem value="unknown">Client Doesn't Know</MenuItem>
                      <MenuItem value="declined">
                        Client Prefers Not to Answer
                      </MenuItem>
                    </TextField>

                    <TextField
                      label="School / Institution"
                      value={form.schoolName}
                      onChange={(event) => setField("schoolName", event.target.value)}
                      fullWidth
                    />
                  </Box>
                </Paper>
              )}

              {/* ---------------------------------------------------------------- */}
              {/* Benefits & Insurance                                             */}
              {/* ---------------------------------------------------------------- */}
              {activeIntakeSection === "benefits-insurance" && (
                <Paper sx={{ mt: 2, p: 3 }}>
                  <Typography variant="h6">Benefits & Insurance</Typography>

                  {/* SoonerCare | SNAP — 2-col on sm+, 1-col on narrow */}
                  <Box
                    sx={{
                      mt: 2,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      columnGap: 3,
                      rowGap: 2,
                    }}
                  >
                    {/* SoonerCare */}
                    <Box>
                      <FormControl sx={{ display: "block", width: "100%" }}>
                        <Typography>
                          Does the client receive SoonerCare benefits?
                        </Typography>

                        <RadioGroup
                          row
                          value={form.soonerCareBenefits}
                          onChange={(event) =>
                            setField("soonerCareBenefits", event.target.value)
                          }
                        >
                          <FormControlLabel
                            value="yes"
                            control={<Radio />}
                            label="Yes"
                          />
                          <FormControlLabel
                            value="no"
                            control={<Radio />}
                            label="No"
                          />
                        </RadioGroup>
                      </FormControl>
                      {form.soonerCareBenefits === "yes" && (
                        <Box
                          sx={{
                            mt: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            width: "100%",
                          }}
                        >
                          <TextField
                            select
                            label="SoonerCare Plan"
                            value={form.soonerCarePlan}
                            onChange={(event) =>
                              setField("soonerCarePlan", event.target.value)
                            }
                            fullWidth
                          >
                            <MenuItem value="Oklahoma Complete">
                              Oklahoma Complete
                            </MenuItem>
                            <MenuItem value="Aetna">Aetna</MenuItem>
                            <MenuItem value="Humana">Humana</MenuItem>
                          </TextField>
                          <TextField
                            label="Member Number"
                            value={form.soonerCareId}
                            onChange={(event) =>
                              setField("soonerCareId", event.target.value)
                            }
                            fullWidth
                          />
                        </Box>
                      )}
                    </Box>

                    {/* SNAP */}
                    <Box>
                      <FormControl sx={{ display: "block", width: "100%" }}>
                        <Typography>
                          Does the client receive SNAP benefits?
                        </Typography>

                        <RadioGroup
                          row
                          value={form.snapBenefits}
                          onChange={(event) =>
                            setField("snapBenefits", event.target.value)
                          }
                        >
                          <FormControlLabel
                            value="yes"
                            control={<Radio />}
                            label="Yes"
                          />
                          <FormControlLabel
                            value="no"
                            control={<Radio />}
                            label="No"
                          />
                        </RadioGroup>
                      </FormControl>
                      {form.snapBenefits === "yes" && (
                        <Box
                          sx={{
                            mt: 1,
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          <TextField
                            label="Day SNAP Benefits Load"
                            value={form.snapLoadDay}
                            onChange={(event) =>
                              setField("snapLoadDay", event.target.value)
                            }
                            type="number"
                            slotProps={{
                              htmlInput: { min: 1, max: 31 },
                            }}
                            fullWidth
                          />
                          <TextField
                            label="Monthly SNAP Amount"
                            value={form.snapMonthlyAmount}
                            onChange={(event) =>
                              setField("snapMonthlyAmount", event.target.value)
                            }
                            type="number"
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    $
                                  </InputAdornment>
                                ),
                              },
                              htmlInput: { min: 0 },
                            }}
                            fullWidth
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Simple Yes/No pairs — 2-col on sm+, 1-col on narrow */}
                  <Box
                    sx={{
                      mt: 2,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      columnGap: 3,
                      rowGap: 2,
                    }}
                  >
                    {/* Medicaid */}
                    <FormControl sx={{ display: "block", width: "100%" }}>
                      <Typography>Does the client receive Medicaid?</Typography>

                      <RadioGroup
                        row
                        value={form.medicaidBenefits}
                        onChange={(event) =>
                          setField("medicaidBenefits", event.target.value)
                        }
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* Medicare */}
                    <FormControl sx={{ display: "block", width: "100%" }}>
                      <Typography>Does the client receive Medicare?</Typography>

                      <RadioGroup
                        row
                        value={form.medicareBenefits}
                        onChange={(event) =>
                          setField("medicareBenefits", event.target.value)
                        }
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* WIC */}
                    <FormControl sx={{ display: "block", width: "100%" }}>
                      <Typography>
                        Does the client receive WIC benefits?
                      </Typography>

                      <RadioGroup
                        row
                        value={form.wicBenefits}
                        onChange={(event) => setField("wicBenefits", event.target.value)}
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* TANF */}
                    <FormControl sx={{ display: "block", width: "100%" }}>
                      <Typography>
                        Does the client receive TANF benefits?
                      </Typography>

                      <RadioGroup
                        row
                        value={form.tanfBenefits}
                        onChange={(event) =>
                          setField("tanfBenefits", event.target.value)
                        }
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* Employer Health Insurance */}
                    <FormControl sx={{ display: "block", width: "100%" }}>
                      <Typography>
                        Does the client have employer-provided health insurance?
                      </Typography>

                      <RadioGroup
                        row
                        value={form.employerInsurance}
                        onChange={(event) =>
                          setField("employerInsurance", event.target.value)
                        }
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* Other State Health Insurance */}
                    <FormControl sx={{ display: "block", width: "100%" }}>
                      <Typography>
                        Does the client have other state health insurance?
                      </Typography>

                      <RadioGroup
                        row
                        value={form.otherStateHealthInsurance}
                        onChange={(event) =>
                          setField("otherStateHealthInsurance", event.target.value)
                        }
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>

                  {/* Financial Accounts */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Financial Accounts
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      mt: 2,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      columnGap: 3,
                      rowGap: 2,
                    }}
                  >
                    {/* Savings Account */}
                    <FormControl sx={{ display: "block", width: "100%" }}>
                      <Typography>
                        Does the client have a savings account?
                      </Typography>

                      <RadioGroup
                        row
                        value={form.hasSavingsAccount}
                        onChange={(event) =>
                          setField("hasSavingsAccount", event.target.value)
                        }
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* Checking Account */}
                    <FormControl sx={{ display: "block", width: "100%" }}>
                      <Typography>
                        Does the client have a checking account?
                      </Typography>

                      <RadioGroup
                        row
                        value={form.hasCheckingAccount}
                        onChange={(event) =>
                          setField("hasCheckingAccount", event.target.value)
                        }
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                </Paper>
              )}

              {activeIntakeSection === "legal-housing" && (
                <Paper sx={{ mt: 2, p: 3 }}>
                  {/* ---------------------------------------------------------------- */}
                  {/* Legal & Housing History                                          */}
                  {/* ---------------------------------------------------------------- */}
                  <Typography variant="h6">Legal & Housing History</Typography>

                  <Typography
                    variant="subtitle1"
                    sx={{ mt: 2, fontWeight: 600 }}
                  >
                    Legal Information
                  </Typography>
                  <Box
                    sx={{
                      mt: 2,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 3,
                    }}
                  >
                    {/* Misdemeanor */}
                    <Box>
                      <FormControl>
                        <Typography>
                          Have you ever been convicted of a misdemeanor?
                        </Typography>
                        <RadioGroup
                          row
                          value={form.misdemeanorConviction}
                          onChange={(e) =>
                            setField("misdemeanorConviction", e.target.value)
                          }
                        >
                          <FormControlLabel
                            value="yes"
                            control={<Radio />}
                            label="Yes"
                          />
                          <FormControlLabel
                            value="no"
                            control={<Radio />}
                            label="No"
                          />
                        </RadioGroup>
                      </FormControl>

                      {form.misdemeanorConviction === "yes" && (
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          label="What was the misdemeanor conviction for?"
                          value={form.misdemeanorDetails}
                          onChange={(e) =>
                            setField("misdemeanorDetails", e.target.value)
                          }
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>

                    {/* Felony */}
                    <Box>
                      <FormControl>
                        <Typography>
                          Have you ever been convicted of a felony?
                        </Typography>
                        <RadioGroup
                          row
                          value={form.felonyConviction}
                          onChange={(e) => setField("felonyConviction", e.target.value)}
                        >
                          <FormControlLabel
                            value="yes"
                            control={<Radio />}
                            label="Yes"
                          />
                          <FormControlLabel
                            value="no"
                            control={<Radio />}
                            label="No"
                          />
                        </RadioGroup>
                      </FormControl>

                      {form.felonyConviction === "yes" && (
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          label="What was the felony conviction for?"
                          value={form.felonyDetails}
                          onChange={(e) => setField("felonyDetails", e.target.value)}
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 3,
                    }}
                  >
                    {/* Probation */}
                    <FormControl>
                      <Typography>Are you currently on probation?</Typography>
                      <RadioGroup
                        row
                        value={form.onProbation}
                        onChange={(e) => setField("onProbation", e.target.value)}
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* Parole */}
                    <FormControl>
                      <Typography>Are you currently on parole?</Typography>
                      <RadioGroup
                        row
                        value={form.onParole}
                        onChange={(e) => setField("onParole", e.target.value)}
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 3,
                    }}
                  >
                    {/* Arrest Warrants */}
                    <FormControl>
                      <Typography>
                        Do you currently have any warrants for your arrest?
                      </Typography>
                      <RadioGroup
                        row
                        value={form.hasArrestWarrants}
                        onChange={(e) => setField("hasArrestWarrants", e.target.value)}
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* Unpaid Tickets */}
                    <FormControl>
                      <Typography>
                        Do you currently have any tickets that need to be paid?
                      </Typography>
                      <RadioGroup
                        row
                        value={form.hasUnpaidTickets}
                        onChange={(e) => setField("hasUnpaidTickets", e.target.value)}
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>

                  {/* Child Support */}
                  <Box sx={{ mt: 2 }}>
                    <FormControl>
                      <Typography>
                        What is your current child support status?
                      </Typography>
                      <RadioGroup
                        row
                        value={form.childSupportStatus}
                        onChange={(e) => setField("childSupportStatus", e.target.value)}
                      >
                        <FormControlLabel
                          value="paying"
                          control={<Radio />}
                          label="Paying"
                        />
                        <FormControlLabel
                          value="receiving"
                          control={<Radio />}
                          label="Receiving"
                        />
                        <FormControlLabel
                          value="both"
                          control={<Radio />}
                          label="Both"
                        />
                        <FormControlLabel
                          value="neither"
                          control={<Radio />}
                          label="Neither"
                        />
                      </RadioGroup>
                    </FormControl>

                    {(form.childSupportStatus === "paying" ||
                      form.childSupportStatus === "receiving" ||
                      form.childSupportStatus === "both") && (
                      <TextField
                        label="Monthly Child Support Amount"
                        value={form.monthlyChildSupportAmount}
                        onChange={(e) =>
                          setField("monthlyChildSupportAmount", e.target.value)
                        }
                        sx={{ mt: 1, maxWidth: 320 }}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                  </Box>

                  {/* ---------------------------------------------------------------- */}
                  {/* Housing History                                                  */}
                  {/* ---------------------------------------------------------------- */}
                  <Typography
                    variant="subtitle1"
                    sx={{ mt: 3, fontWeight: 600 }}
                  >
                    Housing History
                  </Typography>
                  <Box
                    sx={{
                      mt: 2,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 3,
                    }}
                  >
                    {/* Landlord Debt */}
                    <Box>
                      <FormControl>
                        <Typography>
                          Do you owe any money to a landlord due to breaking a
                          lease?
                        </Typography>
                        <RadioGroup
                          row
                          value={form.owesLandlordMoney}
                          onChange={(e) => setField("owesLandlordMoney", e.target.value)}
                        >
                          <FormControlLabel
                            value="yes"
                            control={<Radio />}
                            label="Yes"
                          />
                          <FormControlLabel
                            value="no"
                            control={<Radio />}
                            label="No"
                          />
                        </RadioGroup>
                      </FormControl>

                      {form.owesLandlordMoney === "yes" && (
                        <TextField
                          label="Amount Owed"
                          value={form.landlordAmountOwed}
                          onChange={(e) =>
                            setField("landlordAmountOwed", e.target.value)
                          }
                          sx={{ mt: 1, ml: 2, maxWidth: 320 }}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  $
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      )}
                    </Box>

                    {/* Utility Debt */}
                    <Box>
                      <FormControl>
                        <Typography>
                          Do you owe any money to a utility company?
                        </Typography>
                        <RadioGroup
                          row
                          value={form.owesUtilityMoney}
                          onChange={(e) => setField("owesUtilityMoney", e.target.value)}
                        >
                          <FormControlLabel
                            value="yes"
                            control={<Radio />}
                            label="Yes"
                          />
                          <FormControlLabel
                            value="no"
                            control={<Radio />}
                            label="No"
                          />
                        </RadioGroup>
                      </FormControl>

                      {form.owesUtilityMoney === "yes" && (
                        <TextField
                          label="Amount Owed"
                          value={form.utilityAmountOwed}
                          onChange={(e) => setField("utilityAmountOwed", e.target.value)}
                          sx={{ mt: 1, ml: 2, maxWidth: 320 }}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  $
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 3,
                    }}
                  >
                    {/* Eviction History */}
                    <FormControl>
                      <Typography>
                        Have you ever had an eviction notice?
                      </Typography>
                      <RadioGroup
                        row
                        value={form.hasEvictionHistory}
                        onChange={(e) => setField("hasEvictionHistory", e.target.value)}
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* Paid Storage */}
                    <FormControl>
                      <Typography>
                        Are you currently paying for a storage unit?
                      </Typography>
                      <RadioGroup
                        row
                        value={form.hasPaidStorage}
                        onChange={(e) => setField("hasPaidStorage", e.target.value)}
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                </Paper>
              )}

              {/* ---------------------------------------------------------------- */}
              {/* Health, Substance Use & Support                                   */}
              {/* ---------------------------------------------------------------- */}
              {activeIntakeSection === "health-support" && (
                <Paper sx={{ p: 3, mt: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Health, Substance Use & Support
                  </Typography>

                  <Typography
                    variant="subtitle1"
                    sx={{ mt: 2, fontWeight: 600 }}
                  >
                    Substance Use
                  </Typography>

                  <FormControl sx={{ mt: 2 }}>
                    <Typography>
                      Do you have any current or past substance use concerns?
                    </Typography>
                    <RadioGroup
                      row
                      value={form.hasSubstanceUseConcerns}
                      onChange={(e) =>
                        setField("hasSubstanceUseConcerns", e.target.value)
                      }
                    >
                      <FormControlLabel
                        value="yes"
                        control={<Radio />}
                        label="Yes"
                      />
                      <FormControlLabel
                        value="no"
                        control={<Radio />}
                        label="No"
                      />
                    </RadioGroup>
                  </FormControl>
                  {form.hasSubstanceUseConcerns === "yes" && (
                    <Box sx={{ mb: 2 }}>
                      <Typography sx={{ mb: 1 }}>
                        Select all substances that apply:
                      </Typography>

                      {[
                        "Alcohol",
                        "Methamphetamine",
                        "Cocaine / Crack Cocaine",
                        "Marijuana / Cannabis",
                        "Opioids / Heroin",
                        "Prescription Opioids",
                        "Fentanyl",
                        "Benzodiazepines",
                        "Prescription Stimulants",
                        "Hallucinogens",
                        "Inhalants",
                        "Other",
                      ].map((substance) => (
                        <FormControlLabel
                          key={substance}
                          control={
                            <Checkbox
                              checked={form.substancesUsed.includes(substance)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setForm((prev) => ({
                                    ...prev,
                                    substancesUsed: [
                                      ...prev.substancesUsed,
                                      substance,
                                    ],
                                  }));
                                } else {
                                  setForm((prev) => ({
                                    ...prev,
                                    substancesUsed: prev.substancesUsed.filter(
                                      (item) => item !== substance,
                                    ),
                                  }));
                                }
                              }}
                            />
                          }
                          label={substance}
                        />
                      ))}

                      {form.substancesUsed.includes("Other") && (
                        <TextField
                          fullWidth
                          label="Other Substance"
                          value={form.otherSubstance}
                          onChange={(e) => setField("otherSubstance", e.target.value)}
                          sx={{ mt: 1 }}
                        />
                      )}

                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        label="Substance Use Details (Optional)"
                        value={form.substanceUseDetails}
                        onChange={(e) => setField("substanceUseDetails", e.target.value)}
                        sx={{ mt: 2 }}
                      />
                    </Box>
                  )}
                  <Typography
                    variant="subtitle1"
                    sx={{ mt: 3, fontWeight: 600 }}
                  >
                    Medical & Health
                  </Typography>

                  <FormControl sx={{ mt: 2 }}>
                    <Typography>
                      Are you currently receiving treatment for a medical
                      condition?
                    </Typography>
                    <RadioGroup
                      row
                      value={form.currentlyReceivingMedicalTreatment}
                      onChange={(e) =>
                        setField("currentlyReceivingMedicalTreatment", e.target.value)
                      }
                    >
                      <FormControlLabel
                        value="yes"
                        control={<Radio />}
                        label="Yes"
                      />
                      <FormControlLabel
                        value="no"
                        control={<Radio />}
                        label="No"
                      />
                    </RadioGroup>
                  </FormControl>
                  {form.currentlyReceivingMedicalTreatment === "yes" && (
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      label="Medical Condition / Treatment Details"
                      value={form.medicalTreatmentDetails}
                      onChange={(e) =>
                        setField("medicalTreatmentDetails", e.target.value)
                      }
                      sx={{ mt: 1 }}
                    />
                  )}
                  <Typography
                    variant="subtitle1"
                    sx={{ mt: 3, fontWeight: 600 }}
                  >
                    Health / Support Needs
                  </Typography>

                  <Typography sx={{ mt: 1, mb: 1 }}>
                    Select all that apply:
                  </Typography>

                  {[
                    "Behavioral",
                    "Physical Disability",
                    "Medical / Health",
                    "Mental Health",
                    "Developmental",
                    "Other",
                    "None",
                  ].map((need) => (
                    <FormControlLabel
                      key={need}
                      control={
                        <Checkbox
                          checked={form.healthSupportNeeds.includes(need)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (need === "None") {
                                setField("healthSupportNeeds", ["None"]);
                              } else {
                                setForm((prev) => ({
                                  ...prev,
                                  healthSupportNeeds: [
                                    ...prev.healthSupportNeeds.filter(
                                      (item) => item !== "None",
                                    ),
                                    need,
                                  ],
                                }));
                              }
                            } else {
                              setForm((prev) => ({
                                ...prev,
                                healthSupportNeeds: prev.healthSupportNeeds.filter(
                                  (item) => item !== need,
                                ),
                              }));
                            }
                          }}
                        />
                      }
                      label={need}
                    />
                  ))}
                  {form.healthSupportNeeds.includes("Other") && (
                    <TextField
                      fullWidth
                      label="Other Health / Support Need"
                      value={form.otherHealthSupportNeed}
                      onChange={(e) =>
                        setField("otherHealthSupportNeed", e.target.value)
                      }
                      sx={{ mt: 1 }}
                    />
                  )}
                  {form.healthSupportNeeds
                    .filter((need) => need !== "Other" && need !== "None")
                    .map((need) => (
                      <TextField
                        key={need}
                        fullWidth
                        multiline
                        minRows={2}
                        label={`${need} Details (Optional)`}
                        value={form.healthSupportDetails[need] || ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            healthSupportDetails: {
                              ...prev.healthSupportDetails,
                              [need]: e.target.value,
                            },
                          }))
                        }
                        sx={{ mt: 2 }}
                      />
                    ))}
                  <Typography
                    variant="subtitle1"
                    sx={{ mt: 3, fontWeight: 600 }}
                  >
                    Social & Financial Support
                  </Typography>

                  <Typography sx={{ mt: 1 }}>
                    What social and financial support do you currently have?
                  </Typography>

                  <Typography variant="body2" sx={{ mt: 0.5, mb: 1 }}>
                    Select all that apply. Support may include yourself, people
                    in your life, or organizations/services you can rely on.
                  </Typography>

                  {[
                    "Self",
                    "Family",
                    "Friends",
                    "Partner / Spouse",
                    "Church / Faith Community",
                    "Case Manager / Social Worker",
                    "Counselor / Therapist",
                    "Probation / Drug Court",
                    "Community Organization",
                    "Other",
                    "None",
                  ].map((support) => (
                    <FormControlLabel
                      key={support}
                      control={
                        <Checkbox
                          checked={form.socialFinancialSupport.includes(support)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (support === "None") {
                                setField("socialFinancialSupport", ["None"]);
                              } else {
                                setForm((prev) => ({
                                  ...prev,
                                  socialFinancialSupport: [
                                    ...prev.socialFinancialSupport.filter(
                                      (item) => item !== "None",
                                    ),
                                    support,
                                  ],
                                }));
                              }
                            } else {
                              setForm((prev) => ({
                                ...prev,
                                socialFinancialSupport:
                                  prev.socialFinancialSupport.filter(
                                    (item) => item !== support,
                                  ),
                              }));
                            }
                          }}
                        />
                      }
                      label={support}
                    />
                  ))}
                  {form.socialFinancialSupport.includes("Other") && (
                    <TextField
                      fullWidth
                      label="Other Social / Financial Support"
                      value={form.otherSocialFinancialSupport}
                      onChange={(e) =>
                        setField("otherSocialFinancialSupport", e.target.value)
                      }
                      sx={{ mt: 1 }}
                    />
                  )}
                  <Typography
                    variant="subtitle1"
                    sx={{ mt: 3, fontWeight: 600 }}
                  >
                    Children / School & Childcare
                  </Typography>

                  <FormControl sx={{ mt: 1 }}>
                    <Typography>
                      Are any of your children currently enrolled in childcare
                      or school?
                    </Typography>
                    <RadioGroup
                      row
                      value={form.childrenInSchoolOrChildcare}
                      onChange={(e) =>
                        setField("childrenInSchoolOrChildcare", e.target.value)
                      }
                    >
                      <FormControlLabel
                        value="yes"
                        control={<Radio />}
                        label="Yes"
                      />
                      <FormControlLabel
                        value="no"
                        control={<Radio />}
                        label="No"
                      />
                      <FormControlLabel
                        value="not-applicable"
                        control={<Radio />}
                        label="Not Applicable"
                      />
                    </RadioGroup>
                  </FormControl>
                  <Typography
                    variant="subtitle1"
                    sx={{ mt: 3, fontWeight: 600 }}
                  >
                    Religious / Spiritual Traditions
                  </Typography>

                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Religious / Spiritual Traditions (Optional)"
                    value={form.religiousSpiritualTraditions}
                    onChange={(e) =>
                      setField("religiousSpiritualTraditions", e.target.value)
                    }
                    sx={{ mt: 1 }}
                  />
                </Paper>
              )}

              {/* ---------------------------------------------------------------- */}
              {/* Agreements & Waivers                                             */}
              {/* ---------------------------------------------------------------- */}
              {/* Policy copy in content/agreementsWaivers; initials fields stay on the page. */}
              {activeIntakeSection === "agreements-waivers" && (
                <>
                  <Paper sx={{ p: 3, mt: 3 }}>
                    <AgreementsWaiversTitle />

                    <Box sx={{ mt: 2 }}>
                    <AgreementChildSupportDhsCopy />


                      <TextField
                        label="Client Initials"
                        value={form.childSupportDhsInitials}
                        onChange={(e) =>
                          setField("childSupportDhsInitials", e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>
                    <Box sx={{ mt: 3 }}>
                    <AgreementMedicationResponsibilityCopy />


                      <TextField
                        label="Client Initials"
                        value={form.medicationResponsibilityInitials}
                        onChange={(e) =>
                          setField("medicationResponsibilityInitials", e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>
                    <Box sx={{ mt: 3 }}>
                    <AgreementVehicleTransportationCopy />


                      <TextField
                        label="Client Initials"
                        value={form.vehicleTransportationInitials}
                        onChange={(e) =>
                          setField("vehicleTransportationInitials", e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>
                    <Box sx={{ mt: 3 }}>
                    <AgreementPossessionsCopy />


                      <TextField
                        label="Client Initials"
                        value={form.possessionsInitials}
                        onChange={(e) => setField("possessionsInitials", e.target.value)}
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>
                    <Box sx={{ mt: 3 }}>
                    <AgreementProgramGuidelinesCopy />


                      <TextField
                        label="Client Initials"
                        value={form.programGuidelinesInitials}
                        onChange={(e) =>
                          setField("programGuidelinesInitials", e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>
                    <Box sx={{ mt: 3 }}>
                    <AgreementBackgroundTestingSearchCopy />


                      <TextField
                        label="Client Initials"
                        value={form.backgroundTestingSearchInitials}
                        onChange={(e) =>
                          setField("backgroundTestingSearchInitials", e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>
                    <Box sx={{ mt: 3 }}>
                    <AgreementInformationSharingCopy />


                      <TextField
                        label="Client Initials"
                        value={form.informationSharingInitials}
                        onChange={(e) =>
                          setField("informationSharingInitials", e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>
                    {/* Facility Bedroom & Utility Expectations */}
                    <Box sx={{ mt: 3 }}>
                    <AgreementFacilityExpectationsCopy />


                      <TextField
                        label="Client Initials"
                        value={form.facilityExpectationsInitials}
                        onChange={(e) =>
                          setField("facilityExpectationsInitials", e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>
                    {/* Volunteer Release and Waiver of Liability */}
                    <Box sx={{ mt: 3 }}>
                    <AgreementVolunteerReleaseCopy
                      intakeDate={form.intakeDate}
                      participantName={[form.firstName, form.middleName, form.lastName]
                        .filter(Boolean)
                        .join(" ")}
                    />

                      <TextField
                        label="Client Initials"
                        value={form.volunteerWaiverInitials}
                        onChange={(e) =>
                          setField("volunteerWaiverInitials", e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>
                    {/* Confidentiality Agreement */}
                    <Box sx={{ mt: 3 }}>
                    <AgreementConfidentialityCopy intakeDate={form.intakeDate} />


                      <TextField
                        label="Client Initials"
                        value={form.confidentialityAgreementInitials}
                        onChange={(e) =>
                          setField("confidentialityAgreementInitials", e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>
                    {/* Co-Ed Accountability Policy */}
                    <Box sx={{ mt: 3 }}>
                    <AgreementCoEdAccountabilityCopy />

                      <TextField
                        label="Client Initials"
                        value={form.coEdAccountabilityInitials}
                        onChange={(e) =>
                          setField("coEdAccountabilityInitials", e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>
                    {/* Dress for Success */}
                    <Box sx={{ mt: 3 }}>
                    <AgreementDressForSuccessCopy />


                      <TextField
                        label="Client Initials"
                        value={form.dressForSuccessInitials}
                        onChange={(e) =>
                          setField("dressForSuccessInitials", e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>
                    {/* Nondiscrimination and Equal Opportunity Statement */}
                    <Box sx={{ mt: 3 }}>
                    <AgreementNondiscriminationCopy />


                      <TextField
                        label="Client Initials"
                        value={form.nondiscriminationInitials}
                        onChange={(e) =>
                          setField("nondiscriminationInitials", e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>
                  </Paper>
                </>
              )}
              {activeIntakeSection === "program-assignment" && (
                <Paper sx={{ p: 3, mt: 3 }}>
                  {/* Program Assignment */}
                  <Box sx={{ mt: 3 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Program Assignment
                    </Typography>

                    <FormControl>
                      <Typography sx={{ mb: 1 }}>
                        Which program is the client entering?
                      </Typography>

                      <RadioGroup
                        value={form.clientProgram}
                        onChange={(e) => setField("clientProgram", e.target.value)}
                      >
                        <FormControlLabel
                          value="OVN"
                          control={<Radio />}
                          label="Overnight (OVN)"
                        />
                        <FormControlLabel
                          value="LTP"
                          control={<Radio />}
                          label="Life Transformation Program (LTP)"
                        />
                        <FormControlLabel
                          value="TEMP"
                          control={<Radio />}
                          label="Emergency Temporary Shelter (TEMP)"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>

                  {form.clientProgram === "OVN" && (
                    <Box sx={{ mt: 3 }}>
                      <ProgramOvnCopy />
                      <TextField
                        label="Client Initials"
                        value={form.overnightProgramInitials}
                        onChange={(e) =>
                          setField("overnightProgramInitials", e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>
                  )}

                  {form.clientProgram === "LTP" && (
                    <Box sx={{ mt: 3 }}>
                      <ProgramLtpCopy />
                      <TextField
                        label="Client Initials"
                        value={form.lifeTransformationProgramInitials}
                        onChange={(e) =>
                          setField("lifeTransformationProgramInitials", e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>
                  )}

                  {form.clientProgram === "TEMP" && (
                    <Box sx={{ mt: 3 }}>
                      <ProgramTempCopy />
                      <TextField
                        label="Client Initials"
                        value={form.temporaryShelterProgramInitials}
                        onChange={(e) =>
                          setField("temporaryShelterProgramInitials", e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>
                  )}
                </Paper>
              )}


              {activeIntakeSection === "covid-health" && (
                <Paper sx={{ p: 3, mt: 3 }}>
                  {/* COVID-19 Health & Safety Information */}
                  <Box sx={{ mt: 3 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      COVID-19 Health & Safety Information
                    </Typography>

                    <Typography>
                      Public health requirements and recommended precautions
                      related to COVID-19 may be updated over time. Hope House
                      Guthrie reserves the right to implement reasonable health
                      and safety measures as needed to protect clients, staff,
                      volunteers, and visitors.
                    </Typography>

                    <Typography sx={{ mt: 2, fontWeight: 600 }}>
                      Have you received a COVID-19 vaccination?
                    </Typography>

                    <RadioGroup
                      row
                      value={form.covidVaccinated}
                      onChange={(e) => setField("covidVaccinated", e.target.value)}
                    >
                      <FormControlLabel
                        value="Yes"
                        control={<Radio />}
                        label="Yes"
                      />
                      <FormControlLabel
                        value="No"
                        control={<Radio />}
                        label="No"
                      />
                    </RadioGroup>

                    {form.covidVaccinated === "Yes" && (
                      <TextField
                        label="Approximate Vaccination Date"
                        type="date"
                        value={form.covidVaccinationDate}
                        onChange={(e) =>
                          setField("covidVaccinationDate", e.target.value)
                        }
                        slotProps={{
                          inputLabel: { shrink: true },
                        }}
                        sx={{ mt: 1, width: 220, maxWidth: "100%" }}
                      />
                    )}

                    {form.covidVaccinated === "No" && (
                      <TextField
                        label="Vaccination Appointment Date"
                        type="date"
                        value={form.covidVaccinationAppointmentDate}
                        onChange={(e) =>
                          setField("covidVaccinationAppointmentDate", e.target.value)
                        }
                        slotProps={{
                          inputLabel: { shrink: true },
                        }}
                        sx={{ mt: 1, width: 220, maxWidth: "100%" }}
                      />
                    )}

                    <Typography sx={{ mt: 2, fontWeight: 600 }}>
                      Was proof of COVID-19 vaccination provided?
                    </Typography>

                    <RadioGroup
                      row
                      value={form.covidVaccinationProof}
                      onChange={(e) => setField("covidVaccinationProof", e.target.value)}
                    >
                      <FormControlLabel
                        value="Yes"
                        control={<Radio />}
                        label="Yes"
                      />
                      <FormControlLabel
                        value="No"
                        control={<Radio />}
                        label="No"
                      />
                    </RadioGroup>

                    {form.covidVaccinationProof === "Yes" && (
                      <Box sx={{ mt: 1 }}>
                        <Button variant="outlined" component="label">
                          Attach Proof of Vaccination
                          {/* Prototype only: selected File lives in component state until refresh. */}
                          <input
                            type="file"
                            hidden
                            accept="image/*,.pdf"
                            onChange={(e) =>
                              setField(
                                "covidVaccinationProofFile",
                                e.target.files?.[0] ?? null,
                              )
                            }
                          />
                        </Button>

                        {form.covidVaccinationProofFile && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Selected: {form.covidVaccinationProofFile.name}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                </Paper>
              )}

              {/* SNAP notice: static policy copy in content/snapNotice; fields stay on the page. */}
              {activeIntakeSection === "snap-notice" && (
                <Paper sx={{ p: 3, mt: 3 }}>
                  <SnapNoticePolicyContent />
                  <Box sx={{ mt: 2 }}>
                    <Typography sx={{ fontWeight: 600 }}>
                      SNAP Status
                    </Typography>

                    <Typography sx={{ mt: 1 }}>
                      {form.snapBenefits === "Yes"
                        ? "Receives SNAP"
                        : form.snapBenefits === "No"
                          ? "Does Not Receive SNAP"
                          : "SNAP status has not been entered."}
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                      <SnapNoticeAcknowledgmentCopy />
                      <Typography sx={{ mt: 2 }}>
                        <strong>Participant Name:</strong>{" "}
                        {[form.firstName, form.middleName, form.lastName]
                          .filter(Boolean)
                          .join(" ") || "Not entered"}
                      </Typography>
                      <TextField
                        label="Acknowledgment Date"
                        type="date"
                        value={form.snapAcknowledgmentDate}
                        onChange={(e) =>
                          setField("snapAcknowledgmentDate", e.target.value)
                        }
                        slotProps={{
                          inputLabel: { shrink: true },
                        }}
                        sx={{ mt: 2, width: 220, maxWidth: "100%" }}
                      />
                    </Box>
                  </Box>
                </Paper>
              )}

              {/* Client Handbook: frontend static tabbed content; not a CMS. Candidate for later content extraction. */}
              {activeIntakeSection === "client-handbook" && (
                <Paper sx={{ p: 3, mt: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Client Handbook
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 1.5,
                      mt: 2,
                    }}
                  >
                    {handbookTabs.map(([id, label]) => (
                      <Button
                        key={id}
                        variant={
                          activeHandbookTab === id ? "contained" : "outlined"
                        }
                        onClick={() => setActiveHandbookTab(id ?? "")}
                      >
                        {label}
                      </Button>
                    ))}
                  </Box>

                  {renderHandbookTabContent(activeHandbookTab)}
                </Paper>
              )}

              {/* Signatures: shared SignatureCanvas; values stored on the intake snapshot (FE only). */}
              {activeIntakeSection === "authorizations" && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Authorizations
                  </Typography>

                  <AuthorizationsHmisRoiCopy />

                  <Box sx={{ mt: 3 }}>
                    <Typography sx={{ fontWeight: 600 }}>
                      Do you authorize the HMIS / ShareLink Release of
                      Information?
                    </Typography>

                    <RadioGroup
                      value={form.hmisAuthorization}
                      onChange={(event) =>
                        setField("hmisAuthorization", event.target.value)
                      }
                      sx={{ mt: 1 }}
                    >
                      <FormControlLabel
                        value="accepted"
                        control={<Radio />}
                        label="YES - ACCEPTED"
                      />

                      <FormControlLabel
                        value="denied"
                        control={<Radio />}
                        label="NO - DENIED"
                      />
                    </RadioGroup>

                    <Typography sx={{ fontWeight: 600, mb: 1 }}>
                      Client Signature
                    </Typography>

                    <SignatureCanvas
                      onSignatureChange={(value) => setField("hmisSignature", value)}
                      width={500}
                      height={100}
                      showLabel={false}
                    />
                    <Typography sx={{ mt: 2, fontWeight: 600 }}>
                      Date
                    </Typography>

                    <TextField
                      type="date"
                      value={form.hmisSignatureDate}
                      onChange={(event) =>
                        setField("hmisSignatureDate", event.target.value)
                      }
                      onFocus={() => {
                        if (!form.hmisSignatureDate) {
                          setField(
                            "hmisSignatureDate",
                            new Date().toLocaleDateString("en-CA"),
                          );
                        }
                      }}
                      sx={{ mt: 1, width: 220 }}
                    />
                  </Box>
                </Paper>
              )}

              {/* Final Review */}
              {activeIntakeSection === "final-review" && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Final Review
                  </Typography>

                  <Typography sx={{ mt: 2, fontWeight: 600 }}>
                    Final Intake Acknowledgment
                  </Typography>

                  <Typography sx={{ mt: 0.5 }}>
                    By signing below, you acknowledge that you have received
                    full clarification of all information contained in this
                    intake application and agree to comply with its terms and
                    conditions.
                  </Typography>

                  <Typography sx={{ mt: 1 }}>
                    You understand that you may request a copy of your client
                    file by completing and submitting the required request form
                    (Form 48 ETA).
                  </Typography>

                  <Typography sx={{ mt: 2, fontWeight: 600 }}>
                    Nondiscrimination
                  </Typography>

                  <Typography sx={{ mt: 0.5 }}>
                    Neighborhood Hope Dealers, Inc., dba Hope House Guthrie,
                    does not discriminate on the basis of race, color, religion,
                    sex, national origin, age, disability, or any other
                    protected status.
                  </Typography>

                  <Typography sx={{ mt: 2, fontWeight: 600 }}>
                    Program Services & Housing Contribution
                  </Typography>

                  <Typography sx={{ mt: 0.5 }}>
                    All services provided by Neighborhood Hope Dealers, Inc.,
                    dba Hope House Guthrie, are provided at no cost to the
                    client.
                  </Typography>

                  <Typography sx={{ mt: 1 }}>
                    Clients may choose to make a voluntary contribution toward
                    housing expenses. Any housing contribution is voluntary and
                    is not required as a condition of receiving services.
                  </Typography>

                  <Box sx={{ mt: 3 }}>
                    <Typography sx={{ fontWeight: 600 }}>
                      Program Assignment
                    </Typography>

                    <Typography sx={{ mt: 0.5 }}>
                      {form.clientProgram === "OVN"
                        ? "Overnight Program (OVN)"
                        : form.clientProgram === "LTP"
                          ? "Life Transformation Program (LTP)"
                          : form.clientProgram === "TEMP"
                            ? "Emergency Temporary Shelter (TEMP)"
                            : "Not assigned"}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Typography sx={{ fontWeight: 600, mt: 1 }}>
                      Client Signature
                    </Typography>

                    <SignatureCanvas
                      onSignatureChange={(value) => setField("finalClientSignature", value)}
                      width={500}
                      height={100}
                      showLabel={false}
                    />
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Typography sx={{ fontWeight: 600, mt: 1 }}>
                      Administration Signature
                    </Typography>

                    <SignatureCanvas
                      onSignatureChange={(value) => setField("finalAdminSignature", value)}
                      width={500}
                      height={100}
                      showLabel={false}
                    />
                  </Box>
                  <Box
                    sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}
                  >
                    {activeCompletedIntakeId === null ? (
                      <Button variant="contained" onClick={completeIntake}>
                        Complete Intake
                      </Button>
                    ) : completedIntakes.find(
                        (intake) => intake.id === activeCompletedIntakeId,
                      )?.reviewStatus === "Pending Review" ? (
                      <Button variant="contained" onClick={completeReview}>
                        Complete Review
                      </Button>
                    ) : null}
                  </Box>
                </Paper>
              )}
            </Box>
          </Box>
        </>
      )}

      {activeTab === 1 && (
        <DraftIntakesList
          drafts={draftIntakes}
          onOpenDraft={(draft) => {
            setActiveDraftId(draft.id);
            loadIntakeData(draft);
            setActiveTab(0);
          }}
        />
      )}

      {activeTab === 2 && (
        <CompletedIntakesList
          intakes={completedIntakes}
          onOpenIntake={(intake) => {
            setActiveCompletedIntakeId(intake.id);
            setIsEditingCompletedIntake(false);
            loadIntakeData(intake);
            setActiveTab(0);
          }}
        />
      )}
    </Box>
  );
}
