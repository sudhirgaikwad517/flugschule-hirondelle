// Generates a list of occurrence dates from a Matukio-style recurrence rule:
// repeat type (days/weeks/months/years), optional weekday selection (for
// weeks/months), starting from a first date, ending either on a fixed date or
// after a fixed number of repeats.
export interface RecurrenceSpec {
  type: 'days' | 'weeks' | 'months' | 'years';
  weekdays: number[]; // 0=Sunday..6=Saturday - only used for weeks/months
  startDate: string;  // 'YYYY-MM-DD', the first occurrence
  endMode: 'date' | 'count';
  endDate?: string;   // 'YYYY-MM-DD', required when endMode === 'date'
  count?: number;     // required when endMode === 'count'
}

function addUnit(date: Date, amount: number, unit: RecurrenceSpec['type']): Date {
  const d = new Date(date);
  if (unit === 'days') d.setDate(d.getDate() + amount);
  else if (unit === 'weeks') d.setDate(d.getDate() + amount * 7);
  else if (unit === 'months') d.setMonth(d.getMonth() + amount);
  else if (unit === 'years') d.setFullYear(d.getFullYear() + amount);
  return d;
}

function setToWeekday(date: Date, weekday: number): Date {
  const d = new Date(date);
  const diff = weekday - d.getDay();
  d.setDate(d.getDate() + diff);
  return d;
}

function formatYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function diffInUnit(from: Date, to: Date, unit: RecurrenceSpec['type']): number {
  if (unit === 'days') return Math.round((to.getTime() - from.getTime()) / 86400000);
  if (unit === 'weeks') return Math.round((to.getTime() - from.getTime()) / (86400000 * 7));
  if (unit === 'years') return to.getFullYear() - from.getFullYear();
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
}

export function generateRecurringDates(spec: RecurrenceSpec): string[] {
  const dates: string[] = [];
  let cursor = new Date(`${spec.startDate}T00:00:00`);

  let count = spec.count ?? 0;
  if (spec.endMode === 'date' && spec.endDate) {
    const end = new Date(`${spec.endDate}T00:00:00`);
    // +1: diffInUnit counts the number of unit-boundaries between start and
    // end, but we want the occurrence count *inclusive* of both endpoints.
    count = Math.max(0, diffInUnit(cursor, end, spec.type) + 1);
  }
  if (!count || count <= 0) return [];
  if (count > 366) count = 366; // sanity cap

  const isSimple = spec.type === 'days' || spec.type === 'years';
  const weekdays = spec.weekdays?.length ? spec.weekdays : [cursor.getDay()];

  // Push the *current* period before advancing, so i=0 is spec.startDate's
  // own period - previously it advanced first, so startDate itself (and,
  // for weeks/months, its own week/month) was never included in the output.
  for (let i = 0; i < count; i++) {
    if (isSimple) {
      dates.push(formatYMD(cursor));
    } else {
      for (const wd of weekdays) {
        dates.push(formatYMD(setToWeekday(cursor, wd)));
      }
    }
    cursor = addUnit(cursor, 1, spec.type);
  }

  return Array.from(new Set(dates)).sort();
}
