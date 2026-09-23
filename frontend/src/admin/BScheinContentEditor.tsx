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
// the /ausbildung/b-schein page (BSchein.tsx). The gallery (Impressionen)
// is managed separately via Komponenten > Galerie - not part of this data.

interface PriceRow { label: string; price: string }
interface ZusatzRow { title: string; note: string; sub: string; price: string }

interface BScheinData {
  title: string;
  heroImage: string;
  heroAlt: string;
  block1Heading: string;
  block1Paragraph1: string;
  block1Paragraph2Html: string;
  block2Heading: string;
  block2ParagraphHtml: string;
  block3Heading: string;
  block3Paragraph1: string;
  block3Paragraph2Html: string;
  bookingButtonText: string;
  bookingButtonLink: string;
  theoriePreis: PriceRow;
  praxisNote1: string;
  praxisNote2: string;
  praxisPreis: string;
  zusatzkostenHeading: string;
  zusatzkostenRows: ZusatzRow[];
  theorieTerminButtonText: string;
  theorieTerminButtonLink: string;
  gutscheinHeading: string;
  gutscheinDescription: string;
  leistungen: string[];
  zusatzkostenListHeading: string;
  zusatzkostenListItemsHtml: string[];
  checkliste: string[];
  bannerTextHtml: string;
  bannerLink: string;
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

// A simple add/remove list of plain strings - used for Leistungen/Checkliste
// below, mirroring the BoxesEditor-style repeaters used elsewhere in this
// codebase but for `string[]` instead of `{title,link}[]`.
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
        <Grid container spacing={1} key={i} sx={{ mb: 1, alignItems: 'flex-start' }}>
          <Grid size={{ xs: 11 }}>
            <TextField label={`${label} ${i + 1}`} fullWidth multiline={multiline} value={item} onChange={(e) => update(i, e.target.value)} />
          </Grid>
          <Grid size={{ xs: 1 }}>
            <IconButton onClick={() => remove(i)} title="Löschen"><DeleteIcon fontSize="small" color="error" /></IconButton>
          </Grid>
        </Grid>
      ))}
      <Button startIcon={<AddIcon />} onClick={add} sx={{ mt: 0.5 }}>{label} hinzufügen</Button>
    </>
  );
};

