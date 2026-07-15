import { StrictMode } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { createRoot } from "react-dom/client";
import { CssBaseline } from "@mui/material";

import MainLayout from "./layouts/main";
import NotFoundPage from "./pages/not-found";
import SettingsPage from "./pages/settings";
import AwardsPage from "./pages/awards";
import HistoryPage from "./pages/history";
import DashboardPage from "./pages/dashboard";
import { Provider } from "react-redux";
import { store } from "./storage/store";
import AccountsPage from "./pages/accounts";

const elem = document.getElementById("root")!;

const app = (
  <StrictMode>
    <CssBaseline />
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="awards" element={<AwardsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);

(import.meta.hot.data.root ??= createRoot(elem)).render(app);
