/**
 * ============================================================================
 * VEHICLES — living STATUS (authoritative for this feature)
 * Branch: feature/vehicle-tracking (off develop)
 * Plan: ~/Desktop/Hope_House_Hub_Vehicle_Tracking_Project_Plan.docx
 * Updated: 2026-08-22 — FE planned scope COMPLETE (cleanup pass)
 * STOPPING POINT: Frontend mock Vehicle Tracker done through print layout.
 *   Commits (feature/vehicle-tracking): baseline d639579 · maint money 83c617b ·
 *   Day/Month tables b7c2c3b · Year condensed d097d5c · print 896b9a6 (+ earlier
 *   Ph1–Ph4 / fuel-side-step history on branch).
 *   Next product work only if asked: Ph5 plan items, backend/API (see handoff),
 *   open PR for TJ, train staff on live baseline.
 * ============================================================================
 * MODEL
 * - One Vehicles section: Van | Truck (select first on Records).
 * - Page view: Records | Reports.
 * - Records modes: Trip | Maintenance only (NO separate Fuel mode/page).
 * - Gas is on the TRIP form: Gas added? Yes/No (Hope House + Personal).
 *   Yes → Gas amount $ (required, blur → x.xx), Gallons (required, blur →
 *   3 decimals, pump helper text), Mileage at fill-up (required, editable;
 *   may prefill trip end mi), optional receipt (camera/file, auto-cap).
 *   Auto Price/gal = amount ÷ gallons (display $x.xxx/gal; stored numeric).
 * - Reject zero / negative / invalid gas amount, gallons, fill-up mi.
 * - FuelRecord is DERIVED from trips with gas (fuelRecordsFromTrips) for
 *   fuel-only reports: date, vehicle, $, gal, PPG, fill-up mi, trip type,
 *   receipt; miles-since-prior-fill + rough MPG when data allows.
 * - Maintenance: oil_change | general only.
 *   Labels: "Oil Change" | "General Maintenance" (tires/brakes/etc. = General).
 * - No inspection category (OK no longer requires vehicle inspection).
 * - In-memory FE mock only (useState). Refresh clears data until backend.
 *
 * DONE — frontend checklist (do not re-build)
 * - Van | Truck selection; route /vehicles (DirectionsCar)
 * - Trip logging: Hope House | Personal; date; Central time + Now; location;
 *   reason; start/end mi; miles driven; optional notes
 * - Suggested start mi = odometer baseline (max end among normal trips)
 * - Lower-mileage exception: Dialog + required note; history N/A miles;
 *   exception does NOT lower baseline; still counted in tripCount
 * - Gas/fill-up on trip (not separate Fuel mode): amount, gallons, PPG,
 *   fill-up mi, optional receipt
 * - Receipt pipeline: camera + file, 1600px / ~2.5MB data-URL cap (mock)
 * - Maintenance: Oil Change | General; date/time/Now; mi; amount ($0 OK);
 *   vendor; notes; optional receipt; history
 * - Reports filters: Day | Month | Year; Vehicle All/Van/Truck;
 *   Content Everything | Mileage | Fuel | Maintenance;
 *   Mileage type All | Hope House | Personal
 * - Day/Month: compact table sections (summary, trip log, fuel log, maint
 *   log, overall totals); combined Vehicle column when All
 * - Year: condensed Jan–Dec month table + year totals; by-vehicle rollup
 *   when All; Include detailed records default OFF
 * - Print: Vehicle Activity Report letterhead (hhg-logo.svg),
 *   HOPE HOUSE GUTHRIE / Neighborhood Hope Dealers, period + filters +
 *   Generated (America/Chicago); print root only (no hub nav/filters);
 *   receipts print as Attached | None (no images)
 * - Browser print chrome (URL, page #, browser datetime) is browser-owned
 *   — not Hub report content
 *
 * DEFERRED / NOT IN THIS FE PASS
 * - On-save first-letter capitalization of free text (was optional #4)
 * - Ph5: next oil-change mi, service reminders, product MPG UX, cost/mi,
 *   out-of-service, more fleet vehicles
 * - Backend persist / API / real file storage (see Backend Handoff below)
 * - Open GitHub PR for TJ review (branch may already be pushed)
 * - Staff training: live baseline = first real odometer per vehicle
 *
 * PATHS
 * - pages/vehicles/index.tsx           ← UI + this STATUS + handoff notes
 * - features/vehicles/types.ts         ← Trip / Maint / Fuel / report types
 * - features/vehicles/config.ts        ← VEHICLE_OPTIONS, MAINT options
 * - features/vehicles/odometer.ts      ← baseline, milesDriven, parse mi
 * - features/vehicles/reports.ts       ← period keys, summary, year months,
 *                                        fuel derive, money/gal/PPG helpers
 * - features/vehicles/ReportTables.tsx ← Day/Month/Year tables + print header
 * - routes.tsx → /vehicles
 * - assets/hhg-logo.svg                ← print/header logo (@assets alias)
 *
 * HARD LOCKS
 * - America/Chicago only (never American/Chicago)
 * - types/config/odometer/reports/ReportTables under features/vehicles/
 *   — never under pages/
 * - No features/vehicles/index.ts barrel
 * - FE mock only until backend instructed
 * - No separate Fuel entry mode
 *
 * ============================================================================
 * Backend Handoff / Notes for TJ
 * ============================================================================
 * Status: Current Vehicle Tracker is a frontend/mock-state implementation.
 *   Records live in React useState; hard refresh clears them. No API calls
 *   yet. Pure report math is in features/vehicles/reports.ts + odometer.ts
 *   and is the reference for expected totals once data is persisted.
 *
 * Persistence (likely needed)
 * - vehicles: at least van + truck (ids "van" | "truck" today; labels in
 *   config VEHICLE_OPTIONS). Future: more units without FE redesign if API
 *   returns a vehicle list.
 * - trips: vehicleId, tripType hope_house|personal, date (YYYY-MM-DD),
 *   time (HH:mm Central wall-clock, optional), location, reason, notes,
 *   startingMileage, endingMileage, milesDriven (nullable when end < start),
 *   lowerMileageNote (optional audit when Save Anyway), savedAt/createdAt,
 *   optional createdBy user id for audit.
 * - Gas/fill-up is ON THE TRIP (not a separate fuel-entry workflow):
 *   gasAdded, gasAmount (>0), gasGallons (>0, up to 3 dp), gasFillUpMileage
 *   (>0), gasPricePerGallon (derived amount/gallons), optional receipt
 *   file reference (today: data URL + fileName mock).
 * - maintenance: vehicleId, serviceType oil_change|general, date, time,
 *   mileageAtService, amount (>=0; $0 allowed for donated/warranty),
 *   vendor, notes, optional receipt file ref, savedAt/createdBy.
 * - Receipts need real file storage (upload + URL/id), not base64 in JSON.
 *   FE currently caps images client-side (~1600px edge, ~2.5MB data URL).
 *
 * Report behavior to preserve (query layer should match FE helpers)
 * - Period: Day exact date; Month YYYY-MM prefix; Year YYYY prefix
 *   (anchor date + grain → periodKey). America/Chicago “today” default.
 * - Filters: vehicle all|van|truck; content everything|mileage|fuel|
 *   maintenance; mileage type all|hope_house|personal.
 * - Mileage type filters trips and trip-derived fuel rows; maintenance is
 *   vehicle-level and ignores Hope House/Personal.
 * - Fuel report rows are derived from trips with valid gas (tripId link).
 * - Year: monthly aggregation Jan–Dec + year totals; when All vehicles,
 *   also by-vehicle rollup; optional detailed record dumps.
 * - Lower-mileage trips: count toward tripCount; milesDriven null → N/A;
 *   add 0 miles (never negative); keep lowerMileageNote for audit.
 * - Starting-mileage suggestion: max endingMileage among NORMAL trips
 *   (end >= start) per vehicle; user may still override. Exceptions must
 *   not pull the baseline down.
 * - Money: store as decimal/cents-safe; gas > 0; maint >= 0; display 2 dp;
 *   gallons up to 3 dp; PPG display 3 dp.
 * - Date/time: dates calendar YYYY-MM-DD; times HH:mm interpreted as
 *   Central (Oklahoma). Display history MM-DD-YYYY + 12h AM/PM.
 * - Print: server PDF not required; browser print uses FE layout. Browser
 *   URL/page chrome is client print-dialog owned.
 *
 * Auth / audit
 * - Eventually associate who created/updated trip and maintenance rows
 *   (Hub staff user id). FE does not send auth payloads today.
 *
 * Integration points visible in current FE
 * - Route: /vehicles (app/frontend/src/routes.tsx)
 * - No Redux slice yet — local page state only; backend can introduce API
 *   + store without changing report pure helpers much.
 * - Types: features/vehicles/types.ts (TripRecord, MaintenanceRecord,
 *   FuelRecord report shape, report filter unions).
 * - Reference implementations for results:
 *   buildVehicleReportSummary, buildYearMonthBreakdown,
 *   fuelRecordsFromTrips, lastEndingMileage, milesDriven,
 *   parsePositiveMoney / parseNonNegativeMoney.
 * - Receipt capture: getUserMedia + file input in page (mock data URLs).
 *
 * Out of scope for backend unless product asks
 * - Ph5 reminders, cost-per-mile product UX, out-of-service flag, fleet
 *   expansion beyond Van/Truck (data model should allow more vehicles).
 * ============================================================================
 */
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MAINTENANCE_SERVICE_OPTIONS,
  VEHICLE_OPTIONS,
} from "../../../features/prototype/vehicles/config";
import {
  DayMonthReportTables,
  VehicleReportPrintHeader,
  YearReportTables,
} from "../../../features/prototype/vehicles/ReportTables";
import {
  lastEndingMileage,
  milesDriven,
  parseMileageInput,
} from "../../../features/prototype/vehicles/odometer";
import {
  buildVehicleReportSummary,
  chicagoDateToday,
  dateMatchesPeriodKey,
  formatGallonsInput,
  formatMoneyInput,
  formatPricePerGallon,
  fuelRecordsFromTrips,
  parseNonNegativeMoney,
  parsePositiveGallons,
  parsePositiveMoney,
  pricePerGallon,
} from "../../../features/prototype/vehicles/reports";
import type {
  MaintenanceRecord,
  MaintenanceServiceType,
  TripRecord,
  TripType,
  VehicleId,
  VehiclePageView,
  VehicleRecordMode,
  VehicleReportContentFilter,
  VehicleReportMileageFilter,
  VehicleReportPeriod,
  VehicleReportVehicleFilter,
} from "../../../features/prototype/vehicles/types";

