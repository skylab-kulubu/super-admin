/**
 * Formats a Date object or a date string into "dd-MM-yyyy HH:mm" format.
 * @param date The date to format.
 * @returns The formatted date string.
 */
export function formatDateTimeForApi(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

/**
 * Parses a "dd-MM-yyyy HH:mm" date string into a format suitable for datetime-local input.
 * @param dateString The date string to parse.
 * @returns The date string in "yyyy-MM-ddTHH:mm" format, or empty string if invalid.
 */
export function parseApiDateTimeToInput(dateString: string): string {
  if (!dateString) return "";
  const parts = dateString.match(/(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})/);
  if (!parts) return "";
  // parts = ["dd-MM-yyyy HH:mm", "dd", "MM", "yyyy", "HH", "mm"]
  return `${parts[3]}-${parts[2]}-${parts[1]}T${parts[4]}:${parts[5]}`;
}
