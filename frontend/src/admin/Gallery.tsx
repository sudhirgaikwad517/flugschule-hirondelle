import React, { useEffect, useRef, useState } from 'react';
import {
  List,
  Datagrid,
  TextField,
  EditButton,
  Edit,
  Create,
  SimpleForm,
  AutocompleteInput,
  useInput,
  useNotify,
  useRecordContext,
  useListContext,
  useRefresh,
  ExportButton,
} from 'react-admin';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  TextField as MuiTextField,
  InputAdornment,
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

// Standalone "Galerie" admin feature, separate from PageMedia.tsx on purpose
// (per request: don't touch PageMedia's existing header/content image
// behavior). This screen only manages a slug -> list of gallery image URLs,
// backed by the PageGallery model / /api/pagegallery routes, and is read by
// frontend/src/hooks/usePageGallery.ts on each public page.
// To revert: delete this file and its Resource/menu registrations in
// AdminApp.tsx and CustomMenu.tsx.
//
// The image manager below (GalleryImagesInput) replaces an earlier version
// built from react-admin's ArrayInput/SimpleFormIterator, which stacked one
// full-size image per row - usable, but nothing like a "gallery": no grid,
// no way to see everything at once, no drag-to-reorder. This rewrite is a
// compact thumbnail grid (upload button, drag to reorder, hover-to-remove,
// filename shown per tile) - inspired by Joomla's Media Manager grid view,
// without reproducing its full file-browser (folders/search/multi-select
// toolbar) since a single page's gallery doesn't need that.

// The pages whose "Impressionen" gallery this screen can manage. Only pages
// that actually call usePageGallery() belong here - Ausbildung,
// Ausbildungskonzept and Vogesen-Tour have no gallery section on the page
// yet, so they're deliberately left out (picking them here would silently
// do nothing on the site).
const PAGE_CHOICES = [
  { id: 'schnupperkurs', name: 'Ausbildung - Schnupperkurs' },
  { id: 'l-schein', name: 'Ausbildung - L-Schein' },
  { id: 'a-schein', name: 'Ausbildung - A-Schein' },
  { id: 'b-schein', name: 'Ausbildung - B-Schein' },
  { id: 'windenschein', name: 'Ausbildung - Winde' },
  { id: 'tandemschein', name: 'Ausbildung - Tandem' },
  { id: 'sicherheitstraining', name: 'Performance - Sicherheitstraining' },
  { id: 'rettungsgeraetetraining', name: 'Performance - Rettungsgerätetraining' },
  { id: 'refresher', name: 'Performance - Refresher' },
  { id: 'groundhandling', name: 'Performance - Groundhandling' },
  { id: 'brasilien-tour', name: 'Reisen - Brasilien' },
  { id: 'kolumbien-tour', name: 'Reisen - Kolumbien' },
  { id: 'suedafrika-tour', name: 'Reisen - Südafrika' },
  { id: 'bassano-tour', name: 'Reisen - Bassano' },
  { id: 'griechenland-tour', name: 'Reisen - Griechenland' },
  { id: 'slowenien-tour', name: 'Reisen - Slowenien' },
  { id: 'bergamo-tour', name: 'Reisen - Bergamo' },
  { id: 'savoye-tour', name: 'Reisen - Savoye' },
  { id: 'pfalz-tour', name: 'Reisen - Pfalz' },
  { id: '2-jahres-check', name: 'Service - 2-Jahres-Check' },
];

// Turns free-typed text (e.g. "Test Neue Seite") into a URL-path-style slug
// (e.g. "test-neue-seite") - reduces the chance of a mismatch between what
// an admin types here and the exact string a developer later passes to
// usePageGallery('exact-slug', ...) in that page's code.
const normalizeSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Pull a readable filename out of a stored image URL for display on each tile.
const filenameOf = (url: string) => {
  try {
    return decodeURIComponent(url.split('/').pop() || url);
  } catch {
    return url;
  }
};

