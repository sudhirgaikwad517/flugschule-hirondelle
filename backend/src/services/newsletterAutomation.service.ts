import { prisma } from '../utils/prisma';
import { renderCampaignHtml } from '../utils/newsletterTags';
import { getNewsletterTransporter } from '../utils/newsletterTransporter';

export interface AutomationStep {
  delayDays: number;
  subject: string;
  body: string;
}

function parseSteps(raw: string): AutomationStep[] {
  try {
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Old AcyMailing's real Automations/Scenarios - a subscribe event to a given
// list (or any list) starts a sequence of one or more delayed emails. Called
// from subscribeToNewsletter() right after a subscriber is newly created or
// reactivated (never on an already-active, already-subscribed email, so
// resubscribing to the same list doesn't restart or duplicate a sequence).
export async function triggerAutomationsForSubscribe(email: string, listType: string) {
  const automations = await prisma.newsletterAutomation.findMany({
    where: {
      active: true,
      OR: [{ triggerListCode: null }, { triggerListCode: listType }],
    },
  });

  for (const automation of automations) {
    const steps = parseSteps(automation.steps);
    if (steps.length === 0) continue;

    const existingRun = await prisma.newsletterAutomationRun.findFirst({
      where: { automationId: automation.id, subscriberEmail: email.toLowerCase() },
    });
    if (existingRun) continue; // already ran (or is running) this sequence for this subscriber

    const firstStep = steps[0];
    const nextSendAt = new Date(Date.now() + Math.max(0, firstStep.delayDays || 0) * 24 * 60 * 60 * 1000);

    await prisma.newsletterAutomationRun.create({
      data: {
        automationId: automation.id,
        subscriberEmail: email.toLowerCase(),
        currentStep: 0,
        nextSendAt,
      },
    });
  }
}

let isProcessing = false;

// Sends whichever automation runs are due, then advances each to its next
// step (or marks it completed) - same PROCESSING-guard pattern as
// newsletterQueueProcessor.ts, since this also runs both on a cron tick and
// via a manual admin trigger.
export async function processAutomationRuns(): Promise<{ processed: number }> {
  if (isProcessing) return { processed: 0 };
  isProcessing = true;

  try {
    const dueRuns = await prisma.newsletterAutomationRun.findMany({
      where: { completedAt: null, nextSendAt: { lte: new Date() } },
      take: 50,
    });
    if (dueRuns.length === 0) return { processed: 0 };

    const { transporter } = await getNewsletterTransporter();
    let processed = 0;

    for (const run of dueRuns) {
      const automation = await prisma.newsletterAutomation.findUnique({ where: { id: run.automationId } });
      // Automation deleted or paused since this run was scheduled - leave the
      // run as-is (pausing an automation should pause its in-flight runs too,
      // not silently drop or fast-forward them once reactivated).
      if (!automation || !automation.active) continue;

      const steps = parseSteps(automation.steps);
      const step = steps[run.currentStep];
      if (!step) {
        await prisma.newsletterAutomationRun.update({ where: { id: run.id }, data: { completedAt: new Date() } });
        continue;
      }

      const subscriber = await prisma.newsletter.findFirst({ where: { email: run.subscriberEmail, isActive: true } });
      if (!subscriber) {
        // Unsubscribed (or bounced-suppressed) since this run started - stop
        // the sequence rather than emailing someone who opted out.
        await prisma.newsletterAutomationRun.update({ where: { id: run.id }, data: { completedAt: new Date() } });
        continue;
      }

      try {
        const html = renderCampaignHtml(step.body, subscriber as any, undefined, false);
        await transporter.sendMail({
          from: '"Flugschule Hirondelle" <info@fs-hirondelle.de>',
          to: subscriber.email,
          subject: step.subject,
          html,
        });
        processed++;
      } catch (err) {
        console.error(`Automation "${automation.name}" step ${run.currentStep} failed for ${run.subscriberEmail}:`, err);
        // Leave nextSendAt as-is so the next cron tick retries this same step
        // shortly, rather than silently skipping ahead or looping forever.
        continue;
      }

      const nextStepIndex = run.currentStep + 1;
      const nextStep = steps[nextStepIndex];
      if (nextStep) {
        await prisma.newsletterAutomationRun.update({
          where: { id: run.id },
          data: {
            currentStep: nextStepIndex,
            nextSendAt: new Date(Date.now() + Math.max(0, nextStep.delayDays || 0) * 24 * 60 * 60 * 1000),
          },
        });
      } else {
        await prisma.newsletterAutomationRun.update({ where: { id: run.id }, data: { completedAt: new Date() } });
      }
    }

    return { processed };
  } finally {
    isProcessing = false;
  }
}
