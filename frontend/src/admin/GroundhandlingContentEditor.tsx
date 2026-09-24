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
// /performance/groundhandling page (Groundhandling.tsx). The IMPRESSIONEN
// gallery grid isn't part of this content - it's managed separately via
// Komponenten > Galerie.

interface GroundhandlingData {
  eyebrow: string;
  heading: string;
  videoUrl: string;
  videoTitle: string;
  paragraph1: string;
  paragraph2: string;
  leistungen: string[];
  checkliste: string[];
  bookingBadge: string;
  priceLabel: string;
  priceNote: string;
  price: string;
  priceDuration: string;
  bookingButtonText: string;
  bookingButtonLink: string;
  gutscheinHeading: string;
  gutscheinDescription: string;
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

// A labeled repeater of plain bullet strings (Leistungen/Checkliste) - used
// twice below, so the add/remove logic isn't duplicated.
const StringListEditor = ({
  items,
  onChange,
  addLabel,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  addLabel: string;
}) => {
  const update = (i: number, value: string) => {
    const next = [...items];
    next[i] = value;
    onChange(next);
  };
  const add = () => onChange([...items, '']);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <>
      {items.map((item, i) => (
        <Grid container spacing={1} key={i} sx={{ mb: 1, alignItems: 'center' }}>
          <Grid size={{ xs: 11 }}><TextField label={`Punkt ${i + 1}`} fullWidth size="small" value={item} onChange={(e) => update(i, e.target.value)} /></Grid>
          <Grid size={{ xs: 1 }}>
            <IconButton size="small" onClick={() => remove(i)} title="Punkt löschen">
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      <Button startIcon={<AddIcon />} size="small" onClick={add} sx={{ mt: 0.5 }}>{addLabel}</Button>
    </>
  );
};

export const GroundhandlingContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'groundhandling';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<GroundhandlingData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || (id === 'groundhandling' ? 'performance/groundhandling' : id)}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/groundhandling', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/groundhandling-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/groundhandling', {
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

  const set = <K extends keyof GroundhandlingData>(field: K) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setContent({ ...content, [field]: e.target.value });

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">Groundhandling - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte der Seite /performance/groundhandling - das Design/Layout bleibt exakt wie es ist. Die Bildergalerie wird separat über Komponenten &gt; Galerie verwaltet.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Einleitung</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Kleiner Titel (oben)" fullWidth value={content.eyebrow} onChange={set('eyebrow')} /></Grid>
            <Grid size={{ xs: 12, sm: 8 }}><TextField label="Überschrift" fullWidth value={content.heading} onChange={set('heading')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Video-URL (YouTube-Embed)" fullWidth value={content.videoUrl} onChange={set('videoUrl')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Video-Titel" fullWidth value={content.videoTitle} onChange={set('videoTitle')} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Absatz 1" fullWidth multiline minRows={3} value={content.paragraph1} onChange={set('paragraph1')} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Absatz 2" fullWidth multiline minRows={3} value={content.paragraph2} onChange={set('paragraph2')} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Unsere Leistungen</Typography>
              <StringListEditor items={content.leistungen} onChange={(leistungen) => setContent({ ...content, leistungen })} addLabel="Punkt hinzufügen" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Deine Checkliste</Typography>
              <StringListEditor items={content.checkliste} onChange={(checkliste) => setContent({ ...content, checkliste })} addLabel="Punkt hinzufügen" />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Buchungs-Karte</Typography>
          <TextField label="Badge (blauer Balken oben)" fullWidth value={content.bookingBadge} onChange={set('bookingBadge')} sx={{ mb: 2 }} />
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Preis-Bezeichnung" fullWidth value={content.priceLabel} onChange={set('priceLabel')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Preis-Hinweis (kursiv)" fullWidth value={content.priceNote} onChange={set('priceNote')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Preis" fullWidth value={content.price} onChange={set('price')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Dauer" fullWidth value={content.priceDuration} onChange={set('priceDuration')} /></Grid>
          </Grid>
          <TextField
            label="Button-Text (Zeilenumbruch mit Enter)"
            fullWidth
            multiline
            minRows={2}
            value={content.bookingButtonText}
            onChange={set('bookingButtonText')}
            sx={{ mb: 2 }}
          />
          <TextField label="Button-Link" fullWidth value={content.bookingButtonLink} onChange={set('bookingButtonLink')} sx={{ mb: 2 }} />
          <TextField label="Gutschein - Überschrift" fullWidth value={content.gutscheinHeading} onChange={set('gutscheinHeading')} sx={{ mb: 2 }} />
          <TextField label="Gutschein - Beschreibung" fullWidth multiline minRows={2} value={content.gutscheinDescription} onChange={set('gutscheinDescription')} />
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
