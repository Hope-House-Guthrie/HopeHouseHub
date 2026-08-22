/**
 * Pending Incident Reports
 *
 * Lists mock-submitted reports that are not yet complete/closed.
 * Staff can resume editing, mark complete, or close/archive.
 *
 * BACKEND TODO: load pending from API; real authorization on complete/close
 */
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

import type { RootState } from "../../../store";
import {
  archiveReport,
  completeReportById,
  resumeReport,
  type IncidentReport,
} from "../../../store/slices/prototype/incidentReports";
import IncidentReportsNav from "./IncidentReportsNav";

/** Human-readable status for the table */
function statusLabel(report: IncidentReport): string {
  switch (report.status) {
    case "awaitingSignature":
      return "Awaiting Client Signature";
    case "awaitingAdmin":
      return "Awaiting Admin Signature";
    case "followUpNeeded":
      return "Follow-Up Needed";
    case "draft":
      return "Draft / Incomplete";
    case "pending":
    default:
      return "Report Incomplete";
  }
}

/** Client names as a short comma list */
function clientNames(report: IncidentReport): string {
  const names = report.clients
    .map((c) => [c.firstName, c.lastName].filter(Boolean).join(" ").trim())
    .filter(Boolean);
  return names.length ? names.join(", ") : "—";
}

/** Still open on the Pending board (not finished history rows) */
const PENDING_STATUSES = new Set([
  "pending",
  "awaitingSignature",
  "awaitingAdmin",
  "draft",
]);

export default function IncidentReportsPendingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reports = useSelector((s: RootState) => s.incidentReports.reports);

  const pending = reports.filter((r) => PENDING_STATUSES.has(r.status));

  const handleResume = (id: string) => {
    dispatch(resumeReport(id));
    navigate("/incident-reports");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Pending Incident Reports
      </Typography>
      <IncidentReportsNav />

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Submitted reports waiting on signatures or more information. Mock data only —
        refresh clears Redux.
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Incident #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Client(s)</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pending.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary">
                    No pending reports. Submit one from New Report to see it here.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              pending.map((report) => (
                <TableRow key={report.id} hover>
                  <TableCell>{report.incidentNumber}</TableCell>
                  <TableCell>{report.date || "—"}</TableCell>
                  <TableCell>{clientNames(report)}</TableCell>
                  <TableCell>{report.incidentType}</TableCell>
                  <TableCell>
                    <Chip size="small" label={statusLabel(report)} />
                  </TableCell>
                  <TableCell align="right">
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "flex-end",
                        flexWrap: "wrap",
                      }}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleResume(report.id)}
                      >
                        Open / Finish
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => dispatch(completeReportById(report.id))}
                      >
                        Mark Complete
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => dispatch(archiveReport(report.id))}
                      >
                        Close
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
