/**
 * House Display Redux slice — client-only FE mock.
 *
 * Who uses this:
 *   - manage.tsx  → staff Hub (read summary; edit forms later)
 *   - index.tsx   → TV /house-display (select only)
 *
 * No API/thunks. Refresh resets to seed — fine for prototype.
 * Agenda uses startMin/endMin for proportional timeline.
 * TV clock / nowMin come from useHopeHouseNow (not Redux).
 */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  HouseDisplayContent,
  HouseDisplayState,
} from "@/features/house-display/types";
import { DEFAULT_TIMELINE_WINDOW } from "@/features/house-display/timeline";
// Bundled flyer URLs (Bun @assets). public/house-display/* is NOT served by dev-server.
import kiddosDonationUrl from "@assets/house-display/kiddos-donation.png";
import hopeChangesEverythingUrl from "@assets/house-display/hope-changes-everything.png";

const initialState: HouseDisplayState = {
  content: {
    header: {
      identityLabel: "Hope House Guthrie",
      clockText: "3:45 PM",
      dateText: "Sun, Aug 23",
      weatherText: "82° Clear",
    },
    // Visible planner: 7:00 AM – 9:00 PM
    timeline: { ...DEFAULT_TIMELINE_WINDOW },
    agendaItems: [
      // 8:00–8:30 AM (30 min)
      {
        id: "a1",
        title: "Morning Roll Call",
        startMin: 8 * 60,
        endMin: 8 * 60 + 30,
        canceled: false,
      },
      // 10:00–11:00 AM (60 min)
      {
        id: "a2",
        title: "I Matter",
        startMin: 10 * 60,
        endMin: 11 * 60,
        canceled: false,
      },
      // 1:00–2:00 PM (60 min) — twice the vertical of a 30-min block
      {
        id: "a3",
        title: "Tech Quest",
        startMin: 13 * 60,
        endMin: 14 * 60,
        canceled: true,
      },
      // 3:30–4:00 PM (30 min)
      {
        id: "a4",
        title: "House Meeting",
        startMin: 15 * 60 + 30,
        endMin: 16 * 60,
        canceled: false,
      },
      // 6:00–7:30 PM (90 min)
      {
        id: "a5",
        title: "Main NA",
        startMin: 18 * 60,
        endMin: 19 * 60 + 30,
        canceled: false,
      },
    ],
    /**
     * House Spotlight (right ~40%).
     * Rotation test seed: 3 active, all pinMode "none", sortOrder 0..2.
     * Flyer imageUrl = Bun-bundled @assets module URLs (not /public paths).
     * TV still uses rotateIndex 0 until timer chunk → Super Saturday first.
     * KIDDOS preview: set s1 active false, hard refresh. Hope: s1+s2 false.
     * Pin test later: set one item pinMode to "until_unpinned", hard refresh.
     * Empty region: set all active: false.
     */
    spotlightItems: [
      {
        id: "s1",
        kind: "card",
        sortOrder: 0,
        active: true,
        pinMode: "none",
        title: "SUPER SATURDAY",
        subtitle: "Saturday, August 29",
        message: "Be ready by 9:00 AM.",
        imageUrl: "",
        imageAlt: "",
      },
      {
        id: "s2",
        kind: "flyer",
        sortOrder: 1,
        active: true,
        pinMode: "none",
        title: "KIDDOS",
        subtitle: "",
        message: "",
        imageUrl: kiddosDonationUrl,
        imageAlt: "KIDDOS donation flyer",
      },
      {
        id: "s3",
        kind: "flyer",
        sortOrder: 2,
        active: true,
        pinMode: "none",
        title: "Hope Changes Everything",
        subtitle: "",
        message: "",
        imageUrl: hopeChangesEverythingUrl,
        imageAlt: "Hope Changes Everything / Family Reunification flyer",
      },
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
