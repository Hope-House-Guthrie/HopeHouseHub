import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// --- Drug Panel Types ---
export type DrugResult = "Positive" | "Negative" | "Verify";

export interface DrugPanel {
  id: string;
  abbreviation: string;
  full_name: string;
  result: DrugResult;
}

/**
 * Workflow status (FE mock → backend later)
 * - pending: submitted; missing client and/or Administration signature
 * - complete: client + Administration both signed
 *
 * Old "approved" / "signed" folded into these for clearer staff language.
 */
export type UAFormStatus = "pending" | "complete";

// --- Main UA Form Interface ---
export interface UAForm {
  id: string;
  clientName: string;
  intakeDate: string;
  lastUaDate?: string;
  drugPanels: DrugPanel[];
  observedBy: {
    staffName: string;
    time: string;
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
  /** Raw base64 PNG (no data: prefix) — SignatureCanvas */
  clientSignature: string;
  clientSignatureDate: string;
  /** Administration countersign — may finish later via Open from history */
  adminSignature: string;
  adminSignatureDate: string;
  submittedAt: string;
  status: UAFormStatus;
}

/** Finish / replace signatures on an existing UA (no new history row) */
export type UASignatureUpdateInput = {
  id: string;
  clientSignature: string;
  clientSignatureDate: string;
  adminSignature: string;
  adminSignatureDate: string;
};

export function resolveUAStatus(
  clientSignature: string,
  adminSignature: string
): UAFormStatus {
  const both =
    Boolean(clientSignature?.trim()) && Boolean(adminSignature?.trim());
  return both ? "complete" : "pending";
}

export function uaStatusLabel(status: UAFormStatus): string {
  return status === "complete" ? "Complete" : "Pending Signature";
}

// --- Helper: Create all drug panels ---
export const createDrugPanels = (): DrugPanel[] => {
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
    full_name: names[index] || abbr,
    result: "Verify" as DrugResult,
  }));
};

// ---------------------------------------------------------------------------
// BACKEND TODO / FUTURE INTEGRATION:
// - POST /api/ua-forms on submit; PUT /api/ua-forms/:id for signature finish
// - Role gate: staff collect + client sign; Administration open + countersign
// - Persist history multi-device; clientId instead of free-text name long-term
// ---------------------------------------------------------------------------

const initialState = { requests: [] as UAForm[] };

export const uaFormSlice = createSlice({
  name: "uaForm",
  initialState,
  reducers: {
    resetUAForm: (state) => {
      state.requests = [];
    },

    /** New UA from the form (staff + usually client sig) */
    addUAForm: (state, action: PayloadAction<UAForm>) => {
      const row = action.payload;
      const clientSignature = row.clientSignature ?? "";
      const adminSignature = row.adminSignature ?? "";
      state.requests.push({
        ...row,
        clientSignature,
        clientSignatureDate: row.clientSignatureDate ?? "",
        adminSignature,
        adminSignatureDate: row.adminSignatureDate ?? "",
        status: resolveUAStatus(clientSignature, adminSignature),
        submittedAt: row.submittedAt || new Date().toISOString(),
      });
    },

    /**
     * Finish / replace signatures on an existing UA.
     * Does NOT create a second history row.
     * BACKEND TODO: PUT /api/ua-forms/:id/signatures
     */
    updateUAFormSignatures: (
      state,
      action: PayloadAction<UASignatureUpdateInput>
    ) => {
      const {
        id,
        clientSignature,
        clientSignatureDate,
        adminSignature,
        adminSignatureDate,
      } = action.payload;
      const row = state.requests.find((r) => r.id === id);
      if (!row) return;

      row.clientSignature = clientSignature ?? "";
      row.clientSignatureDate = clientSignatureDate ?? "";
      row.adminSignature = adminSignature ?? "";
      row.adminSignatureDate = adminSignatureDate ?? "";
      row.status = resolveUAStatus(row.clientSignature, row.adminSignature);
    },
  },
});

export const { resetUAForm, addUAForm, updateUAFormSignatures } =
  uaFormSlice.actions;

export default uaFormSlice.reducer;
