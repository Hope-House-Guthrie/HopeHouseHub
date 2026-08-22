/**
 * Residents Data SLice
 *
 * Purpose: Stores client resident information that is:
 * - Visiable only to Admin and Kitchen staff
 * -Includes birthdays (for special meals/celebrations)
 * -Includes dietary restrictions (for safe meal prearations)
 *
 * Permission: Kitchen Manager, Kitchen Assistant, Admin Users
 * NOT visible to clients or house leaders
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

//---------------------------------------------------------------------------
// Type Definition
//---------------------------------------------------------------------------

/**
 * Dietary restrictions that affect meal preparation.
 * These are SAFETY_CRITICAL items that require careful handling.
 */
export interface DietaryRestriction {
  id: string;
  name: string; //e.g. "Gluten-Free", "Nut Allergy"
  type: "allergy" | "preference"; // Allergies are urgent!
  severity: "mild" | "severe" | "critical"; // For high-risk allergies
}

/**
 * Simplified dietary type choices (for checkboxes).
 * These are common enough to standardize.
 */
export type DietaryType =
  | "vegetarian"
  | "vegan"
  | "pescatarian"
  | "no-pork"
  | "no-red-meat"
  | "dairy-free"
  | "gluten-free"
  | "other";

/**
 * Personal info we need to track per client.
 */
export interface Resident {
  id: string;
  name: string;
  birthday: string; // YYYY-MM-DD format
  birthMonth: number; // 1-12 (pre-computed for sorting)
  birthDay: number; // 1-31

  // Dietary information
  dietaryTypes: DietaryType[]; // e.g., ["vegan", "gluten-free"]
  dietaryRestrictions: DietaryRestriction[]; // e.g., allergy to nuts

  // Metadata
  lastUpdated: string; // ISO timestamp
}

// ---------------------------------------------------------------------------
// Initial State (SAMPLE DATA - you'd replace with real data later)
// ---------------------------------------------------------------------------

// Sample resident data to start with - you'd connect this to client records eventually
const initialResidents: Resident[] = [
  {
    id: "client-001",
    name: "Alex Johnson",
    birthday: "1990-08-09",
    birthMonth: 8,
    birthDay: 9,
    dietaryTypes: ["vegetarian", "gluten-free"],
    dietaryRestrictions: [
      {
        id: "allergy-001",
        name: "Tree Nuts",
        type: "allergy",
        severity: "severe",
      },
    ],
    lastUpdated: "2026-08-09T10:00:00.000Z",
  },
  {
    id: "client-002",
    name: "Maria Rodriguez",
    birthday: "1985-03-15",
    birthMonth: 3,
    birthDay: 15,
    dietaryTypes: ["vegan"],
    dietaryRestrictions: [],
    lastUpdated: "2026-08-09T10:00:00.000Z",
  },
];

export interface ResidentsState {
  residents: Resident[];
  loading: boolean;
  error: string | null;
}

const initialState: ResidentsState = {
  residents: initialResidents,
  loading: false,
  error: null,
};

// ---------------------------------------------------------------------------
// Slice Definition
// ---------------------------------------------------------------------------

export const residentsSlice = createSlice({
  name: "residents",
  initialState,
  reducers: {
    // Add a new resident
    addResident: (state, action: PayloadAction<Resident>) => {
      state.residents.push(action.payload);
    },

    // Update an existing resident (full replace)
    updateResident: (state, action: PayloadAction<Resident>) => {
      const index = state.residents.findIndex(
        (r) => r.id === action.payload.id,
      );
      if (index >= 0) {
        state.residents[index] = {
          ...action.payload,
          lastUpdated: new Date().toISOString(),
        };
      }
    },

    // Delete a resident (should be rare - probably just archive)
    removeResident: (state, action: PayloadAction<string>) => {
      state.residents = state.residents.filter((r) => r.id !== action.payload);
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

// ---------------------------------------------------------------------------
// Export Actions and Reducer
// ---------------------------------------------------------------------------

export const {
  addResident,
  updateResident,
  removeResident,
  setLoading,
  clearError,
} = residentsSlice.actions;

export default residentsSlice.reducer;
