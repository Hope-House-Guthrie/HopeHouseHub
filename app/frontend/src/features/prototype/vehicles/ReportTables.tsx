/**
 * Vehicles — report table presentation (Day / Month / Year body)
 * FE complete 2026-08-22: #3A tables, #3B year condensed, #3C print letterhead.
 * Resume: pages/vehicles/index.tsx STATUS (Backend Handoff for TJ).
 * Pure presentational + light format helpers. Filters/math stay in page + reports.ts.
 */
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useMemo, type ReactNode } from "react";
import Logo from "@assets/hhg-logo.svg";
import { MAINTENANCE_SERVICE_OPTIONS } from "./config";
import {
  buildYearMonthBreakdown,
  formatPricePerGallon,
  milesSincePreviousFillUp,
  mpgBetweenFillUps,
} from "./reports";
import type {
  FuelRecord,
  MaintenanceRecord,
  TripRecord,
  VehicleId,
  VehicleReportContentFilter,
  VehicleReportMileageFilter,
  VehicleReportPeriod,
  VehicleReportSummary,
  VehicleReportVehicleFilter,
} from "./types";

/** Shared dense table look — tweak here later without rewriting sections. */
const tableSx = {
  width: "100%",
  "& .MuiTableCell-root": {
    py: 0.75,
    px: 1,
    fontSize: "0.8125rem",
    borderColor: "divider",
  },
  "& .MuiTableCell-head": {
    fontWeight: 700,
    bgcolor: "grey.100",
    whiteSpace: "nowrap" as const,
  },
  "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)": {
    bgcolor: "grey.50",
  },
};

const sectionSx = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 0.75,
  // Prefer keeping a short section together; long tables may still page
  "@media print": {
    breakInside: "auto",
  },
};

function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

function tripTypeLabel(t: TripRecord["tripType"] | FuelRecord["tripType"]): string {
  return t === "hope_house" ? "Hope House" : "Personal";
}

function receiptLabel(has: boolean | string | undefined | null): string {
  return has ? "Attached" : "None";
}

export type ReportTableFormatters = {
  vehicleLabel: (id: VehicleId) => string;
  formatDisplayDate: (isoDate: string) => string;
  formatDisplayTime: (hhmm: string) => string;
};

type SectionFlags = {
  showMileage: boolean;
  showFuel: boolean;
  showMaint: boolean;
};

function flagsFromContent(content: VehicleReportContentFilter): SectionFlags {
  return {
    showMileage: content === "everything" || content === "mileage",
    showFuel: content === "everything" || content === "fuel",
    showMaint: content === "everything" || content === "maintenance",
  };
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Typography
      variant="subtitle2"
      className="vehicles-report-section-title"
      sx={{
        fontWeight: 700,
        // Keep title with following table start when printing
        "@media print": {
          breakAfter: "avoid",
          pageBreakAfter: "avoid",
        },
      }}
    >
      {children}
    </Typography>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <Typography variant="body2" color="text.secondary">
      {children}
    </Typography>
  );
}

const MONTH_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** Human period label for print/screen report header. */
export function formatReportPeriodLabel(
  period: VehicleReportPeriod,
  periodKey: string,
  formatDisplayDate: (iso: string) => string
): string {
  if (period === "day") {
    return `Day — ${formatDisplayDate(periodKey)}`;
  }
  if (period === "month") {
    const [y, m] = periodKey.split("-");
    const mi = Number(m);
    if (y && Number.isFinite(mi) && mi >= 1 && mi <= 12) {
      return `Month — ${MONTH_LONG[mi - 1]} ${y}`;
    }
    return `Month — ${periodKey}`;
  }
  return `Year — ${periodKey}`;
}

function contentFilterLabel(c: VehicleReportContentFilter): string {
  switch (c) {
    case "everything":
      return "Everything";
    case "mileage":
      return "Mileage";
    case "fuel":
      return "Fuel";
    case "maintenance":
      return "Maintenance";
    default:
      return c;
  }
}

