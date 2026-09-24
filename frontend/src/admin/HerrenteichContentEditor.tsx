import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotify } from 'react-admin';
import { Box, Card, CardContent, Typography, TextField, Button, Grid, Alert, CircularProgress, IconButton } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import UploadIcon from '@mui/icons-material/Upload';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { type FixedDuplicateMeta, FixedDuplicateMetaFields } from './FixedDuplicateMetaFields';
import { type PrimaryPageSettings, PrimaryPageSettingsFields } from './PrimaryPageSettingsFields';

// /infos/gelaende/herrenteich - one of the 10 Gelände detail pages, each
// now its own kind/page/editor (see Herrenteich.tsx). No formal "Eckdaten"
// box on this one (just an intro paragraph); its main content is an
// 11-entry driving-directions list (each a bold label + text) plus a
// separate 4-item rules list.

interface DirectionEntry { label: string; text: string }
interface HerrenteichData {
  title: string;
  introText: string;
  routenplanerUrl: string;
  mainImage: string;
  navTipHtml: string;
  directions: DirectionEntry[];
  rulesHeading: string;
  rules: string[];
  mapEmbedUrl: string;
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
        <Box sx={{ position: 'relative', width: 96, height: 64 }}>
          <Box component="img" src={url} alt="" sx={{ width: 96, height: 64, objectFit: 'cover', borderRadius: 1 }} />
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

export const HerrenteichContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'herrenteich';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<HerrenteichData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || (id === 'herrenteich' ? 'infos/gelaende/herrenteich' : id)}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/herrenteich', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/herrenteich-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/herrenteich', {
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

  const updateDirection = (i: number, field: keyof DirectionEntry, value: string) => {
    const directions = [...content.directions];
    directions[i] = { ...directions[i], [field]: value };
    setContent({ ...content, directions });
  };
  const addDirection = () => setContent({ ...content, directions: [...content.directions, { label: '', text: '' }] });
  const removeDirection = (i: number) => setContent({ ...content, directions: content.directions.filter((_, idx) => idx !== i) });

  const updateRule = (i: number, value: string) => {
    const rules = [...content.rules];
    rules[i] = value;
    setContent({ ...content, rules });
  };
  const addRule = () => setContent({ ...content, rules: [...content.rules, ''] });
  const removeRule = (i: number) => setContent({ ...content, rules: content.rules.filter((_, idx) => idx !== i) });

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">Herrenteich - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte, Bild und Karte der Seite {previewPath} - das Design/Layout bleibt exakt wie es ist.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Einleitung</Typography>
          <TextField label="Titel" fullWidth value={content.title} onChange={(e) => setContent({ ...content, title: e.target.value })} sx={{ mb: 2 }} />
          <TextField
            label="Einleitungstext (HTML erlaubt)"
            fullWidth
            multiline
            minRows={2}
            value={content.introText}
            onChange={(e) => setContent({ ...content, introText: e.target.value })}
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Routenplaner</Typography>
          <TextField
            label="Routenplaner-Link"
            fullWidth
            value={content.routenplanerUrl}
            onChange={(e) => setContent({ ...content, routenplanerUrl: e.target.value })}
            helperText="Google/Apple-Maps-Link für die 'Routenplaner für Smartphones'-Box"
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Bild</Typography>
          <ImageSlot url={content.mainImage} onUploaded={(url) => setContent({ ...content, mainImage: url })} label="Bild ersetzen" />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Navigations-Tipp</Typography>
          <TextField
            label="Text (HTML erlaubt)"
            fullWidth
            multiline
            minRows={2}
            value={content.navTipHtml}
            onChange={(e) => setContent({ ...content, navTipHtml: e.target.value })}
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 0.5 }}>Anfahrtsbeschreibungen</Typography>
          <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
            Eine Zeile pro Herkunftsort - Titel + Anfahrtstext.
          </Typography>
          {content.directions.map((entry, i) => (
            <Box key={i} sx={{ mb: 3, pb: 3, borderBottom: i < content.directions.length - 1 ? '1px solid #eee' : 'none' }}>
              <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
                <Grid size={{ xs: 12 }}>
                  <TextField label="Titel" fullWidth value={entry.label} onChange={(e) => updateDirection(i, 'label', e.target.value)} sx={{ mb: 1 }} />
                </Grid>
                <Grid size={{ xs: 11 }}>
                  <TextField
                    label="Anfahrtstext"
                    fullWidth
                    multiline
                    minRows={2}
                    value={entry.text}
                    onChange={(e) => updateDirection(i, 'text', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 1 }}>
                  <IconButton onClick={() => removeDirection(i)} title="Eintrag löschen">
                    <DeleteIcon fontSize="small" color="error" />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} onClick={addDirection}>Eintrag hinzufügen</Button>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Regeln</Typography>
          <TextField
            label="Abschnitts-Überschrift"
            fullWidth
            value={content.rulesHeading}
            onChange={(e) => setContent({ ...content, rulesHeading: e.target.value })}
            sx={{ mb: 2 }}
          />
          {content.rules.map((rule, i) => (
            <Grid container spacing={2} key={i} sx={{ mb: 1.5, alignItems: 'center' }}>
              <Grid size={{ xs: 11 }}>
                <TextField label={`Regel ${i + 1}`} fullWidth multiline value={rule} onChange={(e) => updateRule(i, e.target.value)} />
              </Grid>
              <Grid size={{ xs: 1 }}>
                <IconButton onClick={() => removeRule(i)} title="Regel löschen">
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button startIcon={<AddIcon />} onClick={addRule} sx={{ mt: 1 }}>Regel hinzufügen</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Karte</Typography>
          <TextField
            label="Google Maps Embed-URL"
            fullWidth
            value={content.mapEmbedUrl}
            onChange={(e) => setContent({ ...content, mapEmbedUrl: e.target.value })}
            helperText='Bei Google Maps auf "Teilen" > "Karte einbetten" klicken und nur die URL aus dem src="..." des angezeigten Codes hier einfügen.'
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
