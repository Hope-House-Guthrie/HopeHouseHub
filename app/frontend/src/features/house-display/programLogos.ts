/**
 * STATUS — Program / class logo catalog (FE mock)
 * Branch: feature/house-display
 *
 * Single source for program graphic keys, staff labels, bundled default image
 * URLs, Admin manage slots, and effective-image resolve (defaults + overrides).
 * Schedule stores logoKey slugs only (never image URLs).
 * Manage Class Image Select + Program / Class Graphics Manage + TV Happening Now
 * all read from here.
 *
 * Bundled @assets only for defaults. Override map holds URL strings (https /
 * path / session blob:). Durable media upload/storage = backend (not FE fake
 * infra). DEV LS may keep stable override URLs; blob:/data: stripped on persist.
 */
import techQuestLogoUrl from "@assets/house-display/logos/tech-quest.png";
import iMatterLogoUrl from "@assets/house-display/logos/i-matter.png";
import dbsaLogoUrl from "@assets/house-display/logos/dbsa.png";
import naLogoUrl from "@assets/house-display/logos/na.png";
import gameNightLogoUrl from "@assets/house-display/logos/game-night.png";

/** Known program logo keys (schedule logoKey values). */
export type HouseDisplayProgramLogoKey =
  | "tech-quest"
  | "i-matter"
  | "dbsa"
  | "na"
  | "game-night";

export type HouseDisplayProgramLogoOption = {
  key: HouseDisplayProgramLogoKey;
  /** Staff-facing Select label. */
  label: string;
  /** Bundled asset URL for Manage preview default. */
  imageUrl: string;
};

/** Catalog order for Add/Edit Class Image Select. */
export const HOUSE_DISPLAY_PROGRAM_LOGO_OPTIONS: readonly HouseDisplayProgramLogoOption[] =
  [
    {
      key: "tech-quest",
      label: "Tech Quest",
      imageUrl: techQuestLogoUrl,
    },
    {
      key: "i-matter",
      label: "I Matter",
      imageUrl: iMatterLogoUrl,
    },
    {
      key: "dbsa",
      label: "DBSA",
      imageUrl: dbsaLogoUrl,
    },
    {
      key: "na",
      label: "NA",
      imageUrl: naLogoUrl,
    },
    {
      key: "game-night",
      label: "Game Night",
      imageUrl: gameNightLogoUrl,
    },
  ];

/**
 * Bundled default art by logoKey — same URLs as OPTIONS.imageUrl.
 * TV / resolve helpers use this map so pages do not keep a second import list.
 */
export const HOUSE_DISPLAY_PROGRAM_LOGO_IMAGES: Record<
  HouseDisplayProgramLogoKey,
  string
> = {
  "tech-quest": techQuestLogoUrl,
  "i-matter": iMatterLogoUrl,
  dbsa: dbsaLogoUrl,
  na: naLogoUrl,
  "game-night": gameNightLogoUrl,
};

/**
 * Optional per-program image URL overrides from Management (Admin).
 * Missing key → bundled HOUSE_DISPLAY_PROGRAM_LOGO_IMAGES default.
 * Values are URL strings only (https / path / blob: session) — never base64
 * long-term. Schedule still stores logoKey slugs only; art lives here.
 * DEV localStorage may keep stable URLs; blob: and data: stripped on persist.
 * Production media storage = backend (not FE fake infra).
 */
export type ProgramLogoImageOverrides = Partial<
  Record<HouseDisplayProgramLogoKey, string>
>;

const LOGO_KEY_SET = new Set<string>(
  HOUSE_DISPLAY_PROGRAM_LOGO_OPTIONS.map((o) => o.key),
);

/** True when value is a known catalog logoKey. */
export function isHouseDisplayProgramLogoKey(
  value: string,
): value is HouseDisplayProgramLogoKey {
  return LOGO_KEY_SET.has(value);
}

/** Catalog row for preview, or undefined for None / unknown. */
export function findProgramLogoOption(
  logoKey: string | null | undefined,
): HouseDisplayProgramLogoOption | undefined {
  if (logoKey == null || logoKey === "") return undefined;
  return HOUSE_DISPLAY_PROGRAM_LOGO_OPTIONS.find((o) => o.key === logoKey);
}

/**
 * Bundled default image URL for a logoKey, or null if missing/unknown/blank.
 * Does not apply Admin overrides — use getProgramLogoImageWithOverrides.
 */
export function getProgramLogoImage(
  logoKey: string | null | undefined,
): string | null {
  if (logoKey == null || logoKey === "") return null;
  if (!isHouseDisplayProgramLogoKey(logoKey)) return null;

  const url = HOUSE_DISPLAY_PROGRAM_LOGO_IMAGES[logoKey];
  return typeof url === "string" && url.trim().length > 0 ? url : null;
}

/**
 * Resolve one program logo: non-empty override wins, else bundled default.
 * Used by Manage thumbs/Class Image preview and TV active-event resolve.
 */
export function getProgramLogoImageWithOverrides(
  logoKey: string | null | undefined,
  overrides?: ProgramLogoImageOverrides | null,
): string | null {
  if (logoKey == null || logoKey === "") return null;
  if (!isHouseDisplayProgramLogoKey(logoKey)) return null;

  const raw = overrides?.[logoKey];
  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw.trim();
  }

  return getProgramLogoImage(logoKey);
}

/**
 * Manage UI order for Program / Class Graphics (staff labels).
 * Same order as HOUSE_DISPLAY_PROGRAM_LOGO_OPTIONS. Display/catalog only —
 * schedule still stores logoKey on the class/event row.
 */
export interface ProgramLogoManageSlot {
  logoKey: HouseDisplayProgramLogoKey;
  /** Staff-facing label on Management */
  label: string;
}

/** Catalog rows for the Admin Program / Class Graphics card. */
export const PROGRAM_LOGO_MANAGE_SLOTS: readonly ProgramLogoManageSlot[] =
  HOUSE_DISPLAY_PROGRAM_LOGO_OPTIONS.map((o) => ({
    logoKey: o.key,
    label: o.label,
  }));

/**
 * Hub role required to see/change Program / Class Graphics on Manage.
 * FE hide only — backend must enforce later. Matches route role token "ADMIN".
 */
export const PROGRAM_LOGO_GRAPHICS_MANAGE_ROLES: readonly string[] = ["ADMIN"];

/** True when the signed-in user may manage program/class logo art. */
export function canManageProgramLogoGraphics(
  userRoles: readonly string[] | null | undefined,
): boolean {
  if (userRoles == null || userRoles.length === 0) return false;
  return PROGRAM_LOGO_GRAPHICS_MANAGE_ROLES.some((required) =>
    userRoles.includes(required),
  );
}
