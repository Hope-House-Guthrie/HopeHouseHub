import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
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
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

import type { AppDispatch, RootState } from "@/store";
import {
  fetchClients,
  createClientThunk,
  updateClient,
  deleteClient,
  type Client,
} from "@/store/slices/clients";

interface FormData {
  firstName: string;
  middleName: string;
  lastName: string;
  isActive: boolean;
}

const initialFormData: FormData = {
  firstName: "",
  middleName: "",
  lastName: "",
  isActive: true,
};

export default function ClientsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { clients, loading, error } = useSelector(
    (state: RootState) => state.clients
  );

  // Modal / Form state
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  const handleOpenCreate = () => {
    setEditingClient(null);
    setFormData(initialFormData);
    setOpenDialog(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      firstName: client.firstName,
      middleName: client.middleName ?? "",
      lastName: client.lastName,
      isActive: client.isActive,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingClient(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingClient) {
      const updatedResource: Client = {
        ...editingClient,
        firstName: formData.firstName,
        middleName: formData.middleName || null,
        lastName: formData.lastName,
        isActive: formData.isActive,
      };

      await dispatch(
        updateClient({
          id: editingClient.id!,
          resource: updatedResource,
        })
      );
    } else {
      await dispatch(
        createClientThunk({
          id: null,
          firstName: formData.firstName,
          middleName: formData.middleName || null,
          lastName: formData.lastName,
          isActive: formData.isActive,
        })
      );
    }

    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
      dispatch(deleteClient(id));
    }
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
          Clients
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Add Client
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
                <TableCell>id</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Middle Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No clients found.
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.id}</TableCell>
                    <TableCell>{client.firstName}</TableCell>
                    <TableCell>{client.middleName ?? "—"}</TableCell>
                    <TableCell>{client.lastName}</TableCell>
                    <TableCell>
                      {client.isActive ? "Active" : "Inactive"}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenEdit(client)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(client.id!)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingClient ? "Edit Client" : "New Client"}
          </DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
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
              label="Middle Name"
              fullWidth
              value={formData.middleName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, middleName: e.target.value }))
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
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}