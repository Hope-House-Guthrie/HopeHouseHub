import { configureStore } from "@reduxjs/toolkit";
import accountReducer from "./slices/account";
import authReducer from "./slices/auth";
import kitchenReducer from "./slices/prototype/kitchen";
import opsReducer from "./slices/prototype/ops";
import passRequestReducer from "./slices/prototype/passRequest";
import residentsReducer from "./slices/prototype/residents";
import incidentReportsReducer from "./slices/prototype/incidentReports";
import uaFormReducer from "./slices/prototype/uaForm";
import usersReducer from "./slices/users";
import walkInServicesReducer from "./slices/prototype/walkInServices";
import dailyDutiesReducer from "./slices/prototype/dailyDuties";
import friendlyRemindersReducer from "./slices/prototype/friendlyReminders";

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
    walkInServices: walkInServicesReducer,
    dailyDuties: dailyDutiesReducer,
    // FE mock history + combined 3-count for Friendly Reminders
    friendlyReminders: friendlyRemindersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
