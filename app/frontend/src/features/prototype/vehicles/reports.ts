/**
 * Vehicles — reports + fuel math helpers
 * FE complete 2026-08-22. Resume: pages/vehicles/index.tsx STATUS.
 * Plan: Desktop Hope_House_Hub_Vehicle_Tracking_Project_Plan.docx
 *
 * Pure helpers only (no React) — backend report queries should match these:
 * - Period keys / date match / buildVehicleReportSummary
 * - buildYearMonthBreakdown (year condensed Jan–Dec rows)
 * - fuelRecordFromTrip / fuelRecordsFromTrips (trip-attached gas → report rows)
 * - milesSincePreviousFillUp / mpgBetweenFillUps
 * - parsePositiveMoney / parseNonNegativeMoney / formatMoneyInput /
 *   parsePositiveGallons / formatGallonsInput / pricePerGallon /
 *   formatPricePerGallon
 * Dates on records are YYYY-MM-DD (type=date). America/Chicago for “today”.
 */
import { VEHICLE_OPTIONS } from "./config";
import type {
  FuelRecord,
  MaintenanceRecord,
  TripRecord,
  TripType,
  VehicleId,
  VehicleReportContentFilter,
  VehicleReportMileageFilter,
  VehicleReportMonthRow,
  VehicleReportPeriod,
  VehicleReportSummary,
  VehicleReportVehicleFilter,
  VehicleReportVehicleTotals,
} from "./types";

/** Central calendar date YYYY-MM-DD for defaults. */
export function chicagoDateToday(): string {
  // en-CA -> YYYY-MM-DD
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Chicago",
  });
}

/** Build period key from a day string + grain. */
export function toPeriodKey(
  period: VehicleReportPeriod,
  dayYmd: string
): string {
  const d = dayYmd.trim();
  if (period === "day") return d;
  if (period === "month") return d.slice(0, 7); // YYYY-MM
  return d.slice(0, 4); // YYYY
}

/** Record date matches period key (day exact / month or year prefix). */
export function dateMatchesPeriodKey(
  recordDate: string,
  period: VehicleReportPeriod,
  periodKey: string
): boolean {
  const d = recordDate.trim();
  if (!d || !periodKey) return false;
  if (period === "day") return d === periodKey;
  if (period === "month") return d.startsWith(periodKey); // YYYY-MM
  return d.startsWith(periodKey); // YYYY
}

/**
 * Parse a non-negative money amount from user text.
 * Accepts "0", "20", "20.5", "$20.00". Rejects empty, NaN, < 0.
 * Used by maintenance (donated / warranty / $0 allowed).
 */
export function parseNonNegativeMoney(raw: string): number | null {
  const t = raw.trim().replace(/[$,\s]/g, "");
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) return null;
  // Store cents-friendly: round to 2 decimals
  return Math.round(n * 100) / 100;
}

/**
 * Parse a positive money amount from user text.
 * Accepts "20", "20.5", "$20.00". Rejects empty, NaN, ≤ 0.
 * Used by trip gas (must be > 0). Unchanged behavior.
 */
export function parsePositiveMoney(raw: string): number | null {
  const n = parseNonNegativeMoney(raw);
  if (n === null || n <= 0) return null;
  return n;
}

/** Format dollars for input after blur: 20 → "20.00" */
export function formatMoneyInput(n: number): string {
  return n.toFixed(2);
}

/**
 * Parse positive gallons (up to 3 decimal places).
 * Rejects empty, NaN, ≤ 0.
 */
export function parsePositiveGallons(raw: string): number | null {
  const t = raw.trim().replace(/[,\s]/g, "").replace(/gal(lons)?$/i, "");
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n <= 0) return null;
  // Truncate/round to 3 decimals for pump-style precision
  return Math.round(n * 1000) / 1000;
}

/** Format gallons for input after blur: 12.3 → "12.300" */
export function formatGallonsInput(n: number): string {
  return n.toFixed(3);
}

/** Price per gallon = amount ÷ gallons; null if either invalid/≤0. */
export function pricePerGallon(
  amount: number | null | undefined,
  gallons: number | null | undefined
): number | null {
  if (
    amount === null ||
    amount === undefined ||
    gallons === null ||
    gallons === undefined
  ) {
    return null;
  }
  if (!Number.isFinite(amount) || !Number.isFinite(gallons)) return null;
  if (amount <= 0 || gallons <= 0) return null;
  return amount / gallons;
}

