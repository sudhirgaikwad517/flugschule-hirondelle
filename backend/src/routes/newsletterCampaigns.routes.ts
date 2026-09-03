import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';
import nodemailer from 'nodemailer';
import { renderCampaignHtml } from '../utils/newsletterTags';
import { getNewsletterTransporter } from '../utils/newsletterTransporter';

const router = Router();

// targetList holds one or more comma-separated NewsletterList codes (e.g. "GENERAL,TANDEM"),
// matching AcyMailing's multi-list recipient picker. Subscribers are deduped by email so
// someone on two selected lists only receives the campaign once.
async function getTargetSubscribers(targetList: string) {
  const codes = (targetList || '').split(',').map(c => c.trim()).filter(Boolean);
  const where: any = { isActive: true };
  if (codes.length > 0 && !codes.includes('ALL')) {
    where.listType = { in: codes };
  }
  // Only exclude unconfirmed subscribers while double opt-in (Konfiguration >
  // Abonnement) is actually turned on, so already-migrated data isn't affected.
  const config = await prisma.newsletterConfig.findUnique({ where: { id: 'default' } });
  if (config?.requireConfirmation) {
    where.isConfirmed = true;
  }
  return prisma.newsletter.findMany({ where, distinct: ['email'] });
}

async function populateQueue(campaign: any) {
  // Guards against re-sending the BCC archive copy if the campaign gets saved
  // again (e.g. navigating back through the wizard) while still SCHEDULED. PENDING
  // items get wiped and rebuilt on every save, so only a non-PENDING item (already
  // picked up by the cron worker) proves sending has genuinely started before.
  const alreadyQueuedBefore = (await prisma.newsletterQueue.count({
    where: { campaignId: campaign.id, status: { not: 'PENDING' } }
  })) > 0;

  const subscribers = await getTargetSubscribers(campaign.targetList);

  if (subscribers.length > 0) {
    const queueItems = subscribers.map(sub => ({
      campaignId: campaign.id,
      subscriberEmail: sub.email,
      status: 'PENDING',
      scheduledAt: campaign.sentAt || new Date()
    }));
    await prisma.newsletterQueue.createMany({ data: queueItems });
  }

  // BCC gets a single archive copy when the campaign is queued, not one per subscriber
  if (campaign.bcc && !alreadyQueuedBefore) {
    const { transporter: t } = await getNewsletterTransporter();
    await t.sendMail({
      from: campaign.fromEmail ? `"${campaign.fromName || 'Flugschule Hirondelle'}" <${campaign.fromEmail}>` : '"Flugschule Hirondelle" <info@fs-hirondelle.de>',
      to: campaign.bcc,
      subject: `[BCC-Kopie] ${campaign.subject}`,
      html: campaign.body
    }).catch(err => console.error('BCC send failed:', err));
  }
}

