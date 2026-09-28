import { prisma } from '../utils/prisma';

export interface SegmentCondition {
  field: 'list' | 'tag' | 'customField' | 'isConfirmed' | 'subscribedAfter' | 'subscribedBefore'
       | 'openedCampaign' | 'notOpenedCampaign' | 'clickedCampaign' | 'notClickedCampaign';
  operator?: 'equals' | 'not_equals' | 'contains';
  value: string;
  fieldId?: string; // only for 'customField' - a NewsletterFieldDefinition id
}

function parseConditions(raw: string): SegmentCondition[] {
  try {
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Preloads the set of subscriber emails that opened/clicked a given campaign,
// once per referenced campaign - a segment with an engagement condition needs
// this joined in from NewsletterTrackingEvent, which a single subscriber
// query can't express on its own.
async function loadEngagementSets(conditions: SegmentCondition[]) {
  const sets = new Map<string, Set<string>>();
  const engagementConditions = conditions.filter((c) =>
    ['openedCampaign', 'notOpenedCampaign', 'clickedCampaign', 'notClickedCampaign'].includes(c.field)
  );
  for (const c of engagementConditions) {
    const key = `${c.field}:${c.value}`;
    if (sets.has(key)) continue;
    const type = c.field.toLowerCase().includes('click') ? 'CLICK' : 'OPEN';
    const rows = await prisma.newsletterTrackingEvent.findMany({
      where: { campaignId: c.value, type },
      select: { subscriberEmail: true },
    });
    sets.set(key, new Set(rows.map((r) => r.subscriberEmail.toLowerCase())));
  }
  return sets;
}

function evalCondition(sub: any, c: SegmentCondition, engagementSets: Map<string, Set<string>>): boolean {
  switch (c.field) {
    case 'list': {
      const eq = sub.listType === c.value;
      return c.operator === 'not_equals' ? !eq : eq;
    }
    case 'tag': {
      const tags = String(sub.tags || '').split(',').map((t: string) => t.trim().toLowerCase()).filter(Boolean);
      const has = tags.includes(String(c.value).toLowerCase());
      return c.operator === 'not_equals' ? !has : has;
    }
    case 'customField': {
      const cf = (sub.customFields as any) || {};
      const val = c.fieldId ? cf[c.fieldId] : undefined;
      if (c.operator === 'contains') {
        return String(val ?? '').toLowerCase().includes(String(c.value).toLowerCase());
      }
      const eq = String(val ?? '').toLowerCase() === String(c.value).toLowerCase();
      return c.operator === 'not_equals' ? !eq : eq;
    }
    case 'isConfirmed': {
      const wantConfirmed = c.value === 'true' || (c.value as any) === true;
      return !!sub.isConfirmed === wantConfirmed;
    }
    case 'subscribedAfter':
      return new Date(sub.subscribedAt).getTime() >= new Date(c.value).getTime();
    case 'subscribedBefore':
      return new Date(sub.subscribedAt).getTime() <= new Date(c.value).getTime();
    case 'openedCampaign':
      return engagementSets.get(`openedCampaign:${c.value}`)?.has(sub.email.toLowerCase()) ?? false;
    case 'notOpenedCampaign':
      return !(engagementSets.get(`notOpenedCampaign:${c.value}`)?.has(sub.email.toLowerCase()) ?? false);
    case 'clickedCampaign':
      return engagementSets.get(`clickedCampaign:${c.value}`)?.has(sub.email.toLowerCase()) ?? false;
    case 'notClickedCampaign':
      return !(engagementSets.get(`notClickedCampaign:${c.value}`)?.has(sub.email.toLowerCase()) ?? false);
    default:
      return true;
  }
}

// Resolves a segment's real, current membership - old AcyMailing segments are
// dynamic (re-evaluated every time they're used, not a frozen snapshot), so
// this is always computed fresh rather than cached.
export async function resolveSegmentRecipients(segmentId: string) {
  const segment = await prisma.newsletterSegment.findUnique({ where: { id: segmentId } });
  if (!segment) return [];

  const conditions = parseConditions(segment.conditions);
  const subscribers = await prisma.newsletter.findMany({ where: { isActive: true } });
  if (conditions.length === 0) return subscribers;

  const engagementSets = await loadEngagementSets(conditions);
  const matchAny = segment.matchType === 'any';

  return subscribers.filter((sub) => {
    const results = conditions.map((c) => evalCondition(sub, c, engagementSets));
    return matchAny ? results.some(Boolean) : results.every(Boolean);
  });
}
