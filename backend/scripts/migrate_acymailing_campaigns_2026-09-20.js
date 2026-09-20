// Backfill: 677 real, actually-sent AcyMailing newsletter campaigns
// (hiron_acym_campaign joined to hiron_acym_mail, WHERE sending_date IS NOT
// NULL) exist in the old DB with real German subjects/bodies/send dates and
// real aggregate open/click stats, but migrate_old_data.ts only ever
// migrated subscribers/lists - never campaign history. This backfill adds
// them to NewsletterCampaign as historical, already-SENT records.
//
// Scope decisions:
//  - Excludes 6 campaigns whose ONLY target list is list_id 13 ("Test
//    Liste") - real subjects are literally "TEST"/"test"/"Test nach
//    Update" with 2-6 recipients, i.e. genuine test sends, not real
//    newsletters. This matches migrate_old_data.ts's existing exclusion of
//    that same list from subscriber migration. 683 - 6 = 677 real rows.
//  - Does NOT migrate the 251k+ row hiron_acym_user_stat / 10k row
//    hiron_acym_url_click per-subscriber tracking-event tables - only the
//    pre-aggregated per-mail totals from hiron_acym_mail_stat
//    (total_subscribers/sent/open_unique/click_unique). That table already
//    has exactly the aggregate numbers NewsletterCampaign displays
//    (recipientsCount/opensCount/clicksCount); migrating raw per-subscriber
//    events would be a much heavier lift for no visible extra value, since
//    nothing in the new app's UI drills into per-subscriber history for a
//    past campaign.
//  - opens/clicks use the *_unique columns (open_unique/click_unique), not
//    the raw total columns, matching this app's established "unique, not
//    raw pixel-load/link-click count" convention used everywhere else
//    opens/clicks are computed (newsletters.routes.ts, stats.routes.ts).
//  - hiron_acym_mail's text columns (subject/preheader/body/name) are
//    stored as double-encoded UTF-8 (classic "UTF-8 bytes written through
//    a latin1-declared connection into a utf8mb4 column" mojibake - e.g.
//    "geÃ¶ffnet" instead of "geöffnet"), confirmed NOT present in any other
//    old table (hiron_matukio.title, hiron_acym_list.name are stored
//    correctly). Fixed per-field via a single latin1->utf8 re-decode,
//    validated across all 683 real rows to never introduce U+FFFD
//    replacement characters (464 changed, 219 already-ASCII unchanged, 0
//    corrupted) before being applied here. A small number of emoji in one
//    preheader are lossy either way (mojibake before, replacement chars
//    after) - the guard below detects that case per-string and leaves the
//    original mojibake in place rather than risk destroying otherwise-good
//    text, since a marketing preheader emoji is out of scope to chase.
//  - Multi-list campaigns (a handful target 2 real lists at once) get a
//    comma-joined targetList, e.g. "GENERAL,TANDEM". 2 campaigns have no
//    list-mapping row at all despite a real send - default to GENERAL.
//  - Idempotent: skips a campaign if a NewsletterCampaign with the same
//    (subject, sentAt) already exists, so this script is safe to re-run.
//
// Usage:
//   node scripts/migrate_acymailing_campaigns_2026-09-20.js --dry-run
//   node scripts/migrate_acymailing_campaigns_2026-09-20.js

require('dotenv/config');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const DRY_RUN = process.argv.includes('--dry-run');

const LIST_MAP = { 1: 'GENERAL', 2: 'NEWSLETTER', 8: 'TANDEM' };

function cleanText(value) {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str.length ? str : null;
}

// Reverses the "UTF-8 bytes stored through a latin1-declared connection"
// mojibake seen in hiron_acym_mail's text columns. Falls back to the
// original string if the fix would introduce replacement characters
// (verified safe for all 683 real subjects before writing this script -
// see comment above).
function fixMojibake(value) {
  const str = cleanText(value);
  if (!str) return str;
  const fixed = Buffer.from(str, 'latin1').toString('utf8');
  return fixed.includes('�') ? str : fixed;
}

function sqlEscape(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (typeof value === 'number') return String(value);
  if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
}

