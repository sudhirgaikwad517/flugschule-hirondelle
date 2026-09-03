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
    SelectInput,
} from 'react-admin';

export const NewsletterList = () => (
    <List>
        <Datagrid>
            <TextField source="email" />
            <TextField source="listType" />
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
            <SelectInput source="listType" choices={[
                { id: 'GENERAL', name: 'General' },
                { id: 'TANDEM', name: 'Tandem' }
            ]} />
            <BooleanInput source="isActive" />
        </SimpleForm>
    </Edit>
);

export const NewsletterCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="email" fullWidth />
            <SelectInput source="listType" choices={[
                { id: 'GENERAL', name: 'General' },
                { id: 'TANDEM', name: 'Tandem' }
            ]} defaultValue="GENERAL" />
            <BooleanInput source="isActive" defaultValue={true} />
        </SimpleForm>
    </Create>
);
