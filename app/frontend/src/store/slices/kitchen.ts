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
  // Food library seed (v1 client-only). Names only — no descriptions.
  // Sides bulk-loaded 2026-08-09; de-duped vs each other + prior 5 items.
  // Refresh resets to this list until API persistence exists.
  menuItems: [
    { id: "item-1", name: "Cold Cereal" },
    { id: "item-2", name: "Sandwiches" },
    { id: "item-3", name: "Baked Chicken" },
    { id: "item-4", name: "Rice" },
    { id: "item-5", name: "Green Beans" },
    { id: "item-6", name: "Mashed Potatoes" },
    { id: "item-7", name: "Scalloped Potatoes" },
    { id: "item-8", name: "Roasted Potatoes" },
    { id: "item-9", name: "Potato Wedges" },
    { id: "item-10", name: "French Fries" },
    { id: "item-11", name: "Fried Potatoes" },
    { id: "item-12", name: "Cheesy Potatoes" },
    { id: "item-13", name: "Potato Salad" },
    { id: "item-14", name: "Baked Potatoes" },
    { id: "item-15", name: "Twice Baked Potatoes" },
    { id: "item-16", name: "Loaded Potato Casserole" },
    { id: "item-17", name: "Hash Brown Casserole" },
    { id: "item-18", name: "Tater Tots" },
    { id: "item-19", name: "Sweet Potatoes" },
    { id: "item-20", name: "Sweet Potato Fries" },
    { id: "item-21", name: "Sweet Potato Casserole" },
    { id: "item-22", name: "Asparagus" },
    { id: "item-23", name: "Steamed Broccoli" },
    { id: "item-24", name: "Coleslaw" },
    { id: "item-25", name: "Baked Beans" },
    { id: "item-26", name: "Corn on the Cob" },
    { id: "item-27", name: "Creamed Corn" },
    { id: "item-28", name: "Black Beans" },
    { id: "item-29", name: "Peas" },
    { id: "item-30", name: "Stir Fry Veggies" },
    { id: "item-31", name: "Garden Salad" },
    { id: "item-32", name: "Caesar Salad" },
    { id: "item-33", name: "Cobb Salad" },
    { id: "item-34", name: "Bruschetta" },
    { id: "item-35", name: "Squash" },
    { id: "item-36", name: "Roasted Carrots" },
    { id: "item-37", name: "Brussels Sprouts" },
    { id: "item-38", name: "Steam-in-Bag Veggies" },
    { id: "item-39", name: "Fresh Veggies with Dip" },
    { id: "item-40", name: "Pinto Beans" },
    { id: "item-41", name: "Beans and Rice" },
    { id: "item-42", name: "Refried Beans" },
    { id: "item-43", name: "Zucchini and Squash" },
    { id: "item-44", name: "Spaghetti Squash" },
    { id: "item-45", name: "Butternut Squash" },
    { id: "item-46", name: "Broccoli with Cheese" },
    { id: "item-47", name: "Croissants" },
    { id: "item-48", name: "Texas Toast" },
    { id: "item-49", name: "Garlic Bread" },
    { id: "item-50", name: "Breadsticks" },
    { id: "item-51", name: "Yeast Rolls" },
    { id: "item-52", name: "French Bread" },
    { id: "item-53", name: "Cornbread" },
    { id: "item-54", name: "Biscuits" },
    { id: "item-55", name: "Artisan Bread" },
    { id: "item-56", name: "Brown Rice" },
    { id: "item-57", name: "Spanish Rice" },
    { id: "item-58", name: "Macaroni and Cheese" },
    { id: "item-59", name: "Macaroni Salad" },
    { id: "item-60", name: "Pasta with Sauce" },
    { id: "item-61", name: "Pasta Salad" },
    { id: "item-62", name: "Chips and Salsa" },
    { id: "item-63", name: "Chips and Guacamole" },
    { id: "item-64", name: "Chips and Queso" },
    { id: "item-65", name: "Fresh Fruit" },
    { id: "item-66", name: "Fruit Salad" },
    { id: "item-67", name: "Applesauce" },
    { id: "item-68", name: "Mozzarella Sticks" },
    { id: "item-69", name: "Onion Rings" },
    { id: "item-70", name: "Quinoa" },
    { id: "item-71", name: "Couscous" },
    { id: "item-72", name: "Pasta" },
    { id: "item-73", name: "Green Bean Casserole" },
    { id: "item-74", name: "Roasted Peppers" },
    { id: "item-75", name: "Grilled Asparagus" },
    { id: "item-76", name: "Caprese Salad Skewers" },
    { id: "item-77", name: "Greek Salad" },
    { id: "item-78", name: "Orzo" },
    { id: "item-79", name: "Roasted Chickpeas" },
    { id: "item-80", name: "Carrot Salad" },
    { id: "item-81", name: "Roasted Eggplant" },
    { id: "item-82", name: "Roasted Cauliflower" },
    { id: "item-83", name: "Steamed Vegetables" },
    { id: "item-84", name: "Sauteed Spinach" },
    { id: "item-85", name: "Broccoli Salad" },
    { id: "item-86", name: "Stuffed Mushrooms" },
    { id: "item-87", name: "Ratatouille" },
    { id: "item-88", name: "Zucchini Fries" },
    { id: "item-89", name: "Vegetable Kabobs" },
    { id: "item-90", name: "Pesto Pasta Salad" },
    { id: "item-91", name: "Antipasto Salad" },
    { id: "item-92", name: "Cucumber Salad" },
    { id: "item-93", name: "Roasted Vegetable Salad" },
    { id: "item-94", name: "Quinoa Salad" },
    { id: "item-95", name: "Marinated Vegetables" },
    { id: "item-96", name: "Garlic Rice" },
    { id: "item-97", name: "Cauliflower Rice" },
    { id: "item-98", name: "Polenta" },
    { id: "item-99", name: "Bean Salad" },
    { id: "item-100", name: "Boiled Potatoes" },
    { id: "item-101", name: "Noodles" },
    { id: "item-102", name: "Lentils" },
    { id: "item-103", name: "Parmesan Roasted Potatoes" },
    { id: "item-104", name: "Fried Rice" },
    { id: "item-105", name: "Hasselback Potatoes" },
    { id: "item-106", name: "Parmesan Polenta Fries" },
    { id: "item-107", name: "Parmesan Truffle Fries" },
    { id: "item-108", name: "Mediterranean Salad" },
    { id: "item-109", name: "Fennel Salad" },
    { id: "item-110", name: "Panzanella" },
    { id: "item-111", name: "Burrata Salad" },
    { id: "item-112", name: "Arugula Parmesan Salad" },
    { id: "item-113", name: "Kale Salad" },
    { id: "item-114", name: "Wedge Salad" },
    { id: "item-115", name: "Corn Salad" },
    { id: "item-116", name: "Tomato Cucumber Salad" },
    { id: "item-117", name: "Buttermilk Biscuits" },
    { id: "item-118", name: "Corn Muffins" },
    { id: "item-119", name: "Dinner Rolls" },
    { id: "item-120", name: "Flatbread" },
    { id: "item-121", name: "Pita" },
    { id: "item-122", name: "Naan" },
    { id: "item-123", name: "Focaccia" },
    { id: "item-124", name: "Cheesy Pull-Apart Bread" },
    { id: "item-125", name: "Stuffed Bread" },
    { id: "item-126", name: "Smashed Potatoes" },
    { id: "item-127", name: "Braised Cabbage" },
    { id: "item-128", name: "Roasted Parsnips" },
    { id: "item-129", name: "Pearl Couscous" },
    { id: "item-130", name: "Potato Rolls" },
    { id: "item-131", name: "Deviled Eggs" },
    { id: "item-132", name: "Layered Salad" },
    { id: "item-133", name: "Corn Casserole" },
    { id: "item-134", name: "Mashed Sweet Potatoes" },
    { id: "item-135", name: "Stuffed Peppers" },
    { id: "item-136", name: "Butternut Squash Gratin" },
    { id: "item-137", name: "Fried Artichokes" },
    { id: "item-138", name: "Pickled Radishes" },
    { id: "item-139", name: "Grilled Eggplant Slices" },
    { id: "item-140", name: "Watermelon Feta Salad" },
    { id: "item-141", name: "Stuffed Acorn Squash" },
    { id: "item-142", name: "Cheese Grits" },
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
