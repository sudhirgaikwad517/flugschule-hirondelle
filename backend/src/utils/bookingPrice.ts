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

interface PriceResult {
  baseTotal: number;
  tieredDiscount: number;
  appliedTieredFee: string | null;
  voucherDiscount: number;
  appliedVoucherCode: string | null;
  finalPrice: number;
}

// Finds the first tiered fee (early-bird style discount) on this event that is
// currently within its valid window, matches the caller's registration status,
// and is flagged as a discount (not a surcharge) - mirrors Matukio's own
// "tiered fees are relative to the standard fee" behavior.
function findApplicableTieredFee(event: any, isRegisteredUser: boolean): TieredFeeEntry | null {
  if (!event.tieredFees || !Array.isArray(event.eventTieredFees)) return null;

  const now = new Date();
  for (const fee of event.eventTieredFees as TieredFeeEntry[]) {
    if (!fee || !fee.isDiscount) continue;
    if (fee.bookableFor === 'registered' && !isRegisteredUser) continue;
    if (fee.validFrom && now < new Date(fee.validFrom)) continue;
    if (fee.validUntil && now > new Date(fee.validUntil)) continue;
    return fee;
  }
  return null;
}

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
  isRegisteredUser: boolean
): Promise<PriceResult> {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error('Event not found');

  let baseTotal = 0;
  if (items && items.length > 0) {
    const ticketIds = items.map(i => i.ticketId);
    const tickets = await prisma.eventTicket.findMany({ where: { id: { in: ticketIds } } });
    const ticketMap = new Map(tickets.map(t => [t.id, t]));
    for (const item of items) {
      const ticket = ticketMap.get(item.ticketId);
      if (ticket) baseTotal += ticket.price * Number(item.quantity || 0);
    }
  }

  let runningTotal = baseTotal;

  const tieredFee = findApplicableTieredFee(event, isRegisteredUser);
  let tieredDiscount = 0;
  if (tieredFee) {
    tieredDiscount = applyDiscount(runningTotal, Number(tieredFee.value) || 0, !!tieredFee.isPercentage);
    runningTotal -= tieredDiscount;
  }

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

  return {
    baseTotal,
    tieredDiscount,
    appliedTieredFee: tieredFee?.title || null,
    voucherDiscount,
    appliedVoucherCode,
    finalPrice: Math.max(0, runningTotal)
  };
}
