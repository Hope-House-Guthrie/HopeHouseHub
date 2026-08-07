import { useState } from "react";
import { Box, Button, TextField, Typography, IconButton } from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addMenuItem, removeMenuItem, type MenuItem } from "@/store/slices/kitchen";

export default function KitchenMenusPage() {
  const menuItems = useAppSelector((state) => state.kitchen.menuItems);
  const dispatch = useAppDispatch();
  const [newName, setNewName] = useState("");

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
            <IconButton
              color="error"
              size="small"
              onClick={() => handleDelete(item.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
