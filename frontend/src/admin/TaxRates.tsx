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
    NumberField
} from 'react-admin';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const TaxRateBulkActionButtons = () => {
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

export const TaxRateList = () => (
    <List>
        <Datagrid rowClick="edit" bulkActionButtons={<TaxRateBulkActionButtons />}>
            <TextField source="title" label="Titel" />
            <NumberField source="value" label="Wert" />
            <TextField source="id" label="ID" />
            <BooleanField source="published" label="Veröffentlicht" />
            <EditButton />
        </Datagrid>
    </List>
);

const TaxRateForm = () => (
    <>
        <TextInput source="title" label="Steuersatz Titel" fullWidth required />
        <NumberInput source="value" label="Wert" fullWidth required />
        <BooleanInput source="published" label="Freigegeben" defaultValue={true} />
    </>
);

export const TaxRateEdit = () => (
    <Edit>
        <SimpleForm>
            <TaxRateForm />
        </SimpleForm>
    </Edit>
);

export const TaxRateCreate = () => (
    <Create>
        <SimpleForm>
            <TaxRateForm />
        </SimpleForm>
    </Create>
);
