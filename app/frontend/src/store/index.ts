import { configureStore } from "@reduxjs/toolkit";
import clientReducer from "./slices/clients";
import kitchenReducer from "./slices/kitchen";

export const store = configureStore({
  reducer: {
    clients: clientReducer,
    kitchen: kitchenReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