function mileageFilterLabel(m: VehicleReportMileageFilter): string {
  if (m === "all") return "All";
  if (m === "hope_house") return "Hope House";
  return "Personal";
}

function vehicleFilterLabel(
  v: VehicleReportVehicleFilter,
  vehicleLabel: (id: VehicleId) => string
): string {
  if (v === "all") return "All vehicles";
  return vehicleLabel(v);
}

/** Chicago local stamp for “Generated” line. */
export function formatGeneratedChicago(): string {
  return new Date().toLocaleString("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Formal report letterhead (screen preview + print).
 * Logo: official assets/hhg-logo.svg via @assets alias.
 */
export function VehicleReportPrintHeader({
  period,
  periodKey,
  vehicleFilter,
  contentFilter,
  mileageFilter,
  vehicleLabel,
  formatDisplayDate,
  includeYearDetails,
}: {
  period: VehicleReportPeriod;
  periodKey: string;
  vehicleFilter: VehicleReportVehicleFilter;
  contentFilter: VehicleReportContentFilter;
  mileageFilter: VehicleReportMileageFilter;
  vehicleLabel: (id: VehicleId) => string;
  formatDisplayDate: (iso: string) => string;
  /** Year only — whether detailed logs are included */
  includeYearDetails?: boolean;
}) {
  const periodText = formatReportPeriodLabel(
    period,
    periodKey,
    formatDisplayDate
  );
  const showMileageType =
    contentFilter === "everything" ||
    contentFilter === "mileage" ||
    contentFilter === "fuel";

  return (
    <Box
      className="vehicles-report-print-header"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        pb: 1.5,
        mb: 1,
        borderBottom: 2,
        borderColor: "text.primary",
        "@media print": {
          borderBottomColor: "#000",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
        }}
      >
        <Box
          component="img"
          src={Logo}
          alt="Hope House Guthrie"
          sx={{
            height: 56,
            width: "auto",
            maxWidth: 140,
            objectFit: "contain",
            "@media print": {
              height: 48,
              maxWidth: 120,
              // Keep logo crisp on paper
              WebkitPrintColorAdjust: "exact",
              printColorAdjust: "exact",
            },
          }}
        />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: 800, letterSpacing: 0.4, lineHeight: 1.2 }}
          >
            HOPE HOUSE GUTHRIE
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            Neighborhood Hope Dealers
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, mt: 0.5 }}
          >
            Vehicle Activity Report
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 0.5,
          mt: 0.5,
        }}
      >
        <Typography variant="body2">
          <Box component="span" sx={{ fontWeight: 700 }}>
            Reporting period:{" "}
          </Box>
          {periodText}
        </Typography>
        <Typography variant="body2">
          <Box component="span" sx={{ fontWeight: 700 }}>
            Vehicle:{" "}
          </Box>
          {vehicleFilterLabel(vehicleFilter, vehicleLabel)}
        </Typography>
        <Typography variant="body2">
          <Box component="span" sx={{ fontWeight: 700 }}>
            Content:{" "}
          </Box>
          {contentFilterLabel(contentFilter)}
          {period === "year" && includeYearDetails
            ? " (with detailed records)"
            : period === "year"
              ? " (summary only)"
              : ""}
        </Typography>
        {showMileageType && (
          <Typography variant="body2">
            <Box component="span" sx={{ fontWeight: 700 }}>
              Mileage type:{" "}
            </Box>
            {mileageFilterLabel(mileageFilter)}
          </Typography>
        )}
        <Typography variant="body2" sx={{ gridColumn: { sm: "1 / -1" } }}>
          <Box component="span" sx={{ fontWeight: 700 }}>
            Generated:{" "}
          </Box>
          {formatGeneratedChicago()} (America/Chicago)
        </Typography>
      </Box>
    </Box>
  );
}