// Public "view online" page for {viewonline}...{/viewonline} links in campaigns
router.get('/:id/view-online', async (req, res) => {
  try {
    const campaign = await prisma.newsletterCampaign.findUnique({ where: { id: (req.params.id as string) } });
    if (!campaign) {
      return res.status(404).send('Newsletter nicht gefunden');
    }
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(campaign.body);
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

// Get all campaigns
router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { _sort, _order, _start, _end } = req.query;
    const skip = _start ? Number(_start) : 0;
    const take = _end ? Number(_end) - skip : 100;
    const orderBy: any = _sort ? { [_sort as string]: _order ? (_order as string).toLowerCase() : 'asc' } : { createdAt: 'desc' };

    const [campaigns, total] = await Promise.all([
      prisma.newsletterCampaign.findMany({ skip, take, orderBy }),
      prisma.newsletterCampaign.count()
    ]);

    res.set('Content-Range', `newslettercampaigns ${skip}-${skip + campaigns.length}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single campaign
router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id: (req.params.id as string) }
    });
    if (!campaign) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create campaign
router.post('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { subject, name, previewLine, body, design, status, sentAt, targetList, fromName, fromEmail, replyToName, replyToEmail, attachments, keywords, visible, bcc, bounceEmail, trackingEnabled } = req.body;
    const campaign = await prisma.newsletterCampaign.create({
      data: { subject, name, previewLine, body, design, status: status || 'DRAFT', sentAt: sentAt ? new Date(sentAt) : null, targetList: targetList || 'GENERAL', fromName, fromEmail, replyToName, replyToEmail, attachments, keywords, visible: visible ?? true, bcc, bounceEmail, trackingEnabled: trackingEnabled ?? true }
    });
    
    if (campaign.status === 'SCHEDULED') {
      await populateQueue(campaign);
    }
    
    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update campaign
router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { subject, name, previewLine, body, design, status, sentAt, targetList, fromName, fromEmail, replyToName, replyToEmail, attachments, keywords, visible, bcc, bounceEmail, trackingEnabled } = req.body;
    const campaign = await prisma.newsletterCampaign.update({
      where: { id: (req.params.id as string) },
      data: { subject, name, previewLine, body, design, status, sentAt: sentAt ? new Date(sentAt) : null, targetList, fromName, fromEmail, replyToName, replyToEmail, attachments, keywords, visible, bcc, bounceEmail, trackingEnabled }
    });
    
    // Refresh queue
    await prisma.newsletterQueue.deleteMany({
      where: { campaignId: campaign.id, status: 'PENDING' }
    });
    
    if (campaign.status === 'SCHEDULED') {
      await populateQueue(campaign);
    }
    
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete campaign
router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.newsletterQueue.deleteMany({ where: { campaignId: (req.params.id as string) } });
    await prisma.newsletterCampaign.delete({ where: { id: (req.params.id as string) } });
    res.json({ id: (req.params.id as string) });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Duplicate campaign
router.post('/:id/duplicate', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const campaign = await prisma.newsletterCampaign.findUnique({ where: { id: (req.params.id as string) } });
    if (!campaign) return res.status(404).json({ message: 'Not found' });

    const newCampaign = await prisma.newsletterCampaign.create({
      data: {
        subject: campaign.subject + ' (Kopie)',
        name: campaign.name ? campaign.name + ' (Kopie)' : null,
        previewLine: campaign.previewLine,
        body: campaign.body,
        status: 'DRAFT',
        targetList: campaign.targetList,
        visible: campaign.visible
      }
    });
    res.status(201).json(newCampaign);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Toggle visibility
router.patch('/:id/visibility', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const campaign = await prisma.newsletterCampaign.findUnique({ where: { id: (req.params.id as string) } });
    if (!campaign) return res.status(404).json({ message: 'Not found' });

    const updated = await prisma.newsletterCampaign.update({
      where: { id: (req.params.id as string) },
      data: { visible: !campaign.visible }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cancel scheduling
router.patch('/:id/cancel-scheduling', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const campaign = await prisma.newsletterCampaign.findUnique({ where: { id: (req.params.id as string) } });
    if (!campaign || campaign.status !== 'SCHEDULED') return res.status(400).json({ message: 'Campaign is not scheduled' });

    const updated = await prisma.newsletterCampaign.update({
      where: { id: (req.params.id as string) },
      data: { status: 'DRAFT', sentAt: null }
    });
    
    await prisma.newsletterQueue.deleteMany({
      where: { campaignId: updated.id, status: 'PENDING' }
    });
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Send Campaign
router.post('/:id/send', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const campaignId = (req.params.id as string);
    const campaign = await prisma.newsletterCampaign.findUnique({ where: { id: campaignId } });
    if (!campaign || campaign.status === 'SENT') {
      return res.status(400).json({ message: 'Campaign not found or already sent' });
    }

    const subscribers = await getTargetSubscribers(campaign.targetList);
    if (subscribers.length === 0) {
      return res.status(400).json({ message: 'No active subscribers found for this list' });
    }

    const { transporter: t } = await getNewsletterTransporter();

    // Send emails in parallel (in a real app, use a queue like BullMQ)
    const emails = subscribers.map(sub => {
      return t.sendMail({
        from: campaign.fromEmail ? `"${campaign.fromName || 'Flugschule Hirondelle'}" <${campaign.fromEmail}>` : '"Flugschule Hirondelle" <info@fs-hirondelle.de>',
        to: sub.email,
        replyTo: campaign.replyToEmail ? `"${campaign.replyToName || ''}" <${campaign.replyToEmail}>` : undefined,
        subject: campaign.subject,
        html: renderCampaignHtml(campaign.body, sub, campaignId, campaign.trackingEnabled)
      });
    });

    await Promise.allSettled(emails);

    // BCC gets a single archive copy of the campaign, not one per subscriber
    if (campaign.bcc) {
      await t.sendMail({
        from: campaign.fromEmail ? `"${campaign.fromName || 'Flugschule Hirondelle'}" <${campaign.fromEmail}>` : '"Flugschule Hirondelle" <info@fs-hirondelle.de>',
        to: campaign.bcc,
        subject: `[BCC-Kopie] ${campaign.subject}`,
        html: campaign.body
      }).catch(err => console.error('BCC send failed:', err));
    }

    const updated = await prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: { status: 'SENT', sentAt: new Date() }
    });

    res.json({ message: 'Campaign sent successfully', campaign: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error during sending' });
  }
});

// Send Test Email
router.post('/:id/test-email', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const campaignId = (req.params.id as string);
    const { targetEmail, targetEmails, message } = req.body;
    const recipients: string[] = Array.isArray(targetEmails) ? targetEmails : (targetEmail ? [targetEmail] : []);
    const campaign = await prisma.newsletterCampaign.findUnique({ where: { id: campaignId } });
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (recipients.length === 0) {
      return res.status(400).json({ message: 'At least one target email is required' });
    }

    const { transporter: t, isTestMode } = await getNewsletterTransporter();
    const noteHtml = message
      ? `<div style="background:#fff8e1;border:1px solid #ffe082;border-radius:4px;padding:12px 16px;margin-bottom:20px;font-family:sans-serif;font-size:14px;color:#7a5c00;">${String(message).replace(/</g, '&lt;')}</div>`
      : '';

    const results = await Promise.all(recipients.map(targetEmail =>
      t.sendMail({
        from: campaign.fromEmail ? `"${campaign.fromName || 'Flugschule Hirondelle'}" <${campaign.fromEmail}>` : '"Flugschule Hirondelle" <info@fs-hirondelle.de>',
        to: targetEmail,
        replyTo: campaign.replyToEmail ? `"${campaign.replyToName || ''}" <${campaign.replyToEmail}>` : undefined,
        subject: `[TEST] ${campaign.subject}`,
        // Test sends never count towards real open/click stats
        html: noteHtml + renderCampaignHtml(campaign.body, {
          email: targetEmail,
          name: 'Test Pilot',
          listType: campaign.targetList,
          isActive: true,
          isConfirmed: true,
          subscribedAt: new Date(),
          language: 'German'
        }, campaignId, false)
      })
    ));

    // In test mode (no real SMTP configured yet) nothing reaches a real inbox -
    // hand back Ethereal's preview link(s) so the admin can still see the result.
    const previewUrls = isTestMode ? results.map(r => nodemailer.getTestMessageUrl(r)).filter(Boolean) : [];

    res.json({ message: 'Test email sent successfully', isTestMode, previewUrls });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error during sending' });
  }
});

export default router;
