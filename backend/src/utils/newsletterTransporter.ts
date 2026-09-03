import nodemailer from 'nodemailer';
import { prisma } from './prisma';

let cachedTransporter: nodemailer.Transporter | null = null;
let cachedConfigKey: string | null = null;
let cachedIsTestMode = false;
let cachedTestAccountUser = '';

// Builds (and caches) the mail transporter from the admin's Konfiguration tab
// (NewsletterConfig). Falls back to a throwaway Ethereal test account only
// when no real SMTP server is configured yet, so newsletter sending works out
// of the box in dev but automatically switches to real delivery once an admin
// fills in the Konfiguration tab - no code change needed.
export async function getNewsletterTransporter() {
  const config = await prisma.newsletterConfig.findUnique({ where: { id: 'default' } });
  const hasRealSmtp = !!(config?.smtpHost && config?.smtpUser && config?.smtpPass);
  const configKey = hasRealSmtp ? `${config!.smtpHost}:${config!.smtpPort}:${config!.smtpUser}` : 'ethereal';

  if (cachedTransporter && cachedConfigKey === configKey) {
    return { transporter: cachedTransporter, isTestMode: cachedIsTestMode, testAccountUser: cachedTestAccountUser, config };
  }

  if (hasRealSmtp) {
    const port = parseInt(config!.smtpPort || '587', 10);
    cachedTransporter = nodemailer.createTransport({
      host: config!.smtpHost!,
      port,
      secure: port === 465,
      auth: { user: config!.smtpUser!, pass: config!.smtpPass! }
    });
    cachedIsTestMode = false;
    cachedTestAccountUser = '';
  } else {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
    cachedIsTestMode = true;
    cachedTestAccountUser = testAccount.user;
    console.log('No real SMTP configured (see AcyMailing > Konfiguration) - using Ethereal test account:', testAccount.user);
  }

  cachedConfigKey = configKey;
  return { transporter: cachedTransporter, isTestMode: cachedIsTestMode, testAccountUser: cachedTestAccountUser, config };
}
