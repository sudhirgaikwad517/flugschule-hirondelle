// Birth dates across this app - old migrated bookings/users, and the live
// registration/booking forms (Anmeldung.tsx, EventBookingModal.tsx) - are
// stored as raw free-text, in either "DD.MM.YYYY" (German, from the
// TT.MM.JJJJ-labelled text inputs) or an ISO-ish "YYYY-MM-DD HH:MM:SS"
// shape (from an older form revision or admin edit). `new Date("02.06.1981")`
// silently misparses that as month/day swapped (6 February instead of the
// real 2 June) - these helpers parse both formats correctly before any
// display or <input type="date"> use.
export function parseBirthDate(raw: unknown): Date | null {
  if (!raw) return null;
  const str = String(raw);
  const german = str.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
  if (german) {
    const [, d, m, y] = german;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const [, y, m, d] = iso;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  return null;
}

export function formatBirthDateDisplay(raw: unknown): string {
  const d = parseBirthDate(raw);
  return d ? d.toLocaleDateString('de-DE') : String(raw ?? '');
}

// Local-getter formatting (not toISOString()) so the calendar date can't
// shift by a day across timezones - <input type="date"> requires this
// exact YYYY-MM-DD shape.
export function formatBirthDateForInput(raw: unknown): string {
  const d = parseBirthDate(raw);
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
