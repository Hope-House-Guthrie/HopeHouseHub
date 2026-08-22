/**
 * Walk-In Services — front-desk entry (FE mock)
 *
 * Unit counts only; no PII (RFBO check-in). Multi-service Record + reset.
 * Totals always derived from non-voided txns (Chicago day). Shared store key:
 * walkInServices — same kitchen_food_boxes as Kitchen Resources tab.
 *
 * STATUS (branch: walk-in-services) — leave 2026-08-16
 * DONE (FE mock): entry qty/confirm; Today + Undo; day/month/year report +
 * look-up + copy; kitchen tab entry/report (same slice).
 * NEXT: backend persist (multi-device, refresh-safe); 11pm CT auto-daily to
 * Frankie; optional who-recorded after Hub logins.
 * Rules: no PII; keep txn history (no cumulative-only counters).
 */

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  SERVICE_CATEGORIES,
  SERVICE_CATEGORIES_LABELS,
  emptyCounts,
  countsHaveAny,
  recordServices,
  undoLastTransaction,
  chicagoServiceDate,
  chicagoYearMonth,
  chicagoYear,
  sumTotalsForServiceDate,
  sumTotalsForServiceDatePrefix,
  type ServiceCategory,
} from "@/store/slices/prototype/walkInServices";

export default function WalkInServicesPage() {
  const dispatch = useAppDispatch();

  const transactions = useAppSelector(
    (state) => state.walkInServices.transactions,
  );
  const todayTotals = sumTotalsForServiceDate(transactions);
  const todayHasAny = countsHaveAny(todayTotals);
  const todayKey = chicagoServiceDate();
  // Phase 3: period totals (Chicago month/year buckets; non-voided only)
  const monthKey = chicagoYearMonth();
  const yearKey = chicagoYear();
  const monthTotals = sumTotalsForServiceDatePrefix(transactions, monthKey);
  const yearTotals = sumTotalsForServiceDatePrefix(transactions, yearKey);
  const monthHasAny = countsHaveAny(monthTotals);
  const yearHasAny = countsHaveAny(yearTotals);

  const [historyDay, setHistoryDay] = useState(() => chicagoServiceDate());
  // YYYY-MM — type="month" value shape
  const [historyMonth, setHistoryMonth] = useState(() => chicagoYearMonth());
  // YYYY string — keep as string for prefix sum
  const [historyYear, setHistoryYear] = useState(() => chicagoYear());

  // Phase 3B: historical day / month / year recall
  const historyDayTotals = sumTotalsForServiceDate(
    transactions,
    historyDay,
  );
  const historyDayHasAny = countsHaveAny(historyDayTotals);

  const historyMonthTotals = sumTotalsForServiceDatePrefix(
    transactions,
    historyMonth,
  );
  const historyMonthHasAny = countsHaveAny(historyMonthTotals);

  const historyYearTotals = sumTotalsForServiceDatePrefix(
    transactions,
    historyYear,
  );
  const historyYearHasAny = countsHaveAny(historyYearTotals);

  // Local draft only — becomes a transaction after confirm + Yes
  const [counts, setCounts] = useState<Record<ServiceCategory, number>>(
    () => emptyCounts()
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const adjust = (key: ServiceCategory, delta: number) => {
    setCounts((prev) => {
      const next = Math.max(0, (prev[key] ?? 0) + delta);
      return { ...prev, [key]: next };
    });
    setNotice(null);
    setError(null);
  };

  /** Whole numbers only; blank/invalid -> 0; never below 0. */
  const setQty = (key: ServiceCategory, raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === "") {
      setCounts((prev) => ({ ...prev, [key]: 0 }));
      setNotice(null);
      setError(null);
      return;
    }
    const n = Number.parseInt(trimmed, 10);
    const next = Number.isFinite(n) ? Math.max(0, n) : 0;
    setCounts((prev) => ({ ...prev, [key]: next }));
    setNotice(null);
    setError(null);
  };

  /** Close confirm without saving or resetting counters. */
  const handleCloseConfirm = () => {
    setConfirmOpen(false);
  };

  /**
   * Record Services press — open confirm only (do not save yet).
   * All-zero blocked here so the dialog never opens empty.
   */
  const handleRecordClick = () => {
    if (!countsHaveAny(counts)) {
      setError("Enter at least one service quantity before recording.");
      setNotice(null);
      return;
    }
    setError(null);
    setNotice(null);
    setConfirmOpen(true);
  };

  /** Confirm Yes — append txn, reset draft qty, close dialog. */
  const handleConfirmRecord = () => {
    if (!countsHaveAny(counts)) {
      setConfirmOpen(false);
      setError("Enter at least one service quantity before recording.");
      setNotice(null);
      return;
    }
    dispatch(recordServices({ counts }));
    setCounts(emptyCounts());
    setConfirmOpen(false);
    setError(null);
    setNotice("Services recorded. Counters reset for the next person.");
  };

  const handleUndoLast = () => {
    if (!todayHasAny) {
      setError("Nothing to undo for today.");
      setNotice(null);
      return;
    }
    dispatch(undoLastTransaction());
    setError(null);
    setNotice("Undid the last recorded services.");
  };

  /**
   * Paste format for house reports / chat:
   * Optional title line, then LABEL - N lines (fixed category order).
   * Day copy: includeZeros=true so all 8 categories appear.
   * Month/year copy: zeros omitted (house paste stays short).
   */
  const formatTotalsReport = (
    totals: Record<ServiceCategory, number>,
    options?: { title?: string; includeZeros?: boolean },
  ): string => {
    const lines: string[] = [];
    if (options?.title) {
      lines.push(options.title);
    }
    for (const key of SERVICE_CATEGORIES) {
      const n = totals[key] ?? 0;
      if (options?.includeZeros || (typeof n === "number" && n > 0)) {
        lines.push(`${SERVICE_CATEGORIES_LABELS[key]} - ${n}`);
      }
    }
    return lines.join("\n");
  };

  /** Copy day / month / year report text to clipboard. */
  const handleCopyReport = async (
    kind: "day" | "historyDay" | "historyMonth" | "historyYear" | "month" | "year",
  ): Promise<void> => {
    if (kind === "day") {
      if (!todayHasAny) {
        setError("Nothing to copy for today.");
        setNotice(null);
        return;
      }
      const text = formatTotalsReport(todayTotals, {
        title: `Walk-In Services — ${todayKey}`,
        includeZeros: true,
      });
      try {
        await navigator.clipboard.writeText(text);
        setError(null);
        setNotice(`Copied daily report (${todayKey}) to clipboard.`);
      } catch {
        setNotice(null);
        setError("Could not copy to clipboard. Check browser permission.");
      }
      return;
    }
    if (kind === "historyDay") {
      if (!historyDayHasAny) {
        setError(`Nothing to copy for ${historyDay}.`);
        setNotice(null);
        return;
      }
      const text = formatTotalsReport(historyDayTotals, {
        title: `Walk-In Services — ${historyDay}`,
        includeZeros: true,
      });
      try {
        await navigator.clipboard.writeText(text);
        setError(null);
        setNotice(`Copied day report (${historyDay}) to clipboard.`);
      } catch {
        setNotice(null);
        setError("Could not copy to clipboard. Check browser permission.");
      }
      return;
    }

    if (kind === "historyMonth") {
      if (!historyMonthHasAny) {
        setError(`Nothing to copy for ${historyMonth}.`);
        setNotice(null);
        return;
      }
      const text = formatTotalsReport(historyMonthTotals, {
        title: `Walk-In Services — ${historyMonth}`,
      });
      try {
        await navigator.clipboard.writeText(text);
        setError(null);
        setNotice(`Copied month report (${historyMonth}) to clipboard.`);
      } catch {
        setNotice(null);
        setError("Could not copy to clipboard. Check browser permission.");
      }
      return;
    }

    if (kind === "historyYear") {
      if (!historyYearHasAny) {
        setError(`Nothing to copy for ${historyYear}.`);
        setNotice(null);
        return;
      }
      const text = formatTotalsReport(historyYearTotals, {
        title: `Walk-In Services — ${historyYear}`,
      });
      try {
        await navigator.clipboard.writeText(text);
        setError(null);
        setNotice(`Copied year report (${historyYear}) to clipboard.`);
      } catch {
        setNotice(null);
        setError("Could not copy to clipboard. Check browser permission.");
      }
      return;
    }

    const hasAny = kind === "month" ? monthHasAny : yearHasAny;
    const totals = kind === "month" ? monthTotals : yearTotals;
    const label = kind === "month" ? `month ${monthKey}` : `year ${yearKey}`;
    const title =
      kind === "month"
        ? `Walk-In Services — ${monthKey}`
        : `Walk-In Services — ${yearKey}`;

    if (!hasAny) {
      setError(`Nothing to copy for ${label}.`);
      setNotice(null);
      return;
    }

    const text = formatTotalsReport(totals, { title });
    try {
      await navigator.clipboard.writeText(text);
      setError(null);
      setNotice(`Copied ${label} report to clipboard.`);
    } catch {
      setNotice(null);
      setError("Could not copy to clipboard. Check browser permission.");
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 640 }}>
      <Typography variant="h4" gutterBottom>
        Walk-In Services
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enter how many of each service was provided. No client name needed.
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {notice && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      {/* Today running totals (derived from non-voided txns) */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Today ({todayKey})
          </Typography>
          {!todayHasAny ? (
            <Typography variant="subtitle2" color="text.secondary">
              No services recorded yet today.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {SERVICE_CATEGORIES.map((key) => {
                const n = todayTotals[key];
                if (!n) return null;
                return (
                  <Typography key={key} variant="subtitle2">
                    {SERVICE_CATEGORIES_LABELS[key]} - {n}
                  </Typography>
                );
              })}
            </Box>
          )}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 1,
              mt: 1.5,
            }}
          >
            <Button
              type="button"
              variant="outlined"
              size="small"
              disabled={!todayHasAny}
              onClick={() => {
                void handleCopyReport("day");
              }}
            >
              Copy daily report
            </Button>
            <Button
              type="button"
              variant="outlined"
              color="warning"
              size="small"
              disabled={!todayHasAny}
              onClick={handleUndoLast}
            >
              Undo last
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Phase 3: Month / Year report (derived from non-voided txns) */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Report
          </Typography>

          {/* Phase 3B: look up one past day */}
          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            Look up day
          </Typography>
          <TextField
            type="date"
            size="small"
            label="Service date"
            value={historyDay}
            onChange={(e) => {
              setHistoryDay(e.target.value);
              setError(null);
              setNotice(null);
            }}
            slotProps={{
              inputLabel: { shrink: true },
            }}
            sx={{ mt: 1, mb: 1, maxWidth: 220 }}
          />
          {!historyDayHasAny ? (
            <Typography variant="subtitle2" color="text.secondary">
              No services recorded for {historyDay || "that day"}.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {SERVICE_CATEGORIES.map((key) => {
                const n = historyDayTotals[key];
                if (!n) return null;
                return (
                  <Typography key={`history-day-${key}`} variant="subtitle2">
                    {SERVICE_CATEGORIES_LABELS[key]} - {n}
                  </Typography>
                );
              })}
            </Box>
          )}
          <Button
            type="button"
            variant="outlined"
            size="small"
            disabled={!historyDayHasAny}
            onClick={() => {
              void handleCopyReport("historyDay");
            }}
            sx={{ mt: 1, mb: 1 }}
          >
            Copy day report
          </Button>

          {/* Phase 3B: look up a past month */}
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Look up month
          </Typography>
          <TextField
            type="month"
            size="small"
            label="Service month"
            value={historyMonth}
            onChange={(e) => {
              setHistoryMonth(e.target.value);
              setError(null);
              setNotice(null);
            }}
            slotProps={{
              inputLabel: { shrink: true },
            }}
            sx={{ mt: 1, mb: 1, maxWidth: 220 }}
          />
          {!historyMonthHasAny ? (
            <Typography variant="subtitle2" color="text.secondary">
              No services recorded for {historyMonth || "that month"}.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {SERVICE_CATEGORIES.map((key) => {
                const n = historyMonthTotals[key];
                if (!n) return null;
                return (
                  <Typography key={`history-month-${key}`} variant="subtitle2">
                    {SERVICE_CATEGORIES_LABELS[key]} - {n}
                  </Typography>
                );
              })}
            </Box>
          )}
          <Button
            type="button"
            variant="outlined"
            size="small"
            disabled={!historyMonthHasAny}
            onClick={() => {
              void handleCopyReport("historyMonth");
            }}
            sx={{ mt: 1, mb: 1 }}
          >
            Copy looked-up month
          </Button>

          {/* Phase 3B: look up a past year */}
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Look up year
          </Typography>
          <TextField
            type="number"
            size="small"
            label="Service year"
            value={historyYear}
            onChange={(e) => {
              setHistoryYear(e.target.value.trim());
              setError(null);
              setNotice(null);
            }}
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { min: 2000, max: 2100, step: 1 },
            }}
            sx={{ mt: 1, mb: 1, maxWidth: 220 }}
          />
          {!historyYearHasAny ? (
            <Typography variant="subtitle2" color="text.secondary">
              No services recorded for {historyYear || "that year"}.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {SERVICE_CATEGORIES.map((key) => {
                const n = historyYearTotals[key];
                if (!n) return null;
                return (
                  <Typography key={`history-year-${key}`} variant="subtitle2">
                    {SERVICE_CATEGORIES_LABELS[key]} - {n}
                  </Typography>
                );
              })}
            </Box>
          )}
          <Button
            type="button"
            variant="outlined"
            size="small"
            disabled={!historyYearHasAny}
            onClick={() => {
              void handleCopyReport("historyYear");
            }}
            sx={{ mt: 1, mb: 1 }}
          >
            Copy looked-up year
          </Button>

          {/* This month */}
          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            This month ({monthKey})
          </Typography>
          {!monthHasAny ? (
            <Typography variant="subtitle2" color="text.secondary">
              No services recorded this month.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {SERVICE_CATEGORIES.map((key) => {
                const n = monthTotals[key];
                if (!n) return null;
                return (
                  <Typography key={`month-${key}`} variant="subtitle2">
                    {SERVICE_CATEGORIES_LABELS[key]} - {n}
                  </Typography>
                );
              })}
            </Box>
          )}

          {/* This year */}
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            This year ({yearKey})
          </Typography>
          {!yearHasAny ? (
            <Typography variant="subtitle2" color="text.secondary">
              No services recorded this year.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {SERVICE_CATEGORIES.map((key) => {
                const n = yearTotals[key];
                if (!n) return null;
                return (
                  <Typography key={`year-${key}`} variant="subtitle2">
                    {SERVICE_CATEGORIES_LABELS[key]} - {n}
                  </Typography>
                );
              })}
            </Box>
          )}

          {/* Copy Report — paste lines like WALK-IN MEALS - 3 */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 1,
              mt: 2,
            }}
          >
            <Button
              type="button"
              variant="outlined"
              size="small"
              disabled={!monthHasAny}
              onClick={() => {
                void handleCopyReport("month");
              }}
            >
              Copy month report
            </Button>
            <Button
              type="button"
              variant="outlined"
              size="small"
              disabled={!yearHasAny}
              onClick={() => {
                void handleCopyReport("year");
              }}
            >
              Copy year report
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Service counter list */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {SERVICE_CATEGORIES.map((key) => (
              <Box
                key={key}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  py: 0.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-child": { borderBottom: "none" },
                }}
              >
                <Typography variant="body1" sx={{ pr: 2, flex: 1 }}>
                  {SERVICE_CATEGORIES_LABELS[key]}
                </Typography>

                {/* - qty + (filled colors; qty editable) */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <IconButton
                    aria-label={`Decrease ${SERVICE_CATEGORIES_LABELS[key]}`}
                    color="error"
                    size="medium"
                    onClick={() => adjust(key, -1)}
                    disabled={counts[key] <= 0}
                    sx={{
                      bgcolor: "error.main",
                      color: "error.contrastText",
                      "&:hover": { bgcolor: "error.dark" },
                      "&.Mui-disabled": {
                        bgcolor: "action.disabledBackground",
                        color: "action.disabled",
                      },
                    }}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <TextField
                    aria-label={`Quantity ${SERVICE_CATEGORIES_LABELS[key]}`}
                    size="small"
                    value={counts[key]}
                    onChange={(e) => setQty(key, e.target.value)}
                    slotProps={{
                      htmlInput: {
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                        style: { textAlign: "center" },
                      },
                    }}
                    sx={{ width: 56 }}
                  />
                  <IconButton
                    aria-label={`Increase ${SERVICE_CATEGORIES_LABELS[key]}`}
                    color="success"
                    size="medium"
                    onClick={() => adjust(key, 1)}
                    sx={{
                      bgcolor: "success.main",
                      color: "success.contrastText",
                      "&:hover": { bgcolor: "success.dark" },
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={handleRecordClick}
      >
        Record Services
      </Button>

      {/* Confirm before save — Enter = Yes; Go back leaves counters alone */}
      <Dialog
        open={confirmOpen}
        onClose={handleCloseConfirm}
        fullWidth
        maxWidth="sm"
        aria-labelledby="walk-in-confirm-title"
      >
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleConfirmRecord();
          }}
        >
          <DialogTitle id="walk-in-confirm-title" sx={{ pb: 1 }}>
            Are these the correct numbers?
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                py: 1,
              }}
            >
              {SERVICE_CATEGORIES.map((key) => {
                const n = counts[key] ?? 0;
                if (n <= 0) return null;
                return (
                  <Box
                    key={key}
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Typography variant="h6">
                      {SERVICE_CATEGORIES_LABELS[key]}
                    </Typography>
                    <Typography variant="h6" sx={{ minWidth: 40, textAlign: "right" }}>
                      {n}
                    </Typography>
                  </Box>
                );
              })}
              <Typography
                variant="subtitle1"
                sx={{ mt: 2, fontWeight: 700 }}
              >
                Total Service Units:{" "}
                {SERVICE_CATEGORIES.reduce(
                  (sum, key) => sum + (counts[key] > 0 ? counts[key] : 0),
                  0,
                )}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions
            sx={{
              px: 3,
              pb: 2,
              gap: 1,
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            <Button
              type="button"
              variant="outlined"
              size="large"
              onClick={handleCloseConfirm}
            >
              Go back / Edit
            </Button>
            <Button type="submit" variant="contained" size="large" color="primary">
              Yes, record services
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
