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
// /performance/rettungsgeraetetraining page (Rettungsgeraetetraining.tsx).
// The IMPRESSIONEN gallery grid isn't part of this content - it's managed
// separately via Komponenten > Galerie.

interface PriceRow { label: string; price: string }
interface RettungsgeraetetrainingData {
  eyebrow: string;
  heading: string;
  videoUrl: string;
  videoTitle: string;
  section1Heading: string;
  section1Paragraph: string;
  section2Heading: string;
  section2Paragraph1: string;
  section2Paragraph2: string;
  section2Paragraph3: string;
  section2Paragraph4: string;
  bookingBadge: string;
  bookingButtonLink: string;
  bookingButtonText: string;
  priceRows: PriceRow[];
  scheduleButtonLink: string;
  scheduleButtonText: string;
  gutscheinHeading: string;
  gutscheinDescription: string;
  leistungen: string[];
  checkliste: string[];
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

// A simple add/remove list of plain strings (Leistungen/Checkliste) - used
// twice below, so the repeater logic isn't duplicated.
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
          <Grid size={{ xs: 11 }}><TextField label={`Punkt ${i + 1}`} fullWidth value={item} onChange={(e) => update(i, e.target.value)} /></Grid>
          <Grid size={{ xs: 1 }}>
            <IconButton onClick={() => remove(i)} title="Punkt löschen">
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      <Button startIcon={<AddIcon />} onClick={add} sx={{ mt: 1 }}>{addLabel}</Button>
    </>
  );
};

export const RettungsgeraetetrainingContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'rettungsgeraetetraining';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<RettungsgeraetetrainingData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || (id === 'rettungsgeraetetraining' ? 'performance/rettungsgeraetetraining' : id)}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/rettungsgeraetetraining', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/rettungsgeraetetraining-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/rettungsgeraetetraining', {
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
  const addPriceRow = () => setContent({ ...content, priceRows: [...content.priceRows, { label: '', price: '' }] });
  const removePriceRow = (i: number) => setContent({ ...content, priceRows: content.priceRows.filter((_, idx) => idx !== i) });

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">Rettungsgerätetraining - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte und Preise der Seite /performance/rettungsgeraetetraining - das Design/Layout bleibt exakt wie es ist. Die Bildergalerie wird separat über Komponenten &gt; Galerie verwaltet.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Einleitung</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Kleiner Titel (oben)" fullWidth value={content.eyebrow} onChange={(e) => setContent({ ...content, eyebrow: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 8 }}><TextField label="Überschrift" fullWidth value={content.heading} onChange={(e) => setContent({ ...content, heading: e.target.value })} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Video</Typography>
          <TextField label="Video Embed-URL" fullWidth value={content.videoUrl} onChange={(e) => setContent({ ...content, videoUrl: e.target.value })} sx={{ mb: 2 }} helperText="YouTube Embed-URL, z.B. https://www.youtube-nocookie.com/embed/..." />
          <TextField label="Video-Titel (für Barrierefreiheit)" fullWidth value={content.videoTitle} onChange={(e) => setContent({ ...content, videoTitle: e.target.value })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Textabschnitte</Typography>
          <TextField label="Überschrift 1" fullWidth value={content.section1Heading} onChange={(e) => setContent({ ...content, section1Heading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 1" fullWidth multiline minRows={3} value={content.section1Paragraph} onChange={(e) => setContent({ ...content, section1Paragraph: e.target.value })} sx={{ mb: 3 }} />
          <TextField label="Überschrift 2" fullWidth value={content.section2Heading} onChange={(e) => setContent({ ...content, section2Heading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 2.1" fullWidth multiline minRows={3} value={content.section2Paragraph1} onChange={(e) => setContent({ ...content, section2Paragraph1: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 2.2" fullWidth multiline minRows={3} value={content.section2Paragraph2} onChange={(e) => setContent({ ...content, section2Paragraph2: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 2.3" fullWidth multiline minRows={3} value={content.section2Paragraph3} onChange={(e) => setContent({ ...content, section2Paragraph3: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 2.4" fullWidth multiline minRows={3} value={content.section2Paragraph4} onChange={(e) => setContent({ ...content, section2Paragraph4: e.target.value })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Buchungskarte</Typography>
          <TextField label="Badge-Text (blaues Band)" fullWidth value={content.bookingBadge} onChange={(e) => setContent({ ...content, bookingBadge: e.target.value })} sx={{ mb: 2 }} />
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label='Button-Text ("Kurs buchen")' fullWidth value={content.bookingButtonText} onChange={(e) => setContent({ ...content, bookingButtonText: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Link" fullWidth value={content.bookingButtonLink} onChange={(e) => setContent({ ...content, bookingButtonLink: e.target.value })} /></Grid>
          </Grid>
          <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>Preise</Typography>
          {content.priceRows.map((row, i) => (
            <Grid container spacing={2} key={i} sx={{ mb: 2, alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Bezeichnung" fullWidth value={row.label} onChange={(e) => updatePriceRow(i, 'label', e.target.value)} /></Grid>
              <Grid size={{ xs: 10, sm: 5 }}><TextField label="Preis" fullWidth value={row.price} onChange={(e) => updatePriceRow(i, 'price', e.target.value)} /></Grid>
              <Grid size={{ xs: 2, sm: 1 }}>
                <IconButton onClick={() => removePriceRow(i)} title="Zeile löschen">
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button startIcon={<AddIcon />} onClick={addPriceRow} sx={{ mb: 2 }}>Preiszeile hinzufügen</Button>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label='Button-Text ("Termine")' fullWidth value={content.scheduleButtonText} onChange={(e) => setContent({ ...content, scheduleButtonText: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Link" fullWidth value={content.scheduleButtonLink} onChange={(e) => setContent({ ...content, scheduleButtonLink: e.target.value })} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Gutschein-Box</Typography>
          <TextField label="Überschrift" fullWidth value={content.gutscheinHeading} onChange={(e) => setContent({ ...content, gutscheinHeading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Beschreibung" fullWidth value={content.gutscheinDescription} onChange={(e) => setContent({ ...content, gutscheinDescription: e.target.value })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Unsere Leistungen</Typography>
          <StringListEditor items={content.leistungen} onChange={(leistungen) => setContent({ ...content, leistungen })} addLabel="Leistung hinzufügen" />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Deine Checkliste</Typography>
          <StringListEditor items={content.checkliste} onChange={(checkliste) => setContent({ ...content, checkliste })} addLabel="Punkt hinzufügen" />
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
