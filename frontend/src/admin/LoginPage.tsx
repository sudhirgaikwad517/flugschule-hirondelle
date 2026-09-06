import { useState } from 'react';
import { useLogin, useNotify } from 'react-admin';
import {
    Box, Card, CardContent, TextField, Button, Typography, Avatar, Alert, Stack, Link,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

type View = 'password' | 'otp-login' | 'forgot';

export const AdminLoginPage = () => {
    const login = useLogin();
    const notify = useNotify();
    const [view, setView] = useState<View>('password');
    const [loading, setLoading] = useState(false);

    // Password login
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Shared OTP state (login-via-code and forgot-password both send/verify a code)
    const [otpEmail, setOtpEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const resetOtp = () => {
        setOtpEmail(''); setOtpCode(''); setOtpSent(false);
        setNewPassword(''); setConfirmPassword(''); setMessage(''); setError('');
    };

    const switchView = (v: View) => {
        resetOtp();
        setError('');
        setView(v);
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        login({ username, password }).catch(() => {
            notify('Ungültige E-Mail oder Passwort', { type: 'error' });
        }).finally(() => setLoading(false));
    };

    const requestOtp = async () => {
        if (!otpEmail) { setError('Bitte geben Sie Ihre E-Mail-Adresse ein.'); return; }
        setError(''); setLoading(true);
        try {
            const endpoint = view === 'forgot' ? '/api/auth/password-reset/request' : '/api/auth/login-otp/request';
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: otpEmail }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Fehler beim Senden des Codes.');
            setMessage(data.message);
            setOtpSent(true);
        } catch (err: any) {
            setError(err.message || 'Ein Fehler ist aufgetreten.');
        } finally {
            setLoading(false);
        }
    };

    const verifyOtpLogin = async () => {
        if (!otpCode) { setError('Bitte geben Sie den Code ein.'); return; }
        setError(''); setLoading(true);
        try {
            await login({ mode: 'otp', email: otpEmail, code: otpCode });
        } catch (err: any) {
            setError(err.message || 'Anmeldung fehlgeschlagen.');
        } finally {
            setLoading(false);
        }
    };

    const confirmPasswordReset = async () => {
        if (!otpCode || !newPassword || !confirmPassword) { setError('Bitte füllen Sie alle Felder aus.'); return; }
        if (newPassword !== confirmPassword) { setError('Die Passwörter stimmen nicht überein.'); return; }
        setError(''); setLoading(true);
        try {
            const res = await fetch('/api/auth/password-reset/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: otpEmail, code: otpCode, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Zurücksetzen fehlgeschlagen.');
            setMessage('Passwort erfolgreich zurückgesetzt. Sie können sich jetzt anmelden.');
            setOtpSent(false); setOtpCode(''); setNewPassword(''); setConfirmPassword('');
        } catch (err: any) {
            setError(err.message || 'Ein Fehler ist aufgetreten.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                minHeight: '100vh', backgroundColor: '#f4f6f8',
            }}
        >
            <Card sx={{ minWidth: 340, maxWidth: 400, width: '100%', mt: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 4 }}>
                    <Avatar sx={{ bgcolor: '#0ea5e9' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ mt: 2 }}>Flugschule Hirondelle Admin</Typography>
                </Box>
                <CardContent sx={{ px: 4, pb: 4 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

                    {view === 'password' && (
                        <form onSubmit={handlePasswordSubmit}>
                            <Stack spacing={2}>
                                <TextField
                                    label="E-Mail" type="email" fullWidth required autoFocus
                                    value={username} onChange={(e) => setUsername(e.target.value)}
                                />
                                <TextField
                                    label="Passwort" type="password" fullWidth required
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                />
                                <Button type="submit" variant="contained" fullWidth disabled={loading}>
                                    {loading ? 'Anmelden...' : 'Anmelden'}
                                </Button>
                            </Stack>
                        </form>
                    )}

                    {(view === 'otp-login' || view === 'forgot') && (
                        <Stack spacing={2}>
                            <Typography variant="body2" color="textSecondary">
                                {view === 'forgot'
                                    ? 'Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Code, mit dem Sie ein neues Passwort festlegen können.'
                                    : 'Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Code, mit dem Sie sich ohne Passwort anmelden können.'}
                            </Typography>
                            <TextField
                                label="E-Mail" type="email" fullWidth required autoFocus
                                disabled={otpSent}
                                value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)}
                            />
                            {!otpSent ? (
                                <Button variant="contained" fullWidth onClick={requestOtp} disabled={loading}>
                                    {loading ? 'Sende...' : 'Code senden'}
                                </Button>
                            ) : (
                                <>
                                    <TextField
                                        label="Code aus der E-Mail" fullWidth required
                                        value={otpCode} onChange={(e) => setOtpCode(e.target.value)}
                                    />
                                    {view === 'forgot' && (
                                        <>
                                            <TextField
                                                label="Neues Passwort" type="password" fullWidth required
                                                value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                            <TextField
                                                label="Neues Passwort bestätigen" type="password" fullWidth required
                                                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </>
                                    )}
                                    <Button
                                        variant="contained" fullWidth disabled={loading}
                                        onClick={view === 'forgot' ? confirmPasswordReset : verifyOtpLogin}
                                    >
                                        {loading ? 'Bitte warten...' : (view === 'forgot' ? 'Passwort zurücksetzen' : 'Anmelden')}
                                    </Button>
                                </>
                            )}
                        </Stack>
                    )}

                    <Stack spacing={1} sx={{ mt: 3, alignItems: 'center' }}>
                        {view !== 'password' && (
                            <Link component="button" type="button" variant="body2" onClick={() => switchView('password')}>
                                Zurück zum Login mit Passwort
                            </Link>
                        )}
                        {view !== 'forgot' && (
                            <Link component="button" type="button" variant="body2" onClick={() => switchView('forgot')}>
                                Passwort vergessen?
                            </Link>
                        )}
                        {view !== 'otp-login' && (
                            <Link component="button" type="button" variant="body2" onClick={() => switchView('otp-login')}>
                                Anmeldung per E-Mail-Code
                            </Link>
                        )}
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};
