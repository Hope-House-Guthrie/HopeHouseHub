import { configureStore } from "@reduxjs/toolkit";
import clientReducer from "./slices/clients";
import kitchenReducer from "./slices/kitchen";
import opsReducer from "./slices/ops";
import residentsReducer from "./slices/residents";

export const store = configureStore({
  reducer: {
    clients: clientReducer,
    kitchen: kitchenReducer,
    ops: opsReducer,
    residents: residentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
