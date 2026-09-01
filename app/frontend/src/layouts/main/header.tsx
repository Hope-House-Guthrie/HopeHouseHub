import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMatches, useNavigate } from "react-router";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  LockReset as LockResetIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from "@mui/icons-material";

import type { AppDispatch, RootState } from "@/store";
import { type AppRouteHandle } from "@/routes";
import { logout } from "@/store/slices/auth";

export interface MainHeaderProps {
  drawerWidth: number;
  drawerOpen: boolean;
  setDrawerOpen(value: boolean): void;
}

export default function MainHeader({
  drawerWidth,
  drawerOpen,
  setDrawerOpen,
}: MainHeaderProps) {
  const theme = useTheme();
  const matches = useMatches();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleChangePassword = () => {
    handleMenuClose();
    navigate("/password");
  };

  const handleSignOut = () => {
    handleMenuClose();
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const displayName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  const currentMatch = [...matches]
    .reverse()
    .find((match) => match.handle && (match.handle as AppRouteHandle).title);

  const handle = currentMatch ? (currentMatch.handle as AppRouteHandle) : null;
  const headerTitle = handle?.title ?? "Hope House Hub";
  const headerIcon = handle?.icon ?? null;

  return (
    <AppBar
      position="fixed"
      sx={{
        width: {
          md: isAuthenticated ? `calc(100% - ${drawerWidth}px)` : "100%",
        },
        ml: { md: isAuthenticated ? `${drawerWidth}px` : 0 },
        boxShadow: "none",
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        "@media print": {
          display: "none",
        },
      }}
    >
      <Toolbar>
        {isAuthenticated && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {headerIcon && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mr: 1.5,
              color: "text.secondary",
            }}
          >
            {headerIcon}
          </Box>
        )}

        <Typography variant="h6" component="h1" noWrap sx={{ fontWeight: 600 }}>
          {headerTitle}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {isAuthenticated && (
          <>
            <Button
              color="inherit"
              onClick={handleMenuOpen}
              endIcon={<ArrowDownIcon />}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                px: 1.5,
                color: "text.primary",
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  mr: 1,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                }}
              >
                {initials}
              </Avatar>
              <Typography
                variant="body2"
                component="span"
                sx={{
                  fontWeight: 500,
                  display: { xs: "none", sm: "block" },
                }}
              >
                {displayName}
              </Typography>
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={isMenuOpen}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.12))",
                    border: `1px solid ${theme.palette.divider}`,
                    mt: 1.5,
                    "&::before": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: "background.paper",
                      transform: "translateY(-50%) rotate(45deg)",
                      zIndex: 0,
                      borderLeft: `1px solid ${theme.palette.divider}`,
                      borderTop: `1px solid ${theme.palette.divider}`,
                    },
                  },
                },
              }}
            >
              <MenuItem onClick={handleChangePassword} sx={{ py: 1, px: 2 }}>
                <ListItemIcon sx={{ minWidth: "36px !important" }}>
                  <LockResetIcon fontSize="small" />
                </ListItemIcon>
                <Typography
                  variant="body2"
                  component="span"
                  sx={{ fontWeight: 500 }}
                >
                  Change Password
                </Typography>
              </MenuItem>

              <Divider sx={{ my: 0.5 }} />

              <MenuItem onClick={handleSignOut} sx={{ py: 1, px: 2 }}>
                <ListItemIcon sx={{ minWidth: "36px !important" }}>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                <Typography
                  variant="body2"
                  component="span"
                  color="error.main"
                  sx={{ fontWeight: 500 }}
                >
                  Sign out
                </Typography>
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