// A compact thumbnail-grid gallery manager bound to the `images` field
// (a JSON string array of URLs). Upload adds new tiles, drag reorders them,
// hovering a tile reveals a remove button - the everyday gallery-editing
// actions, without Joomla's full folder/file-browser chrome.
const GalleryImagesInput = () => {
  const { field } = useInput({ source: 'images' });
  const notify = useNotify();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const images: string[] = Array.isArray(field.value) ? field.value : [];

  const uploadOne = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const token = localStorage.getItem('auth');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
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
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploaded = await Promise.all(Array.from(files).map(uploadOne));
    const successUrls = uploaded.filter((u): u is string => !!u);
    if (successUrls.length > 0) {
      field.onChange([...images, ...successUrls]);
      notify(
        successUrls.length === 1 ? 'Bild hochgeladen' : `${successUrls.length} Bilder hochgeladen`,
        { type: 'success' }
      );
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAt = (index: number) => {
    field.onChange(images.filter((_, i) => i !== index));
  };

  const moveTo = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= images.length || to >= images.length) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    field.onChange(next);
  };

  return (
    <Box>
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
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFilesSelected(e.target.files)}
        />
        <Typography variant="body2" sx={{ color: '#666' }}>
          {images.length === 0 ? 'Noch keine Bilder' : `${images.length} Bild${images.length === 1 ? '' : 'er'}`}
        </Typography>
      </Box>

      {images.length === 0 ? (
        <Box sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
          py: 6, border: '1px dashed #ccc', borderRadius: '8px', color: '#999',
        }}>
          <ImageIcon fontSize="large" />
          <Typography variant="body2">Für diese Seite wurden noch keine Bilder hinzugefügt.</Typography>
        </Box>
      ) : (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '12px',
        }}>
          {images.map((url, index) => (
            <Box
              key={`${url}-${index}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null) moveTo(dragIndex, index);
                setDragIndex(null);
              }}
              onDragEnd={() => setDragIndex(null)}
              sx={{
                position: 'relative',
                aspectRatio: '1 / 1',
                borderRadius: '6px',
                overflow: 'hidden',
                cursor: 'grab',
                border: '1px solid #e0e0e0',
                bgcolor: '#f5f5f5',
                opacity: dragIndex === index ? 0.4 : 1,
                '&:hover .gallery-tile-remove': { opacity: 1 },
              }}
            >
              <Box component="img" src={url} alt={filenameOf(url)} loading="lazy" sx={{
                width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              }} />
              <IconButton
                className="gallery-tile-remove"
                size="small"
                onClick={() => removeAt(index)}
                sx={{
                  position: 'absolute', top: 4, right: 4, opacity: 0, transition: 'opacity 0.15s',
                  bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', '&:hover': { bgcolor: 'rgba(200,0,0,0.8)' },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
              <Box sx={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '11px',
                px: 0.75, py: 0.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {filenameOf(url)}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// Small thumbnail + image count for the list view, so "Galerie" reads like
// a gallery overview instead of a bare table of slugs.
const GalleryPreview = () => {
  const record = useRecordContext();
  const images: string[] = Array.isArray(record?.images) ? record.images : [];
  if (images.length === 0) {
    return <Typography variant="body2" sx={{ color: '#999' }}>Keine Bilder</Typography>;
  }
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box component="img" src={images[0]} alt="" sx={{
        width: 48, height: 48, objectFit: 'cover', borderRadius: '4px', border: '1px solid #e0e0e0',
      }} />
      <Typography variant="body2" sx={{ color: '#666' }}>{images.length} Bild{images.length === 1 ? '' : 'er'}</Typography>
    </Box>
  );
};

// "Duplicate This"-style clone button, same UX as Pages.tsx's own
// Duplizieren button: POSTs to /:id/duplicate (see pagegallery.routes.ts),
// which copies the same image list under a new auto-generated slug, then
// refreshes the list so the new row shows up immediately. The admin then
// clicks "Bearbeiten" on the copy to assign it to whichever page should
// start with this same set of images.
const GalleryDuplicateButton = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const [busy, setBusy] = useState(false);

  const handleDuplicate = async (event: React.MouseEvent) => {
    // Without this, the click bubbles up to the Datagrid row's own
    // rowClick="edit" handler and navigates to Edit instead of duplicating.
    event.stopPropagation();
    if (!record) return;
    setBusy(true);
    try {
      const token = localStorage.getItem('auth');
      const res = await fetch(`/api/pagegallery/${record.id}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        notify(data.error || 'Fehler beim Duplizieren', { type: 'error' });
        return;
      }
      notify(`Duplikat erstellt: "${data.slug}" - auf "Bearbeiten" klicken um die Seite zuzuweisen`, { type: 'success' });
      refresh();
    } catch {
      notify('Netzwerkfehler beim Duplizieren', { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <IconButton
      size="small"
      onClick={handleDuplicate}
      disabled={busy}
      title="Duplizieren (erstellt eine Kopie mit denselben Bildern)"
    >
      <ContentCopyIcon fontSize="small" />
    </IconButton>
  );
};

// Custom per-row delete - no confirmation dialog, no react-admin
// undo-notification delay (both of react-admin's own <DeleteButton> modes
// either force a dialog, or - in "undoable" mode - defer the real request
// behind a background timer that was crashing this page). This calls
// pagegallery.routes.ts's DELETE directly and moves straight to
// Admin > Papierkorb, same one-click behavior as Duplizieren above.
const GalleryDeleteButton = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const [busy, setBusy] = useState(false);

  const handleDelete = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!record) return;
    setBusy(true);
    try {
      const token = localStorage.getItem('auth');
      const res = await fetch(`/api/pagegallery/${record.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        notify(data.error || 'Fehler beim Löschen', { type: 'error' });
        return;
      }
      notify('In den Papierkorb verschoben', { type: 'success' });
      refresh();
    } catch {
      notify('Netzwerkfehler beim Löschen', { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <IconButton size="small" onClick={handleDelete} disabled={busy} title="Löschen (verschiebt in den Papierkorb)">
      <DeleteIcon fontSize="small" color="error" />
    </IconButton>
  );
};

// Same idea for the "X ausgewählt" bulk-select toolbar - deletes every
// selected row with no confirmation, each one landing in Papierkorb.
const GalleryBulkDeleteButton = () => {
  const { selectedIds = [], onUnselectItems } = useListContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const [busy, setBusy] = useState(false);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setBusy(true);
    try {
      const token = localStorage.getItem('auth');
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/pagegallery/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
        )
      );
      notify(`${selectedIds.length} in den Papierkorb verschoben`, { type: 'success' });
      onUnselectItems();
      refresh();
    } catch {
      notify('Netzwerkfehler beim Löschen', { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      size="small"
      color="error"
      startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
      onClick={handleBulkDelete}
      disabled={busy}
    >
      Löschen
    </Button>
  );
};

// Custom header - matches the layout already used by the "Seiten" admin
// screen (Pages.tsx): a big title with the page's one action button
// top-right, then a full-width search field below. Built by hand (instead
// of react-admin's default filters/actions toolbar) so it can match that
// layout exactly; still uses react-admin's own `setFilters`/ExportButton
// under the hood, so search + export behave the same as any other list.
const GalleryListHeader = () => {
  const { filterValues, setFilters, displayedFilters } = useListContext();
  const [search, setSearch] = useState(filterValues.q || '');
  const navigate = useNavigate();

  // Debounce so a request isn't fired on every single keystroke - same
  // ~debounce feel as react-admin's own <TextInput alwaysOn> gave us before.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters({ ...filterValues, q: search || undefined }, displayedFilters);
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Fixed-destination back link (Admin Dashboard) - same pattern as
              Trash.tsx's own back button, rather than relying only on the
              generic browser-history "Zurück" icon in the app bar above. */}
          <IconButton onClick={() => navigate('/admin')} title="Zurück zum Dashboard">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">Galerie</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* Same "Papierkorb" button/icon/placement as Pages.tsx's header -
              deleted galleries land in the same shared trash as pages. */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<RestoreFromTrashIcon />}
            onClick={() => navigate('/admin/gallery-trash')}
          >
            Papierkorb
          </Button>
          <ExportButton />
        </Box>
      </Box>
      <MuiTextField
        placeholder="Seite suchen"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        fullWidth
        sx={{ mb: 2 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: '#999' }} />
              </InputAdornment>
            ),
          },
        }}
      />
      {/* React-admin's row-selection toolbar ("X ausgewählt ... LÖSCHEN") is
          an absolutely-positioned overlay that floats theme.spacing(6)=48px
          upward from right above the Datagrid, meant to land on the table's
          own header row. With no gap here it instead overlapped this search
          box - this spacer just reserves that space so it floats into empty
          room instead. */}
      <Box sx={{ height: 48 }} />
    </Box>
  );
};

export const GalleryList = () => (
  // Sorted by slug (not the default id/creation order) so a duplicate
  // ("bassano-tour-kopie", and "bassano-tour-kopie-2" if duplicated again,
  // even a copy-of-a-copy "...-kopie-kopie") lands alphabetically right
  // next to its original ("bassano-tour") - no need to search for the copy
  // after clicking Duplizieren. storeKey={false} is needed because
  // react-admin otherwise remembers whatever sort was last used on this
  // resource (from earlier browsing) and ignores this default.
  // perPage is generous (well above the current/foreseeable row count) so
  // every page's galleries fit on one page - sorting alone only guarantees
  // adjacency in sort *order*; without this, a page name landing right at
  // the page-10/11 boundary would still get visually split from its copy.
  <List actions={false} sort={{ field: 'slug', order: 'ASC' }} storeKey={false} perPage={100}>
    <GalleryListHeader />
    <Datagrid
      rowClick="edit"
      // React-admin's own <DeleteButton>/<BulkDeleteButton> always show a
      // confirmation dialog except in "undoable" mode, and "undoable" defers
      // the real request behind a ~5s background timer that crashed this
      // page with a DOM "removeChild" error. GalleryDeleteButton/
      // GalleryBulkDeleteButton below are custom, simple, immediate deletes
      // with no dialog - deleting here never destroys anything anyway, it
      // just moves the row to Admin > Papierkorb (see below).
      bulkActionButtons={<GalleryBulkDeleteButton />}
    >
      <TextField source="slug" label="Seite" />
      <GalleryPreview label="Vorschau" />
      <EditButton />
      <GalleryDuplicateButton label="Duplizieren" />
      {/* Individual per-row delete - moves the row to Admin > Papierkorb
          (trash) instead of deleting it outright - see
          pagegallery.routes.ts's DELETE handler. */}
      <GalleryDeleteButton label="Löschen" />
    </Datagrid>
  </List>
);

// Lets an admin leave the edit/create screen at any time without having to
// save first or use the browser's own back button.
const BackToGalleryButton = () => (
  <Button
    component={RouterLink}
    to="/admin/pagegallery"
    startIcon={<ArrowBackIcon />}
    size="small"
    sx={{ mb: 2 }}
  >
    Zurück zur Übersicht
  </Button>
);

const GalleryForm = () => (
  <SimpleForm>
    <BackToGalleryButton />
    <AutocompleteInput
      source="slug"
      choices={PAGE_CHOICES}
      label="Seite auswählen"
      placeholder="Seite suchen oder neue Seite eingeben..."
      fullWidth
      // Lets an admin type a page name that isn't in PAGE_CHOICES yet and
      // create it on the spot, instead of being limited to the fixed list.
      // normalizeSlug keeps the stored slug URL-safe and consistent with
      // what a developer will later type into usePageGallery('...') - see
      // frontend/src/hooks/usePageGallery.ts.
      onCreate={(filter?: string) => {
        const slug = normalizeSlug(filter || '');
        if (!slug) return undefined;
        return { id: slug, name: filter };
      }}
      createLabel="+ Neue Seite anlegen"
      createItemLabel='+ Neue Seite anlegen: "%{item}"'
    />
    <Typography variant="body2" sx={{ color: '#666', mt: -1.5, mb: 2 }}>
      Seite nicht in der Liste? Namen eingeben und "Neue Seite anlegen" wählen. Damit die Galerie danach auch
      wirklich auf der Seite erscheint, muss sie einmalig im Code dieser Seite eingebunden werden.
    </Typography>
    <Box sx={{ p: '20px', bgcolor: '#fff3e0', borderRadius: '8px', width: '100%', mt: '10px' }}>
      <Typography variant="h6" sx={{ mt: 0, mb: 0.5 }}>Impressionen (Bildergalerie)</Typography>
      <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
        Bilder hinzufügen, entfernen oder per Ziehen neu anordnen.
      </Typography>
      <GalleryImagesInput />
    </Box>
  </SimpleForm>
);

export const GalleryEdit = () => (
  <Edit>
    <GalleryForm />
  </Edit>
);

export const GalleryCreate = () => (
  <Create>
    <GalleryForm />
  </Create>
);
