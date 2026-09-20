import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { TextField as MuiTextField, MenuItem, Checkbox, FormControlLabel, RadioGroup, Radio, FormLabel, Typography, Box } from '@mui/material';

const API = '/api';

function authHeaders() {
  const token = localStorage.getItem('auth');
  return { 'Authorization': `Bearer ${token}` };
}

interface CustomFieldDef {
  id: string;
  title: string;
  slug: string;
  whenToShow: string;
  categoryIds?: string | null;
  fieldType: string;
  options?: string | null;
  defaultValue?: string | null;
}

// Parses categoryIds defensively - the field is stored as a plain string
// column but the admin's CustomFields form saves it via a react-admin
// ReferenceArrayInput (a real array), so it could be JSON-array-encoded or
// (for older/manually-entered rows) comma-separated.
function parseCategoryIds(raw?: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // fall through to comma-split below
  }
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

// Old Matukio's per-category custom fields (edit/customfields.php) - the
// CustomField model already stores each field's own definition (title,
// type, which categories it applies to); this is what's missing: actually
// showing the relevant ones on an event's own edit form and letting an
// admin fill in that event's values, stored in Event.customFieldValues.
export const EventCustomFieldsSection = () => {
  const { setValue } = useFormContext();
  const categoryId = useWatch({ name: 'categoryId' });
  const values = useWatch({ name: 'customFieldValues' }) || {};
  const [fields, setFields] = useState<CustomFieldDef[] | null>(null);

  useEffect(() => {
    fetch(`${API}/customFields?_end=200`, { headers: authHeaders() })
      .then(res => res.ok ? res.json() : [])
      .then(setFields)
      .catch(() => setFields([]));
  }, []);

  if (!fields) return null;

  const applicable = fields.filter(f =>
    f.whenToShow !== 'specific' || (categoryId && parseCategoryIds(f.categoryIds).includes(categoryId))
  );

  if (applicable.length === 0) {
    return <Typography variant="body2" color="text.secondary">Keine benutzerdefinierten Felder für diese Kategorie verfügbar.</Typography>;
  }

  const setFieldValue = (slug: string, value: any) => {
    setValue('customFieldValues', { ...values, [slug]: value }, { shouldDirty: true });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {applicable.map(field => {
        const value = values[field.slug] ?? field.defaultValue ?? '';
        const options = (field.options || '').split('\n').map(o => o.trim()).filter(Boolean);

        if (field.fieldType === 'checkbox') {
          return (
            <FormControlLabel
              key={field.id}
              control={<Checkbox checked={!!value} onChange={e => setFieldValue(field.slug, e.target.checked)} />}
              label={field.title}
            />
          );
        }
        if (field.fieldType === 'radio') {
          return (
            <Box key={field.id}>
              <FormLabel>{field.title}</FormLabel>
              <RadioGroup value={value} onChange={e => setFieldValue(field.slug, e.target.value)}>
                {options.map(o => <FormControlLabel key={o} value={o} control={<Radio />} label={o} />)}
              </RadioGroup>
            </Box>
          );
        }
        if (field.fieldType === 'select') {
          return (
            <MuiTextField
              key={field.id} select label={field.title} fullWidth size="small"
              value={value} onChange={e => setFieldValue(field.slug, e.target.value)}
            >
              {options.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </MuiTextField>
          );
        }
        return (
          <MuiTextField
            key={field.id} label={field.title} fullWidth size="small"
            multiline={field.fieldType === 'textarea'} minRows={field.fieldType === 'textarea' ? 3 : undefined}
            value={value} onChange={e => setFieldValue(field.slug, e.target.value)}
          />
        );
      })}
    </Box>
  );
};
