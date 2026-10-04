import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotify } from 'react-admin';
import { Box, Card, CardContent, Typography, TextField, Button, Grid, Alert, CircularProgress, IconButton } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import UploadIcon from '@mui/icons-material/Upload';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { type FixedDuplicateMeta, FixedDuplicateMetaFields } from './FixedDuplicateMetaFields';
import { type PrimaryPageSettings, PrimaryPageSettingsFields } from './PrimaryPageSettingsFields';
import { isSessionExpiredError } from './sessionExpiry';

// Same "data only, layout stays" idea as GutscheineContentEditor.tsx and
// siblings, for the /faq page (FAQ.tsx). The question/answer accordion
// items are the one repeater field here (admin can add/remove items).

interface FaqItem { question: string; answerHtml: string }
interface FaqData {
  heading: string;
  items: FaqItem[];
  contactHeading: string;
  contactImage: string;
  contactText: string;
  openingHoursLabel: string;
  openingHoursText: string;
  addressLines: string;
  contactEmail: string;
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

export const FAQContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'faq';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<FaqData | null>(null);
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
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/faq', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/faq-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/faq', {
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

  const set = (field: keyof FaqData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setContent({ ...content, [field]: e.target.value });

  const updateItem = (i: number, field: keyof FaqItem, value: string) => {
    const items = [...content.items];
    items[i] = { ...items[i], [field]: value };
    setContent({ ...content, items });
  };
  const addItem = () => setContent({ ...content, items: [...content.items, { question: '', answerHtml: '' }] });
  const removeItem = (i: number) => setContent({ ...content, items: content.items.filter((_, idx) => idx !== i) });

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">FAQ - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte und Bilder der Seite /faq - das Design/Layout bleibt exakt wie es ist.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Einleitung</Typography>
          <TextField label="Überschrift" fullWidth value={content.heading} onChange={set('heading')} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Fragen &amp; Antworten</Typography>
          {content.items.map((item, i) => (
            <Box key={i} sx={{ mb: 3, pb: 3, borderBottom: i < content.items.length - 1 ? '1px solid #eee' : 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: '#666' }}>{item.question || `Frage ${i + 1}`}</Typography>
                <IconButton onClick={() => removeItem(i)} title="Frage löschen" disabled={content.items.length <= 1}>
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Box>
              <TextField label="Frage" fullWidth value={item.question} onChange={(e) => updateItem(i, 'question', e.target.value)} sx={{ mb: 2 }} />
              <TextField
                label="Antwort (HTML erlaubt, z.B. <a href=... class=...>Linktext</a>)"
                fullWidth
                multiline
                minRows={2}
                value={item.answerHtml}
                onChange={(e) => updateItem(i, 'answerHtml', e.target.value)}
              />
            </Box>
          ))}
          <Button startIcon={<AddIcon />} onClick={addItem}>Frage hinzufügen</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>"Noch Fragen?" Box</Typography>
          <TextField label="Überschrift" fullWidth value={content.contactHeading} onChange={set('contactHeading')} sx={{ mb: 2 }} />
          <ImageSlot url={content.contactImage} onUploaded={(url) => setContent({ ...content, contactImage: url })} label="Bild ersetzen" />
          <TextField label="Text" fullWidth multiline minRows={2} value={content.contactText} onChange={set('contactText')} sx={{ mb: 2 }} />
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Öffnungszeiten-Label" fullWidth value={content.openingHoursLabel} onChange={set('openingHoursLabel')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Öffnungszeiten-Text"
                fullWidth
                multiline
                minRows={2}
                value={content.openingHoursText}
                onChange={set('openingHoursText')}
                helperText="Mehrere Zeilen: einfach Zeilenumbruch verwenden"
              />
            </Grid>
          </Grid>
          <TextField
            label="Adresse"
            fullWidth
            multiline
            minRows={3}
            value={content.addressLines}
            onChange={set('addressLines')}
            helperText="Mehrere Zeilen: einfach Zeilenumbruch verwenden"
            sx={{ mb: 2 }}
          />
          <TextField label="E-Mail" fullWidth value={content.contactEmail} onChange={set('contactEmail')} />
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
