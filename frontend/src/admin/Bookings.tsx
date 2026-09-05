import {
    List,
    Datagrid,
    TextField,
    DateField,
    NumberField,
    Filter,
    TextInput,
    SelectInput,
    ReferenceInput,
    ShowButton,
    Show,
    TopToolbar,
    ListButton,
    useRecordContext,
    useUpdate,
    useNotify,
    useRefresh,
    useListContext,
    Button as RaButton,
    FunctionField,
    BooleanField,
} from 'react-admin';
import { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableRow, Paper, Typography, Box, Grid, Card, CardContent,
    FormControl, InputLabel, Select, MenuItem, Button, TextField as MuiTextField, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip, Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import BadgeIcon from '@mui/icons-material/Badge';

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

async function postBulk(path: string, body: any) {
    const res = await fetch(`/api/bookings${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Fehler');
    return data;
}

// --- Filters (mirrors Matukio's search box, "Active or Floating" status
// dropdown, event dropdown, and time-period dropdown) ---
const statusChoices = [
    { id: 'activeandpending', name: 'Aktiv und ausstehend' },
    { id: 'all', name: 'Alle' },
    { id: 'active', name: 'Bestätigt' },
    { id: 'pending', name: 'Ausstehend' },
    { id: 'waitlist', name: 'Warteliste' },
    { id: 'archived', name: 'Abgeschlossen' },
    { id: 'deleted', name: 'Storniert / Papierkorb' },
    { id: 'paid', name: 'Bezahlt' },
    { id: 'unpaid', name: 'Unbezahlt' },
];

const timeChoices = [
    { id: 'all', name: 'Alle Zeiten' },
    { id: 'day', name: 'Letzter Tag' },
    { id: 'week', name: 'Letzte Woche' },
    { id: 'month', name: 'Letzter Monat' },
    { id: 'year', name: 'Letztes Jahr' },
];

const BookingFilter = (props: any) => (
    <Filter {...props}>
        <TextInput label="Suche (Name, E-Mail, id:123)" source="q" alwaysOn />
        <SelectInput label="Status" source="status" choices={statusChoices} alwaysOn />
        <ReferenceInput label="Event" source="eventId" reference="events" perPage={500} sort={{ field: 'startDate', order: 'DESC' }}>
            <SelectInput optionText="title" emptyText="Alle Events" />
        </ReferenceInput>
        <SelectInput label="Zeitraum" source="time" choices={timeChoices} />
    </Filter>
);

// --- Compose dialog, shared by Reject and Contact (both send free-text email) ---
const ComposeDialog = ({ open, title, onClose, onSend, defaultSubject }: {
    open: boolean; title: string; onClose: () => void; onSend: (subject: string, message: string) => Promise<void>; defaultSubject: string;
}) => {
    const [subject, setSubject] = useState(defaultSubject);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => { if (open) { setSubject(defaultSubject); setMessage(''); } }, [open, defaultSubject]);

    const handleSend = async () => {
        setSending(true);
        try {
            await onSend(subject, message);
            onClose();
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    Platzhalter verfügbar: {'{BOOKING_NAME}'}, {'{EVENT_TITLE}'}
                </Typography>
                <MuiTextField fullWidth margin="dense" label="Betreff" value={subject} onChange={(e) => setSubject(e.target.value)} />
                <MuiTextField fullWidth margin="dense" label="Nachricht" value={message} onChange={(e) => setMessage(e.target.value)} multiline minRows={6} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Abbrechen</Button>
                <Button variant="contained" onClick={handleSend} disabled={sending || !subject || !message}>
                    {sending ? 'Sende...' : 'Senden'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// --- Bulk action toolbar (mirrors the old Matukio admin toolbar) ---
const BookingBulkActions = () => {
    const { selectedIds, filterValues, data } = useListContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const [rejectOpen, setRejectOpen] = useState(false);
    const [contactOpen, setContactOpen] = useState(false);

    const run = async (path: string, body: any, successMsg?: string) => {
        try {
            const result = await postBulk(path, body);
            notify(successMsg || result.message || 'Erledigt', { type: 'success' });
            refresh();
        } catch (e: any) {
            notify(`Fehler: ${e.message}`, { type: 'error' });
        }
    };

    const isTrashView = filterValues?.status === 'deleted';

    return (
        <>
            <RaButton label="Aktivieren" onClick={() => run('/bulk/activate', { ids: selectedIds })}><CheckCircleIcon /></RaButton>
            <RaButton label="Ausstehend" onClick={() => run('/bulk/pending', { ids: selectedIds })}><CancelIcon /></RaButton>
            <RaButton label="Ablehnen" onClick={() => setRejectOpen(true)} />
            {!isTrashView && (
                <RaButton label="Papierkorb" onClick={() => run('/bulk/wastebasket', { ids: selectedIds })} />
            )}
            {isTrashView && (
                <RaButton label="Papierkorb leeren" onClick={() => {
                    if (window.confirm('Diese Buchungen werden endgültig gelöscht. Fortfahren?')) {
                        run('/bulk/empty-trash', { ids: selectedIds });
                    }
                }} />
            )}
            <RaButton label="Zertifikat ausstellen" onClick={() => run('/bulk/certificate', { ids: selectedIds, issue: true })} />
            <RaButton label="Zertifikat widerrufen" onClick={() => run('/bulk/certificate', { ids: selectedIds, issue: false })} />
            <RaButton label="Eingecheckt" onClick={() => run('/bulk/checkin', { ids: selectedIds })} />
            <RaButton label="Kontaktieren" onClick={() => setContactOpen(true)} />

            <ComposeDialog
                open={rejectOpen}
                title="Buchungen ablehnen"
                defaultSubject="Ihre Buchung für {EVENT_TITLE}"
                onClose={() => setRejectOpen(false)}
                onSend={(subject, message) => run('/bulk/reject', { ids: selectedIds, subject, message }, 'Buchungen abgelehnt und benachrichtigt.')}
            />
            <ComposeDialog
                open={contactOpen}
                title="Teilnehmer kontaktieren"
                defaultSubject="Information zu {EVENT_TITLE}"
                onClose={() => setContactOpen(false)}
                onSend={(subject, message) => run('/bulk/contact', { ids: selectedIds, subject, message })}
            />
        </>
    );
};

// --- List-level export actions (operate on the current filter, matching
// Matukio's CSV/participant-list/signature-list, which work off the filtered
// view rather than a row selection) ---
const BookingListActions = () => {
    const { filterValues } = useListContext();

    const openExport = (path: string) => {
        const qs = new URLSearchParams();
        if (filterValues?.eventId) qs.set('eventId', filterValues.eventId);
        if (filterValues?.status) qs.set('status', filterValues.status);
        if (filterValues?.q) qs.set('q', filterValues.q);
        if (filterValues?.time) qs.set('time', filterValues.time);
        const token = localStorage.getItem('auth');
        // These are simple GETs behind auth middleware - open with the token
        // appended isn't supported server-side, so we fetch and open a blob
        // instead of navigating directly.
        fetch(`/api/bookings${path}?${qs.toString()}`, { headers: authHeaders() })
            .then(async (res) => {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
            });
    };

    return (
        <TopToolbar>
            <Tooltip title="Teilnehmerliste drucken">
                <IconButton onClick={() => openExport('/export/participant-list')}><PrintIcon /></IconButton>
            </Tooltip>
            <Tooltip title="Unterschriftenliste drucken">
                <IconButton onClick={() => openExport('/export/signature-list')}><PrintIcon fontSize="small" /></IconButton>
            </Tooltip>
            <Tooltip title="Als CSV exportieren">
                <IconButton onClick={() => openExport('/export/csv')}><DownloadIcon /></IconButton>
            </Tooltip>
        </TopToolbar>
    );
};

const PaidToggle = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();
    if (!record) return null;

    const toggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/api/bookings/${record.id}/paid`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ paid: !record.paid }),
            });
            if (!res.ok) throw new Error('Fehler beim Aktualisieren');
            notify(record.paid ? 'Als unbezahlt markiert' : 'Als bezahlt markiert', { type: 'success' });
            refresh();
        } catch (err: any) {
            notify(`Fehler: ${err.message}`, { type: 'error' });
        }
    };

    return (
        <Tooltip title={record.paid ? 'Als unbezahlt markieren' : 'Als bezahlt markieren'}>
            <Chip
                size="small"
                label={record.paid ? 'Bezahlt' : 'Offen'}
                color={record.paid ? 'success' : 'default'}
                onClick={toggle}
            />
        </Tooltip>
    );
};

