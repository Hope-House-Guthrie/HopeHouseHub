/**
 * Left-side section navigation for Client Intake.
 *
 * Renders section labels/order from intakeSections. Does not own form state
 * or draft/completed workflow — only reports section selection to the page.
 */

import { List, ListItemButton, ListItemText, Paper } from "@mui/material";

import { intakeSections } from "../constants/intakeSections";

interface IntakeSectionNavProps {
  activeSectionId: string;
  onSectionChange: (sectionId: string) => void;
}

export default function IntakeSectionNav({
  activeSectionId,
  onSectionChange,
}: IntakeSectionNavProps) {
  return (
    <Paper sx={{ mb: 3, p: 1 }}>
      <List disablePadding>
        {intakeSections.map((section) => (
          <ListItemButton
            key={section.id}
            selected={activeSectionId === section.id}
            onClick={() => onSectionChange(section.id)}
            sx={{
              "&.Mui-selected": {
                backgroundColor: "#0072BC",
                color: "white",
              },
            }}
          >
            <ListItemText primary={section.label} />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
}
