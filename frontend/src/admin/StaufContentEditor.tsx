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

// /infos/gelaende/stauf - structured fields (not one raw HTML blob), same
// "data only, layout stays" idea as every other page editor this session.
// See frontend/src/pages/Stauf.tsx for the matching public page.

interface EckdatenRow { label: string; value: string }
interface StaufData {
  title: string;
  eckdatenRows: EckdatenRow[];
  routenplanerUrl: string;
  mainImage: string;
  addressHeading: string;
  parkplatzHeading: string;
  parkplatzText: string;
  startplatzHeading: string;
  startplatzText: string;
  routeImage: string;
  achtungHtml: string;
  besonderheitenHeading: string;
  besonderheiten: string[];
  richtwerteHeading: string;
  richtwerte: string[];
  wetterstationenHeading: string;
  wetterstationenText: string;
  mapEmbedUrl: string;
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

// Label+value repeater for the Eckdaten box - mirrors GelaendeContentEditor.tsx's
// BoxesEditor (title+link) but for label+value pairs.
const EckdatenEditor = ({ rows, onChange }: { rows: EckdatenRow[]; onChange: (next: EckdatenRow[]) => void }) => {
  const update = (i: number, field: keyof EckdatenRow, value: string) => {
    const next = [...rows];
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  };
  const add = () => onChange([...rows, { label: '', value: '' }]);
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));

  return (
    <>
      {rows.map((row, i) => (
        <Grid container spacing={2} key={i} sx={{ mb: 1.5, alignItems: 'center' }}>
          <Grid size={{ xs: 12, sm: 4 }}><TextField label="Label" fullWidth value={row.label} onChange={(e) => update(i, 'label', e.target.value)} /></Grid>
          <Grid size={{ xs: 10, sm: 7 }}><TextField label="Wert" fullWidth value={row.value} onChange={(e) => update(i, 'value', e.target.value)} /></Grid>
          <Grid size={{ xs: 2, sm: 1 }}>
            <IconButton onClick={() => remove(i)} title="Zeile löschen">
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      <Button startIcon={<AddIcon />} onClick={add} sx={{ mt: 1 }}>Zeile hinzufügen</Button>
    </>
  );
};

// Plain string[] repeater for bullet lists (Besonderheiten, Richtwerte).
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
        <Grid container spacing={2} key={i} sx={{ mb: 1.5, alignItems: 'center' }}>
          <Grid size={{ xs: 10, sm: 11 }}><TextField label={`Punkt ${i + 1}`} fullWidth multiline value={item} onChange={(e) => update(i, e.target.value)} /></Grid>
          <Grid size={{ xs: 2, sm: 1 }}>
            <IconButton onClick={() => remove(i)} title="Löschen">
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      <Button startIcon={<AddIcon />} onClick={add} sx={{ mt: 1 }}>{addLabel}</Button>
    </>
  );
};

export const StaufContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'stauf';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<StaufData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || (id === 'stauf' ? 'infos/gelaende/stauf' : id)}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/stauf', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/stauf-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/stauf', {
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
        <Typography variant="h5">Stauf - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte und Bilder der Seite /infos/gelaende/stauf - das Design/Layout bleibt exakt wie es ist.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Titel</Typography>
          <TextField label="Titel" fullWidth value={content.title} onChange={(e) => setContent({ ...content, title: e.target.value })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Eckdaten</Typography>
          <EckdatenEditor rows={content.eckdatenRows} onChange={(eckdatenRows) => setContent({ ...content, eckdatenRows })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Routenplaner</Typography>
          <TextField
            label="Routenplaner-Link"
            fullWidth
            value={content.routenplanerUrl}
            onChange={(e) => setContent({ ...content, routenplanerUrl: e.target.value })}
            helperText="Google/Apple-Maps-Link für die Routenplaner-Box"
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Bild</Typography>
          <ImageSlot url={content.mainImage} onUploaded={(url) => setContent({ ...content, mainImage: url })} label="Bild ersetzen" />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Adresse / Anfahrt</Typography>
          <TextField label="Überschrift" fullWidth value={content.addressHeading} onChange={(e) => setContent({ ...content, addressHeading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Parkplatz - Überschrift" fullWidth value={content.parkplatzHeading} onChange={(e) => setContent({ ...content, parkplatzHeading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Parkplatz - Text (HTML erlaubt)" fullWidth multiline minRows={2} value={content.parkplatzText} onChange={(e) => setContent({ ...content, parkplatzText: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Startplatz - Überschrift" fullWidth value={content.startplatzHeading} onChange={(e) => setContent({ ...content, startplatzHeading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Startplatz - Text (HTML erlaubt)" fullWidth multiline minRows={2} value={content.startplatzText} onChange={(e) => setContent({ ...content, startplatzText: e.target.value })} sx={{ mb: 2 }} />
          <ImageSlot url={content.routeImage} onUploaded={(url) => setContent({ ...content, routeImage: url })} label="Anfahrtsskizze ersetzen" />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Achtung-Hinweis</Typography>
          <TextField label="Text (HTML erlaubt)" fullWidth multiline minRows={2} value={content.achtungHtml} onChange={(e) => setContent({ ...content, achtungHtml: e.target.value })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Besonderheiten / Gefahrenquellen</Typography>
          <TextField label="Überschrift" fullWidth value={content.besonderheitenHeading} onChange={(e) => setContent({ ...content, besonderheitenHeading: e.target.value })} sx={{ mb: 2 }} />
          <StringListEditor items={content.besonderheiten} onChange={(besonderheiten) => setContent({ ...content, besonderheiten })} addLabel="Punkt hinzufügen" />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Richtwerte für Flüge mit dem L-Schein</Typography>
          <TextField label="Überschrift" fullWidth value={content.richtwerteHeading} onChange={(e) => setContent({ ...content, richtwerteHeading: e.target.value })} sx={{ mb: 2 }} />
          <StringListEditor items={content.richtwerte} onChange={(richtwerte) => setContent({ ...content, richtwerte })} addLabel="Punkt hinzufügen" />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Wetterstationen</Typography>
          <TextField label="Überschrift" fullWidth value={content.wetterstationenHeading} onChange={(e) => setContent({ ...content, wetterstationenHeading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Text (HTML erlaubt)" fullWidth multiline minRows={2} value={content.wetterstationenText} onChange={(e) => setContent({ ...content, wetterstationenText: e.target.value })} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Karte</Typography>
          <TextField
            label="Google Maps Embed-URL"
            fullWidth
            value={content.mapEmbedUrl}
            onChange={(e) => setContent({ ...content, mapEmbedUrl: e.target.value })}
            helperText='Bei Google Maps auf "Teilen" > "Karte einbetten" klicken und nur die URL aus dem src="..." des angezeigten Codes hier einfügen.'
          />
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
