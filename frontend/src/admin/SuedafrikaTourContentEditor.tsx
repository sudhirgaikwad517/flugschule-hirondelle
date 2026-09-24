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

// Same "data only, layout stays" idea as TeamContentEditor.tsx, for the
// /reisen/suedafrika-tour page (SuedafrikaTour.tsx). Gallery images are
// managed separately via Komponenten > Galerie and are not part of this
// content at all.

interface Badge { label: string; color: string }
interface SuedafrikaTourData {
  eyebrow: string;
  title: string;
  heroImage: string;
  heroImageAlt: string;
  block1Heading: string;
  block1Paragraph: string;
  block2Heading: string;
  block2Paragraph1Html: string;
  block2Paragraph2Html: string;
  block2Paragraph3Html: string;
  block2Paragraph4: string;
  block3Heading: string;
  block3Paragraph1: string;
  block3Paragraph2: string;
  block4Heading: string;
  block4Paragraph1: string;
  block4Paragraph2: string;
  leistungenHeading: string;
  leistungen: string[];
  flyerImage: string;
  badges: Badge[];
  bookingButtonText: string;
  bookingButtonLink: string;
  tourpreisLabel: string;
  tourpreisAmount: string;
  voraussetzungText: string;
  additionalNoteText: string;
  scheduleButtonText: string;
  scheduleButtonLink: string;
  gutscheinHeading: string;
  gutscheinDescription: string;
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

export const SuedafrikaTourContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'suedafrika-tour';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<SuedafrikaTourData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || (id === 'suedafrika-tour' ? 'reisen/suedafrika-tour' : id)}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/suedafrika-tour', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/suedafrika-tour-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/suedafrika-tour', {
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

  const updateLeistung = (i: number, value: string) => {
    const leistungen = [...content.leistungen];
    leistungen[i] = value;
    setContent({ ...content, leistungen });
  };
  const addLeistung = () => setContent({ ...content, leistungen: [...content.leistungen, ''] });
  const removeLeistung = (i: number) => setContent({ ...content, leistungen: content.leistungen.filter((_, idx) => idx !== i) });

  const updateBadge = (i: number, field: keyof Badge, value: string) => {
    const badges = [...content.badges];
    badges[i] = { ...badges[i], [field]: value };
    setContent({ ...content, badges });
  };
  const addBadge = () => setContent({ ...content, badges: [...content.badges, { label: '', color: '#53a8c7' }] });
  const removeBadge = (i: number) => setContent({ ...content, badges: content.badges.filter((_, idx) => idx !== i) });

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">Südafrika-Tour - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte, Bilder und Preise der Seite /reisen/suedafrika-tour - das Design/Layout bleibt exakt wie es ist. Die Bildergalerie wird separat über Komponenten &gt; Galerie verwaltet.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Einleitung</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Kleiner Titel (oben)" fullWidth value={content.eyebrow} onChange={(e) => setContent({ ...content, eyebrow: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 8 }}><TextField label="Überschrift" fullWidth value={content.title} onChange={(e) => setContent({ ...content, title: e.target.value })} /></Grid>
          </Grid>
          <ImageSlot url={content.heroImage} onUploaded={(url) => setContent({ ...content, heroImage: url })} label="Titelbild ersetzen" />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Textblöcke</Typography>
          <TextField label="Überschrift 1" fullWidth value={content.block1Heading} onChange={(e) => setContent({ ...content, block1Heading: e.target.value })} sx={{ mb: 1 }} />
          <TextField label="Absatz 1" fullWidth multiline minRows={3} value={content.block1Paragraph} onChange={(e) => setContent({ ...content, block1Paragraph: e.target.value })} sx={{ mb: 3 }} />

          <TextField label="Überschrift 2 (Fluggebiete)" fullWidth value={content.block2Heading} onChange={(e) => setContent({ ...content, block2Heading: e.target.value })} sx={{ mb: 1 }} />
          <TextField label="Absatz 2.1 (HTML erlaubt)" fullWidth multiline minRows={2} value={content.block2Paragraph1Html} onChange={(e) => setContent({ ...content, block2Paragraph1Html: e.target.value })} sx={{ mb: 1 }} />
          <TextField label="Absatz 2.2 (HTML erlaubt)" fullWidth multiline minRows={2} value={content.block2Paragraph2Html} onChange={(e) => setContent({ ...content, block2Paragraph2Html: e.target.value })} sx={{ mb: 1 }} />
          <TextField label="Absatz 2.3 (HTML erlaubt)" fullWidth multiline minRows={2} value={content.block2Paragraph3Html} onChange={(e) => setContent({ ...content, block2Paragraph3Html: e.target.value })} sx={{ mb: 1 }} />
          <TextField label="Absatz 2.4" fullWidth multiline minRows={2} value={content.block2Paragraph4} onChange={(e) => setContent({ ...content, block2Paragraph4: e.target.value })} sx={{ mb: 3 }} />

          <TextField label="Überschrift 3" fullWidth value={content.block3Heading} onChange={(e) => setContent({ ...content, block3Heading: e.target.value })} sx={{ mb: 1 }} />
          <TextField label="Absatz 3.1" fullWidth multiline minRows={2} value={content.block3Paragraph1} onChange={(e) => setContent({ ...content, block3Paragraph1: e.target.value })} sx={{ mb: 1 }} />
          <TextField label="Absatz 3.2" fullWidth multiline minRows={2} value={content.block3Paragraph2} onChange={(e) => setContent({ ...content, block3Paragraph2: e.target.value })} sx={{ mb: 3 }} />

          <TextField label="Überschrift 4" fullWidth value={content.block4Heading} onChange={(e) => setContent({ ...content, block4Heading: e.target.value })} sx={{ mb: 1 }} />
          <TextField label="Absatz 4.1" fullWidth multiline minRows={2} value={content.block4Paragraph1} onChange={(e) => setContent({ ...content, block4Paragraph1: e.target.value })} sx={{ mb: 1 }} />
          <TextField label="Absatz 4.2" fullWidth multiline minRows={2} value={content.block4Paragraph2} onChange={(e) => setContent({ ...content, block4Paragraph2: e.target.value })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Leistungen</Typography>
          <TextField label="Überschrift" fullWidth value={content.leistungenHeading} onChange={(e) => setContent({ ...content, leistungenHeading: e.target.value })} sx={{ mb: 2 }} />
          {content.leistungen.map((item, i) => (
            <Grid container spacing={2} key={i} sx={{ mb: 1.5, alignItems: 'center' }}>
              <Grid size={{ xs: 10 }}><TextField label={`Punkt ${i + 1}`} fullWidth value={item} onChange={(e) => updateLeistung(i, e.target.value)} /></Grid>
              <Grid size={{ xs: 2 }}>
                <IconButton onClick={() => removeLeistung(i)} title="Punkt löschen">
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button startIcon={<AddIcon />} onClick={addLeistung} sx={{ mt: 1, mb: 2 }}>Punkt hinzufügen</Button>
          <ImageSlot url={content.flyerImage} onUploaded={(url) => setContent({ ...content, flyerImage: url })} label="Flyer-Bild ersetzen" />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Badges (farbige Balken)</Typography>
          {content.badges.map((badge, i) => (
            <Grid container spacing={2} key={i} sx={{ mb: 1.5, alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 7 }}><TextField label="Beschriftung" fullWidth value={badge.label} onChange={(e) => updateBadge(i, 'label', e.target.value)} /></Grid>
              <Grid size={{ xs: 8, sm: 4 }}><TextField label="Farbe (Hex)" fullWidth value={badge.color} onChange={(e) => updateBadge(i, 'color', e.target.value)} /></Grid>
              <Grid size={{ xs: 4, sm: 1 }}>
                <IconButton onClick={() => removeBadge(i)} title="Badge löschen">
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button startIcon={<AddIcon />} onClick={addBadge} sx={{ mt: 1 }}>Badge hinzufügen</Button>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Buchungs-Karte</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Text (oben)" fullWidth value={content.bookingButtonText} onChange={(e) => setContent({ ...content, bookingButtonText: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Link" fullWidth value={content.bookingButtonLink} onChange={(e) => setContent({ ...content, bookingButtonLink: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Preis-Label" fullWidth value={content.tourpreisLabel} onChange={(e) => setContent({ ...content, tourpreisLabel: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Preis" fullWidth value={content.tourpreisAmount} onChange={(e) => setContent({ ...content, tourpreisAmount: e.target.value })} /></Grid>
          </Grid>
          <TextField label="Voraussetzung" fullWidth value={content.voraussetzungText} onChange={(e) => setContent({ ...content, voraussetzungText: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Zusatz-Hinweis" fullWidth multiline minRows={2} value={content.additionalNoteText} onChange={(e) => setContent({ ...content, additionalNoteText: e.target.value })} sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Text (unten)" fullWidth value={content.scheduleButtonText} onChange={(e) => setContent({ ...content, scheduleButtonText: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Link (unten)" fullWidth value={content.scheduleButtonLink} onChange={(e) => setContent({ ...content, scheduleButtonLink: e.target.value })} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Gutschein-Box</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Überschrift" fullWidth value={content.gutscheinHeading} onChange={(e) => setContent({ ...content, gutscheinHeading: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Beschreibung" fullWidth value={content.gutscheinDescription} onChange={(e) => setContent({ ...content, gutscheinDescription: e.target.value })} /></Grid>
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
