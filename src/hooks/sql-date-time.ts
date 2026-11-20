/**
 * Format a Date as yyyy-MM-dd using the local calendar date (not UTC).
 * Avoids off-by-one-day bugs for timezones ahead of UTC (e.g. Asia/Colombo).
 */
export const toMySQLDateTime = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Parse API date strings into a local calendar Date (midnight local).
 * Use when binding date-only fields to date pickers or displaying stored dates.
 */
export const parseLocalDate = (value: string | Date): Date => {
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  const datePart = value.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [year, month, day] = datePart.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(value);
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};
