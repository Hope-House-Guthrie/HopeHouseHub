/**
 * Light client free-text cleanup for Maintenance Requests (Phase 2).
 * Formatting only — not grammar rewrite / not AI.
 * BACKEND: optional server-side normalize later; FE is convenience.
 */

export type ClientTextCleanupMode = "phrase" | "sentence";

function isMostlyAllCaps(raw: string): boolean {
  const letters = raw.replace(/[^A-Za-z]/g, "");
  if (letters.length < 3) return false;
  const upper = letters.replace(/[^A-Z]/g, "").length;
  return upper / letters.length >= 0.85;
}

function collapseSpaces(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** Simple punctuation spacing: "hello ,world" → "hello, world" */
function tidyPunctuationSpacing(s: string): string {
  let out = s;
  out = out.replace(/\s+([,.;:!?])/g, "$1");
  out = out.replace(/([,.;:!?])(?![\s"'’)\]}]|$)/g, "$1 ");
  out = out.replace(/\s+/g, " ").trim();
  return out;
}

function capitalizeFirstLetter(s: string): string {
  if (!s) return s;
  const i = s.search(/[A-Za-z]/);
  if (i < 0) return s;
  return s.slice(0, i) + s.charAt(i).toUpperCase() + s.slice(i + 1);
}

/**
 * If the whole entry was accidental ALL CAPS, lower then restore known acronyms.
 * Leaves mixed-case text alone (except first-letter capital later).
 */
function normalizeAccidentalAllCaps(s: string): string {
  if (!isMostlyAllCaps(s)) return s;
  let out = s.toLowerCase();
  // Longer / special forms first
  out = out.replace(/\ba\/c\b/gi, "A/C");
  out = out.replace(/\bhvac\b/gi, "HVAC");
  out = out.replace(/\bwifi\b/gi, "WiFi");
  out = out.replace(/\bdvd\b/gi, "DVD");
  out = out.replace(/\busb\b/gi, "USB");
  out = out.replace(/\bled\b/gi, "LED");
  out = out.replace(/\btv\b/gi, "TV");
  out = out.replace(/\bac\b/gi, "AC");
  return out;
}

function ensureEndingPunctuation(s: string): string {
  if (!s) return s;
  if (/[.!?]"?$/.test(s) || /[.!?]$/.test(s)) return s;
  return `${s}.`;
}

/**
 * Normalize one free-text field.
 * @param mode phrase = area/item (no forced period); sentence = description/notes
 */
export function normalizeClientText(
  raw: string,
  mode: ClientTextCleanupMode = "phrase"
): string {
  if (raw == null) return "";
  let s = String(raw);
  s = collapseSpaces(s);
  if (!s) return "";

  s = normalizeAccidentalAllCaps(s);
  s = tidyPunctuationSpacing(s);
  s = capitalizeFirstLetter(s);

  if (mode === "sentence") {
    s = ensureEndingPunctuation(s);
  }

  return s;
}
