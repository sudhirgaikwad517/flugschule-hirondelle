import { useEffect, useState } from 'react';
import { useRecordContext, useNotify, useRefresh } from 'react-admin';
import { useNavigate } from 'react-router-dom';
import {
    Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField as MuiTextField,
    ToggleButtonGroup, ToggleButton, Checkbox, FormControlLabel, Chip, IconButton, Tooltip,
    Table, TableHead, TableRow, TableCell, TableBody, Radio, RadioGroup, FormControl, FormLabel,
    Typography, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import BlockIcon from '@mui/icons-material/Block';
import RestoreIcon from '@mui/icons-material/Restore';
import AddIcon from '@mui/icons-material/Add';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import { DATE_STATUS_COLORS } from './matukioStyle';

const API = '/api';

// Left-border accent color matching old Matukio's date-green/date-canceled/
// date-past/date-unpublished status classes.
function dateStatusColor(d: any): string {
    if (d.cancelled) return DATE_STATUS_COLORS.cancelled;
    if (!d.published) return DATE_STATUS_COLORS.unpublished;
    if (new Date(d.startDate) < new Date()) return DATE_STATUS_COLORS.past;
    return DATE_STATUS_COLORS.active;
}

const FILTERS: { id: string; label: string }[] = [
    { id: 'all', label: 'Alle' },
    { id: 'current', label: 'Aktuell' },
    { id: 'past', label: 'Vergangen' },
    { id: 'today', label: 'Heute' },
    { id: 'week', label: 'Diese Woche' },
    { id: 'month', label: 'Dieser Monat' },
    { id: 'year', label: 'Dieses Jahr' },
    { id: 'cancelled', label: 'Storniert' },
];

const WEEKDAYS = [
    { id: 1, label: 'Mo' }, { id: 2, label: 'Di' }, { id: 3, label: 'Mi' }, { id: 4, label: 'Do' },
    { id: 5, label: 'Fr' }, { id: 6, label: 'Sa' }, { id: 0, label: 'So' },
];

function authHeaders() {
    const token = localStorage.getItem('auth');
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function toLocalInput(value?: string | null) {
    if (!value) return '';
    const d = new Date(value);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toTimeInput(value?: string | null, fallback = '09:00') {
    if (!value) return fallback;
    const d = new Date(value);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toDateInput(value?: string | null) {
    if (!value) return '';
    const d = new Date(value);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const EventDatesManager = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const navigate = useNavigate();

    const [filter, setFilter] = useState('all');
    const [dates, setDates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [recurOpen, setRecurOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const [addForm, setAddForm] = useState({
        startDate: '', endDate: '', registrationDeadline: '',
        titleOverride: '', capacityOverride: '', locationOverride: ''
    });

    const [recurForm, setRecurForm] = useState({
        type: 'weeks' as 'days' | 'weeks' | 'months' | 'years',
        weekdays: [] as number[],
        startDate: '',
        endMode: 'count' as 'date' | 'count',
        endDate: '',
        count: 4,
        beginTime: '09:00',
        endTime: '17:00',
        bookingDeadlineTime: ''
    });

    const seriesId = record?.seriesId;

    const loadDates = async () => {
        if (!seriesId) { setDates([]); return; }
        setLoading(true);
        try {
            const res = await fetch(`${API}/events/series/${seriesId}?filter=${filter}`, { headers: authHeaders() });
            if (res.ok) setDates(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seriesId, filter]);

    if (!record) return null;

    if (!record.id) {
        return (
            <Box sx={{ border: 1, borderColor: 'divider', p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Weitere Termine (Serientermine) können hinzugefügt werden, nachdem diese Veranstaltung gespeichert wurde.
                </Typography>
            </Box>
        );
    }

    const openAddDialog = () => {
        setAddForm({
            startDate: toLocalInput(record.startDate),
            endDate: toLocalInput(record.endDate),
            registrationDeadline: toLocalInput(record.registrationDeadline),
            titleOverride: '', capacityOverride: '', locationOverride: ''
        });
        setAddOpen(true);
    };

    const openRecurDialog = () => {
        setRecurForm({
            type: 'weeks',
            weekdays: [],
            startDate: toDateInput(record.startDate) || toDateInput(new Date().toISOString()),
            endMode: 'count',
            endDate: '',
            count: 4,
            beginTime: toTimeInput(record.startDate, '09:00'),
            endTime: toTimeInput(record.endDate, '17:00'),
            bookingDeadlineTime: ''
        });
        setRecurOpen(true);
    };

    const submitAddDate = async () => {
        if (!addForm.startDate) { notify('Bitte ein Startdatum angeben', { type: 'warning' }); return; }
        setSaving(true);
        try {
            const res = await fetch(`${API}/events/${record.id}/add-date`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({
                    startDate: new Date(addForm.startDate).toISOString(),
                    endDate: addForm.endDate ? new Date(addForm.endDate).toISOString() : null,
                    registrationDeadline: addForm.registrationDeadline ? new Date(addForm.registrationDeadline).toISOString() : null,
                    titleOverride: addForm.titleOverride || undefined,
                    capacityOverride: addForm.capacityOverride || undefined,
                    locationOverride: addForm.locationOverride || undefined
                })
            });
            if (res.ok) {
                notify('Termin hinzugefügt', { type: 'success' });
                setAddOpen(false);
                loadDates();
                refresh();
            } else {
                notify('Fehler beim Hinzufügen des Termins', { type: 'error' });
            }
        } finally {
            setSaving(false);
        }
    };

    const submitRecurring = async () => {
        if (!recurForm.startDate) { notify('Bitte ein Startdatum angeben', { type: 'warning' }); return; }
        if (recurForm.endMode === 'date' && !recurForm.endDate) { notify('Bitte ein Enddatum angeben', { type: 'warning' }); return; }
        setSaving(true);
        try {
            const res = await fetch(`${API}/events/${record.id}/add-recurring-dates`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({
                    recurrence: {
                        type: recurForm.type,
                        weekdays: recurForm.weekdays,
                        startDate: recurForm.startDate,
                        endMode: recurForm.endMode,
                        endDate: recurForm.endMode === 'date' ? recurForm.endDate : undefined,
                        count: recurForm.endMode === 'count' ? Number(recurForm.count) : undefined
                    },
                    beginTime: recurForm.beginTime,
                    endTime: recurForm.endTime,
                    bookingDeadlineTime: recurForm.bookingDeadlineTime || undefined
                })
            });
            if (res.ok) {
                const data = await res.json();
                notify(`${data.count} Termine erzeugt`, { type: 'success' });
                setRecurOpen(false);
                loadDates();
                refresh();
            } else {
                const err = await res.json().catch(() => ({}));
                notify(err.message || 'Fehler beim Erzeugen der Termine', { type: 'error' });
            }
        } finally {
            setSaving(false);
        }
    };

    const togglePublish = async (id: string) => {
        await fetch(`${API}/events/${id}/toggle-publish`, { method: 'PATCH', headers: authHeaders() });
        loadDates();
    };

    const toggleCancel = async (id: string) => {
        await fetch(`${API}/events/${id}/toggle-cancel`, { method: 'PATCH', headers: authHeaders() });
        loadDates();
    };

    const deleteDate = async (id: string) => {
        if (!window.confirm('Diesen Termin wirklich unwiderruflich löschen?')) return;
        await fetch(`${API}/events/${id}`, { method: 'DELETE', headers: authHeaders() });
        loadDates();
    };

    const toggleWeekday = (id: number) => {
        setRecurForm(f => ({
            ...f,
            weekdays: f.weekdays.includes(id) ? f.weekdays.filter(w => w !== id) : [...f.weekdays, id]
        }));
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {FILTERS.map(f => (
                        <Chip
                            key={f.id}
                            label={f.label}
                            color={filter === f.id ? 'primary' : 'default'}
                            onClick={() => setFilter(f.id)}
                            size="small"
                        />
                    ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={openAddDialog}>
                        Termin hinzufügen
                    </Button>
                    <Button size="small" variant="outlined" startIcon={<EventRepeatIcon />} onClick={openRecurDialog}>
                        Serientermine generieren
                    </Button>
                </Box>
            </Box>

            {loading ? (
                <CircularProgress size={24} />
            ) : !seriesId ? (
                <Typography variant="body2" color="text.secondary">
                    Diese Veranstaltung gehört noch zu keiner Terminserie. Fügen Sie einen weiteren Termin hinzu, um eine Serie zu erstellen.
                </Typography>
            ) : dates.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Keine Termine für diesen Filter gefunden.</Typography>
            ) : (
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Datum</TableCell>
                            <TableCell>Titel</TableCell>
                            <TableCell>Ort</TableCell>
                            <TableCell align="right">Kapazität</TableCell>
                            <TableCell align="right">Buchungen</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Aktionen</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dates.map((d) => (
                            <TableRow
                                key={d.id}
                                selected={d.id === record.id}
                                hover
                                sx={{ borderLeft: `3px solid ${dateStatusColor(d)}` }}
                            >
                                <TableCell>{new Date(d.startDate).toLocaleString('de-DE')}</TableCell>
                                <TableCell>{d.titleOverride || d.title}</TableCell>
                                <TableCell>{d.location || '-'}</TableCell>
                                <TableCell align="right">{d.capacity}</TableCell>
                                <TableCell align="right">{d.bookingsCount}</TableCell>
                                <TableCell>
                                    {d.cancelled && <Chip label="Storniert" color="error" size="small" sx={{ mr: 0.5 }} />}
                                    <Chip label={d.published ? 'Veröffentlicht' : 'Versteckt'} color={d.published ? 'success' : 'default'} size="small" />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Bearbeiten">
                                        <IconButton size="small" onClick={() => navigate(`/events/${encodeURIComponent(d.id)}`)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={d.published ? 'Verstecken' : 'Veröffentlichen'}>
                                        <IconButton size="small" onClick={() => togglePublish(d.id)}>
                                            {d.published ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={d.cancelled ? 'Reaktivieren' : 'Stornieren'}>
                                        <IconButton size="small" onClick={() => toggleCancel(d.id)}>
                                            {d.cancelled ? <RestoreIcon fontSize="small" /> : <BlockIcon fontSize="small" />}
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Löschen">
                                        <IconButton size="small" onClick={() => deleteDate(d.id)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {/* Einzelnen Termin hinzufügen */}
            <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Termin hinzufügen</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <MuiTextField
                        label="Beginn" type="datetime-local" fullWidth required
                        value={addForm.startDate}
                        onChange={e => setAddForm(f => ({ ...f, startDate: e.target.value }))}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <MuiTextField
                        label="Ende" type="datetime-local" fullWidth
                        value={addForm.endDate}
                        onChange={e => setAddForm(f => ({ ...f, endDate: e.target.value }))}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <MuiTextField
                        label="Anmeldeschluss" type="datetime-local" fullWidth
                        value={addForm.registrationDeadline}
                        onChange={e => setAddForm(f => ({ ...f, registrationDeadline: e.target.value }))}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <MuiTextField
                        label="Titel überschreiben (optional)" fullWidth
                        value={addForm.titleOverride}
                        onChange={e => setAddForm(f => ({ ...f, titleOverride: e.target.value }))}
                    />
                    <MuiTextField
                        label="Kapazität überschreiben (optional)" type="number" fullWidth
                        value={addForm.capacityOverride}
                        onChange={e => setAddForm(f => ({ ...f, capacityOverride: e.target.value }))}
                    />
                    <MuiTextField
                        label="Ort überschreiben (optional)" fullWidth
                        value={addForm.locationOverride}
                        onChange={e => setAddForm(f => ({ ...f, locationOverride: e.target.value }))}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddOpen(false)}>Abbrechen</Button>
                    <Button variant="contained" onClick={submitAddDate} disabled={saving}>Speichern</Button>
                </DialogActions>
            </Dialog>

            {/* Serientermine generieren */}
            <Dialog open={recurOpen} onClose={() => setRecurOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Serientermine generieren</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <FormControl>
                        <FormLabel>Wiederholung</FormLabel>
                        <ToggleButtonGroup
                            exclusive size="small" value={recurForm.type}
                            onChange={(_, v) => v && setRecurForm(f => ({ ...f, type: v }))}
                        >
                            <ToggleButton value="days">Täglich</ToggleButton>
                            <ToggleButton value="weeks">Wöchentlich</ToggleButton>
                            <ToggleButton value="months">Monatlich</ToggleButton>
                            <ToggleButton value="years">Jährlich</ToggleButton>
                        </ToggleButtonGroup>
                    </FormControl>

                    {(recurForm.type === 'weeks' || recurForm.type === 'months') && (
                        <FormControl>
                            <FormLabel>Wochentage</FormLabel>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                {WEEKDAYS.map(w => (
                                    <FormControlLabel
                                        key={w.id}
                                        control={<Checkbox size="small" checked={recurForm.weekdays.includes(w.id)} onChange={() => toggleWeekday(w.id)} />}
                                        label={w.label}
                                    />
                                ))}
                            </Box>
                        </FormControl>
                    )}

                    <MuiTextField
                        label="Startdatum" type="date" fullWidth required
                        value={recurForm.startDate}
                        onChange={e => setRecurForm(f => ({ ...f, startDate: e.target.value }))}
                        slotProps={{ inputLabel: { shrink: true } }}
                        helperText="Der erste generierte Termin liegt nach diesem Datum"
                    />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <MuiTextField
                            label="Beginnzeit" type="time" fullWidth
                            value={recurForm.beginTime}
                            onChange={e => setRecurForm(f => ({ ...f, beginTime: e.target.value }))}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                        <MuiTextField
                            label="Endzeit" type="time" fullWidth
                            value={recurForm.endTime}
                            onChange={e => setRecurForm(f => ({ ...f, endTime: e.target.value }))}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                    </Box>

                    <MuiTextField
                        label="Anmeldeschluss-Zeit (optional, gleicher Tag)" type="time" fullWidth
                        value={recurForm.bookingDeadlineTime}
                        onChange={e => setRecurForm(f => ({ ...f, bookingDeadlineTime: e.target.value }))}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />

                    <FormControl>
                        <FormLabel>Endet</FormLabel>
                        <RadioGroup
                            row value={recurForm.endMode}
                            onChange={e => setRecurForm(f => ({ ...f, endMode: e.target.value as 'date' | 'count' }))}
                        >
                            <FormControlLabel value="count" control={<Radio size="small" />} label="Nach Anzahl" />
                            <FormControlLabel value="date" control={<Radio size="small" />} label="Am Datum" />
                        </RadioGroup>
                    </FormControl>

                    {recurForm.endMode === 'count' ? (
                        <MuiTextField
                            label="Anzahl Termine" type="number" fullWidth
                            value={recurForm.count}
                            onChange={e => setRecurForm(f => ({ ...f, count: Number(e.target.value) }))}
                        />
                    ) : (
                        <MuiTextField
                            label="Enddatum" type="date" fullWidth
                            value={recurForm.endDate}
                            onChange={e => setRecurForm(f => ({ ...f, endDate: e.target.value }))}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRecurOpen(false)}>Abbrechen</Button>
                    <Button variant="contained" onClick={submitRecurring} disabled={saving}>Termine erzeugen</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
