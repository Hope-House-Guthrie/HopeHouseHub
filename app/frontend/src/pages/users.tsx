import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  IconButton,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  LockReset as LockResetIcon,
} from "@mui/icons-material";

import type { AppDispatch, RootState } from "@/store";
import {
  fetchUsers,
  fetchRoles,
  createUserThunk,
  updateUser,
  resetUserPassword,
  clearGeneratedPassword,
  type UserResource,
} from "@/store/slices/users";

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roleNormalizedNames: string[];
}

const initialFormData: FormData = {
  email: "",
  firstName: "",
  lastName: "",
  isActive: true,
  roleNormalizedNames: [],
};

export default function UsersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { users, roles, loading, error, latestGeneratedPassword } = useSelector(
    (state: RootState) => state.users
  );

  // Modal / Form state
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResource | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchRoles());
  }, [dispatch]);

  useEffect(() => {
    if (latestGeneratedPassword) {
      setPasswordDialogOpen(true);
    }
  }, [latestGeneratedPassword]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData(initialFormData);
    setOpenDialog(true);
  };

  const handleOpenEdit = (user: UserResource) => {
  setEditingUser(user);
  setFormData({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isActive: user.isActive,
    roleNormalizedNames: user.roleNormalizedNames ?? [],
  });
  setOpenDialog(true);
};

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData(initialFormData);
  };

  const handleRoleToggle = (normalizedName: string) => {
    setFormData((prev) => {
      const exists = prev.roleNormalizedNames.includes(normalizedName);
      return {
        ...prev,
        roleNormalizedNames: exists
          ? prev.roleNormalizedNames.filter((name) => name !== normalizedName)
          : [...prev.roleNormalizedNames, normalizedName],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
        if (editingUser) {
        await dispatch(
            updateUser({
            id: editingUser.id,
            resource: {
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                isActive: formData.isActive,
                roleNormalizedNames: formData.roleNormalizedNames,
            },
            })
        ).unwrap();
        } else {
        await dispatch(
            createUserThunk({
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            roleNormalizedNames: formData.roleNormalizedNames,
            })
        ).unwrap();
        }

        handleCloseDialog();
    } catch {
        // Errors are trapped and saved in state.users.error by the thunk
    }
    };

  const handleResetPassword = (id: string) => {
    if (confirm("Are you sure you want to reset this user's password?")) {
      dispatch(resetUserPassword(id));
    }
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    dispatch(clearGeneratedPassword());
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Add User
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Email / Username</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.firstName}</TableCell>
                    <TableCell>{user.lastName}</TableCell>
                    <TableCell>
                      {user.isActive ? "Active" : "Inactive"}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenEdit(user)}
                        size="small"
                        title="Edit User"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="warning"
                        onClick={() => handleResetPassword(user.id)}
                        size="small"
                        title="Reset Password"
                      >
                        <LockResetIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create / Edit Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingUser ? "Edit User" : "Create New User"}
          </DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
          >
            <TextField
              label="Email Address"
              type="email"
              required
              fullWidth
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <TextField
              label="First Name"
              required
              fullWidth
              value={formData.firstName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, firstName: e.target.value }))
              }
            />
            <TextField
              label="Last Name"
              required
              fullWidth
              value={formData.lastName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, lastName: e.target.value }))
              }
            />

            {/* Role Checkbox List */}
            <Box sx={{ mt: 1 }}>
              <FormLabel component="legend" sx={{ mb: 1 }}>
                Roles
              </FormLabel>
              <FormGroup>
                {roles.map((role) => (
                  <FormControlLabel
                    key={role.id}
                    control={
                      <Checkbox
                        checked={formData.roleNormalizedNames.includes(
                          role.normalizedName
                        )}
                        onChange={() => handleRoleToggle(role.normalizedName)}
                      />
                    }
                    label={role.name}
                  />
                ))}
              </FormGroup>
            </Box>

            {editingUser && (
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                  />
                }
                label="Active Status"
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Temporary Password Display Dialog */}
      <Dialog open={passwordDialogOpen} onClose={handleClosePasswordDialog}>
        <DialogTitle>Temporary Password Generated</DialogTitle>
        <DialogContent sx={{ minWidth: 320 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please copy and share this password securely with the user. It will
            not be shown again.
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.100" }}>
            <Typography
              variant="h6"
              component="code"
              sx={{ wordBreak: "break-all", fontFamily: "monospace" }}
            >
              {latestGeneratedPassword}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}