import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotify } from 'react-admin';
import { Box, Card, CardContent, Typography, TextField, Button, Grid, Alert, IconButton, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import UploadIcon from '@mui/icons-material/Upload';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { type FixedDuplicateMeta, FixedDuplicateMetaFields } from './FixedDuplicateMetaFields';
import { type PrimaryPageSettings, PrimaryPageSettingsFields } from './PrimaryPageSettingsFields';

// Own dedicated editor for the "Winterkasten" Gelände detail article
// (/infos/gelaende/winterkasten) - replaces the old single raw-HTML-blob
// textarea (was part of the shared GelaendeArticleContentEditor.tsx
// factory) with real per-field editing, one field per line, grouped into
// sections mirroring the page's own layout - same convention as every
// other page editor this session (e.g. TeamContentEditor.tsx).

interface EckdatenRow { label: string; value: string }
interface WinterkastenData {
  title: string;
  warningBanner: string;
  eckdatenRows: EckdatenRow[];
  routenplanerUrl: string;
  addressHeading: string;
  addressText: string;
  pdfUrl: string;
  pdfLabel: string;
  parkplatzHeading: string;
  parkplatzText: string;
  vomParkplatzHeading: string;
  vomParkplatzText: string;
  mapEmbedUrl: string;
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

// PDF upload slot for the "PDF-Download" button's file - shows the current
// filename with an "ansehen" link instead of a thumbnail, and accepts only
// PDFs. Same idea as the ImageSlot pattern used elsewhere, just for PDFs.
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

// Add/remove label+value rows (Eckdaten) - mirrors GelaendeContentEditor.tsx's
// BoxesEditor pattern used for the overview page's Ortsschild boxes.
const EckdatenRowsEditor = ({
  rows,
  onChange,
}: {
  rows: EckdatenRow[];
  onChange: (next: EckdatenRow[]) => void;
}) => {
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
          <Grid size={{ xs: 12, sm: 5 }}><TextField label="Label" fullWidth value={row.label} onChange={(e) => update(i, 'label', e.target.value)} helperText="z.B. Ausrichtung" /></Grid>
          <Grid size={{ xs: 10, sm: 6 }}><TextField label="Wert" fullWidth value={row.value} onChange={(e) => update(i, 'value', e.target.value)} helperText="z.B. Südost-Süd" /></Grid>
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

export const WinterkastenContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'winterkasten';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<WinterkastenData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || (id === 'winterkasten' ? 'infos/gelaende/winterkasten' : id)}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/winterkasten', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/winterkasten-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/winterkasten', {
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
        <Typography variant="h5">Winterkasten - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte der Seite {previewPath} - das Design/Layout bleibt exakt wie es ist.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Warnhinweis</Typography>
          <TextField
            label="Warnhinweis-Text"
            fullWidth
            value={content.warningBanner}
            onChange={(e) => setContent({ ...content, warningBanner: e.target.value })}
            helperText="Leer lassen, um den Warnhinweis auszublenden."
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Eckdaten</Typography>
          <EckdatenRowsEditor rows={content.eckdatenRows} onChange={(eckdatenRows) => setContent({ ...content, eckdatenRows })} />
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
            helperText="Google- oder Apple-Maps-Link für den 'Routenplaner für Smartphones'-Button"
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Adresse/Anfahrt</Typography>
          <TextField label="Überschrift" fullWidth value={content.addressHeading} onChange={(e) => setContent({ ...content, addressHeading: e.target.value })} sx={{ mb: 2 }} />
          <TextField
            label="Adresse (HTML erlaubt)"
            fullWidth
            multiline
            minRows={2}
            value={content.addressText}
            onChange={(e) => setContent({ ...content, addressText: e.target.value })}
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>PDF-Download</Typography>
          <FileSlot url={content.pdfUrl} onUploaded={(url) => setContent({ ...content, pdfUrl: url })} label={content.pdfUrl ? 'PDF ersetzen' : 'PDF hochladen'} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="PDF-URL" fullWidth value={content.pdfUrl} onChange={(e) => setContent({ ...content, pdfUrl: e.target.value })} helperText="Leer lassen, um den Button auszublenden." /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Button-Text" fullWidth value={content.pdfLabel} onChange={(e) => setContent({ ...content, pdfLabel: e.target.value })} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Parkplatz</Typography>
          <TextField label="Überschrift" fullWidth value={content.parkplatzHeading} onChange={(e) => setContent({ ...content, parkplatzHeading: e.target.value })} sx={{ mb: 2 }} />
          <TextField
            label="Parkplatz-Text (HTML erlaubt)"
            fullWidth
            multiline
            minRows={2}
            value={content.parkplatzText}
            onChange={(e) => setContent({ ...content, parkplatzText: e.target.value })}
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Vom Parkplatz zum Fluggelände</Typography>
          <TextField label="Überschrift" fullWidth value={content.vomParkplatzHeading} onChange={(e) => setContent({ ...content, vomParkplatzHeading: e.target.value })} sx={{ mb: 2 }} />
          <TextField
            label="Wegbeschreibung (HTML erlaubt)"
            fullWidth
            multiline
            minRows={3}
            value={content.vomParkplatzText}
            onChange={(e) => setContent({ ...content, vomParkplatzText: e.target.value })}
          />
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
