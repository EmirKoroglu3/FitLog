// Local date/time helpers. `toISOString()` is UTC, so using it for <input type="date">
// defaults or day boundaries shifts values by the user's offset (e.g. 03:00 in Türkiye).

const pad = (n: number) => String(n).padStart(2, '0');

/** "YYYY-MM-DD" in the user's local time zone. */
export function toLocalDateInput(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "HH:mm" in the user's local time zone. */
export function toLocalTimeInput(d: Date = new Date()): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Combine local date ("YYYY-MM-DD") and time ("HH:mm") inputs into a UTC ISO string. */
export function localInputsToIso(date: string, time = '12:00'): string {
  return new Date(`${date}T${time}`).toISOString();
}

/** Start and end (exclusive) of the user's local day, as UTC ISO strings. */
export function localDayRange(d: Date = new Date()): { start: string; end: string } {
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}
