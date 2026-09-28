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
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Card, CardContent, CircularProgress, Box, Button } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Old's real "Felder" toolbar button (Formular bearbeiten toolbar - see
// FormBuilder.tsx) navigates to a completely separate view
// (view=visfields) for editing a form's field list, distinct from the
// form's own metadata (Allgemein/etc. tabs). This is that separate page -
// the field-editing capability this app already had (add/remove/reorder/
// retype any field, since submissions are a flexible JSON blob keyed by
// whatever field ids exist here at submission time) lives here now instead
// of being bolted onto the metadata editor.

const FIELD_TYPE_CHOICES = [
    { id: 'text', name: 'Text' },
    { id: 'email', name: 'E-Mail' },
    { id: 'tel', name: 'Telefon' },
    { id: 'textarea', name: 'Mehrzeiliger Text' },
    { id: 'checkbox', name: 'Checkbox' },
    { id: 'radio', name: 'Radio-Auswahl' },
    { id: 'select', name: 'Dropdown-Auswahl' },
];

export const FormFieldsEditor = () => {
    const { formId } = useParams();
    const id = formId || 'service-auftrag';
    const navigate = useNavigate();
    const { data, isLoading, error } = useGetOne('formconfigs', { id });
    const notify = useNotify();
    const refresh = useRefresh();
    const [update, { isLoading: isSaving }] = useUpdate();

    if (isLoading) return <CircularProgress sx={{ m: 4 }} />;
    if (error) return <div>Fehler beim Laden der Formular-Konfiguration</div>;

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
            { id, data: { fields }, previousData: data },
            {
                onSuccess: () => {
                    notify('Felder gespeichert', { type: 'success' });
                    refresh();
                },
                onError: (error: any) => notify(`Fehler beim Speichern: ${error.message}`, { type: 'error' }),
            }
        );
    };

    return (
        <Card sx={{ mt: 2, mb: 4, maxWidth: '1000px', mx: 'auto' }}>
            <CardContent>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Button size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate(`/admin/forms/${id}/edit`)}>
                        Zurück zum Formular
                    </Button>
                </Box>
                <Typography variant="h5" gutterBottom>
                    Felder: {data?.title || id}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Felder hinzufügen, entfernen, umbenennen, neu anordnen oder den Feldtyp ändern - Änderungen
                    wirken sich direkt auf das echte Formular unter /service/{id} aus.
                </Typography>

                <ResourceContextProvider value="formconfigs">
                    <Form record={recordForForm} onSubmit={save}>
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
