/**
 * House Display Redux Slice - client-only FE mock.
 *
 * Who uses this:
 *  - manage.tsx -> staff Hub page (later: dispatch; this chunk: read)
 *  - index.tsx -> TV /house-display (select only)
 *
 * No API/thunks. Refreash reset to seed - fine for prototype.
 */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  HouseDisplayContent,
  HouseDisplayState,
} from "@/features/house-display/types";

const initialState: HouseDisplayState = {
  content: {
    headline: "Welcome to Hope House",
    subtext: "Scaffold content - management and live widgets come next.",
  },
};

export const houseDisplaySlice = createSlice({
  name: "houseDisplay",
  initialState,
  reducers: {
    /** Replace both lines at once (UI should trim before dispatch). */
    setContent: (state, action: PayloadAction<HouseDisplayContent>) => {
      state.content = action.payload;
    },
    setHeadline: (state, action: PayloadAction<string>) => {
      state.content.headline = action.payload;
    },
    setSubtext: (state, action: PayloadAction<string>) => {
      state.content.subtext = action.payload;
    },
  },
});

export const { setContent, setHeadline, setSubtext } =
  houseDisplaySlice.actions;
export default houseDisplaySlice.reducer;
