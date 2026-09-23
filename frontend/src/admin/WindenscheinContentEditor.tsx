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
// the /ausbildung/windenschein page (Windenschein.tsx). The Impressionen
// gallery isn't part of this content - it's managed separately via
// Komponenten > Galerie.

interface PriceRow { label: string; price: string }
interface WindenscheinData {
  eyebrow: string;
  heading: string;
  videoUrl: string;
  videoTitle: string;
  introHeading: string;
  introParagraph: string;
  ausbildungHeading: string;
  ausbildungPara1Html: string;
  ausbildungPara2: string;
  ausbildungPara3: string;
  ausbildungPara4: string;
  ausbildungPara5: string;
  fluggelaendeHeading: string;
  fluggelaendeIntro: string;
  fluggelaendePara1Html: string;
  fluggelaendePara2Html: string;
  bookingButtonLabel: string;
  bookingButtonLink: string;
  priceRows: PriceRow[];
  footerButtonLabel: string;
  footerButtonLink: string;
  gutscheinHeading: string;
  gutscheinDescription: string;
  leistungenItems: string[];
  zusatzkostenHeading: string;
  zusatzkostenItems: string[];
  checklisteItems: string[];
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

// A labeled add/remove list of plain strings - used for the Leistungen,
// Zusatzkosten and Checkliste bullet lists below.
const StringListEditor = ({
  items,
  onChange,
  label,
  multiline,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  label: string;
  multiline?: boolean;
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
          <Grid size={{ xs: 11 }}>
            <TextField label={label} fullWidth multiline={multiline} value={item} onChange={(e) => update(i, e.target.value)} />
          </Grid>
          <Grid size={{ xs: 1 }}>
            <IconButton onClick={() => remove(i)} title="Löschen">
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      <Button startIcon={<AddIcon />} onClick={add} sx={{ mt: 0.5 }}>Hinzufügen</Button>
    </>
  );
};

export const WindenscheinContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'windenschein';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<WindenscheinData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || (id === 'windenschein' ? 'ausbildung/windenschein' : id)}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/windenschein', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/windenschein-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/windenschein', {
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
        <Typography variant="h5">Windenschein - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte, Preise und Links der Seite /ausbildung/windenschein - das Design/Layout bleibt exakt wie es ist. Die Bildergalerie wird separat über Komponenten &gt; Galerie verwaltet.
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
          <Typography variant="h6" sx={{ mb: 2 }}>Windenschlepp</Typography>
          <TextField label="Überschrift" fullWidth value={content.introHeading} onChange={(e) => setContent({ ...content, introHeading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz" fullWidth multiline minRows={2} value={content.introParagraph} onChange={(e) => setContent({ ...content, introParagraph: e.target.value })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Ausbildung</Typography>
          <TextField label="Überschrift" fullWidth value={content.ausbildungHeading} onChange={(e) => setContent({ ...content, ausbildungHeading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 1 (HTML erlaubt)" fullWidth multiline minRows={2} value={content.ausbildungPara1Html} onChange={(e) => setContent({ ...content, ausbildungPara1Html: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 2" fullWidth multiline minRows={2} value={content.ausbildungPara2} onChange={(e) => setContent({ ...content, ausbildungPara2: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 3" fullWidth multiline minRows={2} value={content.ausbildungPara3} onChange={(e) => setContent({ ...content, ausbildungPara3: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 4" fullWidth multiline minRows={2} value={content.ausbildungPara4} onChange={(e) => setContent({ ...content, ausbildungPara4: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 5" fullWidth multiline minRows={2} value={content.ausbildungPara5} onChange={(e) => setContent({ ...content, ausbildungPara5: e.target.value })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Fluggelände</Typography>
          <TextField label="Überschrift" fullWidth value={content.fluggelaendeHeading} onChange={(e) => setContent({ ...content, fluggelaendeHeading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Einleitung" fullWidth multiline minRows={2} value={content.fluggelaendeIntro} onChange={(e) => setContent({ ...content, fluggelaendeIntro: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 1 (HTML erlaubt)" fullWidth multiline minRows={2} value={content.fluggelaendePara1Html} onChange={(e) => setContent({ ...content, fluggelaendePara1Html: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 2 (HTML erlaubt)" fullWidth multiline minRows={2} value={content.fluggelaendePara2Html} onChange={(e) => setContent({ ...content, fluggelaendePara2Html: e.target.value })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Preiskarte</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Buchen-Button Text" fullWidth value={content.bookingButtonLabel} onChange={(e) => setContent({ ...content, bookingButtonLabel: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Buchen-Button Link" fullWidth value={content.bookingButtonLink} onChange={(e) => setContent({ ...content, bookingButtonLink: e.target.value })} /></Grid>
          </Grid>
          <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>Preiszeilen (erste Zeile fett, weitere Zeilen mit Zeilenumbruch trennen)</Typography>
          {content.priceRows.map((row, i) => (
            <Grid container spacing={2} key={i} sx={{ mb: 1.5, alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 7 }}><TextField label="Text" fullWidth multiline value={row.label} onChange={(e) => updatePriceRow(i, 'label', e.target.value)} helperText="Zeilenumbruch = neue Zeile" /></Grid>
              <Grid size={{ xs: 10, sm: 4 }}><TextField label="Preis" fullWidth value={row.price} onChange={(e) => updatePriceRow(i, 'price', e.target.value)} helperText="Leer lassen für keinen Preis" /></Grid>
              <Grid size={{ xs: 2, sm: 1 }}>
                <IconButton onClick={() => removePriceRow(i)} title="Zeile löschen">
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button startIcon={<AddIcon />} onClick={addPriceRow} sx={{ mt: 1, mb: 2 }}>Zeile hinzufügen</Button>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Unterer Button Text" fullWidth value={content.footerButtonLabel} onChange={(e) => setContent({ ...content, footerButtonLabel: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Unterer Button Link" fullWidth value={content.footerButtonLink} onChange={(e) => setContent({ ...content, footerButtonLink: e.target.value })} /></Grid>
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
          <Typography variant="h6" sx={{ mb: 2 }}>Unsere Leistungen</Typography>
          <StringListEditor items={content.leistungenItems} onChange={(leistungenItems) => setContent({ ...content, leistungenItems })} label="Punkt" />
          <TextField
            label="Zusatzkosten - Überschrift"
            fullWidth
            value={content.zusatzkostenHeading}
            onChange={(e) => setContent({ ...content, zusatzkostenHeading: e.target.value })}
            sx={{ mt: 3, mb: 1 }}
          />
          <StringListEditor items={content.zusatzkostenItems} onChange={(zusatzkostenItems) => setContent({ ...content, zusatzkostenItems })} label="Punkt (HTML erlaubt)" multiline />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Deine Checkliste</Typography>
          <StringListEditor items={content.checklisteItems} onChange={(checklisteItems) => setContent({ ...content, checklisteItems })} label="Punkt" />
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
