// Generates a standard iCalendar (.ics) VCALENDAR file - the same format
// Matukio used, which Google Calendar/Outlook/Apple Calendar all import
// natively (there's no separate "Google Calendar button" - just one .ics
// file that every calendar app can open).

function foldLine(line: string): string {
  // RFC 5545 requires folding lines longer than 75 octets - not strictly
  // required for compatibility with modern calendar apps, but keeps output
  // spec-correct for stricter parsers.
  if (line.length <= 75) return line;
  let result = '';
  let rest = line;
  while (rest.length > 75) {
    result += rest.slice(0, 75) + '\r\n ';
    rest = rest.slice(75);
  }
  return result + rest;
}

function escapeText(text: string): string {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

function formatDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

interface IcsEvent {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startDate: Date;
  endDate?: Date | null;
  organizer?: string | null;
}

export function buildIcsCalendar(events: IcsEvent[], baseUrl: string): string {
  const now = formatDate(new Date());
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Flugschule Hirondelle//Events//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  for (const event of events) {
    const start = event.startDate;
    const end = event.endDate || new Date(start.getTime() + 2 * 60 * 60 * 1000);
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.id}@fs-hirondelle.de`);
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART:${formatDate(start)}`);
    lines.push(`DTEND:${formatDate(end)}`);
    lines.push(foldLine(`SUMMARY:${escapeText(event.title)}`));
    if (event.location) lines.push(foldLine(`LOCATION:${escapeText(event.location)}`));
    if (event.description) lines.push(foldLine(`DESCRIPTION:${escapeText(event.description.replace(/<[^>]*>/g, ''))}`));
    if (event.organizer) lines.push(foldLine(`ORGANIZER;CN=${escapeText(event.organizer)}:MAILTO:info@fs-hirondelle.de`));
    lines.push(foldLine(`URL:${baseUrl}/buchungskalender/${event.id}`));
    // 24h-before reminder, matching Matukio's default VALARM.
    lines.push('BEGIN:VALARM');
    lines.push('ACTION:DISPLAY');
    lines.push(foldLine(`DESCRIPTION:${escapeText(event.title)}`));
    lines.push('TRIGGER:-P1D');
    lines.push('END:VALARM');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
