import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

async function getOrCreateConfig() {
  let config = await prisma.commentSettings.findUnique({ where: { id: 'default' } });
  if (!config) {
    config = await prisma.commentSettings.create({ data: { id: 'default' } });
  }
  return config;
}

router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    res.json(config);
  } catch (error) {
    console.error('Error fetching comment settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const {
      autoPublish, notifyModerators, moderatorEmail, notifyOnReply,
      maxLength, sortOrder, commentsPerPage, showGravatar,
    } = req.body;

    const data: Record<string, any> = {};
    if (autoPublish !== undefined) data.autoPublish = !!autoPublish;
    if (notifyModerators !== undefined) data.notifyModerators = !!notifyModerators;
    if (moderatorEmail !== undefined) data.moderatorEmail = moderatorEmail || null;
    if (notifyOnReply !== undefined) data.notifyOnReply = !!notifyOnReply;
    if (maxLength !== undefined) data.maxLength = Number(maxLength) || 30000;
    if (sortOrder !== undefined) data.sortOrder = sortOrder;
    if (commentsPerPage !== undefined) data.commentsPerPage = Number(commentsPerPage) || 20;
    if (showGravatar !== undefined) data.showGravatar = !!showGravatar;

    const config = await prisma.commentSettings.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    });
    res.json(config);
  } catch (error) {
    console.error('Error updating comment settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Internal helper for other backend code (comments.routes.ts,
// commentMailer.service.ts) to read the live settings without duplicating
// the getOrCreate/default logic.
export async function getCommentSettings() {
  return getOrCreateConfig();
}

// Public: the comment widget needs to know the sort order/page size/
// gravatar toggle to render itself correctly, without an admin session.
router.get('/public', async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    res.json({
      maxLength: config.maxLength,
      sortOrder: config.sortOrder,
      commentsPerPage: config.commentsPerPage,
      showGravatar: config.showGravatar,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
