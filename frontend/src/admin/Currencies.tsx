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
    RadioButtonGroupInput
} from 'react-admin';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const CurrencyBulkActionButtons = () => {
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

export const CurrencyList = () => (
    <List>
        <Datagrid rowClick="edit" bulkActionButtons={<CurrencyBulkActionButtons />}>
            <TextField source="id" label="Id" />
            <TextField source="description" label="Beschreibung" />
            <TextField source="symbol" label="Symbol" />
            <TextField source="paymentCode" label="Zahlungs-Code" />
            <BooleanField source="published" label="Freigegeben" />
            <EditButton />
        </Datagrid>
    </List>
);

const CurrencyForm = () => (
    <>
        <TextInput source="description" label="Beschreibung" fullWidth required />
        <TextInput source="symbol" label="Symbol" fullWidth required />
        <TextInput source="paymentCode" label="Zahlungs-Code" fullWidth required />
        
        <RadioButtonGroupInput source="symbolPosition" label="Währungs-Symbol Position" choices={[
            { id: 'Links', name: 'Links' },
            { id: 'Rechts', name: 'Rechts' }
        ]} defaultValue="Rechts" />
        
        <TextInput source="decimalChar" label="Dezimal Zeichen" fullWidth required defaultValue="," />
        
        <BooleanInput source="published" label="Freigegeben" defaultValue={true} />
    </>
);

export const CurrencyEdit = () => (
    <Edit>
        <SimpleForm>
            <CurrencyForm />
        </SimpleForm>
    </Edit>
);

export const CurrencyCreate = () => (
    <Create>
        <SimpleForm>
            <CurrencyForm />
        </SimpleForm>
    </Create>
);