/** Display helper: $3.259/gal */
export function formatPricePerGallon(ppg: number): string {
  return `$${ppg.toFixed(3)}/gal`;
}

/**
 * Build a FuelRecord from a trip that logged gas.
 * Used so fuel-only reports work without a separate Fuel entry UI.
 * Returns null if trip has no valid fill-up (amount, gallons, odo all > 0).
 */
export function fuelRecordFromTrip(trip: TripRecord): FuelRecord | null {
  if (!trip.gasAdded) return null;
  if (
    trip.gasFillUpMileage === null ||
    trip.gasFillUpMileage === undefined ||
    !Number.isFinite(trip.gasFillUpMileage) ||
    trip.gasFillUpMileage <= 0
  ) {
    return null;
  }
  if (
    trip.gasAmount === null ||
    trip.gasAmount === undefined ||
    !Number.isFinite(trip.gasAmount) ||
    trip.gasAmount <= 0
  ) {
    return null;
  }
  if (
    trip.gasGallons === null ||
    trip.gasGallons === undefined ||
    !Number.isFinite(trip.gasGallons) ||
    trip.gasGallons <= 0
  ) {
    return null;
  }

  const ppg =
    trip.gasPricePerGallon !== null &&
    trip.gasPricePerGallon !== undefined &&
    Number.isFinite(trip.gasPricePerGallon)
      ? trip.gasPricePerGallon
      : pricePerGallon(trip.gasAmount, trip.gasGallons);
  if (ppg === null) return null;

  return {
    id: `fuel-from-${trip.id}`,
    vehicleId: trip.vehicleId,
    tripId: trip.id,
    tripType: trip.tripType,
    date: trip.date,
    time: trip.time,
    odometer: trip.gasFillUpMileage,
    amountSpent: trip.gasAmount,
    gallons: trip.gasGallons,
    pricePerGallon: ppg,
    notes: trip.notes || "",
    receiptDataUrl: trip.gasReceiptDataUrl,
    receiptFileName: trip.gasReceiptFileName,
    savedAt: trip.savedAt,
  };
}

/** All fill-ups derived from trips (stable id per trip). */
export function fuelRecordsFromTrips(trips: TripRecord[]): FuelRecord[] {
  const out: FuelRecord[] = [];
  for (const t of trips) {
    const f = fuelRecordFromTrip(t);
    if (f) out.push(f);
  }
  return out;
}

/**
 * Miles since previous fill-up for the same vehicle (by fill-up odometer order).
 * null when no prior fill-up or prior odo is not lower.
 */
export function milesSincePreviousFillUp(
  fuels: FuelRecord[],
  current: FuelRecord
): number | null {
  const same = fuels
    .filter((f) => f.vehicleId === current.vehicleId)
    .slice()
    .sort((a, b) => {
      if (a.odometer !== b.odometer) return a.odometer - b.odometer;
      return a.savedAt < b.savedAt ? -1 : 1;
    });
  const idx = same.findIndex((f) => f.id === current.id);
  if (idx <= 0) return null;
  const prev = same[idx - 1]!;
  const delta = current.odometer - prev.odometer;
  if (!Number.isFinite(delta) || delta <= 0) return null;
  return delta;
}

/**
 * Simple MPG when gallons > 0 and miles-since-prev known.
 * null when not enough data (no fake MPG).
 */
export function mpgBetweenFillUps(
  milesSincePrev: number | null,
  gallons: number | null | undefined
): number | null {
  if (milesSincePrev === null || gallons === null || gallons === undefined) {
    return null;
  }
  if (!Number.isFinite(gallons) || gallons <= 0) return null;
  return milesSincePrev / gallons;
}

function emptyTotals(vehicleId: VehicleId): VehicleReportVehicleTotals {
  return {
    vehicleId,
    hopeHouseMiles: 0,
    personalMiles: 0,
    totalMiles: 0,
    tripCount: 0,
    fuelCount: 0,
    fuelCost: 0,
    maintenanceCount: 0,
    maintenanceCost: 0,
  };
}

