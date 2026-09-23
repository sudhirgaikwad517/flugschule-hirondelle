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

// Same "data only, layout stays" idea as HomeContentEditor.tsx, for the
// /infos/gelaende OVERVIEW page (Gelaende.tsx) only - just the intro text,
// map, and the "Ortsschild" sign boxes (title + link each, freely
// addable/removable). The 10 individual detail pages
// (GelaendeDetail.tsx, /infos/gelaende/:slug) are NOT edited here - their
// `articles` data still lives in and round-trips through this same
// SitePageContent row (so it's never lost on save), it's just not shown or
// editable in this screen.

interface OrtsschildBox { title: string; link: string }
interface GelaendeArticle { slug: string; title: string; html: string }
interface GelaendeData {
  heading: string;
  introQuote: string;
  subheadingHtml: string;
  paragraph: string;
  mapEmbedUrl: string;
  schnupperkursLabel: string;
  schnupperkursBoxes: OrtsschildBox[];
  windeLabel: string;
  windeBoxes: OrtsschildBox[];
  articles: GelaendeArticle[];
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

// A labeled group of Ortsschild boxes (title + link, add/remove) - used
// twice below (Schnupper-/Grundkurs and Winde), so the repeater logic isn't
// duplicated.
const BoxesEditor = ({
  boxes,
  onChange,
}: {
  boxes: OrtsschildBox[];
  onChange: (next: OrtsschildBox[]) => void;
}) => {
  const update = (i: number, field: keyof OrtsschildBox, value: string) => {
    const next = [...boxes];
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  };
  const add = () => onChange([...boxes, { title: '', link: '' }]);
  const remove = (i: number) => onChange(boxes.filter((_, idx) => idx !== i));

  return (
    <>
      {boxes.map((box, i) => (
        <Grid container spacing={2} key={i} sx={{ mb: 1.5, alignItems: 'center' }}>
          <Grid size={{ xs: 12, sm: 5 }}><TextField label="Titel (auf dem Schild)" fullWidth value={box.title} onChange={(e) => update(i, 'title', e.target.value)} /></Grid>
          <Grid size={{ xs: 10, sm: 6 }}><TextField label="Link" fullWidth value={box.link} onChange={(e) => update(i, 'link', e.target.value)} helperText="z.B. /infos/gelaende/billings" /></Grid>
          <Grid size={{ xs: 2, sm: 1 }}>
            <IconButton onClick={() => remove(i)} title="Box löschen">
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      <Button startIcon={<AddIcon />} onClick={add} sx={{ mt: 1 }}>Box hinzufügen</Button>
    </>
  );
};

export const GelaendeContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'gelaende';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<GelaendeData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || (id === 'gelaende' ? 'infos/gelaende' : id)}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/gelaende', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/gelaende-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/gelaende', {
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
        <Typography variant="h5">Fluggelände - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Texte der Übersichtsseite /infos/gelaende - das Design/Layout bleibt exakt wie es ist.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Übersicht (Text oben auf der Seite)</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}><TextField label="Überschrift" fullWidth value={content.heading} onChange={(e) => setContent({ ...content, heading: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Zitat (kursiv, oben)" fullWidth value={content.introQuote} onChange={(e) => setContent({ ...content, introQuote: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Unterüberschrift (HTML erlaubt)" fullWidth multiline minRows={2} value={content.subheadingHtml} onChange={(e) => setContent({ ...content, subheadingHtml: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Absatz" fullWidth multiline minRows={2} value={content.paragraph} onChange={(e) => setContent({ ...content, paragraph: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Google Maps Embed-URL"
                fullWidth
                value={content.mapEmbedUrl}
                onChange={(e) => setContent({ ...content, mapEmbedUrl: e.target.value })}
                helperText='Bei Google Maps auf "Teilen" > "Karte einbetten" klicken und nur die URL aus dem src="..." des angezeigten Codes hier einfügen.'
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Schnupper-/Grundkurs (gelbe Schilder)</Typography>
          <TextField
            label="Abschnitts-Label"
            fullWidth
            value={content.schnupperkursLabel}
            onChange={(e) => setContent({ ...content, schnupperkursLabel: e.target.value })}
            sx={{ mb: 2 }}
          />
          <BoxesEditor boxes={content.schnupperkursBoxes} onChange={(schnupperkursBoxes) => setContent({ ...content, schnupperkursBoxes })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Winde (gelbe Schilder)</Typography>
          <TextField
            label="Abschnitts-Label"
            fullWidth
            value={content.windeLabel}
            onChange={(e) => setContent({ ...content, windeLabel: e.target.value })}
            sx={{ mb: 2 }}
          />
          <BoxesEditor boxes={content.windeBoxes} onChange={(windeBoxes) => setContent({ ...content, windeBoxes })} />
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
