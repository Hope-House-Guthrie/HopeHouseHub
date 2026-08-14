import { configureStore } from "@reduxjs/toolkit";
import clientReducer from "./slices/clients";
import kitchenReducer from "./slices/kitchen";
import opsReducer from "./slices/ops";
import passRequestReducer from "./slices/passRequest";
import residentsReducer from "./slices/residents";
import incidentReportsReducer from "./slices/incidentReports";
import uaFormReducer from "./slices/uaForm";

export const store = configureStore({
  reducer: {
    clients: clientReducer,
    kitchen: kitchenReducer,
    ops: opsReducer,
    passRequest: passRequestReducer,
    residents: residentsReducer,
    incidentReports: incidentReportsReducer,
    uaForm: uaFormReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
