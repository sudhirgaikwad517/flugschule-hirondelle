import type { ReactNode } from 'react';
import { Box, Typography, ButtonGroup, Button } from '@mui/material';
import { useController } from 'react-hook-form';

// Shared design primitives replicating old Matukio's "co-card" / "co-btn"
// look (white card, soft shadow, dark corner badge, flat blue active
// buttons) so every Events tab shares one consistent visual language.

export const MATUKIO_BLUE = '#0095d3';
export const MATUKIO_BADGE_BG = '#313940';
export const MATUKIO_TAB_ACTIVE_BG = '#E5E9EC';
export const MATUKIO_TAB_INACTIVE = '#828282';
export const MATUKIO_ICON_GRAY = '#b9b9b9';

export const DATE_STATUS_COLORS = {
    active: '#20c317',
    cancelled: '#fc192f',
    past: '#aaaaaa',
    unpublished: '#aa0a6d'
};

export const MCard = ({ title, children, sx }: { title?: string; children: ReactNode; sx?: any }) => (
    <Box
        sx={{
            position: 'relative',
            bgcolor: '#fff',
            boxShadow: '0 5px 15px rgba(0,0,0,.08)',
            mb: 2.5,
            borderRadius: 0,
            ...sx
        }}
    >
        {title && (
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bgcolor: MATUKIO_BADGE_BG,
                    color: '#fff',
                    px: 2,
                    py: 0.5,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: 0.3,
                    zIndex: 1
                }}
            >
                {title}
            </Box>
        )}
        <Box sx={{ p: '30px 20px 20px 20px' }}>
            {children}
        </Box>
    </Box>
);

export const MTipsCard = ({ title = 'Tipps', blocks }: { title?: string; blocks: { heading: string; body: ReactNode }[] }) => (
    <MCard title={title}>
        {blocks.map((b, i) => (
            <Box key={i} sx={{ mb: i < blocks.length - 1 ? 2.5 : 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>{b.heading}</Typography>
                <Typography variant="body2" color="text.secondary">{b.body}</Typography>
            </Box>
        ))}
    </MCard>
);

export const MButtonGroup = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
    <ButtonGroup fullWidth sx={{ mb: 2 }}>
        {options.map(opt => (
            <Button
                key={opt.value}
                onClick={() => onChange(opt.value)}
                sx={{
                    borderRadius: 0,
                    boxShadow: 'none',
                    border: '1px solid #ddd',
                    bgcolor: value === opt.value ? MATUKIO_BLUE : '#fff',
                    color: value === opt.value ? '#fff' : '#555',
                    '&:hover': {
                        bgcolor: value === opt.value ? MATUKIO_BLUE : '#f5f5f5',
                    }
                }}
            >
                {opt.label}
            </Button>
        ))}
    </ButtonGroup>
);

// Same look as MButtonGroup, but wired directly to the form via
// react-hook-form's useController - reads and writes the field itself,
// so it can replace a SelectInput/RadioInput without extra plumbing.
export const MButtonGroupInput = ({ source, options, defaultValue }: { source: string; options: { value: string; label: string }[]; defaultValue?: string }) => {
    const { field } = useController({ name: source, defaultValue });
    return <MButtonGroup value={field.value} onChange={field.onChange} options={options} />;
};

export const MSectionLabel = ({ children }: { children: ReactNode }) => (
    <Typography variant="overline" sx={{ color: MATUKIO_TAB_INACTIVE, fontWeight: 700, display: 'block', mb: 1 }}>
        {children}
    </Typography>
);