const StatusChip = () => {
    const record = useRecordContext();
    if (!record) return null;
    const map: Record<string, { label: string; color: any }> = {
        CONFIRMED: { label: 'Bestätigt', color: 'success' },
        PENDING: { label: 'Ausstehend', color: 'warning' },
        WAITLIST: { label: 'Warteliste', color: 'info' },
        COMPLETED: { label: 'Abgeschlossen', color: 'default' },
        CANCELLED: { label: 'Storniert', color: 'error' },
    };
    const status = record.checkedIn ? { label: 'Eingecheckt', color: 'success' } : (map[record.status] || { label: record.status, color: 'default' });
    return <Chip size="small" label={status.label} color={status.color} />;
};

export const BookingList = () => (
    <List filters={<BookingFilter />} actions={<BookingListActions />} filterDefaultValues={{ status: 'activeandpending' }} sort={{ field: 'createdAt', order: 'DESC' }}>
        <Datagrid rowClick="show" bulkActionButtons={<BookingBulkActions />} sx={{ overflowX: 'auto' }}>
            <TextField source="shortId" label="ID" />
            <TextField source="customerName" label="Name" />
            <TextField source="customerEmail" label="E-Mail" />
            <FunctionField label="Event" render={(r: any) => r.event?.title || '—'} />
            <DateField source="createdAt" label="Buchungsdatum" showTime />
            <NumberField source="bookedSeats" label="Plätze" />
            <PaidToggle label="Bezahlt" />
            <BooleanField source="certificated" label="Zertifikat" />
            <StatusChip label="Status" />
            <NumberField source="totalPrice" label="Gesamtpreis (€)" options={{ style: 'currency', currency: 'EUR' }} />
            <ShowButton />
        </Datagrid>
    </List>
);

