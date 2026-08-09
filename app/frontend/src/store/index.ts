import { configureStore } from "@reduxjs/toolkit";
import clientReducer from "./slices/clients";
import kitchenReducer from "./slices/kitchen";
import opsReducer from "./slices/ops";

export const store = configureStore({
  reducer: {
    clients: clientReducer,
    kitchen: kitchenReducer,
    ops: opsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
