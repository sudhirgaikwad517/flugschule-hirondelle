import { useState } from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  Edit,
  SimpleForm,
  TextInput,
  BooleanInput,
  FunctionField,
  Filter,
  SelectInput,
  TopToolbar,
  useListContext,
  useRecordContext,
  useNotify,
  useRefresh,
  useUnselectAll,
  useUpdateMany,
} from 'react-admin';
import { Button, Menu, MenuItem, Box, Typography, TextField as MuiTextField, CircularProgress } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';

// Old's real CComment "Kommentare" (view=comments) list, deep-verified:
// checkbox | Name | Notify | Datum | Kommentar | Content-Titel | Status |
// IP | Stimmen | ID, toolbar Publish/Unpublish/Delete, filters search +
// Status dropdown. Component-type filter (com_content/com_matukio/...) has
// no real equivalent here since every comment already carries its own
// eventId/pageSlug directly.

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

const CommentFilter = (props: any) => (
  <Filter {...props}>
    <TextInput label="Suche" source="q" alwaysOn />
    <SelectInput
      label="Status"
      source="isApproved"
      alwaysOn
      emptyText="- Status wählen -"
      choices={[{ id: 'true', name: 'Freigegeben' }, { id: 'false', name: 'Wartet auf Freigabe' }]}
    />
  </Filter>
);

const ActionsMenu = () => {
  const { selectedIds } = useListContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const unselectAll = useUnselectAll('comments');
  const [updateMany] = useUpdateMany();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const requireSelection = () => {
    if (!selectedIds || selectedIds.length === 0) {
      notify('Bitte mindestens einen Kommentar auswählen', { type: 'warning' });
      return false;
    }
    return true;
  };

  const setApproved = (isApproved: boolean) => {
    setAnchorEl(null);
    if (!requireSelection()) return;
    updateMany(
      'comments',
      { ids: selectedIds, data: { isApproved } },
      {
        onSuccess: () => { notify(isApproved ? 'Freigegeben' : 'Verborgen', { type: 'success' }); unselectAll(); refresh(); },
        onError: (error: any) => notify(`Fehler: ${error.message}`, { type: 'error' }),
      }
    );
  };

  const handleDelete = async () => {
    setAnchorEl(null);
    if (!requireSelection()) return;
    if (!window.confirm(`${selectedIds.length} Kommentar(e) wirklich löschen?`)) return;
    try {
      await Promise.all(selectedIds.map((id) => fetch(`/api/comments/${id}`, { method: 'DELETE', headers: authHeaders() })));
      notify('Gelöscht', { type: 'success' });
      unselectAll();
      refresh();
    } catch {
      notify('Fehler beim Löschen', { type: 'error' });
    }
  };

  return (
    <>
      <Button size="small" variant="outlined" endIcon={<TuneIcon fontSize="small" />} onClick={(e) => setAnchorEl(e.currentTarget)}>
        Aktionen
      </Button>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => setApproved(true)}><CheckCircleIcon fontSize="small" sx={{ mr: 1 }} /> Freigeben</MenuItem>
        <MenuItem onClick={() => setApproved(false)}><CancelIcon fontSize="small" sx={{ mr: 1 }} /> Verbergen</MenuItem>
        <MenuItem onClick={handleDelete}><DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Löschen</MenuItem>
      </Menu>
    </>
  );
};

const ListActions = () => (
  <TopToolbar>
    <ActionsMenu />
  </TopToolbar>
);

const StatusIcon = () => (
  <FunctionField
    label="Status"
    render={(record: any) => record.isApproved
      ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main' }}><CheckCircleIcon fontSize="small" /> Freigegeben</Box>
      : <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.disabled' }}><CancelIcon fontSize="small" /> Wartet</Box>}
  />
);

export const CommentList = () => (
  <List title="Kommentare" filters={<CommentFilter />} actions={<ListActions />} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid rowClick="edit" bulkActionButtons={<></>}>
      <TextField source="authorName" label="Autor" />
      <TextField source="registeredUser" label="User-ID" emptyText="-" />
      <TextField source="eventTitle" label="Ziel" />
      <TextField source="content" label="Inhalt" />
      <StatusIcon />
      <TextField source="ip" label="IP-Adresse" />
      <FunctionField label="Stimmen" render={(r: any) => `+${r.votesUp || 0} / -${r.votesDown || 0}`} />
      <DateField source="createdAt" label="Datum" showTime />
    </Datagrid>
  </List>
);

// Old's real reply capability (a comment's own thread) - the API endpoint
// (POST /:id/reply) already existed but nothing in the admin UI ever
// called it. A real inline reply composer, matching the "Kontaktiere
// Teilnehmer"-style small-form-under-a-record pattern used elsewhere.
const ReplyBox = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!record) return null;

  const handleReply = async () => {
    if (!content.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/comments/${record.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        notify('Antwort veröffentlicht', { type: 'success' });
        setContent('');
        setSent(true);
      } else {
        const data = await res.json();
        notify(data.message || 'Fehler beim Antworten', { type: 'error' });
      }
    } catch {
      notify('Netzwerkfehler', { type: 'error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <ReplyIcon fontSize="small" /> Antworten
      </Typography>
      <MuiTextField
        fullWidth
        multiline
        minRows={3}
        placeholder="Ihre Antwort..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        size="small"
        sx={{ mb: 1, bgcolor: '#fff' }}
      />
      <Button variant="contained" size="small" onClick={handleReply} disabled={sending || !content.trim()}>
        {sending ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Antwort veröffentlichen'}
      </Button>
      {sent && <Typography variant="caption" sx={{ ml: 2, color: 'success.main' }}>Gesendet - die Antwort erscheint direkt öffentlich unter diesem Kommentar.</Typography>}
    </Box>
  );
};

export const CommentEdit = () => (
  <Edit title="Kommentar moderieren">
    <SimpleForm>
      <TextField source="authorName" label="Autor" />
      <TextField source="email" label="E-Mail" emptyText="-" />
      <TextField source="registeredUser" label="User-ID" emptyText="-" />
      <TextField source="ip" label="IP-Adresse" emptyText="-" />
      <TextField source="eventTitle" label="Ziel" />
      <DateField source="createdAt" label="Datum" showTime />
      <TextInput source="content" label="Inhalt" fullWidth multiline />
      <BooleanInput source="isApproved" label="Freigegeben (sichtbar für Nutzer)" />
      <ReplyBox />
    </SimpleForm>
  </Edit>
);
