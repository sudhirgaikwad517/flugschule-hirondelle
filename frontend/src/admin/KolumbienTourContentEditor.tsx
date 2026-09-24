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

// Same "data only, layout stays" idea as TeamContentEditor.tsx, for the
// /reisen/kolumbien-tour page (KolumbienTour.tsx). The IMPRESSIONEN gallery
// grid isn't part of this content - it's managed separately via
// Komponenten > Galerie.

interface Station { icon: string; heading: string; text: string }
interface Badge { label: string; color: string }
interface KolumbienTourData {
  eyebrow: string;
  title: string;
  heroImage: string;
  heroAlt: string;
  block1Heading: string;
  block1Paragraph1: string;
  block1Paragraph2: string;
  block2Heading: string;
  block2Intro: string;
  block2Paragraph: string;
  block2Stations: Station[];
  block3Heading: string;
  block3Paragraph1: string;
  block3Paragraph2: string;
  block4Heading: string;
  block4Paragraph1: string;
  block4Paragraph2: string;
  leistungenHeading: string;
  leistungen: string[];
  badges: Badge[];
  bookingButtonText: string;
  bookingButtonLink: string;
  priceLabel: string;
  price: string;
  priceNote: string;
  scheduleButtonText: string;
  scheduleButtonLink: string;
  gutscheinHeading: string;
  gutscheinDescription: string;
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

export const KolumbienTourContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'kolumbien-tour';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<KolumbienTourData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || (id === 'kolumbien-tour' ? 'reisen/kolumbien-tour' : id)}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/kolumbien-tour', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/kolumbien-tour-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/kolumbien-tour', {
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

  const updateStation = (i: number, field: keyof Station, value: string) => {
    const block2Stations = [...content.block2Stations];
    block2Stations[i] = { ...block2Stations[i], [field]: value };
    setContent({ ...content, block2Stations });
  };
  const addStation = () => setContent({ ...content, block2Stations: [...content.block2Stations, { icon: '📍', heading: '', text: '' }] });
  const removeStation = (i: number) => setContent({ ...content, block2Stations: content.block2Stations.filter((_, idx) => idx !== i) });

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
        <Typography variant="h5">Kolumbien-Tour - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte und Preise der Seite /reisen/kolumbien-tour - das Design/Layout bleibt exakt wie es ist. Die Bildergalerie wird separat über Komponenten &gt; Galerie verwaltet.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Einleitung</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Kleiner Titel (oben)" fullWidth value={content.eyebrow} onChange={(e) => setContent({ ...content, eyebrow: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 8 }}><TextField label="Überschrift" fullWidth value={content.title} onChange={(e) => setContent({ ...content, title: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 8 }}><TextField label="Titelbild-URL" fullWidth value={content.heroImage} onChange={(e) => setContent({ ...content, heroImage: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Titelbild Alt-Text" fullWidth value={content.heroAlt} onChange={(e) => setContent({ ...content, heroAlt: e.target.value })} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Abschnitt 1</Typography>
          <TextField label="Überschrift" fullWidth value={content.block1Heading} onChange={(e) => setContent({ ...content, block1Heading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 1" fullWidth multiline minRows={2} value={content.block1Paragraph1} onChange={(e) => setContent({ ...content, block1Paragraph1: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 2" fullWidth multiline minRows={2} value={content.block1Paragraph2} onChange={(e) => setContent({ ...content, block1Paragraph2: e.target.value })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Fluggebiete</Typography>
          <TextField label="Überschrift" fullWidth value={content.block2Heading} onChange={(e) => setContent({ ...content, block2Heading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Zwischenüberschrift (klein, farbig)" fullWidth value={content.block2Intro} onChange={(e) => setContent({ ...content, block2Intro: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz" fullWidth multiline minRows={3} value={content.block2Paragraph} onChange={(e) => setContent({ ...content, block2Paragraph: e.target.value })} sx={{ mb: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 2, color: '#666' }}>Stationen</Typography>
          {content.block2Stations.map((station, i) => (
            <Box key={i} sx={{ mb: 2, pb: 2, borderBottom: i < content.block2Stations.length - 1 ? '1px solid #eee' : 'none' }}>
              <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, sm: 2 }}><TextField label="Icon (Emoji)" fullWidth value={station.icon} onChange={(e) => updateStation(i, 'icon', e.target.value)} /></Grid>
                <Grid size={{ xs: 12, sm: 8 }}><TextField label="Überschrift" fullWidth value={station.heading} onChange={(e) => updateStation(i, 'heading', e.target.value)} /></Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <IconButton onClick={() => removeStation(i)} title="Station löschen">
                    <DeleteIcon fontSize="small" color="error" />
                  </IconButton>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField label="Text" fullWidth multiline minRows={2} value={station.text} onChange={(e) => updateStation(i, 'text', e.target.value)} />
                </Grid>
              </Grid>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} onClick={addStation}>Station hinzufügen</Button>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Für wen ist die Reise gedacht?</Typography>
          <TextField label="Überschrift" fullWidth value={content.block3Heading} onChange={(e) => setContent({ ...content, block3Heading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 1" fullWidth multiline minRows={2} value={content.block3Paragraph1} onChange={(e) => setContent({ ...content, block3Paragraph1: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 2" fullWidth multiline minRows={2} value={content.block3Paragraph2} onChange={(e) => setContent({ ...content, block3Paragraph2: e.target.value })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Anreise, Unterkunft und Verpflegung</Typography>
          <TextField label="Überschrift" fullWidth value={content.block4Heading} onChange={(e) => setContent({ ...content, block4Heading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 1" fullWidth multiline minRows={2} value={content.block4Paragraph1} onChange={(e) => setContent({ ...content, block4Paragraph1: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 2" fullWidth multiline minRows={2} value={content.block4Paragraph2} onChange={(e) => setContent({ ...content, block4Paragraph2: e.target.value })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Unsere Leistungen</Typography>
          <TextField label="Überschrift" fullWidth value={content.leistungenHeading} onChange={(e) => setContent({ ...content, leistungenHeading: e.target.value })} sx={{ mb: 2 }} />
          {content.leistungen.map((item, i) => (
            <Grid container spacing={2} key={i} sx={{ mb: 1.5, alignItems: 'center' }}>
              <Grid size={{ xs: 10 }}><TextField label={`Leistung ${i + 1}`} fullWidth value={item} onChange={(e) => updateLeistung(i, e.target.value)} /></Grid>
              <Grid size={{ xs: 2 }}>
                <IconButton onClick={() => removeLeistung(i)} title="Leistung löschen">
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button startIcon={<AddIcon />} onClick={addLeistung}>Leistung hinzufügen</Button>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Badges (farbige Balken in der Seitenleiste)</Typography>
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
          <Button startIcon={<AddIcon />} onClick={addBadge}>Badge hinzufügen</Button>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Buchungs-Karte</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Text (oben)" fullWidth value={content.bookingButtonText} onChange={(e) => setContent({ ...content, bookingButtonText: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Link (oben)" fullWidth value={content.bookingButtonLink} onChange={(e) => setContent({ ...content, bookingButtonLink: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Preis-Bezeichnung" fullWidth value={content.priceLabel} onChange={(e) => setContent({ ...content, priceLabel: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Preis" fullWidth value={content.price} onChange={(e) => setContent({ ...content, price: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Voraussetzungs-Hinweis" fullWidth value={content.priceNote} onChange={(e) => setContent({ ...content, priceNote: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Text (unten, Termine)" fullWidth value={content.scheduleButtonText} onChange={(e) => setContent({ ...content, scheduleButtonText: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Link (unten, Termine)" fullWidth value={content.scheduleButtonLink} onChange={(e) => setContent({ ...content, scheduleButtonLink: e.target.value })} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Gutschein-Hinweis</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Überschrift" fullWidth value={content.gutscheinHeading} onChange={(e) => setContent({ ...content, gutscheinHeading: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 8 }}><TextField label="Beschreibung" fullWidth value={content.gutscheinDescription} onChange={(e) => setContent({ ...content, gutscheinDescription: e.target.value })} /></Grid>
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
