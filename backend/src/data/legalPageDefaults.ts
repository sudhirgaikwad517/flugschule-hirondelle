import fs from 'fs';
import path from 'path';

// Full AGB / Datenschutzerklärung text as provided by the operator (converted
// from the source .txt files) - too long to inline as template literals here.
const AGB_HTML = fs.readFileSync(path.join(__dirname, 'legal/agb.html'), 'utf8');
const DATENSCHUTZ_HTML = fs.readFileSync(path.join(__dirname, 'legal/datenschutz.html'), 'utf8');

const IMPRESSUM_HTML = `
<p><strong>Anbieter i.S.d. TMG/ Autor i.S.d. § 55 Abs. 2 RStV</strong></p>
<p>Unternehmen: Flugschule Hirondelle<br/>
Anschrift: Untergasse 27, D-69469 Weinheim</p>
<p>Rechtsform: Inhabergeführtes Einzelunternehmen<br/>
Inhaber: Alexander Schlink</p>
<p>Ust.Ident.Nr. DE 272394912</p>
<p>E-Mail: info@fs-hirondelle.de<br/>
Telefon: +49 (0)6201 8452097</p>
<h3>Berufsbezeichnung</h3>
<p>Fluglehrer<br/>
Verliehen in der Bundesrepublik von dem Deutschen Hängegleiterverband e.V. im DAeC (DHV) als Beauftragter des Bundesministeriums für Verkehr (BMVI).</p>
<h3>Berufsaufsicht</h3>
<p>Deutschen Hängegleiterverband e.V. im DAeC vom (DHV) als Beauftragter des Bundesministeriums für Verkehr (BMVI).</p>
<p>Am Hoffeld 4, 83703 Gmund am Tegernsee<br/>
Die Website des DHV finden Sie unter <a href="http://www.dhv.de" target="_blank" rel="noopener noreferrer">www.dhv.de</a>.</p>
<p>Weitere Informationen zu den Ausbildungsbestimmungen und den Berufsrechtlichen Regelungen für Fluglehrer im Bereich Gleitschirm- und Drachenfliegen finden Sie unter dem nachfolgenden Link: <a href="https://www.dhv.de/web/piloteninfos/ausbildung/luftrecht/" target="_blank" rel="noopener noreferrer">https://www.dhv.de/web/piloteninfos/ausbildung/luftrecht/</a></p>
<h3>Lizenznummer</h3>
<p>41016</p>
<h3>Informationen zur Online-Streitbeilegung</h3>
<p>Online-Streitbeilegung gemäß Art. 14 Abs. 1 ODR-VO: Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, die Sie unter <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a> finden. Zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle sind wir nicht verpflichtet und nicht bereit.</p>
<h3>Bankverbindung</h3>
<p>Kontoinhaber: Alexander Schlink<br/>
Sparkasse Südpfalz<br/>
IBAN: DE32 5485 0010 1700 1976 41<br/>
BIC: SOLADES1SUW</p>
<p>Kontonummer: 1700197641<br/>
Bankleitzahl: 54850010</p>
<h3>Siehe auch</h3>
<p><a href="/agb">Allgemeine Geschäftsbedingungen</a><br/>
<a href="/datenschutz">Datenschutzerklärung</a></p>
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
