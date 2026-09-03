import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import eventsRoutes from './routes/events.routes';
import newslettersRoutes from './routes/newsletters.routes';
import newsletterCampaignsRoutes from './routes/newsletterCampaigns.routes';
import newsletterTemplatesRoutes from './routes/newsletterTemplates.routes';
import newsletterQueueRoutes from './routes/newsletterQueue.routes';
import newsletterConfigRoutes from './routes/newsletterConfig.routes';
import commentsRoutes from './routes/comments.routes';
import bookingsRoutes from './routes/bookings.routes';
import categoryRoutes from './routes/categories.routes';
import organizersRoutes from './routes/organizers.routes';
import customFieldsRoutes from './routes/customFields.routes';
import locationsRoutes from './routes/locations.routes';
import vouchersRoutes from './routes/vouchers.routes';
import tieredFeesRoutes from './routes/tieredFees.routes';
import taxRatesRoutes from './routes/taxRates.routes';
import currenciesRoutes from './routes/currencies.routes';
import bookingFormConfigRoutes from './routes/bookingFormConfig.routes';
import templatesConfigRoutes from './routes/templatesConfig.routes';
import statsRoutes from './routes/stats.routes';
import importRoutes from './routes/import.routes';
import ecwidConfigRoutes from './routes/ecwidConfig.routes';
import paymentsRoutes from './routes/payments.routes';
import formsRoutes from './routes/forms.routes';
import newsRoutes from './routes/news.routes';
import downloadsRoutes from './routes/downloads.routes';
import weblinksRoutes from './routes/weblinks.routes';
import bannersRoutes from './routes/banners.routes';
import newsletterListsRoutes from './routes/newsletterlists.routes';
import searchRoutes from './routes/search.routes';
import uploadRoutes from './routes/upload.routes';
import pagemediaRoutes from './routes/pagemedia.routes';
import legalPagesRoutes from './routes/legalPages.routes';
import serviceOrdersRoutes from './routes/serviceorders.routes';
import trackRoutes from './routes/track.routes';
import path from 'path';
import 'dotenv/config'; // loads .env variables

const app = express();
const PORT = process.env.PORT || 5555;

app.use(cors({
  exposedHeaders: ['Content-Range']
}));
app.use(express.json());

// Serve static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Flugschule Hirondelle API is running' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Admin / User management routes
app.use('/api/users', usersRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/newsletters', newslettersRoutes);
app.use('/api/newslettercampaigns', newsletterCampaignsRoutes);
app.use('/api/newslettertemplates', newsletterTemplatesRoutes);
app.use('/api/newsletterqueue', newsletterQueueRoutes);
app.use('/api/newsletterconfig', newsletterConfigRoutes);
app.use('/api/track', trackRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/organizers', organizersRoutes);
app.use('/api/customFields', customFieldsRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/vouchers', vouchersRoutes);
app.use('/api/tieredFees', tieredFeesRoutes);
app.use('/api/taxRates', taxRatesRoutes);
app.use('/api/currencies', currenciesRoutes);
app.use('/api/bookingFormConfig', bookingFormConfigRoutes);
app.use('/api/templatesConfig', templatesConfigRoutes);
app.use('/api/ecwid-config', ecwidConfigRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/import', importRoutes);
app.use('/api/forms', formsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api', downloadsRoutes);
app.use('/api', weblinksRoutes);
app.use('/api/banners', bannersRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/pagemedia', pagemediaRoutes);
app.use('/api/legalPages', legalPagesRoutes);
app.use('/api/serviceorders', serviceOrdersRoutes);
app.use('/api/newsletterlists', newsletterListsRoutes);

// In production, this same process also serves the built frontend (single
// port, matching a reverse proxy that forwards everything to one origin).
// Dev keeps using two separate servers with Vite's own proxy for /api and /uploads.
if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(process.cwd(), '..', 'frontend', 'dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

import { startCronJobs } from './jobs/reminders.job';
import { startNewsletterCron } from './jobs/newsletter.job';

// Start cron jobs
startCronJobs();
startNewsletterCron();

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Trigger restart 4

// Trigger restart 5
