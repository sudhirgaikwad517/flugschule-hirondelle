import rateLimit from 'express-rate-limit';

// Login/password attempts: generous enough for a real user mistyping a
// password a few times, tight enough to make brute-forcing impractical.
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut.' },
});

// OTP request/verify: a 6-digit code is only ~1,000,000 combinations, so the
// verify endpoint especially needs a tight limit to make brute-forcing the
// 10-minute-valid code infeasible.
export const otpRequestRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' },
});

export const otpVerifyRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Zu viele Versuche. Bitte fordern Sie einen neuen Code an.' },
});

// Public voucher code validation: no login required, so nothing else stops
// someone from scripting through codes to find valid ones and read back
// their discount value.
export const voucherValidateRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' },
});

// Unauthenticated-by-design endpoints that use a booking's own UUID as the
// access token (rating-info/rate) - a generous limit, since a real customer
// only hits these once or twice, but enough to stop someone scripting
// through IDs.
export const publicLookupRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' },
});
