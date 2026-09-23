/**
 * Completed Intakes tab list (presentation only).
 *
 * Renders completed records supplied by the page. Does not own completed
 * state, change reviewStatus, load form fields, or run complete/edit
 * workflows — open actions call back into index.tsx.
 */

import { Button, Paper, Typography } from "@mui/material";

import type { CompletedIntake } from "../types/intake";

interface CompletedIntakesListProps {
  intakes: CompletedIntake[];
  onOpenIntake: (intake: CompletedIntake) => void;
}

export default function CompletedIntakesList({
  intakes,
  onOpenIntake,
}: CompletedIntakesListProps) {
  return (
    <Paper sx={{ mt: 2, p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Completed Intakes
      </Typography>

      {intakes.length === 0 && (
        <Typography sx={{ mt: 1 }}>No completed intakes.</Typography>
      )}

      {intakes.map((intake) => (
        <Paper key={intake.id} variant="outlined" sx={{ mt: 2, p: 3 }}>
          <Typography sx={{ fontWeight: 600 }}>
            {intake.clientName || "Unnamed Client"}

            <Typography variant="body2">
              Hope House #: {intake.hopeHouseNumber}
            </Typography>

            <Typography variant="body2">
              Program:{" "}
              {intake.formData.clientProgram === "OVN"
                ? "Overnight Program (OVN)"
                : intake.formData.clientProgram === "LTP"
                  ? "Life Transformation Program (LTP)"
                  : intake.formData.clientProgram === "TEMP"
                    ? "Emergency Temporary Shelter (TEMP)"
                    : "Not assigned"}
            </Typography>

            <Typography variant="body2">
              Intake Date:{" "}
              {intake.intakeDate
                ? new Date(`${intake.intakeDate}T00:00:00`)
                    .toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric",
                    })
                    .replaceAll("/", "-")
                : "Not entered"}
            </Typography>

            <Typography variant="body2">
              HMIS #: {intake.formData.hmisNumber || "Pending"}
            </Typography>

            <Typography variant="body2">
              Started By: {intake.startedBy}
            </Typography>

            <Typography variant="body2">
              Completed By: {intake.completedBy}
            </Typography>

            <Typography variant="body2">
              Review Status: {intake.reviewStatus}
            </Typography>

            {intake.reviewedBy && (
              <Typography variant="body2">
                Reviewed By: {intake.reviewedBy}
              </Typography>
            )}

            {intake.reviewedAt && (
              <Typography variant="body2">
                Reviewed: {new Date(intake.reviewedAt).toLocaleString()}
              </Typography>
            )}

            {intake.lastEditedBy && (
              <Typography variant="body2">
                Last Edited By: {intake.lastEditedBy}
              </Typography>
            )}

            {intake.lastEditedAt && (
              <Typography variant="body2">
                Last Edited:{" "}
                {new Date(intake.lastEditedAt).toLocaleString()}
              </Typography>
            )}

            <Typography variant="body2">
              Completed: {new Date(intake.completedAt).toLocaleString()}
            </Typography>

            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => onOpenIntake(intake)}
            >
              {intake.reviewStatus === "Review Complete"
                ? "View Intake"
                : "Open for Review"}
            </Button>
          </Typography>
        </Paper>
      ))}
    </Paper>
  );
}
