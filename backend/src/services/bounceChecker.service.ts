import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import { prisma } from '../utils/prisma';
import { logNewsletterHistory } from './newsletterHistory.service';

// Old AcyMailing's real bounce handling (MailboxHelper.php): a dedicated
// mailbox that receives bounced-message notifications gets polled
// periodically. Rather than a full RFC-3464 DSN parser (real bounce formats
// vary wildly between mail servers), this uses the same practical approach
// AcyMailing itself does: scan the bounce message for a permanent (5.x.x)
// vs. temporary (4.x.x) SMTP status code, and cross-reference every email
// address found in the message against our own subscriber table - an
// address only actually gets suppressed if it's both (a) a real subscriber
// and (b) named in a message carrying a hard-failure code.
const HARD_BOUNCE_CODE = /\b5\.\d\.\d\b|\b55\d\b/;
const SOFT_BOUNCE_CODE = /\b4\.\d\.\d\b|\b45\d\b/;
const EMAIL_RE = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9.-]+/g;

function extractCandidateEmails(text: string): string[] {
  const matches = text.match(EMAIL_RE) || [];
  return Array.from(new Set(matches.map((e) => e.toLowerCase())));
}

function isLikelyBounceMessage(subject: string, from: string, text: string): boolean {
  const haystack = `${subject} ${from}`.toLowerCase();
  if (/mailer-daemon|postmaster|mail delivery|undeliver|delivery status|failure notice|returned mail|delivery has failed/i.test(haystack)) {
    return true;
  }
  return HARD_BOUNCE_CODE.test(text) || SOFT_BOUNCE_CODE.test(text);
}

export interface BounceCheckResult {
  skipped: boolean;
  checked: number;
  suppressed: number;
  error?: string;
}

export async function checkBounces(): Promise<BounceCheckResult> {
  const config = await prisma.newsletterConfig.findUnique({ where: { id: 'default' } });
  if (!config?.bounceCheckEnabled || !config.bounceImapHost || !config.bounceImapUser || !config.bounceImapPass) {
    return { skipped: true, checked: 0, suppressed: 0 };
  }

  let connection;
  try {
    connection = await imaps.connect({
      imap: {
        user: config.bounceImapUser,
        password: config.bounceImapPass,
        host: config.bounceImapHost,
        port: Number(config.bounceImapPort || '993'),
        tls: config.bounceImapTls,
        authTimeout: 10000,
        tlsOptions: { rejectUnauthorized: false },
      },
    });

    await connection.openBox('INBOX');
    const messages = await connection.search(['UNSEEN'], { bodies: [''], markSeen: true });

    let suppressed = 0;

    for (const message of messages) {
      const rawPart = message.parts.find((p) => p.which === '');
      if (!rawPart) continue;

      const parsed = await simpleParser(rawPart.body);
      const subject = parsed.subject || '';
      const from = parsed.from?.text || '';
      const text = `${parsed.text || ''}\n${parsed.html || ''}`;

      if (!isLikelyBounceMessage(subject, from, text)) continue;
      if (!HARD_BOUNCE_CODE.test(text)) continue; // only suppress on a genuine permanent failure

      const candidates = extractCandidateEmails(text);
      if (candidates.length === 0) continue;

      const matched = await prisma.newsletter.findMany({
        where: { email: { in: candidates }, isActive: true },
      });

      for (const sub of matched) {
        const bounceReason = subject.slice(0, 500) || 'Hard bounce erkannt';
        await prisma.newsletter.update({
          where: { id: sub.id },
          data: {
            isActive: false,
            bounced: true,
            bounceReason,
            bouncedAt: new Date(),
          },
        });
        await logNewsletterHistory(sub.email, 'bounce', { listType: sub.listType, reason: bounceReason });
        suppressed++;
      }
    }

    await prisma.newsletterConfig.update({ where: { id: 'default' }, data: { lastBounceCheckAt: new Date() } });

    return { skipped: false, checked: messages.length, suppressed };
  } catch (error: any) {
    console.error('Bounce check error:', error);
    return { skipped: false, checked: 0, suppressed: 0, error: error.message };
  } finally {
    if (connection) {
      try { connection.end(); } catch {}
    }
  }
}
