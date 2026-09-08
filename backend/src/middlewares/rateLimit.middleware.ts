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
