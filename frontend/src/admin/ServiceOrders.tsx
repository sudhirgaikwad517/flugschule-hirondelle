import { useEffect, useState } from 'react';
import {
  List,
  Datagrid,
  TextField,
  BooleanField,
  FunctionField,
  DateField,
  TextInput,
  BooleanInput,
  SelectInput,
  CheckboxGroupInput,
  Filter,
  TopToolbar,
  ExportButton,
  downloadCSV,
  useListContext,
  useRecordContext,
  useNotify,
  useRefresh,
  useUnselectAll,
  useUpdateMany,
  useInput,
  useRedirect,
  Edit,
  SimpleForm,
  Toolbar,
  SaveButton,
} from 'react-admin';
import jsonExport from 'jsonexport/dist';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Button, Typography, Box, Menu, MenuItem } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';

// Structural rows (submit/reset/fieldsep/image - see FormFieldsEditor.tsx;
// `image` is a real <input type="image"> submit button, not a photo/file
// upload) carry no submitted value at all - never real data columns/
// inputs/CSV columns.
const STRUCTURAL_TYPES = new Set(['submit', 'reset', 'fieldsep', 'image']);

// Matches Joomla Visforms' real "Data records for form ..." screen
// (com_visforms&view=visdatas), deep-verified against
// src/View/Visdatas/HtmlView.php + src/Model/VisdatasModel.php +
// tmpl/visdatas/default.php - real column order is ID | checkbox |
// Veröffentlicht | Geändert(ismfd) | Erstellt von | one column PER FORM
// FIELD (VisdatasModel's own `showFieldInDataView` excludes fieldsep/
// image/submit/reset/pagebreak, matching STRUCTURAL_TYPES above) |
// IP-Adresse | Datum(created) | Geändert am. A "Status ändern" bulk
// dropdown (Veröffentlichen/Verstecken/Löschen - "Freigeben"=checkin and a
// generic "Bearbeiten" bulk action assume a Joomla checkout/locking system
// this app doesn't have, so they're left out, same as everywhere else this
// project omits ACL/checkout-only chrome) + Export + a Status filter,
// none of it AEF-gated (real ACL permission checks on the live site).

interface FieldDef {
  id: string;
  label: string;
  type: string;
  order: number;
}

const useFormFields = (formId = 'service-auftrag') => {
  const [fields, setFields] = useState<FieldDef[] | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth');
    fetch(`/api/formconfigs/${formId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setFields([...(data.fields || [])].sort((a: FieldDef, b: FieldDef) => a.order - b.order)))
      .catch(() => setFields([]));
  }, [formId]);

  return fields;
};

const useFormSettings = (formId: string) => {
  const [settings, setSettings] = useState<any>(null);
  useEffect(() => {
    const token = localStorage.getItem('auth');
    fetch(`/api/formconfigs/${formId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setSettings(data.settings || null))
      .catch(() => setSettings(null));
  }, [formId]);
  return settings;
};

// Old's real "Erweitert > CSV-Export" tab (visform-csvexport fieldset) -
// separator/headline/extra-column toggles actually applied here, instead of
// react-admin's plain default exporter (always comma, always every raw
// field verbatim).
const buildCsvExporter = (fields: FieldDef[], settings: any) => (records: any[]) => {
  const csv = settings?.advanced?.csv || {};
  const rows = records.map((r) => {
    const row: Record<string, any> = {};
    if (csv.includeId) row['ID'] = r.id;
    fields.filter((f) => !STRUCTURAL_TYPES.has(f.type)).forEach((f) => {
      const value = r.data?.[f.id];
      row[f.label] = f.type === 'checkbox'
        ? (value ? 'Ja' : 'Nein')
        : Array.isArray(value) ? value.join(', ') : (value ?? '');
    });
    if (csv.includeCreated) row['Erstellt am'] = r.createdAt;
    if (csv.includeModifiedAt) row['Geändert am'] = r.updatedAt;
    if (csv.includeIp) row['IP-Adresse'] = r.ip || '';
    return row;
  });
  jsonExport(
    rows,
    { rowDelimiter: csv.separator || ';', includeHeaders: csv.includeHeadline !== false },
    (err: any, csvString: string) => {
      if (err) { console.error(err); return; }
      downloadCSV(csvString, 'service-auftrag-daten');
    }
  );
};

const ServiceOrderFilter = (props: any) => (
  <Filter {...props}>
    {/* Old's real search box (top of the "Data records" screen) searches
        across the submitted values themselves - matched here the same
        way, against every field's stored value. */}
    <TextInput label="Suche" source="q" alwaysOn />
    <SelectInput
      label="Status"
      source="published"
      alwaysOn
      emptyText="- Status wählen -"
      choices={[{ id: 'true', name: 'Veröffentlicht' }, { id: 'false', name: 'Nicht veröffentlicht' }]}
    />
  </Filter>
);

