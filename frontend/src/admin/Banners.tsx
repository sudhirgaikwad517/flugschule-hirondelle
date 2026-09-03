import {
  List,
  Datagrid,
  TextField,
  EditButton,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  BooleanInput,
  BooleanField,
  NumberField,
  NumberInput,
  SelectInput,
  required
} from 'react-admin';

export const AdBannerList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="title" label="Titel" />
      <TextField source="position" label="Position" />
      <NumberField source="order" label="Reihenfolge" />
      <BooleanField source="published" label="Aktiv" />
      <EditButton />
    </Datagrid>
  </List>
);

export const AdBannerEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" label="Titel" validate={required()} fullWidth />
      <TextInput source="imageUrl" label="Bild URL" validate={required()} fullWidth />
      <TextInput source="linkUrl" label="Ziel URL (Optional)" fullWidth />
      <SelectInput source="position" label="Position" choices={[
        { id: 'home_top', name: 'Startseite Oben' },
        { id: 'home_middle', name: 'Startseite Mitte' },
        { id: 'sidebar', name: 'Sidebar' },
      ]} validate={required()} />
      <NumberInput source="order" label="Reihenfolge" defaultValue={0} />
      <BooleanInput source="published" label="Aktiv" />
    </SimpleForm>
  </Edit>
);

export const AdBannerCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" label="Titel" validate={required()} fullWidth />
      <TextInput source="imageUrl" label="Bild URL" validate={required()} fullWidth />
      <TextInput source="linkUrl" label="Ziel URL (Optional)" fullWidth />
      <SelectInput source="position" label="Position" choices={[
        { id: 'home_top', name: 'Startseite Oben' },
        { id: 'home_middle', name: 'Startseite Mitte' },
        { id: 'sidebar', name: 'Sidebar' },
      ]} validate={required()} defaultValue="home_top" />
      <NumberInput source="order" label="Reihenfolge" defaultValue={0} />
      <BooleanInput source="published" label="Aktiv" defaultValue={true} />
    </SimpleForm>
  </Create>
);
