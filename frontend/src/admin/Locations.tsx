import {
    List,
    Datagrid,
    TextField,
    BooleanField,
    EditButton,
    Edit,
    SimpleForm,
    TextInput,
    BooleanInput,
    Create,
    BulkDeleteButton,
    useUpdateMany,
    useNotify,
    useUnselectAll,
    useListContext,
    Button,
    NumberInput,
    Filter
} from 'react-admin';
import { RichTextInput } from 'ra-input-rich-text';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useWatch } from 'react-hook-form';
import { Box } from '@mui/material';

const MapPreview = () => {
    const latitude = useWatch({ name: 'latitude' });
    const longitude = useWatch({ name: 'longitude' });
    const address = useWatch({ name: 'googleMapsUrl' }) || useWatch({ name: 'name' });

    let mapUrl = '';
    if (latitude && longitude) {
        mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
    } else if (address) {
        mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`;
    }

    if (!mapUrl) return null;

    return (
        <Box sx={{ mt: 2, mb: 2, width: '100%', height: 400, border: '1px solid #ccc', borderRadius: 1, overflow: 'hidden' }}>
            <iframe
                title="Google Maps Preview"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={mapUrl}
                allowFullScreen
            />
        </Box>
    );
};

const LocationBulkActionButtons = () => {
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

const LocationFilter = (props: any) => (
    <Filter {...props}>
        <TextInput label="Suche" source="q" alwaysOn />
    </Filter>
);

export const LocationList = () => (
    <List filters={<LocationFilter />}>
        <Datagrid rowClick="edit" bulkActionButtons={<LocationBulkActionButtons />}>
            <TextField source="id" label="ID" />
            <TextField source="title" label="Titel des Veranstaltungsort" />
            <TextField source="name" label="Veranstaltungsort" />
            <TextField source="email" label="E-Mail" emptyText="-" />
            <TextField source="phone" label="Telefon" emptyText="-" />
            <TextField source="googleMapsUrl" label="Google Maps" emptyText="-" />
            <BooleanField source="published" label="Freigegeben" />
            <EditButton />
        </Datagrid>
    </List>
);

const LocationForm = () => (
    <>
        <TextInput source="title" label="Titel des Veranstaltungsort" fullWidth required />
        <TextInput source="name" label="Veranstaltungsort" fullWidth />
        <TextInput source="googleMapsUrl" label="Google Maps Adresse" fullWidth />
        
        <MapPreview />
        
        <NumberInput source="latitude" label="Breitengrad der Adresse" fullWidth />
        <NumberInput source="longitude" label="Längengrad der Adresse" fullWidth />
        
        <TextInput source="phone" label="Telefon" fullWidth />
        <TextInput source="email" label="E-Mail" fullWidth />
        <TextInput source="website" label="Webseite" fullWidth />
        
        <TextInput source="imageUrl" label="Bilder (URL)" fullWidth />
        
        <RichTextInput source="description" label="Beschreibung" />
        <TextInput source="comments" label="Kommentare" multiline fullWidth />
        
        <BooleanInput source="published" label="Freigegeben" defaultValue={true} />
    </>
);

export const LocationEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled fullWidth />
            <LocationForm />
        </SimpleForm>
    </Edit>
);

export const LocationCreate = () => (
    <Create>
        <SimpleForm>
            <LocationForm />
        </SimpleForm>
    </Create>
);
