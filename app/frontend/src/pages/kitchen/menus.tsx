import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addMenuItem } from "@/store/slices/kitchen";

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
        {menuItems.map((item) => (
          <Typography key={item.id}>{item.name}</Typography>
        ))}
      </Box>
    </Box>
  );
}
