import { useState } from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  NumberField,
  FunctionField,
  useListContext,
  useNotify,
  useRefresh,
  useUpdateMany,
  useUnselectAll,
} from 'react-admin';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField as MuiTextField,
  Box,
  Select,
  MenuItem,
  Menu,
  FormControl,
  InputLabel,
  Collapse,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import DeleteIcon from '@mui/icons-material/Delete';

// Matches Joomla Visforms' real "Formulare" list (administrator/components/
// com_visforms/views/visforms) exactly: Titel (+ Alias subtitle),
// Veröffentlicht, Zugriffsebene, Felder (live count, links to that form's
// field editor), Autor, Datum, Daten (live count, links to that form's
// data table), Hits, Sprache, ID. "Felder"/"Daten" are computed at
// request time in formconfigs.routes.ts's GET / (same idea as old's own
// correlated subquery / per-form data-table row count), not stored columns.

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

const NewFormButton = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const notify = useNotify();
  const refresh = useRefresh();
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/formconfigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ title: title.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify(data.message || 'Fehler beim Erstellen', { type: 'error' });
        return;
      }
      setOpen(false);
      setTitle('');
      refresh();
      navigate(`/admin/forms/${data.id}/edit`);
    } catch {
      notify('Netzwerkfehler beim Erstellen', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
        Neu
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Neues Formular</DialogTitle>
        <DialogContent>
          <MuiTextField
            autoFocus
            fullWidth
            margin="dense"
            label="Formular-Titel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Abbrechen</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving || !title.trim()}>
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Old's real toolbar, top to bottom: "+ Neu" | "Aktionen" dropdown
// (Veröffentlichen/Verstecken/Freigeben/Stapelverarbeitung/Löschen/
// Bearbeiten - administrator/components/com_visforms/src/View/Visforms/
// HtmlView.php's setToolbar()) always visible regardless of selection |
// search box | "Filter-Optionen" (toggles a second row: Status/
// Zugriffsebene/Sprache dropdowns) | "Zurücksetzen" | an "ID - auf ↑"
// sort-order dropdown | a page-size dropdown ("20"). react-admin's own
// column-header-click sorting and Datagrid-selection-triggered bulk
// toolbar are a different (if functionally overlapping) UI paradigm, so
// this rebuilds the real chrome directly instead, same approach as
// Gallery.tsx's own custom GalleryListHeader.
const SORT_CHOICES = [
  { field: 'id', order: 'ASC', label: 'ID - auf' },
  { field: 'id', order: 'DESC', label: 'ID - ab' },
  { field: 'title', order: 'ASC', label: 'Titel - auf' },
  { field: 'title', order: 'DESC', label: 'Titel - ab' },
  { field: 'createdAt', order: 'ASC', label: 'Datum - auf' },
  { field: 'createdAt', order: 'DESC', label: 'Datum - ab' },
  { field: 'hits', order: 'ASC', label: 'Hits - auf' },
  { field: 'hits', order: 'DESC', label: 'Hits - ab' },
];

const ActionsMenu = () => {
  const { selectedIds, data } = useListContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const unselectAll = useUnselectAll('formconfigs');
  const [updateMany] = useUpdateMany();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const requireSelection = () => {
    if (!selectedIds || selectedIds.length === 0) {
      notify('Bitte mindestens ein Formular auswählen', { type: 'warning' });
      return false;
    }
    return true;
  };

  const setPublished = (published: boolean) => {
    setAnchorEl(null);
    if (!requireSelection()) return;
    updateMany(
      'formconfigs',
      { ids: selectedIds, data: { published } },
      {
        onSuccess: () => {
          notify(published ? 'Veröffentlicht' : 'Versteckt', { type: 'success' });
          unselectAll();
          refresh();
        },
        onError: (error: any) => notify(`Fehler: ${error.message}`, { type: 'error' }),
      }
    );
  };

  const handleDelete = async () => {
    setAnchorEl(null);
    if (!requireSelection()) return;
    try {
      await Promise.all(
        selectedIds.map((id) => fetch(`/api/formconfigs/${id}`, { method: 'DELETE', headers: authHeaders() }))
      );
      notify('Gelöscht', { type: 'success' });
      unselectAll();
      refresh();
    } catch {
      notify('Fehler beim Löschen', { type: 'error' });
    }
  };

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        endIcon={<TuneIcon fontSize="small" />}
      >
        Aktionen
      </Button>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => setPublished(true)}>
          <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} /> Veröffentlichen
        </MenuItem>
        <MenuItem onClick={() => setPublished(false)}>
          <CancelIcon fontSize="small" sx={{ mr: 1 }} /> Verstecken
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Löschen
        </MenuItem>
      </Menu>
    </>
  );
};

