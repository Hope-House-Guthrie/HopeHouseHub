// --- Drug Panel Types ---
export type DrugResult = "Positive" | "Negative" | "Verify";

export interface DrugPanel {
  id: string; // e.g., "amp"
  abbreviation: string; // e.g., "AMP"
  full_name: string; // e.g., "Amphetamine"
  result: DrugResult;
}

// --- Main UA Form Interface ---
export interface UAForm {
  id: string;
  clientName: string;
  intakeDate: string; // Date string
  lastUaDate?: string; // Optional previous UA date
  drugPanels: DrugPanel[];
  observedBy: {
    staffName: string;
    time: string; // Time string
    observed: "Yes" | "No";
  };
  uaReason: "Intake" | "Random" | "Pass Return";
  remarks: string;
  collectorInfo: {
    collectorName: string;
    collectorPhone: string;
    collectionDate: string;
  };
  specimenTemp: "In Range" | "Not In Range";
  clientSignature?: string; // Placeholder for future implementation
  clientSignatureDate?: string;
  adminSignature?: string; // Placeholder for future implementation
  adminSignatureDate?: string;
  submittedAt: string; // When form was created
  status: "pending" | "approved" | "signed"; // Approval flow
}

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// --- Helper: Create all drug panels ---
const createDrugPanels = (): DrugPanel[] => {
  const abbreviations = [
    "AMP",
    "BAR",
    "BUP",
    "BZO",
    "COC",
    "MDMA",
    "MET",
    "MTD",
    "OPI 2000",
    "OXY",
    "PCP",
    "PPX",
    "TCA",
    "THC 50",
  ];
  const names = [
    "Amphetamine",
    "Secobarbital",
    "Buprenorphine",
    "Oxazepam",
    "Cocaine",
    "Methylenedioxymethamphetamine (MDMA/Ecstasy)",
    "Methamphetamine",
    "Methadone",
    "Opiates (2000 ng/mL cutoff)",
    "Oxycodone",
    "Phencyclidine",
    "Propoxyphene",
    "Nortriptyline",
    "Cannabinoids / Marijuana (50 ng/mL cutoff)",
  ];

  return abbreviations.map((abbr, index) => ({
    id: abbr.toLowerCase().replace(" ", ""),
    abbreviation: abbr,
    full_name: names[index] || abbr, // Fallback to abbreviation if name not found
    result: "Verify" as DrugResult,
  }));
};

// --- Initial State ---
const initialState: UAForm = {
  id: crypto.randomUUID(), // Use built-in crypto API instead of uuid package
  clientName: "",
  intakeDate: "",
  lastUaDate: "",
  drugPanels: createDrugPanels(),
  observedBy: {
    staffName: "",
    time: "",
    observed: "Yes",
  },
  uaReason: "Random",
  remarks: "",
  collectorInfo: {
    collectorName: "",
    collectorPhone: "",
    collectionDate: "",
  },
  specimenTemp: "In Range",
  clientSignature: "",
  clientSignatureDate: "",
  adminSignature: "",
  adminSignatureDate: "",
  submittedAt: new Date().toISOString(),
  status: "pending",
};

// ---------------------------------------------------------------------------
// Redux Slice
// ---------------------------------------------------------------------------

export const uaFormSlice = createSlice({
  name: "uaForm",
  initialState,
  reducers: {
    // Reset form to initial state
    resetUAForm: (state) => {
      return initialState;
    },
    // Update specific fields
    updateClientInfo: (
      state,
      action: PayloadAction<{
        clientName: string;
        intakeDate: string;
        lastUaDate?: string;
      }>,
    ) => {
      state.clientName = action.payload.clientName;
      state.intakeDate = action.payload.intakeDate;
      if (action.payload.lastUaDate !== undefined) {
        state.lastUaDate = action.payload.lastUaDate;
      }
    },
    updateDrugPanel: (
      state,
      action: PayloadAction<{ id: string; result: DrugResult }>,
    ) => {
      const panel = state.drugPanels.find((p) => p.id === action.payload.id);
      if (panel) {
        panel.result = action.payload.result;
      }
    },
    updateObservedBy: (
      state,
      action: PayloadAction<{
        staffName: string;
        time: string;
        observed: "Yes" | "No";
      }>,
    ) => {
      state.observedBy = action.payload;
    },
    updateUAReason: (
      state,
      action: PayloadAction<"Random" | "Pass Return" | "Intake">,
    ) => {
      state.uaReason = action.payload;
    },
    updateRemarks: (state, action: PayloadAction<string>) => {
      state.remarks = action.payload;
    },
    updateCollectorInfo: (
      state,
      action: PayloadAction<{
        collectorName: string;
        collectorPhone: string;
        collectionDate: string;
      }>,
    ) => {
      state.collectorInfo = action.payload;
    },
    updateSpecimenTemp: (
      state,
      action: PayloadAction<"In Range" | "Not In Range">,
    ) => {
      state.specimenTemp = action.payload;
    },
    // Submit/create the UA form
    submitUAForm: (state) => {
      state.submittedAt = new Date().toISOString();
      state.status = "approved";
    },
  },
});

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const {
  resetUAForm,
  updateClientInfo,
  updateDrugPanel,
  updateObservedBy,
  updateUAReason,
  updateRemarks,
  updateCollectorInfo,
  updateSpecimenTemp,
  submitUAForm,
} = uaFormSlice.actions;

export default uaFormSlice.reducer;
