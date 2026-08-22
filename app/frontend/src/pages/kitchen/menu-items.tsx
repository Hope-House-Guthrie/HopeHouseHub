import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  CircularProgress,
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import {
  useGetMenuItemsQuery,
  useAddMenuItemMutation,
  useUpdateMenuItemMutation,
  useRemoveMenuItemMutation,
  type MenuItemCategory,
} from "@/store/slices/kitchen/menu-items";
import { type MenuItemResource } from "@/lib/api";
import { SearchAddBar } from "@/components/kitchen/search-add-bar";

const toTitleCase = (s: string) =>
  s
    .trim()
    .split(/\s+/)
    .map((w) => (w[0] ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");

export default function MenuItemsPage() {
  const { data: menuItems = [], isLoading } = useGetMenuItemsQuery();
  const [addMenuItem, { isLoading: isAdding }] = useAddMenuItemMutation();
  const [updateMenuItem] = useUpdateMenuItemMutation();
  const [removeMenuItem] = useRemoveMenuItemMutation();

  const [search, setSearch] = useState("");
  const [newCategory, setNewCategory] = useState<MenuItemCategory>("other");
  const [categoryFilter, setCategoryFilter] = useState<MenuItemCategory | "all">("all");

  const [editItem, setEditItem] = useState<MenuItemResource | null>(null);
  const [editName, setEditName] = useState("");

  const q = search.trim().toLowerCase();
  const visibleItems = menuItems.filter((item) => {
    const matchesSearch = !q || item.name.toLowerCase().includes(q);
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const exactExists = q.length > 0 && menuItems.some((item) => item.name.toLowerCase() === q);
  const canAddNew = q.length > 0 && !exactExists;

  const handleAdd = async (rawName: string) => {
    const name = toTitleCase(rawName);
    if (!name) return;
    await addMenuItem({ name, category: newCategory }).unwrap();
    setSearch("");
    setNewCategory("other");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      await removeMenuItem(id).unwrap();
    }
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    const name = toTitleCase(editName);
    if (name) {
      await updateMenuItem({ id: editItem.id, name }).unwrap();
    }
    setEditItem(null);
  };

  if (isLoading) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1">
        Menu Items Library
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        Library has {menuItems.length} item(s).
      </Typography>

      <SearchAddBar
        label="Search or add menu item"
        searchQuery={search}
        onSearchChange={setSearch}
        canAdd={canAddNew}
        onAdd={handleAdd}
        isLoading={isAdding}
        renderExtraFields={() => (
          <>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                label="Category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as MenuItemCategory)}
              >
                <MuiMenuItem value="main">Main</MuiMenuItem>
                <MuiMenuItem value="side">Side</MuiMenuItem>
                <MuiMenuItem value="salad">Salad</MuiMenuItem>
                <MuiMenuItem value="bread">Bread</MuiMenuItem>
                <MuiMenuItem value="other">Other</MuiMenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="category-filter-label">Filter</InputLabel>
              <Select
                labelId="category-filter-label"
                label="Filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as MenuItemCategory | "all")}
              >
                <MuiMenuItem value="all">All categories</MuiMenuItem>
                <MuiMenuItem value="main">Main</MuiMenuItem>
                <MuiMenuItem value="side">Side</MuiMenuItem>
                <MuiMenuItem value="salad">Salad</MuiMenuItem>
                <MuiMenuItem value="bread">Bread</MuiMenuItem>
                <MuiMenuItem value="other">Other</MuiMenuItem>
              </Select>
            </FormControl>
          </>
        )}
      />

      <Box sx={{ mt: 2, maxWidth: 720 }}>
        {visibleItems.map((item) => (
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
            <Typography>
              {item.name}{" "}
              <Typography component="span" color="text.secondary" variant="body2">
                ({item.category})
              </Typography>
            </Typography>
            <Box>
              <IconButton color="primary" size="small" onClick={() => { setEditItem(item); setEditName(item.name); }}>
                <EditIcon />
              </IconButton>
              <IconButton color="error" size="small" onClick={() => handleDelete(item.id)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onClose={() => setEditItem(null)} maxWidth="xs">
        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
          <DialogTitle>Edit Menu Item</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Item name"
              fullWidth
              size="small"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditItem(null)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}