/** Shared table shell: full width + print thead repeat / row keep. */
function ReportTableShell({ children }: { children: ReactNode }) {
  return (
    <TableContainer
      className="vehicles-report-table-wrap"
      sx={{
        overflowX: "auto",
        "@media print": {
          overflow: "visible",
        },
      }}
    >
      <Table
        size="small"
        className="vehicles-report-table"
        sx={{
          ...tableSx,
          "@media print": {
            width: "100% !important",
            tableLayout: "auto",
            "& .MuiTableCell-root": {
              borderColor: "#444 !important",
              color: "#000",
              py: 0.5,
              fontSize: "9pt",
            },
            "& .MuiTableCell-head": {
              bgcolor: "#e8e8e8 !important",
              WebkitPrintColorAdjust: "exact",
              printColorAdjust: "exact",
            },
            "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)": {
              bgcolor: "#f5f5f5 !important",
              WebkitPrintColorAdjust: "exact",
              printColorAdjust: "exact",
            },
            // Repeat column headers on each printed page
            "& thead": {
              display: "table-header-group",
            },
            "& tfoot": {
              display: "table-footer-group",
            },
            "& tr": {
              breakInside: "avoid",
              pageBreakInside: "avoid",
            },
          },
        }}
      >
        {children}
      </Table>
    </TableContainer>
  );
}

