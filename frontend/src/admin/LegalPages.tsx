import { List, Datagrid, TextField, EditButton, Edit, SimpleForm, TextInput } from 'react-admin';
import { RichTextInput } from 'ra-input-rich-text';

export const LegalPageList = () => (
    <List title="Rechtliche Seiten" pagination={false}>
        <Datagrid bulkActionButtons={false} rowClick="edit">
            <TextField source="slug" label="Slug" />
            <TextField source="title" label="Titel" />
            <EditButton />
        </Datagrid>
    </List>
);

export const LegalPageEdit = () => (
    <Edit title="Rechtliche Seite bearbeiten">
        <SimpleForm>
            <TextInput source="slug" disabled fullWidth />
            <TextInput source="title" label="Titel" fullWidth required />
            <RichTextInput source="content" label="Inhalt" />
        </SimpleForm>
    </Edit>
);
