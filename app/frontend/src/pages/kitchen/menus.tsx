/**
 * KitchenMenusPage — staff manager (write side).
 *
 * Data flow:
 *   this page DISPATCHES  →  kitchen.ts (store)  →  display.tsx SELECTs for TV
 *
 * Soft max enforced here only: breakfast/lunch 3 foods, dinner 4
 * (Main, Sides, Salad). Library is search-first; no dump-all dinner dialog.
 */


import { useState } from "react";
import { Box, Button, TextField, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addMenuItem, removeMenuItem, setMealItems, updateMenuItem, addKennyism, setPinnedKennyism, type MenuItem } from "@/store/slices/kitchen";
import { LanguageVariant } from "typescript";

export default function KitchenMenusPage() {
  // --- Store: library + today's meals (write via dispatch below) ---
  const menuItems = useAppSelector((state) => state.kitchen.menuItems);
  const breakfast = useAppSelector((state) => state.kitchen.breakfast);
  const lunch = useAppSelector((state) => state.kitchen.lunch);
  const dinner = useAppSelector((state) => state.kitchen.dinner);
  const dispatch = useAppDispatch();

  // Code: kennyisms. Guest label on TV: Daily Affirmations
  const kennyisms = useAppSelector((state) => state.kitchen.kennyisms);
  const pinnedKennyismId = useAppSelector(
    (state) => state.kitchen.pinnedKennyismId,
  );

  // --- Local UI state ---
  const [newName, setNewName] = useState("");
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [editName, setEditName] = useState("");
  const [search, setSearch] = useState("");
  const [newAffirmation, setNewAffirmation] = useState("");

  // --- Helpers ---
  const toTitleCase = (s: string) =>
    s
      .trim()
      .split(/\s+/)
      .map((word) =>
        word.length === 0
          ? word
          : word[0]?.toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join(" ");

  const nameById = (id: string) =>
    menuItems.find((m) => m.id === id)?.name ?? "Unknown item";

  // Search-first: only show library rows when the user has typed something
  const q = search.trim().toLowerCase();
  const visibleItems = q
    ? menuItems.filter((item) => item.name.toLowerCase().includes(q))
    : menuItems;
  const showResults = q.length > 0;

  // --- Library: add / edit / delete ---
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
    if (!editItem) return;
    const trimmed = toTitleCase(editName);
    if (!trimmed) return;
    dispatch(updateMenuItem({ id: editItem.id, name: trimmed }));
    setEditItem(null);
    setEditName("");
  };

  // --- Add library item → meal (soft max: B/L 3, dinner 4) ---
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

  // --- Remove one food from a meal (library item stays) ---
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

  // --- Daily Affirmations (kennyisms): add + 12h pin ---
  const handleAddAffirmation = () => {
    const trimmed = newAffirmation.trim();
    if (!trimmed) return;
    dispatch(
      addKennyism({
        id: crypto.randomUUID(),
        text: trimmed,
      }),
    );
    setNewAffirmation("");
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Page title */}
      <Typography variant="h4" component="h1">
        Kitchen Menus
      </Typography>

      {/* Add to library form */}
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

      {/* Library count */}
      <Typography sx={{ mt: 0 }}>
        Library has {menuItems.length} item(s).
      </Typography>

      {/* Library search (search-first list below) */}
      <TextField
        label="Search Library"
        size="medium"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mt: 2, mb: 1, maxWidth: 360 }}
        fullWidth
      />

      {/* Search results + meal add / edit / delete on each row */}
      <Box sx={{ mt: 0 }}>
        {!showResults && (
          <Typography color="text.secondary">
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
                {/* Meal Selection Buttons */}
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

                {/* Row actions: edit / delete library item */}
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

      {/* Today's Meals preview (manager view; TV reads same store) */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h2" sx={{ mb: 2 }}>
          Today's Meals
        </Typography>

        {/* Breakfast slot */}
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

          {/* Lunch slot */}
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

          {/* Dinner slot — main, sides, salad; soft max 4; optional mealTime */}
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

          {/* Daily Affirmations manager (store: kennyisms) - pin = 12h hold on TV */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h2" sx={{ mb: 1 }}>
              Daily Affirmations
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Pin one for the TV (holds ~12 hours, then rotates). Add new quotes anytime.
            </Typography>

            {/* Add Affirmation - same idea as Add food (form + Enter) */}
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                handleAddAffirmation();
              }}
              sx={{ display: "flex", gap: 1, mb: 2, maxWidth: 560 }}
            >
              <TextField
                label="New affirmation"
                size="medium"
                fullWidth
                value={newAffirmation}
                onChange={(e) => setNewAffirmation(e.target.value)}
              />
              <Button type="submit" variant="contained">
                Add
              </Button>
            </Box>

            {kennyisms.length === 0 ? (
              <Typography color="text.secondary">No affirmations yet.</Typography>
            ) : (
              kennyisms.map((k) =>{
                const isPinned = pinnedKennyismId === k.id;
                return (
                  <Box
                    key={k.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      py: 1,
                      borderBottom: "1px solid rgba(0,0,0,0.1)",
                    }}
                  >
                    <Typography
                    sx={{ fontStyle: isPinned ? "italic" : "normal" }}
                  >
                    {isPinned ? "📌 " : ""}
                    {k.text}
                  </Typography>
                  <Button
                    size="small"
                    variant={isPinned ? "contained" : "outlined"}
                    onClick={() =>
                      dispatch(setPinnedKennyism(isPinned ? null : k.id))
                    }
                  >
                    {isPinned ? "Unpin" : "Pin"}
                  </Button>
                </Box>
              );
            })
          )}

          {pinnedKennyismId && (
            <Button
              size="small"
              sx={{ mt: 1 }}
              onClick={() => dispatch(setPinnedKennyism(null))}
            >
              Clear pin
            </Button>
            )}
          </Box>


      {/* Edit library item dialog */}
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
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveEdit();
            }}
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
