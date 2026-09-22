import { Box, FormControlLabel, MenuItem, Switch, TextField } from '@mui/material';

// Editing a fixed-page duplicate's own title/URL/publish-status/nav
// settings (see FixedPageDuplicate model / fixedPageDuplicates.routes.ts)
// happens right inside the content editor that already opens for it
// (AusbildungContentEditor.tsx etc.), rather than as a separate screen -
// this is the shared field group + slug normalization used there. Styled
// as the same single-row toolbar as the custom Seiten editor's own header
// (Pages.tsx), so both "page settings" bars look and behave identically.

export interface FixedDuplicateMeta {
  id: string;
  title: string;
  slug: string;
  status: string;
  showInNav: boolean;
  navLabel: string | null;
}

export const normalizeDuplicateSlug = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const FixedDuplicateMetaFields = ({
  meta,
  onChange,
}: {
  meta: FixedDuplicateMeta;
  onChange: (next: FixedDuplicateMeta) => void;
}) => (
  <Box sx={{ p: 2, mb: 3, border: '1px solid #e2e8f0', borderRadius: 1, display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap', bgcolor: '#fff' }}>
    <TextField
      label="Titel"
      value={meta.title}
      onChange={(e) => onChange({ ...meta, title: e.target.value })}
      size="small"
      fullWidth={false}
      sx={{ width: 180 }}
    />
    <TextField
      label="URL"
      value={meta.slug}
      onChange={(e) => onChange({ ...meta, slug: e.target.value })}
      onBlur={(e) => onChange({ ...meta, slug: normalizeDuplicateSlug(e.target.value) })}
      helperText="z.B. infos-kopie"
      size="small"
      fullWidth={false}
      sx={{ width: 180 }}
    />
    <TextField
      select
      label="Status"
      value={meta.status}
      onChange={(e) => onChange({ ...meta, status: e.target.value })}
      size="small"
      fullWidth={false}
      sx={{ width: 140 }}
    >
      <MenuItem value="published">Veröffentlicht</MenuItem>
      <MenuItem value="draft">Entwurf</MenuItem>
    </TextField>
    <FormControlLabel
      control={<Switch checked={meta.showInNav} onChange={(e) => onChange({ ...meta, showInNav: e.target.checked })} />}
      label="Im Menü"
      sx={{ flexShrink: 0, mt: 0.5 }}
    />
    <TextField
      label="Menü-Beschriftung"
      value={meta.navLabel || ''}
      onChange={(e) => onChange({ ...meta, navLabel: e.target.value })}
      helperText="Leer = Titel"
      size="small"
      fullWidth={false}
      sx={{ width: 160 }}
    />
  </Box>
);
