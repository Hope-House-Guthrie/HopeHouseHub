import { useState } from "react";
import { Box, Button, TextField, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addMenuItem, removeMenuItem, setMealItems, updateMenuItem, type MenuItem } from "@/store/slices/kitchen";

export default function KitchenMenusPage() {
  const menuItems = useAppSelector((state) => state.kitchen.menuItems);
  const dispatch = useAppDispatch();
  const [newName, setNewName] = useState("");
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [editName, setEditName] = useState("");
  const [dinnerDialogOpen, setDinnerDialogOpen] = useState(false);

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    dispatch(
      addMenuItem({
        id: crypto.randomUUID(),
        name: trimmed,
      }),
    );
    setNewName("");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      dispatch(removeMenuItem(id));
    }
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditItem(item);
    setEditName(item.name);
  };

  const handleSaveEdit = () => {
    if (editItem) {
      dispatch(updateMenuItem({ id: editItem.id, name: editName }));
      setEditItem(null);
      setEditName("");
    }
  };

  const handleSetDinner = () => {
    const selectedIds = menuItems.map(item => item.id);
    dispatch(setMealItems({ meal: "dinner", itemIds: selectedIds }));
    setDinnerDialogOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1">
        Kitchen Menus
      </Typography>

      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd();
        }}
        sx={{ display: "flex", gap: 1, mt: 2, mb: 2 }}
      >
        <TextField
          label="New food"
          size="small"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Button type="submit" variant="contained">
          Add
        </Button>
      </Box>

      <Typography sx={{ mt: 2 }}>
        Library has {menuItems.length} item(s).
      </Typography>

      <Box sx={{ mt: 2 }}>
        {menuItems.map((item: MenuItem) => (
          <Box
            key={item.id}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 1,
              borderBottom: "1px solid rgba(0,0,0,0.1)",
            }}
          >
            <Typography>{item.name}</Typography>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <IconButton
                color="primary"
                size="small"
                onClick={() => handleOpenEdit(item)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                color="error"
                size="small"
                onClick={() => handleDelete(item.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Meal Selection Buttons */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Today's Meals
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button variant="contained" color="primary" size="small">
            Set Breakfast
          </Button>
          <Button variant="contained" color="success" size="small">
            Set Lunch
          </Button>
          <Button 
            variant="contained" 
            color="warning" 
            size="small"
            onClick={() => setDinnerDialogOpen(true)}
          >
            Set Dinner
          </Button>
        </Box>
      </Box>

      {/* Dinner Selection Dialog */}
      <Dialog
        open={dinnerDialogOpen}
        onClose={() => setDinnerDialogOpen(false)}
        maxWidth="sm"
      >
        <DialogTitle>Set Dinner Menu</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Currently serving: {menuItems.map(item => item.name).join(", ") || "none"}
          </Typography>
          <Typography>
            Dinner menu updated with all library items.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDinnerDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSetDinner}
          >
            Set Dinner
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog
        open={!!editItem}
        onClose={() => setEditItem(null)}
        maxWidth="xs"
      >
        <DialogTitle>Edit Menu Item</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Item name"
            fullWidth
            variant="outlined"
            size="small"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditItem(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}