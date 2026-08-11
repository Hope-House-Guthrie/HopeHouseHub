import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PassStatus = "pending" | "approved" | "denied";

export type PassType = "4h" | "12h" | "24h" | "48h";

export interface PassRequest {
  id: string;
  residentName: string;
  purpose: string;
  submittedAt: string;
  status: PassStatus;
  comment?: string;
  passStart: string;
  passEnd: string;
  passType: PassType;
  clientName: string;
  visitorName: string;
  visitorPhone: string;
  canPassUA: "yes" | "no" | "idk";
  choreCovered: boolean;
  choreCoveredBy: string;
  onPremises: boolean;
  offPremises: boolean;
}

export interface PassRequestsState {
  requests: PassRequest[];
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: PassRequestsState = {
  requests: [],
};

// ---------------------------------------------------------------------------
// Slice with reducers
// ---------------------------------------------------------------------------

export const passRequestSlice = createSlice({
  name: "passRequest",
  initialState,
  reducers: {
    addPassRequest: (
      state,
      action: PayloadAction<Omit<PassRequest, "id" | "submittedAt" | "status">>
    ) => {
      state.requests.push({
        id: crypto.randomUUID(),
        submittedAt: new Date().toISOString(),
        status: "pending",
        ...action.payload,
      });
    },
    approvePassRequest: (state, action: PayloadAction<string>) => {
      const request = state.requests.find((r) => r.id === action.payload);
      if (request) request.status = "approved";
    },
    denyPassRequest: (
      state,
      action: PayloadAction<{ id: string; comment: string }>
    ) => {
      const request = state.requests.find((r) => r.id === action.payload.id);
      if (request) {
        request.status = "denied";
        request.comment = action.payload.comment;
      }
    },
  },
});

export const { addPassRequest, approvePassRequest, denyPassRequest } =
  passRequestSlice.actions;
export default passRequestSlice.reducer;