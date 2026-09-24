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
// the /reisen/pfalz-tour page (PfalzTour.tsx). The Impressionen gallery
// grid isn't part of this content - it's managed separately via
// Komponenten > Galerie. Kommentare (EventComments) aren't editable here
// either, they're a separate live comment thread keyed by the page slug.

interface Badge { label: string; color: string }
interface PfalzTourData {
  eyebrow: string;
  title: string;
  heroImage: string;
  heroImageAlt: string;
  introHeading: string;
  introParagraphsHtml: string;
  tourdatenHeading: string;
  tourdatenItems: string[];
  anreiseHeading: string;
  anreiseParagraph: string;
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

// A simple add/remove list of plain strings (Tourdaten, Leistungen) - the
// repeater pattern already used elsewhere in this codebase, just for
// `string[]` instead of `{title,link}[]`.
const StringListEditor = ({
  items,
  onChange,
  label,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  label: string;
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
          <Grid size={{ xs: 11 }}><TextField label={`${label} ${i + 1}`} fullWidth value={item} onChange={(e) => update(i, e.target.value)} /></Grid>
          <Grid size={{ xs: 1 }}>
            <IconButton onClick={() => remove(i)} title="Löschen">
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      <Button startIcon={<AddIcon />} onClick={add} sx={{ mt: 1 }}>Hinzufügen</Button>
    </>
  );
};

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
          <Grid size={{ xs: 12, sm: 7 }}><TextField label="Beschriftung" fullWidth value={badge.label} onChange={(e) => update(i, 'label', e.target.value)} /></Grid>
          <Grid size={{ xs: 10, sm: 4 }}><TextField label="Farbe" fullWidth value={badge.color} onChange={(e) => update(i, 'color', e.target.value)} helperText="z.B. #53a8c7" /></Grid>
          <Grid size={{ xs: 2, sm: 1 }}>
            <IconButton onClick={() => remove(i)} title="Löschen">
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      <Button startIcon={<AddIcon />} onClick={add} sx={{ mt: 1 }}>Badge hinzufügen</Button>
    </>
  );
};

export const PfalzTourContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'pfalz-tour';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<PfalzTourData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || (id === 'pfalz-tour' ? 'reisen/pfalz-tour' : id)}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/pfalz-tour', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/pfalz-tour-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/pfalz-tour', {
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

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">Pfalz-Tour - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte, Preise und Links der Seite /reisen/pfalz-tour - das Design/Layout bleibt exakt wie es ist. Die Bildergalerie wird separat über Komponenten &gt; Galerie verwaltet.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Einleitung</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Kleiner Titel (oben)" fullWidth value={content.eyebrow} onChange={(e) => setContent({ ...content, eyebrow: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 8 }}><TextField label="Überschrift" fullWidth value={content.title} onChange={(e) => setContent({ ...content, title: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Titelbild (URL)" fullWidth value={content.heroImage} onChange={(e) => setContent({ ...content, heroImage: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Titelbild Alt-Text" fullWidth value={content.heroImageAlt} onChange={(e) => setContent({ ...content, heroImageAlt: e.target.value })} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Fluggebiet</Typography>
          <TextField label="Überschrift" fullWidth value={content.introHeading} onChange={(e) => setContent({ ...content, introHeading: e.target.value })} sx={{ mb: 2 }} />
          <TextField
            label="Text (HTML erlaubt)"
            fullWidth
            multiline
            minRows={4}
            value={content.introParagraphsHtml}
            onChange={(e) => setContent({ ...content, introParagraphsHtml: e.target.value })}
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Tourdaten</Typography>
          <TextField label="Überschrift" fullWidth value={content.tourdatenHeading} onChange={(e) => setContent({ ...content, tourdatenHeading: e.target.value })} sx={{ mb: 2 }} />
          <StringListEditor label="Punkt" items={content.tourdatenItems} onChange={(tourdatenItems) => setContent({ ...content, tourdatenItems })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Anreise, Unterkunft und Verpflegung</Typography>
          <TextField label="Überschrift" fullWidth value={content.anreiseHeading} onChange={(e) => setContent({ ...content, anreiseHeading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Text" fullWidth multiline minRows={3} value={content.anreiseParagraph} onChange={(e) => setContent({ ...content, anreiseParagraph: e.target.value })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Unsere Leistungen</Typography>
          <TextField label="Überschrift" fullWidth value={content.leistungenHeading} onChange={(e) => setContent({ ...content, leistungenHeading: e.target.value })} sx={{ mb: 2 }} />
          <StringListEditor label="Leistung" items={content.leistungen} onChange={(leistungen) => setContent({ ...content, leistungen })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Badges (Sidebar)</Typography>
          <BadgesEditor badges={content.badges} onChange={(badges) => setContent({ ...content, badges })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Buchungs-Karte</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Text (oben)" fullWidth value={content.bookingButtonText} onChange={(e) => setContent({ ...content, bookingButtonText: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Link" fullWidth value={content.bookingButtonLink} onChange={(e) => setContent({ ...content, bookingButtonLink: e.target.value })} /></Grid>
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
          <Typography variant="h6" sx={{ mb: 2 }}>Gutschein-Hinweis</Typography>
          <TextField label="Überschrift" fullWidth value={content.gutscheinHeading} onChange={(e) => setContent({ ...content, gutscheinHeading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Beschreibung" fullWidth value={content.gutscheinDescription} onChange={(e) => setContent({ ...content, gutscheinDescription: e.target.value })} />
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
