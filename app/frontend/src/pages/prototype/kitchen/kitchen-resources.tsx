/**
 * Kitchen Resources Page
 * Combined view for birthdays, dietary needs, and staff notes
 */

import { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  IconButton,
  TextField,
  Button,
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  chicagoServiceDate,
  chicagoYearMonth,
  chicagoYear,
  recordServices,
  sumTotalsForServiceDate,
  undoLastTransaction,
  sumTotalsForServiceDatePrefix,
} from "@/store/slices/prototype/walkInServices";

// Birthday Calendar Component
function BirthdayCalendar() {
  const { residents } = useAppSelector((state) => state.residents);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();

  const birthdaysInMonth = residents.filter((r) => {
    const birthDate = new Date(r.birthday);
    return birthDate.getMonth() === month;
  });

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <button onClick={handlePrevMonth}>‹</button>
        <Typography variant="h5" component="h2">
          {currentMonth.toLocaleString("default", { month: "long" })}{" "}
          {year} Birthday Calendar
        </Typography>
        <button onClick={handleNextMonth}>›</button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 1,
        }}
      >
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
          (day) => (
            <Typography
              key={day}
              variant="subtitle2"
              sx={{ fontWeight: "bold", textAlign: "center" }}
            >
              {day}
            </Typography>
          )
        )}

        {/* Empty cells before month starts */}
        {Array.from(
          { length: new Date(year, month, 1).getDay() },
          (_, i) => (
            <Box
              key={`empty-${i}`}
              sx={{
                height: 60,
                border: "1px solid #e0e0e0",
                borderRadius: 1,
              }}
            />
          )
        )}

        {/* Calendar days */}
        {Array.from({ length: daysInMonth }, (_, day) => {
          const dayNum = day + 1;
          const residentWithBirthday = birthdaysInMonth.find((r) => {
            const bDate = new Date(r.birthday);
            return bDate.getDate() === dayNum;
          });

          const isToday = todayMonth === month && todayDay === dayNum;

          return (
            <Box
              key={dayNum}
              sx={{
                height: 60,
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                p: 1,
                position: "relative",
                bgcolor: isToday ? "primary.light" : "background.paper",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                {dayNum}
              </Typography>
              {residentWithBirthday && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 20,
                    left: 2,
                    right: 2,
                    overflow: "hidden",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "10px",
                      color: "primary.main",
                      display: "block",
                      textAlign: "center",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {residentWithBirthday.name}
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      <Typography variant="body2" sx={{ mt: 2 }}>
        {birthdaysInMonth.length === 0
          ? "No birthdays this month"
          : `${birthdaysInMonth.length} resident(s) have birthdays this month`}
      </Typography>
    </Box>
  );
}

// Dietary Needs Component
function DietaryNeeds() {
  const { residents } = useAppSelector((state) => state.residents);

  const residentsWithDietary = residents.filter(
    (resident) =>
      resident.dietaryTypes.length > 0 ||
      resident.dietaryRestrictions.length > 0
  );

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Dietary Needs & Restrictions
      </Typography>

      {residentsWithDietary.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No dietary restrictions on file
        </Typography>
      ) : (
        residentsWithDietary.map((resident) => {
          return (
            <Box
              key={resident.id}
              sx={{
                mb: 2,
                p: 2,
                border: "1px solid #e0e0e0",
                borderRadius: 1,
              }}
            >
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                {resident.name}
              </Typography>

              {resident.dietaryTypes.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Types:
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                      mt: 0.5,
                    }}
                  >
                    {resident.dietaryTypes.map((type) => (
                      <Box
                        key={type}
                        sx={{
                          px: 1,
                          py: 0.25,
                          bgcolor: "action.hover",
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="caption" sx={{ fontSize: "12px" }}>
                          {type.replace("-", " ")}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {resident.dietaryRestrictions.length > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Restrictions:
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {resident.dietaryRestrictions.map((restriction) => {
                      const isAllergy = restriction.type === "allergy";
                      const isCritical =
                        restriction.severity === "critical";
                      const isSevere = restriction.severity === "severe";

                      return (
                        <Box
                          key={restriction.id}
                          sx={{
                            mb: 0.5,
                            p: 0.5,
                            bgcolor: isAllergy ? "#ffebee" : "#fff3e0",
                            borderRadius: 1,
                            borderLeft: isCritical
                              ? "4px solid #d32f2f"
                              : isSevere
                              ? "3px solid #f57c00"
                              : "2px solid #ffa000",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: isAllergy ? "bold" : "normal",
                              color: isAllergy
                                ? "error.main"
                                : isCritical
                                ? "error.dark"
                                : "warning.main",
                              fontSize: "12px",
                            }}
                          >
                            {restriction.name}
                            {isCritical && " (Critical - Medical Alert!)"}
                            {isSevere && " (Severe)"}
                            {isAllergy && " [ALLERGY]"}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Box>
          );
        })
      )}
    </Box>
  );
}

// Staff Notes Component
function StaffNotes() {
  const { staffNote } = useAppSelector((state) => state.ops);

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Staff Notes
      </Typography>

      {staffNote ? (
        <Paper
          sx={{
            p: 2,
            bgcolor: "action.hover",
            borderLeft: "4px solid #1976d2",
          }}
        >
          <Typography variant="body1">{staffNote}</Typography>
        </Paper>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No active staff notes
        </Typography>
      )}
    </Box>
  );
}

// Kitchen Food Boxes - same walkInServices data as Walk-In page (wire in leter steps)
function KitchenFoodBoxesTab() {
  const dispatch = useAppDispatch();
  const transactions = useAppSelector(
    (state) => state.walkInServices.transactions,
  );

  const monthKey = chicagoYearMonth();
  const yearKey = chicagoYear();
  const monthKitchenBoxes =
    sumTotalsForServiceDatePrefix(transactions, monthKey).kitchen_food_boxes ??
    0;
  const yearKitchenBoxes =
    sumTotalsForServiceDatePrefix(transactions, yearKey).kitchen_food_boxes ??
    0;

  // Look-up pickers (Chicago-shaped strings)
  const [historyDay, setHistoryDay] = useState(() => chicagoServiceDate());
  const [historyMonth, setHistoryMonth] = useState(() => chicagoYearMonth());
  const [historyYear, setHistoryYear] = useState(() => chicagoYear());

  const historyDayBoxes =
    sumTotalsForServiceDate(transactions, historyDay).kitchen_food_boxes ?? 0;
  const historyMonthBoxes =
    sumTotalsForServiceDatePrefix(transactions, historyMonth)
      .kitchen_food_boxes ?? 0;
  const historyYearBoxes =
    sumTotalsForServiceDatePrefix(transactions, historyYear)
      .kitchen_food_boxes ?? 0;

  // Chicago today total for kitchen boxes only (shared with Walk-In page)
  const todayKey = chicagoServiceDate();
  const todayKitchenBoxes =
    sumTotalsForServiceDate(transactions, todayKey).kitchen_food_boxes ?? 0;

  // Local draft qty - not saved until Record (step 3)
  const [qty, setQtyState] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const adjust = (delta: number) => {
    setQtyState((prev) => Math.max(0, prev + delta));
    setNotice(null);
    setError(null);
  };

  /** Whole numbers only: blank/invalid -> 0; never below 0. */
  const setQty = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === "") {
      setQtyState(0);
      setNotice(null);
      setError(null);
      return;
    }
    const n = Number.parseInt(trimmed, 10);
    const next = Number.isFinite(n) ? Math.max(0, n) : 0;
    setQtyState(next);
    setNotice(null);
    setError(null);
  };

  /** Close confirm without saving or resetting qty. */
  const handleCloseConfirm = () => {
    setConfirmOpen(false);
  };

  /** Record press - open confirm only (do not save yet). */
  const handleRecordClick = () => {
    if (qty <= 0) {
      setError("Enter a kitchen food box quantity before recording.");
      setNotice(null);
      return;
    }
    setError(null);
    setNotice(null);
    setConfirmOpen(true);
  };

  /**
   * Confim Yes - one txn with kitchen_food_boxes only.
   * Same store as Walk-In page catagory #8.
   */
  const handleConfirmRecord = () => {
    if (qty <= 0) {
      setConfirmOpen(false);
      setError("Enter a kitchen food box quantity before recording.");
      setNotice(null);
      return;
    }
    dispatch(
      recordServices({
        counts: { kitchen_food_boxes: qty },
      }),
    );
    setQtyState(0);
    setConfirmOpen(false);
    setError(null);
    setNotice("Kitchen food boxes recorded. Counter reset.");
  };

  /** Void newest non-voided txn (shared store - same as Walk-In Undo). */
  const handleUndoLast = () => {
    if (todayKitchenBoxes <= 0) {
      setError("Nothing to undo for kitchen food boxes today.");
      setNotice(null);
      return;
    }
    dispatch(undoLastTransaction());
    setError(null);
    setNotice("Undid the last recorded services (shared with Walk-In).");
  };

  /** Kitchen-only paste line: Kitchen Food Boxes: N */
  const formatKitchenBoxesLine = (n: number, title?: string): string => {
    const line = `Kitchen Food Boxes: ${n}`;
    // Two-line clipboard: title then "Kitchen Food Boxes: N"
    return title ? title + "\n" + line : line;
  };

  const handleCopyKitchen = async (
    kind:
      | "day"
      | "month"
      | "year"
      | "historyDay"
      | "historyMonth"
      | "historyYear",
  ): Promise<void> => {
    let n = 0;
    let label = "";
    if (kind === "day") {
      n = todayKitchenBoxes;
      label = todayKey;
    } else if (kind === "month") {
      n = monthKitchenBoxes;
      label = monthKey;
    } else if (kind === "year") {
      n = yearKitchenBoxes;
      label = yearKey;
    } else if (kind === "historyDay") {
      n = historyDayBoxes;
      label = historyDay;
    } else if (kind === "historyMonth") {
      n = historyMonthBoxes;
      label = historyMonth;
    } else {
      n = historyYearBoxes;
      label = historyYear;
    }

    if (n <= 0) {
      setError(`Nothing to copy for ${label}.`);
      setNotice(null);
      return;
    }

    const text = formatKitchenBoxesLine(
      n,
      `Kitchen Food Boxes — ${label}`,
    );
    try {
      await navigator.clipboard.writeText(text);
      setError(null);
      setNotice(`Copied kitchen boxes report (${label}).`);
    } catch {
      setNotice(null);
      setError("Could not copy to clipboard. Check browser permission.");
    }
  };

  return (
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          Kitchen Food Boxes
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Same records as Walk-In Services. This tab is kitchen boxes only.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {notice && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice(null)}>
            {notice}
          </Alert>
        )}

        <Button
          variant="outlined"
          color="warning"
          size="small"
          onClick={handleUndoLast}
          disabled={todayKitchenBoxes <= 0}
          sx={{ mb: 2 }}
        >
          Undo last
        </Button>

        {/* Today (kitchen boxes only) */}
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Today ({todayKey}): {todayKitchenBoxes}
        </Typography>

        {/* -qty + */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 1,
            mb: 2,
          }}
        >
          <IconButton
            aria-label="Decrease kitchen food boxes"
            color="error"
            size="medium"
            onClick={() => adjust(-1)}
            disabled={qty <= 0}
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
            aria-label="Quantity kitchen food boxes"
            size="small"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            slotProps={{
              htmlInput: {
                inputMode: "numeric",
                pattern: "[0-9]*",
                style: { textAlign: "center" },
              },
            }}
            sx={{ width: 72 }}
          />
          <IconButton
            aria-label="Increase kitchen food boxes"
            color="success"
            size="medium"
            onClick={() => adjust(1)}
            sx={{
              bgcolor: "success.main",
              color: "success.contrastText",
              "&:hover": { bgcolor: "success.dark" },
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>

        {/* Record comes in step 3 - button disabled placeholder */}
        <Button
          variant="contained"
          size="large"
          onClick={handleRecordClick}
        >
          Record Kitchen Food Boxes
        </Button>

        {/* Reports — kitchen_food_boxes only */}
        <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h6">Reports (Kitchen Food Boxes only)</Typography>

          <Typography variant="body1">
            Today ({todayKey}): {todayKitchenBoxes}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleCopyKitchen("day")}
            disabled={todayKitchenBoxes <= 0}
          >
            Copy today
          </Button>

          <Typography variant="body1">
            This month ({monthKey}): {monthKitchenBoxes}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleCopyKitchen("month")}
            disabled={monthKitchenBoxes <= 0}
          >
            Copy this month
          </Button>

          <Typography variant="body1">
            This year ({yearKey}): {yearKitchenBoxes}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleCopyKitchen("year")}
            disabled={yearKitchenBoxes <= 0}
          >
            Copy this year
          </Button>

          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            Look up day
          </Typography>
          <TextField
            type="date"
            size="small"
            label="Day"
            value={historyDay}
            onChange={(e) => setHistoryDay(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ maxWidth: 220 }}
          />
          <Typography variant="body2">
            Kitchen Food Boxes: {historyDayBoxes}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleCopyKitchen("historyDay")}
            disabled={historyDayBoxes <= 0}
          >
            Copy looked-up day
          </Button>

          <Typography variant="subtitle1">Look up month</Typography>
          <TextField
            type="month"
            size="small"
            label="Month"
            value={historyMonth}
            onChange={(e) => setHistoryMonth(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ maxWidth: 220 }}
          />
          <Typography variant="body2">
            Kitchen Food Boxes: {historyMonthBoxes}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleCopyKitchen("historyMonth")}
            disabled={historyMonthBoxes <= 0}
          >
            Copy looked-up month
          </Button>

          <Typography variant="subtitle1">Look up year</Typography>
          <TextField
            type="number"
            size="small"
            label="Year"
            value={historyYear}
            onChange={(e) => setHistoryYear(e.target.value)}
            slotProps={{
              htmlInput: { min: 2000, max: 2100, step: 1 },
              inputLabel: { shrink: true },
            }}
            sx={{ maxWidth: 220 }}
          />
          <Typography variant="body2">
            Kitchen Food Boxes: {historyYearBoxes}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleCopyKitchen("historyYear")}
            disabled={historyYearBoxes <= 0}
          >
            Copy looked-up year
          </Button>
        </Box>

        {/* Confirm before save - Enter = Yes; Go back leaves qty alone */}
        <Dialog
          open={confirmOpen}
          onClose={handleCloseConfirm}
          fullWidth
          maxWidth="sm"
          aria-labelledby="kitchen-food-boxes-confirm-title"
        >
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleConfirmRecord();
            }}
          >
            <DialogTitle id="kitchen-food-boxes-confirm-title" sx={{ pb: 1 }}>
              Record kitchen food boxes?
            </DialogTitle>
            <DialogContent>
              <Typography variant="h6">
                KITCHEN FOOD BOXES - {qty}
              </Typography>
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
                Yes, record
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Box>
    );
  }

// Main Page Component
export default function KitchenResources() {
  const [tabValue, setTabValue] = useState(0);

  const handleChangeTab = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Kitchen Resources
      </Typography>

      <Paper sx={{ width: "100%" }}>
        <Tabs
          value={tabValue}
          onChange={handleChangeTab}
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Tab label="Birthday Calendar" />
          <Tab label="Dietary Needs" />
          <Tab label="Staff Notes" />
          <Tab label="Kitchen Food Boxes" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && <BirthdayCalendar />}
          {tabValue === 1 && <DietaryNeeds />}
          {tabValue === 2 && <StaffNotes />}
          {tabValue === 3 && <KitchenFoodBoxesTab />}
        </Box>
      </Paper>
    </Box>
  );
}