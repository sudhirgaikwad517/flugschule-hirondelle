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
// /performance/sicherheitstraining page (Sicherheitstraining.tsx). The
// hero image/video still comes from the separate Seitenmedien feature and
// the Impressionen gallery from the separate Galerie feature - neither is
// edited here.

interface SicherheitstrainingData {
  heading: string;
  introHeading: string;
  introParagraphs: string[];
  offerHeading: string;
  offerBullets: string[];
  aufbauHeading: string;
  aufbauItems: string[];
  kurspreisNote: string;
  kurspreisAmount: string;
  zusatzkostenText: string;
  gutscheinHeading: string;
  gutscheinDescription: string;
  ablaufHeading: string;
  ablaufParagraphs: string[];
  uebungenHeading: string;
  uebungenList1: string[];
  uebungenList2: string[];
  teamHeading: string;
  teamParagraph: string;
  teamMemberImage: string;
  teamMemberText: string;
  unterkunftHeading: string;
  unterkunftParagraphs: string[];
  unterkunftNote: string;
  leistungenHeading: string;
  leistungen: string[];
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

// A labeled list of plain text lines (paragraphs, bullets) - add/remove,
// used repeatedly below instead of duplicating the repeater logic per field.
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
    <Box sx={{ mb: 2 }}>
      {items.map((item, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: multiline ? 'flex-start' : 'center', gap: 1, mb: 1 }}>
          <TextField
            label={`${label} ${i + 1}`}
            fullWidth
            multiline={multiline}
            minRows={multiline ? 2 : undefined}
            value={item}
            onChange={(e) => update(i, e.target.value)}
          />
          <IconButton onClick={() => remove(i)} title="Löschen" sx={{ mt: multiline ? 1 : 0 }}>
            <DeleteIcon fontSize="small" color="error" />
          </IconButton>
        </Box>
      ))}
      <Button startIcon={<AddIcon />} onClick={add} size="small">{label} hinzufügen</Button>
    </Box>
  );
};

export const SicherheitstrainingContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'sicherheitstraining';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<SicherheitstrainingData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || (id === 'sicherheitstraining' ? 'performance/sicherheitstraining' : id)}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/sicherheitstraining', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/sicherheitstraining-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/sicherheitstraining', {
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
        <Typography variant="h5">Sicherheitstraining - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte der Seite /performance/sicherheitstraining - das Design/Layout bleibt exakt wie es ist. Titelbild/Video wird separat über Komponenten &gt; Seitenmedien verwaltet, die Bildergalerie separat über Komponenten &gt; Galerie.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Einleitung</Typography>
          <TextField label="Überschrift" fullWidth value={content.heading} onChange={(e) => setContent({ ...content, heading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Zwischenüberschrift" fullWidth value={content.introHeading} onChange={(e) => setContent({ ...content, introHeading: e.target.value })} sx={{ mb: 2 }} />
          <StringListEditor label="Absatz" items={content.introParagraphs} onChange={(introParagraphs) => setContent({ ...content, introParagraphs })} multiline />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Angebot</Typography>
          <TextField label="Überschrift" fullWidth value={content.offerHeading} onChange={(e) => setContent({ ...content, offerHeading: e.target.value })} sx={{ mb: 2 }} />
          <StringListEditor label="Punkt" items={content.offerBullets} onChange={(offerBullets) => setContent({ ...content, offerBullets })} multiline />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Trainingsaufbau</Typography>
          <TextField label="Überschrift" fullWidth value={content.aufbauHeading} onChange={(e) => setContent({ ...content, aufbauHeading: e.target.value })} sx={{ mb: 2 }} />
          <StringListEditor label="Punkt" items={content.aufbauItems} onChange={(aufbauItems) => setContent({ ...content, aufbauItems })} />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Buchungskarte &amp; Gutschein</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 8 }}><TextField label="Kurspreis - Hinweis" fullWidth value={content.kurspreisNote} onChange={(e) => setContent({ ...content, kurspreisNote: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Kurspreis - Betrag" fullWidth value={content.kurspreisAmount} onChange={(e) => setContent({ ...content, kurspreisAmount: e.target.value })} /></Grid>
          </Grid>
          <TextField label="Zusatzkosten" fullWidth value={content.zusatzkostenText} onChange={(e) => setContent({ ...content, zusatzkostenText: e.target.value })} sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Gutschein - Überschrift" fullWidth value={content.gutscheinHeading} onChange={(e) => setContent({ ...content, gutscheinHeading: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 8 }}><TextField label="Gutschein - Beschreibung" fullWidth value={content.gutscheinDescription} onChange={(e) => setContent({ ...content, gutscheinDescription: e.target.value })} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Trainingsablauf</Typography>
          <TextField label="Überschrift" fullWidth value={content.ablaufHeading} onChange={(e) => setContent({ ...content, ablaufHeading: e.target.value })} sx={{ mb: 2 }} />
          <StringListEditor label="Absatz" items={content.ablaufParagraphs} onChange={(ablaufParagraphs) => setContent({ ...content, ablaufParagraphs })} multiline />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Flugübungen</Typography>
          <TextField label="Überschrift" fullWidth value={content.uebungenHeading} onChange={(e) => setContent({ ...content, uebungenHeading: e.target.value })} sx={{ mb: 2 }} />
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>Liste links</Typography>
              <StringListEditor label="Übung" items={content.uebungenList1} onChange={(uebungenList1) => setContent({ ...content, uebungenList1 })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>Liste rechts</Typography>
              <StringListEditor label="Übung" items={content.uebungenList2} onChange={(uebungenList2) => setContent({ ...content, uebungenList2 })} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Team</Typography>
          <TextField label="Überschrift" fullWidth value={content.teamHeading} onChange={(e) => setContent({ ...content, teamHeading: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Text" fullWidth multiline minRows={4} value={content.teamParagraph} onChange={(e) => setContent({ ...content, teamParagraph: e.target.value })} sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Bild-URL" fullWidth value={content.teamMemberImage} onChange={(e) => setContent({ ...content, teamMemberImage: e.target.value })} helperText="Wird über Komponenten > Medien hochgeladen, hier nur die URL." /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Name / Funktion" fullWidth multiline minRows={2} value={content.teamMemberText} onChange={(e) => setContent({ ...content, teamMemberText: e.target.value })} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Unterkunft / Region</Typography>
          <TextField label="Überschrift" fullWidth value={content.unterkunftHeading} onChange={(e) => setContent({ ...content, unterkunftHeading: e.target.value })} sx={{ mb: 2 }} />
          <StringListEditor label="Absatz" items={content.unterkunftParagraphs} onChange={(unterkunftParagraphs) => setContent({ ...content, unterkunftParagraphs })} multiline />
          <TextField label="Hinweis (fett, am Ende)" fullWidth value={content.unterkunftNote} onChange={(e) => setContent({ ...content, unterkunftNote: e.target.value })} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Unsere Leistungen</Typography>
          <TextField label="Überschrift" fullWidth value={content.leistungenHeading} onChange={(e) => setContent({ ...content, leistungenHeading: e.target.value })} sx={{ mb: 2 }} />
          <StringListEditor label="Leistung" items={content.leistungen} onChange={(leistungen) => setContent({ ...content, leistungen })} />
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
