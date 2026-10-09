import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotify } from 'react-admin';
import { Box, Card, CardContent, Typography, TextField, Button, Grid, Alert, IconButton, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import CloseIcon from '@mui/icons-material/Close';
import { type FixedDuplicateMeta, FixedDuplicateMetaFields } from './FixedDuplicateMetaFields';
import { type PrimaryPageSettings, PrimaryPageSettingsFields } from './PrimaryPageSettingsFields';
import { isSessionExpiredError } from './sessionExpiry';

// Same "data only, layout stays" idea as ServiceContentEditor.tsx, for the
// /tandem page (Tandem.tsx). The image gallery on that page (5 fixed
// "Impressionen" photos) isn't covered here, same as most other fixed
// pages' decorative galleries.

interface Pilot { name: string; img: string }
interface TandemData {
  heading: string;
  videoUrl: string;
  quote: string;
  introHtml: string;
  priceLabel: string;
  priceNote: string;
  price: string;
  warningText: string;
  terminHeading: string;
  terminHtml: string;
  pilots: Pilot[];
  services: string[];
  requirements: string[];
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

const ImageSlot = ({ url, onUploaded, label }: { url: string; onUploaded: (url: string) => void; label: string }) => {
  const notify = useNotify();
  const [uploading, setUploading] = useState(false);
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', headers: authHeaders(), body: formData });
      const data = await res.json();
      if (res.ok) onUploaded(data.url);
      else notify(data.message || 'Fehler beim Upload', { type: 'warning' });
    } catch {
      notify('Netzwerkfehler beim Upload', { type: 'warning' });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      {url && (
        <Box sx={{ position: 'relative', width: 64, height: 64 }}>
          <Box component="img" src={url} alt="" sx={{ width: 64, height: 64, objectFit: 'cover', borderRadius: '50%' }} />
          <IconButton
            size="small"
            onClick={() => onUploaded('')}
            title="Bild entfernen"
            sx={{ position: 'absolute', top: -8, right: -8, width: 20, height: 20, bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: '#fee2e2' } }}
          >
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      )}
      <Button component="label" size="small" variant="outlined" startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />} disabled={uploading}>
        {label}
        <input type="file" accept="image/*" hidden onChange={handleUpload} />
      </Button>
    </Box>
  );
};

