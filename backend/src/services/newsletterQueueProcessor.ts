import { prisma } from '../utils/prisma';
import { renderCampaignHtml } from '../utils/newsletterTags';
import { getNewsletterTransporter } from '../utils/newsletterTransporter';

// Guards against two overlapping runs of this function - the cron fires
// every minute with no awareness of whether the previous run is still going,
// and this same function is also callable directly via the admin "Jetzt
// verarbeiten" button. Without this, a batch that takes longer than a
// minute (easy with queuePauseSeconds configured) let a second run pick up
// and resend items the first run hadn't gotten to mark PROCESSING yet.
let isProcessing = false;

// Single source of truth for actually sending queued newsletter emails - used by
// both the every-minute cron job and the admin "Jetzt verarbeiten" button, so the
// two can never drift out of sync (real SMTP, personalization, rate limits, retries).
export async function processNewsletterQueue(): Promise<{ processed: number }> {
  if (isProcessing) {
    console.log('Newsletter queue processor already running - skipping this tick.');
    return { processed: 0 };
  }
  isProcessing = true;

  try {
    const config = await prisma.newsletterConfig.findUnique({ where: { id: 'default' } });
    const batchSize = config?.queueBatchSize || 50;
    const pauseSeconds = config?.queuePauseSeconds || 0;
    const maxRetries = config?.queueMaxRetries ?? 2;

    const pendingItems = await prisma.newsletterQueue.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: { lte: new Date() }
      },
      take: batchSize
    });

    if (pendingItems.length === 0) {
      return { processed: 0 };
    }

    const { transporter: t } = await getNewsletterTransporter();
    const touchedCampaignIds = new Set<string>();

    for (let i = 0; i < pendingItems.length; i++) {
      const item = pendingItems[i];
      touchedCampaignIds.add(item.campaignId);

      await prisma.newsletterQueue.update({
        where: { id: item.id },
        data: { status: 'PROCESSING' }
      });

      let sentOk = false;
      try {
        const campaign = await prisma.newsletterCampaign.findUnique({ where: { id: item.campaignId } });
        if (!campaign) {
          throw new Error('Campaign not found');
        }

        const subscriber = await prisma.newsletter.findFirst({ where: { email: item.subscriberEmail, isActive: true } });
        const html = subscriber
          ? renderCampaignHtml(campaign.body, subscriber, campaign.id, campaign.trackingEnabled)
          : campaign.body;

        await t.sendMail({
          from: campaign.fromEmail ? `"${campaign.fromName || 'Flugschule Hirondelle'}" <${campaign.fromEmail}>` : '"Flugschule Hirondelle" <info@fs-hirondelle.de>',
          to: item.subscriberEmail,
          replyTo: campaign.replyToEmail ? `"${campaign.replyToName || ''}" <${campaign.replyToEmail}>` : undefined,
          subject: campaign.subject,
          html
        });
        sentOk = true;
      } catch (err: any) {
        console.error(`Failed to send email to ${item.subscriberEmail}:`, err.message);
        const nextRetryCount = item.retryCount + 1;
        const giveUp = nextRetryCount > maxRetries;
        await prisma.newsletterQueue.update({
          where: { id: item.id },
          data: {
            status: giveUp ? 'FAILED' : 'PENDING',
            retryCount: nextRetryCount,
            errorLog: err.message
          }
        });
      }

      if (sentOk) {
        // Mark SENT immediately after a successful send, isolated from the
        // stats-increment below - if that later write fails, we must NOT
        // fall through to the PENDING/retry path above, or the next tick
        // would resend an email that already went out via SMTP.
        try {
          await prisma.newsletterQueue.update({
            where: { id: item.id },
            data: { status: 'SENT', sentAt: new Date() }
          });
          await prisma.newsletterCampaign.update({
            where: { id: item.campaignId },
            data: { recipientsCount: { increment: 1 } }
          }).catch(err => console.error(`Failed to update recipientsCount for campaign ${item.campaignId} (email already sent):`, err));
        } catch (err) {
          // The item stays PROCESSING rather than PENDING/FAILED - a stuck
          // PROCESSING row needs a human to reconcile, but it will never be
          // silently resent by the PENDING-only query above.
          console.error(`Email to ${item.subscriberEmail} sent, but failed to record it as SENT (left as PROCESSING to avoid a duplicate resend):`, err);
        }
      }

      if (pauseSeconds > 0 && i < pendingItems.length - 1) {
        await new Promise(resolve => setTimeout(resolve, pauseSeconds * 1000));
      }
    }

    // Only flip a campaign to SENT once none of its queue items are still
    // PENDING/PROCESSING - previously this happened after the very first
    // successful item, so the UI (and anyone editing the campaign via
    // PUT /:id in the meantime) saw "sent" while most recipients were still
    // waiting in the queue.
    for (const campaignId of touchedCampaignIds) {
      const remaining = await prisma.newsletterQueue.count({
        where: { campaignId, status: { in: ['PENDING', 'PROCESSING'] } }
      });
      if (remaining === 0) {
        await prisma.newsletterCampaign.update({
          where: { id: campaignId },
          data: { status: 'SENT' }
        }).catch(() => {}); // campaign may have been deleted since
      }
    }

    return { processed: pendingItems.length };
  } finally {
    isProcessing = false;
  }
}
