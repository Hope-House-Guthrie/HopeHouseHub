/**
 * Compute whole-year age from a YYYY-MM-DD (or date-input) birth date string.
 *
 * Returns "" when the value is empty. Used for primary-client and minor-child
 * age display in the Intake prototype.
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
