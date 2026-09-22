import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotify } from 'react-admin';
import { Box, Card, CardContent, Typography, TextField, Button, Grid, Alert } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { type FixedDuplicateMeta, FixedDuplicateMetaFields } from './FixedDuplicateMetaFields';
import { type PrimaryPageSettings, PrimaryPageSettingsFields } from './PrimaryPageSettingsFields';

// Same "data only, layout stays" idea as HomeContentEditor.tsx, for the
// /infos page (Infos.tsx) - this is the site's Kontakt/contact page
// (address, phone, email, opening hours, bank details, map).

interface InfosData {
  companyName: string;
  shopLabel: string;
  shopStreet: string;
  shopCity: string;
  outpostLabel: string;
  outpostStreet: string;
  outpostCity: string;
  phone: string;
  email: string;
  openingHours: string;
  openingHoursNote: string;
  parkingNote: string;
  bankAccountHolder: string;
  bankName: string;
  iban: string;
  bic: string;
  accountNumber: string;
  bankCode: string;
  routenplanerUrl: string;
  mapsEmbedUrl: string;
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

export const InfosContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'infos';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<InfosData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || id}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/infos', { headers: authHeaders() }),
    ])
      .then(async ([contentRes, metaRes, primaryRes]) => {
        if (!contentRes.ok) throw new Error(`HTTP ${contentRes.status}`);
        setContent((await contentRes.json()).data);
        setDupMeta(metaRes && metaRes.ok ? await metaRes.json() : null);
        setPrimaryMeta(primaryRes && primaryRes.ok ? await primaryRes.json() : null);
        setLoading(false);
      })
      .catch((err) => { console.error(err); notify('Fehler beim Laden', { type: 'error' }); setLoadError(true); setLoading(false); });
  };

  useEffect(load, [id]);

  const handleSave = () => {
    if (!content) return;
    setSaving(true);
    fetch(`/api/sitepagecontent/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ data: content }),
    })
      .then(async (res) => { if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Speichern fehlgeschlagen'); })
      .then(async () => {
        if (dupMeta) {
          const res = await fetch(`/api/fixed-page-duplicates/${dupMeta.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify(dupMeta),
          });
          const updated = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(updated.error || 'Seiten-Einstellungen konnten nicht gespeichert werden');
          if (updated.slug !== id) navigate(`/admin/infos-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/infos', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify(primaryMeta),
          });
          const updated = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(updated.error || 'Seiten-Einstellungen konnten nicht gespeichert werden');
          setPrimaryMeta(updated);
        }
      })
      .then(() => notify('Inhalte gespeichert', { type: 'success' }))
      .catch((err) => notify(err.message || 'Fehler beim Speichern', { type: 'error' }))
      .finally(() => setSaving(false));
  };

  if (loading) return <Box sx={{ p: 3 }}><Typography>Lade...</Typography></Box>;
  if (loadError || !content) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={load}>Erneut versuchen</Button>}>
          Inhalte konnten nicht geladen werden. Bitte laden Sie die Seite neu, bevor Sie speichern.
        </Alert>
      </Box>
    );
  }

  const set = (field: keyof InfosData) => (e: React.ChangeEvent<HTMLInputElement>) => setContent({ ...content, [field]: e.target.value });

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">Infos / Kontakt - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte der Seite /infos (Kontakt) - das Design/Layout bleibt exakt wie es ist.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Kontakt</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Firmenname" fullWidth value={content.companyName} onChange={set('companyName')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Shop-Bezeichnung" fullWidth value={content.shopLabel} onChange={set('shopLabel')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Shop Straße" fullWidth value={content.shopStreet} onChange={set('shopStreet')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Shop Ort" fullWidth value={content.shopCity} onChange={set('shopCity')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Außenstelle Bezeichnung" fullWidth value={content.outpostLabel} onChange={set('outpostLabel')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Außenstelle Straße" fullWidth value={content.outpostStreet} onChange={set('outpostStreet')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Außenstelle Ort" fullWidth value={content.outpostCity} onChange={set('outpostCity')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Telefon" fullWidth value={content.phone} onChange={set('phone')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="E-Mail" fullWidth value={content.email} onChange={set('email')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Öffnungszeiten" fullWidth value={content.openingHours} onChange={set('openingHours')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Öffnungszeiten Hinweis" fullWidth value={content.openingHoursNote} onChange={set('openingHoursNote')} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Parkplatz-Hinweis" fullWidth multiline minRows={2} value={content.parkingNote} onChange={set('parkingNote')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Routenplaner-Link" fullWidth value={content.routenplanerUrl} onChange={set('routenplanerUrl')} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Bankverbindung</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Kontoinhaber" fullWidth value={content.bankAccountHolder} onChange={set('bankAccountHolder')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Bank" fullWidth value={content.bankName} onChange={set('bankName')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="IBAN" fullWidth value={content.iban} onChange={set('iban')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="BIC" fullWidth value={content.bic} onChange={set('bic')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Kontonummer" fullWidth value={content.accountNumber} onChange={set('accountNumber')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Bankleitzahl" fullWidth value={content.bankCode} onChange={set('bankCode')} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Standort-Karte</Typography>
          <TextField
            label="Google Maps Embed-URL"
            fullWidth
            multiline
            minRows={2}
            value={content.mapsEmbedUrl}
            onChange={set('mapsEmbedUrl')}
            helperText='Aus Google Maps: Teilen → Karte einbetten → nur die URL aus dem src="..." kopieren.'
          />
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
        <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
          Vorschau
        </Button>
        <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
      </Box>
    </Box>
  );
};
