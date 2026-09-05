import { resolveBookingCustomer } from './bookingCustomer';

// Bare MAT_* token substitution, matching the exact convention documented in
// the admin's TemplatesBuilder (listViews/certificates/tickets/csvXml tabs) -
// no curly braces, unlike the {TOKEN} style used by the simpler emails.* templates.
export function buildBookingPlaceholders(booking: any): Record<string, string> {
  const { name, email } = resolveBookingCustomer(booking);
  const details = (booking.customerDetails as any) || {};
  const seats = (booking.items || []).reduce((s: number, i: any) => s + i.quantity, 0);
  const [firstName, ...rest] = name.split(' ');

  return {
    MAT_BOOKING_NAME: name,
    MAT_BOOKING_EMAIL: email || '',
    MAT_BOOKING_STATUS: booking.status,
    MAT_BOOKING_FIRSTNAME: details.firstName || firstName || '',
    MAT_BOOKING_LASTNAME: details.lastName || rest.join(' ') || '',
    MAT_BOOKING_COUNTRY: details.country || '',
    MAT_BOOKING_STREET: details.street || '',
    MAT_BOOKING_ZIP: details.zip || '',
    MAT_BOOKING_CITY: details.city || '',
    MAT_BOOKING_ID: booking.id,
    MAT_BOOKING_NUMBER: booking.id.replace(/-/g, '').slice(0, 10).toUpperCase(),
    MAT_BOOKING_NRBOOKED: String(seats),
    MAT_BOOKING_PAYMENT_METHOD: booking.paymentMethod || '',
    MAT_BOOKING_PAYMENT_BRUTTO: (booking.totalPrice ?? 0).toFixed(2),
    MAT_EVENT_NUMBER: booking.event?.eventNumber || '',
    MAT_EVENT_TITLE: booking.event?.title || '',
    MAT_EVENT_BEGIN: booking.event ? new Date(booking.event.startDate).toLocaleString('de-DE') : '',
    MAT_EVENT_END: booking.event?.endDate ? new Date(booking.event.endDate).toLocaleString('de-DE') : '',
    MAT_EVENT_ALL_DETAILS_HTML: booking.event
      ? `<strong>${booking.event.title}</strong><br/>${new Date(booking.event.startDate).toLocaleString('de-DE')}${booking.event.endDate ? ' - ' + new Date(booking.event.endDate).toLocaleString('de-DE') : ''}`
      : '',
    MAT_DATE: new Date().toLocaleDateString('de-DE'),
    MAT_SIGNATURE: 'Flugschule Hirondelle',
  };
}

export function renderMatTokens(template: string, placeholders: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(placeholders)) {
    result = result.split(key).join(value);
  }
  return result;
}

// Friendly column titles for CSV placeholder tokens - used to derive a
// header row automatically from whichever tokens the admin's template uses.
const FRIENDLY_NAMES: Record<string, string> = {
  MAT_BOOKING_NAME: 'Name',
  MAT_BOOKING_EMAIL: 'E-Mail',
  MAT_BOOKING_STATUS: 'Status',
  MAT_BOOKING_FIRSTNAME: 'Vorname',
  MAT_BOOKING_LASTNAME: 'Nachname',
  MAT_BOOKING_COUNTRY: 'Land',
  MAT_BOOKING_STREET: 'Straße',
  MAT_BOOKING_ZIP: 'PLZ',
  MAT_BOOKING_CITY: 'Stadt',
  MAT_BOOKING_ID: 'ID',
  MAT_BOOKING_NUMBER: 'Buchungsnummer',
  MAT_BOOKING_NRBOOKED: 'Plätze',
  MAT_BOOKING_PAYMENT_METHOD: 'Zahlungsart',
  MAT_BOOKING_PAYMENT_BRUTTO: 'Gesamtpreis',
  MAT_EVENT_NUMBER: 'Event-Nr.',
  MAT_EVENT_TITLE: 'Event',
  MAT_EVENT_BEGIN: 'Beginn',
  MAT_EVENT_END: 'Ende',
  MAT_DATE: 'Datum',
};

// Splits a semicolon-separated CSV row template into its individual MAT_*
// tokens (in order), for deriving both the header row and each data row.
export function parseCsvTemplateTokens(template: string): string[] {
  return template.split(';').map((t) => t.trim()).filter(Boolean);
}

export function friendlyColumnName(token: string): string {
  return FRIENDLY_NAMES[token] || token.replace(/^MAT_/, '').replace(/_/g, ' ');
}

// Best-effort HTML -> plain text for templates that are authored as HTML but
// rendered into a PDFKit document (which draws text imperatively, not HTML/CSS).
// This keeps the admin's wording/placeholders in full control while being
// upfront that visual HTML styling isn't reproduced pixel-for-pixel in the PDF.
export function htmlTemplateToLines(html: string): string[] {
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, '');
  return withBreaks
    .split(/\r?\n/)
    .map((l) => l.replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').trim())
    .filter((l) => l.length > 0);
}
