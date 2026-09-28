import { useState } from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  NumberField,
  FunctionField,
  Filter,
  TextInput,
  TopToolbar,
  useListContext,
  useNotify,
  useRefresh,
  useUpdateMany,
  useUnselectAll,
  BulkDeleteButton,
} from 'react-admin';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField as MuiTextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Matches Joomla Visforms' real "Formulare" list (administrator/components/
// com_visforms/views/visforms) exactly: Titel (+ Alias subtitle),
// Veröffentlicht, Zugriffsebene, Felder (live count, links to that form's
// field editor), Autor, Datum, Daten (live count, links to that form's
// data table), Hits, Sprache, ID. "Felder"/"Daten" are computed at
// request time in formconfigs.routes.ts's GET / (same idea as old's own
// correlated subquery / per-form data-table row count), not stored columns.

const FormulareFilter = (props: any) => (
  <Filter {...props}>
    <TextInput label="Suche" source="q" alwaysOn />
  </Filter>
);

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

const ListActions = () => (
  <TopToolbar>
    <NewFormButton />
  </TopToolbar>
);

// Old's real "Aktionen" bulk dropdown (Publish/Unpublish/Delete) - kept as
// two explicit buttons plus react-admin's own BulkDeleteButton, matching
// the same "no confirmation dialog needed, immediate action" pattern
// already used elsewhere in this admin (Gallery.tsx etc.) for a status
// toggle rather than Joomla's own dropdown-menu chrome.
const BulkActions = () => {
  const { selectedIds } = useListContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const unselectAll = useUnselectAll('formconfigs');
  const [updateMany, { isLoading }] = useUpdateMany();

  const setPublished = (published: boolean) => {
    updateMany(
      'formconfigs',
      { ids: selectedIds, data: { published } },
      {
        onSuccess: () => {
          notify(published ? 'Formulare veröffentlicht' : 'Formulare gesperrt', { type: 'success' });
          unselectAll();
          refresh();
        },
        onError: (error: any) => notify(`Fehler: ${error.message}`, { type: 'error' }),
      }
    );
  };

  return (
    <>
      <Button size="small" startIcon={<CheckCircleIcon />} onClick={() => setPublished(true)} disabled={isLoading}>
        Freigeben
      </Button>
      <Button size="small" startIcon={<CancelIcon />} onClick={() => setPublished(false)} disabled={isLoading}>
        Sperren
      </Button>
      <BulkDeleteButton />
    </>
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
  <List filters={<FormulareFilter />} actions={<ListActions />} sort={{ field: 'id', order: 'ASC' }} perPage={20}>
    <Datagrid bulkActionButtons={<BulkActions />} rowClick={false}>
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
