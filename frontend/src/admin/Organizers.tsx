import {
    List,
    Datagrid,
    TextField,
    EmailField,
    BooleanField,
    EditButton,
    Edit,
    SimpleForm,
    TextInput,
    BooleanInput,
    Create,
    ReferenceInput,
    SelectInput,
    BulkDeleteButton,
    useUpdateMany,
    useNotify,
    useUnselectAll,
    useListContext,
    Button
} from 'react-admin';
import { RichTextInput } from 'ra-input-rich-text';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const OrganizerBulkActionButtons = () => {
    const { selectedIds, resource } = useListContext();
    const notify = useNotify();
    const unselectAll = useUnselectAll(resource);
    const [updateMany, { isLoading }] = useUpdateMany();

    const handlePublish = () => {
        updateMany(
            resource,
            { ids: selectedIds, data: { published: true } },
            {
                onSuccess: () => {
                    notify('Veröffentlicht', { type: 'info' });
                    unselectAll();
                },
                onError: (error: any) => notify(`Fehler: ${error.message}`, { type: 'error' }),
            }
        );
    };

    const handleHide = () => {
        updateMany(
            resource,
            { ids: selectedIds, data: { published: false } },
            {
                onSuccess: () => {
                    notify('Versteckt', { type: 'info' });
                    unselectAll();
                },
                onError: (error: any) => notify(`Fehler: ${error.message}`, { type: 'error' }),
            }
        );
    };

    return (
        <>
            <Button label="Veröffentlichen" onClick={handlePublish} disabled={isLoading}>
                <VisibilityIcon />
            </Button>
            <Button label="Verstecken" onClick={handleHide} disabled={isLoading}>
                <VisibilityOffIcon />
            </Button>
            <BulkDeleteButton label="Löschen" />
        </>
    );
};

export const OrganizerList = () => (
    <List>
        <Datagrid rowClick="edit" bulkActionButtons={<OrganizerBulkActionButtons />}>
            <TextField source="id" label="ID" />
            <TextField source="user.id" label="Benutzer-Id" emptyText="-" />
            <TextField source="name" label="Name" />
            <EmailField source="email" label="E-Mail" emptyText="-" />
            <TextField source="phone" label="Telefon" emptyText="-" />
            <BooleanField source="published" label="Freigegeben" />
            <EditButton />
        </Datagrid>
    </List>
);

export const OrganizerEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled fullWidth />
            <ReferenceInput source="userId" reference="users" label="Benutzer">
                <SelectInput optionText="name" emptyText="Kein Benutzer" fullWidth />
            </ReferenceInput>
            <TextInput source="name" label="Name" fullWidth />
            <TextInput source="email" label="E-Mail" fullWidth />
            <TextInput source="website" label="Webseite" fullWidth />
            <TextInput source="phone" label="Telefon" fullWidth />
            <TextInput source="imageUrl" label="Bilder (URL)" fullWidth />
            <RichTextInput source="description" label="Beschreibung" />
            <TextInput source="comments" label="Kommentare" multiline fullWidth />
            <BooleanInput source="published" label="Freigegeben" />
        </SimpleForm>
    </Edit>
);

export const OrganizerCreate = () => (
    <Create>
        <SimpleForm>
            <ReferenceInput source="userId" reference="users" label="Benutzer">
                <SelectInput optionText="name" emptyText="Kein Benutzer" fullWidth />
            </ReferenceInput>
            <TextInput source="name" label="Name" fullWidth required />
            <TextInput source="email" label="E-Mail" fullWidth />
            <TextInput source="website" label="Webseite" fullWidth />
            <TextInput source="phone" label="Telefon" fullWidth />
            <TextInput source="imageUrl" label="Bilder (URL)" fullWidth />
            <RichTextInput source="description" label="Beschreibung" />
            <TextInput source="comments" label="Kommentare" multiline fullWidth />
            <BooleanInput source="published" label="Freigegeben" defaultValue={true} />
        </SimpleForm>
    </Create>
);