function tripMilesForFilter(
  t: TripRecord,
  mileageFilter: VehicleReportMileageFilter
): number {
  if (mileageFilter !== "all" && t.tripType !== mileageFilter) return 0;
  if (t.milesDriven === null || !Number.isFinite(t.milesDriven)) return 0;
  return t.milesDriven;
}

function tripTypeIncluded(
  tripType: TripType,
  mileageFilter: VehicleReportMileageFilter
): boolean {
  return mileageFilter === "all" || tripType === mileageFilter;
}

/**
 * Build report totals from in-memory lists (FE mock).
 * Prefer fuels derived from trips (fuelRecordsFromTrips); callers may pass either.
 * mileageFilter applies to trips and to fuel rows via tripType.
 */
export function buildVehicleReportSummary(args: {
  period: VehicleReportPeriod;
  anchorDate: string;
  vehicleFilter: VehicleReportVehicleFilter;
  contentFilter: VehicleReportContentFilter;
  mileageFilter: VehicleReportMileageFilter;
  trips: TripRecord[];
  fuels: FuelRecord[];
  maintenances: MaintenanceRecord[];
}): VehicleReportSummary {
  const periodKey = toPeriodKey(args.period, args.anchorDate);
  const vehicleIds: VehicleId[] =
    args.vehicleFilter === "all"
      ? VEHICLE_OPTIONS.map((v) => v.id)
      : [args.vehicleFilter];

  const includeTrips =
    args.contentFilter === "everything" || args.contentFilter === "mileage";
  const includeFuel =
    args.contentFilter === "everything" || args.contentFilter === "fuel";
  const includeMaint =
    args.contentFilter === "everything" ||
    args.contentFilter === "maintenance";

  // Prefer trip-derived fill-ups when trips present (source of truth)
  const fuels =
    args.trips.length > 0 ? fuelRecordsFromTrips(args.trips) : args.fuels;

  const byVehicle: VehicleReportVehicleTotals[] = vehicleIds.map((id) => {
    const tot = emptyTotals(id);

    if (includeTrips) {
      for (const t of args.trips) {
        if (t.vehicleId !== id) continue;
        if (!dateMatchesPeriodKey(t.date, args.period, periodKey)) continue;
        if (!tripTypeIncluded(t.tripType, args.mileageFilter)) continue;
        tot.tripCount += 1;
        const m = tripMilesForFilter(t, args.mileageFilter);
        if (t.tripType === "hope_house") tot.hopeHouseMiles += m;
        else tot.personalMiles += m;
        tot.totalMiles += m;
      }
    }

    if (includeFuel) {
      for (const f of fuels) {
        if (f.vehicleId !== id) continue;
        if (!dateMatchesPeriodKey(f.date, args.period, periodKey)) continue;
        if (!tripTypeIncluded(f.tripType, args.mileageFilter)) continue;
        tot.fuelCount += 1;
        tot.fuelCost += f.amountSpent;
      }
    }

    if (includeMaint) {
      for (const m of args.maintenances) {
        if (m.vehicleId !== id) continue;
        if (!dateMatchesPeriodKey(m.date, args.period, periodKey)) continue;
        tot.maintenanceCount += 1;
        tot.maintenanceCost += m.amount;
      }
    }

    return tot;
  });

  const grand = {
    hopeHouseMiles: 0,
    personalMiles: 0,
    totalMiles: 0,
    tripCount: 0,
    fuelCount: 0,
    fuelCost: 0,
    maintenanceCount: 0,
    maintenanceCost: 0,
  };
  for (const v of byVehicle) {
    grand.hopeHouseMiles += v.hopeHouseMiles;
    grand.personalMiles += v.personalMiles;
    grand.totalMiles += v.totalMiles;
    grand.tripCount += v.tripCount;
    grand.fuelCount += v.fuelCount;
    grand.fuelCost += v.fuelCost;
    grand.maintenanceCount += v.maintenanceCount;
    grand.maintenanceCost += v.maintenanceCost;
  }

  return {
    period: args.period,
    periodKey,
    vehicleFilter: args.vehicleFilter,
    contentFilter: args.contentFilter,
    mileageFilter: args.mileageFilter,
    byVehicle,
    grand,
  };
}

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/**
 * Year report condensed rows: one rollup per calendar month (Jan–Dec).
 * Buckets trips / trip-derived fuel / maintenance by YYYY-MM directly
 * (same filter rules as buildVehicleReportSummary).
 * yearKey = YYYY.
 */
