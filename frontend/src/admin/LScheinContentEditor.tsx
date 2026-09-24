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
// the /ausbildung/l-schein page (LSchein.tsx). The IMPRESSIONEN gallery
// grid isn't part of this content - it's managed separately via
// Komponenten > Galerie.

interface ContentBlock { heading: string; html: string }
interface PriceRow { title: string; subtitle: string; price: string }
interface LScheinData {
  eyebrow: string;
  heading: string;
  videoUrl: string;
  videoTitle: string;
  contentBlocks: ContentBlock[];
  bookingLink: string;
  priceRows: PriceRow[];
  priceFootnoteHtml: string;
  scheduleLink: string;
  gutscheinHeading: string;
  gutscheinDescription: string;
  leistungen: string[];
  checkliste: string[];
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

// A simple string[] repeater (add/remove) - used for Leistungen/Checkliste.
const StringListEditor = ({ items, onChange, itemLabel }: { items: string[]; onChange: (next: string[]) => void; itemLabel: string }) => {
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
          <Grid size={{ xs: 11 }}><TextField label={`${itemLabel} ${i + 1}`} fullWidth value={item} onChange={(e) => update(i, e.target.value)} /></Grid>
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

export const LScheinContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'l-schein';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<LScheinData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || (id === 'l-schein' ? 'ausbildung/l-schein' : id)}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/l-schein', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/l-schein-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/l-schein', {
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

  const updateBlock = (i: number, field: keyof ContentBlock, value: string) => {
    const contentBlocks = [...content.contentBlocks];
    contentBlocks[i] = { ...contentBlocks[i], [field]: value };
    setContent({ ...content, contentBlocks });
  };
  const addBlock = () => setContent({ ...content, contentBlocks: [...content.contentBlocks, { heading: '', html: '' }] });
  const removeBlock = (i: number) => setContent({ ...content, contentBlocks: content.contentBlocks.filter((_, idx) => idx !== i) });

  const updatePriceRow = (i: number, field: keyof PriceRow, value: string) => {
    const priceRows = [...content.priceRows];
    priceRows[i] = { ...priceRows[i], [field]: value };
    setContent({ ...content, priceRows });
  };
  const addPriceRow = () => setContent({ ...content, priceRows: [...content.priceRows, { title: '', subtitle: '', price: '' }] });
  const removePriceRow = (i: number) => setContent({ ...content, priceRows: content.priceRows.filter((_, idx) => idx !== i) });

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">L-Schein - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte und Links der Seite /ausbildung/l-schein - das Design/Layout bleibt exakt wie es ist. Die Bildergalerie wird separat über Komponenten &gt; Galerie verwaltet.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Einleitung</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Kleiner Titel (oben)" fullWidth value={content.eyebrow} onChange={(e) => setContent({ ...content, eyebrow: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 8 }}><TextField label="Überschrift" fullWidth value={content.heading} onChange={(e) => setContent({ ...content, heading: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 8 }}><TextField label="Video-URL (YouTube Embed)" fullWidth value={content.videoUrl} onChange={(e) => setContent({ ...content, videoUrl: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Video-Titel" fullWidth value={content.videoTitle} onChange={(e) => setContent({ ...content, videoTitle: e.target.value })} /></Grid>
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
                <IconButton onClick={() => removeBlock(i)} title="Abschnitt löschen">
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Box>
              <TextField label="Überschrift" fullWidth value={block.heading} onChange={(e) => updateBlock(i, 'heading', e.target.value)} sx={{ mb: 2 }} />
              <TextField
                label="Text (HTML erlaubt)"
                fullWidth
                multiline
                minRows={3}
                value={block.html}
                onChange={(e) => updateBlock(i, 'html', e.target.value)}
              />
            </Box>
          ))}
          <Button startIcon={<AddIcon />} onClick={addBlock}>Abschnitt hinzufügen</Button>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Buchungskarte</Typography>
          <TextField label="Link 'Kurs buchen'" fullWidth value={content.bookingLink} onChange={(e) => setContent({ ...content, bookingLink: e.target.value })} sx={{ mb: 2 }} />
          {content.priceRows.map((row, i) => (
            <Grid container spacing={2} key={i} sx={{ mb: 2, alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 4 }}><TextField label="Titel" fullWidth value={row.title} onChange={(e) => updatePriceRow(i, 'title', e.target.value)} /></Grid>
              <Grid size={{ xs: 12, sm: 5 }}><TextField label="Zusatztext (optional)" fullWidth value={row.subtitle} onChange={(e) => updatePriceRow(i, 'subtitle', e.target.value)} /></Grid>
              <Grid size={{ xs: 10, sm: 2 }}><TextField label="Preis" fullWidth value={row.price} onChange={(e) => updatePriceRow(i, 'price', e.target.value)} /></Grid>
              <Grid size={{ xs: 2, sm: 1 }}>
                <IconButton onClick={() => removePriceRow(i)} title="Zeile löschen">
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button startIcon={<AddIcon />} onClick={addPriceRow} sx={{ mt: 1, mb: 2 }}>Preiszeile hinzufügen</Button>
          <TextField
            label="Fußnote unter den Preisen (HTML erlaubt)"
            fullWidth
            multiline
            minRows={2}
            value={content.priceFootnoteHtml}
            onChange={(e) => setContent({ ...content, priceFootnoteHtml: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField label="Link 'Termine > Siehe Liste'" fullWidth value={content.scheduleLink} onChange={(e) => setContent({ ...content, scheduleLink: e.target.value })} />
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
          <StringListEditor items={content.leistungen} onChange={(leistungen) => setContent({ ...content, leistungen })} itemLabel="Leistung" />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Deine Checkliste</Typography>
          <StringListEditor items={content.checkliste} onChange={(checkliste) => setContent({ ...content, checkliste })} itemLabel="Punkt" />
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
