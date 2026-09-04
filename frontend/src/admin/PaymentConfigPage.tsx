import React, { useState, useEffect } from 'react';
import { useNotify } from 'react-admin';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Grid,
    MenuItem,
    Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

export const PaymentConfigPage = () => {
    const notify = useNotify();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [environment, setEnvironment] = useState('sandbox');
    const [paypalClientId, setPaypalClientId] = useState('');
    const [paypalClientSecret, setPaypalClientSecret] = useState('');
    const [hasSecret, setHasSecret] = useState(false);

    const load = () => {
        fetch('/api/payment-config', {
            headers: { Authorization: `Bearer ${localStorage.getItem('auth')}` },
        })
            .then((res) => res.json())
            .then((data) => {
                setEnvironment(data.environment || 'sandbox');
                setPaypalClientId(data.paypalClientId || '');
                setHasSecret(!!data.hasSecret);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                notify('Fehler beim Laden der PayPal-Einstellungen', { type: 'error' });
                setLoading(false);
            });
    };

    useEffect(load, [notify]);

    const handleSave = () => {
        setSaving(true);
        fetch('/api/payment-config', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('auth')}`,
            },
            body: JSON.stringify({ environment, paypalClientId, paypalClientSecret }),
        })
            .then((res) => res.json())
            .then((data) => {
                setHasSecret(!!data.hasSecret);
                setPaypalClientSecret('');
                notify('PayPal-Einstellungen erfolgreich gespeichert', { type: 'success' });
                setSaving(false);
            })
            .catch((err) => {
                console.error(err);
                notify('Fehler beim Speichern', { type: 'error' });
                setSaving(false);
            });
    };

    if (loading) return <Box sx={{ p: 3 }}><Typography>Lade...</Typography></Box>;

    return (
        <Card sx={{ mt: 2, mb: 4, borderRadius: 2 }}>
            <Box sx={{ p: 2, bgcolor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    💳 PayPal-Einstellungen
                </Typography>
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                    sx={{ textTransform: 'none', px: 3 }}
                >
                    Speichern
                </Button>
            </Box>

            <CardContent sx={{ p: 4 }}>
                <Box sx={{ maxWidth: 700 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        Diese Zugangsdaten erhalten Sie in Ihrem{' '}
                        <a href="https://developer.paypal.com/dashboard/applications" target="_blank" rel="noreferrer">
                            PayPal Developer Dashboard
                        </a>
                        . Der geheime Schlüssel wird verschlüsselt gespeichert und nie im Klartext angezeigt.
                    </Alert>

                    <TextField
                        select
                        label="Umgebung"
                        fullWidth
                        value={environment}
                        onChange={(e) => setEnvironment(e.target.value)}
                        helperText="Sandbox = Testmodus (keine echten Zahlungen). Live = echte Zahlungen von Kunden."
                        sx={{ mb: 3 }}
                    >
                        <MenuItem value="sandbox">Sandbox (Test)</MenuItem>
                        <MenuItem value="live">Live (Produktiv)</MenuItem>
                    </TextField>

                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="PayPal Client ID"
                                fullWidth
                                value={paypalClientId}
                                onChange={(e) => setPaypalClientId(e.target.value)}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label={hasSecret ? 'PayPal Secret (gespeichert - leer lassen zum Beibehalten)' : 'PayPal Secret'}
                                type="password"
                                fullWidth
                                value={paypalClientSecret}
                                onChange={(e) => setPaypalClientSecret(e.target.value)}
                                placeholder={hasSecret ? '••••••••••••••••' : ''}
                            />
                        </Grid>
                    </Grid>

                    {!paypalClientId && (
                        <Alert severity="warning" sx={{ mt: 3 }}>
                            Ohne Client ID und Secret läuft PayPal im Testmodus - Kunden können buchen, es findet aber keine echte Zahlung statt.
                        </Alert>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};
