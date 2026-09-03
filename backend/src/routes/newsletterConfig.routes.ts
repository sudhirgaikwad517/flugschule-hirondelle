import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Add Content-Range header for React Admin
router.use((req, res, next) => {
  res.header('Access-Control-Expose-Headers', 'Content-Range');
  next();
});

// Get config
router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    let config = await prisma.newsletterConfig.findUnique({
      where: { id: 'default' }
    });
    
    if (!config) {
      config = await prisma.newsletterConfig.create({
        data: {
          id: 'default',
          smtpHost: '',
          smtpPort: '',
          smtpUser: '',
          smtpPass: '',
          fromEmail: 'info@fs-hirondelle.de',
          fromName: 'Flugschule Hirondelle'
        }
      });
    }

    res.set('Content-Range', `newsletterconfig 0-1/1`);
    // React admin expects an array for getList, or we can use getOne('newsletterconfig', { id: 'default' })
    // We'll return an array of 1 for standard getList compatibility
    res.json([config]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Newsletter Config' });
  }
});

// Get single config (auto-creates the "default" row on first access)
router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    let config = await prisma.newsletterConfig.findUnique({
      where: { id: (req.params.id as string) }
    });
    if (!config && (req.params.id as string) === 'default') {
      config = await prisma.newsletterConfig.create({
        data: { id: 'default', fromEmail: 'info@fs-hirondelle.de', fromName: 'Flugschule Hirondelle' }
      });
    }
    if (config) {
      res.json(config);
    } else {
      res.status(404).json({ error: 'Config not found' });
    }
  } catch (error) {
    console.error('Failed to fetch Newsletter Config:', error);
    res.status(500).json({ error: 'Failed to fetch Config' });
  }
});

// Update config (upsert - the "default" row may not exist yet)
router.put('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const {
      smtpHost, smtpPort, smtpUser, smtpPass, fromEmail, fromName,
      queueBatchSize, queuePauseSeconds, queueMaxRetries,
      requireConfirmation, unsubscribeTitle, unsubscribeColor,
      gdprExportEnabled, gdprDeleteEnabled
    } = req.body;
    // Trim to guard against accidental leading/trailing spaces from copy-paste,
    // which silently break SMTP host/credential lookups (e.g. DNS resolution).
    const trim = (v: any) => (typeof v === 'string' ? v.trim() : v);
    const fields = {
      smtpHost: trim(smtpHost),
      smtpPort: trim(smtpPort),
      smtpUser: trim(smtpUser),
      smtpPass: trim(smtpPass),
      fromEmail: trim(fromEmail),
      fromName: trim(fromName),
      queueBatchSize: queueBatchSize !== undefined ? Number(queueBatchSize) : undefined,
      queuePauseSeconds: queuePauseSeconds !== undefined ? Number(queuePauseSeconds) : undefined,
      queueMaxRetries: queueMaxRetries !== undefined ? Number(queueMaxRetries) : undefined,
      requireConfirmation,
      unsubscribeTitle: trim(unsubscribeTitle),
      unsubscribeColor: trim(unsubscribeColor),
      gdprExportEnabled,
      gdprDeleteEnabled
    };

    const config = await prisma.newsletterConfig.upsert({
      where: { id: (req.params.id as string) },
      create: { id: (req.params.id as string), ...fields },
      update: fields
    });
    res.json(config);
  } catch (error) {
    console.error('Failed to update Newsletter Config:', error);
    res.status(500).json({ error: 'Failed to update Config' });
  }
});

// Public read-only config (only the fields safe to expose to the unsubscribe/
// confirmation pages - never SMTP credentials).
router.get('/public/newsletter-settings', async (req, res) => {
  try {
    const config = await prisma.newsletterConfig.findUnique({ where: { id: 'default' } });
    res.json({
      unsubscribeTitle: config?.unsubscribeTitle || null,
      unsubscribeColor: config?.unsubscribeColor || '#00a4ff'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

export default router;
