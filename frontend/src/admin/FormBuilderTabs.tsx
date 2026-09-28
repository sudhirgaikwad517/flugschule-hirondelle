import { useState } from 'react';
import {
    Box,
    Grid,
    Typography,
    Divider,
    TextField as MuiTextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Tabs,
    Tab,
    Alert,
} from '@mui/material';
import { IntroTextEditor } from './IntroTextEditor';

// The 6 tabs beyond Allgemein - see FormBuilder.tsx for the full toolbar/
// tab-set context and the deep-verification-against-old-source rationale.
// Each tab receives just its own settings slice + a setter, so a parent
// only has to do `onChange={(v) => setSettings((s) => ({ ...s, ergebnis: v }))}`.

const YesNo = ({ label, help, value, onChange, helperText }: { label: string; help?: string; value: boolean; onChange: (v: boolean) => void; helperText?: string }) => (
    <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>{label}</InputLabel>
        <Select label={label} value={value ? '1' : '0'} onChange={(e) => onChange(e.target.value === '1')}>
            <MenuItem value="0">Nein</MenuItem>
            <MenuItem value="1">Ja</MenuItem>
        </Select>
        {helperText && <Typography variant="caption" sx={{ color: '#888', mt: 0.5 }}>{helperText}</Typography>}
        {!helperText && help}
    </FormControl>
);

export const ErgebnisTab = ({ value, onChange, showHelp }: { value: any; onChange: (v: any) => void; showHelp: boolean }) => (
    <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 5 }}>
            <YesNo
                label="Ergebnis speichern?"
                value={value.saveResult}
                onChange={(v) => onChange({ ...value, saveResult: v })}
                helperText={showHelp ? 'Wenn "Nein": Einsendungen werden nicht in der Datenbank gespeichert (erscheinen nicht unter "Daten"), E-Mails/Weiterleitung funktionieren trotzdem.' : undefined}
            />
            <MuiTextField
                label="Weiterleitungs-URL (optional)"
                fullWidth
                value={value.redirectUrl}
                onChange={(e) => onChange({ ...value, redirectUrl: e.target.value })}
                helperText={showHelp ? 'Nach erfolgreichem Absenden dorthin weiterleiten, statt den Text rechts anzuzeigen. Felder als {feldname} einfügbar.' : 'Leer lassen, um stattdessen den Text rechts anzuzeigen'}
                sx={{ mb: 2 }}
            />
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="subtitle1" gutterBottom>Text bei Ergebnis</Typography>
            <Divider sx={{ mb: 2 }} />
            <IntroTextEditor
                label=""
                value={value.textResult}
                onChange={(v) => onChange({ ...value, textResult: v })}
                helperText={showHelp ? 'Wird nach erfolgreichem Absenden anstelle des Formulars angezeigt (falls keine Weiterleitungs-URL gesetzt ist). Felder als {feldname} einfügbar.' : undefined}
                minHeight={140}
            />
        </Grid>
    </Grid>
);

