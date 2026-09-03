import { useEffect, useState } from 'react';
import { useRecordContext, useRefresh } from 'react-admin';
import { useNavigate } from 'react-router-dom';
import { Box, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Tooltip, Chip, Typography, CircularProgress, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import BlockIcon from '@mui/icons-material/Block';
import RestoreIcon from '@mui/icons-material/Restore';
import AddIcon from '@mui/icons-material/Add';
import { DATE_STATUS_COLORS } from './matukioStyle';

const API = '/api';

function dateStatusColor(d: any): string {
    if (d.cancelled) return DATE_STATUS_COLORS.cancelled;
    if (!d.published) return DATE_STATUS_COLORS.unpublished;
    if (new Date(d.startDate) < new Date()) return DATE_STATUS_COLORS.past;
    return DATE_STATUS_COLORS.active;
}

function authHeaders() {
    const token = localStorage.getItem('auth');
    return { 'Authorization': `Bearer ${token}` };
}

// Inline "Weitere Termine dieser Serie" panel shown when an event row in the
// admin Events list is expanded — mirrors Matukio's per-row date sub-table.
export const EventRowExpand = () => {
    const record = useRecordContext();
    const refresh = useRefresh();
    const navigate = useNavigate();
    const [dates, setDates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const seriesId = record?.seriesId;

    const load = () => {
        if (!seriesId) return;
        setLoading(true);
        fetch(`${API}/events/series/${seriesId}?filter=all`, { headers: authHeaders() })
            .then(res => res.ok ? res.json() : [])
            .then(data => setDates(data))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seriesId]);

    if (!record) return null;

    if (!seriesId) {
        return (
            <Box sx={{ p: 2, bgcolor: '#fafafa' }}>
                <Typography variant="body2" color="text.secondary">
                    Diese Veranstaltung gehört zu keiner Terminserie.
                </Typography>
            </Box>
        );
    }

    const togglePublish = async (id: string) => {
        await fetch(`${API}/events/${id}/toggle-publish`, { method: 'PATCH', headers: authHeaders() });
        load();
        refresh();
    };

    const toggleCancel = async (id: string) => {
        await fetch(`${API}/events/${id}/toggle-cancel`, { method: 'PATCH', headers: authHeaders() });
        load();
        refresh();
    };

    return (
        <Box sx={{ p: 2, bgcolor: '#fafafa' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">Termine dieser Serie ({dates.length})</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={() => navigate(`/events/${encodeURIComponent(record.id)}/5`)}>
                    Termin hinzufügen
                </Button>
            </Box>
            {loading ? <CircularProgress size={20} /> : (
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Datum</TableCell>
                            <TableCell>Titel</TableCell>
                            <TableCell>Ort</TableCell>
                            <TableCell align="right">Buchungen</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Aktionen</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dates.map(d => (
                            <TableRow key={d.id} selected={d.id === record.id} sx={{ borderLeft: `3px solid ${dateStatusColor(d)}` }}>
                                <TableCell>{new Date(d.startDate).toLocaleString('de-DE')}</TableCell>
                                <TableCell>{d.titleOverride || d.title}</TableCell>
                                <TableCell>{d.location || '-'}</TableCell>
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
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </Box>
    );
};
