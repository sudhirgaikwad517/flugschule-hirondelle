import { 
  List, 
  Datagrid, 
  TextField, 
  EditButton, 
  Edit, 
  Create, 
  TextInput,
  SelectInput,
  ReferenceInput,
  useRecordContext,
  TabbedForm,
  FormTab,
  TopToolbar,
  CreateButton,
  ExportButton,
  SortButton,
  FilterButton
} from 'react-admin';
import { RichTextInput } from 'ra-input-rich-text';
import { Box, Chip, Typography } from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

const StatusIconField = ({ source }: { source: string }) => {
    const record = useRecordContext();
    if (!record) return null;
    const isPublished = record[source] === 'PUBLISHED';
    return isPublished ? (
        <CheckCircleOutlinedIcon color="success" />
    ) : (
        <CancelOutlinedIcon color="action" />
    );
};

const TitleField = () => {
    const record = useRecordContext();
    if (!record) return null;
    return (
        <Box>
            <Typography variant="body2" color="primary">{record.title}</Typography>
            <Typography variant="caption" color="textSecondary">Alias: {record.alias}</Typography>
        </Box>
    );
};

const BadgeField = ({ source, color, label: _label }: { source: string, color: string, label: string }) => {
    const record = useRecordContext();
    if (!record) return null;
    return (
        <Chip 
            label={record[source] || 0} 
            sx={{ 
                bgcolor: color, 
                color: 'white', 
                fontWeight: 'bold', 
                borderRadius: '4px',
                minWidth: '40px'
            }} 
            size="small"
        />
    );
};

const categoryFilters = [
  <TextInput source="q" label="Suche" alwaysOn />,
  <SelectInput source="status" label="- Status wählen -" choices={[
      { id: 'PUBLISHED', name: 'Veröffentlicht' },
      { id: 'HIDDEN', name: 'Versteckt' },
      { id: 'ARCHIVED', name: 'Archiviert' },
      { id: 'TRASH', name: 'Papierkorb' },
  ]} />,
  <SelectInput source="accessLevel" label="- Zugriffsebene wählen -" choices={[
      { id: 'PUBLIC', name: 'Öffentlich' },
      { id: 'REGISTERED', name: 'Registriert' },
      { id: 'SPECIAL', name: 'Spezial' },
  ]} />,
  <TextInput source="tags" label="- Schlagwort wählen -" />,
  <SelectInput source="maxLevels" label="- Max. Ebenen wählen -" choices={[
      { id: '1', name: '1' },
      { id: '2', name: '2' },
      { id: '3', name: '3' },
      { id: '4', name: '4' },
      { id: '5', name: '5' },
  ]} />,
  <ReferenceInput source="parentId" reference="categories">
      <SelectInput optionText="title" label="- Kategorie wählen -" emptyText="- Alle -" />
  </ReferenceInput>
];

const CategoryListActions = () => (
    <TopToolbar>
        <FilterButton />
        <SortButton fields={['id', 'title', 'status', 'accessLevel']} />
        <CreateButton />
        <ExportButton />
    </TopToolbar>
);

export const CategoryList = () => (
  <List filters={categoryFilters} actions={<CategoryListActions />} exporter={false} title="Kategorien" perPage={20}>
      <Datagrid rowClick="edit">
          <TextField source="id" label="ID" />
          <StatusIconField source="status" />
          <TitleField />
          <BadgeField source="publishedCount" color="#4caf50" label="Veröffentlicht" />
          <BadgeField source="hiddenCount" color="#f44336" label="Versteckt" />
          <BadgeField source="archivedCount" color="#3f51b5" label="Archiviert" />
          <BadgeField source="trashCount" color="#607d8b" label="Papierkorb" />
          <TextField source="accessLevel" label="Zugriffsebene" />
          <EditButton />
      </Datagrid>
  </List>
);

