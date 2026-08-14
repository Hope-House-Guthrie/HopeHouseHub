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
const initialState = { requests: [] as UAForm[] };

// ---------------------------------------------------------------------------
// Redux Slice
// ---------------------------------------------------------------------------

export const uaFormSlice = createSlice({
  name: "uaForm",
  initialState,
  reducers: {
    resetUAForm: (state) => {
      state.requests = [];
    },
    addUAForm: (state, action: PayloadAction<UAForm>) => {
      state.requests.push(action.payload);
    },
  },
});

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const { resetUAForm, addUAForm } = uaFormSlice.actions;

export default uaFormSlice.reducer;
