/**
 * Daily Duties — Class Library (mandatory class catalog)
 *
 * STATUS (branch: daily-duties) — leave 2026-08-18
 * DONE: browse / Add / Edit / Archive mandatory classes
 * DONE elsewhere: Class Attendance uses active classes only
 * RULES: definitions only — not attendance marks; edit does not rewrite
 *   started/completed session name snapshots; never write SIO
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
  TextField,
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addMandatoryClass,
  setMandatoryClassActive,
  updateMandatoryClass,
  type MandatoryClass,
} from "@/store/slices/prototype/dailyDuties";

export default function ClassLibraryPage() {
  const dispatch = useAppDispatch();
  const mandatoryClasses = useAppSelector(
    (s) => s.dailyDuties.mandatoryClasses,
  );

  const [addOpen, setAddOpen] = useState(false);
  const [editClass, setEditClass] = useState<MandatoryClass | null>(null);
  const [formName, setFormName] = useState("");
  const [formInstructor, setFormInstructor] = useState("");
  const [formSortOrder, setFormSortOrder] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const sorted = useMemo(
    () =>
      mandatoryClasses
        .slice()
        .sort(
          (a, b) =>
            a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
        ),
    [mandatoryClasses],
  );

  const activeCount = mandatoryClasses.filter((c) => c.active).length;
  const inactiveCount = mandatoryClasses.length - activeCount;

  const resetForm = () => {
    setFormName("");
    setFormInstructor("");
    setFormSortOrder("");
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
    setEditClass(null);
    resetForm();
  };

  const handleOpenEdit = (row: MandatoryClass) => {
    setNotice(null);
    setEditClass(row);
    setFormName(row.name);
    setFormInstructor(row.instructor);
    setFormSortOrder(String(row.sortOrder));
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const name = formName.trim();
    if (!name) return;
    dispatch(
      addMandatoryClass({
        name,
        instructor: formInstructor.trim(),
      }),
    );
    setNotice(`Class added: ${name}`);
    handleCloseAdd();
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editClass) return;
    const name = formName.trim();
    if (!name) return;
    const sortOrder = Number.parseInt(formSortOrder, 10);
    dispatch(
      updateMandatoryClass({
        id: editClass.id,
        name,
        instructor: formInstructor.trim(),
        sortOrder: Number.isFinite(sortOrder)
          ? sortOrder
          : editClass.sortOrder,
      }),
    );
    setNotice(
      "Class updated. Open/completed attendance labels stay as snapshotted at start.",
    );
    handleCloseEdit();
  };

  const handleToggleActive = (row: MandatoryClass) => {
    dispatch(
      setMandatoryClassActive({ id: row.id, active: !row.active }),
    );
    setNotice(
      row.active
        ? `Archived: ${row.name} (hidden from new Attendance starts).`
        : `Restored: ${row.name}`,
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
          Class Library
        </Typography>
        <Button
          component={RouterLink}
          to="/daily-duties/class-attendance"
          variant="outlined"
        >
          Class Attendance
        </Button>
        <Button component={RouterLink} to="/daily-duties" variant="outlined">
          Back to Daily Duties
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary">
        Mandatory class catalog (definitions). Attendance desk picks from
        active classes only. Edit does not rewrite sessions already started.
      </Typography>

      {notice && (
        <Alert severity="success" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          alignItems: "center",
        }}
      >
        <Chip label={`Total: ${mandatoryClasses.length}`} />
        <Chip
          label={`Active: ${activeCount}`}
          color="success"
          variant="outlined"
        />
        {inactiveCount > 0 && (
          <Chip
            label={`Archived: ${inactiveCount}`}
            color="default"
            variant="outlined"
          />
        )}
        <Button
          variant="contained"
          onClick={handleOpenAdd}
          sx={{ ml: { sm: "auto" } }}
        >
          Add class
        </Button>
      </Box>

      {/* Flat list */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {sorted.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No classes yet. Add one above.
          </Typography>
        )}
        {sorted.map((row) => (
          <Card
            key={row.id}
            variant="outlined"
            sx={{
              opacity: row.active ? 1 : 0.7,
              bgcolor: row.active ? "background.paper" : "action.hover",
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
                  {row.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {row.instructor.trim() ? row.instructor : "—"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.id} · order {row.sortOrder}
                </Typography>
              </Box>
              <Chip
                size="small"
                label={row.active ? "Active" : "Archived"}
                color={row.active ? "success" : "default"}
                variant={row.active ? "filled" : "outlined"}
              />
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleOpenEdit(row)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color={row.active ? "warning" : "success"}
                  onClick={() => handleToggleActive(row)}
                >
                  {row.active ? "Archive" : "Restore"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Add dialog */}
      <Dialog open={addOpen} onClose={handleCloseAdd} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmitAdd}>
          <DialogTitle>Add class</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
          >
            <TextField
              label="Class name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Instructor"
              value={formInstructor}
              onChange={(e) => setFormInstructor(e.target.value)}
              fullWidth
              helperText="Optional"
            />
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={handleCloseAdd}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!formName.trim()}
            >
              Add
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={!!editClass}
        onClose={handleCloseEdit}
        fullWidth
        maxWidth="sm"
      >
        <Box component="form" onSubmit={handleSubmitEdit}>
          <DialogTitle>Edit class</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
          >
            <Typography variant="caption" color="text.secondary">
              Catalog only. Attendance sessions already started keep their
              name/instructor snapshot.
            </Typography>
            <TextField
              label="Class name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Instructor"
              value={formInstructor}
              onChange={(e) => setFormInstructor(e.target.value)}
              fullWidth
            />
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
            <Button
              type="submit"
              variant="contained"
              disabled={!formName.trim()}
            >
              Save
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
