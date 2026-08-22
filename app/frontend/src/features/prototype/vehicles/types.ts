/**
 * Vehicles — types
 * FE complete 2026-08-22 (print 896b9a6). Resume: pages/vehicles/index.tsx STATUS.
 * Plan: Desktop Hope_House_Hub_Vehicle_Tracking_Project_Plan.docx
 *
 * Record modes: trip | maintenance (no fuel mode).
 * Gas fields live on TripRecord; FuelRecord is report-derived (tripId, tripType,
 * amountSpent, gallons, pricePerGallon, odometer/fill-up).
 * Maint: oil_change | general only.
 * Backend handoff notes: pages/vehicles/index.tsx STATUS → Backend Handoff.
 */

/** Which house vehicle (expand later if more units). */
export type VehicleId = "van" | "truck";

/** Display + id for the selector. */
export interface VehicleOption {
  id: VehicleId;
  label: string;
}

/** Trip classification (plan). */
export type TripType = "hope_house" | "personal";

/**
 * Maintenance service category.
 * Oil Change + General only (General covers tires/brakes/repairs/etc.).
 * No separate inspection (OK no longer requires it).
 */
export type MaintenanceServiceType = "oil_change" | "general";

/**
 * Which form is open after vehicle is selected.
 * Fuel is NOT a mode — gas is collected on the trip form when Gas added = Yes.
 */
export type VehicleRecordMode = "trip" | "maintenance";

/** Page chrome: entry forms vs reports (Phase 4). */
export type VehiclePageView = "records" | "reports";

/** Report period grain (walk-in style). */
export type VehicleReportPeriod = "day" | "month" | "year";

/** Vehicle filter on reports (All = both). */
export type VehicleReportVehicleFilter = "all" | VehicleId;

/**
 * What content sections to include.
 * "fuel" = fuel-only view of fill-ups (still sourced from trips with gas).
 */
export type VehicleReportContentFilter =
  | "everything"
  | "mileage"
  | "fuel"
  | "maintenance";

/** Trip mileage type on reports. */
export type VehicleReportMileageFilter = "all" | TripType;

/** One vehicle's rolled-up numbers for a report window. */
export interface VehicleReportVehicleTotals {
  vehicleId: VehicleId;
  hopeHouseMiles: number;
  personalMiles: number;
  totalMiles: number;
  tripCount: number;
  fuelCount: number;
  fuelCost: number;
  maintenanceCount: number;
  maintenanceCost: number;
}

/** Full report snapshot (pure helper output). */
export interface VehicleReportSummary {
  period: VehicleReportPeriod;
  /** Day=YYYY-MM-DD, Month=YYYY-MM, Year=YYYY */
  periodKey: string;
  vehicleFilter: VehicleReportVehicleFilter;
  contentFilter: VehicleReportContentFilter;
  mileageFilter: VehicleReportMileageFilter;
  /** One block per vehicle included (van then truck order). */
  byVehicle: VehicleReportVehicleTotals[];
  /** Sum across byVehicle. */
  grand: Omit<VehicleReportVehicleTotals, "vehicleId">;
}

/**
 * One calendar month rollup inside a Year report (#3B).
 * monthKey = YYYY-MM; totals already honor vehicle/content/mileage filters.
 */
export interface VehicleReportMonthRow {
  monthKey: string;
  /** Display label e.g. "Jan 2026" */
  label: string;
  hopeHouseMiles: number;
  personalMiles: number;
  totalMiles: number;
  tripCount: number;
  fuelCount: number;
  fuelCost: number;
  maintenanceCount: number;
  maintenanceCost: number;
}

/** One saved trip (FE mock - no backend yet). */
export interface TripRecord {
  id: string;
  vehicleId: VehicleId;
  tripType: TripType;
  /** YYYY-MM-DD from type=date */
  date: string;
  /** HH:mm Central from type=time (may be empty) */
  time: string;
  location: string;
  reason: string;
  startingMileage: number;
  endingMileage: number;
  /** End - start when valid; null if bad/lower */
  milesDriven: number | null;
  notes: string;
  /**
   * Gas purchased on this trip (Hope House or Personal).
   * When true, fill-up fields below are stored and a FuelRecord is also kept
   * for fuel-only reporting (no separate Fuel entry UI).
   */
  gasAdded?: boolean;
  /** Dollars when gasAdded === true (required if gas added; must be > 0) */
  gasAmount?: number | null;
  /** Gallons when gasAdded === true (required if gas added; must be > 0; up to 3 decimals) */
  gasGallons?: number | null;
  /**
   * Odometer at the pump. May differ from endingMileage; editable on form.
   * Prefill may suggest trip end mi when known — never invent a fake value.
   * Required if gas added; must be > 0.
   */
  gasFillUpMileage?: number | null;
  /**
   * Derived: gasAmount / gasGallons when both valid (> 0).
   * Stored for fuel reports; not user-entered.
   */
  gasPricePerGallon?: number | null;
  /** Receipt data URL when gas was added (optional mock). */
  gasReceiptDataUrl?: string;
  gasReceiptFileName?: string;
  /**
   * Set when staff used Save Anyway with end < start (audit).
   * Empty/undefined on normal trips.
   */
  lowerMileageNote?: string;
  /** ISO string when staff saved (browser clock) */
  savedAt: string;
}

/**
 * One fuel fill-up for reporting (FE mock).
 * Created from a trip when gasAdded is true — not a standalone entry form.
 * Keeps fuel-only reports possible (date, vehicle, $, gal, odo, receipt, trip type).
 */
export interface FuelRecord {
  id: string;
  vehicleId: VehicleId;
  /** Parent trip id (entry path is always via trip). */
  tripId: string;
  /** From parent trip — Hope House vs Personal for fuel reports. */
  tripType: TripType;
  /** YYYY-MM-DD (from trip date) */
  date: string;
  /** HH:mm Central optional (from trip time) */
  time: string;
  /** Odometer at fill-up */
  odometer: number;
  /** Dollars spent (must be > 0) */
  amountSpent: number;
  /** Gallons (must be > 0; up to 3 decimal places) */
  gallons: number;
  /**
   * amountSpent / gallons (3-decimal display; full float stored).
   * Derived at save — never typed by staff.
   */
  pricePerGallon: number;
  notes: string;
  /**
   * Optional receipt image as data URL.
   * Mock only - not uploaded to a server yet.
   */
  receiptDataUrl?: string;
  receiptFileName?: string;
  /** ISO when saved */
  savedAt: string;
}

/** One maintenance job (FE mock - receipt data URL, no backend). */
export interface MaintenanceRecord {
  id: string;
  vehicleId: VehicleId;
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm Central (optional) */
  time: string;
  serviceType: MaintenanceServiceType;
  /** Odometer at service */
  mileageAtService: number;
  /** Dollars spent */
  amount: number;
  /** Shop / vendor / location */
  vendor: string;
  notes: string;
  /**
   * Optional receipt image as data URL.
   * Mock only - not uploaded to a server yet.
   * Room left later for nextServiceMileage / nextServiceDate (do not add yet).
   */
  receiptDataUrl?: string;
  receiptFileName?: string;
  /** ISO when saved */
  savedAt: string;
}
