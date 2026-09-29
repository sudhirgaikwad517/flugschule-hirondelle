import { useEffect, useState } from 'react';
import { useGetOne, useUpdate, useNotify, useGetList } from 'react-admin';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Box,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField as MuiTextField,
    Select,
    FormControl,
    InputLabel,
    Checkbox,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Grid,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// Old's real "Felder" list (administrator/components/com_visforms/src/View/
// Visfields/HtmlView.php + src/View/ItemsViewBase.php::setItemsToolbar()),
// deep-verified against the live fs-hirondelle.de/...&view=visfields&fid=2
// screenshot: a proper sortable LIST (not a plain add/remove array editor) -
// drag-handle | checkbox | Titel+Alias | Veröffentlicht | Typ |
// Frontend-Anzeige | Pflichtfeld | ID, with a real "+ Neu"/"Aktionen"
// (Veröffentlichen/Verstecken/Löschen/Stapelverarbeitung)/"Zurück zum
// Formular" toolbar. Zugriffsebene/Nur-Lesen/Label-Anzeigen/Nur-Bearbeiten
// columns and "Auschecken" are AEF-subscription-gated on the real site
// (never render there) or assume a Joomla checkout/locking system this app
// doesn't have, so they're correctly left out here too.
//
// Field TYPES match old's real 18-value typefield dropdown exactly
// (forms/visfield.xml) - INCLUDING submit/reset/fieldsep as genuine rows,
// not hardcoded chrome (see ServiceAuftrag.tsx for how those three actually
// render on the public form).

const FIELD_TYPE_CHOICES: { id: string; name: string }[] = [
    { id: 'text', name: 'Text' },
    { id: 'password', name: 'Passwort' },
    { id: 'email', name: 'E-Mail' },
    { id: 'date', name: 'Datum' },
    { id: 'number', name: 'Zahl' },
    { id: 'url', name: 'URL' },
    { id: 'tel', name: 'Telefon' },
    { id: 'hidden', name: 'Versteckt' },
    { id: 'textarea', name: 'Mehrzeiliger Text' },
    { id: 'checkbox', name: 'Checkbox' },
    { id: 'multicheckbox', name: 'Mehrfachauswahl (Checkboxen)' },
    { id: 'radio', name: 'Radio-Auswahl' },
    { id: 'select', name: 'Dropdown-Auswahl' },
    { id: 'file', name: 'Datei-Upload' },
    { id: 'image', name: 'Bild-Button (Absenden)' },
    { id: 'submit', name: 'Absenden-Button' },
    { id: 'reset', name: 'Zurücksetzen-Button' },
    { id: 'fieldsep', name: 'Trennlinie / Abschnitt' },
];
const FIELD_TYPE_LABELS: Record<string, string> = Object.fromEntries(FIELD_TYPE_CHOICES.map((c) => [c.id, c.name]));

const FRONT_DISPLAY_CHOICES = [
    { value: '0', label: 'Nicht anzeigen' },
    { value: '1', label: 'Liste und Details' },
    { value: '2', label: 'Nur Liste' },
    { value: '3', label: 'Nur Detail' },
];

// `image` is a real <input type="image"> IMAGE SUBMIT BUTTON (deep-verified
// against ImageFieldBusiness.php's doc comment) - a decorative alternate
// submit button, NOT a photo/file upload field. It carries no value, same
// as submit/reset/fieldsep.
const STRUCTURAL_TYPES = new Set(['submit', 'reset', 'fieldsep', 'image']);
const CHOICE_TYPES = new Set(['radio', 'select', 'multicheckbox']);
const TEXTLIKE_TYPES = new Set(['text', 'password', 'email', 'url', 'tel', 'textarea']);
const NUMLIKE_TYPES = new Set(['number', 'date']);

interface FieldDef {
    id: string;
    type: string;
    label: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
    order: number;
    published?: boolean;
    frontDisplay?: string;
    defaultValue?: string;
    min?: number;
    max?: number;
    // Old Visforms' real per-field "Zusatzinfo" (custominfo) - genuine
    // customer-facing help text shown next to the field.
    helpText?: string;
}