const EmailBlockEditor = ({
    value, onChange, showHelp, toLabel,
}: { value: any; onChange: (v: any) => void; showHelp: boolean; toLabel?: string }) => (
    <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
            <YesNo label="E-Mail versenden?" value={value.enabled} onChange={(v) => onChange({ ...value, enabled: v })} />
        </Grid>
        {toLabel && (
            <Grid size={{ xs: 12, md: 6 }}>
                <MuiTextField label={toLabel} fullWidth value={value.to || ''} onChange={(e) => onChange({ ...value, to: e.target.value })} helperText={showHelp ? 'Ein oder mehrere Empfänger, kommagetrennt' : undefined} />
            </Grid>
        )}
        <Grid size={{ xs: 12, md: 6 }}>
            <MuiTextField label="Betreff" fullWidth value={value.subject} onChange={(e) => onChange({ ...value, subject: e.target.value })} helperText={showHelp ? 'Felder als {feldname} einfügbar' : undefined} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} />
        <Grid size={{ xs: 12, md: 6 }}>
            <MuiTextField label="Von (E-Mail)" fullWidth value={value.fromEmail} onChange={(e) => onChange({ ...value, fromEmail: e.target.value })} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
            <MuiTextField label="Von (Name)" fullWidth value={value.fromName} onChange={(e) => onChange({ ...value, fromName: e.target.value })} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
            <MuiTextField label="CC" fullWidth value={value.cc} onChange={(e) => onChange({ ...value, cc: e.target.value })} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
            <MuiTextField label="BCC" fullWidth value={value.bcc} onChange={(e) => onChange({ ...value, bcc: e.target.value })} />
        </Grid>
        <Grid size={12}>
            <IntroTextEditor label="Text" value={value.bodyHtml} onChange={(v) => onChange({ ...value, bodyHtml: v })} minHeight={140} />
        </Grid>
        <Grid size={12}><Divider sx={{ my: 1 }} /><Typography variant="caption" sx={{ color: '#888' }}>Automatisch generierter Inhalt</Typography></Grid>
        <Grid size={{ xs: 12, md: 6 }}><YesNo label="Formulartitel einbeziehen" value={value.includeFormTitle} onChange={(v) => onChange({ ...value, includeFormTitle: v })} /></Grid>
        <Grid size={{ xs: 12, md: 6 }}><YesNo label="Erstellungsdatum einbeziehen" value={value.includeCreated} onChange={(v) => onChange({ ...value, includeCreated: v })} /></Grid>
        <Grid size={{ xs: 12, md: 6 }}><YesNo label="Übermittelte Daten einbeziehen" value={value.includeData} onChange={(v) => onChange({ ...value, includeData: v })} /></Grid>
        <Grid size={{ xs: 12, md: 6 }}><YesNo label="Datensatz-ID einbeziehen" value={value.includeDataRecordId} onChange={(v) => onChange({ ...value, includeDataRecordId: v })} /></Grid>
        <Grid size={{ xs: 12, md: 6 }}><YesNo label="IP-Adresse einbeziehen" value={value.includeIp} onChange={(v) => onChange({ ...value, includeIp: v })} /></Grid>
    </Grid>
);

