/**
 * Incident History
 *
 * Completed, follow-up-needed, and closed/archived mock reports.
 * Search/filter is client-side only for now.
 *
 * BACKEND TODO: server search, paging, open full read-only report
 */
import { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  MenuItem,
  Grid,
} from "@mui/material";
import { useSelector } from "react-redux";

import type { RootState } from "../../../store";
import {
  type IncidentReport,
  type IncidentType,
} from "../../../store/slices/prototype/incidentReports";
import IncidentReportsNav from "./IncidentReportsNav";

function statusLabel(status: IncidentReport["status"]): string {
  switch (status) {
    case "complete":
      return "Complete";
    case "closed":
      return "Closed";
    case "followUpNeeded":
      return "Follow-Up Needed";
    default:
      return status;
  }
}

function clientNames(report: IncidentReport): string {
  const names = report.clients
    .map((c) => [c.firstName, c.lastName].filter(Boolean).join(" ").trim())
    .filter(Boolean);
  return names.length ? names.join(", ") : "—";
}

const HISTORY_STATUSES = new Set(["complete", "closed", "followUpNeeded"]);

const TYPE_OPTIONS: Array<IncidentType | "All"> = [
  "All",
  "Injury",
  "Client Conflict",
  "Rule / Policy Violation",
  "Property Damage",
  "Medical",
  "Behavioral",
  "Safety / Security",
  "Accident",
  "Other",
];

export default function IncidentReportsHistoryPage() {
  const reports = useSelector((s: RootState) => s.incidentReports.reports);
  const archived = useSelector((s: RootState) => s.incidentReports.archivedReports);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<IncidentType | "All">("All");

  // Active list rows marked complete/follow-up + fully archived/closed
  const historyRows = useMemo(() => {
    const fromActive = reports.filter((r) => HISTORY_STATUSES.has(r.status));
    const combined = [...fromActive, ...archived];
    // Newest-ish first by incident number string is weak; prefer submittedAt
    combined.sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
    return combined;
  }, [reports, archived]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return historyRows.filter((r) => {
      if (typeFilter !== "All" && r.incidentType !== typeFilter) return false;
      if (!q) return true;
      const hay = [
        r.incidentNumber,
        r.date,
        r.incidentType,
        r.status,
        clientNames(r),
        r.location,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [historyRows, query, typeFilter]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Incident History
      </Typography>
      <IncidentReportsNav />

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Completed and closed reports. Mock only — lost on full page refresh.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Search"
            placeholder="Incident #, client, type..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Incident Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as IncidentType | "All")}
          >
            {TYPE_OPTIONS.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Incident #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Client(s)</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary">
                    No history yet. Mark a pending report Complete or Close to see it here.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((report) => (
                <TableRow key={report.id} hover>
                  <TableCell>{report.incidentNumber}</TableCell>
                  <TableCell>{report.date || "—"}</TableCell>
                  <TableCell>{clientNames(report)}</TableCell>
                  <TableCell>{report.incidentType}</TableCell>
                  <TableCell>
                    <Chip size="small" label={statusLabel(report.status)} />
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
