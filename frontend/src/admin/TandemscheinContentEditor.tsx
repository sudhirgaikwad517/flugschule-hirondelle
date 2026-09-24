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
// /ausbildung/tandemschein page (Tandemschein.tsx). The gallery
// (Impressionen grid) isn't part of this content - it's managed separately
// via Komponenten > Galerie.

interface TandemscheinData {
  heroImage: string;
  block1Heading: string;
  block1Paragraph: string;
  block2Heading: string;
  block2Paragraph: string;
  leistungen: string[];
  zusatzkostenAusruestungLabel: string;
  zusatzkostenAusruestungSubItems: string[];
  zusatzkostenLinksHtml: string[];
  checkliste: string[];
  priceMainLabel: string;
  priceMainPrice: string;
  priceMainNote: string;
  priceWindenschleppLabel: string;
  priceWindenschleppNote: string;
  priceWindenschleppPrice: string;
  priceVerleihText: string;
  gutscheinHeading: string;
  gutscheinDescription: string;
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

// A labeled list of plain-text bullet items (add/remove) - used for
// Leistungen, Checkliste, and the two nested Zusatzkosten lists below.
const StringListEditor = ({
  label,
  items,
  onChange,
  multiline,
}: {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
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
        <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1.5 }}>
          <TextField
            label={`${label} ${i + 1}`}
            fullWidth
            multiline={multiline}
            minRows={multiline ? 2 : undefined}
            value={item}
            onChange={(e) => update(i, e.target.value)}
          />
          <IconButton onClick={() => remove(i)} title="Löschen" sx={{ mt: 1 }}>
            <DeleteIcon fontSize="small" color="error" />
          </IconButton>
        </Box>
      ))}
      <Button startIcon={<AddIcon />} onClick={add} sx={{ mt: 0.5, mb: 2 }}>{label} hinzufügen</Button>
    </>
  );
};

export const TandemscheinContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'tandemschein';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<TandemscheinData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || (id === 'tandemschein' ? 'ausbildung/tandemschein' : id)}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/tandemschein', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/tandemschein-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/tandemschein', {
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
        <Typography variant="h5">Tandemschein - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte und Preise der Seite /ausbildung/tandemschein - das Design/Layout bleibt exakt wie es ist. Die Bildergalerie wird separat über Komponenten &gt; Galerie verwaltet.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Einleitung</Typography>
          <TextField label="Titelbild-URL" fullWidth value={content.heroImage} onChange={(e) => setContent({ ...content, heroImage: e.target.value })} sx={{ mb: 2 }} helperText="Bild unter /public/images/tandemschein/ hochladen und Pfad hier eintragen." />
          <TextField label="Überschrift 1" fullWidth value={content.block1Heading} onChange={(e) => setContent({ ...content, block1Heading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 1" fullWidth multiline minRows={3} value={content.block1Paragraph} onChange={(e) => setContent({ ...content, block1Paragraph: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Überschrift 2" fullWidth value={content.block2Heading} onChange={(e) => setContent({ ...content, block2Heading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 2" fullWidth multiline minRows={3} value={content.block2Paragraph} onChange={(e) => setContent({ ...content, block2Paragraph: e.target.value })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Unsere Leistungen</Typography>
          <StringListEditor label="Leistung" items={content.leistungen} onChange={(leistungen) => setContent({ ...content, leistungen })} />

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: '#666' }}>Zusatzkosten können entstehen für:</Typography>
          <TextField label="Abschnitts-Label (z.B. Ausrüstung)" fullWidth value={content.zusatzkostenAusruestungLabel} onChange={(e) => setContent({ ...content, zusatzkostenAusruestungLabel: e.target.value })} sx={{ mb: 1.5 }} />
          <StringListEditor label="Ausrüstung - Punkt" items={content.zusatzkostenAusruestungSubItems} onChange={(zusatzkostenAusruestungSubItems) => setContent({ ...content, zusatzkostenAusruestungSubItems })} />
          <StringListEditor label="Weiterer Zusatzkosten-Punkt (HTML erlaubt)" items={content.zusatzkostenLinksHtml} onChange={(zusatzkostenLinksHtml) => setContent({ ...content, zusatzkostenLinksHtml })} multiline />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Deine Checkliste</Typography>
          <StringListEditor label="Checkliste-Punkt" items={content.checkliste} onChange={(checkliste) => setContent({ ...content, checkliste })} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Buchungskarte - Preise</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Hauptpreis - Bezeichnung" fullWidth value={content.priceMainLabel} onChange={(e) => setContent({ ...content, priceMainLabel: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 3 }}><TextField label="Hauptpreis" fullWidth value={content.priceMainPrice} onChange={(e) => setContent({ ...content, priceMainPrice: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 3 }}><TextField label="Hauptpreis - Hinweis" fullWidth value={content.priceMainNote} onChange={(e) => setContent({ ...content, priceMainNote: e.target.value })} /></Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Windenschlepp - Bezeichnung" fullWidth value={content.priceWindenschleppLabel} onChange={(e) => setContent({ ...content, priceWindenschleppLabel: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 3 }}><TextField label="Windenschlepp - Preis" fullWidth value={content.priceWindenschleppPrice} onChange={(e) => setContent({ ...content, priceWindenschleppPrice: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 3 }}><TextField label="Windenschlepp - Hinweis" fullWidth value={content.priceWindenschleppNote} onChange={(e) => setContent({ ...content, priceWindenschleppNote: e.target.value })} /></Grid>
          </Grid>
          <TextField label="Verleih-Zeile (ohne separaten Preis)" fullWidth value={content.priceVerleihText} onChange={(e) => setContent({ ...content, priceVerleihText: e.target.value })} sx={{ mb: 2 }} />

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: '#666' }}>Gutschein-Box</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Überschrift" fullWidth value={content.gutscheinHeading} onChange={(e) => setContent({ ...content, gutscheinHeading: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Beschreibung" fullWidth value={content.gutscheinDescription} onChange={(e) => setContent({ ...content, gutscheinDescription: e.target.value })} /></Grid>
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
