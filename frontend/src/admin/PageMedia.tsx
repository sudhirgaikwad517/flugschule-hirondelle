import React, { useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

// "Seitenmedien" used to be a generic slug-picker covering 12 pages, but
// checking what each page actually reads from it (frontend/src/pages/*.tsx)
// showed only one field is still genuinely load-bearing: Sicherheitstraining
// (/performance/sicherheitstraining)'s hero image/video toggle - see
// Sicherheitstraining.tsx's own `media.contentImageUrl` /
// `media.contentMediaType` / `media.contentYoutubeUrl` reads, and
// SicherheitstrainingContentEditor.tsx's own note that this field is
// deliberately kept separate from it. Every other page/field
// (headerImageUrl, galleryImages, the other 11 page choices) turned out to
// be dead: Home.tsx's own galleryImages read is now superseded by
// HomeContentEditor's own per-card image uploads (confirmed no PageMedia
// row for "home" even exists in the database), and no other page reads
// this API at all. So this is now a single fixed settings screen for that
// one real field, instead of a full CRUD list/edit/create for 12 mostly-
// unused rows - same "single fixed record" pattern as
// CookieConsentConfigPage.tsx, adapted since PageMedia's row is
// slug-keyed rather than a true singleton (created on first save here if
// it doesn't exist yet).
const SLUG = 'sicherheitstraining';
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

interface MediaState {
  id?: string;
  contentMediaType: 'IMAGE' | 'VIDEO';
  contentImageUrl: string;
  contentYoutubeUrl: string;
}

const DEFAULTS: MediaState = { contentMediaType: 'IMAGE', contentImageUrl: '', contentYoutubeUrl: '' };

export const PageMediaConfigPage = () => {
  const notify = useNotify();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [media, setMedia] = useState<MediaState>(DEFAULTS);

  useEffect(() => {
    fetch('/api/pagemedia', { headers: authHeaders() })
      .then((res) => (res.ok ? res.json() : []))
      .then((rows: any[]) => {
        const row = Array.isArray(rows) ? rows.find((r) => r.slug === SLUG) : null;
        if (row) {
          setMedia({
            ...DEFAULTS,
            ...row,
            contentImageUrl: row.contentImageUrl ?? '',
            contentYoutubeUrl: row.contentYoutubeUrl ?? '',
          });
        }
        setLoading(false);
      })
      .catch(() => {
        notify('Fehler beim Laden', { type: 'error' });
        setLoading(false);
      });
  }, [notify]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', headers: authHeaders(), body: formData });
      const data = await res.json();
      if (res.ok) setMedia((prev) => ({ ...prev, contentImageUrl: data.url }));
      else notify(data.message || 'Fehler beim Upload', { type: 'warning' });
    } catch {
      notify('Netzwerkfehler beim Upload', { type: 'warning' });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const body = { slug: SLUG, ...media };
    try {
      const res = media.id
        ? await fetch(`/api/pagemedia/${media.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify(body),
          })
        : await fetch('/api/pagemedia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify(body),
          });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        notify(data.error || 'Fehler beim Speichern', { type: 'error' });
        return;
      }
      setMedia({ ...DEFAULTS, ...data });
      notify('Gespeichert', { type: 'success' });
    } catch {
      notify('Netzwerkfehler beim Speichern', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CircularProgress sx={{ m: 3 }} size={24} />;

  return (
    <Box sx={{ p: 3, maxWidth: 640 }}>
      <Typography variant="h5" sx={{ mb: 0.5 }}>Seitenmedien</Typography>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Titelbild / Video für "Performance &gt; Sicherheitstraining". Jede andere Seite verwaltet ihre Bilder
        mittlerweile direkt unter Admin &gt; Seiten bzw. Admin &gt; Galerie.
      </Typography>

      <Box sx={{ p: '20px', bgcolor: '#e3f2fd', borderRadius: '8px' }}>
        <Typography variant="subtitle1" sx={{ mb: 1.5 }}>Was soll auf der Seite angezeigt werden?</Typography>
        <RadioGroup
          row
          value={media.contentMediaType}
          onChange={(e) => setMedia((prev) => ({ ...prev, contentMediaType: e.target.value as 'IMAGE' | 'VIDEO' }))}
        >
          <FormControlLabel value="IMAGE" control={<Radio />} label="Bild" />
          <FormControlLabel value="VIDEO" control={<Radio />} label="YouTube Video" />
        </RadioGroup>

        <Box sx={{ mt: 2 }}>
          <Button component="label" variant="outlined" size="small" disabled={uploading}>
            {uploading ? 'Lädt hoch...' : media.contentImageUrl ? 'Bild ersetzen' : 'Bild hochladen'}
            <input type="file" accept="image/*" hidden onChange={handleUpload} />
          </Button>
          {media.contentImageUrl && (
            <Box sx={{ mt: 1.5 }}>
              <Box component="img" src={media.contentImageUrl} alt="" sx={{ maxWidth: 240, borderRadius: '4px', border: '1px solid #ccc', display: 'block' }} />
            </Box>
          )}
        </Box>

        <TextField
          label="YouTube Embed Link (z.B. https://www.youtube.com/embed/...)"
          value={media.contentYoutubeUrl}
          onChange={(e) => setMedia((prev) => ({ ...prev, contentYoutubeUrl: e.target.value }))}
          fullWidth
          size="small"
          sx={{ mt: 2, bgcolor: '#fff' }}
        />
      </Box>

      <Button
        variant="contained"
        color="success"
        startIcon={<SaveIcon />}
        onClick={handleSave}
        disabled={saving}
        sx={{ mt: 3 }}
      >
        Speichern
      </Button>
    </Box>
  );
};
