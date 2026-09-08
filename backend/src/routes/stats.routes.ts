import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/dashboard', authenticateJWT, authorizeAdmin, async (req, res) => {
    try {
        // Accepts either a `days` preset (7/30/90/365, default 30) or an
        // explicit `from`/`to` range (ISO date strings) - the frontend's
        // date-range filter uses whichever the admin picked.
        let rangeStart: Date;
        let rangeEnd: Date;
        if (req.query.from) {
            rangeStart = new Date(String(req.query.from));
            if (isNaN(rangeStart.getTime())) {
                return res.status(400).json({ error: 'Invalid "from" date' });
            }
            rangeStart.setHours(0, 0, 0, 0);
        } else {
            const days = Math.max(1, Math.min(730, Number(req.query.days) || 30));
            rangeStart = new Date();
            rangeStart.setDate(rangeStart.getDate() - days);
            rangeStart.setHours(0, 0, 0, 0);
        }
        if (req.query.to) {
            rangeEnd = new Date(String(req.query.to));
            if (isNaN(rangeEnd.getTime())) {
                return res.status(400).json({ error: 'Invalid "to" date' });
            }
            rangeEnd.setHours(23, 59, 59, 999);
        } else {
            rangeEnd = new Date();
            rangeEnd.setHours(23, 59, 59, 999);
        }
        if (rangeStart > rangeEnd) [rangeStart, rangeEnd] = [rangeEnd, rangeStart];

        // Day-count for the history buckets, based on pure calendar dates
        // (not the raw ms difference, which always includes rangeEnd's
        // 23:59:59.999 time-of-day and previously rounded up to one extra
        // day - e.g. the default "last 30 days" produced 32 buckets with
        // the last one dated tomorrow).
        const startMidnight = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate());
        const endMidnight = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate());
        const numDays = Math.min(730, Math.round((endMidnight.getTime() - startMidnight.getTime()) / 86400000));

        // The 730-day cap above only bounded the display/history length -
        // an explicit from/to further apart than that still hit the Prisma
        // queries below with their full, unclamped span (an expensive
        // full-range scan on a large table). Clamp rangeStart itself so the
        // actual queried window can never exceed what's ever displayed.
        const maxSpanMs = 730 * 86400000;
        if (rangeEnd.getTime() - rangeStart.getTime() > maxSpanMs) {
            rangeStart = new Date(rangeEnd.getTime() - maxSpanMs);
            rangeStart.setHours(0, 0, 0, 0);
        }

        // Fetch all relevant data for the selected range
        const bookings = await prisma.booking.findMany({
            where: { createdAt: { gte: rangeStart, lte: rangeEnd } },
            select: { createdAt: true, totalPrice: true }
        });

        const events = await prisma.event.findMany({
            where: { createdAt: { gte: rangeStart, lte: rangeEnd } },
            select: { createdAt: true }
        });

        // Initialize array for the selected range
        const historyMap = new Map();
        for (let i = 0; i <= numDays; i++) {
            const date = new Date(rangeStart);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            historyMap.set(dateStr, {
                date: dateStr,
                bookings: 0,
                events: 0,
                revenue: 0
            });
        }

        // Aggregate bookings and revenue
        let totalBookings = 0;
        let totalRevenue = 0;
        bookings.forEach(b => {
            const dateStr = b.createdAt.toISOString().split('T')[0];
            if (historyMap.has(dateStr)) {
                historyMap.get(dateStr).bookings += 1;
                historyMap.get(dateStr).revenue += b.totalPrice || 0;
                totalBookings += 1;
                totalRevenue += b.totalPrice || 0;
            }
        });

        // Aggregate events
        let totalEvents = 0;
        events.forEach(e => {
            const dateStr = e.createdAt.toISOString().split('T')[0];
            if (historyMap.has(dateStr)) {
                historyMap.get(dateStr).events += 1;
                totalEvents += 1;
            }
        });

        const history = Array.from(historyMap.values());

        res.json({
            history,
            range: { from: rangeStart.toISOString(), to: rangeEnd.toISOString() },
            totals: {
                totalBookings,
                totalEvents,
                totalRevenue
            }
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

router.get('/acymailing', authenticateJWT, authorizeAdmin, async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const totalSubscribers = await prisma.newsletter.count();
        const activeSubscribers = await prisma.newsletter.count({ where: { isActive: true } });
        
        const totalLists = await prisma.newsletterList.count();
        const totalCampaigns = await prisma.newsletterCampaign.count();

        // Get sent campaigns history
        const sentHistory = await prisma.newsletterQueue.findMany({
            where: { scheduledAt: { gte: thirtyDaysAgo }, status: 'SENT' },
            select: { scheduledAt: true }
        });

        const historyMap = new Map();
        for (let i = 0; i <= 30; i++) {
            const date = new Date(thirtyDaysAgo);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            historyMap.set(dateStr, {
                date: dateStr,
                sent: 0
            });
        }

        sentHistory.forEach(item => {
            const dateStr = item.scheduledAt.toISOString().split('T')[0];
            if (historyMap.has(dateStr)) {
                historyMap.get(dateStr).sent += 1;
            }
        });

        // Real open/click/bounce rates from actual delivery + tracking-pixel/click-redirect data
        const [totalSentCount, totalQueueCount, failedCount, openEvents, clickEvents] = await Promise.all([
            prisma.newsletterQueue.count({ where: { status: 'SENT' } }),
            prisma.newsletterQueue.count(),
            prisma.newsletterQueue.count({ where: { status: 'FAILED' } }),
            prisma.newsletterTrackingEvent.findMany({ where: { type: 'OPEN' }, select: { campaignId: true, subscriberEmail: true } }),
            prisma.newsletterTrackingEvent.findMany({ where: { type: 'CLICK' }, select: { campaignId: true, subscriberEmail: true } })
        ]);

        // Count unique (campaign, subscriber) pairs so repeated pixel loads / link
        // clicks by the same person don't inflate the rate.
        const uniqueOpens = new Set(openEvents.map(e => `${e.campaignId}:${e.subscriberEmail}`)).size;
        const uniqueClicks = new Set(clickEvents.map(e => `${e.campaignId}:${e.subscriberEmail}`)).size;

        res.json({
            overview: {
                totalSubscribers,
                activeSubscribers,
                totalLists,
                totalCampaigns,
                globalOpenRate: totalSentCount > 0 ? Number(((uniqueOpens / totalSentCount) * 100).toFixed(1)) : 0,
                globalClickRate: totalSentCount > 0 ? Number(((uniqueClicks / totalSentCount) * 100).toFixed(1)) : 0,
                bounceRate: totalQueueCount > 0 ? Number(((failedCount / totalQueueCount) * 100).toFixed(1)) : 0
            },
            history: Array.from(historyMap.values())
        });
    } catch (error) {
        console.error('AcyMailing stats error:', error);
        res.status(500).json({ error: 'Failed to fetch acymailing stats' });
    }
});

export default router;
