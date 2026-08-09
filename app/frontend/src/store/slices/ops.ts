/**
 * Ops slice - staff / supply notes and later alerts.
 * Not kitchen food data. Notify-to-user (e.g. Frankie) needs logins later.
 */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface OpsState {
  /** Manager ops note. Empty string = none. Client-only until API. */
  staffNote: string;
}

const initialState: OpsState = {
  staffNote: "",
};

export const opsSlice = createSlice({
  name: "ops",
  initialState,
  reducers: {
    /** Set full note text (UI should trim before dispatch). */
    setStaffNote: (state, action: PayloadAction<string>) => {
      state.staffNote = action.payload;
    },
  },
});

export const { setStaffNote } = opsSlice.actions;
export default opsSlice.reducer;
