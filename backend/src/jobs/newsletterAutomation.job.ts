import cron from 'node-cron';
import { processAutomationRuns } from '../services/newsletterAutomation.service';

export function startNewsletterAutomationCron() {
  // Every 15 minutes - automation delays are day-granular (delayDays), so
  // there's no real value in checking every minute like the campaign queue.
  cron.schedule('*/15 * * * *', async () => {
    try {
      const { processed } = await processAutomationRuns();
      if (processed > 0) {
        console.log(`Processed ${processed} automation email(s).`);
      }
    } catch (error) {
      console.error('Newsletter automation cron error:', error);
    }
  });
}
