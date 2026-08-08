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
  const breakfast = useAppSelector((state) => state.kitchen.breakfast);
  const lunch = useAppSelector((state) => state.kitchen.lunch);
  const dinner = useAppSelector((state) => state.kitchen.dinner);
  const [search, setSearch] = useState("");

  const handleAdd = () => {
    const trimmed = toTitleCase(newName);
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

  const handleAddToBreakfast = (id: string) => {
    if (breakfast.itemIds.includes(id)) return;
    if (breakfast.itemIds.length >= 3) return;
    dispatch(
      setMealItems({
        meal: "breakfast",
        itemIds: [...breakfast.itemIds, id],
      }),
    );
  };

    const handleAddToLunch = (id: string) => {
    if (lunch.itemIds.includes(id)) return;
    if (lunch.itemIds.length >= 3) return;
    dispatch(
      setMealItems({
        meal: "lunch",
        itemIds: [...lunch.itemIds, id],
      }),
    );
  };

    const handleAddToDinner = (id: string) => {
    if (dinner.itemIds.includes(id)) return;
    if (dinner.itemIds.length >= 4) return;
    dispatch(
      setMealItems({
        meal: "dinner",
        itemIds: [...dinner.itemIds, id],
      }),
    );
  };

  const handleRemoveFromBreakfast = (id: string) => {
    dispatch(
      setMealItems({
        meal: "breakfast",
        itemIds: breakfast.itemIds.filter((x) => x !== id),
      }),
    );
  };

    const handleRemoveFromLunch = (id: string) => {
    dispatch(
      setMealItems({
        meal: "lunch",
        itemIds: lunch.itemIds.filter((x) => x !== id),
      }),
    );
  };

    const handleRemoveFromDinner = (id: string) => {
    dispatch(
      setMealItems({
        meal: "dinner",
        itemIds: dinner.itemIds.filter((x) => x !== id),
      }),
    );
  };

  const toTitleCase = (s: string) =>
    s
      .trim()
      .split(/\s+/)
      .map((word) =>
        word.length === 0
          ? word: word[0]?.toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join(" ");

  
  const nameById = (id: string) =>
    menuItems.find((m) => m.id === id)?.name ?? "Unknown item";

  const mealLine = (meal: { itemIds: string[] }) => {
    if (meal.itemIds.length === 0) return "Not set";
    return meal.itemIds.map(nameById).join(", ");
  };

  const q = search.trim().toLowerCase();
    const visibleItems = q
      ? menuItems.filter((item) => item.name.toLowerCase().includes(q))
      : menuItems;

  const showResults = q.length > 0;

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
          label="Add New Food Item"
          size="medium"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Button type="submit" variant="contained">
          Add
        </Button>
      </Box>

      <Typography sx={{ mt: 0 }}>
        Library has {menuItems.length} item(s).
      </Typography>

      <TextField
      label="Search Library"
      size="medium"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      sx={{ mt: 2, mb: 1, maxWidth: 360 }}
      fullWidth
    />

      <Box sx={{ mt: 0 }}>
        {!showResults && (
          <Typography color="text.secondray">
            Search for a food, then use + Breakfast / + Lunch / + Dinner.
          </Typography>
        )}
        {showResults && visibleItems.length === 0 && (
          <Typography color="text.secondary">No matches.</Typography>
        )}
        {showResults &&
          visibleItems.map((item: MenuItem) => (
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
            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleAddToBreakfast(item.id)}
            >
              + Breakfast
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleAddToLunch(item.id)}
            >
              + Lunch
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleAddToDinner(item.id)}
            >
              + Dinner
            </Button>
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
        <Typography variant="h2" sx={{ mb: 2 }}>
          Today's Meals
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" sx={{ mb: 0.5 }}>
            <strong>Breakfast:</strong>
          </Typography>
          {breakfast.itemIds.length === 0 ? (
            <Typography color="text.secondary">Not set</Typography>
          ) : (
            breakfast.itemIds.map((id) => (
              <Box
                key={id}
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
              >
                <Typography variant="h6">{nameById(id)}</Typography>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleRemoveFromBreakfast(id)}
                >
                  Remove
                </Button>
              </Box>
            ))
          )}

          <Typography variant="h4" sx={{ mb: 0.5 }}>
            <strong>Lunch:</strong>
          </Typography>
          {lunch.itemIds.length === 0 ? (
            <Typography color="text.secondary">Not set</Typography>
          ) : (
            lunch.itemIds.map((id) => (
              <Box
                key={id}
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
              >
                <Typography variant="h6">{nameById(id)}</Typography>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleRemoveFromLunch(id)}
                >
                  Remove
                </Button>
              </Box>
            ))
          )}

          <Typography variant="h4" sx={{ mb: 0.5 }}>
            <strong>Dinner:</strong>
            {dinner.mealTime ? ` (${dinner.mealTime})` : ""}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
            Main, Sides, Salad (Up to 4)
          </Typography>
          {dinner.itemIds.length === 0 ? (
            <Typography color="text.secondary">Not set</Typography>
          ) : (
            dinner.itemIds.map((id) => (
              <Box
                key={id}
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
              >
                <Typography variant="h6">{nameById(id)}</Typography>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleRemoveFromDinner(id)}
                >
                  Remove
                </Button>
              </Box>
            ))
          )}
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