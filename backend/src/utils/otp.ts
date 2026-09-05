import crypto from 'crypto';
import { prisma } from './prisma';

export type OtpPurpose = 'LOGIN' | 'PASSWORD_RESET';

const OTP_TTL_MINUTES = 10;

function hashOtp(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export async function createOtp(email: string, purpose: OtpPurpose): Promise<string> {
  const code = String(crypto.randomInt(100000, 1000000)); // 6-digit
  const codeHash = hashOtp(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.otpCode.create({ data: { email: email.toLowerCase(), codeHash, purpose, expiresAt } });

  return code;
}

export async function verifyAndConsumeOtp(email: string, code: string, purpose: OtpPurpose): Promise<boolean> {
  const codeHash = hashOtp(code);
  const otp = await prisma.otpCode.findFirst({
    where: {
      email: email.toLowerCase(),
      purpose,
      codeHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otp) return false;

  await prisma.otpCode.update({ where: { id: otp.id }, data: { usedAt: new Date() } });
  return true;
}
