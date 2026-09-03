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

export const WebLinkCategoryList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="title" label="Titel" />
      <NumberField source="order" label="Reihenfolge" />
      <BooleanField source="published" label="Aktiv" />
      <EditButton />
    </Datagrid>
  </List>
);

export const WebLinkCategoryEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" label="Titel" validate={required()} fullWidth />
      <TextInput source="description" label="Beschreibung" multiline fullWidth />
      <NumberInput source="order" label="Reihenfolge" defaultValue={0} />
      <BooleanInput source="published" label="Aktiv" />
    </SimpleForm>
  </Edit>
);

export const WebLinkCategoryCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" label="Titel" validate={required()} fullWidth />
      <TextInput source="description" label="Beschreibung" multiline fullWidth />
      <NumberInput source="order" label="Reihenfolge" defaultValue={0} />
      <BooleanInput source="published" label="Aktiv" defaultValue={true} />
    </SimpleForm>
  </Create>
);

export const WebLinkList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="title" label="Titel" />
      <ReferenceField source="categoryId" reference="weblinkcategories" label="Kategorie">
        <TextField source="title" />
      </ReferenceField>
      <TextField source="url" label="URL" />
      <NumberField source="order" label="Reihenfolge" />
      <BooleanField source="published" label="Aktiv" />
      <EditButton />
    </Datagrid>
  </List>
);

export const WebLinkEdit = () => (
  <Edit>
    <SimpleForm>
      <ReferenceInput source="categoryId" reference="weblinkcategories" label="Kategorie">
        <SelectInput optionText="title" validate={required()} fullWidth />
      </ReferenceInput>
      <TextInput source="title" label="Titel" validate={required()} fullWidth />
      <TextInput source="description" label="Beschreibung" multiline fullWidth />
      <TextInput source="url" label="Link URL" validate={required()} fullWidth />
      <NumberInput source="order" label="Reihenfolge" defaultValue={0} />
      <BooleanInput source="published" label="Aktiv" />
    </SimpleForm>
  </Edit>
);

export const WebLinkCreate = () => (
  <Create>
    <SimpleForm>
      <ReferenceInput source="categoryId" reference="weblinkcategories" label="Kategorie">
        <SelectInput optionText="title" validate={required()} fullWidth />
      </ReferenceInput>
      <TextInput source="title" label="Titel" validate={required()} fullWidth />
      <TextInput source="description" label="Beschreibung" multiline fullWidth />
      <TextInput source="url" label="Link URL" validate={required()} fullWidth />
      <NumberInput source="order" label="Reihenfolge" defaultValue={0} />
      <BooleanInput source="published" label="Aktiv" defaultValue={true} />
    </SimpleForm>
  </Create>
);
