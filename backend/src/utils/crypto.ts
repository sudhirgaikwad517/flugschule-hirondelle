import crypto from 'crypto';

// Encrypts secrets (e.g. PayPal client secret) before they touch the database,
// so a database-only compromise doesn't expose them in plaintext. Falls back to
// deriving the key from JWT_SECRET so no extra required env var is needed -
// setting a dedicated ENCRYPTION_KEY is recommended but optional.
const SOURCE_SECRET =
  process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'hirondelle-super-secret-key';
const KEY = crypto.scryptSync(SOURCE_SECRET, 'hirondelle-cookie-and-payment-config', 32);

export function encrypt(plainText: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(payload: string): string {
  const [ivHex, authTagHex, dataHex] = payload.split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]);
  return decrypted.toString('utf8');
}