const emptyField = (): FieldDef => ({
    id: '', type: 'text', label: '', required: false, order: 0, published: true, frontDisplay: '0',
});

const FieldEditDialog = ({
    field, isNew, existingIds, onClose, onSave,
}: { field: FieldDef; isNew: boolean; existingIds: string[]; onClose: () => void; onSave: (f: FieldDef) => void }) => {
    const [draft, setDraft] = useState<FieldDef>(field);
    const [optionsText, setOptionsText] = useState((field.options || []).join(', '));
    const [idError, setIdError] = useState('');

    const set = (patch: Partial<FieldDef>) => setDraft((d) => ({ ...d, ...patch }));

    const handleSave = () => {
        const id = draft.id.trim();
        if (!id) { setIdError('Feld-ID ist erforderlich'); return; }
        if (isNew && existingIds.includes(id)) { setIdError('Diese Feld-ID existiert bereits'); return; }
        const options = CHOICE_TYPES.has(draft.type)
            ? optionsText.split(',').map((s) => s.trim()).filter(Boolean)
            : undefined;
        onSave({ ...draft, id, options, required: STRUCTURAL_TYPES.has(draft.type) ? false : draft.required });
    };

    return (
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{isNew ? 'Neues Feld' : `Feld bearbeiten: ${field.label || field.id}`}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth>
                            <InputLabel>Feldtyp</InputLabel>
                            <Select label="Feldtyp" value={draft.type} onChange={(e) => set({ type: e.target.value })}>
                                {FIELD_TYPE_CHOICES.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <MuiTextField
                            label="Feld-ID (Alias)"
                            fullWidth
                            value={draft.id}
                            disabled={!isNew}
                            onChange={(e) => { set({ id: e.target.value }); setIdError(''); }}
                            error={!!idError}
                            helperText={idError || (isNew ? 'z.B. name, email - danach nicht mehr änderbar' : 'Nach dem Anlegen nicht mehr änderbar')}
                        />
                    </Grid>
                    <Grid size={12}>
                        <MuiTextField
                            label={draft.type === 'fieldsep' ? 'Überschrift (optional)' : draft.type === 'submit' || draft.type === 'reset' || draft.type === 'image' ? 'Button-Text' : 'Beschriftung'}
                            fullWidth
                            value={draft.label}
                            onChange={(e) => set({ label: e.target.value })}
                        />
                    </Grid>
                    {!STRUCTURAL_TYPES.has(draft.type) && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Pflichtfeld?</InputLabel>
                                <Select label="Pflichtfeld?" value={draft.required ? '1' : '0'} onChange={(e) => set({ required: e.target.value === '1' })}>
                                    <MenuItem value="0">Nein</MenuItem>
                                    <MenuItem value="1">Ja</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    )}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth>
                            <InputLabel>Veröffentlicht</InputLabel>
                            <Select label="Veröffentlicht" value={draft.published !== false ? '1' : '0'} onChange={(e) => set({ published: e.target.value === '1' })}>
                                <MenuItem value="1">Ja</MenuItem>
                                <MenuItem value="0">Nein</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    {!STRUCTURAL_TYPES.has(draft.type) && (
                        <Grid size={12}>
                            <FormControl fullWidth>
                                <InputLabel>Frontend-Anzeige</InputLabel>
                                <Select label="Frontend-Anzeige" value={draft.frontDisplay || '0'} onChange={(e) => set({ frontDisplay: e.target.value })}>
                                    {FRONT_DISPLAY_CHOICES.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                    )}
                    {TEXTLIKE_TYPES.has(draft.type) && (
                        <Grid size={12}>
                            <MuiTextField label="Platzhaltertext (optional)" fullWidth value={draft.placeholder || ''} onChange={(e) => set({ placeholder: e.target.value })} />
                        </Grid>
                    )}
                    {!STRUCTURAL_TYPES.has(draft.type) && (
                        <Grid size={12}>
                            <MuiTextField
                                label="Zusatzinfo (optional)"
                                helperText="Zusätzlicher Hinweistext, der dem Nutzer neben dem Feld angezeigt wird (z.B. ein Aufpreis-Hinweis oder eine Anleitung)."
                                fullWidth
                                multiline
                                minRows={2}
                                value={draft.helpText || ''}
                                onChange={(e) => set({ helpText: e.target.value })}
                            />
                        </Grid>
                    )}
                    {CHOICE_TYPES.has(draft.type) && (
                        <Grid size={12}>
                            <MuiTextField
                                label="Optionen (kommagetrennt)"
                                fullWidth
                                value={optionsText}
                                onChange={(e) => setOptionsText(e.target.value)}
                                helperText='z.B. "Weinheim, Landau"'
                            />
                        </Grid>
                    )}
                    {draft.type === 'hidden' && (
                        <Grid size={12}>
                            <MuiTextField label="Standardwert" fullWidth value={draft.defaultValue || ''} onChange={(e) => set({ defaultValue: e.target.value })} />
                        </Grid>
                    )}
                    {NUMLIKE_TYPES.has(draft.type) && (
                        <>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <MuiTextField type="number" label="Minimum (optional)" fullWidth value={draft.min ?? ''} onChange={(e) => set({ min: e.target.value === '' ? undefined : Number(e.target.value) })} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <MuiTextField type="number" label="Maximum (optional)" fullWidth value={draft.max ?? ''} onChange={(e) => set({ max: e.target.value === '' ? undefined : Number(e.target.value) })} />
                            </Grid>
                        </>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Abbrechen</Button>
                <Button variant="contained" onClick={handleSave}>Übernehmen</Button>
            </DialogActions>
        </Dialog>
    );
};

const BatchCopyDialog = ({ currentFormId, fields, selectedIds, onClose }: { currentFormId: string; fields: FieldDef[]; selectedIds: string[]; onClose: () => void }) => {
    const { data: forms } = useGetList('formconfigs', { pagination: { page: 1, perPage: 100 }, sort: { field: 'title', order: 'ASC' } });
    const [targetId, setTargetId] = useState('');
    const [busy, setBusy] = useState(false);
    const notify = useNotify();
    const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

    const handleCopy = async () => {
        if (!targetId) return;
        setBusy(true);
        try {
            const res = await fetch(`/api/formconfigs/${targetId}`, { headers: authHeaders() });
            const target = await res.json();
            const targetFields: FieldDef[] = target.fields || [];
            const existingIds = new Set(targetFields.map((f) => f.id));
            let nextOrder = targetFields.length ? Math.max(...targetFields.map((f) => f.order)) + 1 : 0;
            const toCopy = fields.filter((f) => selectedIds.includes(f.id)).map((f) => {
                let id = f.id;
                let suffix = 2;
                while (existingIds.has(id)) { id = `${f.id}_${suffix}`; suffix += 1; }
                existingIds.add(id);
                return { ...f, id, order: nextOrder++ };
            });
            const putRes = await fetch(`/api/formconfigs/${targetId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ fields: [...targetFields, ...toCopy] }),
            });
            if (!putRes.ok) throw new Error('Fehler beim Kopieren');
            notify(`${toCopy.length} Feld(er) kopiert nach "${target.title}"`, { type: 'success' });
            onClose();
        } catch (e: any) {
            notify(`Fehler: ${e.message}`, { type: 'error' });
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Stapelverarbeitung - Felder kopieren</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ mb: 2 }}>{selectedIds.length} Feld(er) in ein anderes Formular kopieren.</Typography>
                <FormControl fullWidth>
                    <InputLabel>Ziel-Formular</InputLabel>
                    <Select label="Ziel-Formular" value={targetId} onChange={(e) => setTargetId(e.target.value)}>
                        {(forms || []).filter((f: any) => f.id !== currentFormId).map((f: any) => (
                            <MenuItem key={f.id} value={f.id}>{f.title}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Abbrechen</Button>
                <Button variant="contained" disabled={!targetId || busy} onClick={handleCopy}>Kopieren</Button>
            </DialogActions>
        </Dialog>
    );
};

export const FormFieldsEditor = () => {
    const { formId } = useParams();
    const id = formId || 'service-auftrag';
    const navigate = useNavigate();
    const { data, isLoading, error, refetch } = useGetOne('formconfigs', { id });
    const notify = useNotify();
    const [update, { isLoading: isSaving }] = useUpdate();

    const [fields, setFields] = useState<FieldDef[] | null>(null);
    const [selected, setSelected] = useState<string[]>([]);
    const [actionsAnchor, setActionsAnchor] = useState<HTMLElement | null>(null);
    const [editingField, setEditingField] = useState<{ field: FieldDef; isNew: boolean } | null>(null);
    const [batchOpen, setBatchOpen] = useState(false);
    const [dragId, setDragId] = useState<string | null>(null);

    useEffect(() => {
        if (data) {
            setFields([...((data.fields as FieldDef[]) || [])].sort((a, b) => a.order - b.order));
        }
    }, [data]);

    if (isLoading || fields === null) return <CircularProgress sx={{ m: 4 }} />;
    if (error) return <div>Fehler beim Laden der Formular-Konfiguration</div>;

    const persist = (next: FieldDef[]) => {
        update(
            'formconfigs',
            { id, data: { fields: next.map((f, i) => ({ ...f, order: i })) }, previousData: data },
            {
                onSuccess: () => { notify('Gespeichert', { type: 'success' }); refetch(); },
                onError: (err: any) => notify(`Fehler: ${err.message}`, { type: 'error' }),
            }
        );
    };

    const handleSaveAll = () => persist(fields);

    const requireSelection = () => {
        if (selected.length === 0) { notify('Bitte mindestens ein Feld auswählen', { type: 'warning' }); return false; }
        return true;
    };

    const setPublishedForSelected = (published: boolean) => {
        setActionsAnchor(null);
        if (!requireSelection()) return;
        const next = fields.map((f) => (selected.includes(f.id) ? { ...f, published } : f));
        setFields(next);
        persist(next);
        setSelected([]);
    };

    const deleteSelected = () => {
        setActionsAnchor(null);
        if (!requireSelection()) return;
        if (!window.confirm(`${selected.length} Feld(er) wirklich löschen?`)) return;
        const next = fields.filter((f) => !selected.includes(f.id));
        setFields(next);
        persist(next);
        setSelected([]);
    };

    const toggleSelect = (fid: string) => setSelected((prev) => (prev.includes(fid) ? prev.filter((x) => x !== fid) : [...prev, fid]));

    const onDrop = (targetId: string) => {
        if (!dragId || dragId === targetId) return;
        const from = fields.findIndex((f) => f.id === dragId);
        const to = fields.findIndex((f) => f.id === targetId);
        if (from === -1 || to === -1) return;
        const next = [...fields];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        setFields(next);
        setDragId(null);
    };

    const saveFieldEdit = (f: FieldDef) => {
        const exists = fields.some((x) => x.id === f.id);
        const next = exists ? fields.map((x) => (x.id === f.id ? f : x)) : [...fields, { ...f, order: fields.length }];
        setFields(next);
        setEditingField(null);
    };

    return (
        <Card sx={{ mt: 2, mb: 4, maxWidth: '1100px', mx: 'auto' }}>
            <CardContent>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setEditingField({ field: emptyField(), isNew: true })}>
                        Neu
                    </Button>
                    <Button size="small" variant="outlined" endIcon={<TuneIcon fontSize="small" />} onClick={(e) => setActionsAnchor(e.currentTarget)}>
                        Aktionen
                    </Button>
                    <Menu anchorEl={actionsAnchor} open={!!actionsAnchor} onClose={() => setActionsAnchor(null)}>
                        <MenuItem onClick={() => setPublishedForSelected(true)}><CheckCircleIcon fontSize="small" sx={{ mr: 1 }} /> Veröffentlichen</MenuItem>
                        <MenuItem onClick={() => setPublishedForSelected(false)}><CancelIcon fontSize="small" sx={{ mr: 1 }} /> Verstecken</MenuItem>
                        <MenuItem onClick={() => { setActionsAnchor(null); if (requireSelection()) setBatchOpen(true); }}><ContentCopyIcon fontSize="small" sx={{ mr: 1 }} /> Stapelverarbeitung</MenuItem>
                        <MenuItem onClick={deleteSelected}><DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Löschen</MenuItem>
                    </Menu>
                    <Box sx={{ flex: 1 }} />
                    <Button size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate(`/admin/forms/${id}/edit`)}>
                        Zurück zum Formular
                    </Button>
                </Box>

                <Typography variant="h5" gutterBottom>
                    Felder: {data?.title || id}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Felder ziehen zum Neuanordnen; Klick auf einen Titel zum Bearbeiten. Änderungen wirken sich
                    erst nach "Speichern" auf das echte Formular unter /service/{id} aus.
                </Typography>

                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: 32 }}></TableCell>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    size="small"
                                    checked={selected.length === fields.length && fields.length > 0}
                                    indeterminate={selected.length > 0 && selected.length < fields.length}
                                    onChange={(e) => setSelected(e.target.checked ? fields.map((f) => f.id) : [])}
                                />
                            </TableCell>
                            <TableCell>Titel</TableCell>
                            <TableCell>Veröffentlicht</TableCell>
                            <TableCell>Typ</TableCell>
                            <TableCell>Frontend-Anzeige</TableCell>
                            <TableCell>Pflichtfeld</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fields.map((f) => (
                            <TableRow
                                key={f.id}
                                draggable
                                onDragStart={() => setDragId(f.id)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => onDrop(f.id)}
                                hover
                                sx={{ opacity: f.published === false ? 0.5 : 1 }}
                            >
                                <TableCell sx={{ cursor: 'grab', color: '#999' }}><DragIndicatorIcon fontSize="small" /></TableCell>
                                <TableCell padding="checkbox">
                                    <Checkbox size="small" checked={selected.includes(f.id)} onChange={() => toggleSelect(f.id)} />
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ cursor: 'pointer' }} onClick={() => setEditingField({ field: f, isNew: false })}>
                                        <Typography variant="body2" sx={{ color: '#428bca' }}>{f.label || <em>(ohne Beschriftung)</em>}</Typography>
                                        <Typography variant="caption" sx={{ color: '#999' }}>Alias: {f.id}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    {f.published === false ? <CancelIcon fontSize="small" color="disabled" /> : <CheckCircleIcon fontSize="small" color="success" />}
                                </TableCell>
                                <TableCell>{FIELD_TYPE_LABELS[f.type] || f.type}</TableCell>
                                <TableCell>
                                    {STRUCTURAL_TYPES.has(f.type) ? '-' : FRONT_DISPLAY_CHOICES.find((c) => c.value === (f.frontDisplay || '0'))?.label}
                                </TableCell>
                                <TableCell>{STRUCTURAL_TYPES.has(f.type) ? '-' : f.required ? 'Ja' : 'Nein'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <Box sx={{ mt: 3 }}>
                    <Button variant="contained" color="success" startIcon={<SaveIcon />} disabled={isSaving} onClick={handleSaveAll}>
                        Speichern
                    </Button>
                </Box>
            </CardContent>

            {editingField && (
                <FieldEditDialog
                    field={editingField.field}
                    isNew={editingField.isNew}
                    existingIds={fields.map((f) => f.id)}
                    onClose={() => setEditingField(null)}
                    onSave={saveFieldEdit}
                />
            )}
            {batchOpen && (
                <BatchCopyDialog currentFormId={id} fields={fields} selectedIds={selected} onClose={() => { setBatchOpen(false); setSelected([]); }} />
            )}
        </Card>
    );
};
