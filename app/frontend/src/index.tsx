import { StrictMode } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { createRoot } from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { Provider } from "react-redux";

import { store } from "./store";
import { routesConfig } from "./routes";
import { hopeHouseColors } from "./lib/hope-house-colors";

const elem = document.getElementById("root")!;

const router = createBrowserRouter(routesConfig);

const theme = createTheme({
  palette: {
    primary: {
      main: hopeHouseColors.blue,
    },
  },
});

const app = (
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </ThemeProvider>
  </StrictMode>
);

(import.meta.hot.data.root ??= createRoot(elem)).render(app);
