import {
  List,
  Datagrid,
  TextField,
  DateField,
  Edit,
  SimpleForm,
  TextInput,
  BooleanInput,
  ReferenceField,
  FunctionField
} from 'react-admin';

export const CommentList = () => (
  <List title="Kommentare (CComment Ersatz)">
      <Datagrid rowClick="edit">
          <TextField source="authorName" label="Autor" />
          <TextField source="eventTitle" label="Veranstaltung" />
          <TextField source="content" label="Inhalt" />
          <FunctionField label="Status" render={(record: any) => record.isApproved ? 'Freigegeben' : 'Wartet auf Freigabe'} />
          <DateField source="createdAt" label="Datum" />
      </Datagrid>
  </List>
);

export const CommentEdit = () => (
  <Edit title="Kommentar moderieren">
      <SimpleForm>
          <TextField source="authorName" label="Autor" />
          <TextField source="eventTitle" label="Veranstaltung" />
          <DateField source="createdAt" label="Datum" />
          <TextInput source="content" label="Inhalt" fullWidth multiline />
          <BooleanInput source="isApproved" label="Freigegeben (Sichtbar für Nutzer)" />
      </SimpleForm>
  </Edit>
);