const BookingShowActions = () => (
    <TopToolbar>
        <ListButton />
    </TopToolbar>
);

const NameTagButton = () => {
    const record = useRecordContext();
    if (!record) return null;
    const download = () => {
        fetch(`/api/bookings/${record.id}/name-tag`, { headers: authHeaders() })
            .then(async (res) => {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Namensschild_${record.shortId || record.id.split('-')[0]}.pdf`;
                a.click();
            });
    };
    return (
        <Button startIcon={<BadgeIcon />} onClick={download} variant="outlined" size="small" sx={{ mt: 2 }}>
            Namensschild (PDF)
        </Button>
    );
};

const AdminActions = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const [update, { isLoading }] = useUpdate();
    const [status, setStatus] = useState('PENDING');
    const [details, setDetails] = useState<any>({});
    const [adminComment, setAdminComment] = useState('');

    useEffect(() => {
        if (record) {
            setStatus(record.status);
            setDetails(record.customerDetails || {});
            setAdminComment(record.adminComment || '');
        }
    }, [record]);

    const handleSave = () => {
        if (!record) return;
        update(
            'bookings',
            { id: record.id, data: { status, customerDetails: details, adminComment }, previousData: record },
            {
                onSuccess: () => {
                    notify('Buchung erfolgreich aktualisiert!', { type: 'success' });
                    refresh();
                },
                onError: (error: any) => notify(`Fehler: ${error.message}`, { type: 'error' })
            }
        );
    };

    const setField = (field: string) => (e: any) => {
        setDetails((prev: any) => ({ ...prev, [field]: e.target.value }));
    };

    if (!record) return null;

    return (
        <Card elevation={1} sx={{ mt: { xs: 2, md: 0 } }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>Verwaltung (Status)</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Hier können Sie den Status der Buchung anpassen, z.B. wenn eine Zahlung per Banküberweisung eingegangen ist.
                </Typography>

                <FormControl fullWidth margin="normal" size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        label="Status"
                    >
                        <MenuItem value="PENDING">Ausstehend (Pending)</MenuItem>
                        <MenuItem value="CONFIRMED">Bestätigt (Confirmed)</MenuItem>
                        <MenuItem value="WAITLIST">Warteliste (Waitlist)</MenuItem>
                        <MenuItem value="COMPLETED">Abgeschlossen (Completed)</MenuItem>
                        <MenuItem value="CANCELLED">Storniert (Cancelled)</MenuItem>
                    </Select>
                </FormControl>

                <MuiTextField
                    fullWidth margin="normal" size="small" label="Interner Kommentar (nur Admin)" multiline minRows={2}
                    value={adminComment} onChange={(e) => setAdminComment(e.target.value)}
                />

                <NameTagButton />

                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>Kundendetails bearbeiten</Typography>
                <MuiTextField fullWidth margin="dense" size="small" label="Vorname" value={details.firstName || ''} onChange={setField('firstName')} />
                <MuiTextField fullWidth margin="dense" size="small" label="Nachname" value={details.lastName || ''} onChange={setField('lastName')} />
                <MuiTextField fullWidth margin="dense" size="small" label="E-Mail" value={details.email || ''} onChange={setField('email')} />
                <MuiTextField fullWidth margin="dense" size="small" label="Telefon" value={details.phone || ''} onChange={setField('phone')} />
                <MuiTextField fullWidth margin="dense" size="small" label="Straße" value={details.street || ''} onChange={setField('street')} />
                <MuiTextField fullWidth margin="dense" size="small" label="PLZ" value={details.zip || ''} onChange={setField('zip')} />
                <MuiTextField fullWidth margin="dense" size="small" label="Stadt" value={details.city || ''} onChange={setField('city')} />
                <MuiTextField fullWidth margin="dense" size="small" label="Land" value={details.country || ''} onChange={setField('country')} />

                <Box sx={{ mt: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={isLoading}
                        fullWidth
                    >
                        Speichern
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

const CustomBookingDetails = () => {
    const record = useRecordContext();
    if (!record) return null;

    return (
        <Box sx={{ p: 3, width: '100%' }}>
            <Typography variant="h6" gutterBottom>Buchungsdetails</Typography>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 8 }}>
                    <Paper elevation={1}>
                        <Table sx={{ tableLayout: 'fixed' }}>
                            <TableBody>
                        <TableRow>
                            <TableCell component="th" scope="row" style={{ fontWeight: 'bold', width: '30%' }}>ID</TableCell>
                            <TableCell>{record.id}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Benutzer ID</TableCell>
                            <TableCell>{record.userId}</TableCell>
                        </TableRow>
                        {record.event && (
                            <>
                                <TableRow>
                                    <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Event</TableCell>
                                    <TableCell>
                                        <strong>{record.event.title}</strong>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Kategorie</TableCell>
                                    <TableCell>{record.event.category}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Datum</TableCell>
                                    <TableCell>
                                        {new Date(record.event.startDate).toLocaleDateString('de-DE')}
                                        {record.event.endDate && ` - ${new Date(record.event.endDate).toLocaleDateString('de-DE')}`}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Ort</TableCell>
                                    <TableCell>{record.event.location || '-'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Veranstalter</TableCell>
                                    <TableCell>{record.event.organizer || '-'}</TableCell>
                                </TableRow>
                            </>
                        )}
                        {!record.event && (
                            <TableRow>
                                <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Event ID</TableCell>
                                <TableCell>{record.eventId}</TableCell>
                            </TableRow>
                        )}
                        <TableRow>
                            <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell>{record.status}{record.checkedIn ? ' (eingecheckt)' : ''}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Bezahlt</TableCell>
                            <TableCell>{record.paid ? 'Ja' : 'Nein'}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Zertifikat</TableCell>
                            <TableCell>{record.certificated ? 'Ausgestellt' : 'Nicht ausgestellt'}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Gesamtpreis</TableCell>
                            <TableCell>
                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(record.totalPrice || 0)}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Zahlungsart</TableCell>
                            <TableCell>{record.paymentMethod}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Erstellt am</TableCell>
                            <TableCell>{new Date(record.createdAt).toLocaleString('de-DE')}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Bemerkungen (Kunde)</TableCell>
                            <TableCell>{record.remarks || '-'}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Interner Kommentar</TableCell>
                            <TableCell>{record.adminComment || '-'}</TableCell>
                        </TableRow>

                        {record.customerDetails && (
                            <TableRow>
                                <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Kundendetails (Rechnungsadresse)</TableCell>
                                <TableCell>
                                    {record.customerDetails.firstName} {record.customerDetails.lastName}<br />
                                    {record.customerDetails.street}<br />
                                    {record.customerDetails.zip} {record.customerDetails.city}<br />
                                    {record.customerDetails.country}<br />
                                    Tel: {record.customerDetails.phone}
                                </TableCell>
                            </TableRow>
                        )}

                        {record.items && record.items.length > 0 && (
                            <TableRow>
                                <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Gekaufte Tickets</TableCell>
                                <TableCell>
                                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                        {record.items.map((item: any) => (
                                            <li key={item.id}>
                                                <strong>{item.quantity}x</strong> {item.ticket?.name}
                                                {item.ticket?.price ? ` (à €${item.ticket.price.toFixed(2)})` : ''}
                                            </li>
                                        ))}
                                    </ul>
                                </TableCell>
                            </TableRow>
                        )}
                                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <AdminActions />
                </Grid>
            </Grid>
        </Box>
    );
};

export const BookingShow = () => (
  <Show actions={<BookingShowActions />}>
      <CustomBookingDetails />
  </Show>
);