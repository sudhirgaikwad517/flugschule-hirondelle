import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, Typography, Grid, CircularProgress } from '@mui/material';
import { Title, useDataProvider } from 'react-admin';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const EventsDashboard = () => {
    const dataProvider = useDataProvider();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // We use a custom fetch to the new /api/stats/dashboard endpoint
        const fetchStats = async () => {
            try {
                // HACK: Since we're using simpleRestProvider, we'll just fetch directly.
                // In a real app we'd add a custom method to dataProvider.
                const response = await fetch('/api/stats/dashboard');
                const json = await response.json();
                setData(json);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [dataProvider]);

    if (loading) {
        return <CircularProgress sx={{ display: 'block', margin: '40px auto' }} />;
    }

    if (!data) {
        return <Typography>Error loading stats</Typography>;
    }

    return (
        <>
            <Title title="Flugschule Events Dashboard" />
            <Grid container spacing={3} sx={{ mb: 3, mt: 1 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardHeader title="Total Bookings (30 Days)" />
                        <CardContent>
                            <Typography variant="h4">{data.totals.totalBookings}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardHeader title="Total Events (30 Days)" />
                        <CardContent>
                            <Typography variant="h4">{data.totals.totalEvents}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardHeader title="Total Revenue (30 Days)" />
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
