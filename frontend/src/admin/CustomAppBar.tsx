import { AppBar, TitlePortal } from 'react-admin';
import { Box, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

// Clean white header matching the AcyMailing admin sections, replacing
// react-admin's default colored bar. The toolbar height is locked to a
// single line (no wrap) so it can never grow taller than the space
// react-admin's Layout reserves for it - if it did, list pages with many
// always-on filters would render their (correctly-positioned) filter row
// partly hidden behind the bar.
export const CustomAppBar = (props: any) => {
    const navigate = useNavigate();
    return (
        <AppBar
            {...props}
            position="fixed"
            color="inherit"
            elevation={0}
            sx={{
                bgcolor: '#fff',
                color: '#1e293b',
                borderBottom: '1px solid #e2e8f0',
                '& .RaAppBar-toolbar': { minHeight: 64, height: 64, flexWrap: 'nowrap', overflow: 'hidden' },
            }}
        >
            <Button
                onClick={() => navigate(-1)}
                startIcon={<ArrowBackIcon />}
                color="inherit"
                title="Zurück"
                sx={{ mr: 1, ml: -1, textTransform: 'none', minWidth: 0, whiteSpace: 'nowrap', flexShrink: 0 }}
            >
                Zurück
            </Button>
            <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                <TitlePortal />
            </Box>
            <Typography variant="caption" sx={{ color: '#94a3b8', mr: 1, whiteSpace: 'nowrap', display: { xs: 'none', sm: 'block' } }}>
                Flugschule Hirondelle
            </Typography>
        </AppBar>
    );
};
