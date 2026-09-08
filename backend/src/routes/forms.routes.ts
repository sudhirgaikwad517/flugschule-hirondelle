import { Router } from 'express';
import { getNewsletterTransporter } from '../utils/newsletterTransporter';
import { escapeHtml } from '../utils/htmlEscape';

const router = Router();

router.post('/submit', async (req, res) => {
  try {
    const { formName, data } = req.body;

    if (!formName || !data) {
      return res.status(400).json({ message: 'formName and data are required' });
    }

    // Construct email content from dynamically submitted data - every value
    // (and the form name) is HTML-escaped since it's attacker-controlled and
    // was previously interpolated raw into an email sent to school staff.
    let htmlContent = `<h2>Neue Formular-Einreichung: ${escapeHtml(formName)}</h2>`;
    htmlContent += `<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 600px;">`;

    for (const [key, value] of Object.entries(data)) {
      htmlContent += `
        <tr>
          <td style="background-color: #f2f2f2; font-weight: bold; width: 30%;">${escapeHtml(key)}</td>
          <td>${value !== null && value !== undefined && value !== '' ? escapeHtml(value) : '<i>-</i>'}</td>
        </tr>
      `;
    }
    htmlContent += `</table>`;

    // Uses the school's actually-configured SMTP account (AcyMailing >
    // Konfiguration) - this used to always send through a throwaway Ethereal
    // test account regardless of configuration, so every contact-form
    // submission silently never reached the school despite reporting success.
    const { transporter, config } = await getNewsletterTransporter();
    const fromName = config?.fromName || 'Flugschule Hirondelle';
    const fromEmail = config?.fromEmail || 'no-reply@fs-hirondelle.de';
    const toEmail = config?.fromEmail || 'info@fs-hirondelle.de';

    const replyTo = typeof data.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ? data.email : undefined;

    await transporter.sendMail({
      from: `"${fromName} Formulare" <${fromEmail}>`,
      to: toEmail,
      replyTo,
      subject: `[Website Formular] ${formName}`,
      html: htmlContent
    });

    res.status(200).json({ message: 'Formular erfolgreich gesendet.' });
  } catch (error) {
    console.error('Form submission error:', error);
    res.status(500).json({ message: 'Ein Fehler ist aufgetreten beim Senden des Formulars.' });
  }
});

export default router;