export function buildYearMonthBreakdown(args: {
  yearKey: string;
  vehicleFilter: VehicleReportVehicleFilter;
  contentFilter: VehicleReportContentFilter;
  mileageFilter: VehicleReportMileageFilter;
  trips: TripRecord[];
  fuels: FuelRecord[];
  maintenances: MaintenanceRecord[];
}): VehicleReportMonthRow[] {
  // Normalize year: accept "2026" or a full anchor "2026-08-22"
  const raw = args.yearKey.trim();
  const yearMatch = raw.match(/(\d{4})/);
  const year = yearMatch ? yearMatch[1]! : "";
  if (!year) return [];

  const includeTrips =
    args.contentFilter === "everything" || args.contentFilter === "mileage";
  const includeFuel =
    args.contentFilter === "everything" || args.contentFilter === "fuel";
  const includeMaint =
    args.contentFilter === "everything" ||
    args.contentFilter === "maintenance";

  // Prefer trip-derived fill-ups (same as summary helper)
  const fuels =
    args.trips.length > 0 ? fuelRecordsFromTrips(args.trips) : args.fuels;

  const vehicleOk = (vehicleId: VehicleId): boolean =>
    args.vehicleFilter === "all" || args.vehicleFilter === vehicleId;

  // Accumulate into 12 month buckets
  const buckets = new Map<string, VehicleReportMonthRow>();
  for (let m = 1; m <= 12; m += 1) {
    const mm = String(m).padStart(2, "0");
    const monthKey = `${year}-${mm}`;
    buckets.set(monthKey, {
      monthKey,
      label: `${MONTH_SHORT[m - 1]} ${year}`,
      hopeHouseMiles: 0,
      personalMiles: 0,
      totalMiles: 0,
      tripCount: 0,
      fuelCount: 0,
      fuelCost: 0,
      maintenanceCount: 0,
      maintenanceCost: 0,
    });
  }

  if (includeTrips) {
    for (const t of args.trips) {
      if (!vehicleOk(t.vehicleId)) continue;
      if (!t.date || t.date.length < 7) continue;
      // Must be this calendar year (YYYY-…)
      if (!t.date.startsWith(year)) continue;
      if (!tripTypeIncluded(t.tripType, args.mileageFilter)) continue;
      const monthKey = t.date.slice(0, 7); // YYYY-MM
      const row = buckets.get(monthKey);
      if (!row) continue;
      row.tripCount += 1;
      const miles = tripMilesForFilter(t, args.mileageFilter);
      if (t.tripType === "hope_house") row.hopeHouseMiles += miles;
      else row.personalMiles += miles;
      row.totalMiles += miles;
    }
  }

  if (includeFuel) {
    for (const f of fuels) {
      if (!vehicleOk(f.vehicleId)) continue;
      if (!f.date || f.date.length < 7) continue;
      if (!f.date.startsWith(year)) continue;
      if (!tripTypeIncluded(f.tripType, args.mileageFilter)) continue;
      const monthKey = f.date.slice(0, 7);
      const row = buckets.get(monthKey);
      if (!row) continue;
      row.fuelCount += 1;
      row.fuelCost += f.amountSpent;
    }
  }

  if (includeMaint) {
    for (const m of args.maintenances) {
      if (!vehicleOk(m.vehicleId)) continue;
      if (!m.date || m.date.length < 7) continue;
      if (!m.date.startsWith(year)) continue;
      // Maint is vehicle-level — not filtered by Hope House/Personal
      const monthKey = m.date.slice(0, 7);
      const row = buckets.get(monthKey);
      if (!row) continue;
      row.maintenanceCount += 1;
      row.maintenanceCost += m.amount;
    }
  }

  // Jan → Dec order
  const rows: VehicleReportMonthRow[] = [];
  for (let m = 1; m <= 12; m += 1) {
    const mm = String(m).padStart(2, "0");
    rows.push(buckets.get(`${year}-${mm}`)!);
  }
  return rows;
}
