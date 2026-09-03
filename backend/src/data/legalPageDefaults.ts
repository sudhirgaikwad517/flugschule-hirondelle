import fs from 'fs';
import path from 'path';

// Full AGB / Datenschutzerklärung text as provided by the operator (converted
// from the source .txt files) - too long to inline as template literals here.
const AGB_HTML = fs.readFileSync(path.join(__dirname, 'legal/agb.html'), 'utf8');
const DATENSCHUTZ_HTML = fs.readFileSync(path.join(__dirname, 'legal/datenschutz.html'), 'utf8');

const IMPRESSUM_HTML = `
<p>Angaben gemäß § 5 TMG</p>
<p>Flugschule Hirondelle<br/>
Inhaber: Alexander Schlink<br/>
Untergasse 27<br/>
D-69469 Weinheim</p>
<h3>Kontakt</h3>
<p>Telefon: +49 (0)151 18836000<br/>
E-Mail: info@fs-hirondelle.de</p>
<h3>Umsatzsteuer-ID</h3>
<p>Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: DE 272394912</p>
<h3>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h3>
<p>Alexander Schlink<br/>
Untergasse 27<br/>
D-69469 Weinheim</p>
<h3>EU-Streitschlichtung</h3>
<p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a>. Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
`;

const WIDERRUF_HTML = `
<p>Ein Widerrufsrecht besteht für die von uns angebotenen Flugausbildungs- und Reiseleistungen gemäß § 312g Abs. 2 Nr. 9 BGB nicht. Diese Vorschrift schließt das Widerrufsrecht bei Verträgen zur Erbringung von Dienstleistungen in den Bereichen Freizeitgestaltung aus, wenn der Vertrag für die Erbringung einen spezifischen Termin oder Zeitraum vorsieht.</p>
<p>Unabhängig davon können Sie jederzeit vor Kursbeginn bzw. Reisebeginn von der Buchung zurücktreten. Die dabei anfallenden Rücktrittsgebühren (Stornogebühren) entnehmen Sie bitte den <a href="/agb">Allgemeinen Geschäftsbedingungen</a>, Ziffer 7.</p>
`;

export const LEGAL_PAGE_DEFAULTS: Record<string, { title: string; content: string }> = {
  agb: { title: 'Allgemeine Geschäftsbedingungen', content: AGB_HTML },
  datenschutz: { title: 'Datenschutzerklärung', content: DATENSCHUTZ_HTML },
  impressum: { title: 'Impressum', content: IMPRESSUM_HTML },
  widerruf: { title: 'Widerrufsbelehrung', content: WIDERRUF_HTML }
};
