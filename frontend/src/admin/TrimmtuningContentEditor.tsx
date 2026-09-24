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
// /service/trimmtuning page (Trimmtuning.tsx). No gallery on this page.

interface AddressBlock { location: string; note: string }
interface TrimmtuningData {
  eyebrow: string;
  heading: string;
  heroImage: string;
  heroAlt: string;
  blockHeading: string;
  blockSubheading: string;
  blockParagraph: string;
  leistungenHeading: string;
  leistungen: string[];
  formularButtonText: string;
  priceCardButtonText: string;
  priceLabel: string;
  priceNote: string;
  price: string;
  priceCardBottomButtonText: string;
  trimmAuftragHeading: string;
  trimmAuftragIntro: string;
  addresses: AddressBlock[];
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

export const TrimmtuningContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'trimmtuning';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<TrimmtuningData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || (id === 'trimmtuning' ? 'service/trimmtuning' : id)}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/trimmtuning', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/trimmtuning-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/trimmtuning', {
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

  const updateLeistung = (i: number, value: string) => {
    const leistungen = [...content.leistungen];
    leistungen[i] = value;
    setContent({ ...content, leistungen });
  };
  const addLeistung = () => setContent({ ...content, leistungen: [...content.leistungen, ''] });
  const removeLeistung = (i: number) => setContent({ ...content, leistungen: content.leistungen.filter((_, idx) => idx !== i) });

  const updateAddress = (i: number, field: keyof AddressBlock, value: string) => {
    const addresses = [...content.addresses];
    addresses[i] = { ...addresses[i], [field]: value };
    setContent({ ...content, addresses });
  };
  const addAddress = () => setContent({ ...content, addresses: [...content.addresses, { location: '', note: '' }] });
  const removeAddress = (i: number) => setContent({ ...content, addresses: content.addresses.filter((_, idx) => idx !== i) });

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">Trimmtuning - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte und Bilder der Seite /service/trimmtuning - das Design/Layout bleibt exakt wie es ist.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Einleitung</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Kleiner Titel (oben)" fullWidth value={content.eyebrow} onChange={(e) => setContent({ ...content, eyebrow: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 8 }}><TextField label="Überschrift" fullWidth value={content.heading} onChange={(e) => setContent({ ...content, heading: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Bild-URL" fullWidth value={content.heroImage} onChange={(e) => setContent({ ...content, heroImage: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Bild Alt-Text" fullWidth value={content.heroAlt} onChange={(e) => setContent({ ...content, heroAlt: e.target.value })} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Textblock</Typography>
          <TextField label="Überschrift" fullWidth value={content.blockHeading} onChange={(e) => setContent({ ...content, blockHeading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Unterüberschrift" fullWidth value={content.blockSubheading} onChange={(e) => setContent({ ...content, blockSubheading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz" fullWidth multiline minRows={3} value={content.blockParagraph} onChange={(e) => setContent({ ...content, blockParagraph: e.target.value })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Leistungen</Typography>
          <TextField label="Abschnitts-Überschrift" fullWidth value={content.leistungenHeading} onChange={(e) => setContent({ ...content, leistungenHeading: e.target.value })} sx={{ mb: 2 }} />
          {content.leistungen.map((item, i) => (
            <Grid container spacing={2} key={i} sx={{ mb: 1.5, alignItems: 'center' }}>
              <Grid size={{ xs: 10 }}><TextField label={`Punkt ${i + 1}`} fullWidth value={item} onChange={(e) => updateLeistung(i, e.target.value)} /></Grid>
              <Grid size={{ xs: 2 }}>
                <IconButton onClick={() => removeLeistung(i)} title="Punkt löschen">
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button startIcon={<AddIcon />} onClick={addLeistung} sx={{ mt: 1 }}>Punkt hinzufügen</Button>
          <TextField
            label="Formular-Button Text"
            fullWidth
            multiline
            minRows={2}
            value={content.formularButtonText}
            onChange={(e) => setContent({ ...content, formularButtonText: e.target.value })}
            sx={{ mt: 3 }}
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Preiskarte</Typography>
          <TextField label="Button-Text (oben)" fullWidth value={content.priceCardButtonText} onChange={(e) => setContent({ ...content, priceCardButtonText: e.target.value })} sx={{ mb: 2 }} />
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 5 }}><TextField label="Bezeichnung" fullWidth value={content.priceLabel} onChange={(e) => setContent({ ...content, priceLabel: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Hinweis" fullWidth value={content.priceNote} onChange={(e) => setContent({ ...content, priceNote: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 3 }}><TextField label="Preis" fullWidth value={content.price} onChange={(e) => setContent({ ...content, price: e.target.value })} /></Grid>
          </Grid>
          <TextField label="Button-Text (unten)" fullWidth value={content.priceCardBottomButtonText} onChange={(e) => setContent({ ...content, priceCardBottomButtonText: e.target.value })} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Trimm-Auftrag Info</Typography>
          <TextField label="Überschrift" fullWidth value={content.trimmAuftragHeading} onChange={(e) => setContent({ ...content, trimmAuftragHeading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Einleitungstext" fullWidth multiline minRows={2} value={content.trimmAuftragIntro} onChange={(e) => setContent({ ...content, trimmAuftragIntro: e.target.value })} sx={{ mb: 2 }} />
          {content.addresses.map((addr, i) => (
            <Grid container spacing={2} key={i} sx={{ mb: 1.5, alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 5 }}><TextField label="Ort / Adresse" fullWidth value={addr.location} onChange={(e) => updateAddress(i, 'location', e.target.value)} /></Grid>
              <Grid size={{ xs: 10, sm: 6 }}><TextField label="Hinweis" fullWidth value={addr.note} onChange={(e) => updateAddress(i, 'note', e.target.value)} /></Grid>
              <Grid size={{ xs: 2, sm: 1 }}>
                <IconButton onClick={() => removeAddress(i)} title="Adresse löschen">
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button startIcon={<AddIcon />} onClick={addAddress} sx={{ mt: 1 }}>Adresse hinzufügen</Button>
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
