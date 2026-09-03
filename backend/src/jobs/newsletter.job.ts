import cron from 'node-cron';
import { processNewsletterQueue } from '../services/newsletterQueueProcessor';

export function startNewsletterCron() {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    console.log('Running newsletter queue processor...');
    try {
      const { processed } = await processNewsletterQueue();
      if (processed > 0) {
        console.log(`Processed ${processed} queued emails.`);
      }
    } catch (error) {
      console.error('Newsletter cron error:', error);
    }
  });
}
