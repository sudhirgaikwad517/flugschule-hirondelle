import { AppBar, TitlePortal } from 'react-admin';
import { Box, Typography } from '@mui/material';

// Clean white header matching the AcyMailing admin sections, replacing
// react-admin's default colored bar.
export const CustomAppBar = (props: any) => (
    <AppBar
        {...props}
        color="inherit"
        elevation={0}
        sx={{
            bgcolor: '#fff',
            color: '#1e293b',
            borderBottom: '1px solid #e2e8f0',
            '& .RaAppBar-toolbar': { minHeight: 64 }
        }}
    >
        <Box sx={{ flex: 1 }}>
            <TitlePortal />
        </Box>
        <Typography variant="caption" sx={{ color: '#94a3b8', mr: 1 }}>
            Flugschule Hirondelle
        </Typography>
    </AppBar>
);
