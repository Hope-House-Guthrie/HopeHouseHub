/**
 * Kitchen Redux slice — single client-side source of truth (v1).
 *
 * Who uses this:
 *   - menus.tsx  → staff manager; DISPATCHES actions (write)
 *   - display.tsx → serving-line TV; SELECTS state only (read)
 *
 * No API/thunks yet. Refresh can wipe to seed data below — fine for board v1.
 *
 * Guest-facing name "Daily Affirmations" = code/store field kennyisms.
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** One food in the shared library (menus CRUD; meals point here by id). */
export interface MenuItem {
  id: string;
  name: string;
}

/**
 * One Daily Affirmation quote.
 * Guest UI says "Daily Affirmations"; code name is Kennyism / kennyisms.
 */
export interface Kennyism {
  id: string;
  text: string;
}

/** One meal slot for today: ordered food ids + optional serve time string. */
export interface Menu {
  itemIds: string[];
  mealTime: string;
}

export type MealKey = "breakfast" | "lunch" | "dinner";

export interface KitchenState {
  /** Food library — all named items staff can assign to meals. */
  menuItems: MenuItem[];
  breakfast: Menu;
  lunch: Menu;
  dinner: Menu;
  /** Daily Affirmations list (TV rotates or shows pinned). */
  kennyisms: Kennyism[];
  /** Id held for TV, or null = normal 12h rotaate.  */
  pinnedKennyismId: string | null;
  /** When pin was set (ms). After 12h TV ignores pin. Cleared with pin.  */
  pinnedKennyismAt: number | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const emptyMenu = (): Menu => ({
  itemIds: [],
  mealTime: "",
});

// ---------------------------------------------------------------------------
// Initial / seed state (demo data until API exists)
// ---------------------------------------------------------------------------

const initialState: KitchenState = {
  menuItems: [
    { id: "item-1", name: "Cold Cereal" },
    { id: "item-2", name: "Sandwiches" },
    { id: "item-3", name: "Baked Chicken" },
    { id: "item-4", name: "Rice" },
    { id: "item-5", name: "Green Beans" },
  ],
  breakfast: {
    itemIds: ["item-1"],
    mealTime: "",
  },
  lunch: {
    itemIds: ["item-2"],
    mealTime: "",
  },
  dinner: {
    itemIds: ["item-3", "item-4", "item-5"],
    mealTime: "5:30 PM",
  },
  kennyisms: [
    { id: "k-1", text: "U better know it!!" },
    { id: "k-2", text: "Love yourself enough to put your self first." },
    { id: "k-3", text: "Progress, not perfection." },
    { id: "k-4", text: "Ahhh Yeahhh!!" },
    { id: "k-5", text: "I am capable of achieving my goals." },
    { id: "k-6", text: "I am in control of my thoughts and feelings." },
    { id: "k-7", text: "I am worthy of forgiveness." },
    {
      id: "k-8",
      text: "I am worthy of making mistakes and learning from them.",
    },
    { id: "k-9", text: "I am letting go of negative thoughts and feelings." },
    {
      id: "k-10",
      text: "I am kind and compassionate towards myself and others.",
    },
    { id: "k-11", text: "What you say you are is who you become." },
    {
      id: "k-12",
      text: "Never make someone a priority when your only an option.",
    },
    { id: "k-13", text: "Love finds you when you love yourself." },
    { id: "k-14", text: "People do better when they know better." },
  ],
  pinnedKennyismId: null,
  pinnedKennyismAt: null,
};

// ---------------------------------------------------------------------------
// Slice + reducers
// ---------------------------------------------------------------------------

export const kitchenSlice = createSlice({
  name: "kitchen",
  initialState,
  reducers: {
    // --- Food library (menus page CRUD) ---

    /** Add one food to the library. */
    addMenuItem: (
      state,
      action: PayloadAction<{ id: string; name: string }>,
    ) => {
      state.menuItems.push({
        id: action.payload.id,
        name: action.payload.name,
      });
    },

    /** Rename a library food (id stays; meals keep pointing at same id). */
    updateMenuItem: (
      state,
      action: PayloadAction<{ id: string; name: string }>,
    ) => {
      const item = state.menuItems.find((m) => m.id === action.payload.id);
      if (item) {
        item.name = action.payload.name;
      }
    },

    /**
     * Delete from library AND strip that id from breakfast/lunch/dinner
     * so meals never keep a dangling reference.
     */
    removeMenuItem: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.menuItems = state.menuItems.filter((m) => m.id !== id);
      state.breakfast.itemIds = state.breakfast.itemIds.filter((x) => x !== id);
      state.lunch.itemIds = state.lunch.itemIds.filter((x) => x !== id);
      state.dinner.itemIds = state.dinner.itemIds.filter((x) => x !== id);
    },

    // --- Today's meals (menus assigns; display reads) ---

    /**
     * Replace the full item id list for one meal.
     * Soft max (B/L 3, dinner 4) is enforced in menus UI, not here.
     */
    setMealItems: (
      state,
      action: PayloadAction<{ meal: MealKey; itemIds: string[] }>,
    ) => {
      state[action.payload.meal].itemIds = action.payload.itemIds;
    },

    /** Reset one meal to empty list + empty time. */
    clearMeal: (state, action: PayloadAction<MealKey>) => {
      state[action.payload] = emptyMenu();
    },

    /** Set serve-time string shown on TV (e.g. dinner "5:30 PM"). */
    setMealTime: (
      state,
      action: PayloadAction<{ meal: MealKey; mealTime: string }>,
    ) => {
      state[action.payload.meal].mealTime = action.payload.mealTime;
    },

    // --- Daily Affirmations (kennyisms); pin UI not on menus yet ---

    addKennyism: (
      state,
      action: PayloadAction<{ id: string; text: string }>,
    ) => {
      state.kennyisms.push({
        id: action.payload.id,
        text: action.payload.text,
      });
    },

    /** Remove quote; clear pin if that quote was pinned. */
    removeKennyism: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.kennyisms = state.kennyisms.filter((k) => k.id !== id);
      if (state.pinnedKennyismId === id) {
        state.pinnedKennyismId = null;
        state.pinnedKennyismAt = null;
      }
    },

    /** Pin one affirmation for TV, or null to resume 12h rotate. */
    setPinnedKennyism: (state, action: PayloadAction<string | null>) => {
      state.pinnedKennyismId = action.payload;
      state.pinnedKennyismAt = action.payload ? Date.now() : null;
    },
  },
});

// ---------------------------------------------------------------------------
// Exports (actions for menus; default reducer for store config)
// ---------------------------------------------------------------------------

export const {
  addMenuItem,
  updateMenuItem,
  removeMenuItem,
  setMealItems,
  clearMeal,
  setMealTime,
  addKennyism,
  removeKennyism,
  setPinnedKennyism,
} = kitchenSlice.actions;

export default kitchenSlice.reducer;
