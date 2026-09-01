/**
 * STATUS — Spotlight flyer prototype media catalog (Manage Add Flyer)
 * Branch: feature/house-display
 *
 * FE mock only: bundled @assets flyer URLs staff can pick without upload storage.
 * Bun serves these via @assets (public/ is NOT a real static root for HD images).
 * Not production media library. No base64. No localStorage blobs.
 * Real staff uploads → backend object storage later (TJ).
 */
import kiddosDonationUrl from "@assets/house-display/kiddos-donation.png";
import hopeChangesEverythingUrl from "@assets/house-display/hope-changes-everything.png";

export type SpotlightFlyerPrototypeAsset = {
  /** Stable catalog key (not Redux item id). */
  key: string;
  /** Staff-facing label in the sample Select. */
  label: string;
  /** Bundled image URL for HouseDisplaySpotlightItem.imageUrl. */
  imageUrl: string;
  /** Optional title prefill when staff picks this sample. */
  defaultTitle: string;
  /** Default alt text. */
  imageAlt: string;
};

/** Known good flyer PNGs already used by TV seed. */
export const SPOTLIGHT_FLYER_PROTOTYPE_ASSETS: readonly SpotlightFlyerPrototypeAsset[] =
  [
    {
      key: "kiddos-donation",
      label: "KIDDOS donation flyer",
      imageUrl: kiddosDonationUrl,
      defaultTitle: "KIDDOS",
      imageAlt: "KIDDOS donation flyer",
    },
    {
      key: "hope-changes-everything",
      label: "Hope Changes Everything flyer",
      imageUrl: hopeChangesEverythingUrl,
      defaultTitle: "Hope Changes Everything",
      imageAlt: "Hope Changes Everything / Family Reunification flyer",
    },
  ];
