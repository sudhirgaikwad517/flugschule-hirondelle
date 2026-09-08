import { Router } from 'express';
import crypto from 'crypto';
import { prisma } from '../utils/prisma';
import { signClickTrackingUrl } from '../utils/newsletterTags';

const router = Router();

// 1x1 transparent GIF, served for every open-tracking pixel request
const TRANSPARENT_GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7', 'base64');

// Records one OPEN/CLICK event, but only counts the first one per (campaign,
// subscriber) towards the campaign's opensCount/clicksCount - so repeated pixel
// loads or link clicks by the same person don't inflate the reported rate.
async function recordUniqueEvent(campaignId: string, subscriberEmail: string, type: 'OPEN' | 'CLICK', url?: string) {
  const alreadyCounted = await prisma.newsletterTrackingEvent.findFirst({
    where: { campaignId, subscriberEmail, type }
  });

  await prisma.newsletterTrackingEvent.create({
    data: { campaignId, subscriberEmail, type, url }
  });

  if (!alreadyCounted) {
    await prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: type === 'OPEN' ? { opensCount: { increment: 1 } } : { clicksCount: { increment: 1 } }
    }).catch(() => {}); // campaign may no longer exist - never block tracking/redirect on this
  }
}

// Open tracking: <img src="/api/track/open?c=campaignId&e=email" />
router.get('/open', async (req, res) => {
  try {
    const campaignId = String(req.query.c || '');
    const email = String(req.query.e || '');
    if (campaignId && email) {
      await recordUniqueEvent(campaignId, email, 'OPEN');
    }
  } catch (error) {
    console.error('Open tracking error:', error);
  }
  res.set('Content-Type', 'image/gif');
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.send(TRANSPARENT_GIF);
});

// Click tracking: every link in a campaign is rewritten to
// /api/track/click?c=campaignId&e=email&url=<original>&sig=<signature>
// before redirecting there. The signature (over campaignId+email+url) is
// required and verified below - without it this ?url= redirect would be an
// open redirect anyone could abuse to build a phishing link that looks like
// it comes from our own trusted domain.
router.get('/click', async (req, res) => {
  const url = String(req.query.url || '');
  const campaignId = String(req.query.c || '');
  const email = String(req.query.e || '');
  const sig = String(req.query.sig || '');

  if (!url || !/^https?:\/\//i.test(url) || !campaignId || !email) {
    return res.status(400).send('Invalid redirect URL');
  }

  const expected = signClickTrackingUrl(campaignId, email, url);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(403).send('Invalid or missing signature');
  }

  try {
    await recordUniqueEvent(campaignId, email, 'CLICK', url);
  } catch (error) {
    console.error('Click tracking error:', error);
  }

  res.redirect(url);
});

export default router;
