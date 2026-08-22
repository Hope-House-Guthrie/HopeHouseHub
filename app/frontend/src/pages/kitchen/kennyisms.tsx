import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import {
  useGetKennyismsQuery,
  useAddKennyismMutation,
  useRemoveKennyismMutation,
} from "@/store/slices/kitchen/kennyisms";
import { SearchAddBar } from "@/components/kitchen/search-add-bar";

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

export default function KennyismsPage() {
  const { data: kennyisms = [], isLoading } = useGetKennyismsQuery();
  const [addKennyism, { isLoading: isAdding }] = useAddKennyismMutation();
  const [removeKennyism] = useRemoveKennyismMutation();

  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const cleanedDraft = cleanAffirmation(search);

  const visibleKennyisms = q
    ? kennyisms.filter((k) => k.text.toLowerCase().includes(q))
    : kennyisms;

  const exactExists =
    q.length > 0 &&
    !!cleanedDraft &&
    kennyisms.some((k) => k.text.toLowerCase() === cleanedDraft.toLowerCase());

  const canAdd = q.length > 0 && !!cleanedDraft && !exactExists;

  const handleAdd = async (rawText: string) => {
    const text = cleanAffirmation(rawText);
    if (!text) return;
    await addKennyism({ text }).unwrap();
    setSearch("");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this affirmation?")) {
      await removeKennyism(id).unwrap();
    }
  };

  if (isLoading) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1">
        Daily Affirmations (Kennyisms)
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        Library has {kennyisms.length} affirmation(s).
      </Typography>

      <SearchAddBar
        label="Search or add affirmation"
        searchQuery={search}
        onSearchChange={setSearch}
        canAdd={canAdd}
        onAdd={handleAdd}
        isLoading={isAdding}
      />

      <Box sx={{ mt: 2, maxWidth: 720 }}>
        {visibleKennyisms.map((k) => (
          <Box
            key={k.id}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 1,
              borderBottom: "1px solid rgba(0,0,0,0.1)",
            }}
          >
            <Typography>{k.text}</Typography>
            <IconButton color="error" size="small" onClick={() => handleDelete(k.id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
  );
}