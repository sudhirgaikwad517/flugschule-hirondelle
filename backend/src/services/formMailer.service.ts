import { getNewsletterTransporter } from '../utils/newsletterTransporter';
import { replaceTokens, buildDataBlockHtml, type FormSettings } from '../utils/formSettings';

interface FieldMeta { id: string; label: string; type: string }

// Old's real "E-Mail Optionen" tab (visform-email-details) - two independent
// blocks, deep-verified against visform.xml: "Ergebnis-E-Mail" (emailresult,
// notifies the school/admin) and "Empfangsbestätigung" (emailrecipient,
// confirms to the submitter). Both build their body the same way: the
// admin's own rich-text content, followed by an auto-generated block
// (form title / created date / submitted data / record id / submitter IP)
// gated by the same per-block include-toggles old has.
export async function sendFormEmails(params: {
  formTitle: string;
  recordId: string;
  createdAt: Date;
  ip: string | null;
  fields: FieldMeta[];
  data: Record<string, any>;
  settings: FormSettings;
}) {
  const { formTitle, recordId, createdAt, ip, fields, data, settings } = params;
  const { transporter, config: mailConfig } = await getNewsletterTransporter();
  const defaultFrom = mailConfig?.fromEmail
    ? `"${mailConfig.fromName || 'Flugschule Hirondelle'}" <${mailConfig.fromEmail}>`
    : '"Flugschule Hirondelle" <info@fs-hirondelle.de>';

  const buildBody = (block: FormSettings['email']['result'] | FormSettings['email']['receipt']) => {
    const parts: string[] = [replaceTokens(block.bodyHtml || '', data)];
    const meta: string[] = [];
    if (block.includeFormTitle) meta.push(`<p><strong>Formular:</strong> ${formTitle}</p>`);
    if (block.includeCreated) meta.push(`<p><strong>Datum:</strong> ${createdAt.toLocaleString('de-DE')}</p>`);
    if (block.includeDataRecordId) meta.push(`<p><strong>Datensatz-ID:</strong> ${recordId}</p>`);
    if (block.includeIp && ip) meta.push(`<p><strong>IP-Adresse:</strong> ${ip}</p>`);
    const dataBlock = buildDataBlockHtml(fields, data, { includeData: block.includeData });
    if (dataBlock) meta.push(dataBlock);
    if (meta.length) parts.push('<hr/>' + meta.join(''));
    return parts.join('');
  };

  const results: { result?: boolean; receipt?: boolean } = {};

  if (settings.email.result.enabled && settings.email.result.to) {
    try {
      await transporter.sendMail({
        from: settings.email.result.fromEmail
          ? `"${settings.email.result.fromName || formTitle}" <${settings.email.result.fromEmail}>`
          : defaultFrom,
        to: settings.email.result.to,
        cc: settings.email.result.cc || undefined,
        bcc: settings.email.result.bcc || undefined,
        subject: replaceTokens(settings.email.result.subject, data) || `Neue Einsendung: ${formTitle}`,
        html: buildBody(settings.email.result),
      });
      results.result = true;
    } catch (error) {
      console.error('Error sending form result email:', error);
      results.result = false;
    }
  }

  if (settings.email.receipt.enabled) {
    const emailField = fields.find((f) => f.type === 'email');
    const submitterEmail = emailField ? data[emailField.id] : undefined;
    if (submitterEmail) {
      try {
        await transporter.sendMail({
          from: settings.email.receipt.fromEmail
            ? `"${settings.email.receipt.fromName || formTitle}" <${settings.email.receipt.fromEmail}>`
            : defaultFrom,
          to: submitterEmail,
          cc: settings.email.receipt.cc || undefined,
          bcc: settings.email.receipt.bcc || undefined,
          subject: replaceTokens(settings.email.receipt.subject, data) || `Bestätigung: ${formTitle}`,
          html: buildBody(settings.email.receipt),
        });
        results.receipt = true;
      } catch (error) {
        console.error('Error sending form receipt email:', error);
        results.receipt = false;
      }
    }
  }

  return results;
}
