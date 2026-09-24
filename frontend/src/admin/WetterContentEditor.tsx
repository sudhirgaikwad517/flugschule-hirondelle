import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotify } from 'react-admin';
import { Box, Card, CardContent, Typography, TextField, Button, Grid, Alert } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { type FixedDuplicateMeta, FixedDuplicateMetaFields } from './FixedDuplicateMetaFields';
import { type PrimaryPageSettings, PrimaryPageSettingsFields } from './PrimaryPageSettingsFields';

// Same "data only, layout stays" idea as InfosContentEditor.tsx, for the
// /infos/wetter page (Wetter.tsx).

interface LinkItem { label: string; url: string }
interface WetterData {
  heading: string;
  kachelmannLinks: LinkItem[];
  weitereLinksHeading: string;
  pfalzLabel: string;
  raspkartenLabel: string;
  raspkartenLinkText: string;
  raspkartenUrl: string;
  appsHeading: string;
  windfinderLabel: string;
  windfinderIosUrl: string;
  windfinderAndroidUrl: string;
  regenradarLabel: string;
  regenradarIosUrl: string;
  regenradarAndroidUrl: string;
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

export const WetterContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'wetter';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<WetterData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || (id === 'wetter' ? 'infos/wetter' : id)}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/wetter', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/wetter-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/wetter', {
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

  const updateKachelmannLink = (i: number, field: keyof LinkItem, value: string) => {
    const kachelmannLinks = [...content.kachelmannLinks];
    kachelmannLinks[i] = { ...kachelmannLinks[i], [field]: value };
    setContent({ ...content, kachelmannLinks });
  };

  const set = (field: keyof WetterData) => (e: React.ChangeEvent<HTMLInputElement>) => setContent({ ...content, [field]: e.target.value });

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">Wetter - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte und Links der Seite /infos/wetter - das Design/Layout bleibt exakt wie es ist.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Überschrift</Typography>
          <TextField label="Überschrift" fullWidth value={content.heading} onChange={set('heading')} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Kachelmann Links</Typography>
          {content.kachelmannLinks.map((link, i) => (
            <Grid container spacing={2} key={i} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, sm: 7 }}><TextField label="Beschriftung" fullWidth value={link.label} onChange={(e) => updateKachelmannLink(i, 'label', e.target.value)} /></Grid>
              <Grid size={{ xs: 12, sm: 5 }}><TextField label="Link (URL)" fullWidth value={link.url} onChange={(e) => updateKachelmannLink(i, 'url', e.target.value)} helperText="Leer lassen für keinen Link" /></Grid>
            </Grid>
          ))}
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Weitere Links</Typography>
          <TextField label="Abschnitts-Überschrift" fullWidth value={content.weitereLinksHeading} onChange={set('weitereLinksHeading')} sx={{ mb: 2 }} />
          <TextField label="Label (z.B. Pfalz:)" fullWidth value={content.pfalzLabel} onChange={set('pfalzLabel')} sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 5 }}><TextField label="Raspkarten Text" fullWidth value={content.raspkartenLabel} onChange={set('raspkartenLabel')} /></Grid>
            <Grid size={{ xs: 12, sm: 3 }}><TextField label="Link-Text" fullWidth value={content.raspkartenLinkText} onChange={set('raspkartenLinkText')} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Link (URL)" fullWidth value={content.raspkartenUrl} onChange={set('raspkartenUrl')} helperText="Leer lassen für keinen Link" /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Apps</Typography>
          <TextField label="Abschnitts-Überschrift" fullWidth value={content.appsHeading} onChange={set('appsHeading')} sx={{ mb: 2 }} />
          <TextField label="Windfinder Beschreibung" fullWidth value={content.windfinderLabel} onChange={set('windfinderLabel')} sx={{ mb: 2 }} />
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Windfinder iOS Link" fullWidth value={content.windfinderIosUrl} onChange={set('windfinderIosUrl')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Windfinder Android Link" fullWidth value={content.windfinderAndroidUrl} onChange={set('windfinderAndroidUrl')} /></Grid>
          </Grid>
          <TextField label="RegenRadar Beschreibung" fullWidth value={content.regenradarLabel} onChange={set('regenradarLabel')} sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="RegenRadar iOS Link" fullWidth value={content.regenradarIosUrl} onChange={set('regenradarIosUrl')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="RegenRadar Android Link" fullWidth value={content.regenradarAndroidUrl} onChange={set('regenradarAndroidUrl')} /></Grid>
          </Grid>
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
