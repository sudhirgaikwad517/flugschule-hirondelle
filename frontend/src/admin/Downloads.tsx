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
  ReferenceField,
  ReferenceInput,
  SelectInput,
  NumberField,
  NumberInput,
  required
} from 'react-admin';

export const DownloadCategoryList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="title" label="Titel" />
      <NumberField source="order" label="Reihenfolge" />
      <BooleanField source="published" label="Aktiv" />
      <EditButton />
    </Datagrid>
  </List>
);

export const DownloadCategoryEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" label="Titel" validate={required()} fullWidth />
      <TextInput source="description" label="Beschreibung" multiline fullWidth />
      <NumberInput source="order" label="Reihenfolge" defaultValue={0} />
      <BooleanInput source="published" label="Aktiv" />
    </SimpleForm>
  </Edit>
);

export const DownloadCategoryCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" label="Titel" validate={required()} fullWidth />
      <TextInput source="description" label="Beschreibung" multiline fullWidth />
      <NumberInput source="order" label="Reihenfolge" defaultValue={0} />
      <BooleanInput source="published" label="Aktiv" defaultValue={true} />
    </SimpleForm>
  </Create>
);

export const DownloadFileList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="title" label="Dateiname" />
      <ReferenceField source="categoryId" reference="downloadcategories" label="Kategorie">
        <TextField source="title" />
      </ReferenceField>
      <TextField source="fileUrl" label="Datei URL" />
      <NumberField source="order" label="Reihenfolge" />
      <BooleanField source="published" label="Aktiv" />
      <EditButton />
    </Datagrid>
  </List>
);

export const DownloadFileEdit = () => (
  <Edit>
    <SimpleForm>
      <ReferenceInput source="categoryId" reference="downloadcategories" label="Kategorie">
        <SelectInput optionText="title" validate={required()} fullWidth />
      </ReferenceInput>
      <TextInput source="title" label="Titel" validate={required()} fullWidth />
      <TextInput source="description" label="Beschreibung" multiline fullWidth />
      <TextInput source="fileUrl" label="Datei URL (PDF etc.)" validate={required()} fullWidth />
      <NumberInput source="fileSize" label="Dateigröße (Bytes)" />
      <NumberInput source="order" label="Reihenfolge" defaultValue={0} />
      <BooleanInput source="published" label="Aktiv" />
    </SimpleForm>
  </Edit>
);

export const DownloadFileCreate = () => (
  <Create>
    <SimpleForm>
      <ReferenceInput source="categoryId" reference="downloadcategories" label="Kategorie">
        <SelectInput optionText="title" validate={required()} fullWidth />
      </ReferenceInput>
      <TextInput source="title" label="Titel" validate={required()} fullWidth />
      <TextInput source="description" label="Beschreibung" multiline fullWidth />
      <TextInput source="fileUrl" label="Datei URL (PDF etc.)" validate={required()} fullWidth />
      <NumberInput source="fileSize" label="Dateigröße (Bytes)" />
      <NumberInput source="order" label="Reihenfolge" defaultValue={0} />
      <BooleanInput source="published" label="Aktiv" defaultValue={true} />
    </SimpleForm>
  </Create>
);
