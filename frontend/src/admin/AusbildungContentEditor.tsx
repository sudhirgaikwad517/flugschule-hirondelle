import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotify } from 'react-admin';
import { Box, Card, CardContent, Typography, TextField, Button, Grid, Alert, CircularProgress, IconButton } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import UploadIcon from '@mui/icons-material/Upload';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { type FixedDuplicateMeta, FixedDuplicateMetaFields } from './FixedDuplicateMetaFields';
import { type PrimaryPageSettings, PrimaryPageSettingsFields } from './PrimaryPageSettingsFields';

// Same "data only, layout stays" idea as HomeContentEditor.tsx, for the
// /ausbildung page (Ausbildung.tsx): the intro text, the 6-row price table,
// the graphic image, and the 6 category sections are all fixed-count fields
// here - the page's design never changes, only what's plugged into it.

interface PriceRow { name: string; duration: string; content: string; price: string }
interface Category { heading: string; subheading: string; description: string; image: string; link: string }
interface AusbildungData {
  heroQuote: string;
  introQuote: string;
  introHtml: string;
  priceRows: PriceRow[];
  graphicImage: string;
  graphicCaption: string;
  graphicButtonLink: string;
  categories: Category[];
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
      {url && <Box component="img" src={url} alt="" sx={{ width: 72, height: 54, objectFit: 'cover', borderRadius: 1 }} />}
      <Button component="label" size="small" variant="outlined" startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />} disabled={uploading}>
        {label}
        <input type="file" accept="image/*" hidden onChange={handleUpload} />
      </Button>
    </Box>
  );
};

export const AusbildungContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  // A fixed-page duplicate (Pages.tsx > "Duplizieren") is edited via this
  // same screen, pointed at its own copied content row instead of the real
  // /ausbildung row - see FixedPageRouter.tsx on the public side.
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'ausbildung';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<AusbildungData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || id}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/ausbildung', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/ausbildung-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/ausbildung', {
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

  const updatePriceRow = (i: number, field: keyof PriceRow, value: string) => {
    const priceRows = [...content.priceRows];
    priceRows[i] = { ...priceRows[i], [field]: value };
    setContent({ ...content, priceRows });
  };

  const addPriceRow = () => {
    setContent({ ...content, priceRows: [...content.priceRows, { name: '', duration: '', content: '', price: '' }] });
  };

  const removePriceRow = (i: number) => {
    setContent({ ...content, priceRows: content.priceRows.filter((_, idx) => idx !== i) });
  };

  const updateCategory = (i: number, field: keyof Category, value: string) => {
    const categories = [...content.categories];
    categories[i] = { ...categories[i], [field]: value };
    setContent({ ...content, categories });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">Ausbildung - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte und Bilder der Seite /ausbildung - das Design/Layout bleibt exakt wie es ist.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Einleitung</Typography>
          <TextField label="Großes Zitat (oben)" fullWidth multiline minRows={2} value={content.heroQuote} onChange={(e) => setContent({ ...content, heroQuote: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 1" fullWidth multiline minRows={2} value={content.introQuote} onChange={(e) => setContent({ ...content, introQuote: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 2 (HTML erlaubt)" fullWidth multiline minRows={3} value={content.introHtml} onChange={(e) => setContent({ ...content, introHtml: e.target.value })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Preistabelle</Typography>
          {content.priceRows.map((row, i) => (
            <Grid container spacing={2} key={i} sx={{ mb: 2, alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 3 }}><TextField label="Kurs" fullWidth value={row.name} onChange={(e) => updatePriceRow(i, 'name', e.target.value)} /></Grid>
              <Grid size={{ xs: 12, sm: 2 }}><TextField label="Dauer" fullWidth value={row.duration} onChange={(e) => updatePriceRow(i, 'duration', e.target.value)} /></Grid>
              <Grid size={{ xs: 12, sm: 4 }}><TextField label="Inhalt" fullWidth value={row.content} onChange={(e) => updatePriceRow(i, 'content', e.target.value)} /></Grid>
              <Grid size={{ xs: 10, sm: 2 }}><TextField label="Preis" fullWidth value={row.price} onChange={(e) => updatePriceRow(i, 'price', e.target.value)} /></Grid>
              <Grid size={{ xs: 2, sm: 1 }}>
                <IconButton onClick={() => removePriceRow(i)} title="Zeile löschen" disabled={content.priceRows.length <= 1}>
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button startIcon={<AddIcon />} onClick={addPriceRow} sx={{ mt: 1 }}>
            Zeile hinzufügen
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Grafik</Typography>
          <ImageSlot url={content.graphicImage} onUploaded={(url) => setContent({ ...content, graphicImage: url })} label="Grafik ersetzen" />
          <TextField label="Bildunterschrift" fullWidth value={content.graphicCaption} onChange={(e) => setContent({ ...content, graphicCaption: e.target.value })} sx={{ mb: 2 }} />
          <TextField label='Link für den "WEITERLESEN"-Button' fullWidth value={content.graphicButtonLink} onChange={(e) => setContent({ ...content, graphicButtonLink: e.target.value })} helperText="Leer lassen, um den Button ohne Funktion zu zeigen (wie bisher)." />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Kategorien</Typography>
          <Grid container spacing={3}>
            {content.categories.map((cat, i) => (
              <Grid key={i} size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>{cat.heading || `Kategorie ${i + 1}`}</Typography>
                <ImageSlot url={cat.image} onUploaded={(url) => updateCategory(i, 'image', url)} label="Bild ersetzen" />
                <TextField label="Überschrift" fullWidth value={cat.heading} onChange={(e) => updateCategory(i, 'heading', e.target.value)} sx={{ mb: 2 }} />
                <TextField label="Unterüberschrift" fullWidth value={cat.subheading} onChange={(e) => updateCategory(i, 'subheading', e.target.value)} sx={{ mb: 2 }} />
                <TextField label="Beschreibung" fullWidth multiline minRows={3} value={cat.description} onChange={(e) => updateCategory(i, 'description', e.target.value)} sx={{ mb: 2 }} />
                <TextField label='Link für den "WEITERLESEN"-Button' fullWidth value={cat.link} onChange={(e) => updateCategory(i, 'link', e.target.value)} />
              </Grid>
            ))}
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
