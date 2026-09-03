const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5556';
const SITE_NAME = 'Flugschule Hirondelle';
const SITE_URL = 'https://www.fs-hirondelle.de';

interface Subscriber {
  id?: string;
  email: string;
  name?: string | null;
  listType: string;
  isActive?: boolean;
  isConfirmed?: boolean;
  subscribedAt?: Date | null;
  language?: string | null;
  trackStatus?: boolean;
}

function ucfirst(text: string) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const MONTH_NAMES_DE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const DAY_NAMES_DE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Formats a date using AcyMailing-style format codes (d/m/Y/H/i/l/F/W).
function formatDate(date: Date, format: string): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const replacements: Record<string, string> = {
    d: pad(date.getDate()),
    m: pad(date.getMonth() + 1),
    Y: String(date.getFullYear()),
    H: pad(date.getHours()),
    i: pad(date.getMinutes()),
    l: DAY_NAMES_DE[date.getDay()],
    F: MONTH_NAMES_DE[date.getMonth()],
    W: String(getISOWeek(date))
  };
  return format.replace(/[dmYHilFW]/g, (token) => replacements[token] ?? token);
}

function buildUnsubscribeUrl(subscriber: Subscriber, allLists: boolean) {
  const params = new URLSearchParams({ email: subscriber.email });
  if (!allLists) params.set('list', subscriber.listType);
  return `${FRONTEND_URL}/newsletter/abmelden?${params.toString()}`;
}

// Rewrites every http(s) link to go through our click-tracking redirect first.
function rewriteLinksForClickTracking(html: string, campaignId: string, email: string): string {
  return html.replace(/href="(https?:\/\/[^"]+)"/gi, (_m, url) => {
    const tracked = `${BACKEND_URL}/api/track/click?c=${encodeURIComponent(campaignId)}&e=${encodeURIComponent(email)}&url=${encodeURIComponent(url)}`;
    return `href="${tracked}"`;
  });
}

function trackingPixelHtml(campaignId: string, email: string): string {
  const src = `${BACKEND_URL}/api/track/open?c=${encodeURIComponent(campaignId)}&e=${encodeURIComponent(email)}`;
  return `<img src="${src}" width="1" height="1" alt="" style="display:none;width:1px;height:1px;border:0;" />`;
}

// Replaces AcyMailing-style merge tags with real per-subscriber values before sending.
// When tracking is enabled (campaign-level toggle AND the subscriber's own
// "track this subscriber" setting), links are rewritten through the click
// tracker and an invisible open-tracking pixel is appended.
export function renderCampaignHtml(html: string, subscriber: Subscriber, campaignId?: string, campaignTrackingEnabled = true): string {
  let result = html;
  const now = new Date();

  // --- Abonnement (subscription) ---
  result = result.replace(/\{unsubscribe\}(.*?)\{\/unsubscribe\}/g, (_m, label) =>
    `<a href="${buildUnsubscribeUrl(subscriber, false)}" style="color:inherit;">${label}</a>`);
  result = result.replace(/\{unsubscribeall\}(.*?)\{\/unsubscribeall\}/g, (_m, label) =>
    `<a href="${buildUnsubscribeUrl(subscriber, true)}" style="color:inherit;">${label}</a>`);
  result = result.replace(/\{stoptracking\}(.*?)\{\/stoptracking\}/g, (_m, label) =>
    `<a href="${FRONTEND_URL}/newsletter/tracking-stoppen?email=${encodeURIComponent(subscriber.email)}" style="color:inherit;">${label}</a>`);
  if (campaignId) {
    result = result.replace(/\{viewonline\}(.*?)\{\/viewonline\}/g, (_m, label) =>
      `<a href="${BACKEND_URL}/api/newslettercampaigns/${campaignId}/view-online" style="color:inherit;">${label}</a>`);
  }

  // --- Abonnent (subscriber) ---
  result = result.replace(/\{subtag:name(\|part:first)?(\|part:last)?(\|ucfirst)?\}/g, (_m, partFirst, partLast, ucfirstMod) => {
    const fullName = (subscriber.name || '').trim();
    const parts = fullName.split(' ').filter(Boolean);
    let value = fullName;
    if (partFirst) value = parts[0] || '';
    if (partLast) value = parts.length > 1 ? parts[parts.length - 1] : '';
    if (!value) value = 'Pilot';
    if (ucfirstMod) value = ucfirst(value);
    return value;
  });
  result = result.replace(/\{subtag:id\}/g, subscriber.id || '');
  result = result.replace(/\{subtag:email\}/g, subscriber.email);
  result = result.replace(/\{subtag:active\}/g, subscriber.isActive ? 'Aktiv' : 'Inaktiv');
  result = result.replace(/\{subtag:confirmed\}/g, subscriber.isConfirmed ? 'Bestätigt' : 'Unbestätigt');
  result = result.replace(/\{subtag:language\}/g, subscriber.language || 'German');
  result = result.replace(/\{subtag:creation_date\}/g, subscriber.subscribedAt ? formatDate(new Date(subscriber.subscribedAt), 'd.m.Y') : '');
  result = result.replace(/\{email\}/g, subscriber.email);

  // --- Webseite (website) ---
  result = result.replace(/\{sitename\}/g, SITE_NAME);
  result = result.replace(/\{siteurl\}/g, SITE_URL);

  // --- Zeit (time) ---
  result = result.replace(/\{date:([dmYHilFW.:/ ]+)\}/g, (_m, code) => formatDate(now, code));

  // --- Tracking (opens/clicks) ---
  const shouldTrack = !!campaignId && campaignTrackingEnabled && subscriber.trackStatus !== false;
  if (shouldTrack && campaignId) {
    result = rewriteLinksForClickTracking(result, campaignId, subscriber.email);
    result += trackingPixelHtml(campaignId, subscriber.email);
  }

  return result;
}
