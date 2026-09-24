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
// /ausbildung/schnupperkurs page (Schnupperkurs.tsx). The "Impressionen"
// gallery grid isn't part of this content - it's managed separately via
// Komponenten > Galerie.

interface PriceRow { label: string; price: string }
interface SchnupperkursData {
  eyebrow: string;
  title: string;
  heroImage: string;
  heroImageAlt: string;
  block1Heading: string;
  block1Text: string;
  block2Heading: string;
  block2Text: string;
  block3Heading: string;
  block3Html: string;
  block4Heading: string;
  block4Html: string;
  bookingButtonText: string;
  bookingButtonLink: string;
  priceHeading: string;
  priceRows: PriceRow[];
  scheduleButtonText: string;
  scheduleButtonLink: string;
  gutscheinHeading: string;
  gutscheinDescription: string;
  leistungenHeading: string;
  leistungen: string[];
  checklisteHeading: string;
  checkliste: string[];
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

// A labeled add/remove list of plain bullet strings - used for both
// "Leistungen" and "Checkliste" below, so the repeater logic isn't
// duplicated.
const StringListEditor = ({
  items,
  onChange,
}: {
  items: string[];
  onChange: (next: string[]) => void;
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
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <TextField label={`Punkt ${i + 1}`} fullWidth value={item} onChange={(e) => update(i, e.target.value)} />
          <IconButton onClick={() => remove(i)} title="Punkt löschen">
            <DeleteIcon fontSize="small" color="error" />
          </IconButton>
        </Box>
      ))}
      <Button startIcon={<AddIcon />} onClick={add} sx={{ mt: 0.5 }}>Punkt hinzufügen</Button>
    </>
  );
};

export const SchnupperkursContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'schnupperkurs';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<SchnupperkursData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || (id === 'schnupperkurs' ? 'ausbildung/schnupperkurs' : id)}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/schnupperkurs', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/schnupperkurs-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/schnupperkurs', {
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
    setContent({ ...content, priceRows: [...content.priceRows, { label: '', price: '' }] });
  };

  const removePriceRow = (i: number) => {
    setContent({ ...content, priceRows: content.priceRows.filter((_, idx) => idx !== i) });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">Schnupperkurs - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte, Preise und Links der Seite /ausbildung/schnupperkurs - das Design/Layout bleibt exakt wie es ist. Die Bildergalerie (Impressionen) wird separat über Komponenten &gt; Galerie verwaltet.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Einleitung</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Kleiner Titel (oben)" fullWidth value={content.eyebrow} onChange={(e) => setContent({ ...content, eyebrow: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 8 }}><TextField label="Überschrift" fullWidth value={content.title} onChange={(e) => setContent({ ...content, title: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Bild-URL" fullWidth value={content.heroImage} onChange={(e) => setContent({ ...content, heroImage: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Bild Alt-Text" fullWidth value={content.heroImageAlt} onChange={(e) => setContent({ ...content, heroImageAlt: e.target.value })} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Textblöcke</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12 }}><TextField label="Überschrift 1" fullWidth value={content.block1Heading} onChange={(e) => setContent({ ...content, block1Heading: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Text 1" fullWidth multiline minRows={3} value={content.block1Text} onChange={(e) => setContent({ ...content, block1Text: e.target.value })} /></Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12 }}><TextField label="Überschrift 2" fullWidth value={content.block2Heading} onChange={(e) => setContent({ ...content, block2Heading: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Text 2" fullWidth multiline minRows={3} value={content.block2Text} onChange={(e) => setContent({ ...content, block2Text: e.target.value })} /></Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12 }}><TextField label="Überschrift 3" fullWidth value={content.block3Heading} onChange={(e) => setContent({ ...content, block3Heading: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Text 3 (HTML erlaubt)" fullWidth multiline minRows={3} value={content.block3Html} onChange={(e) => setContent({ ...content, block3Html: e.target.value })} /></Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}><TextField label="Überschrift 4" fullWidth value={content.block4Heading} onChange={(e) => setContent({ ...content, block4Heading: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Text 4 (HTML erlaubt)" fullWidth multiline minRows={3} value={content.block4Html} onChange={(e) => setContent({ ...content, block4Html: e.target.value })} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Buchungs-Karte</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Text (oben)" fullWidth value={content.bookingButtonText} onChange={(e) => setContent({ ...content, bookingButtonText: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Link (oben)" fullWidth value={content.bookingButtonLink} onChange={(e) => setContent({ ...content, bookingButtonLink: e.target.value })} /></Grid>
          </Grid>
          <TextField label="Preis-Abschnitt Überschrift" fullWidth value={content.priceHeading} onChange={(e) => setContent({ ...content, priceHeading: e.target.value })} sx={{ mb: 2 }} />
          {content.priceRows.map((row, i) => (
            <Grid container spacing={2} key={i} sx={{ mb: 2, alignItems: 'flex-start' }}>
              <Grid size={{ xs: 12, sm: 7 }}>
                <TextField
                  label="Beschreibung"
                  fullWidth
                  multiline
                  minRows={2}
                  value={row.label}
                  onChange={(e) => updatePriceRow(i, 'label', e.target.value)}
                  helperText="Leerzeile/Zeilenumbruch = neue Zeile in der Anzeige"
                />
              </Grid>
              <Grid size={{ xs: 10, sm: 4 }}><TextField label="Preis" fullWidth value={row.price} onChange={(e) => updatePriceRow(i, 'price', e.target.value)} /></Grid>
              <Grid size={{ xs: 2, sm: 1 }}>
                <IconButton onClick={() => removePriceRow(i)} title="Zeile löschen">
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button startIcon={<AddIcon />} onClick={addPriceRow} sx={{ mt: 1, mb: 2 }}>Preiszeile hinzufügen</Button>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Text (unten)" fullWidth value={content.scheduleButtonText} onChange={(e) => setContent({ ...content, scheduleButtonText: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Link (unten)" fullWidth value={content.scheduleButtonLink} onChange={(e) => setContent({ ...content, scheduleButtonLink: e.target.value })} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Gutschein-Box</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Überschrift" fullWidth value={content.gutscheinHeading} onChange={(e) => setContent({ ...content, gutscheinHeading: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Beschreibung" fullWidth value={content.gutscheinDescription} onChange={(e) => setContent({ ...content, gutscheinDescription: e.target.value })} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>{content.leistungenHeading || 'Unsere Leistungen'}</Typography>
          <TextField label="Überschrift" fullWidth value={content.leistungenHeading} onChange={(e) => setContent({ ...content, leistungenHeading: e.target.value })} sx={{ mb: 2 }} />
          <StringListEditor items={content.leistungen} onChange={(leistungen) => setContent({ ...content, leistungen })} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>{content.checklisteHeading || 'Deine Checkliste'}</Typography>
          <TextField label="Überschrift" fullWidth value={content.checklisteHeading} onChange={(e) => setContent({ ...content, checklisteHeading: e.target.value })} sx={{ mb: 2 }} />
          <StringListEditor items={content.checkliste} onChange={(checkliste) => setContent({ ...content, checkliste })} />
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
