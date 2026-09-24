import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotify } from 'react-admin';
import { Box, Card, CardContent, Typography, TextField, Button, Grid, Alert, IconButton } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { type FixedDuplicateMeta, FixedDuplicateMetaFields } from './FixedDuplicateMetaFields';
import { type PrimaryPageSettings, PrimaryPageSettingsFields } from './PrimaryPageSettingsFields';

// Same "data only, layout stays" idea as AusbildungContentEditor.tsx, for
// the /reisen/slowenien-tour page (SlowenienTour.tsx). Gallery images are
// managed separately via Komponenten > Galerie.

interface ContentBlock { heading: string; paragraphs: string[] }
interface Badge { label: string; color: string }

interface SlowenienTourData {
  eyebrow: string;
  heading: string;
  heroImage: string;
  heroImageAlt: string;
  contentBlocks: ContentBlock[];
  leistungenHeading: string;
  leistungen: string[];
  badges: Badge[];
  bookingButtonText: string;
  bookingButtonLink: string;
  priceLabel: string;
  price: string;
  voraussetzungText: string;
  scheduleButtonText: string;
  scheduleButtonLink: string;
  gutscheinHeading: string;
  gutscheinDescription: string;
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

export const SlowenienTourContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'slowenien-tour';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<SlowenienTourData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || (id === 'slowenien-tour' ? 'reisen/slowenien-tour' : id)}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/slowenien-tour', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/slowenien-tour-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/slowenien-tour', {
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

  const updateBlock = (i: number, field: keyof ContentBlock, value: any) => {
    const contentBlocks = [...content.contentBlocks];
    contentBlocks[i] = { ...contentBlocks[i], [field]: value };
    setContent({ ...content, contentBlocks });
  };
  const updateBlockParagraph = (i: number, pi: number, value: string) => {
    const contentBlocks = [...content.contentBlocks];
    const paragraphs = [...contentBlocks[i].paragraphs];
    paragraphs[pi] = value;
    contentBlocks[i] = { ...contentBlocks[i], paragraphs };
    setContent({ ...content, contentBlocks });
  };
  const addBlockParagraph = (i: number) => {
    const contentBlocks = [...content.contentBlocks];
    contentBlocks[i] = { ...contentBlocks[i], paragraphs: [...contentBlocks[i].paragraphs, ''] };
    setContent({ ...content, contentBlocks });
  };
  const removeBlockParagraph = (i: number, pi: number) => {
    const contentBlocks = [...content.contentBlocks];
    contentBlocks[i] = { ...contentBlocks[i], paragraphs: contentBlocks[i].paragraphs.filter((_, idx) => idx !== pi) };
    setContent({ ...content, contentBlocks });
  };
  const addBlock = () => setContent({ ...content, contentBlocks: [...content.contentBlocks, { heading: '', paragraphs: [''] }] });
  const removeBlock = (i: number) => setContent({ ...content, contentBlocks: content.contentBlocks.filter((_, idx) => idx !== i) });

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
        <Typography variant="h5">Slowenien-Tour - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte, Preise und Links der Seite /reisen/slowenien-tour - das Design/Layout bleibt exakt wie es ist. Die Bildergalerie wird separat über Komponenten &gt; Galerie verwaltet.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Einleitung</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Kleiner Titel (oben)" fullWidth value={content.eyebrow} onChange={(e) => setContent({ ...content, eyebrow: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 8 }}><TextField label="Überschrift" fullWidth value={content.heading} onChange={(e) => setContent({ ...content, heading: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Titelbild (URL)" fullWidth value={content.heroImage} onChange={(e) => setContent({ ...content, heroImage: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Titelbild Alt-Text" fullWidth value={content.heroImageAlt} onChange={(e) => setContent({ ...content, heroImageAlt: e.target.value })} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Textabschnitte</Typography>
          {content.contentBlocks.map((block, i) => (
            <Box key={i} sx={{ mb: 3, pb: 3, borderBottom: i < content.contentBlocks.length - 1 ? '1px solid #eee' : 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: '#666' }}>Abschnitt {i + 1}</Typography>
                <IconButton onClick={() => removeBlock(i)} title="Abschnitt löschen"><DeleteIcon fontSize="small" color="error" /></IconButton>
              </Box>
              <TextField label="Überschrift" fullWidth value={block.heading} onChange={(e) => updateBlock(i, 'heading', e.target.value)} sx={{ mb: 2 }} />
              {block.paragraphs.map((p, pi) => (
                <Grid container spacing={1} key={pi} sx={{ mb: 1, alignItems: 'center' }}>
                  <Grid size={{ xs: 11 }}>
                    <TextField
                      label={`Absatz ${pi + 1}`}
                      fullWidth
                      multiline
                      minRows={2}
                      value={p}
                      onChange={(e) => updateBlockParagraph(i, pi, e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 1 }}>
                    <IconButton onClick={() => removeBlockParagraph(i, pi)} title="Absatz löschen" disabled={block.paragraphs.length <= 1}>
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button size="small" startIcon={<AddIcon />} onClick={() => addBlockParagraph(i)}>Absatz hinzufügen</Button>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} onClick={addBlock}>Abschnitt hinzufügen</Button>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Leistungen</Typography>
          <TextField label="Überschrift" fullWidth value={content.leistungenHeading} onChange={(e) => setContent({ ...content, leistungenHeading: e.target.value })} sx={{ mb: 2 }} />
          {content.leistungen.map((item, i) => (
            <Grid container spacing={1} key={i} sx={{ mb: 1, alignItems: 'center' }}>
              <Grid size={{ xs: 11 }}>
                <TextField label={`Punkt ${i + 1}`} fullWidth multiline value={item} onChange={(e) => updateLeistung(i, e.target.value)} />
              </Grid>
              <Grid size={{ xs: 1 }}>
                <IconButton onClick={() => removeLeistung(i)} title="Punkt löschen"><DeleteIcon fontSize="small" color="error" /></IconButton>
              </Grid>
            </Grid>
          ))}
          <Button size="small" startIcon={<AddIcon />} onClick={addLeistung}>Punkt hinzufügen</Button>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Trainings-Badges (farbige Balken)</Typography>
          {content.badges.map((badge, i) => (
            <Grid container spacing={2} key={i} sx={{ mb: 1.5, alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Text" fullWidth value={badge.label} onChange={(e) => updateBadge(i, 'label', e.target.value)} /></Grid>
              <Grid size={{ xs: 8, sm: 5 }}><TextField label="Farbe (Hex)" fullWidth value={badge.color} onChange={(e) => updateBadge(i, 'color', e.target.value)} helperText="z.B. #E58E26" /></Grid>
              <Grid size={{ xs: 4, sm: 1 }}>
                <IconButton onClick={() => removeBadge(i)} title="Badge löschen"><DeleteIcon fontSize="small" color="error" /></IconButton>
              </Grid>
            </Grid>
          ))}
          <Button size="small" startIcon={<AddIcon />} onClick={addBadge}>Badge hinzufügen</Button>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Buchungskarte</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Text (oben)" fullWidth value={content.bookingButtonText} onChange={(e) => setContent({ ...content, bookingButtonText: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Link (oben)" fullWidth value={content.bookingButtonLink} onChange={(e) => setContent({ ...content, bookingButtonLink: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Preis-Bezeichnung" fullWidth value={content.priceLabel} onChange={(e) => setContent({ ...content, priceLabel: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Preis" fullWidth value={content.price} onChange={(e) => setContent({ ...content, price: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Voraussetzung-Text" fullWidth value={content.voraussetzungText} onChange={(e) => setContent({ ...content, voraussetzungText: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Text (unten)" fullWidth value={content.scheduleButtonText} onChange={(e) => setContent({ ...content, scheduleButtonText: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Link (unten)" fullWidth value={content.scheduleButtonLink} onChange={(e) => setContent({ ...content, scheduleButtonLink: e.target.value })} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Gutschein-Box</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 5 }}><TextField label="Überschrift" fullWidth value={content.gutscheinHeading} onChange={(e) => setContent({ ...content, gutscheinHeading: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 7 }}><TextField label="Beschreibung" fullWidth value={content.gutscheinDescription} onChange={(e) => setContent({ ...content, gutscheinDescription: e.target.value })} /></Grid>
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
