import { useState } from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  FunctionField,
  TopToolbar,
  useListContext,
  useNotify,
  useRefresh,
} from 'react-admin';
import { Button, Chip } from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import ReplayIcon from '@mui/icons-material/Replay';

// Old's real "E-Mail-Warteschlange" (view=emailqueues) - deep-verified
// columns Von/Gesendet von/Gesendet an/Betreff/Inhalt/Typ/Status. This app
// sends the notification immediately (see commentMailer.service.ts) rather
// than queueing-then-manually-flushing, so this is a real send LOG, with
// "Erneut senden" per row in place of old's queue-wide "Send mail" action
// (which only makes sense for genuinely still-pending rows).

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

const TYPE_LABELS: Record<string, string> = {
  moderator_notification: 'Neuer Kommentar (an Moderatoren)',
  reply_notification: 'Antwort (an Kommentator)',
};

const ClearAllButton = () => {
  const notify = useNotify();
  const refresh = useRefresh();
  const { total } = useListContext();

  const handleClearAll = async () => {
    if (!window.confirm('Wirklich die gesamte E-Mail-Warteschlange löschen?')) return;
    try {
      await fetch('/api/commentemailqueue/all', { method: 'DELETE', headers: authHeaders() });
      notify('Warteschlange geleert', { type: 'success' });
      refresh();
    } catch {
      notify('Fehler beim Löschen', { type: 'error' });
    }
  };

  return (
    <Button size="small" startIcon={<DeleteSweepIcon fontSize="small" />} onClick={handleClearAll} disabled={!total}>
      Alle löschen
    </Button>
  );
};

const ListActions = () => (
  <TopToolbar>
    <ClearAllButton />
  </TopToolbar>
);

const ResendButton = ({ id }: { id: string }) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const [sending, setSending] = useState(false);

  const handleResend = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSending(true);
    try {
      const res = await fetch(`/api/commentemailqueue/${id}/resend`, { method: 'POST', headers: authHeaders() });
      if (res.ok) notify('Erneut gesendet', { type: 'success' });
      else notify('Fehler beim Senden', { type: 'error' });
      refresh();
    } catch {
      notify('Netzwerkfehler', { type: 'error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <Button size="small" startIcon={<ReplayIcon fontSize="small" />} onClick={handleResend} disabled={sending}>
      Erneut senden
    </Button>
  );
};

export const CommentEmailQueueList = () => (
  <List title="Kommentare - E-Mail-Warteschlange" actions={<ListActions />} sort={{ field: 'createdAt', order: 'DESC' }} perPage={25}>
    <Datagrid rowClick={false} bulkActionButtons={false}>
      <FunctionField label="Von" render={(r: any) => r.fromName ? `${r.fromName} <${r.fromEmail}>` : r.fromEmail} />
      <TextField source="toEmail" label="Gesendet an" />
      <TextField source="subject" label="Betreff" />
      <FunctionField label="Typ" render={(r: any) => TYPE_LABELS[r.type] || r.type} />
      <FunctionField
        label="Status"
        render={(r: any) => (
          <Chip
            size="small"
            label={r.status === 'sent' ? 'Gesendet' : 'Fehlgeschlagen'}
            color={r.status === 'sent' ? 'success' : 'error'}
            variant="outlined"
          />
        )}
      />
      <DateField source="createdAt" label="Datum" showTime />
      <FunctionField label="" render={(r: any) => <ResendButton id={r.id} />} />
    </Datagrid>
  </List>
);
