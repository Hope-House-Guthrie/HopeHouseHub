/**
 * Maintenance Requests — DEV fixtures (isolated)
 *
 * Phase 1: structure + empty helpers only.
 * Full multi-status seed pack + Mike status simulation = later phase.
 *
 * Import only from DEV-gated UI / DEV hydrate paths.
 * Not security. Removable for production builds.
 *
 * Storage approach (DEV-only):
 * - Key: DEV_MR_STORAGE_KEY in config.ts
 * - Payload shape: DevMrPersistedV1
 * - Slice may load/save when import.meta.env.DEV; never as prod persistence
 */

import type { DevMockClient, MaintenanceRequest } from "./types";
import { DEV_MOCK_CLIENTS, DEV_MR_STORAGE_KEY } from "./config";

/** Versioned DEV localStorage payload (requests only for now). */
export interface DevMrPersistedV1 {
  version: 1;
  /** Last DEV “as client” id */
  activeDevClientId: string;
  /** Mock tickets (empty until submit phase / seed pack) */
  requests: MaintenanceRequest[];
  /** Mock MR sequence within year for MR-YYYY-#### */
  mrSeq: number;
}

export function defaultDevPersisted(
  activeDevClientId: string = DEV_MOCK_CLIENTS[0]?.id ?? "dev-client-alex",
): DevMrPersistedV1 {
  return {
    version: 1,
    activeDevClientId,
    requests: [],
    mrSeq: 0,
  };
}

/**
 * Read DEV payload from localStorage. Returns null if missing/invalid/not browser.
 * Callers must gate with import.meta.env.DEV.
 */
export function loadDevMrPersisted(): DevMrPersistedV1 | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DEV_MR_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DevMrPersistedV1;
    if (parsed?.version !== 1 || !Array.isArray(parsed.requests)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Write DEV payload. No-op outside browser.
 * Callers must gate with import.meta.env.DEV.
 */
export function saveDevMrPersisted(data: DevMrPersistedV1): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DEV_MR_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Quota / private mode — ignore in mock foundation
  }
}

/** Clear DEV MR storage (DEV controls later). */
export function clearDevMrPersisted(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DEV_MR_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function findDevMockClient(id: string): DevMockClient | undefined {
  return DEV_MOCK_CLIENTS.find((c) => c.id === id);
}

/**
 * PLACEHOLDER — Phase 7+ full seed pack (statuses, photos, cancel, etc.).
 * Do not call from Phase 1 UI.
 */
export function buildFullDevSeedPack(): MaintenanceRequest[] {
  return [];
}
