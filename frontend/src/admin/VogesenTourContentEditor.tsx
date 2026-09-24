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
// /reisen/vogesen-tour page (VogesenTour.tsx). No gallery on this page, so
// no "Komponenten > Galerie" note needed here.

interface Badge { label: string; color: string }
interface VogesenTourData {
  eyebrow: string;
  heading: string;
  heroImage: string;
  heroImageAlt: string;
  introParagraph1: string;
  introParagraph2: string;
  block1Heading: string;
  block1Paragraph: string;
  block2Heading: string;
  block2Paragraph: string;
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

// A labeled repeater of plain bullet strings (Leistungen) - mirrors the
// StringListEditor pattern already used elsewhere (e.g.
// GroundhandlingContentEditor.tsx).
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

// A repeater of colored sidebar badges ({ label, color }) - the tour pages'
// "Streckenflugtraining"/"Soaringtraining"/... strip.
const BadgesEditor = ({
  badges,
  onChange,
}: {
  badges: Badge[];
  onChange: (next: Badge[]) => void;
}) => {
  const update = (i: number, field: keyof Badge, value: string) => {
    const next = [...badges];
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  };
  const add = () => onChange([...badges, { label: '', color: '#53a8c7' }]);
  const remove = (i: number) => onChange(badges.filter((_, idx) => idx !== i));

  return (
    <>
      {badges.map((badge, i) => (
        <Grid container spacing={2} key={i} sx={{ mb: 1.5, alignItems: 'center' }}>
          <Grid size={{ xs: 12, sm: 7 }}><TextField label="Text" fullWidth size="small" value={badge.label} onChange={(e) => update(i, 'label', e.target.value)} /></Grid>
          <Grid size={{ xs: 10, sm: 4 }}><TextField label="Farbe (Hex)" fullWidth size="small" value={badge.color} onChange={(e) => update(i, 'color', e.target.value)} helperText="z.B. #E58E26" /></Grid>
          <Grid size={{ xs: 2, sm: 1 }}>
            <IconButton size="small" onClick={() => remove(i)} title="Badge löschen">
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      <Button startIcon={<AddIcon />} size="small" onClick={add} sx={{ mt: 0.5 }}>Badge hinzufügen</Button>
    </>
  );
};

export const VogesenTourContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'vogesen-tour';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<VogesenTourData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || (id === 'vogesen-tour' ? 'reisen/vogesen-tour' : id)}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/vogesen-tour', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/vogesen-tour-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/vogesen-tour', {
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

  const set = <K extends keyof VogesenTourData>(field: K) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setContent({ ...content, [field]: e.target.value });

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">Vogesen-Tour - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte und Bilder der Seite /reisen/vogesen-tour - das Design/Layout bleibt exakt wie es ist.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Einleitung</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Kleiner Titel (oben)" fullWidth value={content.eyebrow} onChange={set('eyebrow')} /></Grid>
            <Grid size={{ xs: 12, sm: 8 }}><TextField label="Überschrift" fullWidth value={content.heading} onChange={set('heading')} /></Grid>
            <Grid size={{ xs: 12, sm: 8 }}><TextField label="Titelbild (URL)" fullWidth value={content.heroImage} onChange={set('heroImage')} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Titelbild - Alt-Text" fullWidth value={content.heroImageAlt} onChange={set('heroImageAlt')} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Absatz 1" fullWidth multiline minRows={2} value={content.introParagraph1} onChange={set('introParagraph1')} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Absatz 2" fullWidth multiline minRows={2} value={content.introParagraph2} onChange={set('introParagraph2')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Überschrift" fullWidth value={content.block1Heading} onChange={set('block1Heading')} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Absatz" fullWidth multiline minRows={2} value={content.block1Paragraph} onChange={set('block1Paragraph')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Überschrift" fullWidth value={content.block2Heading} onChange={set('block2Heading')} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Absatz" fullWidth multiline minRows={2} value={content.block2Paragraph} onChange={set('block2Paragraph')} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField label="Überschrift" fullWidth value={content.leistungenHeading} onChange={set('leistungenHeading')} sx={{ mb: 2 }} />
          <StringListEditor items={content.leistungen} onChange={(leistungen) => setContent({ ...content, leistungen })} addLabel="Punkt hinzufügen" />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Badges (farbige Leiste in der Seitenleiste)</Typography>
          <BadgesEditor badges={content.badges} onChange={(badges) => setContent({ ...content, badges })} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Buchungs-Karte</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Text (oben)" fullWidth value={content.bookingButtonText} onChange={set('bookingButtonText')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Link (oben)" fullWidth value={content.bookingButtonLink} onChange={set('bookingButtonLink')} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Preis-Bezeichnung" fullWidth value={content.priceLabel} onChange={set('priceLabel')} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Preis" fullWidth value={content.price} onChange={set('price')} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Hinweis (Voraussetzung)" fullWidth value={content.priceNote} onChange={set('priceNote')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Text (unten)" fullWidth value={content.scheduleButtonText} onChange={set('scheduleButtonText')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Link (unten)" fullWidth value={content.scheduleButtonLink} onChange={set('scheduleButtonLink')} /></Grid>
          </Grid>
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
