/**
 * Daily Duties — Chore Library (catalog definitions)
 *
 * STATUS (branch: daily-duties) — leave 2026-08-18
 * DONE: seed 28 paper chores; browse by category; Add / Edit / Archive
 * DONE elsewhere: Weekly Assign (incl. day matrix) + Check-Off from published list
 * PARKED: disciplinary library; hard delete (prefer Archive)
 * RULES: definitions only — not who is assigned this week; never write SIO;
 *   edit does not rewrite published name snapshots
 */

import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  CHORE_CATEGORY_ORDER,
  addChore,
  choreCategoryLabel,
  setChoreActive,
  updateChore,
  type Chore,
  type ChoreCategory,
} from "@/store/slices/prototype/dailyDuties";

const EMPTY_FORM = {
  name: "",
  category: "kitchen_dining" as ChoreCategory,
  sortOrder: "",
};

export default function ChoreLibraryPage() {
  const dispatch = useAppDispatch();
  const choreLibrary = useAppSelector((s) => s.dailyDuties.choreLibrary);

  const [addOpen, setAddOpen] = useState(false);
  const [editChore, setEditChore] = useState<Chore | null>(null);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<ChoreCategory>("kitchen_dining");
  const [formSortOrder, setFormSortOrder] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const byCategory = useMemo(() => {
    const map = new Map<ChoreCategory, Chore[]>();
    for (const cat of CHORE_CATEGORY_ORDER) {
      map.set(cat, []);
    }
    const sorted = choreLibrary
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder);
    for (const c of sorted) {
      const list = map.get(c.category);
      if (list) list.push(c);
      else {
        const orphan = map.get("general_everyone") ?? [];
        orphan.push(c);
        map.set("general_everyone", orphan);
      }
    }
    return map;
  }, [choreLibrary]);

  const activeCount = choreLibrary.filter((c) => c.active).length;
  const inactiveCount = choreLibrary.length - activeCount;

  const resetForm = () => {
    setFormName(EMPTY_FORM.name);
    setFormCategory(EMPTY_FORM.category);
    setFormSortOrder(EMPTY_FORM.sortOrder);
  };

  const handleCloseAdd = () => {
    setAddOpen(false);
    resetForm();
  };

  const handleOpenAdd = () => {
    setNotice(null);
    resetForm();
    setAddOpen(true);
  };

  const handleCloseEdit = () => {
    setEditChore(null);
    resetForm();
  };

  const handleOpenEdit = (chore: Chore) => {
    setNotice(null);
    setEditChore(chore);
    setFormName(chore.name);
    setFormCategory(chore.category);
    setFormSortOrder(String(chore.sortOrder));
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const name = formName.trim();
    if (!name) return;
    dispatch(
      addChore({
        name,
        category: formCategory,
      }),
    );
    setNotice("Chore added to library.");
    handleCloseAdd();
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editChore) return;
    const name = formName.trim();
    if (!name) return;
    const sortOrder = Number.parseInt(formSortOrder, 10);
    dispatch(
      updateChore({
        id: editChore.id,
        name,
        category: formCategory,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : editChore.sortOrder,
      }),
    );
    setNotice(
      "Library chore updated. Existing weekly assignment labels stay as assigned (snapshot).",
    );
    handleCloseEdit();
  };

  const handleToggleActive = (chore: Chore) => {
    dispatch(setChoreActive({ id: chore.id, active: !chore.active }));
    setNotice(
      chore.active
        ? `Archived: ${chore.name} (hidden from new assigns).`
        : `Restored: ${chore.name}`,
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ flex: "1 1 auto" }}>
          Chore Library
        </Typography>
        <Button component={RouterLink} to="/daily-duties" variant="outlined">
          Back to Daily Duties
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary">
        House chore catalog (definitions). Add / edit / archive here. Assign to
        clients on Weekly Chore Assign. Not disciplinary duties.
      </Typography>

      {notice && (
        <Alert severity="success" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
        <Chip label={`Total: ${choreLibrary.length}`} />
        <Chip label={`Active: ${activeCount}`} color="success" variant="outlined" />
        {inactiveCount > 0 && (
          <Chip
            label={`Inactive: ${inactiveCount}`}
            color="default"
            variant="outlined"
          />
        )}
        <Button variant="contained" onClick={handleOpenAdd} sx={{ ml: { sm: "auto" } }}>
          Add chore
        </Button>
        <Button
          component={RouterLink}
          to="/daily-duties/weekly-chore-assign"
          variant="outlined"
        >
          Weekly assign
        </Button>
      </Box>

      {/* Category sections */}
      {CHORE_CATEGORY_ORDER.map((cat) => {
        const items = byCategory.get(cat) ?? [];
        if (items.length === 0) return null;
        return (
          <Box
            key={cat}
            sx={{ display: "flex", flexDirection: "column", gap: 1 }}
          >
            <Typography variant="h6" component="h2">
              {choreCategoryLabel(cat)}
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
                sx={{ ml: 1 }}
              >
                ({items.length})
              </Typography>
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {items.map((chore) => (
                <Card
                  key={chore.id}
                  variant="outlined"
                  sx={{
                    opacity: chore.active ? 1 : 0.7,
                    bgcolor: chore.active ? "background.paper" : "action.hover",
                  }}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "flex-start",
                      gap: 1,
                      py: 1.5,
                      "&:last-child": { pb: 1.5 },
                    }}
                  >
                    <Box sx={{ flex: "1 1 220px", minWidth: 0 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {chore.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {chore.id} · order {chore.sortOrder}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={chore.active ? "Active" : "Inactive"}
                      color={chore.active ? "success" : "default"}
                      variant={chore.active ? "filled" : "outlined"}
                    />
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenEdit(chore)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color={chore.active ? "warning" : "success"}
                        onClick={() => handleToggleActive(chore)}
                      >
                        {chore.active ? "Archive" : "Restore"}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        );
      })}

      {/* Add dialog */}
      <Dialog open={addOpen} onClose={handleCloseAdd} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmitAdd}>
          <DialogTitle>Add chore</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
          >
            <TextField
              label="Name / description"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              fullWidth
              autoFocus
              multiline
              minRows={2}
              helperText="Full paper text, including due times if any"
            />
            <TextField
              select
              label="Category"
              value={formCategory}
              onChange={(e) =>
                setFormCategory(e.target.value as ChoreCategory)
              }
              fullWidth
            >
              {CHORE_CATEGORY_ORDER.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {choreCategoryLabel(cat)}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={handleCloseAdd}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={!formName.trim()}>
              Add
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={!!editChore}
        onClose={handleCloseEdit}
        fullWidth
        maxWidth="sm"
      >
        <Box component="form" onSubmit={handleSubmitEdit}>
          <DialogTitle>Edit chore</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
          >
            <Typography variant="caption" color="text.secondary">
              Library only. Published weekly labels stay as snapshotted when
              assigned.
            </Typography>
            <TextField
              label="Name / description"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              fullWidth
              autoFocus
              multiline
              minRows={2}
            />
            <TextField
              select
              label="Category"
              value={formCategory}
              onChange={(e) =>
                setFormCategory(e.target.value as ChoreCategory)
              }
              fullWidth
            >
              {CHORE_CATEGORY_ORDER.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {choreCategoryLabel(cat)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Display order"
              type="number"
              value={formSortOrder}
              onChange={(e) => setFormSortOrder(e.target.value)}
              fullWidth
              slotProps={{ htmlInput: { min: 0, step: 1 } }}
            />
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={handleCloseEdit}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={!formName.trim()}>
              Save
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
