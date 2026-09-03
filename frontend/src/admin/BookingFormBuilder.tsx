import {
    Edit,
    SimpleForm,
    TextInput,
    BooleanInput,
    ArrayInput,
    SimpleFormIterator,
    SelectInput,
    NumberInput,
    useGetOne,
    useUpdate,
    useNotify,
    useRefresh,
    SaveButton,
    Toolbar
} from 'react-admin';
import { Typography, Card, CardContent, CircularProgress } from '@mui/material';

const CustomToolbar = (props: any) => (
    <Toolbar {...props}>
        <SaveButton label="Speichern" />
    </Toolbar>
);

export const BookingFormBuilder = () => {
    const { data, isLoading, error } = useGetOne('bookingFormConfig', { id: 'default' });
    const notify = useNotify();
    const refresh = useRefresh();
    const [update] = useUpdate();

    if (isLoading) return <CircularProgress />;
    if (error) return <div>Error loading configuration</div>;

    const save = (data: any) => {
        update(
            'bookingFormConfig',
            { id: 'default', data, previousData: data },
            {
                onSuccess: () => {
                    notify('Buchungs-Formular gespeichert', { type: 'success' });
                    refresh();
                },
                onError: (error: any) => {
                    notify(`Fehler beim Speichern: ${error.message}`, { type: 'error' });
                }
            }
        );
    };

    return (
        <Card sx={{ mt: 2, mb: 4, maxWidth: '1000px', mx: 'auto' }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Buchungs-Formular (Booking Form Builder)
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Hier können Sie die Schritte und Felder des Buchungsformulars konfigurieren. 
                    Sie können festlegen, ob ein Feld ein Ticket ist, den Preis ändert oder für Person 1/2 gilt.
                </Typography>
                
                <Edit record={data} resource="bookingFormConfig" id="default" redirect={false} mutationMode="pessimistic" transform={(data) => data}>
                    <SimpleForm onSubmit={save} toolbar={<CustomToolbar />}>
                        <ArrayInput source="steps" label="Formular-Schritte (Steps)">
                            <SimpleFormIterator getItemLabel={(index) => `Schritt ${index + 1}`}>
                                <TextInput source="id" label="Schritt ID (z.B. step-1)" required />
                                <TextInput source="title" label="Schritt Titel" required fullWidth />
                                
                                <ArrayInput source="fields" label="Felder in diesem Schritt">
                                    <SimpleFormIterator getItemLabel={(index) => `Feld ${index + 1}`}>
                                        <TextInput source="id" label="Feld ID (z.B. firstName)" required />
                                        <TextInput source="label" label="Feld Label (Anzeigename)" required />
                                        
                                        <SelectInput source="type" label="Feld Typ" choices={[
                                            { id: 'text', name: 'Text' },
                                            { id: 'email', name: 'Email' },
                                            { id: 'textarea', name: 'Textbereich (Textarea)' },
                                            { id: 'checkbox', name: 'Checkbox (Ja/Nein)' },
                                            { id: 'select', name: 'Dropdown (Select)' },
                                            { id: 'number', name: 'Zahl (Number)' },
                                        ]} required />
                                        
                                        <BooleanInput source="required" label="Pflichtfeld?" defaultValue={true} />
                                        
                                        <Typography variant="subtitle2" style={{ marginTop: '16px' }}>Erweiterte Ticket- & Preis-Einstellungen</Typography>
                                        
                                        <NumberInput source="priceModifier" label="Preis-Modifikator (€)" helperText="Positiver Wert fügt hinzu, negativer zieht ab (z.B. -10 für Rabatt)" defaultValue={0} />
                                        <BooleanInput source="isTicket" label="Ist das ein Ticket?" defaultValue={false} />
                                        <BooleanInput source="perTicket" label="Wird dies pro Ticket berechnet?" defaultValue={false} />
                                        <SelectInput source="linkedToPerson" label="Gilt für Person?" choices={[
                                            { id: 0, name: 'Alle / Keine' },
                                            { id: 1, name: 'Person 1' },
                                            { id: 2, name: 'Person 2' },
                                        ]} defaultValue={0} />
                                    </SimpleFormIterator>
                                </ArrayInput>
                            </SimpleFormIterator>
                        </ArrayInput>
                    </SimpleForm>
                </Edit>
            </CardContent>
        </Card>
    );
};