export const CategoryEdit = () => (
  <Edit title="Kategorie bearbeiten">
      <TabbedForm>
          <FormTab label="Kategorie">
              <TextInput source="id" disabled />
              <TextInput source="title" label="Titel *" required fullWidth />
              <TextInput source="alias" label="Alias" helperText="Automatisch aus Titel generieren" fullWidth />
              
              <RichTextInput source="description" label="Beschreibung" />
              
              <ReferenceInput source="parentId" reference="categories">
                  <SelectInput optionText="title" label="Übergeordnete Kategorie" fullWidth emptyText="- Kein übergeordnetes Element -" />
              </ReferenceInput>
              
              <SelectInput source="status" label="Status" choices={[
                  { id: 'PUBLISHED', name: 'Veröffentlicht' },
                  { id: 'HIDDEN', name: 'Versteckt' },
                  { id: 'ARCHIVED', name: 'Archiviert' },
                  { id: 'TRASH', name: 'Papierkorb' },
              ]} defaultValue="PUBLISHED" fullWidth />
              
              <SelectInput source="accessLevel" label="Zugriffsebene" choices={[
                  { id: 'PUBLIC', name: 'Öffentlich' },
                  { id: 'REGISTERED', name: 'Registriert' },
                  { id: 'SPECIAL', name: 'Spezial' },
              ]} defaultValue="PUBLIC" fullWidth />
              
              <TextInput source="tags" label="Schlagwörter" helperText="Schlagwort eingeben oder auswählen" fullWidth />
              <TextInput source="note" label="Notiz" fullWidth />
          </FormTab>
          <FormTab label="Optionen">
              <Typography>Weitere Optionen kommen hier.</Typography>
          </FormTab>
          <FormTab label="Veröffentlichung">
              <Typography>Einstellungen zur Veröffentlichung kommen hier.</Typography>
          </FormTab>
          <FormTab label="Berechtigungen">
              <Typography>Zugriffsberechtigungen kommen hier.</Typography>
          </FormTab>
      </TabbedForm>
  </Edit>
);

export const CategoryCreate = () => (
  <Create title="Neue Kategorie">
      <TabbedForm>
          <FormTab label="Kategorie">
              <TextInput source="title" label="Titel *" required fullWidth />
              <TextInput source="alias" label="Alias" helperText="Automatisch aus Titel generieren" fullWidth />
              
              <RichTextInput source="description" label="Beschreibung" />
              
              <ReferenceInput source="parentId" reference="categories">
                  <SelectInput optionText="title" label="Übergeordnete Kategorie" fullWidth emptyText="- Kein übergeordnetes Element -" />
              </ReferenceInput>
              
              <SelectInput source="status" label="Status" choices={[
                  { id: 'PUBLISHED', name: 'Veröffentlicht' },
                  { id: 'HIDDEN', name: 'Versteckt' },
                  { id: 'ARCHIVED', name: 'Archiviert' },
                  { id: 'TRASH', name: 'Papierkorb' },
              ]} defaultValue="PUBLISHED" fullWidth />
              
              <SelectInput source="accessLevel" label="Zugriffsebene" choices={[
                  { id: 'PUBLIC', name: 'Öffentlich' },
                  { id: 'REGISTERED', name: 'Registriert' },
                  { id: 'SPECIAL', name: 'Spezial' },
              ]} defaultValue="PUBLIC" fullWidth />
              
              <TextInput source="tags" label="Schlagwörter" helperText="Schlagwort eingeben oder auswählen" fullWidth />
              <TextInput source="note" label="Notiz" fullWidth />
          </FormTab>
          <FormTab label="Optionen">
              <Typography>Weitere Optionen kommen hier.</Typography>
          </FormTab>
          <FormTab label="Veröffentlichung">
              <Typography>Einstellungen zur Veröffentlichung kommen hier.</Typography>
          </FormTab>
          <FormTab label="Berechtigungen">
              <Typography>Zugriffsberechtigungen kommen hier.</Typography>
          </FormTab>
      </TabbedForm>
  </Create>
);
