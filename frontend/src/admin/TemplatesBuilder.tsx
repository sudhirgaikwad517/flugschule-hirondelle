import {
    Form,
    TextInput,
    useGetOne,
    useUpdate,
    useNotify,
    useRefresh
} from 'react-admin';
import { Typography, Card, CardContent, CircularProgress, Box, Paper, Tabs, Tab, Button, Divider } from '@mui/material';
import { useState } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import HelpIcon from '@mui/icons-material/Help';

export const TemplatesBuilder = () => {
    const { data, isLoading, error } = useGetOne('templatesConfig', { id: 'default' });
    const notify = useNotify();
    const refresh = useRefresh();
    const [update, { isLoading: isUpdating }] = useUpdate();
    const [tabIndex, setTabIndex] = useState(0);

    if (isLoading) return <CircularProgress sx={{ m: 4 }} />;
    if (error) return <div>Fehler beim Laden der Vorlagen-Konfiguration</div>;

    const save = (formData: any) => {
        update(
            'templatesConfig',
            { id: 'default', data: formData, previousData: data },
            {
                onSuccess: () => {
                    notify('Vorlagen erfolgreich gespeichert', { type: 'success' });
                    refresh();
                },
                onError: (error: any) => {
                    notify(`Fehler beim Speichern: ${error.message}`, { type: 'error' });
                }
            }
        );
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    return (
        <Card sx={{ mt: 2, mb: 4, mx: 'auto', boxShadow: 3 }}>
            <Form record={data} onSubmit={save}>
                {/* Top Action Bar (like Joomla) */}
                <Box sx={{ p: 2, bgcolor: '#1e293b', color: 'white', display: 'flex', gap: 2, alignItems: 'center', borderTopLeftRadius: 4, borderTopRightRadius: 4 }}>
                    <Typography variant="h6" sx={{ flexGrow: 1, ml: 1 }}>Vorlagen</Typography>
                    
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="success" 
                        startIcon={<SaveIcon />}
                        disabled={isUpdating}
                    >
                        Speichern
                    </Button>
                    <Button variant="contained" color="error" startIcon={<CancelIcon />}>
                        Abbrechen
                    </Button>
                    <Button variant="contained" sx={{ bgcolor: '#475569', '&:hover': { bgcolor: '#334155' } }} startIcon={<RestartAltIcon />}>
                        Zurücksetzen
                    </Button>
                    <Button variant="contained" sx={{ bgcolor: '#475569', '&:hover': { bgcolor: '#334155' } }} startIcon={<HelpIcon />}>
                        Hilfe
                    </Button>
                </Box>

                <CardContent sx={{ p: 0 }}>
                    {/* Tabs Navigation */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }}>
                        <Tabs value={tabIndex} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                            <Tab label="E-Mail" />
                            <Tab label="Listen-Ansichten" />
                            <Tab label="Rechnung" />
                            <Tab label="Zertifikat erteilen" />
                            <Tab label="Ticket und Namensschild" />
                            <Tab label="CSV und XML" />
                        </Tabs>
                    </Box>

                    {/* Tab Panels */}
                    <Box sx={{ p: 4, minHeight: '500px' }}>
                        
                        {/* E-MAIL TAB CONTENT */}
                        <Box style={{ display: tabIndex === 0 ? 'flex' : 'none' }} sx={{ width: '100%', gap: 4, flexWrap: 'wrap' }}>
                            <Box sx={{ flex: 2, minWidth: '300px' }}>
                                <Paper variant="outlined" sx={{ p: 3, mb: 4, borderLeft: '4px solid #3b82f6' }}>
                                    <Typography variant="h6" color="primary" gutterBottom>Buchungs E-Mail</Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <TextInput source="emails.bookingConfirmation.subject" label="Betreff" fullWidth required />
                                    <TextInput source="emails.bookingConfirmation.bodyHtml" label="HTML Text" multiline rows={8} fullWidth required />
                                    <TextInput source="emails.bookingConfirmation.bodyText" label="Nur-Text (Fallback)" multiline rows={4} fullWidth required />
                                </Paper>
                                
                                <Paper variant="outlined" sx={{ p: 3, mb: 4, borderLeft: '4px solid #ef4444' }}>
                                    <Typography variant="h6" color="error" gutterBottom>Buchungskündigungs E-Mail (Storno durch Teilnehmer)</Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <TextInput source="emails.userCancellation.subject" label="Betreff" fullWidth required />
                                    <TextInput source="emails.userCancellation.bodyHtml" label="HTML Text" multiline rows={8} fullWidth required />
                                    <TextInput source="emails.userCancellation.bodyText" label="Nur-Text (Fallback)" multiline rows={4} fullWidth required />
                                </Paper>
                                
                                <Paper variant="outlined" sx={{ p: 3, mb: 4, borderLeft: '4px solid #f97316' }}>
                                    <Typography variant="h6" sx={{ color: '#f97316' }} gutterBottom>Die Buchung wurde durch den Veranstalter storniert</Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <TextInput source="emails.adminCancellation.subject" label="Betreff" fullWidth required />
                                    <TextInput source="emails.adminCancellation.bodyHtml" label="HTML Text" multiline rows={8} fullWidth required />
                                    <TextInput source="emails.adminCancellation.bodyText" label="Nur-Text (Fallback)" multiline rows={4} fullWidth required />
                                </Paper>
                            </Box>
                            
                            <Box sx={{ flex: 1, minWidth: '300px' }}>
                                <Paper sx={{ p: 3, bgcolor: '#f0f9ff', border: '1px solid #bae6fd', position: 'sticky', top: '20px' }}>
                                    <Typography variant="h6" color="primary" gutterBottom>Tipps für Platzhalter</Typography>
                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                        Sie können folgende Platzhalter in Betreff und Text verwenden, welche beim Versand automatisch ersetzt werden:
                                    </Typography>
                                    <Box component="ul" sx={{ m: 0, pl: 2, fontSize: '0.875rem' }}>
                                        <Box component="li" sx={{ mb: 1 }}><code>{'{BOOKING_NAME}'}</code> - Name des Teilnehmers</Box>
                                        <Box component="li" sx={{ mb: 1 }}><code>{'{EVENT_TITLE}'}</code> - Titel der Veranstaltung</Box>
                                        <Box component="li" sx={{ mb: 1 }}><code>{'{EVENT_DETAILS}'}</code> - Datum, Ort und Basisdaten zum Event</Box>
                                        <Box component="li" sx={{ mb: 1 }}><code>{'{BOOKING_DETAILS}'}</code> - Gebuchte Tickets, Optionen, Preis etc.</Box>
                                        <Box component="li" sx={{ mb: 1 }}><code>{'{TOTAL_PRICE}'}</code> - Gesamtpreis</Box>
                                        <Box component="li"><code>{'{SIGNATURE}'}</code> - Signatur der Flugschule</Box>
                                    </Box>
                                </Paper>
                            </Box>
                        </Box>
                        
                        {/* LISTEN-ANSICHTEN TAB CONTENT */}
                        <Box style={{ display: tabIndex === 1 ? 'flex' : 'none' }} sx={{ width: '100%', gap: 4, flexWrap: 'wrap' }}>
                            <Box sx={{ flex: 2, minWidth: '300px' }}>
                                <Paper variant="outlined" sx={{ mb: 4, overflow: 'hidden' }}>
                                    <Box sx={{ bgcolor: '#1e293b', color: 'white', p: 1.5 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Template für die Unterschriftsliste</Typography>
                                    </Box>
                                    <Box sx={{ p: 3 }}>
                                        <TextInput 
                                            source="listViews.signatureList" 
                                            label="HTML / Platzhalter" 
                                            multiline 
                                            fullWidth 
                                            minRows={10} 
                                            sx={{ fontFamily: 'monospace' }} 
                                        />
                                    </Box>
                                </Paper>
                                
                                <Paper variant="outlined" sx={{ mb: 4, overflow: 'hidden' }}>
                                    <Box sx={{ bgcolor: '#1e293b', color: 'white', p: 1.5 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Teilnehmerliste</Typography>
                                    </Box>
                                    <Box sx={{ p: 3 }}>
                                        <TextInput 
                                            source="listViews.participantList" 
                                            label="HTML / Platzhalter" 
                                            multiline 
                                            fullWidth 
                                            minRows={10} 
                                            sx={{ fontFamily: 'monospace' }} 
                                        />
                                    </Box>
                                </Paper>
                            </Box>
                            
                            <Box sx={{ flex: 1, minWidth: '300px' }}>
                                <Paper sx={{ mb: 4, overflow: 'hidden' }}>
                                    <Box sx={{ bgcolor: '#334155', color: 'white', p: 1.5 }}>
                                        <Typography variant="subtitle2" align="center">Tipps für die Unterschrift-Liste</Typography>
                                    </Box>
                                    <Box sx={{ p: 2, bgcolor: '#f8fafc', fontSize: '0.875rem' }}>
                                        <Typography variant="body2" sx={{ mb: 2 }}>Verwenden Sie z.B. <code>##COM_MATUKIO_SIGNATURE_LIST##</code> für den Hauptinhalt.</Typography>
                                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                            <li><code>MAT_EVENT_NUMBER</code>: Event-Nummer</li>
                                            <li><code>MAT_EVENT_TITLE</code>: Event-Titel</li>
                                            <li><code>MAT_EVENT_BEGIN</code>: Beginn</li>
                                            <li><code>MAT_EVENT_END</code>: Ende</li>
                                        </ul>
                                    </Box>
                                </Paper>

                                <Paper sx={{ mb: 4, overflow: 'hidden' }}>
                                    <Box sx={{ bgcolor: '#334155', color: 'white', p: 1.5 }}>
                                        <Typography variant="subtitle2" align="center">Tipps für die Teilnehmer-Liste</Typography>
                                    </Box>
                                    <Box sx={{ p: 2, bgcolor: '#f8fafc', fontSize: '0.875rem' }}>
                                        <Typography variant="body2" sx={{ mb: 2 }}>Verwenden Sie z.B. <code>##COM_MATUKIO_PARTICIPANTS_LIST##</code> für den Hauptinhalt.</Typography>
                                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                            <li><code>MAT_BOOKING_NAME</code>: Name</li>
                                            <li><code>MAT_BOOKING_EMAIL</code>: E-Mail</li>
                                            <li><code>MAT_BOOKING_STATUS</code>: Status</li>
                                        </ul>
                                    </Box>
                                </Paper>
                            </Box>
                        </Box>

                        {/* RECHNUNG TAB CONTENT */}
                        <Box style={{ display: tabIndex === 2 ? 'flex' : 'none' }} sx={{ width: '100%', gap: 4, flexWrap: 'wrap' }}>
                            <Box sx={{ flex: 2, minWidth: '300px' }}>
                                <Paper variant="outlined" sx={{ mb: 4, overflow: 'hidden' }}>
                                    <Box sx={{ bgcolor: '#1e293b', color: 'white', p: 1.5 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Rechnung PDF Template</Typography>
                                    </Box>
                                    <Box sx={{ p: 3 }}>
                                        <TextInput 
                                            source="invoices.pdfTemplate" 
                                            label="HTML / Platzhalter" 
                                            multiline 
                                            fullWidth 
                                            minRows={12} 
                                            sx={{ fontFamily: 'monospace' }} 
                                        />
                                    </Box>
                                </Paper>
                                
                                <Paper variant="outlined" sx={{ mb: 4, overflow: 'hidden' }}>
                                    <Box sx={{ bgcolor: '#1e293b', color: 'white', p: 1.5 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Rechnung E-Mail-Template</Typography>
                                    </Box>
                                    <Box sx={{ p: 3 }}>
                                        <TextInput 
                                            source="invoices.emailSubject" 
                                            label="Betreff" 
                                            fullWidth 
                                            required 
                                        />
                                        <TextInput 
                                            source="invoices.emailBody" 
                                            label="E-Mail Text (HTML / Platzhalter)" 
                                            multiline 
                                            fullWidth 
                                            minRows={6} 
                                            sx={{ mt: 2, fontFamily: 'monospace' }} 
                                        />
                                    </Box>
                                </Paper>
                            </Box>
                            
                            <Box sx={{ flex: 1, minWidth: '300px' }}>
                                <Paper sx={{ mb: 4, overflow: 'hidden', position: 'sticky', top: '20px' }}>
                                    <Box sx={{ bgcolor: '#334155', color: 'white', p: 1.5 }}>
                                        <Typography variant="subtitle2" align="center">Tipps für Platzhalter</Typography>
                                    </Box>
                                    <Box sx={{ p: 2, bgcolor: '#f8fafc', fontSize: '0.875rem' }}>
                                        <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', mt: 1, mb: 1 }}>Kunde</Typography>
                                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                            <li><code>MAT_BOOKING_NAME</code></li>
                                            <li><code>MAT_BOOKING_STREET</code></li>
                                            <li><code>MAT_BOOKING_ZIP</code></li>
                                            <li><code>MAT_BOOKING_CITY</code></li>
                                            <li><code>MAT_BOOKING_COUNTRY</code></li>
                                        </ul>
                                        <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>Rechnung</Typography>
                                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                            <li><code>MAT_INVOICE_NUMBER</code></li>
                                            <li><code>MAT_INVOICE_DATE</code></li>
                                            <li><code>MAT_BOOKING_NUMBER</code></li>
                                            <li><code>MAT_BOOKING_PAYMENT_METHOD</code></li>
                                        </ul>
                                        <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>Werte</Typography>
                                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                            <li><code>MAT_BOOKING_PAYMENT_NETTO</code></li>
                                            <li><code>MAT_BOOKING_PAYMENT_TAX</code></li>
                                            <li><code>MAT_BOOKING_PAYMENT_BRUTTO</code></li>
                                        </ul>
                                    </Box>
                                </Paper>
                            </Box>
                        </Box>

                        {/* ZERTIFIKAT ERTEILEN TAB CONTENT */}
                        <Box style={{ display: tabIndex === 3 ? 'flex' : 'none' }} sx={{ width: '100%', gap: 4, flexWrap: 'wrap' }}>
                            <Box sx={{ flex: 2, minWidth: '300px' }}>
                                <Paper variant="outlined" sx={{ mb: 4, overflow: 'hidden' }}>
                                    <Box sx={{ bgcolor: '#1e293b', color: 'white', p: 1.5 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Zertifikat Template</Typography>
                                    </Box>
                                    <Box sx={{ p: 3 }}>
                                        <TextInput 
                                            source="certificates.pdfTemplate" 
                                            label="HTML / Platzhalter" 
                                            multiline 
                                            fullWidth 
                                            minRows={10} 
                                            sx={{ fontFamily: 'monospace' }} 
                                        />
                                    </Box>
                                </Paper>
                                
                                <Paper variant="outlined" sx={{ mb: 4, overflow: 'hidden' }}>
                                    <Box sx={{ bgcolor: '#1e293b', color: 'white', p: 1.5 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Certificate email template</Typography>
                                    </Box>
                                    <Box sx={{ p: 3 }}>
                                        <TextInput 
                                            source="certificates.emailSubject" 
                                            label="Betreff" 
                                            fullWidth 
                                            required 
                                        />
                                        <TextInput 
                                            source="certificates.emailBody" 
                                            label="E-Mail Text (HTML / Platzhalter)" 
                                            multiline 
                                            fullWidth 
                                            minRows={6} 
                                            sx={{ mt: 2, fontFamily: 'monospace' }} 
                                        />
                                    </Box>
                                </Paper>
                            </Box>
                            
                            <Box sx={{ flex: 1, minWidth: '300px' }}>
                                <Paper sx={{ mb: 4, overflow: 'hidden', position: 'sticky', top: '20px' }}>
                                    <Box sx={{ bgcolor: '#334155', color: 'white', p: 1.5 }}>
                                        <Typography variant="subtitle2" align="center">Tipps für Platzhalter</Typography>
                                    </Box>
                                    <Box sx={{ p: 2, bgcolor: '#f8fafc', fontSize: '0.875rem' }}>
                                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                            <li><code>MAT_BOOKING_NAME</code></li>
                                            <li><code>MAT_EVENT_TITLE</code></li>
                                            <li><code>MAT_DATE</code></li>
                                            <li><code>MAT_EVENT_ALL_DETAILS_HTML</code></li>
                                            <li><code>MAT_SIGNATURE</code></li>
                                        </ul>
                                    </Box>
                                </Paper>
                            </Box>
                        </Box>

                        {/* TICKET UND NAMENSSCHILD TAB CONTENT */}
                        <Box style={{ display: tabIndex === 4 ? 'flex' : 'none' }} sx={{ width: '100%', gap: 4, flexWrap: 'wrap' }}>
                            <Box sx={{ flex: 2, minWidth: '300px' }}>
                                <Paper variant="outlined" sx={{ mb: 4, overflow: 'hidden' }}>
                                    <Box sx={{ bgcolor: '#1e293b', color: 'white', p: 1.5 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Ticket Template</Typography>
                                    </Box>
                                    <Box sx={{ p: 3 }}>
                                        <TextInput 
                                            source="tickets.ticketTemplate" 
                                            label="HTML / Platzhalter" 
                                            multiline 
                                            fullWidth 
                                            minRows={8} 
                                            sx={{ fontFamily: 'monospace' }} 
                                        />
                                        <TextInput 
                                            source="tickets.backgroundImage" 
                                            label="Hintergrundbild (Pfad)" 
                                            fullWidth 
                                            sx={{ mt: 2 }} 
                                        />
                                    </Box>
                                </Paper>
                                
                                <Paper variant="outlined" sx={{ mb: 4, overflow: 'hidden' }}>
                                    <Box sx={{ bgcolor: '#1e293b', color: 'white', p: 1.5 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Namensschild Template</Typography>
                                    </Box>
                                    <Box sx={{ p: 3 }}>
                                        <TextInput 
                                            source="tickets.nametagTemplate" 
                                            label="HTML / Platzhalter" 
                                            multiline 
                                            fullWidth 
                                            minRows={6} 
                                            sx={{ fontFamily: 'monospace' }} 
                                        />
                                    </Box>
                                </Paper>
                            </Box>
                            
                            <Box sx={{ flex: 1, minWidth: '300px' }}>
                                <Paper sx={{ mb: 4, overflow: 'hidden', position: 'sticky', top: '20px' }}>
                                    <Box sx={{ bgcolor: '#334155', color: 'white', p: 1.5 }}>
                                        <Typography variant="subtitle2" align="center">Tipps für Platzhalter</Typography>
                                    </Box>
                                    <Box sx={{ p: 2, bgcolor: '#f8fafc', fontSize: '0.875rem' }}>
                                        <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', mt: 1, mb: 1 }}>Ticket</Typography>
                                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                            <li><code>MAT_EVENT_TITLE</code></li>
                                            <li><code>MAT_EVENT_BEGIN</code></li>
                                            <li><code>MAT_BOOKING_NRBOOKED</code></li>
                                            <li><code>MAT_BOOKING_NUMBER</code></li>
                                            <li><code>MAT_BOOKING_CHECKIN_QRCODE</code></li>
                                            <li><code>MAT_BOOKING_PAYMENT_BRUTTO</code></li>
                                        </ul>
                                        <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>Namensschild</Typography>
                                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                            <li><code>MAT_BOOKING_FIRSTNAME</code></li>
                                            <li><code>MAT_BOOKING_LASTNAME</code></li>
                                            <li><code>MAT_BOOKING_COUNTRY</code></li>
                                            <li><code>MAT_EVENT_TITLE</code></li>
                                            <li><code>MAT_BOOKING_ID</code></li>
                                        </ul>
                                    </Box>
                                </Paper>
                            </Box>
                        </Box>

                        {/* CSV UND XML TAB CONTENT */}
                        <Box style={{ display: tabIndex === 5 ? 'flex' : 'none' }} sx={{ width: '100%', gap: 4, flexWrap: 'wrap' }}>
                            <Box sx={{ flex: 2, minWidth: '300px' }}>
                                <Paper variant="outlined" sx={{ mb: 4, overflow: 'hidden' }}>
                                    <Box sx={{ bgcolor: '#1e293b', color: 'white', p: 1.5 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Template für den CSV Export der Buchungsliste</Typography>
                                    </Box>
                                    <Box sx={{ p: 3 }}>
                                        <TextInput 
                                            source="csvXml.csvTemplate" 
                                            label="CSV Header Template" 
                                            multiline 
                                            fullWidth 
                                            minRows={5} 
                                            sx={{ fontFamily: 'monospace' }} 
                                        />
                                    </Box>
                                </Paper>
                                
                                <Paper variant="outlined" sx={{ mb: 4, overflow: 'hidden' }}>
                                    <Box sx={{ bgcolor: '#1e293b', color: 'white', p: 1.5 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Buchungs-E-Mail XML-Anhang Vorlage</Typography>
                                    </Box>
                                    <Box sx={{ p: 3 }}>
                                        <TextInput 
                                            source="csvXml.xmlTemplate" 
                                            label="XML Template" 
                                            multiline 
                                            fullWidth 
                                            minRows={10} 
                                            sx={{ fontFamily: 'monospace' }} 
                                        />
                                    </Box>
                                </Paper>
                            </Box>
                            
                            <Box sx={{ flex: 1, minWidth: '300px' }}>
                                <Paper sx={{ mb: 4, overflow: 'hidden' }}>
                                    <Box sx={{ bgcolor: '#334155', color: 'white', p: 1.5 }}>
                                        <Typography variant="subtitle2" align="center">Tipps für den CSV-Export</Typography>
                                    </Box>
                                    <Box sx={{ p: 2, bgcolor: '#f8fafc', fontSize: '0.875rem' }}>
                                        <Typography variant="body2" color="textSecondary">
                                            Trennen Sie die Platzhalter mit einem Semikolon <code>;</code> um eine korrekte CSV Struktur zu erhalten.
                                        </Typography>
                                    </Box>
                                </Paper>
                                <Paper sx={{ mb: 4, overflow: 'hidden' }}>
                                    <Box sx={{ bgcolor: '#334155', color: 'white', p: 1.5 }}>
                                        <Typography variant="subtitle2" align="center">Tipps für Platzhalter (XML)</Typography>
                                    </Box>
                                    <Box sx={{ p: 2, bgcolor: '#f8fafc', fontSize: '0.875rem' }}>
                                        <Typography variant="body2" color="textSecondary">
                                            Sie können hier jeden <code>MAT_BOOKING_...</code> Platzhalter als XML-Knoten verwenden.
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Box>
                        </Box>

                        {/* OTHER TABS CONTENT (Placeholders) */}
                        <Box style={{ display: tabIndex > 5 ? 'block' : 'none' }}>
                            <Typography variant="body1" sx={{ p: 4, textAlign: 'center', color: 'gray' }}>
                                Dieser Bereich wird in einem zukünftigen Update implementiert.
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Form>
        </Card>
    );
};