export const EmailOptionenTab = ({ value, onChange, showHelp }: { value: any; onChange: (v: any) => void; showHelp: boolean }) => {
    const [sub, setSub] = useState(0);
    return (
        <Box>
            <Tabs value={sub} onChange={(_, v) => setSub(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="Ergebnis-E-Mail" />
                <Tab label="Empfangsbestätigung" />
            </Tabs>
            {sub === 0 ? (
                <EmailBlockEditor value={value.result} onChange={(v) => onChange({ ...value, result: v })} showHelp={showHelp} toLabel="An (Empfänger)" />
            ) : (
                <>
                    {showHelp && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Wird an die E-Mail-Adresse gesendet, die der Absender selbst im Formular eingetragen hat (das erste E-Mail-Feld des Formulars).
                        </Alert>
                    )}
                    <EmailBlockEditor value={value.receipt} onChange={(v) => onChange({ ...value, receipt: v })} showHelp={showHelp} />
                </>
            )}
        </Box>
    );
};

const CAPTCHA_CHOICES = [
    { value: '0', label: 'Kein Captcha' },
    { value: '1', label: 'Viscaptcha (Bild)' },
    { value: '3', label: 'hCaptcha' },
    { value: '4', label: 'Google reCAPTCHA v2' },
    { value: '5', label: 'Google reCAPTCHA v2 (unsichtbar)' },
];

export const SpamschutzTab = ({ value, onChange, showHelp }: { value: any; onChange: (v: any) => void; showHelp: boolean }) => {
    const [sub, setSub] = useState(0);
    return (
        <Box>
            <Tabs value={sub} onChange={(_, v) => setSub(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="Honeypot" />
                <Tab label="Spambot-Check" />
                <Tab label="Captcha" />
            </Tabs>
            {sub === 0 && (
                <Box sx={{ maxWidth: 480 }}>
                    <YesNo
                        label="Honeypot aktivieren"
                        value={value.honeypot}
                        onChange={(v) => onChange({ ...value, honeypot: v })}
                        helperText="Echte Nutzer sehen dieses Feld nie (unsichtbar); ein Bot, der jedes Feld ausfüllt, füllt es mit aus - die Einsendung wird dann still verworfen. Einzige hier tatsächlich aktive Spam-Schutzmaßnahme."
                    />
                </Box>
            )}
            {sub === 1 && (
                <Box sx={{ maxWidth: 640 }}>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Diese Einstellungen werden gespeichert, sind aber noch nicht aktiv - dafür wären externe API-Zugänge (StopForumSpam, Project Honeypot, SpamCop-DNSBL) nötig, die dieses System bisher nicht hat.
                    </Alert>
                    <YesNo label="Spambot-Check aktivieren" value={value.spambotCheckEnabled} onChange={(v) => onChange({ ...value, spambotCheckEnabled: v })} />
                    <YesNo label="IP-Adresse prüfen" value={value.spambotCheckIp} onChange={(v) => onChange({ ...value, spambotCheckIp: v })} />
                    <YesNo label="E-Mail-Adresse prüfen" value={value.spambotCheckEmail} onChange={(v) => onChange({ ...value, spambotCheckEmail: v })} />
                    <Divider sx={{ my: 2 }} />
                    <YesNo label="StopForumSpam.com nutzen" value={value.stopforumspamEnabled} onChange={(v) => onChange({ ...value, stopforumspamEnabled: v })} />
                    <MuiTextField type="number" label="Erlaubte Häufigkeit" fullWidth value={value.stopforumspamMaxFrequency} onChange={(e) => onChange({ ...value, stopforumspamMaxFrequency: Number(e.target.value) })} sx={{ mb: 2 }} />
                    <Divider sx={{ my: 2 }} />
                    <YesNo label="Project Honeypot nutzen" value={value.projecthoneypotEnabled} onChange={(v) => onChange({ ...value, projecthoneypotEnabled: v })} />
                    <MuiTextField label="Project Honeypot API-Key" fullWidth value={value.projecthoneypotApiKey} onChange={(e) => onChange({ ...value, projecthoneypotApiKey: e.target.value })} sx={{ mb: 2 }} />
                    <MuiTextField type="number" label="Erlaubter Threat-Rating" fullWidth value={value.projecthoneypotMaxThreatRating} onChange={(e) => onChange({ ...value, projecthoneypotMaxThreatRating: Number(e.target.value) })} sx={{ mb: 2 }} />
                    <Divider sx={{ my: 2 }} />
                    <YesNo label="SpamCop-DNSBL nutzen" value={value.spamcopEnabled} onChange={(v) => onChange({ ...value, spamcopEnabled: v })} />
                    <YesNo label="Regex-Prüfung erlauben" value={value.allowRegexCheck} onChange={(v) => onChange({ ...value, allowRegexCheck: v })} />
                    <YesNo label="Generische E-Mail-Adressen erlauben" value={value.allowGenericEmailCheck} onChange={(v) => onChange({ ...value, allowGenericEmailCheck: v })} />
                    <MuiTextField label="E-Mail-Whitelist" fullWidth multiline minRows={2} value={value.whitelistEmail} onChange={(e) => onChange({ ...value, whitelistEmail: e.target.value })} sx={{ mb: 2 }} />
                    <MuiTextField label="E-Mail-Blacklist" fullWidth multiline minRows={2} value={value.blacklistEmail} onChange={(e) => onChange({ ...value, blacklistEmail: e.target.value })} sx={{ mb: 2 }} />
                    <MuiTextField label="IP-Whitelist" fullWidth multiline minRows={2} value={value.whitelistIp} onChange={(e) => onChange({ ...value, whitelistIp: e.target.value })} sx={{ mb: 2 }} />
                    <MuiTextField label="IP-Blacklist" fullWidth multiline minRows={2} value={value.blacklistIp} onChange={(e) => onChange({ ...value, blacklistIp: e.target.value })} sx={{ mb: 2 }} />
                </Box>
            )}
            {sub === 2 && (
                <Box sx={{ maxWidth: 480 }}>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Nur Einstellung gespeichert - Captcha ist in dieser Version noch nicht aktiv (benötigt API-Schlüssel für hCaptcha/reCAPTCHA bzw. ein Bild-Captcha-Widget für Viscaptcha).
                    </Alert>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Captcha verwenden</InputLabel>
                        <Select label="Captcha verwenden" value={value.captchaType} onChange={(e) => onChange({ ...value, captchaType: e.target.value })}>
                            {CAPTCHA_CHOICES.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <MuiTextField label="Captcha-Beschriftung" fullWidth value={value.captchaLabel} onChange={(e) => onChange({ ...value, captchaLabel: e.target.value })} sx={{ mb: 2 }} />
                    <MuiTextField label="Hinweistext" fullWidth value={value.captchaTipsText} onChange={(e) => onChange({ ...value, captchaTipsText: e.target.value })} sx={{ mb: 2 }} />
                    <MuiTextField label="Fehlertext" fullWidth value={value.captchaErrorText} onChange={(e) => onChange({ ...value, captchaErrorText: e.target.value })} sx={{ mb: 2 }} />
                </Box>
            )}
        </Box>
    );
};

export const ErweitertTab = ({ value, onChange, showHelp }: { value: any; onChange: (v: any) => void; showHelp: boolean }) => {
    const [sub, setSub] = useState(0);
    const csv = value.csv;
    const layout = value.layout;
    const setCsv = (v: any) => onChange({ ...value, csv: v });
    const setLayout = (v: any) => onChange({ ...value, layout: v });
    return (
        <Box>
            <Tabs value={sub} onChange={(_, v) => setSub(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }} variant="scrollable">
                <Tab label="CSV-Export" />
                <Tab label="Layout" />
                <Tab label="Datei-Upload" />
                <Tab label="Sonstiges" />
            </Tabs>
            {sub === 0 && (
                <Box sx={{ maxWidth: 640 }}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Trennzeichen</InputLabel>
                        <Select label="Trennzeichen" value={csv.separator} onChange={(e) => setCsv({ ...csv, separator: e.target.value })}>
                            <MenuItem value=";">Semikolon (;)</MenuItem>
                            <MenuItem value=",">Komma (,)</MenuItem>
                        </Select>
                    </FormControl>
                    <YesNo label="Kopfzeile einbeziehen" value={csv.includeHeadline} onChange={(v) => setCsv({ ...csv, includeHeadline: v })} />
                    <YesNo label="Nur veröffentlichte Felder" value={csv.publishedFieldsOnly} onChange={(v) => setCsv({ ...csv, publishedFieldsOnly: v })} />
                    <YesNo label="Nur veröffentlichte Daten" value={csv.publishedDataOnly} onChange={(v) => setCsv({ ...csv, publishedDataOnly: v })} />
                    <YesNo label="Spalte: ID einbeziehen" value={csv.includeId} onChange={(v) => setCsv({ ...csv, includeId: v })} />
                    <YesNo label="Spalte: IP-Adresse einbeziehen" value={csv.includeIp} onChange={(v) => setCsv({ ...csv, includeIp: v })} />
                    <YesNo label="Spalte: Erstellt am einbeziehen" value={csv.includeCreated} onChange={(v) => setCsv({ ...csv, includeCreated: v })} />
                    <YesNo label="Spalte: Geändert am einbeziehen" value={csv.includeModifiedAt} onChange={(v) => setCsv({ ...csv, includeModifiedAt: v })} />
                </Box>
            )}
            {sub === 1 && (
                <Box sx={{ maxWidth: 640 }}>
                    <MuiTextField label="Eigene CSS-Klasse" fullWidth value={layout.cssClass} onChange={(e) => setLayout({ ...layout, cssClass: e.target.value })} helperText={showHelp ? 'Wird auf das <form>-Element angewendet' : undefined} sx={{ mb: 2 }} />
                    <YesNo label="Fokus auf erstes Feld setzen" value={layout.setFocus} onChange={(v) => setLayout({ ...layout, setFocus: v })} />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Position "Pflichtfeld"-Hinweis</InputLabel>
                        <Select label='Position "Pflichtfeld"-Hinweis' value={layout.requiredPosition} onChange={(e) => setLayout({ ...layout, requiredPosition: e.target.value })}>
                            <MenuItem value="top">Oben</MenuItem>
                            <MenuItem value="bottom">Unten</MenuItem>
                            <MenuItem value="captcha">Beim Captcha</MenuItem>
                            <MenuItem value="none">Nicht anzeigen</MenuItem>
                        </Select>
                    </FormControl>
                    <YesNo label="Sternchen (*) bei Pflichtfeldern anzeigen" value={layout.requiredAsterisk} onChange={(v) => setLayout({ ...layout, requiredAsterisk: v })} />
                    <MuiTextField type="color" label="Textfarbe Pflichtfeld-Hinweis" fullWidth value={layout.requiredTextColor} onChange={(e) => setLayout({ ...layout, requiredTextColor: e.target.value })} sx={{ mb: 2 }} />
                    <MuiTextField type="color" label="Farbe Sternchen" fullWidth value={layout.requiredAsteriskColor} onChange={(e) => setLayout({ ...layout, requiredAsteriskColor: e.target.value })} sx={{ mb: 2 }} />
                    <YesNo label='Hinweis "wird verarbeitet" anzeigen' value={layout.showProcessingMessage} onChange={(v) => setLayout({ ...layout, showProcessingMessage: v })} />
                    {layout.showProcessingMessage && (
                        <IntroTextEditor label="Verarbeitungs-Hinweistext" value={layout.processingMessage} onChange={(v) => setLayout({ ...layout, processingMessage: v })} minHeight={100} />
                    )}
                </Box>
            )}
            {sub === 2 && (
                <Box sx={{ maxWidth: 640 }}>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Nur Einstellung gespeichert - diese Version hat noch keinen Datei-Upload-Feldtyp, daher greifen diese Werte aktuell nirgends.
                    </Alert>
                    <MuiTextField label="Upload-Pfad" fullWidth value={value.upload?.uploadPath ?? 'tmp'} onChange={(e) => onChange({ ...value, upload: { ...value.upload, uploadPath: e.target.value } })} sx={{ mb: 2 }} />
                    <MuiTextField label="Maximale Dateigröße" fullWidth value={value.upload?.maxFileSize ?? '0'} onChange={(e) => onChange({ ...value, upload: { ...value.upload, maxFileSize: e.target.value } })} sx={{ mb: 2 }} />
                    <MuiTextField label="Erlaubte Dateiendungen" fullWidth value={value.upload?.allowedExtensions ?? ''} onChange={(e) => onChange({ ...value, upload: { ...value.upload, allowedExtensions: e.target.value } })} sx={{ mb: 2 }} />
                </Box>
            )}
            {sub === 3 && (
                <Box sx={{ maxWidth: 480 }}>
                    <YesNo
                        label="Cache-Schutz (Session verwenden)"
                        value={value.upload?.useSession ?? false}
                        onChange={(v) => onChange({ ...value, upload: { ...value.upload, useSession: v } })}
                        helperText={showHelp ? 'Nicht anwendbar - diese Anwendung hat keine seitenweite Cache-Schicht.' : undefined}
                    />
                    <YesNo label='"Powered by"-Hinweis anzeigen' value={value.poweredBy} onChange={(v) => onChange({ ...value, poweredBy: v })} helperText='Zeigt "Bereitgestellt von Flugschule Hirondelle" unten im Formular' />
                </Box>
            )}
        </Box>
    );
};

const DISPLAY_CHOICES = [
    { value: '0', label: 'Nicht anzeigen' },
    { value: '1', label: 'Liste und Detail' },
    { value: '2', label: 'Nur Liste' },
    { value: '3', label: 'Nur Detail' },
];

const DisplaySelect = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>{label}</InputLabel>
        <Select label={label} value={value} onChange={(e) => onChange(e.target.value)}>
            {DISPLAY_CHOICES.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
        </Select>
    </FormControl>
);

export const FrontendDatenanzeigeTab = ({ value, onChange, showHelp }: { value: any; onChange: (v: any) => void; showHelp: boolean }) => (
    <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" gutterBottom>Grundeinstellungen</Typography>
            <Divider sx={{ mb: 2 }} />
            <YesNo
                label="Frontend-Datenansicht erlauben"
                value={value.allowFrontendDataView}
                onChange={(v) => onChange({ ...value, allowFrontendDataView: v })}
                helperText={showHelp ? 'Angemeldete Nutzer können dann ihre eigenen, bisher übermittelten Einträge auf der öffentlichen Seite einsehen (nie die Einträge anderer Nutzer).' : undefined}
            />
            <YesNo label="Neue Einträge sofort sichtbar (Auto-Veröffentlichung)" value={value.autoPublish} onChange={(v) => onChange({ ...value, autoPublish: v })} />
            <YesNo label="Detailansicht anzeigen" value={value.displayDetail} onChange={(v) => onChange({ ...value, displayDetail: v })} />
            <MuiTextField label="Titel der Detailansicht (optional)" fullWidth value={value.detailTitle} onChange={(e) => onChange({ ...value, detailTitle: e.target.value })} sx={{ mb: 2 }} />
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Symbol für Detail-Link</InputLabel>
                <Select label="Symbol für Detail-Link" value={value.detailLinkIcon} onChange={(e) => onChange({ ...value, detailLinkIcon: e.target.value })}>
                    <MenuItem value="eye">Auge</MenuItem>
                    <MenuItem value="download">Download</MenuItem>
                </Select>
            </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" gutterBottom>Angezeigte Spalten</Typography>
            <Divider sx={{ mb: 2 }} />
            <DisplaySelect label="ID anzeigen" value={value.displayId} onChange={(v) => onChange({ ...value, displayId: v })} />
            <DisplaySelect label="Erstellt-Datum anzeigen" value={value.displayCreated} onChange={(v) => onChange({ ...value, displayCreated: v })} />
            <DisplaySelect label="Erstellt-Uhrzeit anzeigen" value={value.displayCreatedTime} onChange={(v) => onChange({ ...value, displayCreatedTime: v })} />
            <DisplaySelect label="IP-Adresse anzeigen" value={value.displayIp} onChange={(v) => onChange({ ...value, displayIp: v })} />
            <DisplaySelect label='"Geändert"-Kennzeichnung anzeigen' value={value.displayIsModified} onChange={(v) => onChange({ ...value, displayIsModified: v })} />
            <DisplaySelect label="Geändert-am-Datum anzeigen" value={value.displayModifiedAt} onChange={(v) => onChange({ ...value, displayModifiedAt: v })} />
            <DisplaySelect label="Geändert-am-Uhrzeit anzeigen" value={value.displayModifiedAtTime} onChange={(v) => onChange({ ...value, displayModifiedAtTime: v })} />
        </Grid>
        <Grid size={12}>
            <Typography variant="subtitle1" gutterBottom>Listenansicht</Typography>
            <Divider sx={{ mb: 2 }} />
            <MuiTextField label="Titel der Listenansicht" fullWidth value={value.listTitle} onChange={(e) => onChange({ ...value, listTitle: e.target.value })} sx={{ mb: 2 }} />
            <IntroTextEditor label="Beschreibungstext" value={value.listDescription} onChange={(v) => onChange({ ...value, listDescription: v })} minHeight={100} />
        </Grid>
    </Grid>
);

export const BerechtigungenTab = () => (
    <Box sx={{ maxWidth: 640 }}>
        <Alert severity="info">
            Diese App verwendet ein einfaches Rollenmodell (Admin / Kunde), kein Joomla-artiges Gruppen-ACL-System.
            Der Zugriff auf diesen Formular-Editor ist bereits auf Administratoren beschränkt (auf jeder Admin-Route
            durchgesetzt) - granulare Berechtigungen pro Benutzergruppe gibt es hier nicht, da es dafür kein
            entsprechendes System gibt.
        </Alert>
    </Box>
);
