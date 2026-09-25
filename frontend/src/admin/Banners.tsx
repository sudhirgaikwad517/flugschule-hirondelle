import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  TextField as MuiTextField,
  Switch,
  Tooltip,
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNotify } from 'react-admin';

// Werbebanner, rebuilt as a custom two-group manager instead of a flat
// react-admin CRUD list of 71 individual rows (one per image) - the site
// only ever has two real slideshow slots (see Banner.tsx: "home" - the
// home page's own banner, "subpage" - every other page's shared banner),
// so this mirrors that directly: an overview with one card per slot, and
// clicking a card opens a thumbnail-grid manager (same interaction model
// as Gallery.tsx's GalleryImagesInput) with upload, drag-to-reorder,
// per-tile hide/show, title/link editing and delete - the "add, remove,
// hide, reorder" operations requested, all on the real AdBanner rows via
// the existing /api/banners REST routes (still one row per image; there's
// no single JSON-array field here to bind a form to, so this talks to the
// API directly instead of going through react-admin's data provider).
interface AdBannerRow {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string | null;
  position: string;
  published: boolean;
  order: number;
}

const BANNER_GROUPS = [
  {
    id: 'home',
    label: 'Startseite',
    description: 'Slideshow ganz oben auf der Startseite - Titel wird als Bildunterschrift angezeigt.',
  },
  {
    id: 'subpage',
    label: 'Andere Seiten',
    description: 'Gemeinsame Slideshow für alle übrigen Seiten - Titel wird hier nirgends angezeigt.',
  },
] as const;

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

const fetchBannersForPosition = async (position: string): Promise<AdBannerRow[]> => {
  const res = await fetch(`/api/banners?position=${position}&_sort=order&_order=ASC&_end=1000`, {
    headers: authHeaders(),
  });
  if (!res.ok) return [];
  return res.json();
};

