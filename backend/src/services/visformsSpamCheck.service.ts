import dns from 'dns/promises';
import type { FormSettings } from '../utils/formSettings';

export interface SpamCheckResult {
  blocked: boolean;
  reason?: string;
}

function splitList(raw: string | undefined | null): string[] {
  return (raw || '')
    .split(/[\n,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

// Old Visforms' real Spamschutz tab (AEF Spam Protection) has ~15 real
// sub-settings; this app stores every one of them (see FormSettings.spam)
// but previously enforced none beyond the honeypot. This now enforces the
// ones that can be checked unambiguously and safely, without a paid/keyed
// account this project doesn't have:
//   - explicit admin IP/email allow+block lists (whitelist always wins)
//   - StopForumSpam (real public API, no key required)
//   - SpamCop (real public DNSBL, no key required)
// Still settings-only (stored, shown in the admin UI, not enforced) because
// they need an account/API key this project has no credentials for, or a
// captcha widget not built here: Project Honeypot, the custom regex check,
// the "generic email" check (semantics too ambiguous to risk blocking a
// real customer over), and the captcha types.
//
// Every third-party lookup below fails OPEN (network error/timeout never
// blocks a real submission) - this is a customer-facing, business-critical
// form (Service-Auftrag), and a flaky spam API must never be the reason a
// real customer's gear-check request silently vanishes.
export async function checkVisformsSpam(spam: FormSettings['spam'], opts: { ip: string | null; email: string | null }): Promise<SpamCheckResult> {
  const ip = opts.ip;
  const email = opts.email ? opts.email.toLowerCase() : null;

  const whitelistIps = splitList(spam.whitelistIp);
  const whitelistEmails = splitList(spam.whitelistEmail);
  if ((ip && whitelistIps.includes(ip)) || (email && whitelistEmails.includes(email))) {
    return { blocked: false };
  }

  const blacklistIps = splitList(spam.blacklistIp);
  if (ip && blacklistIps.includes(ip)) {
    return { blocked: true, reason: 'IP-Adresse auf der Sperrliste' };
  }
  const blacklistEmails = splitList(spam.blacklistEmail);
  if (email && blacklistEmails.includes(email)) {
    return { blocked: true, reason: 'E-Mail-Adresse auf der Sperrliste' };
  }

  if (spam.spambotCheckEnabled && spam.stopforumspamEnabled && (spam.spambotCheckIp || spam.spambotCheckEmail)) {
    try {
      const params = new URLSearchParams({ json: '1' });
      if (spam.spambotCheckIp && ip) params.set('ip', ip);
      if (spam.spambotCheckEmail && email) params.set('email', email);
      if (params.has('ip') || params.has('email')) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`https://api.stopforumspam.com/api?${params.toString()}`, { signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok) {
          const body = await res.json() as { ip?: { appears: number; frequency: number }; email?: { appears: number; frequency: number } };
          const ipHit = body?.ip?.appears === 1 ? Number(body.ip.frequency) || 0 : -1;
          const emailHit = body?.email?.appears === 1 ? Number(body.email.frequency) || 0 : -1;
          const threshold = Number(spam.stopforumspamMaxFrequency) || 0;
          if (ipHit > threshold || emailHit > threshold) {
            return { blocked: true, reason: 'Als Spam gemeldet (StopForumSpam)' };
          }
        }
      }
    } catch (error) {
      console.error('StopForumSpam check failed (failing open):', error);
    }
  }

  if (spam.spambotCheckEnabled && spam.spamcopEnabled && spam.spambotCheckIp && ip && /^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
    try {
      const reversed = ip.split('.').reverse().join('.');
      await dns.resolve4(`${reversed}.bl.spamcop.net`);
      // A successful resolution means the IP IS listed (SpamCop's real
      // convention - NXDOMAIN/no record means clean, any A record means
      // listed).
      return { blocked: true, reason: 'IP-Adresse auf der SpamCop-Sperrliste' };
    } catch {
      // ENOTFOUND/no record = not listed - the expected, common case.
    }
  }

  return { blocked: false };
}
