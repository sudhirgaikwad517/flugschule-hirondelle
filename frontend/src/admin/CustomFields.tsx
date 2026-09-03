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
    SelectInput,
    NumberInput,
    NumberField,
    BulkDeleteButton,
    useUpdateMany,
    useNotify,
    useUnselectAll,
    useListContext,
    Button,
    FormDataConsumer,
    ReferenceArrayInput,
    SelectArrayInput
} from 'react-admin';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const CustomFieldBulkActionButtons = () => {
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

export const CustomFieldList = () => (
    <List>
        <Datagrid rowClick="edit" bulkActionButtons={<CustomFieldBulkActionButtons />}>
            <TextField source="id" label="Num" />
            <TextField source="title" label="Title" />
            <TextField source="slug" label="Slug" />
            <TextField source="fieldType" label="Field type" />
            <TextField source="defaultValue" label="Default value" emptyText="-" />
            <NumberField source="order" label="Reihenfolge" />
            <BooleanField source="published" label="Veröffentlicht" />
            <EditButton />
        </Datagrid>
    </List>
);

const CustomFieldForm = () => (
    <>
        <TextInput source="title" label="Title *" fullWidth required />
        <TextInput source="position" label="Position" fullWidth helperText="Set the position where the custom field should be shown?" />
        <TextInput source="slug" label="Slug" fullWidth helperText="This is the internal name under which this field is saved. Only lowercase letters and numbers." />
        
        <SelectInput source="whenToShow" label="When to show" choices={[
            { id: 'all', name: 'All categories' },
            { id: 'specific', name: 'Specific category' }
        ]} fullWidth defaultValue="all" />
        
        <FormDataConsumer>
            {({ formData }) => formData.whenToShow === 'specific' &&
                <ReferenceArrayInput source="categoryIds" reference="categories">
                    <SelectArrayInput label="Kategorie" optionText="title" fullWidth helperText="Only applies if the 'When to show' field above is set to 'Specific category'." />
                </ReferenceArrayInput>
            }
        </FormDataConsumer>

        <SelectInput source="fieldType" label="Field type" choices={[
            { id: 'text', name: 'Text' },
            { id: 'textarea', name: 'Textarea' },
            { id: 'select', name: 'Select' },
            { id: 'checkbox', name: 'Checkbox' },
            { id: 'radio', name: 'Radio' }
        ]} fullWidth defaultValue="text" helperText="Select what kind of control this field will render." />

        <TextInput source="options" label="Options" multiline fullWidth helperText="For text and password boxes enter the placeholder text to be shown in the field. For checkbox fields, this is ignored. For everything else, use the convention VALUE=LABEL with one value/label pair per line." />
        
        <TextInput source="defaultValue" label="Default" fullWidth helperText="Enter the default value for the custom field. For checkboxes, you can enter 1 or 0 to select between on and off state respectively." />
        
        <BooleanInput source="allowEmpty" label="Allow empty" helperText="When it's not checked the field validation is enabled and the user will not be able to submit the entry unless he fills this field." />
        <BooleanInput source="addFilter" label="Add filter" helperText="Enable filtering on this custom field" />
        <BooleanInput source="showLabel" label="Show label" helperText="Should the label be shown or just the content?" defaultValue={true} />
        
        <NumberInput source="order" label="Reihenfolge" defaultValue={0} />
        <BooleanInput source="published" label="Veröffentlicht" defaultValue={true} />
    </>
);

export const CustomFieldEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled fullWidth />
            <CustomFieldForm />
        </SimpleForm>
    </Edit>
);

export const CustomFieldCreate = () => (
    <Create>
        <SimpleForm>
            <CustomFieldForm />
        </SimpleForm>
    </Create>
);
