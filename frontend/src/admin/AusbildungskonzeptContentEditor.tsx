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
// the /ausbildung/ausbildungskonzept page (Ausbildungskonzept.tsx). No
// gallery on this page at all, so nothing is excluded here.

interface TableRow { name: string; duration: string; content: string; goal: string; bgColor: string }
interface AusbildungskonzeptData {
  heading: string;
  subheading: string;
  paragraph1: string;
  paragraph2: string;
  bulletPoints: string[];
  pathsHtml: string;
  graphicImage: string;
  graphicCaption: string;
  tableRows: TableRow[];
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

export const AusbildungskonzeptContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'ausbildungskonzept';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<AusbildungskonzeptData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || (id === 'ausbildungskonzept' ? 'ausbildung/ausbildungskonzept' : id)}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/ausbildungskonzept', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/ausbildungskonzept-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/ausbildungskonzept', {
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

  const updateBulletPoint = (i: number, value: string) => {
    const bulletPoints = [...content.bulletPoints];
    bulletPoints[i] = value;
    setContent({ ...content, bulletPoints });
  };
  const addBulletPoint = () => setContent({ ...content, bulletPoints: [...content.bulletPoints, ''] });
  const removeBulletPoint = (i: number) => setContent({ ...content, bulletPoints: content.bulletPoints.filter((_, idx) => idx !== i) });

  const updateTableRow = (i: number, field: keyof TableRow, value: string) => {
    const tableRows = [...content.tableRows];
    tableRows[i] = { ...tableRows[i], [field]: value };
    setContent({ ...content, tableRows });
  };
  const addTableRow = () => setContent({ ...content, tableRows: [...content.tableRows, { name: '', duration: '', content: '', goal: '', bgColor: '#ffffff' }] });
  const removeTableRow = (i: number) => setContent({ ...content, tableRows: content.tableRows.filter((_, idx) => idx !== i) });

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">Ausbildungskonzept - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte der Seite /ausbildung/ausbildungskonzept - das Design/Layout bleibt exakt wie es ist.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Einleitung</Typography>
          <TextField label="Überschrift" fullWidth value={content.heading} onChange={(e) => setContent({ ...content, heading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Unterüberschrift" fullWidth value={content.subheading} onChange={(e) => setContent({ ...content, subheading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 1" fullWidth multiline minRows={2} value={content.paragraph1} onChange={(e) => setContent({ ...content, paragraph1: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Absatz 2" fullWidth multiline minRows={2} value={content.paragraph2} onChange={(e) => setContent({ ...content, paragraph2: e.target.value })} sx={{ mb: 2 }} />

          <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>Aufzählungspunkte</Typography>
          {content.bulletPoints.map((point, i) => (
            <Grid container spacing={2} key={i} sx={{ mb: 1.5, alignItems: 'center' }}>
              <Grid size={{ xs: 11 }}><TextField label={`Punkt ${i + 1}`} fullWidth value={point} onChange={(e) => updateBulletPoint(i, e.target.value)} /></Grid>
              <Grid size={{ xs: 1 }}>
                <IconButton onClick={() => removeBulletPoint(i)} title="Punkt löschen">
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button startIcon={<AddIcon />} onClick={addBulletPoint} sx={{ mb: 2 }}>Punkt hinzufügen</Button>

          <TextField
            label="Ausbildungswege-Text (HTML erlaubt)"
            fullWidth
            multiline
            minRows={2}
            value={content.pathsHtml}
            onChange={(e) => setContent({ ...content, pathsHtml: e.target.value })}
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Grafik</Typography>
          <TextField label="Bild-URL" fullWidth value={content.graphicImage} onChange={(e) => setContent({ ...content, graphicImage: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Bildunterschrift" fullWidth value={content.graphicCaption} onChange={(e) => setContent({ ...content, graphicCaption: e.target.value })} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Kursvergleich-Tabelle</Typography>
          {content.tableRows.map((row, i) => (
            <Box key={i} sx={{ mb: 3, pb: 3, borderBottom: i < content.tableRows.length - 1 ? '1px solid #eee' : 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: '#666' }}>{row.name || `Zeile ${i + 1}`}</Typography>
                <IconButton onClick={() => removeTableRow(i)} title="Zeile löschen">
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}><TextField label="Kurs" fullWidth value={row.name} onChange={(e) => updateTableRow(i, 'name', e.target.value)} /></Grid>
                <Grid size={{ xs: 12, sm: 4 }}><TextField label="Zeit / Dauer" fullWidth multiline value={row.duration} onChange={(e) => updateTableRow(i, 'duration', e.target.value)} helperText="Mehrere Zeilen: einfach Zeilenumbruch verwenden" /></Grid>
                <Grid size={{ xs: 12, sm: 4 }}><TextField label="Hintergrundfarbe" fullWidth value={row.bgColor} onChange={(e) => updateTableRow(i, 'bgColor', e.target.value)} helperText="z.B. #80c533" /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><TextField label="Kursinhalt" fullWidth multiline minRows={2} value={row.content} onChange={(e) => updateTableRow(i, 'content', e.target.value)} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><TextField label="Kursziel" fullWidth multiline minRows={2} value={row.goal} onChange={(e) => updateTableRow(i, 'goal', e.target.value)} /></Grid>
              </Grid>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} onClick={addTableRow}>Zeile hinzufügen</Button>
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
