import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotify } from 'react-admin';
import { Box, Card, CardContent, Typography, TextField, Button, Grid, Alert, CircularProgress, IconButton } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import UploadIcon from '@mui/icons-material/Upload';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { type FixedDuplicateMeta, FixedDuplicateMetaFields } from './FixedDuplicateMetaFields';
import { type PrimaryPageSettings, PrimaryPageSettingsFields } from './PrimaryPageSettingsFields';

// /infos/gelaende/lindenfels - structured fields (Eckdaten rows, Besonderheiten/
// Richtwerte lists, PDF button, map URL) instead of one raw-HTML blob, same
// idea as every other page converted this session.

interface EckdatenRow { label: string; value: string }
interface LindenfelsData {
  title: string;
  eckdatenRows: EckdatenRow[];
  routenplanerUrl: string;
  mainImage: string;
  addressHeading: string;
  addressHtml: string;
  pdfUrl: string;
  pdfLabel: string;
  besonderheitenHeading: string;
  besonderheiten: string[];
  richtwerteHeading: string;
  richtwerte: string[];
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

// PDF upload slot, same idea as ImageSlot above but for the "PDF-Download"
// button's file - shows the current filename with an "ansehen" link instead
// of a thumbnail, and accepts only PDFs.
const FileSlot = ({ url, onUploaded, label }: { url: string; onUploaded: (url: string) => void; label: string }) => {
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PictureAsPdfIcon fontSize="small" color="action" />
          <Button component="a" href={url} target="_blank" rel="noopener noreferrer" size="small">
            PDF ansehen
          </Button>
          <IconButton size="small" onClick={() => onUploaded('')} title="PDF entfernen">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      <Button component="label" size="small" variant="outlined" startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />} disabled={uploading}>
        {label}
        <input type="file" accept="application/pdf,.pdf" hidden onChange={handleUpload} />
      </Button>
    </Box>
  );
};

// Add/remove label+value rows (Eckdaten) - same idea as GelaendeContentEditor's
// BoxesEditor for title+link pairs.
const RowsEditor = ({ rows, onChange }: { rows: EckdatenRow[]; onChange: (next: EckdatenRow[]) => void }) => {
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
          <Grid size={{ xs: 12, sm: 5 }}><TextField label="Bezeichnung" fullWidth value={row.label} onChange={(e) => update(i, 'label', e.target.value)} /></Grid>
          <Grid size={{ xs: 10, sm: 6 }}><TextField label="Wert" fullWidth value={row.value} onChange={(e) => update(i, 'value', e.target.value)} /></Grid>
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

// Add/remove plain bullet strings (Besonderheiten/Richtwerte) - same idea as
// Leistungen/Checkliste lists elsewhere.
const ListEditor = ({ items, onChange, label }: { items: string[]; onChange: (next: string[]) => void; label: string }) => {
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
          <Grid size={{ xs: 11 }}><TextField fullWidth multiline value={item} onChange={(e) => update(i, e.target.value)} /></Grid>
          <Grid size={{ xs: 1 }}>
            <IconButton onClick={() => remove(i)} title="Löschen">
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      <Button startIcon={<AddIcon />} onClick={add} sx={{ mt: 1 }}>{label}</Button>
    </>
  );
};

export const LindenfelsGelaendeContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'lindenfels';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<LindenfelsData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || (id === 'lindenfels' ? 'infos/gelaende/lindenfels' : id)}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/lindenfels', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/lindenfels-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/lindenfels', {
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
        <Typography variant="h5">Lindenfels - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Texte, Bild und Karte der Seite /infos/gelaende/lindenfels - das Design/Layout bleibt exakt wie es ist.
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
          <RowsEditor rows={content.eckdatenRows} onChange={(eckdatenRows) => setContent({ ...content, eckdatenRows })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Routenplaner</Typography>
          <TextField
            label="Link (Google/Apple Maps)"
            fullWidth
            value={content.routenplanerUrl}
            onChange={(e) => setContent({ ...content, routenplanerUrl: e.target.value })}
            helperText='Das "Routenplaner für Smartphones"-Icon und der Text daneben bleiben fest - nur dieser Link ist editierbar.'
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
          <Typography variant="h6" sx={{ mb: 2 }}>Adresse/Anfahrt</Typography>
          <TextField label="Überschrift" fullWidth value={content.addressHeading} onChange={(e) => setContent({ ...content, addressHeading: e.target.value })} sx={{ mb: 2 }} />
          <TextField
            label="Text (HTML erlaubt)"
            fullWidth
            multiline
            minRows={4}
            value={content.addressHtml}
            onChange={(e) => setContent({ ...content, addressHtml: e.target.value })}
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>PDF-Download-Button</Typography>
          <FileSlot url={content.pdfUrl} onUploaded={(url) => setContent({ ...content, pdfUrl: url })} label={content.pdfUrl ? 'PDF ersetzen' : 'PDF hochladen'} />
          <TextField
            label="PDF-URL"
            fullWidth
            value={content.pdfUrl}
            onChange={(e) => setContent({ ...content, pdfUrl: e.target.value })}
            sx={{ mb: 2 }}
            helperText="Leer lassen, um den Button auszublenden. Wird beim Hochladen automatisch gesetzt."
          />
          <TextField label="Button-Text" fullWidth value={content.pdfLabel} onChange={(e) => setContent({ ...content, pdfLabel: e.target.value })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Besonderheiten/Gefahrenquellen</Typography>
          <TextField
            label="Überschrift"
            fullWidth
            value={content.besonderheitenHeading}
            onChange={(e) => setContent({ ...content, besonderheitenHeading: e.target.value })}
            sx={{ mb: 2 }}
          />
          <ListEditor items={content.besonderheiten} onChange={(besonderheiten) => setContent({ ...content, besonderheiten })} label="Punkt hinzufügen" />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Richtwerte für Flüge mit dem L-Schein</Typography>
          <TextField
            label="Überschrift"
            fullWidth
            value={content.richtwerteHeading}
            onChange={(e) => setContent({ ...content, richtwerteHeading: e.target.value })}
            sx={{ mb: 2 }}
          />
          <ListEditor items={content.richtwerte} onChange={(richtwerte) => setContent({ ...content, richtwerte })} label="Punkt hinzufügen" />
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
