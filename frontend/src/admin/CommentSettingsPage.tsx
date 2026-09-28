import { useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField as MuiTextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Grid,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

// Old's real CComment "Einstellungen" (view=settings), deep-verified
// against settings.xml - moderation/notification/layout fields that
// actually map to something real in this app. Akismet/reCAPTCHA/avatars/
// BBCode/per-category-enable are Pro-only or have no infrastructure here
// (same "settings-only or omitted" precedent as Visforms' Spamschutz tab).

interface CommentSettings {
  autoPublish: boolean;
  notifyModerators: boolean;
  moderatorEmail: string;
  notifyOnReply: boolean;
  maxLength: number;
  sortOrder: string;
  commentsPerPage: number;
  showGravatar: boolean;
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

export const CommentSettingsPage = () => {
  const notify = useNotify();
  const [settings, setSettings] = useState<CommentSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/commentsettings', { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(() => notify('Fehler beim Laden', { type: 'error' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (patch: Partial<CommentSettings>) => setSettings((s) => (s ? { ...s, ...patch } : s));

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch('/api/commentsettings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(settings),
      });
      if (res.ok) notify('Gespeichert', { type: 'success' });
      else notify('Fehler beim Speichern', { type: 'error' });
    } catch {
      notify('Netzwerkfehler', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <Card sx={{ mt: 2, mb: 4, maxWidth: '800px', mx: 'auto' }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>Kommentare - Einstellungen</Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={12}>
            <Typography variant="subtitle1" gutterBottom>Moderation</Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Automatisch veröffentlichen</InputLabel>
              <Select
                label="Automatisch veröffentlichen"
                value={settings.autoPublish ? '1' : '0'}
                onChange={(e) => set({ autoPublish: e.target.value === '1' })}
              >
                <MenuItem value="0">Nein - jeder Kommentar wartet auf Freigabe</MenuItem>
                <MenuItem value="1">Ja - sofort sichtbar</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Moderatoren benachrichtigen</InputLabel>
              <Select
                label="Moderatoren benachrichtigen"
                value={settings.notifyModerators ? '1' : '0'}
                onChange={(e) => set({ notifyModerators: e.target.value === '1' })}
              >
                <MenuItem value="0">Nein</MenuItem>
                <MenuItem value="1">Ja</MenuItem>
              </Select>
            </FormControl>
            <MuiTextField
              label="E-Mail-Adresse der Moderatoren"
              fullWidth
              value={settings.moderatorEmail || ''}
              onChange={(e) => set({ moderatorEmail: e.target.value })}
              helperText="Erhält eine E-Mail bei jedem neuen Kommentar (falls oben aktiviert)"
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Kommentator bei Antwort benachrichtigen</InputLabel>
              <Select
                label="Kommentator bei Antwort benachrichtigen"
                value={settings.notifyOnReply ? '1' : '0'}
                onChange={(e) => set({ notifyOnReply: e.target.value === '1' })}
              >
                <MenuItem value="0">Nein</MenuItem>
                <MenuItem value="1">Ja</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={12}>
            <Typography variant="subtitle1" gutterBottom>Anzeige</Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Sortierung</InputLabel>
              <Select label="Sortierung" value={settings.sortOrder} onChange={(e) => set({ sortOrder: e.target.value })}>
                <MenuItem value="newest">Neueste zuerst</MenuItem>
                <MenuItem value="oldest">Älteste zuerst</MenuItem>
              </Select>
            </FormControl>
            <MuiTextField
              type="number"
              label="Kommentare pro Seite"
              fullWidth
              value={settings.commentsPerPage}
              onChange={(e) => set({ commentsPerPage: Number(e.target.value) })}
              sx={{ mb: 2 }}
            />
            <MuiTextField
              type="number"
              label="Maximale Zeichenanzahl"
              fullWidth
              value={settings.maxLength}
              onChange={(e) => set({ maxLength: Number(e.target.value) })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Gravatar-Profilbilder anzeigen</InputLabel>
              <Select
                label="Gravatar-Profilbilder anzeigen"
                value={settings.showGravatar ? '1' : '0'}
                onChange={(e) => set({ showGravatar: e.target.value === '1' })}
              >
                <MenuItem value="0">Nein</MenuItem>
                <MenuItem value="1">Ja</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
            Speichern
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