async function main() {
  const oldConn = await mysql.createConnection({ host: '127.0.0.1', user: 'root', password: '', database: 'd03dbe51', charset: 'utf8mb4' });
  const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
  const prisma = new PrismaClient({ adapter });

  const [campaigns] = await oldConn.query(`
    SELECT c.id AS campaign_id, c.sending_date,
           m.id AS mail_id, m.name, m.subject, m.preheader, m.body,
           m.from_name, m.from_email, m.reply_to_name, m.reply_to_email,
           m.bcc, m.bounce_email, m.attachments, m.tracking, m.creation_date
    FROM hiron_acym_campaign c
    JOIN hiron_acym_mail m ON m.id = c.mail_id
    WHERE c.sending_date IS NOT NULL
    ORDER BY c.id ASC
  `);

  const [statRows] = await oldConn.query(`SELECT * FROM hiron_acym_mail_stat`);
  const statByMailId = new Map(statRows.map((s) => [s.mail_id, s]));

  const [listRows] = await oldConn.query(`SELECT mail_id, list_id FROM hiron_acym_mail_has_list`);
  const listsByMailId = new Map();
  for (const row of listRows) {
    if (!listsByMailId.has(row.mail_id)) listsByMailId.set(row.mail_id, []);
    listsByMailId.get(row.mail_id).push(row.list_id);
  }

  console.log(`Real sent campaigns in old DB: ${campaigns.length}`);

  let created = 0;
  let skippedTestOnly = 0;
  let skippedExisting = 0;
  const sqlLines = [
    '-- Backfill NewsletterCampaign from old AcyMailing campaign history (2026-09-20)',
    '-- Generated by migrate_acymailing_campaigns_2026-09-20.js',
    ''
  ];

  for (const c of campaigns) {
    const rawLists = listsByMailId.get(c.mail_id) || [];
    const realLists = rawLists.filter((id) => LIST_MAP[id]);

    // Real list rows exist but every one of them is the Test Liste (13) -
    // a genuine test send, not a real newsletter. Skip it.
    if (rawLists.length > 0 && realLists.length === 0) {
      skippedTestOnly++;
      continue;
    }

    const targetList = realLists.length
      ? [...new Set(realLists.map((id) => LIST_MAP[id]))].join(',')
      : 'GENERAL'; // 2 campaigns have no list-mapping row despite a real send

    const subject = fixMojibake(c.subject) || '(kein Betreff)';
    const sentAt = c.sending_date;

    const existing = await prisma.newsletterCampaign.findFirst({ where: { subject, sentAt } });
    if (existing) { skippedExisting++; continue; }

    const stat = statByMailId.get(c.mail_id);
    const recipientsCount = stat?.sent ?? stat?.total_subscribers ?? 0;
    const opensCount = stat?.open_unique ?? 0;
    const clicksCount = stat?.click_unique ?? 0;

    const data = {
      subject,
      name: fixMojibake(c.name),
      previewLine: fixMojibake(c.preheader),
      body: fixMojibake(c.body) || '',
      status: 'SENT',
      sentAt,
      createdAt: c.creation_date && c.creation_date.getFullYear() > 1970 ? c.creation_date : sentAt,
      targetList,
      recipientsCount,
      opensCount,
      clicksCount,
      visible: true,
      fromName: cleanText(c.from_name),
      fromEmail: cleanText(c.from_email),
      replyToName: cleanText(c.reply_to_name),
      replyToEmail: cleanText(c.reply_to_email),
      bcc: cleanText(c.bcc),
      bounceEmail: cleanText(c.bounce_email),
      attachments: cleanText(c.attachments),
      trackingEnabled: c.tracking === 1,
    };

    created++;
    if (!DRY_RUN) {
      const row = await prisma.newsletterCampaign.create({ data });
      sqlLines.push(
        `INSERT INTO NewsletterCampaign (id, subject, name, previewLine, body, status, sentAt, createdAt, updatedAt, targetList, recipientsCount, opensCount, clicksCount, visible, fromName, fromEmail, replyToName, replyToEmail, bcc, bounceEmail, attachments, trackingEnabled) VALUES (` +
          [
            sqlEscape(row.id), sqlEscape(data.subject), sqlEscape(data.name), sqlEscape(data.previewLine),
            sqlEscape(data.body), sqlEscape(data.status), sqlEscape(data.sentAt), sqlEscape(data.createdAt),
            sqlEscape(row.updatedAt), sqlEscape(data.targetList), sqlEscape(data.recipientsCount),
            sqlEscape(data.opensCount), sqlEscape(data.clicksCount), sqlEscape(data.visible),
            sqlEscape(data.fromName), sqlEscape(data.fromEmail), sqlEscape(data.replyToName),
            sqlEscape(data.replyToEmail), sqlEscape(data.bcc), sqlEscape(data.bounceEmail),
            sqlEscape(data.attachments), sqlEscape(data.trackingEnabled),
          ].join(', ') +
          `); -- old campaign ${c.campaign_id} / mail ${c.mail_id}`
      );
    }
  }

  console.log(`Campaigns created: ${created}`);
  console.log(`Skipped (test-list-only send): ${skippedTestOnly}`);
  console.log(`Skipped (already migrated, same subject+sentAt): ${skippedExisting}`);

  if (!DRY_RUN) {
    const sqlPath = path.join(__dirname, 'migrate_acymailing_campaigns_2026-09-20.sql');
    fs.writeFileSync(sqlPath, sqlLines.join('\n') + '\n', { encoding: 'utf8' });
    console.log(`SQL file written to ${sqlPath}`);
  }

  await oldConn.end();
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
