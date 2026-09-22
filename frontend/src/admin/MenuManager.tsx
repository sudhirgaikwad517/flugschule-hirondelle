import { useRef, useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem as SelectMenuItem,
  Paper,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import UploadIcon from '@mui/icons-material/Upload';
import CloseIcon from '@mui/icons-material/Close';

// "Menü" - admin management for the header's top-level navigation items and
// their sub-items (Ausbildung > Schnupperkurs, etc.), backed by the
// MenuItem/MenuSubItem models and menu.routes.ts. Replaces what used to be
// hardcoded directly in Header.tsx. Drag-and-drop reordering mirrors
// Gallery.tsx's GalleryImagesInput (plain HTML5 drag events, no library).
// Registered as a CustomRoute at /admin/menu in AdminApp.tsx, right before
// Galerie in CustomMenu.tsx's Komponenten group.
//
// Shop, the "Seiten" dropdown (auto-populated from admin-created pages) and
// the Konto/login menu are NOT managed here - they stay hardcoded in
// Header.tsx since they carry auth/e-commerce behavior beyond a label+link.

interface SubItemRow {
  id: string;
  menuItemId: string;
  label: string;
  url: string;
  target: string;
  imageUrl?: string | null;
  published: boolean;
  order: number;
}

interface ItemRow {
  id: string;
  label: string;
  url: string;
  target: string;
  published: boolean;
  order: number;
  subItems: SubItemRow[];
}

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('auth')}`,
  'Content-Type': 'application/json',
});

const describeApiError = (res: Response, fallback: string): string => {
  if (res.status === 401 || res.status === 403) return 'Sitzung abgelaufen - bitte neu anmelden und erneut versuchen.';
  return fallback;
};

const emptyItemForm = { label: '', url: '', target: '_self', published: true };
const emptySubItemForm = { label: '', url: '', target: '_self', imageUrl: '', published: true };

export const MenuManager = () => {
  const notify = useNotify();
  const [items, setItems] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemRow | null>(null);
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [savingItem, setSavingItem] = useState(false);

  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [subParentId, setSubParentId] = useState<string | null>(null);
  const [editingSubItem, setEditingSubItem] = useState<SubItemRow | null>(null);
  const [subItemForm, setSubItemForm] = useState(emptySubItemForm);
  const [savingSubItem, setSavingSubItem] = useState(false);
  const [uploadingSubItemImage, setUploadingSubItemImage] = useState(false);
  const subItemFileInputRef = useRef<HTMLInputElement>(null);

  const [dragItemIndex, setDragItemIndex] = useState<number | null>(null);
  const [dragSubItem, setDragSubItem] = useState<{ parentId: string; index: number } | null>(null);

  const fetchItems = () => {
    setLoading(true);
    fetch('/api/menuitems', { headers: authHeaders() })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => notify('Fehler beim Laden des Menüs', { type: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(fetchItems, []);

  const toggleExpanded = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // --- Top-level items ---

  const openCreateItem = () => {
    setEditingItem(null);
    setItemForm(emptyItemForm);
    setItemDialogOpen(true);
  };

  const openEditItem = (item: ItemRow) => {
    setEditingItem(item);
    setItemForm({ label: item.label, url: item.url, target: item.target, published: item.published });
    setItemDialogOpen(true);
  };

  const saveItem = async () => {
    if (!itemForm.label.trim()) {
      notify('Bitte einen Titel eingeben.', { type: 'warning' });
      return;
    }
    setSavingItem(true);
    try {
      const url = editingItem ? `/api/menuitems/${editingItem.id}` : '/api/menuitems';
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem ? { ...itemForm, order: editingItem.order } : itemForm;
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) });
      if (!res.ok) throw new Error(describeApiError(res, 'Fehler beim Speichern'));
      notify(editingItem ? 'Menüpunkt gespeichert' : 'Menüpunkt erstellt', { type: 'success' });
      setItemDialogOpen(false);
      fetchItems();
    } catch (e: any) {
      notify(e.message || 'Fehler beim Speichern', { type: 'error' });
    } finally {
      setSavingItem(false);
    }
  };

  const deleteItem = async (item: ItemRow) => {
    if (!window.confirm(`"${item.label}" und alle seine Untermenüpunkte wirklich löschen?`)) return;
    try {
      const res = await fetch(`/api/menuitems/${item.id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error(describeApiError(res, 'Fehler beim Löschen'));
      notify('Menüpunkt gelöscht', { type: 'success' });
      fetchItems();
    } catch (e: any) {
      notify(e.message || 'Fehler beim Löschen', { type: 'error' });
    }
  };

  const togglePublishedItem = async (item: ItemRow) => {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, published: !i.published } : i)));
    try {
      await fetch(`/api/menuitems/${item.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ label: item.label, url: item.url, target: item.target, published: !item.published, order: item.order }),
      });
    } catch {
      notify('Fehler beim Aktualisieren', { type: 'error' });
      fetchItems();
    }
  };

  const moveItem = async (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    try {
      await fetch('/api/menuitems/reorder', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(next.map((i, idx) => ({ id: i.id, order: idx }))),
      });
    } catch {
      notify('Fehler beim Sortieren', { type: 'error' });
      fetchItems();
    }
  };

  // --- Sub-items ---

  const openCreateSubItem = (parentId: string) => {
    setSubParentId(parentId);
    setEditingSubItem(null);
    setSubItemForm(emptySubItemForm);
    setSubDialogOpen(true);
  };

  const openEditSubItem = (parentId: string, sub: SubItemRow) => {
    setSubParentId(parentId);
    setEditingSubItem(sub);
    setSubItemForm({ label: sub.label, url: sub.url, target: sub.target, imageUrl: sub.imageUrl || '', published: sub.published });
    setSubDialogOpen(true);
  };

  const uploadSubItemImage = async (file: File) => {
    setUploadingSubItemImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('auth')}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSubItemForm((prev) => ({ ...prev, imageUrl: data.url }));
      } else {
        notify(data.message || 'Fehler beim Hochladen', { type: 'warning' });
      }
    } catch {
      notify('Netzwerkfehler beim Hochladen', { type: 'warning' });
    } finally {
      setUploadingSubItemImage(false);
      if (subItemFileInputRef.current) subItemFileInputRef.current.value = '';
    }
  };

  const saveSubItem = async () => {
    if (!subItemForm.label.trim() || !subParentId) {
      notify('Bitte einen Titel eingeben.', { type: 'warning' });
      return;
    }
    setSavingSubItem(true);
    try {
      const url = editingSubItem ? `/api/menusubitems/${editingSubItem.id}` : '/api/menusubitems';
      const method = editingSubItem ? 'PUT' : 'POST';
      const body = editingSubItem
        ? { ...subItemForm, order: editingSubItem.order }
        : { ...subItemForm, menuItemId: subParentId };
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) });
      if (!res.ok) throw new Error(describeApiError(res, 'Fehler beim Speichern'));
      notify(editingSubItem ? 'Untermenüpunkt gespeichert' : 'Untermenüpunkt erstellt', { type: 'success' });
      setSubDialogOpen(false);
      fetchItems();
    } catch (e: any) {
      notify(e.message || 'Fehler beim Speichern', { type: 'error' });
    } finally {
      setSavingSubItem(false);
    }
  };

  const deleteSubItem = async (sub: SubItemRow) => {
    if (!window.confirm(`"${sub.label}" wirklich löschen?`)) return;
    try {
      const res = await fetch(`/api/menusubitems/${sub.id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error(describeApiError(res, 'Fehler beim Löschen'));
      notify('Untermenüpunkt gelöscht', { type: 'success' });
      fetchItems();
    } catch (e: any) {
      notify(e.message || 'Fehler beim Löschen', { type: 'error' });
    }
  };

  const togglePublishedSubItem = async (sub: SubItemRow) => {
    setItems((prev) =>
      prev.map((i) => ({
        ...i,
        subItems: i.subItems.map((s) => (s.id === sub.id ? { ...s, published: !s.published } : s)),
      }))
    );
    try {
      await fetch(`/api/menusubitems/${sub.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ label: sub.label, url: sub.url, target: sub.target, published: !sub.published, order: sub.order }),
      });
    } catch {
      notify('Fehler beim Aktualisieren', { type: 'error' });
      fetchItems();
    }
  };

  const moveSubItem = async (parentId: string, from: number, to: number) => {
    const parent = items.find((i) => i.id === parentId);
    if (!parent || from === to || from < 0 || to < 0 || from >= parent.subItems.length || to >= parent.subItems.length) return;
    const nextSubs = [...parent.subItems];
    const [moved] = nextSubs.splice(from, 1);
    nextSubs.splice(to, 0, moved);
    setItems((prev) => prev.map((i) => (i.id === parentId ? { ...i, subItems: nextSubs } : i)));
    try {
      await fetch('/api/menusubitems/reorder', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(nextSubs.map((s, idx) => ({ id: s.id, order: idx }))),
      });
    } catch {
      notify('Fehler beim Sortieren', { type: 'error' });
      fetchItems();
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box>
          <Typography variant="h5">Menü</Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Verwaltet die Hauptnavigation der Webseite (Header) und ihre Untermenüpunkte.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateItem}>Neuer Menüpunkt</Button>
      </Box>

      {loading && items.length === 0 && (
        <Typography sx={{ mt: 3, color: '#999' }}>Lädt...</Typography>
      )}

      {!loading && items.length === 0 && (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', color: '#999', mt: 2 }}>
          Noch keine Menüpunkte vorhanden.
        </Paper>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
        {items.map((item, index) => (
          <Paper
            key={item.id}
            variant="outlined"
            draggable
            onDragStart={() => setDragItemIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragItemIndex !== null) moveItem(dragItemIndex, index);
              setDragItemIndex(null);
            }}
            onDragEnd={() => setDragItemIndex(null)}
            sx={{ opacity: dragItemIndex === index ? 0.4 : 1 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5 }}>
              <DragIndicatorIcon sx={{ color: '#aaa', cursor: 'grab' }} fontSize="small" />
              <IconButton size="small" onClick={() => toggleExpanded(item.id)}>
                {expanded[item.id] ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
              </IconButton>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {item.url || '—'}
                  {item.subItems.length > 0 && ` · ${item.subItems.length} Untermenüpunkt${item.subItems.length === 1 ? '' : 'e'}`}
                </Typography>
              </Box>
              <FormControlLabel
                sx={{ mr: 0 }}
                control={<Switch size="small" checked={item.published} onChange={() => togglePublishedItem(item)} />}
                label={<Typography variant="body2">Aktiv</Typography>}
              />
              <IconButton size="small" onClick={() => openEditItem(item)} title="Bearbeiten"><EditIcon fontSize="small" /></IconButton>
              <IconButton size="small" onClick={() => deleteItem(item)} title="Löschen"><DeleteIcon fontSize="small" color="error" /></IconButton>
            </Box>

            <Collapse in={!!expanded[item.id]} timeout="auto" unmountOnExit>
              <Box sx={{ pl: 6, pr: 2, pb: 2 }}>
                {item.subItems.length === 0 && (
                  <Typography variant="body2" sx={{ color: '#999', mb: 1 }}>Keine Untermenüpunkte.</Typography>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {item.subItems.map((sub, subIndex) => (
                    <Box
                      key={sub.id}
                      draggable
                      onDragStart={() => setDragSubItem({ parentId: item.id, index: subIndex })}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (dragSubItem && dragSubItem.parentId === item.id) moveSubItem(item.id, dragSubItem.index, subIndex);
                        setDragSubItem(null);
                      }}
                      onDragEnd={() => setDragSubItem(null)}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1, p: 1,
                        border: '1px solid #eee', borderRadius: '6px',
                        opacity: dragSubItem?.parentId === item.id && dragSubItem.index === subIndex ? 0.4 : 1,
                      }}
                    >
                      <DragIndicatorIcon sx={{ color: '#ccc', cursor: 'grab' }} fontSize="small" />
                      {sub.imageUrl && (
                        <Box component="img" src={sub.imageUrl} alt="" sx={{ width: 36, height: 36, objectFit: 'cover', borderRadius: '4px', border: '1px solid #e0e0e0' }} />
                      )}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{sub.label}</Typography>
                        <Typography variant="caption" sx={{ color: '#888' }}>{sub.url || '—'}</Typography>
                      </Box>
                      <Switch size="small" checked={sub.published} onChange={() => togglePublishedSubItem(sub)} />
                      <IconButton size="small" onClick={() => openEditSubItem(item.id, sub)} title="Bearbeiten"><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => deleteSubItem(sub)} title="Löschen"><DeleteIcon fontSize="small" color="error" /></IconButton>
                    </Box>
                  ))}
                </Box>
                <Button size="small" startIcon={<AddIcon />} sx={{ mt: 1 }} onClick={() => openCreateSubItem(item.id)}>
                  Untermenüpunkt hinzufügen
                </Button>
              </Box>
            </Collapse>
          </Paper>
        ))}
      </Box>

      {/* Top-level item dialog */}
      <Dialog open={itemDialogOpen} onClose={() => setItemDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingItem ? 'Menüpunkt bearbeiten' : 'Neuer Menüpunkt'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Titel" fullWidth autoFocus
            value={itemForm.label}
            onChange={(e) => setItemForm({ ...itemForm, label: e.target.value })}
          />
          <TextField
            label="URL" fullWidth placeholder="/ausbildung"
            helperText="Interner Pfad (z.B. /ausbildung) oder vollständige externe URL."
            value={itemForm.url}
            onChange={(e) => setItemForm({ ...itemForm, url: e.target.value })}
          />
          <TextField
            select label="Öffnen in" fullWidth
            value={itemForm.target}
            onChange={(e) => setItemForm({ ...itemForm, target: e.target.value })}
          >
            <SelectMenuItem value="_self">Gleicher Tab</SelectMenuItem>
            <SelectMenuItem value="_blank">Neuer Tab</SelectMenuItem>
          </TextField>
          <FormControlLabel
            control={<Switch checked={itemForm.published} onChange={(e) => setItemForm({ ...itemForm, published: e.target.checked })} />}
            label="Aktiv (im Menü sichtbar)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemDialogOpen(false)}>Abbrechen</Button>
          <Button variant="contained" onClick={saveItem} disabled={savingItem}>Speichern</Button>
        </DialogActions>
      </Dialog>

      {/* Sub-item dialog */}
      <Dialog open={subDialogOpen} onClose={() => setSubDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingSubItem ? 'Untermenüpunkt bearbeiten' : 'Neuer Untermenüpunkt'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Titel" fullWidth autoFocus
            value={subItemForm.label}
            onChange={(e) => setSubItemForm({ ...subItemForm, label: e.target.value })}
          />
          <TextField
            label="URL" fullWidth placeholder="/ausbildung/schnupperkurs"
            helperText="Interner Pfad oder vollständige externe URL."
            value={subItemForm.url}
            onChange={(e) => setSubItemForm({ ...subItemForm, url: e.target.value })}
          />
          <TextField
            select label="Öffnen in" fullWidth
            value={subItemForm.target}
            onChange={(e) => setSubItemForm({ ...subItemForm, target: e.target.value })}
          >
            <SelectMenuItem value="_self">Gleicher Tab</SelectMenuItem>
            <SelectMenuItem value="_blank">Neuer Tab</SelectMenuItem>
          </TextField>

          <Box>
            <Typography variant="body2" sx={{ mb: 1, color: '#555' }}>
              Bild (optional - wenn ALLE Untermenüpunkte eines Menüpunkts ein Bild haben, wird dieser als Bilder-Menü wie "Reisen" dargestellt)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {subItemForm.imageUrl ? (
                <Box sx={{ position: 'relative' }}>
                  <Box component="img" src={subItemForm.imageUrl} alt="" sx={{ width: 72, height: 72, objectFit: 'cover', borderRadius: '6px', border: '1px solid #e0e0e0' }} />
                  <IconButton
                    size="small"
                    onClick={() => setSubItemForm({ ...subItemForm, imageUrl: '' })}
                    sx={{ position: 'absolute', top: -8, right: -8, bgcolor: '#fff', border: '1px solid #ddd', '&:hover': { bgcolor: '#fee' } }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={uploadingSubItemImage ? <CircularProgress size={16} /> : <UploadIcon />}
                  disabled={uploadingSubItemImage}
                  onClick={() => subItemFileInputRef.current?.click()}
                >
                  {uploadingSubItemImage ? 'Lädt hoch...' : 'Bild hochladen'}
                </Button>
              )}
              <input
                ref={subItemFileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => e.target.files?.[0] && uploadSubItemImage(e.target.files[0])}
              />
            </Box>
          </Box>

          <FormControlLabel
            control={<Switch checked={subItemForm.published} onChange={(e) => setSubItemForm({ ...subItemForm, published: e.target.checked })} />}
            label="Aktiv (im Menü sichtbar)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubDialogOpen(false)}>Abbrechen</Button>
          <Button variant="contained" onClick={saveSubItem} disabled={savingSubItem}>Speichern</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