// Old's real always-available "Status ändern" bulk dropdown - not gated
// behind row selection the way react-admin's own bulk-toolbar convention
// is, same approach as Formulare.tsx/FormFieldsEditor.tsx's Aktionen menus.
const ActionsMenu = () => {
  const { selectedIds } = useListContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const unselectAll = useUnselectAll('serviceorders');
  const [updateMany] = useUpdateMany();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

  const requireSelection = () => {
    if (!selectedIds || selectedIds.length === 0) {
      notify('Bitte mindestens einen Eintrag auswählen', { type: 'warning' });
      return false;
    }
    return true;
  };

  const setPublished = (published: boolean) => {
    setAnchorEl(null);
    if (!requireSelection()) return;
    updateMany(
      'serviceorders',
      { ids: selectedIds, data: { published } },
      {
        onSuccess: () => { notify(published ? 'Veröffentlicht' : 'Versteckt', { type: 'success' }); unselectAll(); refresh(); },
        onError: (error: any) => notify(`Fehler: ${error.message}`, { type: 'error' }),
      }
    );
  };

  const handleDelete = async () => {
    setAnchorEl(null);
    if (!requireSelection()) return;
    if (!window.confirm(`${selectedIds.length} Eintrag/Einträge wirklich löschen?`)) return;
    try {
      await Promise.all(selectedIds.map((id) => fetch(`/api/serviceorders/${id}`, { method: 'DELETE', headers: authHeaders() })));
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
        Status ändern
      </Button>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => setPublished(true)}><CheckCircleIcon fontSize="small" sx={{ mr: 1 }} /> Veröffentlichen</MenuItem>
        <MenuItem onClick={() => setPublished(false)}><CancelIcon fontSize="small" sx={{ mr: 1 }} /> Verstecken</MenuItem>
        <MenuItem onClick={handleDelete}><DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Löschen</MenuItem>
      </Menu>
    </>
  );
};

const ListActions = ({ formId }: { formId: string }) => {
  const { total } = useListContext();
  return (
    <TopToolbar>
      <Button component={RouterLink} to={`/admin/forms/${formId}/edit`} startIcon={<ArrowBackIcon />} size="small">
        Zurück zum Formular
      </Button>
      <ActionsMenu />
      <ExportButton disabled={!total} />
    </TopToolbar>
  );
};

const PublishedIcon = () => (
  <FunctionField
    label="Veröffentlicht"
    render={(record: any) => (record.published !== false ? <CheckCircleIcon fontSize="small" color="success" /> : <CancelIcon fontSize="small" color="disabled" />)}
  />
);

export const ServiceOrderList = () => {
  // Falls back to "service-auftrag" so the older static /admin/serviceorders
  // resource route (no :formId param) still works exactly as before.
  const { formId: paramId } = useParams();
  const formId = paramId || 'service-auftrag';
  const fields = useFormFields(formId);
  const settings = useFormSettings(formId);

  // Datagrid children must exist at render time - wait for the dynamic
  // field list before rendering any columns at all, same as the old
  // per-row Show view already did.
  if (fields === null) return null;

  return (
    <List
      resource="serviceorders"
      filter={{ formId }}
      filters={<ServiceOrderFilter />}
      actions={<ListActions formId={formId} />}
      exporter={buildCsvExporter(fields, settings)}
      sort={{ field: 'createdAt', order: 'DESC' }}
      perPage={25}
    >
      <Datagrid rowClick="edit" bulkActionButtons={<></>}>
        <TextField source="id" label="ID" />
        <PublishedIcon />
        <FunctionField label="Geändert" render={(r: any) => (r.updatedAt !== r.createdAt ? 'Ja' : 'Nein')} />
        <FunctionField label="Erstellt von" render={(r: any) => r.userId || 'Gast'} />
        {fields.filter((f) => !STRUCTURAL_TYPES.has(f.type)).map((f) =>
          f.type === 'checkbox' ? (
            <BooleanField key={f.id} source={`data.${f.id}`} label={f.label} />
          ) : f.type === 'multicheckbox' ? (
            <FunctionField key={f.id} label={f.label} render={(r: any) => (Array.isArray(r.data?.[f.id]) ? r.data[f.id].join(', ') : '')} />
          ) : f.type === 'file' ? (
            <FunctionField
              key={f.id}
              label={f.label}
              render={(r: any) => r.data?.[f.id]
                ? <a href={r.data[f.id]} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>Datei</a>
                : ''}
            />
          ) : (
            <TextField key={f.id} source={`data.${f.id}`} label={f.label} />
          )
        )}
        <TextField source="ip" label="IP-Adresse" />
        <DateField source="createdAt" label="Datum" showTime />
        <DateField source="updatedAt" label="Geändert am" showTime />
      </Datagrid>
    </List>
  );
};

