/**
 * Vehicles — config / seed options
 * FE complete 2026-08-22. Resume: pages/vehicles/index.tsx STATUS.
 * Fleet: Van + Truck. Maint radios: Oil Change | General Maintenance only.
 */
import type { MaintenanceServiceType, VehicleOption } from "./types";

/** Fixed fleet for mock (plan: Van + Truck). */
export const VEHICLE_OPTIONS: VehicleOption[] = [
  { id: "van", label: "Van" },
  { id: "truck", label: "Truck" },
];

/**
 * Service type radios (Oil Change + General Maintenance).
 * General covers tires, brakes, batteries, repairs, wipers, fluids, alignments, etc.
 */
export const MAINTENANCE_SERVICE_OPTIONS: {
  id: MaintenanceServiceType;
  label: string;
}[] = [
  { id: "oil_change", label: "Oil Change" },
  { id: "general", label: "General Maintenance" },
];
