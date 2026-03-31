export const MATCH_TZ = "Asia/Kolkata";

export function getTodayInTimeZone(timeZone = MATCH_TZ) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(new Date());
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

export function formatDateLabel(dateLike, timeZone = MATCH_TZ) {
  const value = dateLike.includes("T") ? dateLike : `${dateLike}T12:00:00Z`;
  return new Date(value).toLocaleDateString("en-IN", {
    timeZone,
    day: "numeric",
    month: "short",
  });
}

export function formatMatchTime(utcDate, timeZone = MATCH_TZ) {
  return new Date(utcDate).toLocaleTimeString("en-IN", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  });
}

export function isLocked(lockTimeUtc) {
  return Date.now() >= new Date(lockTimeUtc).getTime();
}

export function isPast(startTimeUtc) {
  return Date.now() > new Date(startTimeUtc).getTime();
}