export const TandemContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'tandem';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<TandemData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || id}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/tandem', { headers: authHeaders() }),
    ])
      .then(async ([contentRes, metaRes, primaryRes]) => {
        if (!contentRes.ok) throw new Error(`HTTP ${contentRes.status}`);
        setContent((await contentRes.json()).data);
        setDupMeta(metaRes && metaRes.ok ? await metaRes.json() : null);
        setPrimaryMeta(primaryRes && primaryRes.ok ? await primaryRes.json() : null);
        setLoading(false);
      })
      .catch((err) => { console.error(err); notify('Fehler beim Laden', { type: 'error' }); setSessionExpired(isSessionExpiredError(err)); setLoadError(true); setLoading(false); });
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
          if (updated.slug !== id) navigate(`/admin/tandem-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/tandem', {
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
        {sessionExpired ? (
          <Alert severity="warning" action={<Button color="inherit" size="small" href="/admin/login">Erneut einloggen</Button>}>
            Ihre Sitzung ist abgelaufen. Bitte loggen Sie sich erneut ein.
          </Alert>
        ) : (
          <Alert severity="error" action={<Button color="inherit" size="small" onClick={load}>Erneut versuchen</Button>}>
            Inhalte konnten nicht geladen werden. Bitte laden Sie die Seite neu, bevor Sie speichern.
          </Alert>
        )}
      </Box>
    );
  }

  const updatePilot = (i: number, field: keyof Pilot, value: string) => {
    const pilots = [...content.pilots];
    pilots[i] = { ...pilots[i], [field]: value };
    setContent({ ...content, pilots });
  };
  const addPilot = () => setContent({ ...content, pilots: [...content.pilots, { name: '', img: '' }] });
  const removePilot = (i: number) => setContent({ ...content, pilots: content.pilots.filter((_, idx) => idx !== i) });

  const updateListItem = (key: 'services' | 'requirements', i: number, value: string) => {
    const list = [...content[key]];
    list[i] = value;
    setContent({ ...content, [key]: list });
  };
  const addListItem = (key: 'services' | 'requirements') => setContent({ ...content, [key]: [...content[key], ''] });
  const removeListItem = (key: 'services' | 'requirements', i: number) =>
    setContent({ ...content, [key]: content[key].filter((_, idx) => idx !== i) });

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">Tandem - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte und Bilder der Seite /tandem - das Design/Layout bleibt exakt wie es ist.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Einleitung</Typography>
          <TextField label="Überschrift" fullWidth value={content.heading} onChange={(e) => setContent({ ...content, heading: e.target.value })} sx={{ mb: 2 }} />
          <TextField
            label="YouTube-Video-URL (Embed-Link)"
            fullWidth
            value={content.videoUrl}
            onChange={(e) => setContent({ ...content, videoUrl: e.target.value })}
            helperText="z.B. https://www.youtube-nocookie.com/embed/VIDEO-ID"
            sx={{ mb: 2 }}
          />
          <TextField label="Zitat (unter dem Video)" fullWidth value={content.quote} onChange={(e) => setContent({ ...content, quote: e.target.value })} sx={{ mb: 2 }} />
          <TextField
            label="Einleitungstext (HTML erlaubt)"
            fullWidth
            multiline
            minRows={6}
            value={content.introHtml}
            onChange={(e) => setContent({ ...content, introHtml: e.target.value })}
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Preis-Box</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Bezeichnung" fullWidth value={content.priceLabel} onChange={(e) => setContent({ ...content, priceLabel: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Zahlungshinweis" fullWidth value={content.priceNote} onChange={(e) => setContent({ ...content, priceNote: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Preis" fullWidth value={content.price} onChange={(e) => setContent({ ...content, price: e.target.value })} /></Grid>
          </Grid>
          <TextField
            label="Achtung-Hinweis"
            fullWidth
            multiline
            minRows={2}
            value={content.warningText}
            onChange={(e) => setContent({ ...content, warningText: e.target.value })}
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Terminvereinbarung</Typography>
          <TextField label="Überschrift" fullWidth value={content.terminHeading} onChange={(e) => setContent({ ...content, terminHeading: e.target.value })} sx={{ mb: 2 }} />
          <TextField
            label="Text (HTML erlaubt)"
            fullWidth
            multiline
            minRows={8}
            value={content.terminHtml}
            onChange={(e) => setContent({ ...content, terminHtml: e.target.value })}
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Tandempiloten</Typography>
          <Grid container spacing={3}>
            {content.pilots.map((pilot, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#666' }}>{pilot.name || `Pilot ${i + 1}`}</Typography>
                  <IconButton size="small" onClick={() => removePilot(i)} title="Entfernen"><DeleteIcon fontSize="small" color="error" /></IconButton>
                </Box>
                <ImageSlot url={pilot.img} onUploaded={(url) => updatePilot(i, 'img', url)} label="Foto ersetzen" />
                <TextField label="Name" fullWidth value={pilot.name} onChange={(e) => updatePilot(i, 'name', e.target.value)} />
              </Grid>
            ))}
          </Grid>
          <Button startIcon={<AddIcon />} onClick={addPilot} sx={{ mt: 2 }}>Pilot hinzufügen</Button>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Unsere Leistungen</Typography>
              {content.services.map((service, i) => (
                <Grid container spacing={1} key={i} sx={{ mb: 1.5, alignItems: 'center' }}>
                  <Grid size={{ xs: 11 }}><TextField label={`Punkt ${i + 1}`} fullWidth value={service} onChange={(e) => updateListItem('services', i, e.target.value)} /></Grid>
                  <Grid size={{ xs: 1 }}><IconButton onClick={() => removeListItem('services', i)} title="Löschen"><DeleteIcon fontSize="small" color="error" /></IconButton></Grid>
                </Grid>
              ))}
              <Button startIcon={<AddIcon />} onClick={() => addListItem('services')}>Punkt hinzufügen</Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Voraussetzung</Typography>
              {content.requirements.map((req, i) => (
                <Grid container spacing={1} key={i} sx={{ mb: 1.5, alignItems: 'center' }}>
                  <Grid size={{ xs: 11 }}><TextField label={`Punkt ${i + 1}`} fullWidth value={req} onChange={(e) => updateListItem('requirements', i, e.target.value)} /></Grid>
                  <Grid size={{ xs: 1 }}><IconButton onClick={() => removeListItem('requirements', i)} title="Löschen"><DeleteIcon fontSize="small" color="error" /></IconButton></Grid>
                </Grid>
              ))}
              <Button startIcon={<AddIcon />} onClick={() => addListItem('requirements')}>Punkt hinzufügen</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
        <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
          Vorschau
        </Button>
        <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
      </Box>
    </Box>
  );
};
