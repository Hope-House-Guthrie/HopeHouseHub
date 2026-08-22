import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Autocomplete,
  TextField,
  Chip,
  CircularProgress,
  createFilterOptions,
} from "@mui/material";
import {
  useGetMealByMealQuery,
  useUpdateMealMutation,
  useClearMealMutation,
  type MealKey,
} from "@/store/slices/kitchen/meals";
import {
  useGetMenuItemsQuery,
  useAddMenuItemMutation,
  type MenuItemCategory,
} from "@/store/slices/kitchen/menu-items";
import { type MenuItemResource } from "@/lib/api";

const filter = createFilterOptions<MenuItemResource | { inputValue: string; name: string }>();

interface MealEditorProps {
  mealKey: MealKey;
  title: string;
  allMenuItems: MenuItemResource[];
  onAddMenuItem: (name: string) => Promise<MenuItemResource>;
}

function MealEditor({ mealKey, title, allMenuItems, onAddMenuItem }: MealEditorProps) {
  const { data: meal, isLoading } = useGetMealByMealQuery(mealKey);
  const [updateMeal] = useUpdateMealMutation();
  const [clearMeal] = useClearMealMutation();
  const [selectedOption, setSelectedOption] = useState<any>(null);

  if (isLoading) return <CircularProgress size={24} />;

  // Get current list of string IDs from the meal object (defaults to empty array if unset)
  const currentItemIds: string[] = meal?.itemIds ?? [];

  // Map itemIds to full MenuItem objects for rendering chip labels
  const currentItems = currentItemIds
    .map((id) => allMenuItems.find((item) => item.id === id))
    .filter((item): item is MenuItemResource => Boolean(item));

  const handleAddItem = async (option: any) => {
    if (!option) return;
    let itemToAttach: MenuItemResource;

    if (typeof option === "string") {
      itemToAttach = await onAddMenuItem(option);
    } else if (option.inputValue) {
      itemToAttach = await onAddMenuItem(option.inputValue);
    } else {
      itemToAttach = option;
    }

    if (!currentItemIds.includes(itemToAttach.id)) {
      const updatedItemIds = [...currentItemIds, itemToAttach.id];
      await updateMeal({
        meal: mealKey,
        data: { itemIds: updatedItemIds },
      }).unwrap();
    }
    setSelectedOption(null);
  };

  const handleRemoveItem = async (itemIdToRemove: string) => {
    const updatedItemIds = currentItemIds.filter((id) => id !== itemIdToRemove);
    await updateMeal({
      meal: mealKey,
      data: { itemIds: updatedItemIds },
    }).unwrap();
  };

  return (
    <Card variant="outlined" sx={{ mb: 3, maxWidth: 640 }}>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 1.5 }}>
          {title}
        </Typography>

        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Autocomplete
            value={selectedOption}
            onChange={(_e, newValue) => {
              setSelectedOption(newValue);
              if (newValue) handleAddItem(newValue);
            }}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);
              const { inputValue } = params;
              const exists = options.some(
                (option) => inputValue.toLowerCase() === option.name.toLowerCase()
              );

              if (inputValue !== "" && !exists) {
                filtered.push({
                  inputValue,
                  name: `Add "${inputValue}" to Library`,
                });
              }
              return filtered;
            }}
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            options={allMenuItems}
            getOptionLabel={(option) => {
              if (typeof option === "string") return option;
              if (option.inputValue) return option.inputValue;
              return option.name;
            }}
            renderOption={(props, option) => (
              <li {...props} key={option.id || option.name}>
                {option.name}
              </li>
            )}
            sx={{ flex: 1 }}
            size="small"
            renderInput={(params) => (
              <TextField {...params} label="Search or create menu item..." />
            )}
          />
          <Button
            variant="outlined"
            color="error"
            onClick={() => clearMeal(mealKey)}
            disabled={!currentItemIds.length}
          >
            Clear
          </Button>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {currentItems.length === 0 ? (
            <Typography color="text.secondary">No items set for this meal.</Typography>
          ) : (
            currentItems.map((item) => (
              <Chip
                key={item.id}
                label={item.name}
                onDelete={() => handleRemoveItem(item.id)}
              />
            ))
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function MealsPage() {
  const { data: menuItems = [] } = useGetMenuItemsQuery();
  const [addMenuItem] = useAddMenuItemMutation();

  const handleAddMenuItem = async (name: string): Promise<MenuItemResource> => {
    return await addMenuItem({ name, category: "other" as MenuItemCategory }).unwrap();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Meals Configuration
      </Typography>
      <MealEditor mealKey="breakfast" title="Breakfast" allMenuItems={menuItems} onAddMenuItem={handleAddMenuItem} />
      <MealEditor mealKey="lunch" title="Lunch" allMenuItems={menuItems} onAddMenuItem={handleAddMenuItem} />
      <MealEditor mealKey="dinner" title="Dinner" allMenuItems={menuItems} onAddMenuItem={handleAddMenuItem} />
    </Box>
  );
}