/** Shared camera/file receipt pipeline target. */
type ReceiptTarget = "trip_gas" | "maintenance";

const RECEIPT_MAX_DATA_URL_CHARS = 2_500_000;
const RECEIPT_MAX_EDGE_PX = 1600;
const RECEIPT_JPEG_QUALITIES = [0.85, 0.72, 0.6, 0.48] as const;

function canvasSourceToCappedJpegDataUrl(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number
): string | null {
  if (!sourceWidth || !sourceHeight) return null;

  const scale = Math.min(
    1,
    RECEIPT_MAX_EDGE_PX / Math.max(sourceWidth, sourceHeight)
  );
  const w = Math.max(1, Math.round(sourceWidth * scale));
  const h = Math.max(1, Math.round(sourceHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(source, 0, 0, w, h);

  for (const q of RECEIPT_JPEG_QUALITIES) {
    const dataUrl = canvas.toDataURL("image/jpeg", q);
    if (dataUrl.length <= RECEIPT_MAX_DATA_URL_CHARS) {
      return dataUrl;
    }
  }

  const last = canvas.toDataURL(
    "image/jpeg",
    RECEIPT_JPEG_QUALITIES[RECEIPT_JPEG_QUALITIES.length - 1]
  );
  return last.length <= RECEIPT_MAX_DATA_URL_CHARS ? last : null;
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

export default function VehiclesPage() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<VehicleId | null>(
    null
  );
  const [recordMode, setRecordMode] = useState<VehicleRecordMode>("trip");

  // Phase 4 page chrome + report filters
  const [pageView, setPageView] = useState<VehiclePageView>("records");
  const [reportPeriod, setReportPeriod] =
    useState<VehicleReportPeriod>("day");
  const [reportAnchorDate, setReportAnchorDate] = useState(() =>
    chicagoDateToday()
  );
  const [reportVehicleFilter, setReportVehicleFilter] =
    useState<VehicleReportVehicleFilter>("all");
  const [reportContentFilter, setReportContentFilter] =
    useState<VehicleReportContentFilter>("everything");
  const [reportMileageFilter, setReportMileageFilter] =
    useState<VehicleReportMileageFilter>("all");
  /** Year only (#3B): detailed trip/fuel/maint tables. Default OFF = condensed. */
  const [reportIncludeYearDetails, setReportIncludeYearDetails] =
    useState(false);

  // Trip draft
  const [tripType, setTripType] = useState<TripType>("hope_house");
  const [tripDate, setTripDate] = useState("");
  const [tripTime, setTripTime] = useState("");
  const [location, setLocation] = useState("");
  const [reason, setReason] = useState("");
  const [startMiRaw, setStartMiRaw] = useState("");
  const [endMiRaw, setEndMiRaw] = useState("");
  const [notes, setNotes] = useState("");

  // Trip-attached gas (Hope House or Personal) — no separate Fuel mode
  const [gasAdded, setGasAdded] = useState(false);
  const [gasAmountRaw, setGasAmountRaw] = useState("");
  const [gasGallonsRaw, setGasGallonsRaw] = useState("");
  const [gasFillUpMileageRaw, setGasFillUpMileageRaw] = useState("");
  const [gasReceiptDataUrl, setGasReceiptDataUrl] = useState<string | null>(
    null
  );
  const [gasReceiptFileName, setGasReceiptFileName] = useState("");

  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [lowerMiOpen, setLowerMiOpen] = useState(false);
  const [lowerMiNote, setLowerMiNote] = useState("");

  // Maintenance draft
  const [maintDate, setMaintDate] = useState("");
  const [maintTime, setMaintTime] = useState("");
  const [maintServiceType, setMaintServiceType] =
    useState<MaintenanceServiceType>("oil_change");
  const [maintMileageRaw, setMaintMileageRaw] = useState("");
  const [maintAmountRaw, setMaintAmountRaw] = useState("");
  const [maintVendor, setMaintVendor] = useState("");
  const [maintNotes, setMaintNotes] = useState("");
  const [maintReceiptDataUrl, setMaintReceiptDataUrl] = useState<string | null>(
    null
  );
  const [maintReceiptFileName, setMaintReceiptFileName] = useState("");
  const [maintenances, setMaintenances] = useState<MaintenanceRecord[]>([]);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [receiptCameraTarget, setReceiptCameraTarget] =
    useState<ReceiptTarget>("trip_gas");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startMi = parseMileageInput(startMiRaw);
  const endMi = parseMileageInput(endMiRaw);
  const driven = useMemo(
    () => milesDriven(startMi, endMi),
    [startMi, endMi]
  );
  const gasAmount = parsePositiveMoney(gasAmountRaw);
  const gasGallons = parsePositiveGallons(gasGallonsRaw);
  const gasFillUpMileage = parseMileageInput(gasFillUpMileageRaw);
  const gasPpg = useMemo(
    () => pricePerGallon(gasAmount, gasGallons),
    [gasAmount, gasGallons]
  );
  const maintMileage = parseMileageInput(maintMileageRaw);
  // Maint allows $0 (donated/warranty); gas still uses parsePositiveMoney (> 0)
  const maintAmount = parseNonNegativeMoney(maintAmountRaw);

  const selectedLabel =
    VEHICLE_OPTIONS.find((v) => v.id === selectedVehicleId)?.label ?? null;

  const chicagoTimeNow = (): string => {
    const now = new Date().toLocaleString("en-US", {
      timeZone: "America/Chicago",
    });
    const centralDate = new Date(now);
    const hours = String(centralDate.getHours()).padStart(2, "0");
    const minutes = String(centralDate.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatDisplayDate = (isoDate: string): string => {
    const parts = isoDate.split("-");
    if (parts.length !== 3) return isoDate;
    const [y, m, d] = parts;
    return `${m}-${d}-${y}`;
  };

  const formatDisplayTime = (hhmm: string): string => {
    if (!hhmm) return "";
    const [hRaw, mRaw] = hhmm.split(":");
    const h = Number(hRaw);
    const m = Number(mRaw);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  const vehicleTrips = useMemo(() => {
    if (!selectedVehicleId) return [];
    return trips
      .filter((t) => t.vehicleId === selectedVehicleId)
      .slice()
      .sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
  }, [trips, selectedVehicleId]);

  // Fuel fill-ups derived from trips (for fuel-only reports / MPG helpers)
  const allFuels = useMemo(() => fuelRecordsFromTrips(trips), [trips]);

  const vehicleMaintenances = useMemo(() => {
    if (!selectedVehicleId) return [];
    return maintenances
      .filter((m) => m.vehicleId === selectedVehicleId)
      .slice()
      .sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
  }, [maintenances, selectedVehicleId]);

  const reportSummary = useMemo(
    () =>
      buildVehicleReportSummary({
        period: reportPeriod,
        anchorDate: reportAnchorDate || chicagoDateToday(),
        vehicleFilter: reportVehicleFilter,
        contentFilter: reportContentFilter,
        mileageFilter: reportMileageFilter,
        trips,
        fuels: allFuels,
        maintenances,
      }),
    [
      reportPeriod,
      reportAnchorDate,
      reportVehicleFilter,
      reportContentFilter,
      reportMileageFilter,
      trips,
      allFuels,
      maintenances,
    ]
  );

  const reportTrips = useMemo(() => {
    const show =
      reportContentFilter === "everything" ||
      reportContentFilter === "mileage";
    if (!show) return [];
    return trips
      .filter((t) => {
        if (
          reportVehicleFilter !== "all" &&
          t.vehicleId !== reportVehicleFilter
        ) {
          return false;
        }
        if (
          !dateMatchesPeriodKey(t.date, reportPeriod, reportSummary.periodKey)
        ) {
          return false;
        }
        if (
          reportMileageFilter !== "all" &&
          t.tripType !== reportMileageFilter
        ) {
          return false;
        }
        return true;
      })
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [
    trips,
    reportContentFilter,
    reportVehicleFilter,
    reportPeriod,
    reportSummary.periodKey,
    reportMileageFilter,
  ]);

  const reportFuels = useMemo(() => {
    const show =
      reportContentFilter === "everything" || reportContentFilter === "fuel";
    if (!show) return [];
    return allFuels
      .filter((f) => {
        if (
          reportVehicleFilter !== "all" &&
          f.vehicleId !== reportVehicleFilter
        ) {
          return false;
        }
        if (
          !dateMatchesPeriodKey(f.date, reportPeriod, reportSummary.periodKey)
        ) {
          return false;
        }
        if (
          reportMileageFilter !== "all" &&
          f.tripType !== reportMileageFilter
        ) {
          return false;
        }
        return true;
      })
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [
    allFuels,
    reportContentFilter,
    reportVehicleFilter,
    reportPeriod,
    reportSummary.periodKey,
    reportMileageFilter,
  ]);

  const reportMaints = useMemo(() => {
    const show =
      reportContentFilter === "everything" ||
      reportContentFilter === "maintenance";
    if (!show) return [];
    return maintenances
      .filter((m) => {
        if (
          reportVehicleFilter !== "all" &&
          m.vehicleId !== reportVehicleFilter
        ) {
          return false;
        }
        return dateMatchesPeriodKey(
          m.date,
          reportPeriod,
          reportSummary.periodKey
        );
      })
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [
    maintenances,
    reportContentFilter,
    reportVehicleFilter,
    reportPeriod,
    reportSummary.periodKey,
  ]);

  const vehicleLabel = (id: VehicleId) =>
    VEHICLE_OPTIONS.find((v) => v.id === id)?.label ?? id;

  const suggestedStart = selectedVehicleId
    ? lastEndingMileage(trips, selectedVehicleId)
    : null;

  const canAttemptSaveTrip =
    !!selectedVehicleId &&
    !!tripDate.trim() &&
    startMi !== null &&
    endMi !== null &&
    (!gasAdded ||
      (gasAmount !== null &&
        gasAmount > 0 &&
        gasGallons !== null &&
        gasGallons > 0 &&
        gasFillUpMileage !== null &&
        gasFillUpMileage > 0 &&
        gasPpg !== null));

  const canSaveMaint =
    !!selectedVehicleId &&
    !!maintDate.trim() &&
    maintMileage !== null &&
    maintAmount !== null &&
    maintAmount >= 0;

  const resetTripDraftAfterSave = (nextStart: number | null) => {
    setTripType("hope_house");
    setTripDate("");
    setTripTime("");
    setLocation("");
    setReason("");
    setStartMiRaw(nextStart === null ? "" : String(nextStart));
    setEndMiRaw("");
    setNotes("");
    setGasAdded(false);
    setGasAmountRaw("");
    setGasGallonsRaw("");
    setGasFillUpMileageRaw(nextStart === null ? "" : String(nextStart));
    setGasReceiptDataUrl(null);
    setGasReceiptFileName("");
  };

  const resetMaintDraft = () => {
    setMaintDate("");
    setMaintTime("");
    setMaintServiceType("oil_change");
    const last =
      selectedVehicleId === null
        ? null
        : lastEndingMileage(trips, selectedVehicleId);
    setMaintMileageRaw(last === null ? "" : String(last));
    setMaintAmountRaw("");
    setMaintVendor("");
    setMaintNotes("");
    setMaintReceiptDataUrl(null);
    setMaintReceiptFileName("");
  };

  const handleSelectVehicle = (id: VehicleId) => {
    setSelectedVehicleId(id);
    const last = lastEndingMileage(trips, id);
    setStartMiRaw(last === null ? "" : String(last));
    setEndMiRaw("");
    setMaintMileageRaw(last === null ? "" : String(last));
    setGasFillUpMileageRaw(last === null ? "" : String(last));
  };

  const handleCloseLowerMi = () => {
    setLowerMiOpen(false);
    setLowerMiNote("");
  };

  const commitTrip = (lowerNote?: string) => {
    if (!selectedVehicleId || startMi === null || endMi === null) return;
    if (gasAdded) {
      if (gasAmount === null || gasAmount <= 0) return;
      if (gasGallons === null || gasGallons <= 0) return;
      if (gasFillUpMileage === null || gasFillUpMileage <= 0) return;
      if (gasPpg === null) return;
    }

    const record: TripRecord = {
      id: crypto.randomUUID(),
      vehicleId: selectedVehicleId,
      tripType,
      date: tripDate,
      time: tripTime,
      location: location.trim(),
      reason: reason.trim(),
      startingMileage: startMi,
      endingMileage: endMi,
      milesDriven: milesDriven(startMi, endMi),
      notes: notes.trim(),
      gasAdded: gasAdded ? true : undefined,
      gasAmount: gasAdded ? gasAmount : undefined,
      gasGallons: gasAdded ? gasGallons : undefined,
      gasFillUpMileage: gasAdded ? gasFillUpMileage : undefined,
      gasPricePerGallon: gasAdded ? gasPpg : undefined,
      gasReceiptDataUrl:
        gasAdded && gasReceiptDataUrl ? gasReceiptDataUrl : undefined,
      gasReceiptFileName:
        gasAdded && gasReceiptFileName ? gasReceiptFileName : undefined,
      lowerMileageNote: lowerNote?.trim() ? lowerNote.trim() : undefined,
      savedAt: new Date().toISOString(),
    };

    // Include this save when computing baseline so normal trips advance it,
    // but lower-mi exceptions (end < start) are ignored inside lastEndingMileage.
    const nextBaseline = lastEndingMileage(
      [record, ...trips],
      selectedVehicleId
    );
    setTrips((prev) => [record, ...prev]);
    resetTripDraftAfterSave(nextBaseline);
    setMaintMileageRaw(nextBaseline === null ? "" : String(nextBaseline));
  };

  const handleSaveTrip = () => {
    if (!canAttemptSaveTrip || startMi === null || endMi === null) return;
    if (endMi >= startMi) {
      commitTrip();
      return;
    }
    setLowerMiOpen(true);
  };

  const handleSaveAnyway = () => {
    const note = lowerMiNote.trim();
    if (!note) return;
    commitTrip(note);
    handleCloseLowerMi();
  };

  const applyReceiptToTarget = (
    target: ReceiptTarget,
    dataUrl: string | null,
    fileName: string
  ) => {
    if (target === "trip_gas") {
      setGasReceiptDataUrl(dataUrl);
      setGasReceiptFileName(fileName);
      return;
    }
    setMaintReceiptDataUrl(dataUrl);
    setMaintReceiptFileName(fileName);
  };

  const handleReceiptFileChange = async (
    target: ReceiptTarget,
    file: File | null
  ) => {
    if (!file) {
      applyReceiptToTarget(target, null, "");
      return;
    }
    if (!file.type.startsWith("image/")) {
      window.alert(
        "Please choose an image file for the receipt (JPG, PNG, etc.)."
      );
      return;
    }
    if (file.size > 12_000_000) {
      window.alert(
        "That file is too large to open in the browser mock (max ~12 MB original)."
      );
      return;
    }
    try {
      const img = await loadImageFromFile(file);
      const dataUrl = canvasSourceToCappedJpegDataUrl(
        img,
        img.naturalWidth || img.width,
        img.naturalHeight || img.height
      );
      if (!dataUrl) {
        window.alert(
          "Could not shrink that receipt under the mock storage limit (~2.5 MB). Try a smaller photo."
        );
        return;
      }
      const baseName = file.name.replace(/\.[^.]+$/, "") || "receipt";
      applyReceiptToTarget(target, dataUrl, `${baseName}.jpg`);
    } catch {
      window.alert("Could not read that image. Try another file or Take photo.");
    }
  };

  const stopCameraStream = () => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleCloseCamera = () => {
    stopCameraStream();
    setCameraOpen(false);
    setCameraError(null);
  };

  const handleOpenCamera = (target: ReceiptTarget) => {
    setReceiptCameraTarget(target);
    setCameraError(null);
    setCameraOpen(true);
  };

  useEffect(() => {
    if (!cameraOpen) return;
    let cancelled = false;

    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setCameraError(
            "This browser does not support camera access. Use Choose from files."
          );
          return;
        }
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" } },
            audio: false,
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }
      } catch {
        setCameraError(
          "Could not open the camera. Allow camera permission for this site (lock icon in the address bar), then try again — or use Choose from files."
        );
      }
    };

    void start();
    return () => {
      cancelled = true;
      stopCameraStream();
    };
  }, [cameraOpen]);

  const handleSnapReceipt = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const dataUrl = canvasSourceToCappedJpegDataUrl(
      video,
      video.videoWidth,
      video.videoHeight
    );
    if (!dataUrl) {
      window.alert(
        "Captured frame is too large for mock storage even after shrink. Try again or use a smaller file."
      );
      return;
    }
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    applyReceiptToTarget(receiptCameraTarget, dataUrl, `camera-${stamp}.jpg`);
    handleCloseCamera();
  };

  const handleSaveMaint = () => {
    if (
      !selectedVehicleId ||
      !canSaveMaint ||
      maintMileage === null ||
      maintAmount === null
    ) {
      return;
    }
    const record: MaintenanceRecord = {
      id: crypto.randomUUID(),
      vehicleId: selectedVehicleId,
      date: maintDate,
      time: maintTime,
      serviceType: maintServiceType,
      mileageAtService: maintMileage,
      amount: maintAmount,
      vendor: maintVendor.trim(),
      notes: maintNotes.trim(),
      receiptDataUrl: maintReceiptDataUrl ?? undefined,
      receiptFileName: maintReceiptFileName || undefined,
      savedAt: new Date().toISOString(),
    };
    setMaintenances((prev) => [record, ...prev]);
    resetMaintDraft();
  };

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h5" component="h1">
        Vehicles
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Shared vehicle tracking for the van and truck (mock). Records: Trip
        (optional gas) or Maintenance. Reports: day/month/year totals.
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        <Chip
          label="Records"
          color={pageView === "records" ? "primary" : "default"}
          variant={pageView === "records" ? "filled" : "outlined"}
          onClick={() => setPageView("records")}
          sx={{ cursor: "pointer" }}
        />
        <Chip
          label="Reports"
          color={pageView === "reports" ? "primary" : "default"}
          variant={pageView === "reports" ? "filled" : "outlined"}
          onClick={() => setPageView("reports")}
          sx={{ cursor: "pointer" }}
        />
      </Box>

      {pageView === "records" && (
        <>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Select vehicle
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {VEHICLE_OPTIONS.map((v) => {
                const on = selectedVehicleId === v.id;
                return (
                  <Chip
                    key={v.id}
                    label={v.label}
                    color={on ? "primary" : "default"}
                    variant={on ? "filled" : "outlined"}
                    onClick={() => handleSelectVehicle(v.id)}
                    sx={{ cursor: "pointer" }}
                  />
                );
              })}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              {selectedLabel
                ? `Selected: ${selectedLabel}.`
                : "No vehicle selected yet."}
            </Typography>
          </Box>

          {/* Trip | Maintenance only — fuel is on the trip form */}
          {selectedVehicleId && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Chip
                label="Trip"
                color={recordMode === "trip" ? "primary" : "default"}
                variant={recordMode === "trip" ? "filled" : "outlined"}
                onClick={() => setRecordMode("trip")}
                sx={{ cursor: "pointer" }}
              />
              <Chip
                label="Maintenance"
                color={recordMode === "maintenance" ? "primary" : "default"}
                variant={recordMode === "maintenance" ? "filled" : "outlined"}
                onClick={() => setRecordMode("maintenance")}
                sx={{ cursor: "pointer" }}
              />
            </Box>
          )}

          {/* Trip form */}
          {selectedVehicleId && recordMode === "trip" && (
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveTrip();
              }}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                maxWidth: 480,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Add trip — {selectedLabel}
              </Typography>

              <FormControl>
                <FormLabel id="trip-type-label">Trip type</FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="trip-type-label"
                  value={tripType}
                  onChange={(e) => setTripType(e.target.value as TripType)}
                >
                  <FormControlLabel
                    value="hope_house"
                    control={<Radio />}
                    label="Hope House"
                  />
                  <FormControlLabel
                    value="personal"
                    control={<Radio />}
                    label="Personal"
                  />
                </RadioGroup>
              </FormControl>

              <TextField
                label="Date"
                type="date"
                size="small"
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  alignItems: "flex-start",
                }}
              >
                <TextField
                  label="Time"
                  type="time"
                  size="small"
                  value={tripTime}
                  onChange={(e) => setTripTime(e.target.value)}
                  onFocus={() => {
                    if (!tripTime) setTripTime(chicagoTimeNow());
                  }}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ flex: "1 1 160px" }}
                  helperText="Central time (Oklahoma). Empty + click fills now."
                />
                <Button
                  type="button"
                  size="small"
                  variant="outlined"
                  onClick={() => setTripTime(chicagoTimeNow())}
                  sx={{ mt: 0.5 }}
                >
                  Now
                </Button>
              </Box>

              <TextField
                label="Location / Destination"
                size="small"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <TextField
                label="Reason"
                size="small"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <TextField
                label="Starting mileage"
                size="small"
                value={startMiRaw}
                onChange={(e) => setStartMiRaw(e.target.value)}
                inputMode="decimal"
                helperText={
                  suggestedStart === null
                    ? "No odometer baseline for this vehicle yet"
                    : `Suggested from odometer baseline: ${suggestedStart}`
                }
              />
              <TextField
                label="Ending mileage"
                size="small"
                value={endMiRaw}
                onChange={(e) => {
                  const v = e.target.value;
                  setEndMiRaw(v);
                  // Keep fill-up suggestion aligned while Gas added is on
                  if (gasAdded) {
                    const parsed = parseMileageInput(v);
                    if (
                      parsed !== null &&
                      (!gasFillUpMileageRaw.trim() ||
                        gasFillUpMileageRaw === endMiRaw)
                    ) {
                      setGasFillUpMileageRaw(v);
                    }
                  }
                }}
                inputMode="decimal"
              />

              <Typography variant="body2">
                Miles driven: {driven === null ? "—" : driven}
                {startMi !== null &&
                  endMi !== null &&
                  endMi < startMi &&
                  " (end is lower than start — you can still Save; a warning will open)"}
              </Typography>

              {/* Gas added → trip-attached fuel fields */}
              <FormControl>
                <FormLabel id="gas-added-label">Gas added?</FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="gas-added-label"
                  value={gasAdded ? "yes" : "no"}
                  onChange={(e) => {
                    const yes = e.target.value === "yes";
                    setGasAdded(yes);
                    if (!yes) {
                      setGasAmountRaw("");
                      setGasGallonsRaw("");
                      setGasReceiptDataUrl(null);
                      setGasReceiptFileName("");
                    } else if (!gasFillUpMileageRaw.trim() && endMi !== null) {
                      setGasFillUpMileageRaw(String(endMi));
                    }
                  }}
                >
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                  <FormControlLabel
                    value="yes"
                    control={<Radio />}
                    label="Yes"
                  />
                </RadioGroup>
              </FormControl>

              {gasAdded && (
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  <TextField
                    label="Gas amount ($)"
                    size="small"
                    value={gasAmountRaw}
                    onChange={(e) => setGasAmountRaw(e.target.value)}
                    onBlur={() => {
                      const n = parsePositiveMoney(gasAmountRaw);
                      if (n !== null) setGasAmountRaw(formatMoneyInput(n));
                    }}
                    inputMode="decimal"
                    required
                    error={
                      gasAmountRaw.trim() !== "" && gasAmount === null
                    }
                    helperText={
                      gasAmountRaw.trim() !== "" && gasAmount === null
                        ? "Enter a valid amount greater than $0"
                        : "Formats to dollars (e.g. 20 → 20.00)"
                    }
                  />
                  <TextField
                    label="Gallons"
                    size="small"
                    value={gasGallonsRaw}
                    onChange={(e) => setGasGallonsRaw(e.target.value)}
                    onBlur={() => {
                      const n = parsePositiveGallons(gasGallonsRaw);
                      if (n !== null) setGasGallonsRaw(formatGallonsInput(n));
                    }}
                    inputMode="decimal"
                    required
                    error={
                      gasGallonsRaw.trim() !== "" && gasGallons === null
                    }
                    helperText={
                      gasGallonsRaw.trim() !== "" && gasGallons === null
                        ? "Enter gallons greater than 0 (up to 3 decimals)"
                        : "Enter the exact gallons shown on the pump or receipt."
                    }
                  />
                  <TextField
                    label="Mileage at fill-up"
                    size="small"
                    value={gasFillUpMileageRaw}
                    onChange={(e) => setGasFillUpMileageRaw(e.target.value)}
                    inputMode="decimal"
                    required
                    error={
                      gasFillUpMileageRaw.trim() !== "" &&
                      (gasFillUpMileage === null || gasFillUpMileage <= 0)
                    }
                    helperText={
                      gasFillUpMileageRaw.trim() !== "" &&
                      (gasFillUpMileage === null || gasFillUpMileage <= 0)
                        ? "Enter a fill-up mileage greater than 0"
                        : endMi !== null
                          ? `Suggested from trip ending mileage (${endMi}); edit if the pump reading differs.`
                          : "Enter odometer at the pump (no suggestion until ending mileage is set)."
                    }
                  />
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600 }}
                    color={gasPpg === null ? "text.secondary" : "text.primary"}
                  >
                    Price per gallon:{" "}
                    {gasPpg !== null
                      ? formatPricePerGallon(gasPpg)
                      : "— (enter amount and gallons)"}
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Gas receipt (optional)
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      <Button
                        type="button"
                        variant="contained"
                        size="small"
                        onClick={() => handleOpenCamera("trip_gas")}
                      >
                        Take photo
                      </Button>
                      <Button
                        variant="outlined"
                        component="label"
                        size="small"
                      >
                        {gasReceiptFileName
                          ? `Change file: ${gasReceiptFileName}`
                          : "Choose from files"}
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => {
                            const f = e.target.files?.[0] ?? null;
                            void handleReceiptFileChange("trip_gas", f);
                            e.target.value = "";
                          }}
                        />
                      </Button>
                    </Box>
                    {gasReceiptDataUrl ? (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        <Box
                          component="img"
                          src={gasReceiptDataUrl}
                          alt="Trip gas receipt preview"
                          sx={{
                            maxWidth: 240,
                            maxHeight: 180,
                            objectFit: "contain",
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 1,
                          }}
                        />
                        <Button
                          type="button"
                          size="small"
                          onClick={() =>
                            void handleReceiptFileChange("trip_gas", null)
                          }
                        >
                          Remove receipt
                        </Button>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Optional. Same capped camera/file pipeline as
                        maintenance.
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}

              <TextField
                label="Notes (optional)"
                size="small"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                minRows={2}
              />

              <Button
                type="submit"
                variant="contained"
                disabled={!canAttemptSaveTrip}
              >
                Save trip
              </Button>
            </Box>
          )}

          {/* Trip history */}
          {selectedVehicleId && recordMode === "trip" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Trip history — {selectedLabel}
              </Typography>
              {vehicleTrips.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No trips saved for this vehicle yet.
                </Typography>
              ) : (
                vehicleTrips.map((t) => (
                  <Box
                    key={t.id}
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      p: 1.5,
                      maxWidth: 480,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatDisplayDate(t.date)}
                      {t.time ? ` ${formatDisplayTime(t.time)}` : ""} —{" "}
                      {t.tripType === "hope_house" ? "Hope House" : "Personal"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t.location || "(no location)"}
                      {t.reason ? ` · ${t.reason}` : ""}
                    </Typography>
                    {t.notes ? (
                      <Typography variant="body2" color="text.secondary">
                        {t.notes}
                      </Typography>
                    ) : null}
                    <Typography variant="body2">
                      Mileage: {t.startingMileage} → {t.endingMileage}
                    </Typography>
                    {t.milesDriven !== null ? (
                      <Typography variant="body2">
                        Total miles driven: {t.milesDriven}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="warning.main">
                        Total miles driven: n/a (end lower than start)
                      </Typography>
                    )}
                    {t.gasAdded ? (
                      <Typography variant="body2">
                        Gas added: $
                        {t.gasAmount != null
                          ? t.gasAmount.toFixed(2)
                          : "—"}
                        {t.gasGallons != null
                          ? ` · ${t.gasGallons.toFixed(3)} gal`
                          : ""}
                        {t.gasPricePerGallon != null
                          ? ` · ${formatPricePerGallon(t.gasPricePerGallon)}`
                          : ""}
                        {t.gasFillUpMileage != null
                          ? ` · fill-up mi ${t.gasFillUpMileage}`
                          : ""}
                      </Typography>
                    ) : null}
                    {t.gasAdded && t.gasReceiptDataUrl ? (
                      <Box
                        component="img"
                        src={t.gasReceiptDataUrl}
                        alt={
                          t.gasReceiptFileName
                            ? `Gas receipt ${t.gasReceiptFileName}`
                            : "Gas receipt"
                        }
                        sx={{
                          mt: 0.5,
                          maxWidth: 200,
                          maxHeight: 140,
                          objectFit: "contain",
                          border: 1,
                          borderColor: "divider",
                          borderRadius: 1,
                        }}
                      />
                    ) : null}
                    {t.lowerMileageNote ? (
                      <Typography variant="body2" color="warning.main">
                        Lower-mileage note: {t.lowerMileageNote}
                      </Typography>
                    ) : null}
                  </Box>
                ))
              )}
            </Box>
          )}

          {/* Maintenance form + history */}
          {selectedVehicleId && recordMode === "maintenance" && (
            <>
              <Box
                component="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveMaint();
                }}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  maxWidth: 480,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Add maintenance — {selectedLabel}
                </Typography>

                <FormControl>
                  <FormLabel id="maint-service-label">Service type</FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="maint-service-label"
                    value={maintServiceType}
                    onChange={(e) =>
                      setMaintServiceType(
                        e.target.value as MaintenanceServiceType
                      )
                    }
                  >
                    {MAINTENANCE_SERVICE_OPTIONS.map((opt) => (
                      <FormControlLabel
                        key={opt.id}
                        value={opt.id}
                        control={<Radio />}
                        label={opt.label}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>

                <TextField
                  label="Date"
                  type="date"
                  size="small"
                  value={maintDate}
                  onChange={(e) => setMaintDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    alignItems: "flex-start",
                  }}
                >
                  <TextField
                    label="Time"
                    type="time"
                    size="small"
                    value={maintTime}
                    onChange={(e) => setMaintTime(e.target.value)}
                    onFocus={() => {
                      if (!maintTime) setMaintTime(chicagoTimeNow());
                    }}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ flex: "1 1 160px" }}
                    helperText="Central time (Oklahoma). Empty + click fills now."
                  />
                  <Button
                    type="button"
                    size="small"
                    variant="outlined"
                    onClick={() => setMaintTime(chicagoTimeNow())}
                    sx={{ mt: 0.5 }}
                  >
                    Now
                  </Button>
                </Box>
                <TextField
                  label="Mileage at service"
                  size="small"
                  value={maintMileageRaw}
                  onChange={(e) => setMaintMileageRaw(e.target.value)}
                  helperText="Odometer when service was done. Prefill is last trip end; edit to match the dash."
                />
                <TextField
                  label="Amount ($)"
                  size="small"
                  value={maintAmountRaw}
                  onChange={(e) => setMaintAmountRaw(e.target.value)}
                  onBlur={() => {
                    const n = parseNonNegativeMoney(maintAmountRaw);
                    if (n !== null) setMaintAmountRaw(formatMoneyInput(n));
                  }}
                  inputMode="decimal"
                  required
                  error={
                    maintAmountRaw.trim() !== "" && maintAmount === null
                  }
                  helperText={
                    maintAmountRaw.trim() !== "" && maintAmount === null
                      ? "Enter a valid amount $0.00 or greater"
                      : "Formats to dollars (e.g. 45 → 45.00). $0.00 allowed."
                  }
                />
                <TextField
                  label="Vendor / location"
                  size="small"
                  value={maintVendor}
                  onChange={(e) => setMaintVendor(e.target.value)}
                />
                <TextField
                  label="Notes"
                  size="small"
                  multiline
                  minRows={2}
                  value={maintNotes}
                  onChange={(e) => setMaintNotes(e.target.value)}
                />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Receipt image (optional)
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    <Button
                      type="button"
                      variant="contained"
                      size="small"
                      onClick={() => handleOpenCamera("maintenance")}
                    >
                      Take photo
                    </Button>
                    <Button variant="outlined" component="label" size="small">
                      {maintReceiptFileName
                        ? `Change file: ${maintReceiptFileName}`
                        : "Choose from files"}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                          const f = e.target.files?.[0] ?? null;
                          void handleReceiptFileChange("maintenance", f);
                          e.target.value = "";
                        }}
                      />
                    </Button>
                  </Box>
                  {maintReceiptDataUrl ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      <Box
                        component="img"
                        src={maintReceiptDataUrl}
                        alt="Maintenance receipt preview"
                        sx={{
                          maxWidth: 240,
                          maxHeight: 180,
                          objectFit: "contain",
                          border: 1,
                          borderColor: "divider",
                          borderRadius: 1,
                        }}
                      />
                      <Button
                        type="button"
                        size="small"
                        onClick={() =>
                          void handleReceiptFileChange("maintenance", null)
                        }
                      >
                        Remove receipt
                      </Button>
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Optional. Images auto-shrink under mock size cap.
                    </Typography>
                  )}
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={!canSaveMaint}
                >
                  Save maintenance
                </Button>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Maintenance history — {selectedLabel}
                </Typography>
                {vehicleMaintenances.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No maintenance records for this vehicle yet.
                  </Typography>
                ) : (
                  vehicleMaintenances.map((m) => {
                    const serviceLabel =
                      MAINTENANCE_SERVICE_OPTIONS.find(
                        (o) => o.id === m.serviceType
                      )?.label ?? m.serviceType;
                    return (
                      <Box
                        key={m.id}
                        sx={{
                          border: 1,
                          borderColor: "divider",
                          borderRadius: 1,
                          p: 1.5,
                          maxWidth: 480,
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatDisplayDate(m.date)}
                          {m.time ? ` ${formatDisplayTime(m.time)}` : ""} —{" "}
                          {serviceLabel}
                        </Typography>
                        <Typography variant="body2">
                          Mileage: {m.mileageAtService}
                        </Typography>
                        <Typography variant="body2">
                          Amount: ${m.amount.toFixed(2)}
                        </Typography>
                        {m.vendor ? (
                          <Typography variant="body2" color="text.secondary">
                            {m.vendor}
                          </Typography>
                        ) : null}
                        {m.notes ? (
                          <Typography variant="body2" color="text.secondary">
                            {m.notes}
                          </Typography>
                        ) : null}
                        {m.receiptDataUrl ? (
                          <Box
                            component="img"
                            src={m.receiptDataUrl}
                            alt={
                              m.receiptFileName
                                ? `Receipt ${m.receiptFileName}`
                                : "Maintenance receipt"
                            }
                            sx={{
                              mt: 0.5,
                              maxWidth: 200,
                              maxHeight: 140,
                              objectFit: "contain",
                              border: 1,
                              borderColor: "divider",
                              borderRadius: 1,
                            }}
                          />
                        ) : (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            No receipt attached
                          </Typography>
                        )}
                      </Box>
                    );
                  })
                )}
              </Box>
            </>
          )}
        </>
      )}

      {pageView === "reports" && (
        <>
          {/* Global print CSS: hide hub chrome + on-screen controls; print body only */}
          <style>{`
            @media print {
              @page {
                size: letter;
                margin: 0.5in;
              }
              html, body {
                background: #fff !important;
                height: auto !important;
                overflow: visible !important;
              }
              /* Hide everything by default */
              body * {
                visibility: hidden !important;
              }
              /* Show only the formal report root */
              #vehicles-report-print,
              #vehicles-report-print * {
                visibility: visible !important;
              }
              #vehicles-report-print {
                position: absolute;
                left: 0;
                top: 0;
                width: 100% !important;
                max-width: none !important;
                padding: 0 !important;
                margin: 0 !important;
                gap: 12px !important;
                color: #000 !important;
              }
              /* Belt-and-suspenders for anything tagged no-print */
              .vehicles-report-no-print {
                display: none !important;
                visibility: hidden !important;
              }
              /* Tables use full printable width */
              #vehicles-report-print .vehicles-report-table-wrap {
                overflow: visible !important;
                width: 100% !important;
              }
              #vehicles-report-print .vehicles-report-table {
                width: 100% !important;
              }
              /* Prefer header staying with start of body */
              #vehicles-report-print .vehicles-report-print-header {
                break-after: avoid;
                page-break-after: avoid;
              }
              #vehicles-report-print .vehicles-report-section-title {
                break-after: avoid;
                page-break-after: avoid;
              }
            }
          `}</style>

          {/* SCREEN-ONLY: filters / print button / helper copy */}
          <Box
            className="vehicles-report-no-print"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              maxWidth: 960,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Reports
              </Typography>
              <Button
                type="button"
                size="small"
                variant="outlined"
                onClick={() => window.print()}
              >
                Print
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary">
              Fuel-only content uses fill-ups saved on trips (Gas added = Yes).
              Print uses the preview below (filters stay on screen only).
            </Typography>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Period
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {(
                  [
                    ["day", "Day"],
                    ["month", "Month"],
                    ["year", "Year"],
                  ] as const
                ).map(([id, label]) => (
                  <Chip
                    key={id}
                    label={label}
                    color={reportPeriod === id ? "primary" : "default"}
                    variant={reportPeriod === id ? "filled" : "outlined"}
                    onClick={() => setReportPeriod(id)}
                    sx={{ cursor: "pointer" }}
                  />
                ))}
              </Box>
            </Box>

            <TextField
              label={
                reportPeriod === "day"
                  ? "Day"
                  : reportPeriod === "month"
                    ? "Any day in month"
                    : "Any day in year"
              }
              type="date"
              size="small"
              value={reportAnchorDate}
              onChange={(e) => setReportAnchorDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              helperText={`Anchor date (Central). Key: ${reportSummary.periodKey}`}
            />

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Vehicle
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                <Chip
                  label="All"
                  color={reportVehicleFilter === "all" ? "primary" : "default"}
                  variant={
                    reportVehicleFilter === "all" ? "filled" : "outlined"
                  }
                  onClick={() => setReportVehicleFilter("all")}
                  sx={{ cursor: "pointer" }}
                />
                {VEHICLE_OPTIONS.map((v) => (
                  <Chip
                    key={v.id}
                    label={v.label}
                    color={reportVehicleFilter === v.id ? "primary" : "default"}
                    variant={
                      reportVehicleFilter === v.id ? "filled" : "outlined"
                    }
                    onClick={() => setReportVehicleFilter(v.id)}
                    sx={{ cursor: "pointer" }}
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Content
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {(
                  [
                    ["everything", "Everything"],
                    ["mileage", "Mileage"],
                    ["fuel", "Fuel"],
                    ["maintenance", "Maintenance"],
                  ] as const
                ).map(([id, label]) => (
                  <Chip
                    key={id}
                    label={label}
                    color={reportContentFilter === id ? "primary" : "default"}
                    variant={
                      reportContentFilter === id ? "filled" : "outlined"
                    }
                    onClick={() => setReportContentFilter(id)}
                    sx={{ cursor: "pointer" }}
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Mileage type
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {(
                  [
                    ["all", "All"],
                    ["hope_house", "Hope House"],
                    ["personal", "Personal"],
                  ] as const
                ).map(([id, label]) => (
                  <Chip
                    key={id}
                    label={label}
                    color={reportMileageFilter === id ? "primary" : "default"}
                    variant={
                      reportMileageFilter === id ? "filled" : "outlined"
                    }
                    onClick={() => setReportMileageFilter(id)}
                    sx={{ cursor: "pointer" }}
                  />
                ))}
              </Box>
            </Box>

            {reportPeriod === "year" && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={reportIncludeYearDetails}
                    onChange={(e) =>
                      setReportIncludeYearDetails(e.target.checked)
                    }
                    size="small"
                  />
                }
                label="Include detailed records"
              />
            )}
          </Box>

          {/* PRINT + on-screen preview: letterhead + tables only */}
          <Box
            id="vehicles-report-print"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              maxWidth: 960,
              mt: 1,
            }}
          >
            <VehicleReportPrintHeader
              period={reportPeriod}
              periodKey={reportSummary.periodKey}
              vehicleFilter={reportVehicleFilter}
              contentFilter={reportContentFilter}
              mileageFilter={reportMileageFilter}
              vehicleLabel={vehicleLabel}
              formatDisplayDate={formatDisplayDate}
              includeYearDetails={
                reportPeriod === "year" ? reportIncludeYearDetails : undefined
              }
            />

            {reportPeriod === "day" || reportPeriod === "month" ? (
              <DayMonthReportTables
                period={reportPeriod}
                periodKey={reportSummary.periodKey}
                contentFilter={reportContentFilter}
                summary={reportSummary}
                trips={reportTrips}
                fuels={reportFuels}
                allFuels={allFuels}
                maints={reportMaints}
                fmt={{
                  vehicleLabel,
                  formatDisplayDate,
                  formatDisplayTime,
                }}
              />
            ) : (
              <YearReportTables
                yearKey={reportSummary.periodKey}
                contentFilter={reportContentFilter}
                vehicleFilter={reportVehicleFilter}
                mileageFilter={reportMileageFilter}
                yearSummary={reportSummary}
                includeDetailedRecords={reportIncludeYearDetails}
                trips={reportTrips}
                fuels={reportFuels}
                allFuels={allFuels}
                maints={reportMaints}
                allTrips={trips}
                allMaintenances={maintenances}
                fmt={{
                  vehicleLabel,
                  formatDisplayDate,
                  formatDisplayTime,
                }}
              />
            )}
          </Box>
        </>
      )}

      {/* Camera dialog */}
      <Dialog
        open={cameraOpen}
        onClose={handleCloseCamera}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Receipt camera —{" "}
          {receiptCameraTarget === "maintenance" ? "Maintenance" : "Trip gas"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
        >
          {cameraError ? (
            <Typography variant="body2" color="error">
              {cameraError}
            </Typography>
          ) : (
            <Box
              component="video"
              ref={videoRef}
              autoPlay
              playsInline
              muted
              sx={{
                width: "100%",
                maxHeight: 360,
                bgcolor: "common.black",
                borderRadius: 1,
                objectFit: "contain",
              }}
            />
          )}
          <Typography variant="caption" color="text.secondary">
            Point at the receipt, then Capture. Cancel closes the camera.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={handleCloseCamera}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={handleSnapReceipt}
            disabled={!!cameraError}
          >
            Capture
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lower mileage warning */}
      <Dialog
        open={lowerMiOpen}
        onClose={handleCloseLowerMi}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Ending mileage is lower than start</DialogTitle>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveAnyway();
          }}
        >
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
          >
            <Typography variant="body2">
              Start: {startMi ?? "—"} · End: {endMi ?? "—"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Odometer usually only goes up. Go back to fix the numbers, or Save
              Anyway and explain why (required for the audit trail).
            </Typography>
            <TextField
              label="Why is ending lower? (required)"
              size="small"
              value={lowerMiNote}
              onChange={(e) => setLowerMiNote(e.target.value)}
              multiline
              minRows={2}
              autoFocus
              required
            />
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={handleCloseLowerMi}>
              Go back
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="warning"
              disabled={!lowerMiNote.trim()}
            >
              Save Anyway
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
