import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";

import type { AppDispatch, RootState } from "@/store";
import { changePassword, resetAccountState } from "@/store/slices/account";

export default function PasswordPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector((state: RootState) => state.auth.user);
  const { loading, success, error } = useSelector(
    (state: RootState) => state.account
  );

  const mustChangePassword = Boolean(user?.mustChangePassword);
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      dispatch(resetAccountState());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!mustChangePassword && !currentPassword) {
      setValidationError("Current password is required.");
      return;
    }

    if (!newPassword) {
      setValidationError("New password is required.");
      return;
    }

    if (newPassword.length < 8) {
      setValidationError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError("New passwords do not match.");
      return;
    }

    const resultAction = await dispatch(
      changePassword({
        currentPassword: mustChangePassword ? "" : currentPassword,
        newPassword,
      })
    );

    if (changePassword.fulfilled.match(resultAction)) {
      navigate(from, { replace: true });
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "background.default",
          p: 2,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.default",
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 420, width: "100%", boxShadow: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" align="center" sx={{ fontWeight: 600, mb: 1 }}>
            {mustChangePassword ? "Set New Password" : "Change Password"}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            {mustChangePassword
              ? "You must update your password before continuing."
              : "Update your account password below."}
          </Typography>

          {(error || validationError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {validationError || error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {!mustChangePassword && (
              <TextField
                margin="normal"
                required
                fullWidth
                name="currentPassword"
                label="Current Password"
                type="password"
                id="currentPassword"
                autoComplete="current-password"
                autoFocus
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading}
              />
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="New Password"
              type="password"
              id="newPassword"
              autoComplete="new-password"
              autoFocus={mustChangePassword}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, height: 46 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Update Password"}
            </Button>

            {!mustChangePassword && (
              <Button
                fullWidth
                variant="outlined"
                disabled={loading}
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}