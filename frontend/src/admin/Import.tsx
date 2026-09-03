import React, { useState, useEffect } from 'react';
import { Title, useNotify, useDataProvider, useRefresh } from 'react-admin';
import { 
    Card, CardContent, Typography, Box, Paper, Tabs, Tab, Button, 
    TextField, MenuItem, Select, FormControl, InputLabel, Alert, Divider
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

export const Import = () => {
    const notify = useNotify();
    const dataProvider = useDataProvider();
    const refresh = useRefresh();
    const [tabIndex, setTabIndex] = useState(0);
    const [categories, setCategories] = useState<any[]>([]);

    // CSV State
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvCategory, setCsvCategory] = useState<string>('');
    const [csvDelimiter, setCsvDelimiter] = useState<string>(',');
    const [csvEnclosure, setCsvEnclosure] = useState<string>('"');
    const [csvEscape, setCsvEscape] = useState<string>('\\');

    // ICS State
    const [icsFile, setIcsFile] = useState<File | null>(null);
    const [icsCategory, setIcsCategory] = useState<string>('');

    useEffect(() => {
        // Fetch categories for the dropdowns
        dataProvider.getList('categories', {
            pagination: { page: 1, perPage: 100 },
            sort: { field: 'name', order: 'ASC' },
            filter: {}
        }).then(({ data }) => setCategories(data))
          .catch(error => console.error("Failed to load categories", error));
    }, [dataProvider]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    const handleCsvUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!csvFile) return notify('Bitte wählen Sie eine CSV-Datei aus.', { type: 'warning' });
        if (!csvCategory) return notify('Bitte wählen Sie eine Kategorie aus.', { type: 'warning' });

        const formData = new FormData();
        formData.append('csv_file', csvFile);
        formData.append('categoryId', csvCategory);
        formData.append('delimiter', csvDelimiter);
        formData.append('enclosure', csvEnclosure);
        formData.append('escape', csvEscape);

        try {
            const token = localStorage.getItem('auth');
            const response = await fetch('/api/import/csv', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                notify(result.message || 'CSV Import erfolgreich!', { type: 'success' });
                setCsvFile(null);
                refresh();
            } else {
                const error = await response.json();
                notify(`Fehler: ${error.error || 'Import fehlgeschlagen'}`, { type: 'error' });
            }
        } catch (error) {
            notify('Server-Fehler beim Import.', { type: 'error' });
        }
    };

    const handleIcsUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!icsFile) return notify('Bitte wählen Sie eine ICS-Datei aus.', { type: 'warning' });
        if (!icsCategory) return notify('Bitte wählen Sie eine Kategorie aus.', { type: 'warning' });

        const formData = new FormData();
        formData.append('ics_file', icsFile);
        formData.append('categoryId', icsCategory);

        try {
            const token = localStorage.getItem('auth');
            const response = await fetch('/api/import/ics', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                notify(result.message || 'ICS Import erfolgreich!', { type: 'success' });
                setIcsFile(null);
                refresh();
            } else {
                const error = await response.json();
                notify(`Fehler: ${error.error || 'Import fehlgeschlagen'}`, { type: 'error' });
            }
        } catch (error) {
            notify('Server-Fehler beim Import.', { type: 'error' });
        }
    };

    return (
        <Card sx={{ mt: 2 }}>
            <Title title="Import" />
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }}>
                <Tabs value={tabIndex} onChange={handleTabChange} variant="fullWidth">
                    <Tab label="Import von Seminar" />
                    <Tab label="ICS Datei-Import" />
                    <Tab label="CSV-Datei Import" />
                </Tabs>
            </Box>

            <CardContent>
                {/* 1. Import von Seminar */}
                <Box sx={{ display: tabIndex === 0 ? 'block' : 'none', p: 3 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                        Import von Seminar
                    </Typography>
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Um eine alten Seminar Installation in Matukio zu importieren installieren Sie Matukio 6.1.5 und folgen Sie der Dokumentation. 
                        Räumen Sie danach die Veranstaltungen und Buchungen auf und passen sie diese der neuen Struktur an. Danach können Sie auf Matukio 7 aktualisieren. 
                        Der direkte Import würde zuviele Änderungen erfordern und könnte nicht ohne massive Datenbank-Änderungen durchgeführt werden.
                    </Alert>
                </Box>

                {/* 2. ICS Datei-Import */}
                <Box sx={{ display: tabIndex === 1 ? 'block' : 'none', p: 3 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                        ICS Datei-Import
                    </Typography>
                    <Divider sx={{ mb: 4 }} />
                    <form onSubmit={handleIcsUpload}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '600px' }}>
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>ICS-Datei auswählen</Typography>
                                <input
                                    type="file"
                                    accept=".ics"
                                    onChange={(e) => setIcsFile(e.target.files ? e.target.files[0] : null)}
                                    style={{ display: 'block', width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </Box>
                            
                            <FormControl fullWidth>
                                <InputLabel>Kategorie</InputLabel>
                                <Select
                                    value={icsCategory}
                                    label="Kategorie"
                                    onChange={(e) => setIcsCategory(e.target.value)}
                                >
                                    {categories.map((cat) => (
                                        <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Button 
                                type="submit" 
                                variant="contained" 
                                color="primary" 
                                startIcon={<UploadFileIcon />}
                                sx={{ alignSelf: 'flex-start', mt: 2 }}
                            >
                                Importieren
                            </Button>
                        </Box>
                    </form>
                </Box>

                {/* 3. CSV-Datei Import */}
                <Box sx={{ display: tabIndex === 2 ? 'block' : 'none', p: 3 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                        CSV-Datei Import
                    </Typography>
                    <Divider sx={{ mb: 4 }} />
                    <Alert severity="info" sx={{ mb: 4 }}>
                        Stellen Sie sicher, dass Ihre CSV-Datei die korrekten Spaltenüberschriften enthält (z.B. title, shortdesc, begin, end, fees, capacity).
                    </Alert>
                    
                    <form onSubmit={handleCsvUpload}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '600px' }}>
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>CSV-Datei auswählen</Typography>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => setCsvFile(e.target.files ? e.target.files[0] : null)}
                                    style={{ display: 'block', width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </Box>
                            
                            <FormControl fullWidth>
                                <InputLabel>Kategorie</InputLabel>
                                <Select
                                    value={csvCategory}
                                    label="Kategorie"
                                    onChange={(e) => setCsvCategory(e.target.value)}
                                >
                                    {categories.map((cat) => (
                                        <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                label="CSV-Trennzeichen"
                                value={csvDelimiter}
                                onChange={(e) => setCsvDelimiter(e.target.value)}
                                slotProps={{ htmlInput: { maxLength: 1 } }}
                                fullWidth
                            />
                            
                            <TextField
                                label="Feld-Begrenzer (Enclosure)"
                                value={csvEnclosure}
                                onChange={(e) => setCsvEnclosure(e.target.value)}
                                slotProps={{ htmlInput: { maxLength: 1 } }}
                                fullWidth
                            />
                            
                            <TextField
                                label="Escape-Zeichen"
                                value={csvEscape}
                                onChange={(e) => setCsvEscape(e.target.value)}
                                slotProps={{ htmlInput: { maxLength: 1 } }}
                                fullWidth
                            />

                            <Button 
                                type="submit" 
                                variant="contained" 
                                color="primary" 
                                startIcon={<UploadFileIcon />}
                                sx={{ alignSelf: 'flex-start', mt: 2 }}
                            >
                                Importieren
                            </Button>
                        </Box>
                    </form>
                </Box>

            </CardContent>
        </Card>
    );
};
