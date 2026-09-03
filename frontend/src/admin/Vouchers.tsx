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
    ReferenceInput,
    SelectInput,
    NumberField,
    DateField,
    Filter
} from 'react-admin';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const VoucherBulkActionButtons = () => {
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

const VoucherFilter = (props: any) => (
    <Filter {...props}>
        <TextInput label="Suche (Code)" source="q" alwaysOn />
        <SelectInput
            label="Status"
            source="published"
            choices={[
                { id: 'true', name: 'Veröffentlicht' },
                { id: 'false', name: 'Versteckt' }
            ]}
            alwaysOn
        />
    </Filter>
);

export const VoucherList = () => (
    <List filters={<VoucherFilter />}>
        <Datagrid rowClick="edit" bulkActionButtons={<VoucherBulkActionButtons />}>
            <TextField source="code" label="Gutscheincode" />
            <TextField source="id" label="ID" />
            <NumberField source="value" label="Wert" />
            <BooleanField source="isPercentage" label="Wert in Prozent" />
            <NumberField source="limit" label="Limit" />
            <NumberField source="usedCount" label="Verwendet" />
            <DateField source="validFrom" label="Gültig ab" emptyText="-" />
            <DateField source="validUntil" label="Gültig bis" emptyText="-" />
            <BooleanField source="published" label="Veröffentlicht" />
            <EditButton />
        </Datagrid>
    </List>
);

const VoucherForm = () => (
    <>
        <TextInput source="code" label="Gutscheincode" fullWidth required />
        <NumberInput source="value" label="Wert" fullWidth required />
        <NumberInput source="limit" label="Limit (0 = Ohne)" defaultValue={0} fullWidth />
        
        <ReferenceInput source="eventId" reference="events">
            <SelectInput 
                optionText="title" 
                label="Veranstaltung" 
                emptyText="Alle Veranstaltungen" 
                fullWidth 
            />
        </ReferenceInput>
        
        <BooleanInput source="isPercentage" label="Wert in Prozent" defaultValue={false} />
        
        <DateInput source="validFrom" label="Gültig ab" fullWidth />
        <DateInput source="validUntil" label="Gültig bis" fullWidth />
        
        <BooleanInput source="published" label="Freigegeben" defaultValue={true} />
    </>
);

export const VoucherEdit = () => (
    <Edit>
        <SimpleForm>
            <VoucherForm />
        </SimpleForm>
    </Edit>
);

export const VoucherCreate = () => (
    <Create>
        <SimpleForm>
            <VoucherForm />
        </SimpleForm>
    </Create>
);
