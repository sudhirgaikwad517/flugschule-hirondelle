import {
    List,
    Datagrid,
    TextField,
    DateField,
    Edit,
    TextInput,
    NumberInput,
    Create,
    SelectInput,
    DateTimeInput,
    ReferenceField,
    Filter,
    ReferenceInput,
    TabbedForm,
    FormTab,
    BooleanInput,
    FormDataConsumer,
    TopToolbar,
    Button as RaButton,
    useRecordContext,
    useNotify,
    useRedirect,
    useRefresh,
    useListContext,
    useUnselectAll,
    BulkDeleteButton
} from 'react-admin';
import { useState } from 'react';
import { RichTextInput } from 'ra-input-rich-text';
import { Grid, Box, Typography, Chip, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { EventDatesManager } from './EventDatesManager';
import { EventRowExpand } from './EventRowExpand';
import { MCard, MTipsCard, MButtonGroupInput } from './matukioStyle';
import { TieredFeesList, OptionalExtrasList } from './FeesLists';

const API = '/api';

const DuplicateEventButton = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const redirect = useRedirect();
    const refresh = useRefresh();
    if (!record) return null;

    const handleDuplicate = async () => {
        const token = localStorage.getItem('auth');
        const res = await fetch(`${API}/events/${record.id}/duplicate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const created = await res.json();
            notify('Veranstaltung dupliziert', { type: 'success' });
            refresh();
            redirect('edit', 'events', created.id);
        } else {
            notify('Fehler beim Duplizieren', { type: 'error' });
        }
    };

    return (
        <RaButton label="Duplizieren" onClick={handleDuplicate}>
            <ContentCopyIcon />
        </RaButton>
    );
};

const EventEditActions = () => (
    <TopToolbar>
        <DuplicateEventButton />
    </TopToolbar>
);

const CancelledField = (_props: { label?: string }) => {
    const record = useRecordContext();
    if (!record) return null;
    return record.cancelled ? <Chip label="Storniert" color="error" size="small" /> : null;
};

const PublishToggleField = (_props: { label?: string }) => {
    const record = useRecordContext();
    const refresh = useRefresh();
    const notify = useNotify();
    if (!record) return null;

    const handleClick = async (e: any) => {
        e.stopPropagation();
        const token = localStorage.getItem('auth');
        const res = await fetch(`${API}/events/${record.id}/toggle-publish`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            refresh();
        } else {
            notify('Fehler beim Aktualisieren', { type: 'error' });
        }
    };

    return (
        <IconButton size="small" onClick={handleClick} title={record.published ? 'Verstecken' : 'Veröffentlichen'}>
            {record.published ? <VisibilityIcon fontSize="small" color="success" /> : <VisibilityOffIcon fontSize="small" color="disabled" />}
        </IconButton>
    );
};

const EventBulkActionButtons = () => {
    const { selectedIds, resource } = useListContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const unselectAll = useUnselectAll(resource);
    const [busy, setBusy] = useState(false);

    const setPublished = async (published: boolean) => {
        setBusy(true);
        try {
            const token = localStorage.getItem('auth');
            const res = await fetch(`${API}/events/bulk-publish`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds, published })
            });
            if (res.ok) {
                notify(published ? 'Veröffentlicht' : 'Versteckt', { type: 'info' });
                unselectAll();
                refresh();
            } else {
                notify('Fehler beim Aktualisieren', { type: 'error' });
            }
        } finally {
            setBusy(false);
        }
    };

    const handleDuplicate = async () => {
        setBusy(true);
        try {
            const token = localStorage.getItem('auth');
            await Promise.all(selectedIds.map(id =>
                fetch(`${API}/events/${id}/duplicate`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } })
            ));
            notify('Dupliziert', { type: 'success' });
            unselectAll();
            refresh();
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <RaButton label="Veröffentlichen" onClick={() => setPublished(true)} disabled={busy}>
                <VisibilityIcon />
            </RaButton>
            <RaButton label="Verstecken" onClick={() => setPublished(false)} disabled={busy}>
                <VisibilityOffIcon />
            </RaButton>
            <RaButton label="Duplizieren" onClick={handleDuplicate} disabled={busy}>
                <ContentCopyIcon />
            </RaButton>
            <BulkDeleteButton label="Löschen" />
        </>
    );
};

const EventFilter = (props: any) => (
    <Filter {...props}>
        <TextInput label="Suche" source="q" alwaysOn />
        <SelectInput
            label="Alle Veranstaltungen"
            source="published"
            choices={[
                { id: 'true', name: 'Veröffentlicht' },
                { id: 'false', name: 'Versteckt' }
            ]}
            alwaysOn
        />
        <ReferenceInput label="Alle Veranstaltungsorte" source="locationId" reference="locations" alwaysOn>
            <SelectInput optionText="title" />
        </ReferenceInput>
        <ReferenceInput label="Alle Veranstalter" source="organizerId" reference="organizers" alwaysOn>
            <SelectInput optionText="name" />
        </ReferenceInput>
        <ReferenceInput label="Alle Kategorien" source="categoryId" reference="categories" alwaysOn>
            <SelectInput optionText="title" />
        </ReferenceInput>
        <SelectInput
            label="Storniert"
            source="cancelled"
            choices={[
                { id: 'true', name: 'Storniert' },
                { id: 'false', name: 'Nicht storniert' }
            ]}
        />
    </Filter>
);

export const EventList = () => (
    <List title="Veranstaltungen" filters={<EventFilter />}>
        <Datagrid rowClick="edit" bulkActionButtons={<EventBulkActionButtons />} expand={<EventRowExpand />}>
            <TextField source="id" label="#" />
            <DateField source="startDate" label="Dates" showTime />
            <TextField source="title" label="Titel" />
            <ReferenceField source="categoryId" reference="categories" label="Kategorie">
                <TextField source="title" />
            </ReferenceField>
            <ReferenceField source="locationId" reference="locations" label="Veranstaltungsort" emptyText="-">
                <TextField source="title" />
            </ReferenceField>
            <PublishToggleField label="Veröffentlicht" />
            <CancelledField label="Status" />
        </Datagrid>
    </List>
);

// ---------------------------------------------------------------------------
// Shared tab content - used identically by both EventEdit and EventCreate so
// the two forms can never drift out of sync with each other.
// ---------------------------------------------------------------------------

const ContentsTabContent = () => (
    <Grid container spacing={2} sx={{ width: '100%' }}>
        <Grid size={{ xs: 12, md: 8 }}>
            <MCard title="Allgemeine Informationen">
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextInput source="title" fullWidth label="Titel" required helperText="Titel für die Veranstaltung" />
                        <ReferenceInput source="categoryId" reference="categories">
                            <SelectInput optionText="title" label="Kategorie" fullWidth />
                        </ReferenceInput>
                        <TextInput source="tags" label="Schlagwörter" fullWidth helperText="Schlagwort eingeben oder auswählen" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextInput source="alias" fullWidth label="Alias" helperText="Alias für SEO URLs. Leer lassen für eine automatische Generierung" />
                    </Grid>
                </Grid>
            </MCard>
            <MCard title="Beschreibungen & Bilder">
                <RichTextInput source="shortDescription" label="Kurzbeschreibung" />
                <TextInput source="imageUrl" label="Bild für die Übersicht (URL)" fullWidth sx={{ mt: 2 }} />
            </MCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
            <MCard title="Veranstaltungs-Anzeige">
                <BooleanInput source="isTopEvent" label="Top-Veranstaltung" />
                <BooleanInput source="isHotEvent" label="Hot-Event" />
            </MCard>
            <MCard title="Verschiedenes">
                <ReferenceInput source="organizerId" reference="organizers" label="Veranstalter">
                    <SelectInput optionText="name" fullWidth />
                </ReferenceInput>
                <TextInput source="leadSpeaker" label="Leitung" helperText="Optionaler Sprecher / Tutor" fullWidth />
                <TextInput source="targetGroup" label="Zielgruppe" helperText="Für welche Zielgruppe ist die Veranstaltung" fullWidth />
            </MCard>
            <MCard title="SEO">
                <TextInput source="metaDescription" label="Meta-Description" multiline fullWidth />
                <TextInput source="metaKeywords" label="Meta-Keywords" multiline fullWidth />
            </MCard>
        </Grid>
    </Grid>
);

const VenueTabContent = () => (
    <Grid container spacing={2} sx={{ width: '100%' }}>
        <Grid size={{ xs: 12, md: 8 }}>
            <MCard title="Location Typ">
                <MButtonGroupInput
                    source="locationType"
                    defaultValue="custom"
                    options={[
                        { value: 'predefined', label: 'Vordefinierte Location' },
                        { value: 'custom', label: 'Benutzerdefinierter Veranstaltungsort' },
                        { value: 'webinar', label: 'Webinar' }
                    ]}
                />
            </MCard>

            <FormDataConsumer>
                {({ formData }) => formData.locationType === 'predefined' && (
                    <MCard title="Vordefinierte Location">
                        <ReferenceInput source="locationId" reference="locations" label="Veranstaltungsort auswählen">
                            <SelectInput optionText="title" fullWidth />
                        </ReferenceInput>
                    </MCard>
                )}
            </FormDataConsumer>

            <FormDataConsumer>
                {({ formData }) => (!formData.locationType || formData.locationType === 'custom') && (
                    <MCard title="Benutzerdefinierter Veranstaltungsort">
                        <TextInput source="location" label="Benutzerdefinierter Veranstaltungsort" helperText="Titel der benutzerdefinierten Location" fullWidth />
                        <TextInput source="googleMapsAddress" label="Ortsangabe für Google Maps" helperText="Google Maps Adresse für die Location" fullWidth />
                    </MCard>
                )}
            </FormDataConsumer>

            <FormDataConsumer>
                {({ formData }) => formData.locationType === 'webinar' && (
                    <MCard title="Webinar">
                        <Typography variant="body2" color="text.secondary">
                            Diese Veranstaltung findet online als Webinar statt. Der Zugangslink kann in der Buchungsbestätigung mitgeteilt werden.
                        </Typography>
                    </MCard>
                )}
            </FormDataConsumer>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
            <MTipsCard
                title="Tipps für Locations"
                blocks={[
                    { heading: 'Vordefinierte Locations', body: 'Vordefinierte Locations geben den Besuchern die Möglichkeit, nach diesen im Frontend zu filtern, und bieten eine Detail-Seite mit Informationen.' }
                ]}
            />
        </Grid>
    </Grid>
);

const BookingTabContent = () => (
    <Grid container spacing={2} sx={{ width: '100%' }}>
        <Grid size={{ xs: 12, md: 8 }}>
            <MCard title="Buchungs-Typ">
                <MButtonGroupInput
                    source="bookingType"
                    defaultValue="limited"
                    options={[
                        { value: 'limited', label: 'Limitierte Teilnehmeranzahl' },
                        { value: 'unlimited', label: 'Unlimitierte Teilnehmeranzahl' },
                        { value: 'none', label: 'Keine Online-Buchung' }
                    ]}
                />
            </MCard>

            <FormDataConsumer>
                {({ formData }) => formData.bookingType !== 'none' && (
                    <MCard title="Teilnehmer">
                        {formData.bookingType === 'limited' && (
                            <>
                                <NumberInput source="maxParticipants" label="Max. Teiln." fullWidth />
                                <SelectInput source="onExceed" label="bei Überschreitung" choices={[
                                    { id: 'waitlist', name: 'Warteliste' },
                                    { id: 'stop', name: 'Buchung stoppen' }
                                ]} defaultValue="waitlist" fullWidth />
                            </>
                        )}
                        <NumberInput source="minParticipants" label="Min. Teilnehmerzahl" fullWidth defaultValue={0} />
                        <NumberInput source="maxBookablePerPerson" label="Max. buchbare Plätze pro Person" fullWidth defaultValue={2} />
                    </MCard>
                )}
            </FormDataConsumer>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
            <MTipsCard
                title="Tipps für die Buchung"
                blocks={[
                    { heading: 'Buchung auf der Warteliste', body: 'Wenn die Veranstaltung die Maximal-Teilnehmerzahl erreicht, kann die Buchung gestoppt werden oder die Buchungen landen auf der Warteliste.' },
                    { heading: 'Keine Online-Buchung', body: 'Die Online-Buchung kann auch komplett für das Frontend deaktiviert werden, und trotzdem können die Mindest- und Maximal-Teilnehmerzahl angezeigt werden.' }
                ]}
            />
        </Grid>
    </Grid>
);

const FeesTabContent = () => (
    <Grid container spacing={2} sx={{ width: '100%' }}>
        <Grid size={{ xs: 12, md: 8 }}>
            <MCard title="Veranstaltungs-Typ">
                <MButtonGroupInput
                    source="eventType"
                    defaultValue="paid"
                    options={[
                        { value: 'paid', label: 'Kostenpflichtige Veranstaltung' },
                        { value: 'free', label: 'Kostenlose Veranstaltung' }
                    ]}
                />
            </MCard>

            <FormDataConsumer>
                {({ formData }) => formData.eventType !== 'free' && (
                    <MCard title="Gebühren">
                        <NumberInput source="feePerPerson" label="Gebühren Pro Person (€)" fullWidth />
                        <SelectInput source="bookableFor" label="Buchbar für" choices={[
                            { id: 'public', name: 'Öffentlich' },
                            { id: 'registered', name: 'Registriert' }
                        ]} defaultValue="public" fullWidth />
                    </MCard>
                )}
            </FormDataConsumer>

            <FormDataConsumer>
                {({ formData }) => formData.tieredFees && (
                    <MCard title="Tiered fees">
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Hier können Sie die standardmäßigen gestaffelten Gebühren (falls vorhanden) für DIESE Veranstaltung überschreiben. Damit können Sie Frühbucherrabatte oder ähnliche Angebote erstellen.
                        </Typography>
                        <TieredFeesList />
                    </MCard>
                )}
            </FormDataConsumer>

            <MCard title="Optional extras (optional add-ons)">
                <OptionalExtrasList />
            </MCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
            <MCard title="Einstellungen der Gebühren">
                <SelectInput source="taxRate" label="Steuersatz" choices={[
                    { id: '19', name: '19%' },
                    { id: '7', name: '7%' },
                    { id: '0', name: '0%' }
                ]} fullWidth />
                <SelectInput source="currency" label="Währung" choices={[
                    { id: 'EUR', name: 'EURO' },
                    { id: 'USD', name: 'USD' }
                ]} defaultValue="EUR" fullWidth />
                <BooleanInput source="paymentProcessing" label="Zahlungsverarbeitung" defaultValue={true} />
                <BooleanInput source="tieredFees" label="Gestaffelte Gebühren" defaultValue={false} />
            </MCard>
            <MTipsCard
                title="Tips for fees"
                blocks={[
                    { heading: 'Including VAT', body: 'All fees in Matukio include VAT by default; the display can be changed in the Matukio configuration to show only net prices.' },
                    { heading: 'Payment processing', body: 'If payment processing is deactivated, the fees will still be displayed and the event can still be booked. Only the payment processing after booking will not take place (e.g., redirection to PayPal).' },
                    { heading: 'Tiered fee allocation', body: 'Tiered fees are always relative to the standard fee (either as a percentage or an absolute amount). Therefore, if the standard price is adjusted, all tiered fees will also change.' }
                ]}
            />
        </Grid>
    </Grid>
);

const AdjustmentsTabContent = () => (
    <Grid container spacing={2} sx={{ width: '100%' }}>
        <Grid size={{ xs: 12, md: 8 }}>
            <MCard title="Benutzerdefinierte Buchungs-Email">
                <RichTextInput source="customBookingEmail" label="Benutzerdefinierte Buchungsbestätigung (E-Mail)" />
            </MCard>
            <MCard title="Benutzerdefiniertes Zertifikat">
                <RichTextInput source="customCertificate" label="Zertifikat Inhalt" />
            </MCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
            <MTipsCard
                title="Tipps"
                blocks={[
                    { heading: 'Benutzerdefinierte Buchungs-Email und Zertifikat', body: 'In dieser Sektion können die Standard-Buchungs-Email und das Zertifikat für diese Veranstaltung überschrieben werden. Wie immer können alle Platzhalter verwendet werden. Das Buchungsformular kann im Buchungs-Tab angepasst werden.' }
                ]}
            />
        </Grid>
    </Grid>
);

const TermineTabContent = ({ isCreate }: { isCreate?: boolean }) => (
    <Grid container spacing={2} sx={{ width: '100%' }}>
        <Grid size={{ xs: 12, md: 8 }}>
            <MCard title="Termin">
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <DateTimeInput source="startDate" label="Beginn" required fullWidth />
                    <DateTimeInput source="endDate" label="Ende" fullWidth />
                    <DateTimeInput source="registrationDeadline" label="Anmeldeschluss" fullWidth />
                </Box>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 6 }}>
                        <TextInput source="eventNumber" label="Nummer" helperText="Veranstaltungs-Nummer (Optional)" fullWidth />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <TextInput source="titleOverride" label="Titel Überschreibung" helperText="Hier können Sie den Titel für diesen Termin überschreiben" fullWidth />
                    </Grid>
                </Grid>
            </MCard>

            {!isCreate && (
                <MCard title="Weitere Termine dieser Serie">
                    <EventDatesManager />
                </MCard>
            )}
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
            <MCard title="Kalender-Farben">
                <TextInput source="calendarBgColor" label="Kalender Hintergrund-Farbe (Hex)" type="color" defaultValue="#3a87ac" fullWidth />
                <TextInput source="calendarTextColor" label="Kalender Schrift-Farbe (Hex)" type="color" defaultValue="#ffffff" fullWidth />
            </MCard>
            {!isCreate && (
                <FormDataConsumer>
                    {({ formData }) => formData.cancelled && (
                        <Chip label="Diese Veranstaltung ist storniert" color="error" sx={{ mb: 2 }} />
                    )}
                </FormDataConsumer>
            )}
        </Grid>
    </Grid>
);

export const EventEdit = () => (
    <Edit title="Veranstaltung bearbeiten" actions={<EventEditActions />}>
        <TabbedForm>
            <FormTab label="Inhalte"><ContentsTabContent /></FormTab>
            <FormTab label="Veranstaltungsort"><VenueTabContent /></FormTab>
            <FormTab label="Buchung"><BookingTabContent /></FormTab>
            <FormTab label="Gebühren"><FeesTabContent /></FormTab>
            <FormTab label="Anpassungen"><AdjustmentsTabContent /></FormTab>
            <FormTab label="Termine"><TermineTabContent /></FormTab>
        </TabbedForm>
    </Edit>
);

export const EventCreate = () => (
    <Create title="Veranstaltung erstellen">
        <TabbedForm>
            <FormTab label="Inhalte"><ContentsTabContent /></FormTab>
            <FormTab label="Veranstaltungsort"><VenueTabContent /></FormTab>
            <FormTab label="Buchung"><BookingTabContent /></FormTab>
            <FormTab label="Gebühren"><FeesTabContent /></FormTab>
            <FormTab label="Anpassungen"><AdjustmentsTabContent /></FormTab>
            <FormTab label="Termine"><TermineTabContent isCreate /></FormTab>
        </TabbedForm>
    </Create>
);
