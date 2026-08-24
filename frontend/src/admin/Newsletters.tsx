import {
    List,
    Datagrid,
    TextField,
    BooleanField,
    DateField,
    EditButton,
    Edit,
    SimpleForm,
    TextInput,
    BooleanInput,
    Create,
} from 'react-admin';

export const NewsletterList = () => (
    <List>
        <Datagrid>
            <TextField source="email" />
            <BooleanField source="isActive" />
            <DateField source="subscribedAt" />
            <EditButton />
        </Datagrid>
    </List>
);

export const NewsletterEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled />
            <TextInput source="email" fullWidth />
            <BooleanInput source="isActive" />
        </SimpleForm>
    </Edit>
);

export const NewsletterCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="email" fullWidth />
            <BooleanInput source="isActive" defaultValue={true} />
        </SimpleForm>
    </Create>
);
