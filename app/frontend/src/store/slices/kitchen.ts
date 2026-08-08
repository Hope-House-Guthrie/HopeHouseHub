import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface MenuItem {
  id: string;
  name: string;
}

export interface Kennyism {
  id: string;
  text: string;
}

export interface Menu {
  itemIds: string[];
  mealTime: string;
}

export type MealKey = "breakfast" | "lunch" | "dinner";

export interface KitchenState {
  menuItems: MenuItem[];
  breakfast: Menu;
  lunch: Menu;
  dinner: Menu;
  kennyisms: Kennyism[];
  pinnedKennyismId: string | null;
}

const emptyMenu = (): Menu => ({
  itemIds: [],
  mealTime: "",
});

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
  ],
  pinnedKennyismId: null,
};

export const kitchenSlice = createSlice({
  name: "kitchen",
  initialState,
  reducers: {
    addMenuItem: (
      state,
      action: PayloadAction<{ id: string; name: string }>,
    ) => {
      state.menuItems.push({
        id: action.payload.id,
        name: action.payload.name,
      });
    },

    updateMenuItem: (
      state,
      action: PayloadAction<{ id: string; name: string }>,
    ) => {
      const item = state.menuItems.find((m) => m.id === action.payload.id);
      if (item) {
        item.name = action.payload.name;
      }
    },

    removeMenuItem: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.menuItems = state.menuItems.filter((m) => m.id !== id);
      state.breakfast.itemIds = state.breakfast.itemIds.filter((x) => x !== id);
      state.lunch.itemIds = state.lunch.itemIds.filter((x) => x !== id);
      state.dinner.itemIds = state.dinner.itemIds.filter((x) => x !== id);
    },

    setMealItems: (
      state,
      action: PayloadAction<{ meal: MealKey; itemIds: string[] }>,
    ) => {
      state[action.payload.meal].itemIds = action.payload.itemIds;
    },

    clearMeal: (state, action: PayloadAction<MealKey>) => {
      state[action.payload] = emptyMenu();
    },

    setMealTime: (
      state,
      action: PayloadAction<{ meal: MealKey; mealTime: string }>,
    ) => {
      state[action.payload.meal].mealTime = action.payload.mealTime;
    },

    addKennyism: (
      state,
      action: PayloadAction<{ id: string; text: string }>,
    ) => {
      state.kennyisms.push({
        id: action.payload.id,
        text: action.payload.text,
      });
    },
    removeKennyism: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.kennyisms = state.kennyisms.filter((k) => k.id !== id);
      if (state.pinnedKennyismId === id) {
        state.pinnedKennyismId = null;
      }
    },
    setPinnedKennyism: (state, action: PayloadAction<string | null>) => {
      state.pinnedKennyismId = action.payload;
    },
  },
});

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
