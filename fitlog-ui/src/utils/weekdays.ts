// dayOfWeek values follow JS Date.getDay(): 0 = Pazar (Sunday) ... 6 = Cumartesi.
// The UI always shows weeks the Turkish way: Monday first, Sunday last.

/** dayOfWeek values in display order: Pazartesi … Pazar. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

/** Position of a dayOfWeek in a Monday-first week (Pazartesi = 0, Pazar = 6). */
export const mondayIndex = (dayOfWeek: number): number => (dayOfWeek + 6) % 7;

/** Sort comparator for anything with a dayOfWeek, Monday first. */
export const byMondayFirst = (a: { dayOfWeek: number }, b: { dayOfWeek: number }): number =>
  mondayIndex(a.dayOfWeek) - mondayIndex(b.dayOfWeek);
