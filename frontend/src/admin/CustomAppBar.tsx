import { AppBar, TitlePortal } from 'react-admin';
import { Box, Typography } from '@mui/material';

// Clean white header matching the AcyMailing admin sections, replacing
// react-admin's default colored bar. The toolbar height is locked to a
// single line (no wrap) so it can never grow taller than the space
// react-admin's Layout reserves for it - if it did, list pages with many
// always-on filters would render their (correctly-positioned) filter row
// partly hidden behind the bar.
export const CustomAppBar = (props: any) => (
    <AppBar
        {...props}
        color="inherit"
        elevation={0}
        sx={{
            bgcolor: '#fff',
            color: '#1e293b',
            borderBottom: '1px solid #e2e8f0',
            '& .RaAppBar-toolbar': { minHeight: 64, height: 64, flexWrap: 'nowrap', overflow: 'hidden' },
        }}
    >
        <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            <TitlePortal />
        </Box>
        <Typography variant="caption" sx={{ color: '#94a3b8', mr: 1, whiteSpace: 'nowrap', display: { xs: 'none', sm: 'block' } }}>
            Flugschule Hirondelle
        </Typography>
    </AppBar>
);
