/**
 * STATUS — Program logo catalog for Manage Class Image (FE mock)
 * Branch: feature/house-display
 *
 * Keys must match TV ACTIVE_EVENT_LOGOS in pages/.../house-display/index.tsx.
 * Bundled @assets only — no uploads, base64, or blob persistence.
 * Manage uses this for Select + preview; TV map stays in index.tsx (unchanged).
 */
import techQuestLogoUrl from "@assets/house-display/logos/tech-quest.png";
import iMatterLogoUrl from "@assets/house-display/logos/i-matter.png";
import dbsaLogoUrl from "@assets/house-display/logos/dbsa.png";
import naLogoUrl from "@assets/house-display/logos/na.jpeg";
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
  /** Bundled asset URL for Manage preview only. */
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
