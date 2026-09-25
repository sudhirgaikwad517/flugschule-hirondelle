import { prisma } from './prisma';

interface TieredFeeEntry {
  title?: string;
  value?: number | string;
  isPercentage?: boolean;
  isDiscount?: boolean;
  bookableFor?: string; // 'public' | 'registered'
  validFrom?: string;
  validUntil?: string;
}

interface PriceItem {
  ticketId: string;
  quantity: number;
}

interface ExtraFeeOption {
  title?: string;
  value?: number | string;
  perPlace?: boolean;
}

interface PriceResult {
  baseTotal: number;
  tieredDiscount: number;
  appliedTieredFee: string | null;
  extrasTotal: number;
  voucherDiscount: number;
  appliedVoucherCode: string | null;
  finalPrice: number;
  // Net/tax split of `finalPrice`, frozen at booking time from the event's
  // taxRate as it exists right now - see Booking.priceNet/priceTax's own
  // comment in schema.prisma for why this must be computed and stored
  // here rather than re-derived later from a Event.taxRate that could
  // since have changed. Null (not 0) when the event has no tax rate
  // configured, so callers can tell "no tax" from "not computed".
  priceNet: number | null;
  priceTax: number | null;
  taxRatePercent: number | null;
}

// Finds the first tiered fee (Matukio's "different fee") on this event that is
// currently within its valid window and matches the caller's registration
// status. Matukio's own different_fees_override supports both a discount
// (isDiscount: true, e.g. an early-bird price cut) AND a surcharge
// (isDiscount: false, e.g. a "Premium Paket" upgrade costing more than the
// base fee) - see administrator/components/com_matukio/helpers/fees.php's
// getDifferentFeeValue(), which adds the value when $f->discount is falsy and
// subtracts it when truthy. Both directions must be honored here, not just
// discounts, to match that behavior.
function findApplicableTieredFee(event: any, isRegisteredUser: boolean): TieredFeeEntry | null {
  if (!event.tieredFees || !Array.isArray(event.eventTieredFees)) return null;

  const now = new Date();
  for (const fee of event.eventTieredFees as TieredFeeEntry[]) {
    if (!fee) continue;
    if (fee.bookableFor === 'registered' && !isRegisteredUser) continue;
    if (fee.validFrom && now < new Date(fee.validFrom)) continue;
    if (fee.validUntil && now > new Date(fee.validUntil)) continue;
    return fee;
  }
  return null;
}

// Returns the price ADJUSTMENT to apply: positive reduces the running total
// (a discount), negative increases it (a surcharge) - mirrors Matukio's
// getDifferentFeeValue exactly (percent scales off the current amount,
// absolute uses the raw value; sign flips on isDiscount either way).
function applyTieredFee(amount: number, value: number, isPercentage: boolean, isDiscount: boolean): number {
  const delta = isPercentage ? amount * (value / 100) : value;
  return isDiscount ? Math.min(Math.max(0, delta), amount) : -delta;
}

// Vouchers are always a discount (no surcharge direction), so this is
// simpler than applyTieredFee: just clamp to [0, amount].
function applyDiscount(amount: number, value: number, isPercentage: boolean): number {
  const discount = isPercentage ? amount * (value / 100) : value;
  return Math.min(Math.max(0, discount), amount);
}

// Server-side authoritative price calculation - never trust a client-submitted
// totalPrice. Re-derives ticket prices fresh from the DB, then applies any
// eligible tiered-fee discount and voucher discount in that order.
export async function calculateBookingPrice(
  eventId: string,
  items: PriceItem[] | undefined,
  voucherCode: string | undefined,
  isRegisteredUser: boolean,
  selectedExtraOptions?: number[]
): Promise<PriceResult> {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error('Event not found');

  let baseTotal = 0;
  let totalQuantity = 0;
  if (items && items.length > 0) {
    const ticketIds = items.map(i => i.ticketId);
    // Scoped to this eventId so a ticket belonging to a different event never
    // contributes to this event's price (createBookingAtomic separately
    // rejects the whole request outright if that happens - this is just
    // defense in depth for this function's own authoritative role).
    const tickets = await prisma.eventTicket.findMany({ where: { id: { in: ticketIds }, eventId } });
    const ticketMap = new Map(tickets.map(t => [t.id, t]));
    for (const item of items) {
      const ticket = ticketMap.get(item.ticketId);
      const quantity = Number(item.quantity);
      if (ticket && Number.isInteger(quantity) && quantity > 0) {
        baseTotal += ticket.price * quantity;
        totalQuantity += quantity;
      }
    }
  }

  let runningTotal = baseTotal;

  const tieredFee = findApplicableTieredFee(event, isRegisteredUser);
  // Positive = discount (price reduced), negative = surcharge (price
  // increased) - see applyTieredFee's own comment.
  let tieredDiscount = 0;
  if (tieredFee) {
    tieredDiscount = applyTieredFee(runningTotal, Number(tieredFee.value) || 0, !!tieredFee.isPercentage, !!tieredFee.isDiscount);
    runningTotal -= tieredDiscount;
  }

  // Old Matukio's "Additional Selectable Fee Options" - flat bolt-on
  // add-ons the customer opted into themselves (e.g. a hotel room),
  // re-validated against the event's own stored options rather than
  // trusting whatever price the client displayed for them.
  let extrasTotal = 0;
  if (Array.isArray(selectedExtraOptions) && Array.isArray(event.extraFeeOptions)) {
    const options = event.extraFeeOptions as unknown as ExtraFeeOption[];
    for (const index of selectedExtraOptions) {
      const opt = options[index];
      if (!opt) continue;
      const value = Number(opt.value) || 0;
      extrasTotal += opt.perPlace ? value * totalQuantity : value;
    }
  }
  runningTotal += extrasTotal;

  let voucherDiscount = 0;
  let appliedVoucherCode: string | null = null;
  if (voucherCode) {
    const voucher = await prisma.voucher.findUnique({ where: { code: voucherCode } });
    const now = new Date();
    const isValid = voucher
      && voucher.published
      && (!voucher.eventId || voucher.eventId === eventId)
      && (!voucher.validFrom || now >= new Date(voucher.validFrom))
      && (!voucher.validUntil || now <= new Date(voucher.validUntil))
      && (voucher.limit === 0 || voucher.usedCount < voucher.limit);

    if (isValid && voucher) {
      voucherDiscount = applyDiscount(runningTotal, voucher.value, voucher.isPercentage);
      runningTotal -= voucherDiscount;
      appliedVoucherCode = voucher.code;
    }
  }

  const finalPrice = Math.max(0, runningTotal);

  // Matches pdf.service.ts's own existing formula (netAmount = gross / (1 +
  // rate/100)) so the invoice PDF and the stored booking record can never
  // disagree about how the split was computed - just done here, once, at
  // booking time, instead of on every PDF render from a rate that may have
  // since changed.
  const taxRatePercent = parseFloat(event.taxRate || '');
  let priceNet: number | null = null;
  let priceTax: number | null = null;
  if (taxRatePercent > 0) {
    priceNet = finalPrice / (1 + taxRatePercent / 100);
    priceTax = finalPrice - priceNet;
  }

  return {
    baseTotal,
    tieredDiscount,
    appliedTieredFee: tieredFee?.title || null,
    extrasTotal,
    voucherDiscount,
    appliedVoucherCode,
    finalPrice,
    priceNet,
    priceTax,
    taxRatePercent: taxRatePercent > 0 ? taxRatePercent : null,
  };
}