// Landing screen at /admin/banners - one card per real banner slot, each
// showing its own live thumbnail + image count so this reads like a
// preview instead of a bare menu.
export const BannerGroupsOverview = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState<Record<string, { count: number; thumb: string | null }>>({});

  useEffect(() => {
    BANNER_GROUPS.forEach((group) => {
      fetchBannersForPosition(group.id).then((rows) => {
        setCounts((prev) => ({
          ...prev,
          [group.id]: { count: rows.length, thumb: rows[0]?.imageUrl || null },
        }));
      });
    });
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 0.5 }}>Werbebanner</Typography>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Die Startseite und alle übrigen Seiten haben jeweils eine eigene Bilder-Slideshow - hier auswählen, um
        Bilder hinzuzufügen, zu entfernen, auszublenden oder neu anzuordnen.
      </Typography>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {BANNER_GROUPS.map((group) => {
          const info = counts[group.id];
          return (
            <Box
              key={group.id}
              onClick={() => navigate(`/admin/banners/manage/${group.id}`)}
              sx={{
                width: 320,
                border: '1px solid #e0e0e0',
                borderRadius: '10px',
                overflow: 'hidden',
                cursor: 'pointer',
                bgcolor: '#fff',
                transition: 'box-shadow 0.15s, transform 0.15s',
                '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.12)', transform: 'translateY(-2px)' },
              }}
            >
              <Box sx={{ height: 160, bgcolor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {info?.thumb ? (
                  <Box component="img" src={info.thumb} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <ImageIcon sx={{ fontSize: 40, color: '#bbb' }} />
                )}
              </Box>
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{group.label}</Typography>
                  <Typography variant="caption" sx={{ color: '#888' }}>
                    {info ? `${info.count} Bild${info.count === 1 ? '' : 'er'}` : '...'}
                  </Typography>
                </Box>
                <ChevronRightIcon sx={{ color: '#999' }} />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// One thumbnail tile in the manager grid below - image, drag handle,
// hide/show switch, inline title/link fields (revealed via the edit
// icon so the grid stays compact by default) and a remove button.
const BannerTile = ({
  banner,
  index,
  isHomeGroup,
  dragIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onTogglePublished,
  onFieldSave,
  onRemove,
}: {
  banner: AdBannerRow;
  index: number;
  isHomeGroup: boolean;
  dragIndex: number | null;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onTogglePublished: (banner: AdBannerRow) => void;
  onFieldSave: (banner: AdBannerRow, field: 'title' | 'linkUrl', value: string) => void;
  onRemove: (banner: AdBannerRow) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState(banner.title);
  const [linkUrl, setLinkUrl] = useState(banner.linkUrl || '');

  return (
    <Box
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden',
        bgcolor: '#fff',
        opacity: dragIndex === index ? 0.4 : banner.published ? 1 : 0.55,
      }}
    >
      <Box sx={{ position: 'relative', aspectRatio: '16 / 9', cursor: 'grab', bgcolor: '#f5f5f5' }}>
        <Box component="img" src={banner.imageUrl} alt={banner.title} loading="lazy" sx={{
          width: '100%', height: '100%', objectFit: 'cover', display: 'block',
        }} />
        <IconButton
          size="small"
          onClick={() => onRemove(banner)}
          sx={{
            position: 'absolute', top: 4, right: 4,
            bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', '&:hover': { bgcolor: 'rgba(200,0,0,0.8)' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        {!banner.published && (
          <Box sx={{
            position: 'absolute', bottom: 0, left: 0, right: 0, bgcolor: 'rgba(0,0,0,0.65)',
            color: '#fff', fontSize: '11px', textAlign: 'center', py: 0.25,
          }}>
            Ausgeblendet
          </Box>
        )}
      </Box>
      <Box sx={{ p: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
          <Typography
            variant="body2"
            onClick={() => setExpanded((e) => !e)}
            sx={{ cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}
            title="Klicken zum Bearbeiten"
          >
            {banner.title || <em style={{ color: '#999' }}>Ohne Titel</em>}
          </Typography>
          <Tooltip title={banner.published ? 'Sichtbar - klicken zum Ausblenden' : 'Ausgeblendet - klicken zum Anzeigen'}>
            <Switch size="small" checked={banner.published} onChange={() => onTogglePublished(banner)} />
          </Tooltip>
        </Box>
        {expanded && (
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <MuiTextField
              label={isHomeGroup ? 'Titel (Bildunterschrift)' : 'Titel (nur intern, keine Bildunterschrift)'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => { if (title !== banner.title) onFieldSave(banner, 'title', title); }}
              size="small"
              fullWidth
            />
            <MuiTextField
              label="Ziel-Link (optional)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onBlur={() => { if (linkUrl !== (banner.linkUrl || '')) onFieldSave(banner, 'linkUrl', linkUrl); }}
              size="small"
              fullWidth
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

// The manager itself, at /admin/banners/manage/:position.
export const BannerGroupManager = () => {
  const { position } = useParams<{ position: string }>();
  const navigate = useNavigate();
  const notify = useNotify();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [banners, setBanners] = useState<AdBannerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const group = BANNER_GROUPS.find((g) => g.id === position);
  const isHomeGroup = position === 'home';

  const load = () => {
    if (!position) return;
    setLoading(true);
    fetchBannersForPosition(position).then((rows) => {
      setBanners(rows);
      setLoading(false);
    });
  };

  useEffect(load, [position]);

  const uploadOne = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', headers: authHeaders(), body: formData });
      const data = await res.json();
      if (res.ok) return data.url;
      notify(data.message || `Fehler beim Upload von ${file.name}`, { type: 'warning' });
      return null;
    } catch {
      notify(`Netzwerkfehler beim Upload von ${file.name}`, { type: 'warning' });
      return null;
    }
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0 || !position) return;
    setUploading(true);
    const uploaded = await Promise.all(Array.from(files).map(uploadOne));
    const successUrls = uploaded.filter((u): u is string => !!u);
    await Promise.all(
      successUrls.map((imageUrl, i) =>
        fetch('/api/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({
            title: '',
            imageUrl,
            position,
            order: banners.length + i,
            published: true,
          }),
        })
      )
    );
    if (successUrls.length > 0) {
      notify(successUrls.length === 1 ? 'Bild hinzugefügt' : `${successUrls.length} Bilder hinzugefügt`, { type: 'success' });
      load();
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTogglePublished = async (banner: AdBannerRow) => {
    setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, published: !b.published } : b)));
    await fetch(`/api/banners/${banner.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ published: !banner.published }),
    });
  };

  const handleFieldSave = async (banner: AdBannerRow, field: 'title' | 'linkUrl', value: string) => {
    setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, [field]: value } : b)));
    await fetch(`/api/banners/${banner.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ [field]: value }),
    });
    notify('Gespeichert', { type: 'success' });
  };

  const handleRemove = async (banner: AdBannerRow) => {
    setBanners((prev) => prev.filter((b) => b.id !== banner.id));
    await fetch(`/api/banners/${banner.id}`, { method: 'DELETE', headers: authHeaders() });
    notify('Bild entfernt', { type: 'success' });
  };

  // Persists the whole new order (every row's `order` set to its new
  // index) - simplest correct approach for a list this size (well under
  // 100 rows even for the fuller "home" group).
  const persistOrder = async (ordered: AdBannerRow[]) => {
    await Promise.all(
      ordered.map((b, i) =>
        b.order === i
          ? Promise.resolve()
          : fetch(`/api/banners/${b.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', ...authHeaders() },
              body: JSON.stringify({ order: i }),
            })
      )
    );
  };

  const moveTo = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= banners.length || to >= banners.length) return;
    const next = [...banners];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setBanners(next);
    persistOrder(next);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <IconButton onClick={() => navigate('/admin/banners')} title="Zurück zur Übersicht">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">{group?.label || position}</Typography>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 3, ml: 6 }}>
        {group?.description}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <UploadIcon />}
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? 'Lädt hoch...' : 'Bilder hochladen'}
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleFilesSelected(e.target.files)} />
        <Typography variant="body2" sx={{ color: '#666' }}>
          {banners.length === 0 ? 'Noch keine Bilder' : `${banners.length} Bild${banners.length === 1 ? '' : 'er'} - per Ziehen neu anordnen`}
        </Typography>
      </Box>

      {loading ? (
        <CircularProgress size={24} />
      ) : banners.length === 0 ? (
        <Box sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
          py: 6, border: '1px dashed #ccc', borderRadius: '8px', color: '#999',
        }}>
          <ImageIcon fontSize="large" />
          <Typography variant="body2">Für diese Slideshow wurden noch keine Bilder hinzugefügt.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {banners.map((banner, index) => (
            <BannerTile
              key={banner.id}
              banner={banner}
              index={index}
              isHomeGroup={isHomeGroup}
              dragIndex={dragIndex}
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null) moveTo(dragIndex, index);
                setDragIndex(null);
              }}
              onDragEnd={() => setDragIndex(null)}
              onTogglePublished={handleTogglePublished}
              onFieldSave={handleFieldSave}
              onRemove={handleRemove}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};
