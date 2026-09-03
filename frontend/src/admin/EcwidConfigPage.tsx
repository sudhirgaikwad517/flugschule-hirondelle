import React, { useState, useEffect } from 'react';
import { Title, useNotify, useRefresh } from 'react-admin';
import { 
    Box, 
    Card, 
    CardContent, 
    Typography, 
    Tabs, 
    Tab, 
    TextField, 
    Switch, 
    FormControlLabel, 
    Button, 
    Grid,
    Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`ecwid-tabpanel-${index}`}
            aria-labelledby={`ecwid-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export const EcwidConfigPage = () => {
    const notify = useNotify();
    const [tabIndex, setTabIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    
    const [config, setConfig] = useState({
        storeId: '35710010',
        displaySearchBoxAboveProducts: true,
        displayHorizontalCategories: true,
        productsPerRowGrid: 3,
        productsPerPageGrid: 20,
        seoFriendlyUrls: true,
        categoryShownByDefault: 'Store root category',
        customerSingleSignOn: false
    });

    useEffect(() => {
        fetch('/api/ecwid-config')
            .then(res => res.json())
            .then(data => {
                setConfig({
                    storeId: data.storeId || '35710010',
                    displaySearchBoxAboveProducts: data.displaySearchBoxAboveProducts ?? true,
                    displayHorizontalCategories: data.displayHorizontalCategories ?? true,
                    productsPerRowGrid: data.productsPerRowGrid || 3,
                    productsPerPageGrid: data.productsPerPageGrid || 20,
                    seoFriendlyUrls: data.seoFriendlyUrls ?? true,
                    categoryShownByDefault: data.categoryShownByDefault || 'Store root category',
                    customerSingleSignOn: data.customerSingleSignOn ?? false
                });
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                notify('Fehler beim Laden der Einstellungen', { type: 'error' });
                setLoading(false);
            });
    }, [notify]);

    const handleSave = () => {
        setLoading(true);
        fetch('/api/ecwid-config', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        })
        .then(res => res.json())
        .then(() => {
            notify('Ecwid Einstellungen erfolgreich gespeichert', { type: 'success' });
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            notify('Fehler beim Speichern', { type: 'error' });
            setLoading(false);
        });
    };

    if (loading) return <Box sx={{ p: 3 }}><Typography>Lade...</Typography></Box>;

    return (
        <Card sx={{ mt: 2, mb: 4, borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ fontSize: '1.2rem' }}>⚙️</span> Ecwid Shopping Cart
                </Typography>
                <Button 
                    variant="contained" 
                    color="success" 
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={loading}
                    sx={{ textTransform: 'none', px: 3 }}
                >
                    Save
                </Button>
            </Box>
            
            {/* Header matching Joomla */}
            <Box sx={{ bgcolor: '#111827', color: 'white', p: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ position: 'relative' }}>
                    <Box sx={{ bgcolor: '#84cc16', p: 2, borderRadius: '50%', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '40px' }}>🏪</span>
                    </Box>
                    <Box sx={{ position: 'absolute', top: -5, right: -5, color: '#84cc16', fontSize: '24px', fontWeight: 'bold' }}>✓</Box>
                </Box>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>Greetings!</Typography>
                    <Typography variant="body1">Your Ecwid store is connected to your website</Typography>
                </Box>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f1f5f9' }}>
                <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)} sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 'bold' } }}>
                    <Tab label="General settings" />
                    <Tab label="Appearance settings" />
                    <Tab label="Advanced settings" />
                </Tabs>
            </Box>

            <CardContent sx={{ p: 4 }}>
                {/* General Settings */}
                <CustomTabPanel value={tabIndex} index={0}>
                    <Box sx={{ maxWidth: 800 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, borderBottom: '1px solid #e2e8f0' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 'bold' }}>Store ID:</Typography>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{config.storeId}</Typography>
                            </Box>
                            <Button 
                                variant="outlined" 
                                color="inherit"
                                href={`https://my.ecwid.com/store/${config.storeId}#dashboard`}
                                target="_blank"
                                sx={{ textTransform: 'none', borderColor: '#cbd5e1' }}
                            >
                                ↗ Control Panel
                            </Button>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 3, borderBottom: '1px solid #e2e8f0' }}>
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 'bold' }}>Account Status:</Typography>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Paid</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">Thank you for supporting Ecwid!</Typography>
                            </Box>
                            <Button 
                                variant="outlined" 
                                color="inherit"
                                href={`https://my.ecwid.com/store/${config.storeId}#billing`}
                                target="_blank"
                                sx={{ textTransform: 'none', borderColor: '#cbd5e1' }}
                            >
                                ↗ Billing and plans
                            </Button>
                        </Box>

                        <Box sx={{ py: 3, borderBottom: '1px solid #e2e8f0' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                If you want to connect another Ecwid store, you can disconnect the current one and change Store ID
                            </Typography>
                            <TextField 
                                size="small"
                                variant="outlined"
                                value={config.storeId}
                                onChange={(e) => setConfig({...config, storeId: e.target.value})}
                                helperText="Ihre Ecwid Store ID (z.B. 35710010)"
                                sx={{ maxWidth: 300 }}
                            />
                        </Box>

                        <Box sx={{ py: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                Questions? Visit <a href="#" style={{ color: '#0ea5e9' }}>↗ Ecwid support center</a> or check out <a href="#" style={{ color: '#0ea5e9' }}>↗ Ecwid Blog</a>
                            </Typography>
                        </Box>
                    </Box>
                </CustomTabPanel>

                {/* Appearance Settings */}
                <CustomTabPanel value={tabIndex} index={1}>
                    <Typography variant="h6" gutterBottom>Appearance Settings</Typography>
                    
                    <Box sx={{ mb: 3 }}>
                        <FormControlLabel
                            control={<Switch checked={config.displaySearchBoxAboveProducts} onChange={(e) => setConfig({...config, displaySearchBoxAboveProducts: e.target.checked})} />}
                            label="Display search box above products"
                        />
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', ml: 4 }}>
                            Or you can add search box to your website using Ecwid Search Module.
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <FormControlLabel
                            control={<Switch checked={config.displayHorizontalCategories} onChange={(e) => setConfig({...config, displayHorizontalCategories: e.target.checked})} />}
                            label="Display horizontal categories above products"
                        />
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', ml: 4 }}>
                            Or you can add categories to your website using Ecwid Categories Module.
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Number of products per page</Typography>
                    <Grid container spacing={4} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                label="Grid View: Products per Row"
                                type="number"
                                fullWidth
                                value={config.productsPerRowGrid}
                                onChange={(e) => setConfig({...config, productsPerRowGrid: parseInt(e.target.value) || 3})}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                label="Grid View: Products per Page"
                                type="number"
                                fullWidth
                                value={config.productsPerPageGrid}
                                onChange={(e) => setConfig({...config, productsPerPageGrid: parseInt(e.target.value) || 20})}
                            />
                        </Grid>
                    </Grid>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
                        Here you can control how many products will be displayed per page. These options define maximum values. If there is not enough space to show all product columns, Ecwid will adapt the number of columns to hold all products.
                    </Typography>
                </CustomTabPanel>

                {/* Advanced Settings */}
                <CustomTabPanel value={tabIndex} index={2}>
                    <Typography variant="h6" gutterBottom>Advanced Settings</Typography>
                    
                    <Box sx={{ mb: 4 }}>
                        <FormControlLabel
                            control={<Switch checked={config.seoFriendlyUrls} onChange={(e) => setConfig({...config, seoFriendlyUrls: e.target.checked})} />}
                            label="SEO friendly clean URLs"
                        />
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', ml: 4 }}>
                            This enables new clean URLs format in your store. The new urls do not contain hash sign (#), so they look nicer and are better indexed by Google.
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <TextField
                            label="Category shown by default"
                            fullWidth
                            variant="outlined"
                            value={config.categoryShownByDefault}
                            onChange={(e) => setConfig({...config, categoryShownByDefault: e.target.value})}
                        />
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                            By default, the storefront shows a list of root categories. You can override this behavior and show a different category when customers open your store for the first time.
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <FormControlLabel
                            control={<Switch checked={config.customerSingleSignOn} onChange={(e) => setConfig({...config, customerSingleSignOn: e.target.checked})} />}
                            label="Customer Single Sign-On"
                        />
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', ml: 4 }}>
                            Single Sign-On allows your customers to have a single login for your website and your Ecwid store.
                        </Typography>
                    </Box>
                </CustomTabPanel>
            </CardContent>
        </Card>
    );
};
