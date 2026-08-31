/**
 * House Display — temporary FE mock birthday people (client-shaped).
 *
 * BACKEND TODO (TJ handoff):
 * Replace this mock with the shared current-client / intake birthday source
 * used by House Display TV and Kitchen Birthday Calendar.
 * Do NOT invent a second birthday database or HD-owned CRUD.
 * Production rows should still map to HouseDisplayBirthdayPerson
 * (id, displayName, birthMonth 1–12, birthDay 1–31) — no year/age on this
 * HD boundary (year may exist upstream; strip before TV/Kitchen public paint).
 *
 * Not stored on Redux / HouseDisplayContent. TV imports this constant and runs
 * selectBirthdayView with hopeNow.dateKey. Manage must not edit this list.
 */
import type { HouseDisplayBirthdayPerson } from "./birthdays";

/**
 * Includes several August birthdays and two sharing Aug 31 for multi-person testing.
 */
export const MOCK_HOUSE_DISPLAY_BIRTHDAY_PEOPLE: readonly HouseDisplayBirthdayPerson[] =
  [
    {
      id: "client-bday-001",
      displayName: "Alex M.",
      birthMonth: 8,
      birthDay: 9,
    },
    {
      id: "client-bday-002",
      displayName: "Jordan P.",
      birthMonth: 8,
      birthDay: 15,
    },
    {
      id: "client-bday-003",
      displayName: "Sam R.",
      birthMonth: 8,
      birthDay: 22,
    },
    {
      id: "client-bday-004",
      displayName: "Casey L.",
      birthMonth: 8,
      birthDay: 31,
    },
    {
      id: "client-bday-005",
      displayName: "Riley K.",
      birthMonth: 8,
      birthDay: 31,
    },
    {
      id: "client-bday-006",
      displayName: "Morgan T.",
      birthMonth: 8,
      birthDay: 15,
    },
  ];