const FormulareHeader = () => {
  const { filterValues, setFilters, sort, setSort, perPage, setPerPage } = useListContext();
  const [search, setSearch] = useState(filterValues.q || '');
  const [filterOptionsOpen, setFilterOptionsOpen] = useState(false);

  const applySearch = (value: string) => {
    setSearch(value);
    setFilters({ ...filterValues, q: value || undefined }, []);
  };

  const currentSortKey = `${sort.field}-${sort.order}`;

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
        <NewFormButton />
        <ActionsMenu />
        <MuiTextField
          size="small"
          placeholder="Suche"
          value={search}
          onChange={(e) => applySearch(e.target.value)}
          slotProps={{ input: { startAdornment: <SearchIcon fontSize="small" sx={{ color: '#999', mr: 0.5 }} /> } }}
          sx={{ flexGrow: 1, minWidth: 160, maxWidth: 260 }}
        />
        <Button
          size="small"
          variant={filterOptionsOpen ? 'contained' : 'outlined'}
          startIcon={<TuneIcon fontSize="small" />}
          onClick={() => setFilterOptionsOpen((v) => !v)}
        >
          Filter-Optionen
        </Button>
        <Button
          size="small"
          onClick={() => {
            applySearch('');
            setFilters({}, []);
          }}
        >
          Zurücksetzen
        </Button>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={currentSortKey}
            onChange={(e) => {
              const choice = SORT_CHOICES.find((c) => `${c.field}-${c.order}` === e.target.value);
              if (choice) setSort({ field: choice.field, order: choice.order as 'ASC' | 'DESC' });
            }}
          >
            {SORT_CHOICES.map((c) => (
              <MenuItem key={`${c.field}-${c.order}`} value={`${c.field}-${c.order}`}>{c.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 70 }}>
          <Select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}>
            {[10, 20, 50, 100].map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Collapse in={filterOptionsOpen}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', pt: 1 }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Status wählen</InputLabel>
            <Select
              label="Status wählen"
              value={filterValues.published === undefined ? '' : String(filterValues.published)}
              onChange={(e) => {
                const v = e.target.value;
                setFilters({ ...filterValues, published: v === '' ? undefined : v === 'true' }, []);
              }}
            >
              <MenuItem value="">- Status wählen -</MenuItem>
              <MenuItem value="true">Veröffentlicht</MenuItem>
              <MenuItem value="false">Nicht veröffentlicht</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Zugriffsebene wählen</InputLabel>
            <Select
              label="Zugriffsebene wählen"
              value={filterValues.accessLevel || ''}
              onChange={(e) => setFilters({ ...filterValues, accessLevel: e.target.value || undefined }, [])}
            >
              <MenuItem value="">- Zugriffsebene wählen -</MenuItem>
              <MenuItem value="Öffentlich">Öffentlich</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Sprache wählen</InputLabel>
            <Select
              label="Sprache wählen"
              value={filterValues.language || ''}
              onChange={(e) => setFilters({ ...filterValues, language: e.target.value || undefined }, [])}
            >
              <MenuItem value="">- Sprache wählen -</MenuItem>
              <MenuItem value="Alle">Alle</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Collapse>
    </Box>
  );
};

const PublishedIcon = () => {
  return (
    <FunctionField
      label="Veröffentlicht"
      render={(record: any) =>
        record.published ? (
          <CheckCircleIcon fontSize="small" color="success" />
        ) : (
          <CancelIcon fontSize="small" color="disabled" />
        )
      }
    />
  );
};

export const FormulareList = () => (
  <List actions={false} sort={{ field: 'id', order: 'ASC' }} perPage={20}>
    <FormulareHeader />
    {/* Selection stays available (for the always-visible Aktionen menu
        above) - just no extra overlay toolbar-on-select, since Aktionen
        already covers that. */}
    <Datagrid bulkActionButtons={<></>} rowClick={false}>
      <FunctionField
        label="Titel"
        render={(record: any) => (
          <a href={`/admin/forms/${record.id}/edit`} onClick={(e) => e.stopPropagation()}>
            <div>{record.title}</div>
            <div style={{ fontSize: '0.75rem', color: '#999' }}>Alias: {record.id}</div>
          </a>
        )}
      />
      <PublishedIcon />
      <TextField source="accessLevel" label="Zugriffsebene" />
      <FunctionField
        label="Felder"
        render={(record: any) => (
          <a href={`/admin/forms/${record.id}/edit`} onClick={(e) => e.stopPropagation()}>{record.fieldsCount}</a>
        )}
      />
      <TextField source="createdBy" label="Autor" />
      <DateField source="createdAt" label="Datum" />
      <FunctionField
        label="Daten"
        render={(record: any) => (
          <a href={`/admin/forms/${record.id}/data`} onClick={(e) => e.stopPropagation()}>{record.dataCount}</a>
        )}
      />
      <NumberField source="hits" label="Hits" />
      <TextField source="language" label="Sprache" />
      <TextField source="id" label="ID" />
    </Datagrid>
  </List>
);
