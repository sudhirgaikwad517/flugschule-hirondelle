import { prisma } from '../utils/prisma';

export type HistoryAction = 'subscribe' | 'confirm' | 'unsubscribe' | 'bounce';

// Old AcyMailing's real hiron_acym_history - logs every real lifecycle event
// for a subscriber (see NewsletterHistory's own schema comment). Never lets
// a logging failure break the real subscribe/confirm/unsubscribe/bounce flow
// it's attached to.
export async function logNewsletterHistory(
  email: string,
  action: HistoryAction,
  opts: { listType?: string | null; reason?: string | null; ip?: string | null; source?: string | null } = {}
) {
  try {
    await prisma.newsletterHistory.create({
      data: {
        email: email.toLowerCase(),
        action,
        listType: opts.listType || null,
        reason: opts.reason || null,
        ip: opts.ip || null,
        source: opts.source || null,
      },
    });
  } catch (error) {
    console.error(`Failed to log newsletter history (${action}) for ${email}:`, error);
  }
}
