import { configureStore } from "@reduxjs/toolkit";
import accountReducer from "./slices/account";
import authReducer from "./slices/auth";
import opsReducer from "./slices/prototype/ops";
import passRequestReducer from "./slices/prototype/passRequest";
import residentsReducer from "./slices/prototype/residents";
import incidentReportsReducer from "./slices/prototype/incidentReports";
import uaFormReducer from "./slices/prototype/uaForm";
import usersReducer from "./slices/users";
import walkInServicesReducer from "./slices/prototype/walkInServices";
import dailyDutiesReducer from "./slices/prototype/dailyDuties";
import friendlyRemindersReducer from "./slices/prototype/friendlyReminders";
import kitchenPrototypeReducer from "./slices/prototype/kitchen";

import { kennyismsApi, menuItemsApi, mealsApi } from "./slices/kitchen";

export const store = configureStore({
  reducer: {
    account: accountReducer,
    auth: authReducer,
    ops: opsReducer,
    passRequest: passRequestReducer,
    residents: residentsReducer,
    incidentReports: incidentReportsReducer,
    uaForm: uaFormReducer,
    users: usersReducer,
    walkInServices: walkInServicesReducer,
    dailyDuties: dailyDutiesReducer,
    friendlyReminders: friendlyRemindersReducer,
    kitchen: kitchenPrototypeReducer,
    [kennyismsApi.reducerPath]: kennyismsApi.reducer,
    [menuItemsApi.reducerPath]: menuItemsApi.reducer,
    [mealsApi.reducerPath]: mealsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      kennyismsApi.middleware,
      menuItemsApi.middleware,
      mealsApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
