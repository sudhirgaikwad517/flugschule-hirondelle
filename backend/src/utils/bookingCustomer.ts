// customerDetails has two historical shapes: {firstName,lastName,email,...}
// from the site's own booking flow, and {name,email,source:'migrated_from_matukio',...}
// from the historical Matukio import. Every place that needs a display name/
// email for a booking should go through this so neither shape is missed.
export function resolveBookingCustomer(booking: {
  user?: { name: string; email: string } | null;
  customerDetails?: unknown;
}): { name: string; email: string | null } {
  const c = (booking.customerDetails as any) || {};
  const name =
    booking.user?.name ||
    c.name ||
    [c.firstName, c.lastName].filter(Boolean).join(' ') ||
    'Kunde';
  const email = booking.user?.email || c.email || null;
  return { name, email };
}
