import { useEffect, useState } from 'react';
import {
  List,
  Datagrid,
  TextField,
  BooleanField,
  DateField,
  DeleteButton,
  TextInput,
  BooleanInput,
  SelectInput,
  Filter,
  TopToolbar,
  ExportButton,
  useListContext,
  useRecordContext,
  Edit,
  SimpleForm,
} from 'react-admin';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Button, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Matches Joomla Visforms' real "Data records for form ..." screen
// (com_visforms&view=visdatas) - one column PER FORM FIELD (not a
// click-through summary), same sortable-header/search/filter/export/
// pagination toolbar react-admin's own <List>/<Datagrid> already provide.
// Submissions are stored as a flexible JSON blob (ServiceOrder.data, keyed
// by whatever field ids existed in the form config at submission time -
// see FormBuilder.tsx/formconfigs.routes.ts), so the column set is fetched
// from the CURRENT form config rather than hardcoded, same reasoning as
// the old ServiceOrderShow.

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

const ServiceOrderFilter = (props: any) => (
  <Filter {...props}>
    {/* Old's real search box (top of the "Data records" screen) searches
        across the submitted values themselves - matched here the same
        way, against every field's stored value. */}
    <TextInput label="Suche" source="q" alwaysOn />
  </Filter>
);

const ListActions = ({ formId }: { formId: string }) => {
  const { total } = useListContext();
  return (
    <TopToolbar>
      <Button
        component={RouterLink}
        to={`/admin/forms/${formId}/edit`}
        startIcon={<ArrowBackIcon />}
        size="small"
      >
        Zurück zum Formular
      </Button>
      <ExportButton disabled={!total} />
    </TopToolbar>
  );
};

export const ServiceOrderList = () => {
  // Falls back to "service-auftrag" so the older static /admin/serviceorders
  // resource route (no :formId param) still works exactly as before.
  const { formId: paramId } = useParams();
  const formId = paramId || 'service-auftrag';
  const fields = useFormFields(formId);

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
      sort={{ field: 'createdAt', order: 'DESC' }}
      perPage={25}
    >
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="id" label="ID" />
        <DateField source="createdAt" label="Erstellt am" showTime />
        <DateField source="updatedAt" label="Geändert am" showTime />
        {fields.map((f) =>
          f.type === 'checkbox' ? (
            <BooleanField key={f.id} source={`data.${f.id}`} label={f.label} />
          ) : (
            <TextField key={f.id} source={`data.${f.id}`} label={f.label} />
          )
        )}
        <DeleteButton />
      </Datagrid>
    </List>
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
    <SimpleForm>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
        Vom Kunden übermittelte Daten - hier korrigierbar, falls z.B. ein Tippfehler gemeldet wird.
      </Typography>
      {fields.map((f) => {
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
        return (
          <TextInput
            key={f.id}
            source={source}
            label={f.label}
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
