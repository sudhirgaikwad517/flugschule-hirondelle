import { 
  List, 
  Datagrid, 
  TextField, 
  EditButton, 
  Edit, 
  Create, 
  SimpleForm, 
  TextInput,
  SelectInput,
  ReferenceInput
} from 'react-admin';

// using standard TextInput for description if RichTextInput is not installed, but we will use RichTextInput if available.
// If ra-input-rich-text is not installed, it will cause an error, so I'll just use TextInput with multiline for now to be safe.

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
  <ReferenceInput source="parentId" reference="categories">
      <SelectInput optionText="title" label="- Kategorie wählen -" emptyText="- Alle -" />
  </ReferenceInput>
];

export const CategoryList = () => (
  <List filters={categoryFilters} exporter={false}>
      <Datagrid rowClick="edit">
          <TextField source="id" />
          <TextField source="status" />
          <TextField source="title" label="Title" />
          <TextField source="alias" />
          <TextField source="accessLevel" label="Access Level" />
          <EditButton />
      </Datagrid>
  </List>
);

export const CategoryEdit = () => (
  <Edit>
      <SimpleForm>
          <TextInput source="id" disabled />
          <TextInput source="title" label="Titel *" required fullWidth />
          <TextInput source="alias" label="Alias" helperText="Leave empty to auto-generate" fullWidth />
          
          <TextInput source="description" label="Beschreibung" multiline fullWidth rows={5} />
          
          <ReferenceInput source="parentId" reference="categories">
              <SelectInput optionText="title" label="Übergeordnete Kategorie (Parent Category)" fullWidth />
          </ReferenceInput>
          
          <SelectInput source="status" label="Status" choices={[
              { id: 'PUBLISHED', name: 'Veröffentlicht (Published)' },
              { id: 'HIDDEN', name: 'Versteckt (Hidden)' },
              { id: 'ARCHIVED', name: 'Archiviert (Archived)' },
              { id: 'TRASH', name: 'Papierkorb (Trash)' },
          ]} defaultValue="PUBLISHED" />
          
          <SelectInput source="accessLevel" label="Zugriffsebene (Access Level)" choices={[
              { id: 'PUBLIC', name: 'Öffentlich (Public)' },
              { id: 'REGISTERED', name: 'Registriert (Registered)' },
              { id: 'SPECIAL', name: 'Spezial (Special)' },
          ]} defaultValue="PUBLIC" />
          
          <TextInput source="tags" label="Schlagwörter (Tags)" fullWidth />
          <TextInput source="note" label="Notiz (Note)" multiline fullWidth />
      </SimpleForm>
  </Edit>
);

export const CategoryCreate = () => (
  <Create>
      <SimpleForm>
          <TextInput source="title" label="Titel *" required fullWidth />
          <TextInput source="alias" label="Alias" helperText="Leave empty to auto-generate from title" fullWidth />
          
          <TextInput source="description" label="Beschreibung" multiline fullWidth rows={5} />
          
          <ReferenceInput source="parentId" reference="categories">
              <SelectInput optionText="title" label="Übergeordnete Kategorie" fullWidth />
          </ReferenceInput>
          
          <SelectInput source="status" label="Status" choices={[
              { id: 'PUBLISHED', name: 'Veröffentlicht (Published)' },
              { id: 'HIDDEN', name: 'Versteckt (Hidden)' },
              { id: 'ARCHIVED', name: 'Archiviert (Archived)' },
              { id: 'TRASH', name: 'Papierkorb (Trash)' },
          ]} defaultValue="PUBLISHED" />
          
          <SelectInput source="accessLevel" label="Zugriffsebene" choices={[
              { id: 'PUBLIC', name: 'Öffentlich (Public)' },
              { id: 'REGISTERED', name: 'Registriert (Registered)' },
              { id: 'SPECIAL', name: 'Spezial (Special)' },
          ]} defaultValue="PUBLIC" />
          
          <TextInput source="tags" label="Schlagwörter (Tags)" fullWidth />
          <TextInput source="note" label="Notiz (Note)" multiline fullWidth />
      </SimpleForm>
  </Create>
);
