import { useEffect, useState } from 'react';
import {
  List,
  Datagrid,
  DateField,
  FunctionField,
  ShowButton,
  DeleteButton,
  Show,
  useRecordContext,
} from 'react-admin';
import { Box, Typography, CircularProgress } from '@mui/material';

// Submissions are stored as a flexible JSON blob (ServiceOrder.data, keyed
// by whatever field ids existed in the form config at submission time - see
// FormBuilder.tsx/formconfigs.routes.ts) rather than fixed DB columns, so
// this fetches the CURRENT form config to know each field's real label and
// display order, same as Joomla Visforms' own "visdatas" view resolves
// each submission's raw column values against the form's field definitions.
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

// A short, readable one-line summary for the list's Datagrid - the first
// couple of non-checkbox fields' values (typically name + email), not
// every field (matching Visforms' own "visdatas" list, which shows a few
// key columns, full data only in the per-row detail view).
const SummaryField = ({ fields }: { fields: FieldDef[] | null }) => {
  const record = useRecordContext();
  if (!record || !fields) return null;
  const summaryFields = fields.filter((f) => f.type !== 'checkbox').slice(0, 2);
  return (
    <span>
      {summaryFields.map((f) => record.data?.[f.id]).filter(Boolean).join(' · ') || '—'}
    </span>
  );
};

export const ServiceOrderList = () => {
  const fields = useFormFields();
  return (
    <List sort={{ field: 'createdAt', order: 'DESC' }}>
      <Datagrid rowClick="show">
        <DateField source="createdAt" label="Eingegangen am" showTime />
        <FunctionField label="Zusammenfassung" render={() => <SummaryField fields={fields} />} />
        <ShowButton />
        <DeleteButton />
      </Datagrid>
    </List>
  );
};

const FieldValueRow = ({ field, value }: { field: FieldDef; value: any }) => {
  let display: string;
  if (field.type === 'checkbox') {
    display = value ? 'Ja' : 'Nein';
  } else if (value === undefined || value === null || value === '') {
    display = '—';
  } else {
    display = String(value);
  }
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>{field.label}</Typography>
      <Typography variant="body2">{display}</Typography>
    </Box>
  );
};

const ServiceOrderShowContent = () => {
  const record = useRecordContext();
  const fields = useFormFields();

  if (!record || !fields) return <CircularProgress sx={{ m: 4 }} />;

  const data = record.data || {};
  const knownIds = new Set(fields.map((f) => f.id));
  // Any data key that no longer matches a configured field (e.g. it was
  // removed from the form after this submission came in) is still shown,
  // labeled with its raw id, rather than silently dropped.
  const orphanedKeys = Object.keys(data).filter((k) => !knownIds.has(k));

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
        Eingegangen am {new Date(record.createdAt).toLocaleString('de-DE')}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
        {fields.map((f) => <FieldValueRow key={f.id} field={f} value={data[f.id]} />)}
        {orphanedKeys.map((k) => (
          <FieldValueRow key={k} field={{ id: k, label: k, type: 'text', order: 0 }} value={data[k]} />
        ))}
      </Box>
    </Box>
  );
};

export const ServiceOrderShow = () => (
  <Show>
    <ServiceOrderShowContent />
  </Show>
);
