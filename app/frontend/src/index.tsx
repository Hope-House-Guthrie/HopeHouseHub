import { StrictMode } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { createRoot } from "react-dom/client";
import { CssBaseline } from "@mui/material";
import { Provider } from "react-redux";

import { store } from "./store";
import { routesConfig } from "./routes";

const elem = document.getElementById("root")!;

const router = createBrowserRouter(routesConfig);

const app = (
  <StrictMode>
    <CssBaseline />
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);

(import.meta.hot.data.root ??= createRoot(elem)).render(app);