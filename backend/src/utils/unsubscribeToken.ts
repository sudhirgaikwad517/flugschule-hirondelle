import crypto from 'crypto';
import { JWT_SECRET } from './config';

// Signs {email, scope} so unsubscribe/stop-tracking links can be verified
// without a DB lookup or schema change - anyone with the token can only ever
// unsubscribe/silence the exact (email, scope) pair it was issued for, unlike
// the previous bare-email endpoints which let anyone unsubscribe any address.
function sign(email: string, scope: string): string {
  return crypto.createHmac('sha256', JWT_SECRET).update(`${email.toLowerCase()}:${scope}`).digest('hex');
}

export function generateUnsubscribeToken(email: string, scope: string): string {
  return sign(email, scope);
}

export function verifyUnsubscribeToken(email: string, scope: string, token: string | undefined): boolean {
  if (!token) return false;
  const expected = sign(email, scope);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