export const BScheinContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'b-schein';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<BScheinData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || (id === 'b-schein' ? 'ausbildung/b-schein' : id)}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/b-schein', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/b-schein-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/b-schein', {
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

  const updateZusatzRow = (i: number, field: keyof ZusatzRow, value: string) => {
    const rows = [...content.zusatzkostenRows];
    rows[i] = { ...rows[i], [field]: value };
    setContent({ ...content, zusatzkostenRows: rows });
  };
  const addZusatzRow = () => setContent({ ...content, zusatzkostenRows: [...content.zusatzkostenRows, { title: '', note: '', sub: '', price: '' }] });
  const removeZusatzRow = (i: number) => setContent({ ...content, zusatzkostenRows: content.zusatzkostenRows.filter((_, idx) => idx !== i) });

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">B-Schein - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte, Preise und Links der Seite /ausbildung/b-schein - das Design/Layout bleibt exakt wie es ist. Die Bildergalerie wird separat über Komponenten &gt; Galerie verwaltet.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Einleitung</Typography>
          <TextField label="Titel" fullWidth value={content.title} onChange={(e) => setContent({ ...content, title: e.target.value })} sx={{ mb: 2 }} />
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 8 }}><TextField label="Titelbild (URL)" fullWidth value={content.heroImage} onChange={(e) => setContent({ ...content, heroImage: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Titelbild Alt-Text" fullWidth value={content.heroAlt} onChange={(e) => setContent({ ...content, heroAlt: e.target.value })} /></Grid>
          </Grid>
          <TextField label="Überschrift 1" fullWidth value={content.block1Heading} onChange={(e) => setContent({ ...content, block1Heading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 1.1" fullWidth multiline minRows={2} value={content.block1Paragraph1} onChange={(e) => setContent({ ...content, block1Paragraph1: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 1.2 (HTML erlaubt)" fullWidth multiline minRows={3} value={content.block1Paragraph2Html} onChange={(e) => setContent({ ...content, block1Paragraph2Html: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Überschrift 2" fullWidth value={content.block2Heading} onChange={(e) => setContent({ ...content, block2Heading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 2 (HTML erlaubt)" fullWidth multiline minRows={3} value={content.block2ParagraphHtml} onChange={(e) => setContent({ ...content, block2ParagraphHtml: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Überschrift 3" fullWidth value={content.block3Heading} onChange={(e) => setContent({ ...content, block3Heading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 3.1" fullWidth multiline minRows={2} value={content.block3Paragraph1} onChange={(e) => setContent({ ...content, block3Paragraph1: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 3.2 (HTML erlaubt)" fullWidth multiline minRows={2} value={content.block3Paragraph2Html} onChange={(e) => setContent({ ...content, block3Paragraph2Html: e.target.value })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Buchungs-Box</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Text (oben)" fullWidth value={content.bookingButtonText} onChange={(e) => setContent({ ...content, bookingButtonText: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Link (oben)" fullWidth value={content.bookingButtonLink} onChange={(e) => setContent({ ...content, bookingButtonLink: e.target.value })} /></Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 8 }}><TextField label="Kurspreis Theorie - Bezeichnung" fullWidth value={content.theoriePreis.label} onChange={(e) => setContent({ ...content, theoriePreis: { ...content.theoriePreis, label: e.target.value } })} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Kurspreis Theorie - Preis" fullWidth value={content.theoriePreis.price} onChange={(e) => setContent({ ...content, theoriePreis: { ...content.theoriePreis, price: e.target.value } })} /></Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 5 }}><TextField label="Kurspreis Praxis - Hinweis" fullWidth value={content.praxisNote1} onChange={(e) => setContent({ ...content, praxisNote1: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Kurspreis Praxis - Hinweis (klein)" fullWidth value={content.praxisNote2} onChange={(e) => setContent({ ...content, praxisNote2: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 3 }}><TextField label="Kurspreis Praxis - Preis" fullWidth value={content.praxisPreis} onChange={(e) => setContent({ ...content, praxisPreis: e.target.value })} /></Grid>
          </Grid>

          <TextField label="Zusatzkosten - Überschrift" fullWidth value={content.zusatzkostenHeading} onChange={(e) => setContent({ ...content, zusatzkostenHeading: e.target.value })} sx={{ mb: 2 }} />
          {content.zusatzkostenRows.map((row, i) => (
            <Grid container spacing={2} key={i} sx={{ mb: 1.5, alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 4 }}><TextField label="Titel" fullWidth value={row.title} onChange={(e) => updateZusatzRow(i, 'title', e.target.value)} /></Grid>
              <Grid size={{ xs: 12, sm: 3 }}><TextField label="Hinweis" fullWidth value={row.note} onChange={(e) => updateZusatzRow(i, 'note', e.target.value)} /></Grid>
              <Grid size={{ xs: 12, sm: 3 }}><TextField label="Untertext" fullWidth value={row.sub} onChange={(e) => updateZusatzRow(i, 'sub', e.target.value)} /></Grid>
              <Grid size={{ xs: 10, sm: 1.5 }}><TextField label="Preis" fullWidth value={row.price} onChange={(e) => updateZusatzRow(i, 'price', e.target.value)} /></Grid>
              <Grid size={{ xs: 2, sm: 0.5 }}><IconButton onClick={() => removeZusatzRow(i)} title="Zeile löschen"><DeleteIcon fontSize="small" color="error" /></IconButton></Grid>
            </Grid>
          ))}
          <Button startIcon={<AddIcon />} onClick={addZusatzRow} sx={{ mb: 2 }}>Zusatzkosten-Zeile hinzufügen</Button>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Text (unten)" fullWidth value={content.theorieTerminButtonText} onChange={(e) => setContent({ ...content, theorieTerminButtonText: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Link (unten)" fullWidth value={content.theorieTerminButtonLink} onChange={(e) => setContent({ ...content, theorieTerminButtonLink: e.target.value })} /></Grid>
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
          <StringListEditor items={content.leistungen} onChange={(leistungen) => setContent({ ...content, leistungen })} label="Leistung" />
          <TextField label="Zusatzkosten-Liste - Überschrift" fullWidth value={content.zusatzkostenListHeading} onChange={(e) => setContent({ ...content, zusatzkostenListHeading: e.target.value })} sx={{ mt: 3, mb: 2 }} />
          <StringListEditor items={content.zusatzkostenListItemsHtml} onChange={(zusatzkostenListItemsHtml) => setContent({ ...content, zusatzkostenListItemsHtml })} label="Zusatzkosten-Punkt (HTML erlaubt)" />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Deine Checkliste</Typography>
          <StringListEditor items={content.checkliste} onChange={(checkliste) => setContent({ ...content, checkliste })} label="Checklisten-Punkt" />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Info-Banner (unten)</Typography>
          <TextField label="Text (HTML erlaubt)" fullWidth multiline minRows={2} value={content.bannerTextHtml} onChange={(e) => setContent({ ...content, bannerTextHtml: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Link" fullWidth value={content.bannerLink} onChange={(e) => setContent({ ...content, bannerLink: e.target.value })} />
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
