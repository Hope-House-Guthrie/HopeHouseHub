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
export type MenuItemCategory = "main" | "side" | "salad" | "bread" | "other";

export interface MenuItem {
  id: string;
  name: string;
  /** Staff-set on add (or seed). Not guessed from the name. */
  category: MenuItemCategory;
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
    { id: "item-1", name: "Cold Cereal", category: "other" },
    { id: "item-2", name: "Sandwiches", category: "other" },
    { id: "item-3", name: "Baked Chicken", category: "main" },
    { id: "item-4", name: "Rice", category: "side" },
    { id: "item-5", name: "Green Beans", category: "side" },
    { id: "item-6", name: "Mashed Potatoes", category: "side" },
    { id: "item-7", name: "Scalloped Potatoes", category: "side" },
    { id: "item-8", name: "Roasted Potatoes", category: "side" },
    { id: "item-9", name: "Potato Wedges", category: "side" },
    { id: "item-10", name: "French Fries", category: "side" },
    { id: "item-11", name: "Fried Potatoes", category: "side" },
    { id: "item-12", name: "Cheesy Potatoes", category: "side" },
    { id: "item-13", name: "Potato Salad", category: "side" },
    { id: "item-14", name: "Baked Potatoes", category: "side" },
    { id: "item-15", name: "Twice Baked Potatoes", category: "side" },
    { id: "item-16", name: "Loaded Potato Casserole", category: "side" },
    { id: "item-17", name: "Hash Brown Casserole", category: "side" },
    { id: "item-18", name: "Tater Tots", category: "side" },
    { id: "item-19", name: "Sweet Potatoes", category: "side" },
    { id: "item-20", name: "Sweet Potato Fries", category: "side" },
    { id: "item-21", name: "Sweet Potato Casserole", category: "side" },
    { id: "item-22", name: "Asparagus", category: "side" },
    { id: "item-23", name: "Steamed Broccoli", category: "side" },
    { id: "item-24", name: "Coleslaw", category: "side" },
    { id: "item-25", name: "Baked Beans", category: "side" },
    { id: "item-26", name: "Corn on the Cob", category: "side" },
    { id: "item-27", name: "Creamed Corn", category: "side" },
    { id: "item-28", name: "Black Beans", category: "side" },
    { id: "item-29", name: "Peas", category: "side" },
    { id: "item-30", name: "Stir Fry Veggies", category: "side" },
    { id: "item-31", name: "Garden Salad", category: "salad" },
    { id: "item-32", name: "Caesar Salad", category: "salad" },
    { id: "item-33", name: "Cobb Salad", category: "salad" },
    { id: "item-34", name: "Bruschetta", category: "other" },
    { id: "item-35", name: "Squash", category: "side" },
    { id: "item-36", name: "Roasted Carrots", category: "side" },
    { id: "item-37", name: "Brussels Sprouts", category: "side" },
    { id: "item-38", name: "Steam-in-Bag Veggies", category: "side" },
    { id: "item-39", name: "Fresh Veggies with Dip", category: "other" },
    { id: "item-40", name: "Pinto Beans", category: "side" },
    { id: "item-41", name: "Beans and Rice", category: "side" },
    { id: "item-42", name: "Refried Beans", category: "side" },
    { id: "item-43", name: "Zucchini and Squash", category: "side" },
    { id: "item-44", name: "Spaghetti Squash", category: "side" },
    { id: "item-45", name: "Butternut Squash", category: "side" },
    { id: "item-46", name: "Broccoli with Cheese", category: "side" },
    { id: "item-47", name: "Croissants", category: "bread" },
    { id: "item-48", name: "Texas Toast", category: "bread" },
    { id: "item-49", name: "Garlic Bread", category: "bread" },
    { id: "item-50", name: "Breadsticks", category: "bread" },
    { id: "item-51", name: "Yeast Rolls", category: "bread" },
    { id: "item-52", name: "French Bread", category: "bread" },
    { id: "item-53", name: "Cornbread", category: "bread" },
    { id: "item-54", name: "Biscuits", category: "bread" },
    { id: "item-55", name: "Artisan Bread", category: "bread" },
    { id: "item-56", name: "Brown Rice", category: "side" },
    { id: "item-57", name: "Spanish Rice", category: "side" },
    { id: "item-58", name: "Macaroni and Cheese", category: "side" },
    { id: "item-59", name: "Macaroni Salad", category: "side" },
    { id: "item-60", name: "Spagehetti", category: "main" },
    { id: "item-61", name: "Pasta Salad", category: "side" },
    { id: "item-62", name: "Chips and Salsa", category: "other" },
    { id: "item-63", name: "Chips and Guacamole", category: "other" },
    { id: "item-64", name: "Chips and Queso", category: "other" },
    { id: "item-65", name: "Fresh Fruit", category: "other" },
    { id: "item-66", name: "Fruit Salad", category: "other" },
    { id: "item-67", name: "Applesauce", category: "other" },
    { id: "item-68", name: "Mozzarella Sticks", category: "side" },
    { id: "item-69", name: "Onion Rings", category: "side" },
    { id: "item-70", name: "Quinoa", category: "side" },
    { id: "item-71", name: "Couscous", category: "side" },
    { id: "item-72", name: "Goulash", category: "main" },
    { id: "item-73", name: "Green Bean Casserole", category: "side" },
    { id: "item-74", name: "Roasted Peppers", category: "side" },
    { id: "item-75", name: "Grilled Asparagus", category: "side" },
    { id: "item-76", name: "Caprese Salad Skewers", category: "side" },
    { id: "item-77", name: "Greek Salad", category: "salad" },
    { id: "item-78", name: "Orzo", category: "side" },
    { id: "item-79", name: "Roasted Chickpeas", category: "side" },
    { id: "item-80", name: "Carrot Salad", category: "salad" },
    { id: "item-81", name: "Roasted Eggplant", category: "side" },
    { id: "item-82", name: "Roasted Cauliflower", category: "side" },
    { id: "item-83", name: "Steamed Vegetables", category: "side" },
    { id: "item-84", name: "Sauteed Spinach", category: "side" },
    { id: "item-85", name: "Broccoli Salad", category: "salad" },
    { id: "item-86", name: "Stuffed Mushrooms", category: "side" },
    { id: "item-87", name: "Ratatouille", category: "side" },
    { id: "item-88", name: "Zucchini Fries", category: "side" },
    { id: "item-89", name: "Vegetable Kabobs", category: "side" },
    { id: "item-90", name: "Pesto Pasta Salad", category: "salad" },
    { id: "item-91", name: "Antipasto Salad", category: "salad" },
    { id: "item-92", name: "Cucumber Salad", category: "salad" },
    { id: "item-93", name: "Roasted Vegetable Salad", category: "salad" },
    { id: "item-94", name: "Quinoa Salad", category: "salad" },
    { id: "item-95", name: "Marinated Vegetables", category: "side" },
    { id: "item-96", name: "Garlic Rice", category: "side" },
    { id: "item-97", name: "Cauliflower Rice", category: "side" },
    { id: "item-98", name: "Polenta", category: "side" },
    { id: "item-99", name: "Bean Salad", category: "side" },
    { id: "item-100", name: "Boiled Potatoes", category: "side" },
    { id: "item-101", name: "Tacos", category: "main" },
    { id: "item-102", name: "Lentils", category: "side" },
    { id: "item-103", name: "Parmesan Roasted Potatoes", category: "side" },
    { id: "item-104", name: "Fried Rice", category: "side" },
    { id: "item-105", name: "Hasselback Potatoes", category: "side" },
    { id: "item-106", name: "Parmesan Polenta Fries", category: "side" },
    { id: "item-107", name: "Parmesan Truffle Fries", category: "side" },
    { id: "item-108", name: "Mediterranean Salad", category: "salad" },
    { id: "item-109", name: "Fennel Salad", category: "salad" },
    { id: "item-110", name: "Panzanella", category: "side" },
    { id: "item-111", name: "Burrata Salad", category: "salad" },
    { id: "item-112", name: "Arugula Parmesan Salad", category: "salad" },
    { id: "item-113", name: "Kale Salad", category: "salad" },
    { id: "item-114", name: "Wedge Salad", category: "salad" },
    { id: "item-115", name: "Corn Salad", category: "salad" },
    { id: "item-116", name: "Tomato Cucumber Salad", category: "salad" },
    { id: "item-117", name: "Buttermilk Biscuits", category: "bread" },
    { id: "item-118", name: "Corn Muffins", category: "bread" },
    { id: "item-119", name: "Dinner Rolls", category: "bread" },
    { id: "item-120", name: "Flatbread", category: "bread" },
    { id: "item-121", name: "Pita", category: "bread" },
    { id: "item-122", name: "Naan", category: "bread" },
    { id: "item-123", name: "Focaccia", category: "bread" },
    { id: "item-124", name: "Cheesy Pull-Apart Bread", category: "bread" },
    { id: "item-125", name: "Stuffed Bread", category: "bread" },
    { id: "item-126", name: "Smashed Potatoes", category: "side" },
    { id: "item-127", name: "Braised Cabbage", category: "side" },
    { id: "item-128", name: "Roasted Parsnips", category: "side" },
    { id: "item-129", name: "Pearl Couscous", category: "side" },
    { id: "item-130", name: "Potato Rolls", category: "bread" },
    { id: "item-131", name: "Deviled Eggs", category: "side" },
    { id: "item-132", name: "Layered Salad", category: "salad" },
    { id: "item-133", name: "Corn Casserole", category: "side" },
    { id: "item-134", name: "Mashed Sweet Potatoes", category: "side" },
    { id: "item-135", name: "Stuffed Peppers", category: "side" },
    { id: "item-136", name: "Butternut Squash Gratin", category: "side" },
    { id: "item-137", name: "Fried Artichokes", category: "side" },
    { id: "item-138", name: "Pickled Radishes", category: "side" },
    { id: "item-139", name: "Grilled Eggplant Slices", category: "side" },
    { id: "item-140", name: "Watermelon Feta Salad", category: "salad" },
    { id: "item-141", name: "Stuffed Acorn Squash", category: "side" },
    { id: "item-142", name: "Cheese Grits", category: "side" },
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
    { id: "k-15", text: "Have a Beautiful Time. - Shawn" },
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
      action: PayloadAction<{
        id: string;
        name: string;
        category: MenuItemCategory;
      }>,
    ) => {
      state.menuItems.push({
        id: action.payload.id,
        name: action.payload.name,
        category: action.payload.category,
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
