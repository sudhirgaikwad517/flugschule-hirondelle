import {
    List,
    Datagrid,
    TextField,
    EmailField,
    BooleanField,
    DateField,
    EditButton,
    Edit,
    SimpleForm,
    TextInput,
    BooleanInput,
    PasswordInput,
    SelectInput,
    Create,
    Filter,
} from 'react-admin';

const roleChoices = [
    { id: 'ADMIN', name: 'Administrator' },
    { id: 'INSTRUCTOR', name: 'Fluglehrer' },
    { id: 'CUSTOMER', name: 'Kunde' },
];

const UserFilter = (props: any) => (
    <Filter {...props}>
        <TextInput label="Suche" source="q" alwaysOn placeholder="Name, E-Mail, Benutzername" />
        <SelectInput label="Rolle" source="role" choices={roleChoices} />
        <BooleanInput label="Gesperrt" source="blocked" />
    </Filter>
);

export const UserList = () => (
    <List filters={<UserFilter />} sort={{ field: 'createdAt', order: 'DESC' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
            <Datagrid rowClick="edit" bulkActionButtons={false}>
                <TextField source="name" label="Name" />
                <EmailField source="email" label="E-Mail" />
                <TextField source="role" label="Rolle" />
                <TextField source="phone" label="Telefon" emptyText="-" />
                <BooleanField source="blocked" label="Gesperrt" />
                <DateField source="createdAt" label="Registriert am" showTime={false} locales="de-DE" />
                <EditButton />
            </Datagrid>
        </div>
    </List>
);

const UserFormFields = ({ isCreate }: { isCreate?: boolean }) => (
    <>
        <TextInput source="name" label="Name" fullWidth required />
        <TextInput source="email" label="E-Mail" type="email" fullWidth required />
        <PasswordInput
            source="password"
            label={isCreate ? 'Passwort' : 'Neues Passwort (leer lassen = unverändert)'}
            fullWidth
            required={isCreate}
        />
        <SelectInput source="role" label="Rolle" choices={roleChoices} defaultValue="CUSTOMER" fullWidth />
        <BooleanInput source="blocked" label="Gesperrt" defaultValue={false} />
        <TextInput source="username" label="Benutzername" fullWidth />
        <TextInput source="phone" label="Telefon / Mobil" fullWidth />
        <TextInput source="address1" label="Adresse (Straße, Nr.)" fullWidth />
        <TextInput source="location" label="Ort" fullWidth />
        <TextInput source="postalCode" label="PLZ" fullWidth />
        <TextInput source="country" label="Land" fullWidth />
        <TextInput source="birthDate" label="Geburtsdatum" fullWidth />
        <TextInput source="weight" label="Gewicht (kg)" fullWidth />
    </>
);

export const UserEdit = () => (
    <Edit>
        <SimpleForm>
            <UserFormFields />
        </SimpleForm>
    </Edit>
);

export const UserCreate = () => (
    <Create>
        <SimpleForm>
            <UserFormFields isCreate />
        </SimpleForm>
    </Create>
);
