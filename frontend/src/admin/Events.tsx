import {
    List,
    Datagrid,
    TextField,
    NumberField,
    DateField,
    EditButton,
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    DateInput,
    Create,
    ArrayInput,
    SimpleFormIterator,
    SelectInput,
    DateTimeInput,
    ReferenceField
} from 'react-admin';

export const EventList = () => (
    <List title="Termine & Kurse">
        <Datagrid>
            <TextField source="title" label="Titel" />
            <ReferenceField source="categoryId" reference="categories" label="Kategorie">
                <TextField source="title" />
            </ReferenceField>
            <TextField source="category" label="Kat. (Legacy)" />
            <DateField source="startDate" label="Startdatum" />
            <DateField source="endDate" label="Enddatum" />
            <TextField source="location" label="Ort" />
            <NumberField source="capacity" label="Plätze" />
            <EditButton label="Bearbeiten" />
        </Datagrid>
    </List>
);

export const EventEdit = () => (
    <Edit title="Termin bearbeiten">
        <SimpleForm>
            <TextInput source="id" disabled label="ID" />
            <TextInput source="title" fullWidth label="Titel" />
            
            <ReferenceInput source="categoryId" reference="categories">
                <SelectInput optionText="title" label="Kategorie (Neu)" fullWidth />
            </ReferenceInput>
            <TextInput source="category" label="Kategorie (Legacy - alt)" fullWidth helperText="Wird in Zukunft entfernt." />
            
            <TextInput source="description" multiline fullWidth label="Beschreibung" />
            <DateInput source="startDate" label="Startdatum" />
            <DateInput source="endDate" label="Enddatum" />
            <TextInput source="location" label="Ort" />
            <NumberInput source="capacity" label="Plätze (Kapazität)" />
            <NumberInput source="maxParticipants" label="Maximale Teilnehmerzahl" />
            
            <TextInput source="color" label="Farbe (Hex)" type="color" defaultValue="#3a87ad" />
            
            <TextInput source="imageUrl" fullWidth label="Bild URL" />
            <DateTimeInput source="registrationDeadline" label="Anmeldeschluss" />
            <TextInput source="organizer" label="Veranstalter" defaultValue="Flugschule Hirondelle" />

            <ArrayInput source="tickets" label="Ticket-Kategorien (z.B. Standard, Inkl. Ausrüstung)">
                <SimpleFormIterator>
                    <TextInput source="name" label="Ticket Name" required />
                    <NumberInput source="price" label="Preis (€)" required />
                    <NumberInput source="capacity" label="Kapazität" defaultValue={20} required />
                    <TextInput source="description" label="Ticket Beschreibung" fullWidth multiline />
                </SimpleFormIterator>
            </ArrayInput>
        </SimpleForm>
    </Edit>
);

export const EventCreate = () => (
    <Create title="Neuen Termin erstellen">
        <SimpleForm>
            <TextInput source="title" fullWidth label="Titel" />
            
            <ReferenceInput source="categoryId" reference="categories">
                <SelectInput optionText="title" label="Kategorie (Neu)" fullWidth />
            </ReferenceInput>
            <TextInput source="category" label="Kategorie (Legacy - alt)" fullWidth helperText="Wird in Zukunft entfernt." />
            
            <TextInput source="description" multiline fullWidth label="Beschreibung" />
            <DateInput source="startDate" label="Startdatum" />
            <DateInput source="endDate" label="Enddatum" />
            <TextInput source="location" label="Ort" />
            <NumberInput source="capacity" label="Plätze (Kapazität)" />
            <NumberInput source="maxParticipants" label="Maximale Teilnehmerzahl" />
            
            <TextInput source="color" label="Farbe (Hex)" type="color" defaultValue="#3a87ad" />
            
            <TextInput source="imageUrl" fullWidth label="Bild URL" />
            <DateTimeInput source="registrationDeadline" label="Anmeldeschluss" />
            <TextInput source="organizer" label="Veranstalter" defaultValue="Flugschule Hirondelle" />

            <ArrayInput source="tickets" label="Ticket-Kategorien (z.B. Standard, Inkl. Ausrüstung)">
                <SimpleFormIterator>
                    <TextInput source="name" label="Ticket Name" required />
                    <NumberInput source="price" label="Preis (€)" required />
                    <NumberInput source="capacity" label="Kapazität" defaultValue={20} required />
                    <TextInput source="description" label="Ticket Beschreibung" fullWidth multiline />
                </SimpleFormIterator>
            </ArrayInput>
        </SimpleForm>
    </Create>
);
