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

// Same "data only, layout stays" idea as HomeContentEditor.tsx, for the
// /infos/team page (Team.tsx). The team's shop-brand logo grid is small and
// fixed (6 brands) so it's edited here too, but not managed as a gallery.

interface TeamMember { name: string; image: string; certificate: string; paragraphs: string }
interface ShopBrand { name: string; img: string; url: string }
interface TeamData {
  eyebrow: string;
  heading: string;
  intro: string;
  ausbildungHeading: string;
  ausbildungHtml: string;
  reisenHeading: string;
  reisenHtml: string;
  teamHeading: string;
  certificateCaption: string;
  members: TeamMember[];
  shopHeading: string;
  shopIntroHtml: string;
  shopBrands: ShopBrand[];
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
        <Box sx={{ position: 'relative', width: 72, height: 54 }}>
          <Box component="img" src={url} alt="" sx={{ width: 72, height: 54, objectFit: 'cover', borderRadius: 1 }} />
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

export const TeamContentEditor = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId?: string }>();
  const id = contentId || 'team';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<TeamData | null>(null);
  const [dupMeta, setDupMeta] = useState<FixedDuplicateMeta | null>(null);
  const [primaryMeta, setPrimaryMeta] = useState<PrimaryPageSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const previewPath = `/${(!contentId && primaryMeta?.slug) || (id === 'team' ? 'infos/team' : id)}`;

  const load = () => {
    setLoadError(false);
    Promise.all([
      fetch(`/api/sitepagecontent/${id}`, { headers: authHeaders() }),
      contentId ? fetch(`/api/fixed-page-duplicates/${contentId}`, { headers: authHeaders() }) : Promise.resolve(null),
      contentId ? Promise.resolve(null) : fetch('/api/fixed-page-settings/team', { headers: authHeaders() }),
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
          if (updated.slug !== id) navigate(`/admin/team-content/${updated.slug}`, { replace: true });
          else setDupMeta(updated);
        }
        if (primaryMeta) {
          const res = await fetch('/api/fixed-page-settings/team', {
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

  const updateMember = (i: number, field: keyof TeamMember, value: string) => {
    const members = [...content.members];
    members[i] = { ...members[i], [field]: value };
    setContent({ ...content, members });
  };

  const addMember = () => {
    setContent({ ...content, members: [...content.members, { name: '', image: '', certificate: '', paragraphs: '' }] });
  };

  const removeMember = (i: number) => {
    setContent({ ...content, members: content.members.filter((_, idx) => idx !== i) });
  };

  const updateBrand = (i: number, field: keyof ShopBrand, value: string) => {
    const shopBrands = [...content.shopBrands];
    shopBrands[i] = { ...shopBrands[i], [field]: value };
    setContent({ ...content, shopBrands });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">Team - Inhalte</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component="a" href={previewPath} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<OpenInNewIcon />}>
            Vorschau
          </Button>
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>Speichern</Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Nur Texte und Bilder der Seite /infos/team - das Design/Layout bleibt exakt wie es ist.
      </Typography>

      {dupMeta && <FixedDuplicateMetaFields meta={dupMeta} onChange={setDupMeta} />}
      {primaryMeta && <PrimaryPageSettingsFields settings={primaryMeta} onChange={setPrimaryMeta} />}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Einleitung</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Kleiner Titel (oben)" fullWidth value={content.eyebrow} onChange={(e) => setContent({ ...content, eyebrow: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 8 }}><TextField label="Überschrift" fullWidth value={content.heading} onChange={(e) => setContent({ ...content, heading: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Einleitungstext" fullWidth multiline minRows={2} value={content.intro} onChange={(e) => setContent({ ...content, intro: e.target.value })} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>2-Spalten-Infoblock</Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Überschrift links" fullWidth value={content.ausbildungHeading} onChange={(e) => setContent({ ...content, ausbildungHeading: e.target.value })} sx={{ mb: 2 }} />
              <TextField label="Text links (HTML erlaubt)" fullWidth multiline minRows={4} value={content.ausbildungHtml} onChange={(e) => setContent({ ...content, ausbildungHtml: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Überschrift rechts" fullWidth value={content.reisenHeading} onChange={(e) => setContent({ ...content, reisenHeading: e.target.value })} sx={{ mb: 2 }} />
              <TextField label="Text rechts (HTML erlaubt)" fullWidth multiline minRows={4} value={content.reisenHtml} onChange={(e) => setContent({ ...content, reisenHtml: e.target.value })} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Team-Sektion</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Überschrift" fullWidth value={content.teamHeading} onChange={(e) => setContent({ ...content, teamHeading: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Zertifikat-Bildunterschrift" fullWidth value={content.certificateCaption} onChange={(e) => setContent({ ...content, certificateCaption: e.target.value })} /></Grid>
          </Grid>
          {content.members.map((member, i) => (
            <Box key={i} sx={{ mb: 3, pb: 3, borderBottom: i < content.members.length - 1 ? '1px solid #eee' : 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: '#666' }}>{member.name || `Mitglied ${i + 1}`}</Typography>
                <IconButton onClick={() => removeMember(i)} title="Mitglied löschen">
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}><TextField label="Name" fullWidth value={member.name} onChange={(e) => updateMember(i, 'name', e.target.value)} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ImageSlot url={member.image} onUploaded={(url) => updateMember(i, 'image', url)} label="Profilbild ersetzen" />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <ImageSlot url={member.certificate} onUploaded={(url) => updateMember(i, 'certificate', url)} label={member.certificate ? 'Zertifikat ersetzen' : 'Zertifikat hochladen (optional)'} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Text (Absätze durch Leerzeile trennen)"
                    fullWidth
                    multiline
                    minRows={4}
                    value={member.paragraphs}
                    onChange={(e) => updateMember(i, 'paragraphs', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} onClick={addMember}>Mitglied hinzufügen</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Shop</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Überschrift" fullWidth value={content.shopHeading} onChange={(e) => setContent({ ...content, shopHeading: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 8 }}><TextField label="Einleitungstext (HTML erlaubt)" fullWidth multiline minRows={2} value={content.shopIntroHtml} onChange={(e) => setContent({ ...content, shopIntroHtml: e.target.value })} /></Grid>
          </Grid>
          <Typography variant="subtitle2" sx={{ mb: 2, color: '#666' }}>Marken (Logo-Grid)</Typography>
          <Grid container spacing={3}>
            {content.shopBrands.map((brand, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <ImageSlot url={brand.img} onUploaded={(url) => updateBrand(i, 'img', url)} label="Logo ersetzen" />
                <TextField label="Link" fullWidth value={brand.url} onChange={(e) => updateBrand(i, 'url', e.target.value)} sx={{ mt: 2 }} />
              </Grid>
            ))}
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
