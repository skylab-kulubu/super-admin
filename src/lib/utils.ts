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

/**
 * Parses an API timestamp string (e.g., "2024-09-09 00:00:00.0") into "yyyy-MM-dd" format.
 * Suitable for <input type="date">.
 * @param apiTimestamp The API timestamp string.
 * @returns The date string in "yyyy-MM-dd" format, or empty string if invalid.
 */
export function parseApiTimestampToYyyyMmDd(apiTimestamp: string | undefined | null): string {
  if (!apiTimestamp) return "";
  try {
    const date = new Date(apiTimestamp);
    if (isNaN(date.getTime())) return ""; // Invalid date
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error parsing API timestamp:", error);
    return "";
  }
}

/**
 * Formats a Date object or a date string (parsable by new Date()) into "yyyy-MM-dd" format.
 * Suitable for <input type="date">.
 * @param date The date to format.
 * @returns The formatted date string, or empty string if invalid.
 */
export function formatDateToYyyyMmDd(date: Date | string | undefined | null): string {
  if (!date) return "";
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return ""; // Invalid date
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date to yyyy-MM-dd:", error);
    return "";
  }
}

/**
 * Formats a Date object or a date string (parsable by new Date()) into "dd-MM-yyyy" format.
 * Suitable for API submission for AGC Seasons.
 * @param date The date to format.
 * @returns The formatted date string, or empty string if invalid.
 */
export function formatDateToDdMmYyyy(date: Date | string | undefined | null): string {
  if (!date) return "";
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return ""; // Invalid date
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error("Error formatting date to dd-MM-yyyy:", error);
    return "";
  }
}

/**
 * Formats a date string (e.g., "yyyy-MM-dd" or a full timestamp parsable by new Date()) 
 * into a locale-specific date string for display.
 * @param dateString The date string to format.
 * @returns The localized date string, or "-" if invalid/empty.
 */
export function formatDateToLocale(dateString: string | undefined | null): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-"; // Invalid date
    // Adjust to ensure the date is interpreted as local, especially if only yyyy-MM-dd is passed
    // For "yyyy-MM-dd", new Date() might interpret it as UTC.
    // A common trick is to replace hyphens with slashes for cross-browser consistency or manually parse.
    // However, for display, toLocaleDateString usually handles it well if the input string is unambiguous enough.
    // If dateString is "yyyy-MM-dd", it's better to parse it carefully to avoid timezone issues.
    // For simplicity here, we'll assume `new Date()` handles it sufficiently for `toLocaleDateString`.
    // If `dateString` is already "yyyy-MM-ddTHH:mm" or a full ISO string, it's generally fine.
    // If it's just "yyyy-MM-dd", it might be UTC.
    // A safer approach for "yyyy-MM-dd" specifically:
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day).toLocaleDateString(navigator.language || 'tr-TR', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        });
    }
    return date.toLocaleDateString(navigator.language || 'tr-TR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  } catch (error) {
    console.error("Error formatting date to locale:", error);
    return "-";
  }
}
