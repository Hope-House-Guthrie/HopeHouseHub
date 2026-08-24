/**
 * House Display Redux slice — client-only FE mock.
 *
 * Who uses this:
 *   - manage.tsx  → staff Hub (read summary; edit forms later)
 *   - index.tsx   → TV /house-display (select only)
 *
 * No API/thunks. Refresh resets to seed — fine for prototype.
 * Layout data only this chunk — no live clock/weather logic.
 */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  HouseDisplayContent,
  HouseDisplayState,
} from "@/features/house-display/types";

const initialState: HouseDisplayState = {
  content: {
    header: {
      identityLabel: "Hope House Guthrie",
      clockText: "3:45 PM",
      dateText: "Sun, Aug 23",
      weatherText: "82° Clear",
    },
    agendaItems: [
      { id: "a1", timeLabel: "8:00 AM", title: "Morning Roll Call" },
      { id: "a2", timeLabel: "10:00 AM", title: "I Matter" },
      { id: "a3", timeLabel: "1:00 PM", title: "Tech Quest" },
      { id: "a4", timeLabel: "3:30 PM", title: "House Meeting" },
      { id: "a5", timeLabel: "6:00 PM", title: "Main NA" },
    ],
    upcomingItems: [
      { id: "u1", timeLabel: "3:30 PM", title: "House Meeting" },
      { id: "u2", timeLabel: "6:00 PM", title: "Main NA" },
      { id: "u3", timeLabel: "7:30 PM", title: "Quiet Hours prep" },
    ],
    affirmationText:
      "Progress, not perfection - show up for yourself and the house today.",
    announcements: [
      {
        id: "n1",
        text: "Kitchen closes at 8:00 PM. Please rinse dishes before then.",
      },
      {
        id: "n2",
        text: "House Meeting is mandatory - be in the living room by 3:25 PM.",
      },
    ],
    birthday: {
      name: "Alex M.",
      dateLabel: "Thu, Aug 27",
    },
  },
};

export const houseDisplaySlice = createSlice({
  name: "houseDisplay",
  initialState,
  reducers: {
    /** Replace full TV content tree (UI should validate/trim before dispatch). */
    setContent: (state, action: PayloadAction<HouseDisplayContent>) => {
      state.content = action.payload;
    },
  },
});

export const { setContent } = houseDisplaySlice.actions;
export default houseDisplaySlice.reducer;
