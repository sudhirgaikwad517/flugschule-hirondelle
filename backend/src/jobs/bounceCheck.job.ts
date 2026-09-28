import cron from 'node-cron';
import { checkBounces } from '../services/bounceChecker.service';

export function startBounceCheckCron() {
  // Every 30 minutes - checkBounces() itself is a no-op (skipped: true) until
  // an admin actually configures and enables a bounce mailbox, so this is
  // safe to always run.
  cron.schedule('*/30 * * * *', async () => {
    try {
      const result = await checkBounces();
      if (!result.skipped && (result.checked > 0 || result.error)) {
        console.log('Bounce check:', result);
      }
    } catch (error) {
      console.error('Bounce check cron error:', error);
    }
  });
}
