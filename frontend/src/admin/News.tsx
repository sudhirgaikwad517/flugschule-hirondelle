import {
  List,
  Datagrid,
  TextField,
  DateField,
  EditButton,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  BooleanInput,
  BooleanField,
  required
} from 'react-admin';

export const NewsList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="title" label="Titel" />
      <TextField source="slug" label="Slug" />
      <BooleanField source="published" label="Veröffentlicht" />
      <DateField source="createdAt" label="Erstellt am" />
      <EditButton />
    </Datagrid>
  </List>
);

export const NewsEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" label="Titel" validate={required()} fullWidth />
      <TextInput source="slug" label="Slug (optional, wird automatisch generiert)" fullWidth />
      <TextInput source="content" label="Inhalt" multiline rows={10} validate={required()} fullWidth />
      <TextInput source="imageUrl" label="Bild URL" fullWidth />
      <BooleanInput source="published" label="Veröffentlicht" />
    </SimpleForm>
  </Edit>
);

export const NewsCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" label="Titel" validate={required()} fullWidth />
      <TextInput source="slug" label="Slug (optional, wird automatisch generiert)" fullWidth />
      <TextInput source="content" label="Inhalt" multiline rows={10} validate={required()} fullWidth />
      <TextInput source="imageUrl" label="Bild URL" fullWidth />
      <BooleanInput source="published" label="Veröffentlicht" defaultValue={true} />
    </SimpleForm>
  </Create>
);
