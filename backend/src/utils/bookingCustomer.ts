// customerDetails has three historical shapes: {fullName,email,...} from the
// live 3-step booking form (EventBookingModal), {name,email,source:
// 'migrated_from_matukio',...} from the historical Matukio import, and
// {firstName,lastName,email,...} from admin-side edits. Every place that
// needs a display name/email for a booking should go through this so none
// of the three is missed.
export function resolveBookingCustomer(booking: {
  user?: { name: string; email: string } | null;
  customerDetails?: unknown;
}): { name: string; email: string | null } {
  const c = (booking.customerDetails as any) || {};
  const name =
    booking.user?.name ||
    c.fullName ||
    c.name ||
    [c.firstName, c.lastName].filter(Boolean).join(' ') ||
    'Kunde';
  const email = booking.user?.email || c.email || null;
  return { name, email };
}
