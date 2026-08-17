import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, Navigate, useLocation } from "react-router";
import { Box, useTheme } from "@mui/material";

import type { AppDispatch, RootState } from "@/store";
import MainHeader from "./header";
import MainDrawer from "./drawer";

const DRAWER_WIDTH = 300;

export default function MainLayout() {
  const theme = useTheme();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {isAuthenticated && !user?.mustChangePassword && (
        <>
          <MainHeader
            drawerWidth={isAuthenticated ? DRAWER_WIDTH : 0}
            drawerOpen={drawerOpen}
            setDrawerOpen={setDrawerOpen}
          />
      
          <MainDrawer
            drawerWidth={DRAWER_WIDTH}
            drawerOpen={drawerOpen}
            setDrawerOpen={setDrawerOpen}
          />
        </>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: isAuthenticated ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%" },
          backgroundColor: theme.palette.background.default,
          marginTop: "64px",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}