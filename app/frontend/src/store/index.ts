import { configureStore } from "@reduxjs/toolkit";
import accountReducer from "./slices/account";
import authReducer from "./slices/auth";
import kitchenReducer from "./slices/kitchen";
import opsReducer from "./slices/ops";
import passRequestReducer from "./slices/passRequest";
import residentsReducer from "./slices/residents";
import incidentReportsReducer from "./slices/incidentReports";
import uaFormReducer from "./slices/uaForm";
import usersReducer from "./slices/users";
import maintenanceRequestsReducer from "./slices/maintenanceRequests";

export const store = configureStore({
  reducer: {
    account: accountReducer,
    auth: authReducer,
    kitchen: kitchenReducer,
    ops: opsReducer,
    passRequest: passRequestReducer,
    residents: residentsReducer,
    incidentReports: incidentReportsReducer,
    uaForm: uaFormReducer,
    users: usersReducer,
    maintenanceRequests: maintenanceRequestsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
