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
// /service/2-jahres-check page (ZweiJahresCheck.tsx). The gallery
// (Impressionen grid) is managed separately via Komponenten > Galerie.

interface AddressBlock { location: string; instructions: string }
interface ZweiJahresCheckData {
  eyebrow: string;
  heading: string;
  videoUrl: string;
  videoTitle: string;
  introHeading: string;
  introParagraph1: string;
  introParagraph2: string;
  introParagraph3: string;
  pruefschritteHeading: string;
  pruefschritte: string[];
  devise: string;
  formularButtonText: string;
  referenceText: string;
  priceButtonText: string;
  priceLabel: string;
  priceNote: string;
  price: string;
  surchargeLabel: string;
  surchargePrice: string;
  extraCostsNote: string;
  priceBottomButtonText: string;
  auftragHeading: string;
  auftragIntro: string;
  addresses: AddressBlock[];
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

export const ZweiJahresCheckContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || '2-jahres-check';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<ZweiJahresCheckData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || (id === '2-jahres-check' ? 'service/2-jahres-check' : id)}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/2-jahres-check', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/2-jahres-check-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/2-jahres-check', {
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

  const updatePruefschritt = (i: number, value: string) => {
    const pruefschritte = [...content.pruefschritte];
    pruefschritte[i] = value;
    setContent({ ...content, pruefschritte });
  };
  const addPruefschritt = () => setContent({ ...content, pruefschritte: [...content.pruefschritte, ''] });
  const removePruefschritt = (i: number) => setContent({ ...content, pruefschritte: content.pruefschritte.filter((_, idx) => idx !== i) });

  const updateAddress = (i: number, field: keyof AddressBlock, value: string) => {
    const addresses = [...content.addresses];
    addresses[i] = { ...addresses[i], [field]: value };
    setContent({ ...content, addresses });
  };
  const addAddress = () => setContent({ ...content, addresses: [...content.addresses, { location: '', instructions: '' }] });
  const removeAddress = (i: number) => setContent({ ...content, addresses: content.addresses.filter((_, idx) => idx !== i) });

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">2-Jahres-Check - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte der Seite /service/2-jahres-check - das Design/Layout bleibt exakt wie es ist. Die Bildergalerie wird separat über Komponenten &gt; Galerie verwaltet.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Einleitung</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Kleiner Titel (oben)" fullWidth value={content.eyebrow} onChange={(e) => setContent({ ...content, eyebrow: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 8 }}><TextField label="Überschrift" fullWidth value={content.heading} onChange={(e) => setContent({ ...content, heading: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Video-URL" fullWidth value={content.videoUrl} onChange={(e) => setContent({ ...content, videoUrl: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Video-Titel" fullWidth value={content.videoTitle} onChange={(e) => setContent({ ...content, videoTitle: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Absatz-Überschrift" fullWidth value={content.introHeading} onChange={(e) => setContent({ ...content, introHeading: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Absatz 1" fullWidth multiline minRows={2} value={content.introParagraph1} onChange={(e) => setContent({ ...content, introParagraph1: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Absatz 2" fullWidth multiline minRows={2} value={content.introParagraph2} onChange={(e) => setContent({ ...content, introParagraph2: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Absatz 3" fullWidth multiline minRows={2} value={content.introParagraph3} onChange={(e) => setContent({ ...content, introParagraph3: e.target.value })} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Prüfschritte</Typography>
          <TextField
            label="Abschnitts-Überschrift"
            fullWidth
            value={content.pruefschritteHeading}
            onChange={(e) => setContent({ ...content, pruefschritteHeading: e.target.value })}
            sx={{ mb: 2 }}
          />
          {content.pruefschritte.map((item, i) => (
            <Grid container spacing={1} key={i} sx={{ mb: 1.5, alignItems: 'center' }}>
              <Grid size={{ xs: 11 }}><TextField label={`Schritt ${i + 1}`} fullWidth value={item} onChange={(e) => updatePruefschritt(i, e.target.value)} /></Grid>
              <Grid size={{ xs: 1 }}>
                <IconButton onClick={() => removePruefschritt(i)} title="Schritt löschen">
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button startIcon={<AddIcon />} onClick={addPruefschritt} sx={{ mt: 1, mb: 2 }}>Schritt hinzufügen</Button>
          <TextField label="Schlusssatz (fett)" fullWidth multiline minRows={2} value={content.devise} onChange={(e) => setContent({ ...content, devise: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Formular-Button (Text)" fullWidth value={content.formularButtonText} onChange={(e) => setContent({ ...content, formularButtonText: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Rechtlicher Hinweistext" fullWidth multiline minRows={3} value={content.referenceText} onChange={(e) => setContent({ ...content, referenceText: e.target.value })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Preis-Karte</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Oberer Button-Text" fullWidth value={content.priceButtonText} onChange={(e) => setContent({ ...content, priceButtonText: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Unterer Button-Text" fullWidth value={content.priceBottomButtonText} onChange={(e) => setContent({ ...content, priceBottomButtonText: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 5 }}><TextField label="Preis-Bezeichnung" fullWidth value={content.priceLabel} onChange={(e) => setContent({ ...content, priceLabel: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Preis-Hinweis" fullWidth value={content.priceNote} onChange={(e) => setContent({ ...content, priceNote: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 3 }}><TextField label="Preis" fullWidth value={content.price} onChange={(e) => setContent({ ...content, price: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 8 }}><TextField label="Aufpreis-Bezeichnung" fullWidth value={content.surchargeLabel} onChange={(e) => setContent({ ...content, surchargeLabel: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Aufpreis" fullWidth value={content.surchargePrice} onChange={(e) => setContent({ ...content, surchargePrice: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Zusatzkosten-Hinweis" fullWidth value={content.extraCostsNote} onChange={(e) => setContent({ ...content, extraCostsNote: e.target.value })} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Check-Auftrag</Typography>
          <TextField label="Überschrift" fullWidth value={content.auftragHeading} onChange={(e) => setContent({ ...content, auftragHeading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Einleitungstext" fullWidth multiline minRows={2} value={content.auftragIntro} onChange={(e) => setContent({ ...content, auftragIntro: e.target.value })} sx={{ mb: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>Adressen</Typography>
          {content.addresses.map((addr, i) => (
            <Grid container spacing={2} key={i} sx={{ mb: 2, alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 5 }}><TextField label="Adresse" fullWidth value={addr.location} onChange={(e) => updateAddress(i, 'location', e.target.value)} /></Grid>
              <Grid size={{ xs: 11, sm: 6 }}><TextField label="Hinweistext" fullWidth value={addr.instructions} onChange={(e) => updateAddress(i, 'instructions', e.target.value)} /></Grid>
              <Grid size={{ xs: 1 }}>
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
