import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, Typography, Grid, CircularProgress, Box, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { Title, useDataProvider } from 'react-admin';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RANGE_PRESETS = [
    { id: '7', label: 'Letzte 7 Tage' },
    { id: '30', label: 'Letzte 30 Tage' },
    { id: '90', label: 'Letzte 90 Tage' },
    { id: '365', label: 'Letztes Jahr' },
    { id: 'custom', label: 'Benutzerdefiniert' },
];

const toDateInputValue = (d: Date) => d.toISOString().split('T')[0];

export const EventsDashboard = () => {
    const dataProvider = useDataProvider();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [preset, setPreset] = useState('30');
    const [customFrom, setCustomFrom] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return toDateInputValue(d);
    });
    const [customTo, setCustomTo] = useState(() => toDateInputValue(new Date()));

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(false);
            try {
                const qs = new URLSearchParams();
                if (preset === 'custom') {
                    qs.set('from', customFrom);
                    qs.set('to', customTo);
                } else {
                    qs.set('days', preset);
                }
                const response = await fetch(`/api/stats/dashboard?${qs.toString()}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('auth')}` }
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const json = await response.json();
                setData(json);
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [dataProvider, preset, customFrom, customTo]);

    const filterBar = (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 3, mt: 1 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Zeitraum</InputLabel>
                <Select value={preset} label="Zeitraum" onChange={(e) => setPreset(e.target.value)}>
                    {RANGE_PRESETS.map((p) => <MenuItem key={p.id} value={p.id}>{p.label}</MenuItem>)}
                </Select>
            </FormControl>
            {preset === 'custom' && (
                <>
                    <TextField
                        size="small" label="Von" type="date" InputLabelProps={{ shrink: true }}
                        value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
                    />
                    <TextField
                        size="small" label="Bis" type="date" InputLabelProps={{ shrink: true }}
                        value={customTo} onChange={(e) => setCustomTo(e.target.value)}
                    />
                </>
            )}
        </Box>
    );

    if (loading) {
        return (
            <>
                <Title title="Flugschule Events Dashboard" />
                {filterBar}
                <CircularProgress sx={{ display: 'block', margin: '40px auto' }} />
            </>
        );
    }

    if (error || !data || !data.totals) {
        return (
            <>
                <Title title="Flugschule Events Dashboard" />
                {filterBar}
                <Typography>Fehler beim Laden der Statistiken.</Typography>
            </>
        );
    }

    return (
        <>
            <Title title="Flugschule Events Dashboard" />
            {filterBar}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardHeader title="Buchungen gesamt" />
                        <CardContent>
                            <Typography variant="h4">{data.totals.totalBookings}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardHeader title="Veranstaltungen gesamt" />
                        <CardContent>
                            <Typography variant="h4">{data.totals.totalEvents}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardHeader title="Umsatz gesamt" />
                        <CardContent>
                            <Typography variant="h4">€{data.totals.totalRevenue.toFixed(2)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                    <Card>
                        <CardHeader title="Buchungen (Bookings)" />
                        <CardContent sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.history}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="bookings" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <Card>
                        <CardHeader title="Veranstaltungen (Events)" />
                        <CardContent sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.history}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="events" stroke="#82ca9d" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <Card>
                        <CardHeader title="Umsätze (Revenue)" />
                        <CardContent sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.history}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="revenue" stroke="#ffc658" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </>
    );
};
