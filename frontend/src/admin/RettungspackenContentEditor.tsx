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
// /service/rettungspacken page (Rettungspacken.tsx). No gallery on this
// page, so nothing is managed elsewhere.

interface AddressBlock { location: string; note: string }
interface PriceRow { label: string; price: string }

interface RettungspackenData {
  eyebrow: string;
  title: string;
  heroImage: string;
  heroAlt: string;
  block1Heading: string;
  paragraph1: string;
  paragraph2: string;
  redParagraph1: string;
  redParagraph2: string;
  formularButtonText: string;
  infoHeading: string;
  infoHtml: string;
  priceButtonText: string;
  priceRows: PriceRow[];
  priceNote: string;
  checkButtonText: string;
  packAuftragHeading: string;
  packAuftragIntro: string;
  addresses: AddressBlock[];
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

export const RettungspackenContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'rettungspacken';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<RettungspackenData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || (id === 'rettungspacken' ? 'service/rettungspacken' : id)}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/rettungspacken', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/rettungspacken-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/rettungspacken', {
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

  const updateAddress = (i: number, field: keyof AddressBlock, value: string) => {
    const addresses = [...content.addresses];
    addresses[i] = { ...addresses[i], [field]: value };
    setContent({ ...content, addresses });
  };

  const addAddress = () => {
    setContent({ ...content, addresses: [...content.addresses, { location: '', note: '' }] });
  };

  const removeAddress = (i: number) => {
    setContent({ ...content, addresses: content.addresses.filter((_, idx) => idx !== i) });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">Rettungsgeräte-Packservice - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte und Bilder der Seite /service/rettungspacken - das Design/Layout bleibt exakt wie es ist.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Einleitung</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Kleiner Titel (oben)" fullWidth value={content.eyebrow} onChange={(e) => setContent({ ...content, eyebrow: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 8 }}><TextField label="Überschrift" fullWidth value={content.title} onChange={(e) => setContent({ ...content, title: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Bild-URL" fullWidth value={content.heroImage} onChange={(e) => setContent({ ...content, heroImage: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Bild Alt-Text" fullWidth value={content.heroAlt} onChange={(e) => setContent({ ...content, heroAlt: e.target.value })} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Haupttext</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}><TextField label="Überschrift" fullWidth value={content.block1Heading} onChange={(e) => setContent({ ...content, block1Heading: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Absatz 1" fullWidth multiline minRows={2} value={content.paragraph1} onChange={(e) => setContent({ ...content, paragraph1: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Absatz 2" fullWidth multiline minRows={2} value={content.paragraph2} onChange={(e) => setContent({ ...content, paragraph2: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Hinweis 1 (rot dargestellt)" fullWidth multiline minRows={2} value={content.redParagraph1} onChange={(e) => setContent({ ...content, redParagraph1: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Hinweis 2 (rot dargestellt)" fullWidth multiline minRows={2} value={content.redParagraph2} onChange={(e) => setContent({ ...content, redParagraph2: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Formular-Button Text" fullWidth value={content.formularButtonText} onChange={(e) => setContent({ ...content, formularButtonText: e.target.value })} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Zusatzinfo-Block</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}><TextField label="Überschrift" fullWidth value={content.infoHeading} onChange={(e) => setContent({ ...content, infoHeading: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Text (HTML erlaubt)"
                fullWidth
                multiline
                minRows={3}
                value={content.infoHtml}
                onChange={(e) => setContent({ ...content, infoHtml: e.target.value })}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Preiskarte</Typography>
          <TextField label="Button-Text (oben)" fullWidth value={content.priceButtonText} onChange={(e) => setContent({ ...content, priceButtonText: e.target.value })} sx={{ mb: 2 }} />
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
          <Button startIcon={<AddIcon />} onClick={addPriceRow} sx={{ mb: 2 }}>Zeile hinzufügen</Button>
          <TextField label="Hinweis unter den Preisen" fullWidth value={content.priceNote} onChange={(e) => setContent({ ...content, priceNote: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Button-Text (unten, führt zum Service-Auftrag-Formular)" fullWidth value={content.checkButtonText} onChange={(e) => setContent({ ...content, checkButtonText: e.target.value })} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Pack-Auftrag-Info</Typography>
          <TextField label="Überschrift" fullWidth value={content.packAuftragHeading} onChange={(e) => setContent({ ...content, packAuftragHeading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Einleitungstext" fullWidth multiline minRows={2} value={content.packAuftragIntro} onChange={(e) => setContent({ ...content, packAuftragIntro: e.target.value })} sx={{ mb: 2 }} />
          {content.addresses.map((addr, i) => (
            <Grid container spacing={2} key={i} sx={{ mb: 2, alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 5 }}><TextField label="Adresse" fullWidth value={addr.location} onChange={(e) => updateAddress(i, 'location', e.target.value)} /></Grid>
              <Grid size={{ xs: 10, sm: 6 }}><TextField label="Hinweis" fullWidth value={addr.note} onChange={(e) => updateAddress(i, 'note', e.target.value)} /></Grid>
              <Grid size={{ xs: 2, sm: 1 }}>
                <IconButton onClick={() => removeAddress(i)} title="Adresse löschen">
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button startIcon={<AddIcon />} onClick={addAddress}>Adresse hinzufügen</Button>
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
