import { prisma } from '../utils/prisma';
import { renderCampaignHtml } from '../utils/newsletterTags';
import { getNewsletterTransporter } from '../utils/newsletterTransporter';

// Single source of truth for actually sending queued newsletter emails - used by
// both the every-minute cron job and the admin "Jetzt verarbeiten" button, so the
// two can never drift out of sync (real SMTP, personalization, rate limits, retries).
export async function processNewsletterQueue(): Promise<{ processed: number }> {
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

  for (let i = 0; i < pendingItems.length; i++) {
    const item = pendingItems[i];

    await prisma.newsletterQueue.update({
      where: { id: item.id },
      data: { status: 'PROCESSING' }
    });

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

      await prisma.newsletterQueue.update({
        where: { id: item.id },
        data: { status: 'SENT', sentAt: new Date() }
      });

      await prisma.newsletterCampaign.update({
        where: { id: campaign.id },
        data: {
          recipientsCount: { increment: 1 },
          status: 'SENT'
        }
      });
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

    if (pauseSeconds > 0 && i < pendingItems.length - 1) {
      await new Promise(resolve => setTimeout(resolve, pauseSeconds * 1000));
    }
  }

  return { processed: pendingItems.length };
}
