import { Router } from 'express';
import nodemailer from 'nodemailer';

const router = Router();

let transporter: nodemailer.Transporter | null = null;
async function getTransporter() {
  if (!transporter) {
    // Ideally use real SMTP credentials from .env for production
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
  return transporter;
}

router.post('/submit', async (req, res) => {
  try {
    const { formName, data } = req.body;

    if (!formName || !data) {
      return res.status(400).json({ message: 'formName and data are required' });
    }

    // Construct email content from dynamically submitted data
    let htmlContent = `<h2>Neue Formular-Einreichung: ${formName}</h2>`;
    htmlContent += `<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 600px;">`;
    
    for (const [key, value] of Object.entries(data)) {
      htmlContent += `
        <tr>
          <td style="background-color: #f2f2f2; font-weight: bold; width: 30%;">${key}</td>
          <td>${value !== null && value !== undefined && value !== '' ? value : '<i>-</i>'}</td>
        </tr>
      `;
    }
    htmlContent += `</table>`;

    const t = await getTransporter();

    // Send email to admin
    const info = await t.sendMail({
      from: '"Flugschule Hirondelle Formulare" <noreply@fs-hirondelle.de>',
      to: 'info@fs-hirondelle.de', // The admin email
      replyTo: data.email || undefined,
      subject: `[Website Formular] ${formName}`,
      html: htmlContent
    });

    console.log(`Form ${formName} submitted. Ethereal Mail URL: ${nodemailer.getTestMessageUrl(info)}`);

    res.status(200).json({ message: 'Formular erfolgreich gesendet.' });
  } catch (error) {
    console.error('Form submission error:', error);
    res.status(500).json({ message: 'Ein Fehler ist aufgetreten beim Senden des Formulars.' });
  }
});

export default router;
