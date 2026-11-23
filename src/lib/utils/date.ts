/**
 * Shared Business Date & Time Utilities
 *
 * Configured default platform business timezone: Asia/Kolkata (IST).
 * Guarantees zero unintended UTC day-boundary shifting for LocalDate strings (YYYY-MM-DD).
 */

export const BUSINESS_TIMEZONE = "Asia/Kolkata";

/**
 * Returns today's business date formatted as YYYY-MM-DD in Asia/Kolkata timezone.
 * Unlike new Date().toISOString().split('T')[0] (which returns UTC day),
 * this handles local midnight transitions accurately.
 */
export function getBusinessToday(referenceDate?: Date): string {
  const d = referenceDate || new Date();
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: BUSINESS_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = formatter.formatToParts(d);
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    if (year && month && day) {
      return `${year}-${month}-${day}`;
    }
  } catch {
    // Fallback if Intl timeZone is unavailable
  }

  // Fallback to local machine date
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parses a date-only string (YYYY-MM-DD) into a Date instance anchored at local noon
 * to completely eliminate 1-day boundary shifts in any browser timezone.
 */
export function parseDateOnly(dateStr: string): Date {
  if (!dateStr || typeof dateStr !== "string") {
    return new Date(NaN);
  }
  const cleanStr = dateStr.trim();
  const match = cleanStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    return new Date(year, month, day, 12, 0, 0);
  }
  return new Date(cleanStr);
}

/**
 * Checks whether a YYYY-MM-DD date is strictly in the past relative to the business today.
 */
export function isPastBusinessDate(
  dateStr: string,
  referenceToday?: string
): boolean {
  if (!dateStr) return false;
  const today = referenceToday || getBusinessToday();
  const cleanDate = dateStr.trim().substring(0, 10);
  return cleanDate < today;
}

/**
 * Formats a date-only string or Date instance into a user-friendly date string (e.g. "Oct 15, 2026").
 * For YYYY-MM-DD values, preserves exact calendar day without UTC conversion offset.
 */
export function formatBusinessDate(
  dateInput: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateInput) return "";

  try {
    if (typeof dateInput === "string") {
      const trimmed = dateInput.trim();
      const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        const d = parseDateOnly(trimmed);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            ...options,
          });
        }
      }
    }

    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    return d.toLocaleDateString("en-US", {
      timeZone: BUSINESS_TIMEZONE,
      month: "short",
      day: "numeric",
      year: "numeric",
      ...options,
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Formats a date/time timestamp into a user-friendly format (e.g. "Oct 15, 2026, 10:30 AM")
 * in the configured business timezone.
 */
export function formatBusinessDateTime(
  dateInput: string | Date | null | undefined
): string {
  if (!dateInput) return "";

  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    return d.toLocaleDateString("en-US", {
      timeZone: BUSINESS_TIMEZONE,
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Formats genuine backend time strings (e.g. "14:30:00", "09:00", "14:30")
 * into localized 12-hour format ("02:30 PM", "09:00 AM").
 * Does not manufacture a time if missing or empty.
 */
export function formatBusinessTime(timeStr?: string | null): string {
  if (!timeStr || !timeStr.trim()) return "";
  const trimmed = timeStr.trim();

  // If already formatted like "10:30 AM" or "02:00 PM", return cleanly
  if (/^\d{1,2}:\d{2}\s*(?:AM|PM)$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  // Match HH:mm or HH:mm:ss
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    if (hours >= 0 && hours < 24) {
      const period = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      const formattedHours = String(hours).padStart(2, "0");
      return `${formattedHours}:${minutes} ${period}`;
    }
  }

  return trimmed;
}

// Backward-compatible aliases for existing components
export const formatFriendlyDate = formatBusinessDate;
export const formatDateTime = formatBusinessDateTime;
