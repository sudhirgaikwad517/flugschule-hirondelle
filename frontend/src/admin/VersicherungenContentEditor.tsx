import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotify } from 'react-admin';
import { Box, Card, CardContent, Typography, TextField, Button, Grid, Alert, CircularProgress, IconButton } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import UploadIcon from '@mui/icons-material/Upload';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { type FixedDuplicateMeta, FixedDuplicateMetaFields } from './FixedDuplicateMetaFields';
import { type PrimaryPageSettings, PrimaryPageSettingsFields } from './PrimaryPageSettingsFields';

// Same "data only, layout stays" idea as AusbildungContentEditor.tsx, for
// the /infos/versicherungen page (Versicherungen.tsx). stornoRows and
// insuranceLinks are fixed-count (4 and 3) - no add/remove, since the page's
// design has exactly that many rows/bullets.

interface StornoRow { label: string; value: string }
interface InsuranceLink { label: string; url: string }
interface VersicherungenData {
  heading: string;
  subheading: string;
  paragraph1: string;
  paragraph2Html: string;
  stornoIntro: string;
  stornoRows: StornoRow[];
  paragraph3Html: string;
  paragraph4: string;
  seminarParagraphHtml: string;
  seminarUrl: string;
  reiseParagraph1Html: string;
  reiseParagraph2: string;
  insuranceLinks: InsuranceLink[];
  closingParagraph: string;
  image: string;
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
        <Box sx={{ position: 'relative', width: 72, height: 54 }}>
          <Box component="img" src={url} alt="" sx={{ width: 72, height: 54, objectFit: 'cover', borderRadius: 1 }} />
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

export const VersicherungenContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'versicherungen';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<VersicherungenData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || (id === 'versicherungen' ? 'infos/versicherungen' : id)}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/versicherungen', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/versicherungen-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/versicherungen', {
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

  const updateStornoRow = (i: number, field: keyof StornoRow, value: string) => {
    const stornoRows = [...content.stornoRows];
    stornoRows[i] = { ...stornoRows[i], [field]: value };
    setContent({ ...content, stornoRows });
  };

  const updateInsuranceLink = (i: number, field: keyof InsuranceLink, value: string) => {
    const insuranceLinks = [...content.insuranceLinks];
    insuranceLinks[i] = { ...insuranceLinks[i], [field]: value };
    setContent({ ...content, insuranceLinks });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">Versicherungen - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte und Bilder der Seite /infos/versicherungen - das Design/Layout bleibt exakt wie es ist.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Einleitung</Typography>
          <TextField label="Überschrift" fullWidth value={content.heading} onChange={(e) => setContent({ ...content, heading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Unterüberschrift" fullWidth value={content.subheading} onChange={(e) => setContent({ ...content, subheading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 1" fullWidth multiline minRows={2} value={content.paragraph1} onChange={(e) => setContent({ ...content, paragraph1: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 2 (HTML erlaubt)" fullWidth multiline minRows={2} value={content.paragraph2Html} onChange={(e) => setContent({ ...content, paragraph2Html: e.target.value })} sx={{ mb: 2 }} />
          <ImageSlot url={content.image} onUploaded={(url) => setContent({ ...content, image: url })} label="Bild ersetzen" />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Stornobedingungen</Typography>
          <TextField label="Einleitung" fullWidth multiline minRows={2} value={content.stornoIntro} onChange={(e) => setContent({ ...content, stornoIntro: e.target.value })} sx={{ mb: 2 }} />
          {content.stornoRows.map((row, i) => (
            <Grid container spacing={2} key={i} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, sm: 8 }}><TextField label="Zeitraum" fullWidth value={row.label} onChange={(e) => updateStornoRow(i, 'label', e.target.value)} /></Grid>
              <Grid size={{ xs: 12, sm: 4 }}><TextField label="Gebühr" fullWidth value={row.value} onChange={(e) => updateStornoRow(i, 'value', e.target.value)} /></Grid>
            </Grid>
          ))}
          <TextField label="Absatz 3 (HTML erlaubt)" fullWidth multiline minRows={2} value={content.paragraph3Html} onChange={(e) => setContent({ ...content, paragraph3Html: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 4" fullWidth multiline minRows={2} value={content.paragraph4} onChange={(e) => setContent({ ...content, paragraph4: e.target.value })} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Versicherungen</Typography>
          <TextField label="Seminarversicherung - Text (HTML erlaubt)" fullWidth multiline minRows={2} value={content.seminarParagraphHtml} onChange={(e) => setContent({ ...content, seminarParagraphHtml: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Seminarversicherung - Link" fullWidth value={content.seminarUrl} onChange={(e) => setContent({ ...content, seminarUrl: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Reiseversicherungen - Text (HTML erlaubt)" fullWidth multiline minRows={2} value={content.reiseParagraph1Html} onChange={(e) => setContent({ ...content, reiseParagraph1Html: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Reiseversicherungen - Zwischenüberschrift" fullWidth value={content.reiseParagraph2} onChange={(e) => setContent({ ...content, reiseParagraph2: e.target.value })} sx={{ mb: 2 }} />
          {content.insuranceLinks.map((item, i) => (
            <Grid container spacing={2} key={i} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Bezeichnung" fullWidth value={item.label} onChange={(e) => updateInsuranceLink(i, 'label', e.target.value)} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Link" fullWidth value={item.url} onChange={(e) => updateInsuranceLink(i, 'url', e.target.value)} /></Grid>
            </Grid>
          ))}
          <TextField label="Schlussabsatz" fullWidth multiline minRows={2} value={content.closingParagraph} onChange={(e) => setContent({ ...content, closingParagraph: e.target.value })} />
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
