import { useState, type FormEvent } from "react";
import { Box, Button, TextField } from "@mui/material";

interface SearchAddBarProps {
  label: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  canAdd: boolean;
  onAdd: (value: string) => void;
  isLoading?: boolean;
  renderExtraFields?: () => React.ReactNode;
}

export function SearchAddBar({
  label,
  searchQuery,
  onSearchChange,
  canAdd,
  onAdd,
  isLoading = false,
  renderExtraFields,
}: SearchAddBarProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (canAdd && searchQuery.trim()) {
      onAdd(searchQuery.trim());
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        gap: 1,
        mt: 2,
        mb: 2,
        maxWidth: 720,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <TextField
        label={label}
        size="medium"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ flex: "1 1 220px", minWidth: 200 }}
      />
      {renderExtraFields?.()}
      {canAdd && (
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          sx={{ whiteSpace: "nowrap" }}
        >
          Add Item
        </Button>
      )}
    </Box>
  );
}