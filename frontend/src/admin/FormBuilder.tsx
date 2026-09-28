import { useEffect, useState } from 'react';
import { useGetOne, useUpdate, useNotify } from 'react-admin';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Box,
    Button,
    ButtonGroup,
    IconButton,
    Menu,
    MenuItem,
    Tabs,
    Tab,
    TextField as MuiTextField,
    Select,
    FormControl,
    InputLabel,
    Grid,
    Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ListAltIcon from '@mui/icons-material/ListAlt';
import TableChartIcon from '@mui/icons-material/TableChart';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineOutlined';
import { IntroTextEditor } from './IntroTextEditor';
import {
    ErgebnisTab,
    EmailOptionenTab,
    SpamschutzTab,
    ErweitertTab,
    FrontendDatenanzeigeTab,
    BerechtigungenTab,
} from './FormBuilderTabs';

// Old's real "Formular bearbeiten" page (administrator/components/
// com_visforms/src/View/Visform/HtmlView.php +
// src/View/ItemViewBase.php::display()), deep-verified against
// fs-hirondelle.de/administrator/index.php?option=com_visforms&
// view=visform&layout=edit&id=2:
//
// Toolbar, exactly as ItemViewBase::display() builds it for an existing,
// non-checked-out record: apply()="Speichern" | a save-group dropdown
// button whose items are save()="Speichern & Schließen" (default/main
// action), save2new()="Speichern & Neu", save2copy()="Speichern als
// Kopie" (Visform's HtmlView sets canSaveToCopy=true) | its own
// setToolbar() custom buttons "Felder"/"Daten" | cancel()="Schließen" |
// toolbar->inlinehelp()="Inline-Hilfe umschalten".
//
// Title/Name fields, then a tab strip (Allgemein/Ergebnis/E-Mail
// Optionen/Spamschutz/Erweitert/Datenanzeige im Frontend/
// Formularberechtigungen - tmpl/visform/*.php partials). Per the user's own
// explicit "one by one" pacing, only Allgemein is implemented for real;
// the rest are stubbed until asked for. Allgemein's real two-column layout:
// left "Allgemeine Einstellungen" (ID/Status/Zugriffsebene/Sprache/
// Erstellt/Erstellt Von) + right "Einleitungstext" (a rich WYSIWYG editor -
// old's real content there is genuinely an <h1> heading + paragraphs, see
// IntroTextEditor.tsx).
const TAB_LABELS = [
    'Allgemein',
    'Ergebnis',
    'E-Mail Optionen',
    'Spamschutz',
    'Erweitert',
    'Datenanzeige im Frontend',
    'Formularberechtigungen',
];

const formatDate = (iso?: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '-';
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
};

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

