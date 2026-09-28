import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';
import { getNewsletterTransporter } from '../utils/newsletterTransporter';

const router = Router();

// Old's real "E-Mail-Warteschlange" (view=emailqueues) - deep-verified
// columns: Von/Gesendet von/Gesendet an/Betreff/Inhalt/Typ/Status, toolbar
// Publish/Unpublish/Edit/Delete/Alle löschen/Send mail. This app actually
// SENDS the notification immediately (see commentMailer.service.ts) rather
// than queueing-then-manually-flushing, so this is a visible send LOG
// (real Von/Gesendet-an/Betreff/Typ/Status columns) with "Erneut senden"
// in place of old's "Send mail" (which only makes sense for a genuinely
// unsent queue) and "Alle löschen" kept as-is. Publish/Unpublish are
// omitted - a sent-or-failed log row has no real "hidden vs visible"
// state to toggle, unlike old's real still-pending queue rows.
router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { _sort, _order, _start, _end, status, type } = req.query;
    const skip = _start ? Number(_start) : 0;
    const take = _end ? Number(_end) - skip : 100;
    const orderBy: any = _sort ? { [_sort as string]: _order ? (_order as string).toLowerCase() : 'desc' } : { createdAt: 'desc' };

    const where: any = {};
    if (status) where.status = String(status);
    if (type) where.type = String(type);

    const [rows, total] = await Promise.all([
      prisma.commentEmailQueue.findMany({ where, skip, take, orderBy }),
      prisma.commentEmailQueue.count({ where }),
    ]);

    res.set('Content-Range', `commentemailqueue ${skip}-${skip + rows.length}/${total}`);
    res.set('Access-Control-Expose-Headers', 'Content-Range');
    res.json(rows);
  } catch (error) {
    console.error('Error listing comment email queue:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const row = await prisma.commentEmailQueue.findUnique({ where: { id: req.params.id as string } });
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json(row);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Old's real "Send mail" toolbar action - here, resend this exact
// from/to/subject/body since the original attempt failed (or just to
// re-deliver on request).
router.post('/:id/resend', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const row = await prisma.commentEmailQueue.findUnique({ where: { id: req.params.id as string } });
    if (!row) return res.status(404).json({ message: 'Not found' });
    const { transporter } = await getNewsletterTransporter();
    try {
      await transporter.sendMail({
        from: row.fromEmail ? `"${row.fromName || 'Flugschule Hirondelle'}" <${row.fromEmail}>` : '"Flugschule Hirondelle" <info@fs-hirondelle.de>',
        to: row.toEmail,
        subject: row.subject,
        html: row.body,
      });
      const updated = await prisma.commentEmailQueue.update({ where: { id: row.id }, data: { status: 'sent', error: null } });
      res.json(updated);
    } catch (sendError: any) {
      const updated = await prisma.commentEmailQueue.update({ where: { id: row.id }, data: { status: 'failed', error: String(sendError?.message || sendError) } });
      res.status(502).json(updated);
    }
  } catch (error) {
    console.error('Error resending comment email:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/all', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.commentEmailQueue.deleteMany({});
    res.json({ message: 'Alle Einträge gelöscht' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    await prisma.commentEmailQueue.delete({ where: { id: req.params.id as string } });
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