/** 1) Mileage Summary — by vehicle + optional grand row */
export function MileageSummaryTable({
  summary,
  fmt,
}: {
  summary: VehicleReportSummary;
  fmt: ReportTableFormatters;
}) {
  const showGrand = summary.byVehicle.length > 1;
  return (
    <Box sx={sectionSx}>
      <SectionTitle>Mileage Summary</SectionTitle>
      <ReportTableShell>
          <TableHead>
            <TableRow>
              <TableCell>Vehicle</TableCell>
              <TableCell align="right">HH mi</TableCell>
              <TableCell align="right">Personal mi</TableCell>
              <TableCell align="right">Total mi</TableCell>
              <TableCell align="right">Trips</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {summary.byVehicle.map((v) => (
              <TableRow key={v.vehicleId}>
                <TableCell>{fmt.vehicleLabel(v.vehicleId)}</TableCell>
                <TableCell align="right">{v.hopeHouseMiles}</TableCell>
                <TableCell align="right">{v.personalMiles}</TableCell>
                <TableCell align="right">{v.totalMiles}</TableCell>
                <TableCell align="right">{v.tripCount}</TableCell>
              </TableRow>
            ))}
            {showGrand && (
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Grand total</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {summary.grand.hopeHouseMiles}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {summary.grand.personalMiles}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {summary.grand.totalMiles}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {summary.grand.tripCount}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </ReportTableShell>
    </Box>
  );
}

/** Month (and reusable) rollup: miles + fuel $ + maint $ by vehicle */
export function PeriodSummaryTable({
  summary,
  fmt,
  contentFilter,
  title,
}: {
  summary: VehicleReportSummary;
  fmt: ReportTableFormatters;
  contentFilter: VehicleReportContentFilter;
  title: string;
}) {
  const f = flagsFromContent(contentFilter);
  const showGrand = summary.byVehicle.length > 1;
  return (
    <Box sx={sectionSx}>
      <SectionTitle>{title}</SectionTitle>
      <ReportTableShell>
          <TableHead>
            <TableRow>
              <TableCell>Vehicle</TableCell>
              {f.showMileage && (
                <>
                  <TableCell align="right">HH mi</TableCell>
                  <TableCell align="right">Personal mi</TableCell>
                  <TableCell align="right">Total mi</TableCell>
                  <TableCell align="right">Trips</TableCell>
                </>
              )}
              {f.showFuel && (
                <>
                  <TableCell align="right">Fill-ups</TableCell>
                  <TableCell align="right">Fuel $</TableCell>
                </>
              )}
              {f.showMaint && (
                <>
                  <TableCell align="right">Maint jobs</TableCell>
                  <TableCell align="right">Maint $</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {summary.byVehicle.map((v) => (
              <TableRow key={v.vehicleId}>
                <TableCell>{fmt.vehicleLabel(v.vehicleId)}</TableCell>
                {f.showMileage && (
                  <>
                    <TableCell align="right">{v.hopeHouseMiles}</TableCell>
                    <TableCell align="right">{v.personalMiles}</TableCell>
                    <TableCell align="right">{v.totalMiles}</TableCell>
                    <TableCell align="right">{v.tripCount}</TableCell>
                  </>
                )}
                {f.showFuel && (
                  <>
                    <TableCell align="right">{v.fuelCount}</TableCell>
                    <TableCell align="right">{money(v.fuelCost)}</TableCell>
                  </>
                )}
                {f.showMaint && (
                  <>
                    <TableCell align="right">{v.maintenanceCount}</TableCell>
                    <TableCell align="right">
                      {money(v.maintenanceCost)}
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
            {showGrand && (
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Grand total</TableCell>
                {f.showMileage && (
                  <>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {summary.grand.hopeHouseMiles}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {summary.grand.personalMiles}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {summary.grand.totalMiles}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {summary.grand.tripCount}
                    </TableCell>
                  </>
                )}
                {f.showFuel && (
                  <>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {summary.grand.fuelCount}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {money(summary.grand.fuelCost)}
                    </TableCell>
                  </>
                )}
                {f.showMaint && (
                  <>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {summary.grand.maintenanceCount}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {money(summary.grand.maintenanceCost)}
                    </TableCell>
                  </>
                )}
              </TableRow>
            )}
          </TableBody>
        </ReportTableShell>
    </Box>
  );
}

/** 2) Trip / Mileage Log */
export function TripLogTable({
  trips,
  fmt,
}: {
  trips: TripRecord[];
  fmt: ReportTableFormatters;
}) {
  return (
    <Box sx={sectionSx}>
      <SectionTitle>Trip / Mileage Log ({trips.length})</SectionTitle>
      {trips.length === 0 ? (
        <EmptyNote>No trips in this window.</EmptyNote>
      ) : (
        <ReportTableShell>
            <TableHead>
              <TableRow>
                <TableCell>Vehicle</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell align="right">Start mi</TableCell>
                <TableCell align="right">End mi</TableCell>
                <TableCell align="right">Miles</TableCell>
                <TableCell>Lower-mi note</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trips.map((tr) => (
                <TableRow key={tr.id}>
                  <TableCell>{fmt.vehicleLabel(tr.vehicleId)}</TableCell>
                  <TableCell>{fmt.formatDisplayDate(tr.date)}</TableCell>
                  <TableCell>
                    {tr.time ? fmt.formatDisplayTime(tr.time) : "—"}
                  </TableCell>
                  <TableCell>{tripTypeLabel(tr.tripType)}</TableCell>
                  <TableCell>{tr.location || "—"}</TableCell>
                  <TableCell>{tr.reason || "—"}</TableCell>
                  <TableCell align="right">{tr.startingMileage}</TableCell>
                  <TableCell align="right">{tr.endingMileage}</TableCell>
                  <TableCell align="right">
                    {tr.milesDriven !== null ? tr.milesDriven : "N/A"}
                  </TableCell>
                  <TableCell>
                    {tr.lowerMileageNote?.trim()
                      ? tr.lowerMileageNote
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </ReportTableShell>
      )}
    </Box>
  );
}

/** 3) Fuel Log — derived fill-ups; receipt Attached/None only */
export function FuelLogTable({
  fuels,
  allFuels,
  fmt,
}: {
  fuels: FuelRecord[];
  /** Full vehicle fuel history for miles-since / MPG helpers */
  allFuels: FuelRecord[];
  fmt: ReportTableFormatters;
}) {
  return (
    <Box sx={sectionSx}>
      <SectionTitle>Fuel Log ({fuels.length})</SectionTitle>
      {fuels.length === 0 ? (
        <EmptyNote>
          No fill-ups in this window. Save a trip with Gas added = Yes.
        </EmptyNote>
      ) : (
        <ReportTableShell>
            <TableHead>
              <TableRow>
                <TableCell>Vehicle</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Fill-up mi</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Gallons</TableCell>
                <TableCell align="right">$/gal</TableCell>
                <TableCell align="right">Mi since prior</TableCell>
                <TableCell align="right">~MPG</TableCell>
                <TableCell>Receipt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fuels.map((f) => {
                const since = milesSincePreviousFillUp(allFuels, f);
                const mpg = mpgBetweenFillUps(since, f.gallons);
                return (
                  <TableRow key={f.id}>
                    <TableCell>{fmt.vehicleLabel(f.vehicleId)}</TableCell>
                    <TableCell>{fmt.formatDisplayDate(f.date)}</TableCell>
                    <TableCell>
                      {f.time ? fmt.formatDisplayTime(f.time) : "—"}
                    </TableCell>
                    <TableCell>{tripTypeLabel(f.tripType)}</TableCell>
                    <TableCell align="right">{f.odometer}</TableCell>
                    <TableCell align="right">{money(f.amountSpent)}</TableCell>
                    <TableCell align="right">{f.gallons.toFixed(3)}</TableCell>
                    <TableCell align="right">
                      {formatPricePerGallon(f.pricePerGallon)}
                    </TableCell>
                    <TableCell align="right">
                      {since !== null ? since : "N/A"}
                    </TableCell>
                    <TableCell align="right">
                      {mpg !== null ? mpg.toFixed(1) : "N/A"}
                    </TableCell>
                    <TableCell>
                      {receiptLabel(!!f.receiptDataUrl)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </ReportTableShell>
      )}
    </Box>
  );
}

/** 4) Maintenance Log */
export function MaintenanceLogTable({
  maints,
  fmt,
}: {
  maints: MaintenanceRecord[];
  fmt: ReportTableFormatters;
}) {
  return (
    <Box sx={sectionSx}>
      <SectionTitle>Maintenance Log ({maints.length})</SectionTitle>
      {maints.length === 0 ? (
        <EmptyNote>No maintenance in this window.</EmptyNote>
      ) : (
        <ReportTableShell>
            <TableHead>
              <TableRow>
                <TableCell>Vehicle</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Service</TableCell>
                <TableCell align="right">Mileage</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Receipt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {maints.map((m) => {
                const serviceLabel =
                  MAINTENANCE_SERVICE_OPTIONS.find(
                    (o) => o.id === m.serviceType
                  )?.label ?? m.serviceType;
                return (
                  <TableRow key={m.id}>
                    <TableCell>{fmt.vehicleLabel(m.vehicleId)}</TableCell>
                    <TableCell>{fmt.formatDisplayDate(m.date)}</TableCell>
                    <TableCell>
                      {m.time ? fmt.formatDisplayTime(m.time) : "—"}
                    </TableCell>
                    <TableCell>{serviceLabel}</TableCell>
                    <TableCell align="right">{m.mileageAtService}</TableCell>
                    <TableCell align="right">{money(m.amount)}</TableCell>
                    <TableCell>{m.vendor || "—"}</TableCell>
                    <TableCell>{m.notes || "—"}</TableCell>
                    <TableCell>
                      {receiptLabel(!!m.receiptDataUrl)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </ReportTableShell>
      )}
    </Box>
  );
}

/** 5) Overall Totals — single grand row table */
export function OverallTotalsTable({
  summary,
  contentFilter,
}: {
  summary: VehicleReportSummary;
  contentFilter: VehicleReportContentFilter;
}) {
  const f = flagsFromContent(contentFilter);
  const g = summary.grand;
  return (
    <Box sx={sectionSx}>
      <SectionTitle>Overall Totals</SectionTitle>
      <ReportTableShell>
          <TableHead>
            <TableRow>
              {f.showMileage && (
                <>
                  <TableCell align="right">HH mi</TableCell>
                  <TableCell align="right">Personal mi</TableCell>
                  <TableCell align="right">Total mi</TableCell>
                  <TableCell align="right">Trips</TableCell>
                </>
              )}
              {f.showFuel && (
                <>
                  <TableCell align="right">Fill-ups</TableCell>
                  <TableCell align="right">Fuel $</TableCell>
                </>
              )}
              {f.showMaint && (
                <>
                  <TableCell align="right">Maint jobs</TableCell>
                  <TableCell align="right">Maint $</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {f.showMileage && (
                <>
                  <TableCell align="right">{g.hopeHouseMiles}</TableCell>
                  <TableCell align="right">{g.personalMiles}</TableCell>
                  <TableCell align="right">{g.totalMiles}</TableCell>
                  <TableCell align="right">{g.tripCount}</TableCell>
                </>
              )}
              {f.showFuel && (
                <>
                  <TableCell align="right">{g.fuelCount}</TableCell>
                  <TableCell align="right">{money(g.fuelCost)}</TableCell>
                </>
              )}
              {f.showMaint && (
                <>
                  <TableCell align="right">{g.maintenanceCount}</TableCell>
                  <TableCell align="right">{money(g.maintenanceCost)}</TableCell>
                </>
              )}
            </TableRow>
          </TableBody>
        </ReportTableShell>
    </Box>
  );
}

/**
 * Day + Month report body (table layout).
 * Order when Everything:
 *   1) Period / mileage-style summary (by vehicle)
 *   2) Trip / Mileage Log
 *   3) Fuel Log
 *   4) Maintenance Log
 *   5) Overall Totals
 * Month always leads with the period summary table, then detail logs.
 */
export function DayMonthReportTables({
  period,
  periodKey,
  contentFilter,
  summary,
  trips,
  fuels,
  allFuels,
  maints,
  fmt,
}: {
  period: "day" | "month";
  periodKey: string;
  contentFilter: VehicleReportContentFilter;
  summary: VehicleReportSummary;
  trips: TripRecord[];
  fuels: FuelRecord[];
  allFuels: FuelRecord[];
  maints: MaintenanceRecord[];
  fmt: ReportTableFormatters;
}) {
  const f = flagsFromContent(contentFilter);
  const summaryTitle =
    period === "day"
      ? `Day summary — ${periodKey}`
      : `Month summary — ${periodKey}`;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* 1) Summary first (month + day) */}
      {contentFilter === "mileage" ? (
        <MileageSummaryTable summary={summary} fmt={fmt} />
      ) : (
        <PeriodSummaryTable
          summary={summary}
          fmt={fmt}
          contentFilter={contentFilter}
          title={summaryTitle}
        />
      )}

      {/* 2) Trip / Mileage Log */}
      {f.showMileage && <TripLogTable trips={trips} fmt={fmt} />}

      {/* 3) Fuel Log */}
      {f.showFuel && (
        <FuelLogTable fuels={fuels} allFuels={allFuels} fmt={fmt} />
      )}

      {/* 4) Maintenance Log */}
      {f.showMaint && <MaintenanceLogTable maints={maints} fmt={fmt} />}

      {/* 5) Overall Totals */}
      <OverallTotalsTable summary={summary} contentFilter={contentFilter} />
    </Box>
  );
}

/**
 * Year report body (#3B).
 * Default: condensed Jan–Dec month rows + year totals only.
 * includeDetailedRecords ON: also trip/fuel/maint logs for the year.
 *
 * Month rows are computed HERE from the full trips/maints lists (not a
 * pre-baked empty memo) so Year always matches Day/Month source data.
 */
export function YearReportTables({
  yearKey,
  contentFilter,
  vehicleFilter,
  mileageFilter,
  yearSummary,
  includeDetailedRecords,
  trips,
  fuels,
  allFuels,
  maints,
  allTrips,
  allMaintenances,
  fmt,
}: {
  yearKey: string;
  contentFilter: VehicleReportContentFilter;
  vehicleFilter: VehicleReportVehicleFilter;
  mileageFilter: VehicleReportMileageFilter;
  yearSummary: VehicleReportSummary;
  includeDetailedRecords: boolean;
  /** Filtered detail lists (when Include detailed is ON) */
  trips: TripRecord[];
  fuels: FuelRecord[];
  allFuels: FuelRecord[];
  maints: MaintenanceRecord[];
  /** Full unfiltered-by-period lists for month bucketing */
  allTrips: TripRecord[];
  allMaintenances: MaintenanceRecord[];
  fmt: ReportTableFormatters;
}) {
  const f = flagsFromContent(contentFilter);
  const g = yearSummary.grand;

  // Build month rows from full record lists + current filters
  const monthRows = useMemo(
    () =>
      buildYearMonthBreakdown({
        yearKey,
        vehicleFilter,
        contentFilter,
        mileageFilter,
        trips: allTrips,
        fuels: allFuels,
        maintenances: allMaintenances,
      }),
    [
      yearKey,
      vehicleFilter,
      contentFilter,
      mileageFilter,
      allTrips,
      allFuels,
      allMaintenances,
    ]
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Box sx={sectionSx}>
        <SectionTitle>Year summary by month — {yearKey}</SectionTitle>
        <ReportTableShell>
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                {f.showMileage && (
                  <>
                    <TableCell align="right">HH mi</TableCell>
                    <TableCell align="right">Personal mi</TableCell>
                    <TableCell align="right">Total mi</TableCell>
                    <TableCell align="right">Trips</TableCell>
                  </>
                )}
                {f.showFuel && (
                  <TableCell align="right">Fuel $</TableCell>
                )}
                {f.showMaint && (
                  <TableCell align="right">Maint $</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {monthRows.map((row) => (
                <TableRow key={row.monthKey}>
                  <TableCell>{row.label}</TableCell>
                  {f.showMileage && (
                    <>
                      <TableCell align="right">{row.hopeHouseMiles}</TableCell>
                      <TableCell align="right">{row.personalMiles}</TableCell>
                      <TableCell align="right">{row.totalMiles}</TableCell>
                      <TableCell align="right">{row.tripCount}</TableCell>
                    </>
                  )}
                  {f.showFuel && (
                    <TableCell align="right">{money(row.fuelCost)}</TableCell>
                  )}
                  {f.showMaint && (
                    <TableCell align="right">
                      {money(row.maintenanceCost)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Year total</TableCell>
                {f.showMileage && (
                  <>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {g.hopeHouseMiles}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {g.personalMiles}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {g.totalMiles}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {g.tripCount}
                    </TableCell>
                  </>
                )}
                {f.showFuel && (
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {money(g.fuelCost)}
                  </TableCell>
                )}
                {f.showMaint && (
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {money(g.maintenanceCost)}
                  </TableCell>
                )}
              </TableRow>
            </TableBody>
          </ReportTableShell>
      </Box>

      {yearSummary.byVehicle.length > 1 && (
        <PeriodSummaryTable
          summary={yearSummary}
          fmt={fmt}
          contentFilter={contentFilter}
          title={`By vehicle — ${yearKey}`}
        />
      )}

      {includeDetailedRecords && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Typography variant="body2" color="text.secondary">
            Detailed records for {yearKey} (filters applied).
          </Typography>
          {f.showMileage && <TripLogTable trips={trips} fmt={fmt} />}
          {f.showFuel && (
            <FuelLogTable fuels={fuels} allFuels={allFuels} fmt={fmt} />
          )}
          {f.showMaint && <MaintenanceLogTable maints={maints} fmt={fmt} />}
          <OverallTotalsTable
            summary={yearSummary}
            contentFilter={contentFilter}
          />
        </Box>
      )}
    </Box>
  );
}