export const ServiceAuftragFormBuilder = () => {
    // Falls back to "service-auftrag" so the older static /admin/service-auftrag-form
    // route (no :formId param) still works exactly as before.
    const { formId: paramId } = useParams();
    const formId = paramId || 'service-auftrag';
    const navigate = useNavigate();
    const { data, isLoading, error, refetch } = useGetOne('formconfigs', { id: formId });
    const notify = useNotify();
    const [update, { isLoading: isSaving }] = useUpdate();

    const [tab, setTab] = useState(0);
    const [showHelp, setShowHelp] = useState(false);
    const [saveMenuAnchor, setSaveMenuAnchor] = useState<HTMLElement | null>(null);
    const [busy, setBusy] = useState(false);

    const [title, setTitle] = useState('');
    const [published, setPublished] = useState(true);
    const [accessLevel, setAccessLevel] = useState('Öffentlich');
    const [language, setLanguage] = useState('Alle');
    const [introText, setIntroText] = useState('');
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        if (data) {
            setTitle(data.title || '');
            setPublished(!!data.published);
            setAccessLevel(data.accessLevel || 'Öffentlich');
            setLanguage(data.language || 'Alle');
            setIntroText(data.introText || '');
            setSettings(data.settings || null);
        }
    }, [data]);

    if (isLoading || !settings) return <CircularProgress sx={{ m: 4 }} />;
    if (error) return <div>Fehler beim Laden der Formular-Konfiguration</div>;

    const currentPayload = () => ({ title, published, accessLevel, language, introText, settings });

    const doSave = () =>
        new Promise<void>((resolve, reject) => {
            update(
                'formconfigs',
                { id: formId, data: currentPayload(), previousData: data },
                {
                    onSuccess: () => resolve(),
                    onError: (err: any) => reject(err),
                }
            );
        });

    const handleApply = async () => {
        try {
            await doSave();
            notify('Formular gespeichert', { type: 'success' });
            refetch();
        } catch (err: any) {
            notify(`Fehler beim Speichern: ${err.message}`, { type: 'error' });
        }
    };

    const handleSaveAndClose = async () => {
        try {
            await doSave();
            notify('Formular gespeichert', { type: 'success' });
            navigate('/admin/formconfigs');
        } catch (err: any) {
            notify(`Fehler beim Speichern: ${err.message}`, { type: 'error' });
        }
    };

    const handleSaveAndNew = async () => {
        setSaveMenuAnchor(null);
        try {
            await doSave();
            notify('Formular gespeichert', { type: 'success' });
            navigate('/admin/formconfigs?new=1');
        } catch (err: any) {
            notify(`Fehler beim Speichern: ${err.message}`, { type: 'error' });
        }
    };

    const handleSaveAsCopy = async () => {
        setSaveMenuAnchor(null);
        setBusy(true);
        try {
            await doSave();
            const createRes = await fetch('/api/formconfigs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ title: `${title} (Kopie)` }),
            });
            const created = await createRes.json();
            if (!createRes.ok) throw new Error(created.message || 'Fehler beim Kopieren');

            const putRes = await fetch(`/api/formconfigs/${created.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ fields: data?.fields || [], introText, accessLevel, language, published, settings }),
            });
            if (!putRes.ok) throw new Error('Fehler beim Kopieren der Felder');

            notify('Als Kopie gespeichert', { type: 'success' });
            navigate(`/admin/forms/${created.id}/edit`);
        } catch (err: any) {
            notify(`Fehler: ${err.message}`, { type: 'error' });
        } finally {
            setBusy(false);
        }
    };

    return (
        <Card sx={{ mt: 2, mb: 4, maxWidth: '1100px', mx: 'auto' }}>
            <CardContent>
                {/* Toolbar - see the comment block above for exact old-source verification. */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Button variant="contained" size="small" startIcon={<SaveIcon />} onClick={handleApply} disabled={isSaving || busy}>
                        Speichern
                    </Button>
                    <ButtonGroup variant="contained" color="success" size="small">
                        <Button onClick={handleSaveAndClose} disabled={isSaving || busy}>Speichern & Schließen</Button>
                        <Button size="small" onClick={(e) => setSaveMenuAnchor(e.currentTarget)}>
                            <ArrowDropDownIcon fontSize="small" />
                        </Button>
                    </ButtonGroup>
                    <Menu anchorEl={saveMenuAnchor} open={!!saveMenuAnchor} onClose={() => setSaveMenuAnchor(null)}>
                        <MenuItem onClick={handleSaveAndNew}>Speichern & Neu</MenuItem>
                        <MenuItem onClick={handleSaveAsCopy}>Speichern als Kopie</MenuItem>
                    </Menu>
                    <Button size="small" variant="outlined" startIcon={<ListAltIcon />} onClick={() => navigate(`/admin/forms/${formId}/fields`)}>
                        Felder
                    </Button>
                    <Button size="small" variant="outlined" startIcon={<TableChartIcon />} onClick={() => navigate(`/admin/forms/${formId}/data`)}>
                        Daten
                    </Button>
                    <Button size="small" startIcon={<CloseIcon />} onClick={() => navigate('/admin/formconfigs')}>
                        Schließen
                    </Button>
                    <Box sx={{ flex: 1 }} />
                    <IconButton size="small" onClick={() => setShowHelp((v) => !v)} color={showHelp ? 'primary' : 'default'} title="Inline-Hilfe umschalten">
                        <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                </Box>

                <Typography variant="h5" gutterBottom>
                    Formular bearbeiten
                </Typography>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <MuiTextField
                            label="Titel"
                            required
                            fullWidth
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            helperText={showHelp ? 'Der Titel des Formulars, wie er im Administrator-Bereich angezeigt wird.' : undefined}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <MuiTextField
                            label="Name (Alias)"
                            fullWidth
                            value={formId}
                            disabled
                            helperText={
                                showHelp
                                    ? 'Der technische Name/Alias - bestimmt die öffentliche URL (/service/' + formId + ') und ist mit bereits gespeicherten Daten verknüpft, daher hier nicht änderbar.'
                                    : 'Bestimmt die URL /service/' + formId
                            }
                        />
                    </Grid>
                </Grid>

                <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    {TAB_LABELS.map((label) => <Tab key={label} label={label} />)}
                </Tabs>

                {tab === 0 ? (
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Typography variant="subtitle1" gutterBottom>Allgemeine Einstellungen</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <MuiTextField label="ID" value={formId} disabled fullWidth />
                                <FormControl fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select label="Status" value={published ? 'published' : 'unpublished'} onChange={(e) => setPublished(e.target.value === 'published')}>
                                        <MenuItem value="published">Veröffentlicht</MenuItem>
                                        <MenuItem value="unpublished">Nicht veröffentlicht</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth>
                                    <InputLabel>Zugriffsebene</InputLabel>
                                    <Select label="Zugriffsebene" value={accessLevel} onChange={(e) => setAccessLevel(e.target.value)}>
                                        <MenuItem value="Öffentlich">Öffentlich</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth>
                                    <InputLabel>Sprache</InputLabel>
                                    <Select label="Sprache" value={language} onChange={(e) => setLanguage(e.target.value)}>
                                        <MenuItem value="Alle">Alle</MenuItem>
                                    </Select>
                                </FormControl>
                                <MuiTextField label="Erstellt" value={formatDate(data?.createdAt)} disabled fullWidth />
                                <MuiTextField label="Erstellt Von" value={data?.createdBy || '-'} disabled fullWidth />
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Typography variant="subtitle1" gutterBottom>Einleitungstext</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <IntroTextEditor
                                label=""
                                value={introText}
                                onChange={setIntroText}
                                helperText={showHelp ? 'Wird oberhalb der Formularfelder auf der öffentlichen Seite angezeigt.' : undefined}
                            />
                        </Grid>
                    </Grid>
                ) : tab === 1 ? (
                    <ErgebnisTab value={settings.ergebnis} onChange={(v) => setSettings({ ...settings, ergebnis: v })} showHelp={showHelp} />
                ) : tab === 2 ? (
                    <EmailOptionenTab value={settings.email} onChange={(v) => setSettings({ ...settings, email: v })} showHelp={showHelp} />
                ) : tab === 3 ? (
                    <SpamschutzTab value={settings.spam} onChange={(v) => setSettings({ ...settings, spam: v })} showHelp={showHelp} />
                ) : tab === 4 ? (
                    <ErweitertTab value={settings.advanced} onChange={(v) => setSettings({ ...settings, advanced: v })} showHelp={showHelp} />
                ) : tab === 5 ? (
                    <FrontendDatenanzeigeTab value={settings.frontend} onChange={(v) => setSettings({ ...settings, frontend: v })} showHelp={showHelp} />
                ) : (
                    <BerechtigungenTab />
                )}
            </CardContent>
        </Card>
    );
};
