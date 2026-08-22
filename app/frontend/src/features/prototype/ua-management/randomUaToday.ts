/**
 * UA Management — Phase 4 Random UAs Today helpers (mock/FE only).
 * Build a stable desk board from a REVEALED seal; mark pending/done.
 * Does not redraw the five. Mark done does NOT update client lastUaDate
 * (that needs UA form submit + backend history later).
 * Phases 0–8 FE mock. Resume: page STATUS header.
 */
import { isSealRevealed } from "./sealReveal";
import type {
  RandomUaTodayBoard,
  RandomUaTodayItem,
  RandomUaTodayStatus,
  SealedWeekClientDraw,
} from "./types";

/**
 * Build today's board from seal when revealed for asOfDate.
 * Returns null if no seal or still hidden (no leak).
 * All items start pending, completedAt null.
 */
export function buildRandomUaTodayBoard(
  seal: SealedWeekClientDraw | null,
  asOfDate: string,
): RandomUaTodayBoard | null {
  if (!seal) return null;
  if (!isSealRevealed(seal, asOfDate)) return null;

  const items: RandomUaTodayItem[] = seal.clients.map((c) => ({
    clientId: c.clientId,
    displayName: c.displayName,
    statusAtSeal: c.statusAtSeal,
    daysSinceAtSeal: c.daysSinceAtSeal,
    completion: "pending",
    completedAt: null,
  }));

  return {
    weekId: seal.weekId,
    randomDate: seal.randomDate,
    randomDay: seal.randomDay,
    items,
  };
}

/**
 * Set one client's completion. Returns a new board (immutable).
 * Unknown clientId -> same board unchanged.
 */
export function setRandomUaTodayCompletion(
  board: RandomUaTodayBoard,
  clientId: string,
  completion: RandomUaTodayStatus,
  completedAt: string | null = completion === "done"
    ? new Date().toISOString()
    : null,
): RandomUaTodayBoard {
  return {
    ...board,
    items: board.items.map((item) => {
      if (item.clientId !== clientId) return item;
      return {
        ...item,
        completion,
        completedAt: completion === "done" ? completedAt : null,
      };
    }),
  };
}

/**
 * Keep done flags when seal weekId+randomDate still match.
 * New seal or different day -> rebuild fresh (all pending).
 * prev null -> build from seal if revealed.
 */
export function syncRandomUaTodayBoard(
  seal: SealedWeekClientDraw | null,
  asOfDate: string,
  prev: RandomUaTodayBoard | null,
): RandomUaTodayBoard | null {
  const fresh = buildRandomUaTodayBoard(seal, asOfDate);
  if (!fresh) return null;
  if (
    prev &&
    prev.weekId === fresh.weekId &&
    prev.randomDate === fresh.randomDate
  ) {
    // Same seal day: keep completion by clientId
    const prevById = new Map(prev.items.map((i) => [i.clientId, i]));
    return {
      ...fresh,
      items: fresh.items.map((item) => {
        const old = prevById.get(item.clientId);
        if (!old) return item;
        return {
          ...item,
          completion: old.completion,
          completedAt: old.completedAt,
        };
      }),
    };
  }
  return fresh;
}
