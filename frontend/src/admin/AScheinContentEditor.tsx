import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotify } from 'react-admin';
import { Box, Card, CardContent, Typography, TextField, Button, Grid, Alert, CircularProgress, IconButton } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import UploadIcon from '@mui/icons-material/Upload';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { type FixedDuplicateMeta, FixedDuplicateMetaFields } from './FixedDuplicateMetaFields';
import { type PrimaryPageSettings, PrimaryPageSettingsFields } from './PrimaryPageSettingsFields';

// Same "data only, layout stays" idea as TeamContentEditor.tsx, for the
// /ausbildung/a-schein page (ASchein.tsx). The Impressionen gallery isn't
// part of this content - it's managed separately via Komponenten > Galerie.

interface PriceRow { title: string; description: string; price: string }
interface ExtraCostRow { label: string; price: string }
interface AScheinData {
  eyebrow: string;
  heading: string;
  heroImage: string;
  heroAlt: string;
  pilotHeading: string;
  pilotHtml: string;
  expectHeading: string;
  expectParagraph1Html: string;
  expectParagraph2: string;
  expectParagraph3: string;
  expectParagraph4: string;
  courseHeading: string;
  courseHtml: string;
  orgHeading: string;
  orgHtml: string;
  equipmentHeading: string;
  equipmentParagraph1: string;
  equipmentParagraph2: string;
  equipmentParagraph3: string;
  priceRows: PriceRow[];
  priceNote: string;
  extraCostRows: ExtraCostRow[];
  gutscheinHeading: string;
  gutscheinDescription: string;
  leistungen: string[];
  extraCostsHeading: string;
  ausruestungLabel: string;
  ausruestungSubItems: string[];
  extraCostsItemsHtml: string[];
  checklist: string[];
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

const ImageSlot = ({ url, onUploaded, label }: { url: string; onUploaded: (url: string) => void; label: string }) => {
  const notify = useNotify();
  const [uploading, setUploading] = useState(false);
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', headers: authHeaders(), body: formData });
      const data = await res.json();
      if (res.ok) onUploaded(data.url);
      else notify(data.message || 'Fehler beim Upload', { type: 'warning' });
    } catch {
      notify('Netzwerkfehler beim Upload', { type: 'warning' });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      {url && (
        <Box sx={{ position: 'relative', width: 96, height: 64 }}>
          <Box component="img" src={url} alt="" sx={{ width: 96, height: 64, objectFit: 'cover', borderRadius: 1 }} />
          <IconButton
            size="small"
            onClick={() => onUploaded('')}
            title="Bild entfernen"
            sx={{ position: 'absolute', top: -8, right: -8, width: 20, height: 20, bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: '#fee2e2' } }}
          >
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      )}
      <Button component="label" size="small" variant="outlined" startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />} disabled={uploading}>
        {label}
        <input type="file" accept="image/*" hidden onChange={handleUpload} />
      </Button>
    </Box>
  );
};

// A simple string-array repeater (add/remove) - used for Leistungen,
// Checkliste and the Ausrüstung sub-bullets below.
const StringListEditor = ({ items, onChange, addLabel }: { items: string[]; onChange: (next: string[]) => void; addLabel: string }) => {
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
          <Grid size={{ xs: 11 }}><TextField fullWidth size="small" value={item} onChange={(e) => update(i, e.target.value)} /></Grid>
          <Grid size={{ xs: 1 }}>
            <IconButton size="small" onClick={() => remove(i)} title="Löschen">
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      <Button size="small" startIcon={<AddIcon />} onClick={add} sx={{ mt: 0.5 }}>{addLabel}</Button>
    </>
  );
};

