/**
 * KitchenMenusPage — staff manager (write side).
 *
 * Data flow:
 *   this page DISPATCHES  →  kitchen.ts (store)  →  display.tsx SELECTs for TV
 *
 * Soft max enforced here only: breakfast/lunch 3 foods, dinner 4
 * (Main, Sides, Salad). Library is search-first; no dump-all dinner dialog.
 *
 * Pattern C: one field searches as you type; if nothing matches, empty
 * state becomes Add (case-insensitive de-dupe keeps library clean).
 */

import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon, Visibility } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addMenuItem,
  removeMenuItem,
  setMealItems,
  updateMenuItem,
  addKennyism,
  setPinnedKennyism,
  type MenuItem,
} from "@/store/slices/kitchen";
import { setStaffNote } from "@/store/slices/ops";

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

  const staffNote = useAppSelector((state) => state.ops.staffNote);

  // --- Local UI state ---
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [editName, setEditName] = useState("");
  const [search, setSearch] = useState("");
  const [affirmationSearch, setAffirmationSearch] = useState("");
  const [noteDraft, setNoteDraft] = useState(staffNote);

  // --- Helpers ---
  /** Food names: Title Case each word (Mashed Potatoes). */
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

  /**
   * Affirmations / quotes: light sentence clean — not title case.
   * trim, collapse spaces, capitalize first letter, ensure ending . ! or ?
   */
  const cleanAffirmation = (s: string) => {
    let t = s.trim().replace(/\s+/g, " ");
    if (!t) return "";
    if (/[a-zA-Z]/.test(t[0] ?? "")) {
      t = t[0]!.toUpperCase() + t.slice(1);
    }
    if (!/[.!?]$/.test(t)) {
      t = `${t}.`;
    }
    return t;
  };

  const nameById = (id: string) =>
    menuItems.find((m) => m.id === id)?.name ?? "Unknown item";

  // Search-first: only show library rows when the user has typed something
  const q = search.trim().toLowerCase();
  const visibleItems = q
    ? menuItems.filter((item) => item.name.toLowerCase().includes(q))
    : menuItems;
  const showResults = q.length > 0;
  const noMatches = showResults && visibleItems.length === 0;
  // Exact name already in library? (case-insensitive) - blocks Add "Ric" when Rice in only a partial hit
  const exactExists =
    showResults &&
    menuItems.some((item) => item.name.toLowerCase() === q);
  // Show Add when typed something that isn't already an exact item (even if partial hits exist)
  const canAddNew = showResults && !exactExists;

  // Affirmations search-first (same idea as food library)
  const aq = affirmationSearch.trim().toLowerCase();
  const cleanedAffirmationDraft = cleanAffirmation(affirmationSearch);
  const visibleKennyisms = aq
    ? kennyisms.filter((k) => k.text.toLowerCase().includes(aq))
    : [];
  const showAffirmationResults = aq.length > 0;
  const exactAffirmationExists =
    showAffirmationResults &&
    !!cleanedAffirmationDraft &&
    kennyisms.some(
      (k) => k.text.toLowerCase() === cleanedAffirmationDraft.toLowerCase(),
    );
  const canAddAffirmation =
    showAffirmationResults &&
    !!cleanedAffirmationDraft &&
    !exactAffirmationExists;

  // --- Library: add / edit / delete ---
  const handleAdd = () => {
    const trimmed = toTitleCase(search);
    if (!trimmed) return;

    // Case-insensitive de-dupe — keep library clean
    const exists = menuItems.some(
      (item) => item.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) return;

    dispatch(
      addMenuItem({
        id: crypto.randomUUID(),
        name: trimmed,
      }),
    );
    setSearch("");
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

  const handleCloseEdit = () => {
    setEditItem(null);
    setEditName("");
  };

  const handleSaveEdit = () => {
    if (!editItem) return;
    const trimmed = toTitleCase(editName);
    if (!trimmed) {
      handleCloseEdit();
      return;
    }
    dispatch(updateMenuItem({ id: editItem.id, name: trimmed }));
    handleCloseEdit();
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

  // --- Ops staff note (ops slice — not kitchen food) ---
  const handleSaveStaffNote = () => {
    dispatch(setStaffNote(noteDraft.trim()));
  };

  const handleClearStaffNote = () => {
    setNoteDraft("");
    dispatch(setStaffNote(""));
  };

  // --- Daily Affirmations (kennyisms): search-first add + 12h pin ---
  const handleAddAffirmation = () => {
    const cleaned = cleanAffirmation(affirmationSearch);
    if (!cleaned) return;
    const exists = kennyisms.some(
      (k) => k.text.toLowerCase() === cleaned.toLowerCase(),
    );
    if (exists) return;
    dispatch(
      addKennyism({
        id: crypto.randomUUID(),
        text: cleaned,
      }),
    );
    setAffirmationSearch("");
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Page title */}
      <Typography variant="h4" component="h1">
        Kitchen Menus
      </Typography>

      {/* Staff note - state in ops slice; notify Frankie later with logins */}
      <Box
        sx={{
          mt: 2,
          mb: 2,
          p: 2,
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 1,
        }}
      >
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          Staff note
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          Supply / kitchen message for the team. Saved in this browser session
          only for now — real alerts come after logins.
        </Typography>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveStaffNote();
          }}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            maxWidth: 560,
          }}
        >
          <TextField
            label="Staff note"
            size="medium"
            fullWidth
            multiline
            minRows={2}
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="e.g. We are out of paper plates and forks"
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button type="submit" variant="contained">
              Save note
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={handleClearStaffNote}
            >
              Clear
            </Button>
          </Box>
        </Box>
        {staffNote ? (
          <Typography sx={{ mt: 1 }}>
            <strong>Active:</strong> {staffNote}
          </Typography>
        ) : (
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            No active staff note.
          </Typography>
        )}
      </Box>

      {/* Library count */}
      <Typography sx={{ mt: 2 }}>
        Library has {menuItems.length} item(s).
      </Typography>

      {/* Library search — empty results become Add (pattern C) */}
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          if (canAddNew) handleAdd();
        }}
        sx={{ display: "flex", gap: 1, mt: 2, mb: 1, maxWidth: 560 }}
      >
        <TextField
          label="Search or add food"
          size="medium"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {/* Search results + meal add / edit / delete on each row */}
      <Box sx={{ mt: 0 }}>
        {!showResults && (
          <Typography color="text.secondary">
            Search for a food, then use + Breakfast / + Lunch / + Dinner. If it
            is new, Add appears here if the exact name is not in the library yet.
          </Typography>
        )}

        {canAddNew && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}>
            <Typography color="text.secondary">
              {visibleItems.length === 0
                ? `No matches for “${search.trim()}”. Add it to the library?`
                : `No exact match for "${search.trim()}". Add it to the library?`}
            </Typography>
            <Button variant="contained" size="small" onClick={handleAdd}>
              Add “{toTitleCase(search)}”
            </Button>
          </Box>
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
          Today&apos;s Meals
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
        </Box>

        {/* Lunch slot */}
        <Box sx={{ mb: 2 }}>
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
        </Box>

        {/* Dinner slot — main, sides, salad; soft max 4; optional mealTime */}
        <Box sx={{ mb: 2 }}>
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

      {/* Daily Affirmations manager (store: kennyisms) — pin = 12h hold on TV */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h2" sx={{ mb: 1 }}>
          Daily Affirmations
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          Pin one quote for the TV (holds about 12 hours, then the board
          rotates). Use search to find a quote or add a new one.
        </Typography>
        <Typography sx={{ mb: 2 }}>
          Library has {kennyisms.length} affirmation(s).
        </Typography>

        {/* Search or add — Pattern C like food library */}
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            if (canAddAffirmation) handleAddAffirmation();
          }}
          sx={{ display: "flex", gap: 1, mb: 1, maxWidth: 560 }}
        >
          <TextField
            label="Search or add affirmation"
            size="medium"
            fullWidth
            value={affirmationSearch}
            onChange={(e) => setAffirmationSearch(e.target.value)}
          />
        </Box>

        {!showAffirmationResults && (
          <Typography color="text.secondary">
            Search for a quote, then Pin. If it is new, Add appears here.
          </Typography>
        )}

        {canAddAffirmation && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}>
            <Typography color="text.secondary">
              {visibleKennyisms.length === 0
                ? `No matches for “${affirmationSearch.trim()}”. Add it?`
                : `No exact match for “${affirmationSearch.trim()}”. Add as its own quote?`}
            </Typography>
            <Button
              variant="contained"
              size="small"
              onClick={handleAddAffirmation}
            >
              Add “{cleanedAffirmationDraft}”
            </Button>
          </Box>
        )}

        {showAffirmationResults &&
          visibleKennyisms.map((k) => {
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
          })}

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

      {/* Edit library item dialog — Enter submits, always closes when done */}
      <Dialog open={!!editItem} onClose={handleCloseEdit} maxWidth="xs">
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveEdit();
          }}
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
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={handleCloseEdit}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
