import { Router } from 'express';
import { prisma } from '../utils/prisma';

const router = Router();

router.get('/dashboard', async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        // Fetch all relevant data for the last 30 days
        const bookings = await prisma.booking.findMany({
            where: { createdAt: { gte: thirtyDaysAgo } },
            select: { createdAt: true, totalPrice: true }
        });

        const events = await prisma.event.findMany({
            where: { createdAt: { gte: thirtyDaysAgo } },
            select: { createdAt: true }
        });

        // Initialize array for 30 days
        const historyMap = new Map();
        for (let i = 0; i <= 30; i++) {
            const date = new Date(thirtyDaysAgo);
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

router.get('/acymailing', async (req, res) => {
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
