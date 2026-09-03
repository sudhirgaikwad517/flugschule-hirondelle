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
    DateInput,
    SelectInput,
    NumberField,
    DateField
} from 'react-admin';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const TieredFeeBulkActionButtons = () => {
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

export const TieredFeeList = () => (
    <List>
        <Datagrid rowClick="edit" bulkActionButtons={<TieredFeeBulkActionButtons />}>
            <TextField source="title" label="Titel" />
            <TextField source="id" label="ID" />
            <NumberField source="value" label="Wert" />
            <BooleanField source="isPercentage" label="Wert in Prozent" />
            <BooleanField source="isDiscount" label="Rabatt" />
            <DateField source="validFrom" label="Gültig ab" emptyText="-" />
            <DateField source="validUntil" label="Gültig bis" emptyText="-" />
            <BooleanField source="published" label="Veröffentlicht" />
            <EditButton />
        </Datagrid>
    </List>
);

const TieredFeeForm = () => (
    <>
        <TextInput source="title" label="Titel der Gebühr" fullWidth required />
        <NumberInput source="value" label="Wert" fullWidth required />
        
        <BooleanInput source="isPercentage" label="Wert in Prozent" defaultValue={false} />
        <BooleanInput source="isDiscount" label="Rabatt" defaultValue={false} />
        
        <SelectInput source="groupRequirement" label="Group requirement (ACL)" choices={[
            { id: 'public', name: 'Öffentlich' },
            { id: 'registered', name: 'Registriert' },
            { id: 'admin', name: 'Admin' }
        ]} defaultValue="public" fullWidth />
        
        <DateInput source="validFrom" label="Gültig ab" fullWidth />
        <DateInput source="validUntil" label="Gültig bis" fullWidth />
        
        <BooleanInput source="published" label="Freigegeben" defaultValue={true} />
    </>
);

export const TieredFeeEdit = () => (
    <Edit>
        <SimpleForm>
            <TieredFeeForm />
        </SimpleForm>
    </Edit>
);

export const TieredFeeCreate = () => (
    <Create>
        <SimpleForm>
            <TieredFeeForm />
        </SimpleForm>
    </Create>
);
