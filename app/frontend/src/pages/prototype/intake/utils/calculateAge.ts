/**
 * Compute whole-year age from a YYYY-MM-DD (or date-input) birth date string.
 *
 * Returns "" when the value is empty. Used for minor-child age display;
 * primary client age in index.tsx currently uses a separate inline derivation
 * with the same rules (left in place to avoid behavior changes).
 */

export function calculateAge(birthDateValue: string) {
  if (!birthDateValue) return "";

  const today = new Date();
  const birthDate = new Date(`${birthDateValue}T00:00:00`);

  let calculatedAge = today.getFullYear() - birthDate.getFullYear();

  const birthdayHasPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());

  if (!birthdayHasPassed) {
    calculatedAge--;
  }

  return calculatedAge;
}
