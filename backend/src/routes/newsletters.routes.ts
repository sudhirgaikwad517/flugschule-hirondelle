import { Router } from 'express';
import crypto from 'crypto';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';
import { getNewsletterTransporter } from '../utils/newsletterTransporter';

const router = Router();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

async function sendConfirmationEmail(email: string, token: string, config: { fromEmail: string | null; fromName: string | null } | null) {
  const { transporter } = await getNewsletterTransporter();
  const confirmUrl = `${FRONTEND_URL}/newsletter/bestaetigen?token=${token}`;
  await transporter.sendMail({
    from: config?.fromEmail ? `"${config.fromName || 'Flugschule Hirondelle'}" <${config.fromEmail}>` : '"Flugschule Hirondelle" <info@fs-hirondelle.de>',
    to: email,
    subject: 'Bitte bestätigen Sie Ihre Newsletter-Anmeldung',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <p>Vielen Dank für Ihre Anmeldung zum Newsletter der Flugschule Hirondelle.</p>
        <p>Bitte bestätigen Sie Ihre E-Mail-Adresse, indem Sie auf den folgenden Link klicken:</p>
        <p><a href="${confirmUrl}" style="background:#0ea5e9;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">Anmeldung bestätigen</a></p>
        <p>Falls Sie sich nicht angemeldet haben, können Sie diese E-Mail ignorieren.</p>
      </div>
    `
  });
}

// Public subscribe endpoint
router.post('/subscribe', async (req, res) => {
  try {
    const { email, listType = 'GENERAL' } = req.body;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    const config = await prisma.newsletterConfig.findUnique({ where: { id: 'default' } });
    const requireConfirmation = config?.requireConfirmation || false;
    const confirmToken = requireConfirmation ? crypto.randomBytes(24).toString('hex') : null;

    const existing = await prisma.newsletter.findUnique({
      where: {
        email_listType: {
          email: email.toLowerCase(),
          listType
        }
      }
    });

    if (existing) {
      if (!existing.isActive) {
        // Reactivate
        await prisma.newsletter.update({
          where: { id: existing.id },
          data: {
            isActive: true,
            subscribedAt: new Date(),
            isConfirmed: !requireConfirmation,
            confirmToken
          }
        });
        if (requireConfirmation && confirmToken) {
          await sendConfirmationEmail(email.toLowerCase(), confirmToken, config);
          return res.json({ message: 'Bitte bestätigen Sie Ihre E-Mail-Adresse - wir haben Ihnen einen Link geschickt.' });
        }
        return res.json({ message: 'Successfully resubscribed' });
      }
      return res.status(400).json({ message: 'Email is already subscribed to this list' });
    }

    await prisma.newsletter.create({
      data: {
        email: email.toLowerCase(),
        listType,
        isActive: true,
        isConfirmed: !requireConfirmation,
        confirmToken
      }
    });

    if (requireConfirmation && confirmToken) {
      await sendConfirmationEmail(email.toLowerCase(), confirmToken, config);
      return res.status(201).json({ message: 'Bitte bestätigen Sie Ihre E-Mail-Adresse - wir haben Ihnen einen Link geschickt.' });
    }

    res.status(201).json({ message: 'Successfully subscribed' });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Public: confirm a double opt-in subscription
router.post('/public/confirm', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Token ist erforderlich' });
    }

    const subscriber = await prisma.newsletter.findUnique({ where: { confirmToken: token } });
    if (!subscriber) {
      return res.status(404).json({ message: 'Ungültiger oder bereits verwendeter Bestätigungslink' });
    }

    await prisma.newsletter.update({
      where: { id: subscriber.id },
      data: { isConfirmed: true, confirmToken: null }
    });

    res.json({ message: 'E-Mail-Adresse erfolgreich bestätigt' });
  } catch (error) {
    console.error('Newsletter confirm error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin routes
router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const newsletters = await prisma.newsletter.findMany();
    res.set('Content-Range', `newsletters 0-${newsletters.length}/${newsletters.length}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(newsletters);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// IMPORTANT: specific /email/:email/details routes MUST come before generic /:id
router.get('/email/:email/details', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const email = req.params.email as string;
    const subs = await prisma.newsletter.findMany({ where: { email } });
    if (subs.length === 0) return res.status(404).json({ message: 'Not found' });

    const base = subs[0];
    
    // Get list of queue items (Email History)
    const history = await prisma.newsletterQueue.findMany({
      where: { subscriberEmail: email },
      orderBy: { scheduledAt: 'desc' },
      take: 50
    });

    // Build allLists from NewsletterList table
    const dbLists = await prisma.newsletterList.findMany();
    
    // Also get all distinct listTypes from Newsletter table to show lists
    // that exist even if not in NewsletterList table
    const allListTypes = await prisma.newsletter.findMany({
      select: { listType: true },
      distinct: ['listType']
    });

    // Merge: use NewsletterList entries where they exist (keyed by `code`, which is
    // what Newsletter.listType actually stores), otherwise create a virtual entry
    // for any listType that has no matching NewsletterList row yet.
    const listMap = new Map<string, any>();
    for (const dbList of dbLists) {
      if (dbList.code) listMap.set(dbList.code, dbList);
    }
    for (const lt of allListTypes) {
      if (!listMap.has(lt.listType)) {
        listMap.set(lt.listType, {
          id: lt.listType,
          code: lt.listType,
          name: lt.listType,
          description: null,
          color: lt.listType === 'GENERAL' ? '#3b82f6' : lt.listType === 'TANDEM' ? '#000000' : '#eab308',
          visible: true,
          active: true
        });
      }
    }
    const allLists = Array.from(listMap.values());

    // Real per-subscriber open/click rate: unique campaigns opened/clicked
    // divided by how many campaigns were actually sent to them.
    const sentCount = history.filter(h => h.status === 'SENT').length;
    const [openEvents, clickEvents] = await Promise.all([
      prisma.newsletterTrackingEvent.findMany({ where: { subscriberEmail: email, type: 'OPEN' }, select: { campaignId: true } }),
      prisma.newsletterTrackingEvent.findMany({ where: { subscriberEmail: email, type: 'CLICK' }, select: { campaignId: true } })
    ]);
    const uniqueOpenedCampaigns = new Set(openEvents.map(e => e.campaignId)).size;
    const uniqueClickedCampaigns = new Set(clickEvents.map(e => e.campaignId)).size;

    res.json({
      email: base.email,
      name: base.name,
      language: base.language,
      isActive: base.isActive,
      isConfirmed: base.isConfirmed,
      trackStatus: base.trackStatus,
      creationDate: base.subscribedAt,
      subscriptions: subs.map(s => ({
        id: s.id,
        listType: s.listType,
        subscribedAt: s.subscribedAt
      })),
      allLists,
      history,
      stats: {
        sentCount,
        openRate: sentCount > 0 ? Number(((uniqueOpenedCampaigns / sentCount) * 100).toFixed(1)) : null,
        clickRate: sentCount > 0 ? Number(((uniqueClickedCampaigns / sentCount) * 100).toFixed(1)) : null
      }
    });
  } catch (error) {
    console.error('GET /email/:email/details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/email/:email/details', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const email = req.params.email as string;
    const { name, language, isActive, isConfirmed, trackStatus } = req.body;

    // Update all newsletter rows for this email
    await prisma.newsletter.updateMany({
      where: { email },
      data: {
        ...(name !== undefined && { name }),
        ...(language !== undefined && { language }),
        ...(isActive !== undefined && { isActive }),
        ...(isConfirmed !== undefined && { isConfirmed }),
        ...(trackStatus !== undefined && { trackStatus }),
      }
    });

    res.json({ message: 'Subscriber updated successfully' });
  } catch (error) {
    console.error('PUT /email/:email/details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Unsubscribe this person from every list they're currently on
router.post('/email/:email/unsubscribe-all', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const email = req.params.email as string;
    const result = await prisma.newsletter.updateMany({
      where: { email },
      data: { isActive: false }
    });
    res.json({ message: 'Von allen Listen abgemeldet', count: result.count });
  } catch (error) {
    console.error('POST /email/:email/unsubscribe-all error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GDPR: export everything stored about one subscriber's email address
// (MUST come before the generic /:id route below, same as /email/:email/details)
router.get('/gdpr-export', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const config = await prisma.newsletterConfig.findUnique({ where: { id: 'default' } });
    if (config?.gdprExportEnabled === false) {
      return res.status(403).json({ message: 'GDPR-Export ist in der Konfiguration deaktiviert' });
    }

    const email = String(req.query.email || '').toLowerCase();
    if (!email) return res.status(400).json({ message: 'E-Mail ist erforderlich' });

    const subscriptions = await prisma.newsletter.findMany({ where: { email } });
    const sendHistory = await prisma.newsletterQueue.findMany({ where: { subscriberEmail: email } });

    res.set('Content-Disposition', `attachment; filename="gdpr-export-${email}.json"`);
    res.json({ email, exportedAt: new Date().toISOString(), subscriptions, sendHistory });
  } catch (error) {
    console.error('GDPR export error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GDPR: permanently erase everything stored about one subscriber's email address
router.delete('/gdpr-delete', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const config = await prisma.newsletterConfig.findUnique({ where: { id: 'default' } });
    if (config?.gdprDeleteEnabled === false) {
      return res.status(403).json({ message: 'GDPR-Löschung ist in der Konfiguration deaktiviert' });
    }

    const email = String(req.query.email || '').toLowerCase();
    if (!email) return res.status(400).json({ message: 'E-Mail ist erforderlich' });

    const [queueResult, subscriberResult] = await Promise.all([
      prisma.newsletterQueue.deleteMany({ where: { subscriberEmail: email } }),
      prisma.newsletter.deleteMany({ where: { email } })
    ]);

    res.json({
      message: 'Alle Daten für diese E-Mail-Adresse wurden gelöscht',
      deletedSubscriptions: subscriberResult.count,
      deletedQueueEntries: queueResult.count
    });
  } catch (error) {
    console.error('GDPR delete error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Generic /:id routes AFTER specific routes
router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const newsletter = await prisma.newsletter.findUnique({ where: { id: req.params.id as string } });
    if (!newsletter) return res.status(404).json({ message: 'Not found' });
    res.json(newsletter);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const newsletter = await prisma.newsletter.create({ data: req.body });
    res.status(201).json(newsletter);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const newsletter = await prisma.newsletter.update({
      where: { id: req.params.id as string },
      data: req.body,
    });
    res.json(newsletter);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    // Delete all subscriptions for the same email if deleting from the grouped view
    const sub = await prisma.newsletter.findUnique({ where: { id: req.params.id as string } });
    if (sub) {
      await prisma.newsletter.deleteMany({ where: { email: sub.email } });
    }
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/toggle-list', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { email, listType, name } = req.body;
    const existing = await prisma.newsletter.findUnique({
      where: { email_listType: { email, listType } }
    });
    
    if (existing) {
      // Remove from list
      await prisma.newsletter.delete({ where: { id: existing.id } });
      res.json({ action: 'removed' });
    } else {
      // Add to list
      await prisma.newsletter.create({ data: { email, listType, name: name || '', isActive: true } });
      res.json({ action: 'added' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/toggle-status', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { email, field } = req.body;
    if (field !== 'isActive' && field !== 'isConfirmed') {
      return res.status(400).json({ message: 'Invalid field' });
    }
    
    const subs = await prisma.newsletter.findMany({ where: { email } });
    if (subs.length > 0) {
      const key = field as keyof typeof subs[0];
      const newValue = !subs[0][key];
      await prisma.newsletter.updateMany({
        where: { email },
        data: { [key]: newValue }
      });
      res.json({ [field]: newValue });
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Public subscription route
router.post('/public/subscribe', async (req, res) => {
  try {
    const { email, name, tandemNewsletter } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'E-Mail ist erforderlich' });
    }
    
    // Check if exists
    let subscriber = await prisma.newsletter.findUnique({ 
      where: { 
        email_listType: { email: email.toLowerCase(), listType: tandemNewsletter ? 'TANDEM' : 'GENERAL' } 
      } 
    });
    
    if (subscriber) {
      if (!subscriber.isActive) {
        // Reactivate
        subscriber = await prisma.newsletter.update({
          where: { 
            email_listType: { email: email.toLowerCase(), listType: tandemNewsletter ? 'TANDEM' : 'GENERAL' } 
          },
          data: { isActive: true, name }
        });
      }
    } else {
      subscriber = await prisma.newsletter.create({ 
        data: { email: email.toLowerCase(), name, listType: tandemNewsletter ? 'TANDEM' : 'GENERAL' } 
      });
    }
    
    res.status(200).json({ message: 'Erfolgreich abonniert', subscriber });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ein Fehler ist aufgetreten' });
  }
});

// Public unsubscribe route (used by {unsubscribe}...{/unsubscribe} links in campaigns)
router.post('/public/unsubscribe', async (req, res) => {
  try {
    const { email, listType } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'E-Mail ist erforderlich' });
    }

    await prisma.newsletter.updateMany({
      where: listType ? { email: email.toLowerCase(), listType } : { email: email.toLowerCase() },
      data: { isActive: false }
    });

    res.json({ message: 'Erfolgreich abgemeldet' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ message: 'Ein Fehler ist aufgetreten' });
  }
});

// Public "stop tracking" route (used by {stoptracking}...{/stoptracking} links in campaigns)
router.post('/public/stop-tracking', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'E-Mail ist erforderlich' });
    }

    await prisma.newsletter.updateMany({
      where: { email: email.toLowerCase() },
      data: { trackStatus: false }
    });

    res.json({ message: 'Tracking gestoppt' });
  } catch (error) {
    console.error('Stop tracking error:', error);
    res.status(500).json({ message: 'Ein Fehler ist aufgetreten' });
  }
});

export default router;
