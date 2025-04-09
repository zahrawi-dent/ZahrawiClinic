// src/lib/dateUtils.ts (or similar)

// Formats a Date object into 'YYYY-MM-DD HH:MM:SS' format suitable for PocketBase filters
// PocketBase usually expects UTC times in filters.
function formatDateForPB(date: Date): string {
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function getStartOfDayUTC(): Date {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return now;
}

export function getEndOfDayUTC(): Date {
  const now = new Date();
  now.setUTCHours(23, 59, 59, 999);
  return now;
}

export function getStartOfWeekUTC(): Date {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
  const diff = now.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
  const startOfWeek = new Date(now.setUTCDate(diff));
  startOfWeek.setUTCHours(0, 0, 0, 0);
  return startOfWeek;
}

export function getStartOfDayString(): string {
  return formatDateForPB(getStartOfDayUTC());
}

export function getEndOfDayString(): string {
  return formatDateForPB(getEndOfDayUTC());
}

export function getStartOfWeekString(): string {
  return formatDateForPB(getStartOfWeekUTC());
}
