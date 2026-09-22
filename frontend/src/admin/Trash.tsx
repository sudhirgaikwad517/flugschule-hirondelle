import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotify } from 'react-admin';
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

// WordPress-style "Papierkorb" - everything a "Löschen" click on Pages.tsx
// (a custom Page row, or a "reset" of one of the 6 fixed pages) or on
// Gallery.tsx moves here instead of destroying it outright (see backend
// ContentTrash model / trash.routes.ts). Restoring here puts the content
// back exactly where it was; deleting here is the real, permanent delete.
//
// Generic/reusable: pass `kinds` to show only that feature's trash items
// (Pages vs Galerie each get their own trash, filtered server-side via
// GET /api/trash?kinds=...), instead of one list mixing everything.

interface TrashItem {
  id: string;
  kind: string;
  refId: string;
  title: string;
  deletedAt: string;
}

const KIND_LABELS: Record<string, string> = {
  page: 'Eigene Seite',
  homecontent: 'Feste Seite',
  sitepagecontent: 'Feste Seite',
  fixedpageduplicate: 'Seiten-Duplikat',
  pagegallery: 'Galerie',
};

// Every kind that belongs to Pages.tsx - the default when no `kinds` prop
// is given, so the existing /admin/trash route (linked from Pages.tsx) only
// ever shows page-related items, never galleries.
const PAGE_KINDS = ['page', 'homecontent', 'sitepagecontent', 'fixedpageduplicate'];

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

interface TrashProps {
  kinds?: string[];
  title?: string;
  description?: string;
  backTo?: string;
  backLabel?: string;
}

export const Trash = ({
  kinds = PAGE_KINDS,
  title = 'Papierkorb',
  description = 'Gelöschte Seiten landen hier und können wiederhergestellt werden. "Endgültig löschen" entfernt den Eintrag dauerhaft.',
  backTo = '/admin/pages',
  backLabel = 'Zurück zu Seiten',
}: TrashProps) => {
  const notify = useNotify();
  const navigate = useNavigate();
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const load = () => {
    setLoading(true);
    const query = kinds.length > 0 ? `?kinds=${kinds.join(',')}` : '';
    fetch(`/api/trash${query}`, { headers: authHeaders() })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setSelected(new Set());
      })
      .catch(() => notify('Fehler beim Laden des Papierkorbs', { type: 'error' }))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [kinds.join(',')]);

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => (prev.size === items.length ? new Set() : new Set(items.map((i) => i.id))));
  };

  const handleRestore = async (item: TrashItem) => {
    try {
      const res = await fetch(`/api/trash/${item.id}/restore`, { method: 'POST', headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        notify(data.error || 'Fehler beim Wiederherstellen', { type: 'error' });
        return;
      }
      notify(`"${item.title}" wiederhergestellt`, { type: 'success' });
      load();
    } catch {
      notify('Netzwerkfehler beim Wiederherstellen', { type: 'error' });
    }
  };

  const handlePurge = async (item: TrashItem) => {
    if (!window.confirm(`"${item.title}" endgültig löschen? Das kann nicht rückgängig gemacht werden.`)) return;
    try {
      const res = await fetch(`/api/trash/${item.id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error();
      notify('Endgültig gelöscht', { type: 'success' });
      load();
    } catch {
      notify('Fehler beim endgültigen Löschen', { type: 'error' });
    }
  };

  const handleBulkRestore = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setBulkBusy(true);
    try {
      const results = await Promise.all(
        ids.map((id) => fetch(`/api/trash/${id}/restore`, { method: 'POST', headers: authHeaders() }))
      );
      const failed = results.filter((res) => !res.ok).length;
      if (failed > 0) {
        notify(`${ids.length - failed} von ${ids.length} wiederhergestellt - ${failed} fehlgeschlagen (z.B. wegen belegter URL)`, { type: 'warning' });
      } else {
        notify(`${ids.length} wiederhergestellt`, { type: 'success' });
      }
      load();
    } catch {
      notify('Netzwerkfehler beim Wiederherstellen', { type: 'error' });
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkPurge = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!window.confirm(`${ids.length} Einträge endgültig löschen? Das kann nicht rückgängig gemacht werden.`)) return;
    setBulkBusy(true);
    try {
      await Promise.all(ids.map((id) => fetch(`/api/trash/${id}`, { method: 'DELETE', headers: authHeaders() })));
      notify(`${ids.length} endgültig gelöscht`, { type: 'success' });
      load();
    } catch {
      notify('Fehler beim endgültigen Löschen', { type: 'error' });
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <IconButton onClick={() => navigate(backTo)} title={backLabel}><ArrowBackIcon /></IconButton>
        <Typography variant="h5">{title}</Typography>
      </Box>
      <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
        {description}
      </Typography>
      {selected.size > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, p: 1, bgcolor: '#eef2ff', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ mr: 1 }}>{selected.size} ausgewählt</Typography>
          <Button size="small" variant="outlined" color="success" startIcon={<RestoreIcon />} onClick={handleBulkRestore} disabled={bulkBusy}>
            Wiederherstellen
          </Button>
          <Button size="small" variant="outlined" color="error" startIcon={<DeleteForeverIcon />} onClick={handleBulkPurge} disabled={bulkBusy}>
            Endgültig löschen
          </Button>
        </Box>
      )}
      <Paper variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  size="small"
                  checked={items.length > 0 && selected.size === items.length}
                  indeterminate={selected.size > 0 && selected.size < items.length}
                  onChange={toggleAll}
                  disabled={items.length === 0}
                />
              </TableCell>
              <TableCell>Titel</TableCell>
              <TableCell>Typ</TableCell>
              <TableCell>Gelöscht am</TableCell>
              <TableCell align="right">Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center">Lädt...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center">Der Papierkorb ist leer.</TableCell></TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} hover selected={selected.has(item.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox size="small" checked={selected.has(item.id)} onChange={() => toggleOne(item.id)} />
                  </TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{KIND_LABELS[item.kind] || item.kind}</TableCell>
                  <TableCell>{new Date(item.deletedAt).toLocaleString('de-DE')}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleRestore(item)} title="Wiederherstellen">
                      <RestoreIcon fontSize="small" color="success" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handlePurge(item)} title="Endgültig löschen">
                      <DeleteForeverIcon fontSize="small" color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};
