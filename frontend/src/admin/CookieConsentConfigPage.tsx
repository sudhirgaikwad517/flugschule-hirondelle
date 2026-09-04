import React, { useState, useEffect } from 'react';
import { useNotify } from 'react-admin';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Switch,
    FormControlLabel,
    Button,
    Grid,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const DEFAULTS = {
    enabled: true,
    title: 'Hinweis zum Datenschutz',
    bodyText: '',
    privacyLinkText: 'Lesen Sie unsere Datenschutzrichtlinie.',
    privacyLinkUrl: '/datenschutz',
    acceptButtonText: 'Akzeptieren',
    declineButtonText: 'Ablehnen',
    settingsButtonText: 'Cookie-Einstellungen',
    settingsUrl: '',
};

export const CookieConsentConfigPage = () => {
    const notify = useNotify();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState(DEFAULTS);

    useEffect(() => {
        fetch('/api/cookie-consent-config', {
            headers: { Authorization: `Bearer ${localStorage.getItem('auth')}` },
        })
            .then((res) => res.json())
            .then((data) => {
                setConfig({ ...DEFAULTS, ...data });
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                notify('Fehler beim Laden der Cookie-Einstellungen', { type: 'error' });
                setLoading(false);
            });
    }, [notify]);

    const handleSave = () => {
        setSaving(true);
        fetch('/api/cookie-consent-config', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('auth')}`,
            },
            body: JSON.stringify(config),
        })
            .then((res) => res.json())
            .then(() => {
                notify('Cookie-Einstellungen erfolgreich gespeichert', { type: 'success' });
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
                    🍪 Cookie-Hinweis
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
                <Box sx={{ maxWidth: 800 }}>
                    <FormControlLabel
                        control={<Switch checked={config.enabled} onChange={(e) => setConfig({ ...config, enabled: e.target.checked })} />}
                        label="Cookie-Hinweis auf der Webseite anzeigen"
                        sx={{ mb: 2, display: 'block' }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                        Wenn deaktiviert, wird der Cookie-Hinweis nirgends auf der Webseite angezeigt.
                    </Typography>

                    <TextField
                        label="Überschrift"
                        fullWidth
                        value={config.title}
                        onChange={(e) => setConfig({ ...config, title: e.target.value })}
                        sx={{ mb: 3 }}
                    />

                    <TextField
                        label="Text"
                        fullWidth
                        multiline
                        minRows={5}
                        value={config.bodyText}
                        onChange={(e) => setConfig({ ...config, bodyText: e.target.value })}
                        helperText="Der Haupttext des Cookie-Hinweises."
                        sx={{ mb: 3 }}
                    />

                    <Grid container spacing={3} sx={{ mb: 1 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Text des Datenschutz-Links"
                                fullWidth
                                value={config.privacyLinkText}
                                onChange={(e) => setConfig({ ...config, privacyLinkText: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Ziel des Datenschutz-Links (URL)"
                                fullWidth
                                value={config.privacyLinkUrl}
                                onChange={(e) => setConfig({ ...config, privacyLinkUrl: e.target.value })}
                                helperText="Interner Pfad (z.B. /datenschutz) oder vollständige URL."
                            />
                        </Grid>
                    </Grid>

                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 3, mb: 2 }}>Buttons</Typography>
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                label="„Akzeptieren“-Button"
                                fullWidth
                                value={config.acceptButtonText}
                                onChange={(e) => setConfig({ ...config, acceptButtonText: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                label="„Ablehnen“-Button"
                                fullWidth
                                value={config.declineButtonText}
                                onChange={(e) => setConfig({ ...config, declineButtonText: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                label="„Cookie-Einstellungen“-Button"
                                fullWidth
                                value={config.settingsButtonText}
                                onChange={(e) => setConfig({ ...config, settingsButtonText: e.target.value })}
                            />
                        </Grid>
                    </Grid>

                    <TextField
                        label="Ziel des „Cookie-Einstellungen“-Buttons (URL, optional)"
                        fullWidth
                        value={config.settingsUrl}
                        onChange={(e) => setConfig({ ...config, settingsUrl: e.target.value })}
                        helperText="Wenn leer, ist der Button nicht klickbar. Interner Pfad oder vollständige URL."
                    />
                </Box>
            </CardContent>
        </Card>
    );
};
