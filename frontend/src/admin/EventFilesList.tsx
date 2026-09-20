import { useEffect, useState } from 'react';
import { useRecordContext, useNotify } from 'react-admin';
import { Box, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Button, Typography, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const API = '/api';

function authHeaders() {
  const token = localStorage.getItem('auth');
  return { 'Authorization': `Bearer ${token}` };
}

// Old Matukio's per-event file attachments (edit/files.php) - upload/list/
// delete. Real historical usage on the old site was a single PDF across
// its whole history, so this stays a plain list rather than old's fuller
// per-file access-level/download-tracking system.
export const EventFilesList = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    if (!record?.id) return;
    fetch(`${API}/events/${record.id}/files`, { headers: authHeaders() })
      .then(res => res.ok ? res.json() : [])
      .then(setFiles)
      .finally(() => setLoading(false));
  };

  useEffect(load, [record?.id]);

  if (!record?.id) {
    return <Typography variant="body2" color="text.secondary">Dateien können erst nach dem ersten Speichern hinzugefügt werden.</Typography>;
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch(`${API}/upload`, { method: 'POST', headers: authHeaders(), body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.message || 'Upload fehlgeschlagen');

      const res = await fetch(`${API}/events/${record.id}/files`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: file.name, url: uploadData.url })
      });
      if (!res.ok) throw new Error('Speichern fehlgeschlagen');
      notify('Datei hochgeladen', { type: 'success' });
      load();
    } catch (err: any) {
      notify(err.message || 'Fehler beim Hochladen', { type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!window.confirm('Diese Datei wirklich löschen?')) return;
    const res = await fetch(`${API}/events/files/${fileId}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) {
      notify('Datei gelöscht', { type: 'info' });
      load();
    } else {
      notify('Fehler beim Löschen', { type: 'error' });
    }
  };

  if (loading) return <CircularProgress size={20} />;

  return (
    <Box>
      {files.length > 0 && (
        <Table size="small" sx={{ mb: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>Titel</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {files.map(f => (
              <TableRow key={f.id}>
                <TableCell>{f.title}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" component="a" href={f.url} target="_blank" rel="noopener noreferrer" title="Herunterladen">
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(f.id)} title="Löschen">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Button component="label" variant="outlined" startIcon={<UploadFileIcon />} disabled={uploading}>
        {uploading ? 'Lädt hoch...' : 'Datei hochladen'}
        <input type="file" hidden onChange={handleUpload} />
      </Button>
    </Box>
  );
};
