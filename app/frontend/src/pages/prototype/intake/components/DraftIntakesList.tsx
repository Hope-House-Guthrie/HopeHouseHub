/**
 * Draft Intakes tab list (presentation only).
 *
 * Renders draft records supplied by the page. Does not own draft state,
 * load form fields, or implement save/complete — Open Intake calls back
 * into index.tsx workflow handlers.
 */

import { Button, Paper, Typography } from "@mui/material";

import type { IntakeDraft } from "../types/intake";

interface DraftIntakesListProps {
  drafts: IntakeDraft[];
  onOpenDraft: (draft: IntakeDraft) => void;
}

export default function DraftIntakesList({
  drafts,
  onOpenDraft,
}: DraftIntakesListProps) {
  return (
    <Paper sx={{ mt: 2, p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Draft Intakes
      </Typography>

      {drafts.length === 0 && (
        <Typography sx={{ mt: 1 }}>No draft intakes.</Typography>
      )}

      {drafts.map((draft) => (
        <Paper key={draft.id} variant="outlined" sx={{ mt: 2, p: 3 }}>
          <Typography sx={{ fontWeight: 600 }}>
            {draft.clientName || "Unnamed Client"}
          </Typography>

          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "#364B70" }}
          >
            DRAFT
          </Typography>

          <Typography variant="body2">
            Program:{" "}
            {draft.formData.clientProgram === "OVN"
              ? "Overnight Program (OVN)"
              : draft.formData.clientProgram === "LTP"
                ? "Life Transformation Program (LTP)"
                : draft.formData.clientProgram === "TEMP"
                  ? "Emergency Temporary Shelter (TEMP)"
                  : "Not assigned"}
          </Typography>

          <Typography variant="body2">
            Started By: {draft.startedBy}
          </Typography>

          <Typography variant="body2">
            Intake Date:{" "}
            {draft.intakeDate
              ? new Date(`${draft.intakeDate}T00:00:00`)
                  .toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                  })
                  .replaceAll("/", "-")
              : "Not entered"}
          </Typography>

          <Typography variant="body2">
            HMIS #: {draft.formData.hmisNumber || "Pending"}
          </Typography>

          <Typography variant="body2">
            Last Updated By: {draft.lastUpdatedBy}
          </Typography>

          <Typography variant="body2">
            Last Updated: {draft.lastUpdated}
          </Typography>

          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => onOpenDraft(draft)}
          >
            Open Intake
          </Button>
        </Paper>
      ))}
    </Paper>
  );
}