// A file field's re-upload/current-link UI (old's real edit screen shows a
// thumbnail-or-icon preview + delete-checkbox + re-upload input for these -
// this keeps the "view current + replace it" capability without a separate
// delete-checkbox, since replacing IS how an admin corrects a bad upload).
const FileFieldInput = ({ source, label }: { source: string; label: string }) => {
  const { field } = useInput({ source });
  const [uploading, setUploading] = useState(false);
  const notify = useNotify();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/serviceorders/upload', { method: 'POST', body });
      const json = await res.json();
      if (res.ok) field.onChange(json.url);
      else notify(json.message || 'Upload fehlgeschlagen', { type: 'error' });
    } catch {
      notify('Netzwerkfehler beim Hochladen', { type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" sx={{ display: 'block', color: '#666', mb: 0.5 }}>{label}</Typography>
      {field.value && (
        <a href={field.value} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem' }}>
          Aktuelle Datei ansehen
        </a>
      )}
      <input type="file" onChange={handleChange} />
      {uploading && <Typography variant="caption" sx={{ display: 'block', color: '#888', mt: 0.5 }}>Wird hochgeladen...</Typography>}
    </Box>
  );
};

// Old's real "Geändert am" is only shown if the record was actually
// modified after creation (`ismfd`) - approximated here the same way the
// list's own "Geändert" column does, since we don't store a separate flag.
const MetaBlock = () => {
  const record = useRecordContext();
  if (!record) return null;
  const wasModified = record.updatedAt !== record.createdAt;
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2, p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1 }}>
      <Box><Typography variant="caption" sx={{ color: '#888', display: 'block' }}>ID</Typography><Typography variant="body2">{record.id}</Typography></Box>
      <Box><Typography variant="caption" sx={{ color: '#888', display: 'block' }}>Erstellt</Typography><Typography variant="body2">{new Date(record.createdAt).toLocaleString('de-DE')}</Typography></Box>
      <Box><Typography variant="caption" sx={{ color: '#888', display: 'block' }}>Erstellt von</Typography><Typography variant="body2">{record.userId || 'Gast'}</Typography></Box>
      <Box><Typography variant="caption" sx={{ color: '#888', display: 'block' }}>IP-Adresse</Typography><Typography variant="body2">{record.ip || '-'}</Typography></Box>
      {wasModified && (
        <Box><Typography variant="caption" sx={{ color: '#888', display: 'block' }}>Geändert am</Typography><Typography variant="body2">{new Date(record.updatedAt).toLocaleString('de-DE')}</Typography></Box>
      )}
    </Box>
  );
};

// Old's real edit-screen toolbar (ItemViewBase, same base as Visform/
// Visfields edit) for an existing record with no create-permission use
// case here: Speichern & Schließen | Schließen. ("Speichern & Neu" assumes
// core.create, which makes no sense for a submitted data record; a real
// "Zurücksetzen"-only-if-modified button would need an original-submission
// snapshot this app doesn't keep, so it's left out rather than faked.)
const EditToolbar = ({ formId }: { formId: string }) => {
  const redirect = useRedirect();
  return (
    <Toolbar sx={{ display: 'flex', gap: 1, bgcolor: 'transparent' }}>
      <SaveButton label="Speichern & Schließen" mutationOptions={{ onSuccess: () => redirect(`/forms/${formId}/data`) }} />
      <Button size="small" startIcon={<CloseIcon />} component={RouterLink} to={`/admin/forms/${formId}/data`}>
        Schließen
      </Button>
    </Toolbar>
  );
};

// Old's real click-through from the "Data records" screen opens the
// submission in an editable form (an admin can correct what a customer
// submitted) - not a read-only Show. Same dynamic field-config approach,
// rendering the right Input type per field.
const ServiceOrderEditForm = () => {
  // react-admin's rowClick="edit" always navigates to this resource's own
  // canonical route (/admin/serviceorders/:id), not a path relative to
  // whichever custom /admin/forms/:formId/data list it was reached from -
  // so the record's OWN stored formId (not a route param) is what
  // determines which form's field config applies to it.
  const record = useRecordContext();
  const fields = useFormFields(record?.formId || 'service-auftrag');
  if (!record || fields === null) return null;

  return (
    <SimpleForm toolbar={<EditToolbar formId={record.formId || 'service-auftrag'} />}>
      <MetaBlock />
      {fields.filter((f) => !STRUCTURAL_TYPES.has(f.type)).map((f) => {
        const source = `data.${f.id}`;
        if (f.type === 'checkbox') {
          return <BooleanInput key={f.id} source={source} label={f.label} />;
        }
        if (f.type === 'radio' || f.type === 'select') {
          return (
            <SelectInput
              key={f.id}
              source={source}
              label={f.label}
              choices={((f as any).options || []).map((opt: string) => ({ id: opt, name: opt }))}
              fullWidth
            />
          );
        }
        if (f.type === 'multicheckbox') {
          return (
            <CheckboxGroupInput
              key={f.id}
              source={source}
              label={f.label}
              choices={((f as any).options || []).map((opt: string) => ({ id: opt, name: opt }))}
            />
          );
        }
        if (f.type === 'file') {
          return <FileFieldInput key={f.id} source={source} label={f.label} />;
        }
        return (
          <TextInput
            key={f.id}
            source={source}
            label={f.label}
            type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
            multiline={f.type === 'textarea'}
            fullWidth
          />
        );
      })}
    </SimpleForm>
  );
};

export const ServiceOrderEdit = () => (
  <Edit>
    <ServiceOrderEditForm />
  </Edit>
);
