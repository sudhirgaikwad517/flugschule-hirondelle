import {
    Form,
    TextInput,
    BooleanInput,
    SelectInput,
    ArrayInput,
    SimpleFormIterator,
    ResourceContextProvider,
    useGetOne,
    useUpdate,
    useNotify,
    useRefresh,
} from 'react-admin';
import { Typography, Card, CardContent, CircularProgress, Box, Button } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

// Matches Joomla Visforms' real "visform edit" capability - unlike
// BookingFormBuilder.tsx (which can only relabel/reorder/toggle-required a
// FIXED set of fields the code already knows about), this can add a
// genuinely NEW field from scratch (any type, own id/label/options) because
// submissions are stored as a flexible JSON blob (ServiceOrder.data) keyed
// by whatever field ids exist in this config at submission time, not fixed
// DB columns. Same <Form record={...} onSubmit={...}> pattern proven
// working in TemplatesBuilder.tsx/BookingFormBuilder.tsx.

const FIELD_TYPE_CHOICES = [
    { id: 'text', name: 'Text' },
    { id: 'email', name: 'E-Mail' },
    { id: 'tel', name: 'Telefon' },
    { id: 'textarea', name: 'Mehrzeiliger Text' },
    { id: 'checkbox', name: 'Checkbox' },
    { id: 'radio', name: 'Radio-Auswahl' },
    { id: 'select', name: 'Dropdown-Auswahl' },
];

export const ServiceAuftragFormBuilder = () => {
    const { data, isLoading, error } = useGetOne('formconfigs', { id: 'service-auftrag' });
    const notify = useNotify();
    const refresh = useRefresh();
    const [update, { isLoading: isSaving }] = useUpdate();

    if (isLoading) return <CircularProgress sx={{ m: 4 }} />;
    if (error) return <div>Fehler beim Laden der Formular-Konfiguration</div>;

    // options is stored as a real string[] in the DB but edited here as one
    // comma-separated line - much simpler than a nested array-of-scalars
    // input, and only relevant for radio/select field types anyway.
    const recordForForm = {
        ...data,
        fields: ((data?.fields as any[]) || []).map((f: any) => ({ ...f, optionsText: (f.options || []).join(', ') })),
    };

    const save = (formData: any) => {
        const fields = ((formData.fields as any[]) || []).map((f: any, index: number) => {
            const { optionsText, ...rest } = f;
            return {
                ...rest,
                order: index,
                options: ['radio', 'select'].includes(f.type)
                    ? String(optionsText || '').split(',').map((s: string) => s.trim()).filter(Boolean)
                    : undefined,
            };
        });
        update(
            'formconfigs',
            { id: 'service-auftrag', data: { title: formData.title, fields }, previousData: data },
            {
                onSuccess: () => {
                    notify('Formular gespeichert', { type: 'success' });
                    refresh();
                },
                onError: (error: any) => notify(`Fehler beim Speichern: ${error.message}`, { type: 'error' }),
            }
        );
    };

    return (
        <Card sx={{ mt: 2, mb: 4, maxWidth: '1000px', mx: 'auto' }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Formular-Editor: {data?.title || 'Service-Auftrag'}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Felder hinzufügen, entfernen, umbenennen, neu anordnen oder den Feldtyp ändern - Änderungen
                    wirken sich direkt auf das echte Formular unter /service/service-auftrag aus.
                </Typography>

                <ResourceContextProvider value="formconfigs">
                    <Form record={recordForForm} onSubmit={save}>
                        <TextInput source="title" label="Formular-Titel" fullWidth />

                        <ArrayInput source="fields" label="Formularfelder (Reihenfolge = Anzeigereihenfolge)">
                            <SimpleFormIterator getItemLabel={(index) => `Feld ${index + 1}`}>
                                <TextInput source="id" label="Feld-ID (technisch, z.B. name, email)" required />
                                <TextInput source="label" label="Beschriftung" required fullWidth />
                                <SelectInput source="type" label="Feldtyp" choices={FIELD_TYPE_CHOICES} required defaultValue="text" />
                                <BooleanInput source="required" label="Pflichtfeld?" />
                                <TextInput source="placeholder" label="Platzhaltertext (optional)" fullWidth />
                                <TextInput
                                    source="optionsText"
                                    label="Optionen (nur für Radio/Dropdown, kommagetrennt)"
                                    fullWidth
                                    helperText='z.B. "Weinheim, Landau"'
                                />
                            </SimpleFormIterator>
                        </ArrayInput>

                        <Box sx={{ mt: 3 }}>
                            <Button type="submit" variant="contained" color="success" startIcon={<SaveIcon />} disabled={isSaving}>
                                Speichern
                            </Button>
                        </Box>
                    </Form>
                </ResourceContextProvider>
            </CardContent>
        </Card>
    );
};