export const AScheinContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'a-schein';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<AScheinData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || (id === 'a-schein' ? 'ausbildung/a-schein' : id)}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/a-schein', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/a-schein-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/a-schein', {
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
  const addPriceRow = () => setContent({ ...content, priceRows: [...content.priceRows, { title: '', description: '', price: '' }] });
  const removePriceRow = (i: number) => setContent({ ...content, priceRows: content.priceRows.filter((_, idx) => idx !== i) });

  const updateExtraCostRow = (i: number, field: keyof ExtraCostRow, value: string) => {
    const extraCostRows = [...content.extraCostRows];
    extraCostRows[i] = { ...extraCostRows[i], [field]: value };
    setContent({ ...content, extraCostRows });
  };
  const addExtraCostRow = () => setContent({ ...content, extraCostRows: [...content.extraCostRows, { label: '', price: '' }] });
  const removeExtraCostRow = (i: number) => setContent({ ...content, extraCostRows: content.extraCostRows.filter((_, idx) => idx !== i) });

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">A-Schein - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte, Preise und Bilder der Seite /ausbildung/a-schein - das Design/Layout bleibt exakt wie es ist. Die Bildergalerie wird separat über Komponenten &gt; Galerie verwaltet.
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
          <Box sx={{ mt: 2 }}>
            <ImageSlot url={content.heroImage} onUploaded={(url) => setContent({ ...content, heroImage: url })} label="Titelbild ersetzen" />
            <TextField label="Titelbild Alt-Text" fullWidth value={content.heroAlt} onChange={(e) => setContent({ ...content, heroAlt: e.target.value })} />
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Textabschnitte</Typography>
          <TextField label="Überschrift 1" fullWidth value={content.pilotHeading} onChange={(e) => setContent({ ...content, pilotHeading: e.target.value })} sx={{ mb: 1 }} />
          <TextField label="Text 1 (HTML erlaubt)" fullWidth multiline minRows={3} value={content.pilotHtml} onChange={(e) => setContent({ ...content, pilotHtml: e.target.value })} sx={{ mb: 3 }} />

          <TextField label="Überschrift 2" fullWidth value={content.expectHeading} onChange={(e) => setContent({ ...content, expectHeading: e.target.value })} sx={{ mb: 1 }} />
          <TextField label="Text 2 - Absatz 1 (HTML erlaubt)" fullWidth multiline minRows={3} value={content.expectParagraph1Html} onChange={(e) => setContent({ ...content, expectParagraph1Html: e.target.value })} sx={{ mb: 1 }} />
          <TextField label="Text 2 - Absatz 2" fullWidth multiline minRows={2} value={content.expectParagraph2} onChange={(e) => setContent({ ...content, expectParagraph2: e.target.value })} sx={{ mb: 1 }} />
          <TextField label="Text 2 - Absatz 3" fullWidth multiline minRows={2} value={content.expectParagraph3} onChange={(e) => setContent({ ...content, expectParagraph3: e.target.value })} sx={{ mb: 1 }} />
          <TextField label="Text 2 - Absatz 4" fullWidth multiline minRows={2} value={content.expectParagraph4} onChange={(e) => setContent({ ...content, expectParagraph4: e.target.value })} sx={{ mb: 3 }} />

          <TextField label="Überschrift 3" fullWidth value={content.courseHeading} onChange={(e) => setContent({ ...content, courseHeading: e.target.value })} sx={{ mb: 1 }} />
          <TextField label="Text 3 (HTML erlaubt)" fullWidth multiline minRows={3} value={content.courseHtml} onChange={(e) => setContent({ ...content, courseHtml: e.target.value })} sx={{ mb: 3 }} />

          <TextField label="Überschrift 4" fullWidth value={content.orgHeading} onChange={(e) => setContent({ ...content, orgHeading: e.target.value })} sx={{ mb: 1 }} />
          <TextField label="Text 4 (HTML erlaubt)" fullWidth multiline minRows={2} value={content.orgHtml} onChange={(e) => setContent({ ...content, orgHtml: e.target.value })} sx={{ mb: 3 }} />

          <TextField label="Überschrift 5" fullWidth value={content.equipmentHeading} onChange={(e) => setContent({ ...content, equipmentHeading: e.target.value })} sx={{ mb: 1 }} />
          <TextField label="Text 5 - Absatz 1" fullWidth multiline minRows={3} value={content.equipmentParagraph1} onChange={(e) => setContent({ ...content, equipmentParagraph1: e.target.value })} sx={{ mb: 1 }} />
          <TextField label="Text 5 - Absatz 2" fullWidth multiline minRows={2} value={content.equipmentParagraph2} onChange={(e) => setContent({ ...content, equipmentParagraph2: e.target.value })} sx={{ mb: 1 }} />
          <TextField label="Text 5 - Absatz 3" fullWidth multiline minRows={2} value={content.equipmentParagraph3} onChange={(e) => setContent({ ...content, equipmentParagraph3: e.target.value })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Preise (Buchungskarte)</Typography>
          {content.priceRows.map((row, i) => (
            <Grid container spacing={2} key={i} sx={{ mb: 2, alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 3 }}><TextField label="Titel (fett, optional)" fullWidth value={row.title} onChange={(e) => updatePriceRow(i, 'title', e.target.value)} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Beschreibung" fullWidth value={row.description} onChange={(e) => updatePriceRow(i, 'description', e.target.value)} /></Grid>
              <Grid size={{ xs: 10, sm: 2 }}><TextField label="Preis" fullWidth value={row.price} onChange={(e) => updatePriceRow(i, 'price', e.target.value)} /></Grid>
              <Grid size={{ xs: 2, sm: 1 }}>
                <IconButton size="small" onClick={() => removePriceRow(i)} title="Zeile löschen">
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button size="small" startIcon={<AddIcon />} onClick={addPriceRow} sx={{ mb: 3 }}>Preiszeile hinzufügen</Button>

          <TextField label="Hinweis unter den Preisen" fullWidth multiline minRows={2} value={content.priceNote} onChange={(e) => setContent({ ...content, priceNote: e.target.value })} sx={{ mb: 3 }} />

          <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>Zusatzkosten</Typography>
          {content.extraCostRows.map((row, i) => (
            <Grid container spacing={2} key={i} sx={{ mb: 2, alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 8 }}><TextField label="Bezeichnung" fullWidth value={row.label} onChange={(e) => updateExtraCostRow(i, 'label', e.target.value)} /></Grid>
              <Grid size={{ xs: 10, sm: 3 }}><TextField label="Preis" fullWidth value={row.price} onChange={(e) => updateExtraCostRow(i, 'price', e.target.value)} /></Grid>
              <Grid size={{ xs: 2, sm: 1 }}>
                <IconButton size="small" onClick={() => removeExtraCostRow(i)} title="Zeile löschen">
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button size="small" startIcon={<AddIcon />} onClick={addExtraCostRow}>Zusatzkosten-Zeile hinzufügen</Button>
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

          <TextField label="Zwischenüberschrift" fullWidth value={content.extraCostsHeading} onChange={(e) => setContent({ ...content, extraCostsHeading: e.target.value })} sx={{ mt: 3, mb: 2 }} />

          <TextField label="Ausrüstung - Bezeichnung" fullWidth value={content.ausruestungLabel} onChange={(e) => setContent({ ...content, ausruestungLabel: e.target.value })} sx={{ mb: 1 }} />
          <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>Ausrüstung - Unterpunkte</Typography>
          <StringListEditor items={content.ausruestungSubItems} onChange={(ausruestungSubItems) => setContent({ ...content, ausruestungSubItems })} addLabel="Unterpunkt hinzufügen" />

          <Typography variant="body2" sx={{ color: '#666', mb: 1, mt: 3 }}>Weitere Zusatzkosten-Punkte (HTML/Links erlaubt)</Typography>
          <StringListEditor items={content.extraCostsItemsHtml} onChange={(extraCostsItemsHtml) => setContent({ ...content, extraCostsItemsHtml })} addLabel="Punkt hinzufügen" />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Deine Checkliste</Typography>
          <StringListEditor items={content.checklist} onChange={(checklist) => setContent({ ...content, checklist })} addLabel="Punkt hinzufügen" />
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
