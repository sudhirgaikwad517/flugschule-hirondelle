import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import {
    Box, Table, TableHead, TableRow, TableCell, TableBody, IconButton, TextField as MuiTextField,
    MenuItem, Switch, FormControlLabel, Button, Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { MATUKIO_BLUE } from './matukioStyle';

const ROW_BG = '#eaf5fc';
const ROW_BG_HOVER = '#dcedf8';

interface DraftState {
    index: number | null; // null = adding new
    values: any;
}

// Replicates old Matukio's "blue list + inline edit card appears below it"
// interaction pattern for both the Tiered Fees and Optional Extras sections
// of the Fees tab.
export const TieredFeesList = () => {
    const { control } = useFormContext();
    const { fields, append, remove, update } = useFieldArray({ control, name: 'eventTieredFees' });
    const [draft, setDraft] = useState<DraftState | null>(null);

    const openAdd = () => setDraft({ index: null, values: { title: '', value: 0, bookableFor: 'public', isPercentage: false, isDiscount: true, validFrom: '', validUntil: '' } });
    const openEdit = (index: number) => setDraft({ index, values: { ...fields[index] } });
    const cancel = () => setDraft(null);
    const apply = () => {
        if (!draft) return;
        if (draft.index === null) append(draft.values);
        else update(draft.index, draft.values);
        setDraft(null);
    };

    return (
        <Box>
            {fields.length > 0 && (
                <Table size="small" sx={{ mb: 2 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>title</TableCell>
                            <TableCell>Value</TableCell>
                            <TableCell>Bookable for</TableCell>
                            <TableCell>In percent</TableCell>
                            <TableCell>Discount</TableCell>
                            <TableCell>Valid from</TableCell>
                            <TableCell>Valid until</TableCell>
                            <TableCell align="right" />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fields.map((f: any, i) => (
                            <TableRow key={f.id} sx={{ bgcolor: ROW_BG, '&:hover': { bgcolor: ROW_BG_HOVER } }}>
                                <TableCell>{f.title}</TableCell>
                                <TableCell>{f.value}</TableCell>
                                <TableCell>{f.bookableFor === 'registered' ? 'Registriert' : 'Public'}</TableCell>
                                <TableCell>{f.isPercentage ? '✓' : '✕'}</TableCell>
                                <TableCell>{f.isDiscount ? '✓' : '✕'}</TableCell>
                                <TableCell>{f.validFrom ? new Date(f.validFrom).toLocaleDateString('de-DE') : '-'}</TableCell>
                                <TableCell>{f.validUntil ? new Date(f.validUntil).toLocaleDateString('de-DE') : '-'}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => openEdit(i)}><EditIcon fontSize="small" /></IconButton>
                                    <IconButton size="small" onClick={() => remove(i)}><DeleteIcon fontSize="small" /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {!draft && (
                <IconButton onClick={openAdd} title="Neue gestaffelte Gebühr" sx={{ color: MATUKIO_BLUE }}>
                    <AddCircleIcon fontSize="large" />
                </IconButton>
            )}

            {draft && (
                <Box sx={{ border: '1px solid #ddd', p: 2.5, maxWidth: 640 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <MuiTextField
                            label="Title of the fee" fullWidth size="small"
                            value={draft.values.title}
                            onChange={e => setDraft({ ...draft, values: { ...draft.values, title: e.target.value } })}
                        />
                        <MuiTextField
                            select label="Bookable for" fullWidth size="small"
                            value={draft.values.bookableFor || 'public'}
                            onChange={e => setDraft({ ...draft, values: { ...draft.values, bookableFor: e.target.value } })}
                        >
                            <MenuItem value="public">Public</MenuItem>
                            <MenuItem value="registered">Registriert</MenuItem>
                        </MuiTextField>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <MuiTextField
                            label="Value" type="number" fullWidth size="small"
                            value={draft.values.value}
                            onChange={e => setDraft({ ...draft, values: { ...draft.values, value: Number(e.target.value) } })}
                        />
                        <MuiTextField
                            label="Valid from" type="datetime-local" fullWidth size="small"
                            slotProps={{ inputLabel: { shrink: true } }}
                            value={draft.values.validFrom ? draft.values.validFrom.slice(0, 16) : ''}
                            onChange={e => setDraft({ ...draft, values: { ...draft.values, validFrom: e.target.value } })}
                        />
                        <MuiTextField
                            label="Valid until" type="datetime-local" fullWidth size="small"
                            slotProps={{ inputLabel: { shrink: true } }}
                            value={draft.values.validUntil ? draft.values.validUntil.slice(0, 16) : ''}
                            onChange={e => setDraft({ ...draft, values: { ...draft.values, validUntil: e.target.value } })}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <FormControlLabel
                            control={<Switch checked={!!draft.values.isPercentage} onChange={e => setDraft({ ...draft, values: { ...draft.values, isPercentage: e.target.checked } })} />}
                            label="Percentage value"
                        />
                        <FormControlLabel
                            control={<Switch checked={!!draft.values.isDiscount} onChange={e => setDraft({ ...draft, values: { ...draft.values, isDiscount: e.target.checked } })} />}
                            label="Discount"
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="outlined" onClick={cancel}>Cancel</Button>
                        <Button variant="contained" onClick={apply} sx={{ bgcolor: MATUKIO_BLUE, '&:hover': { bgcolor: MATUKIO_BLUE } }}>Apply</Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export const OptionalExtrasList = () => {
    const { control } = useFormContext();
    const { fields, append, remove, update } = useFieldArray({ control, name: 'tickets' });
    const [draft, setDraft] = useState<DraftState | null>(null);

    const openAdd = () => setDraft({ index: null, values: { name: '', price: 0, capacity: 20, description: '' } });
    const openEdit = (index: number) => setDraft({ index, values: { ...fields[index] } });
    const cancel = () => setDraft(null);
    const apply = () => {
        if (!draft) return;
        if (draft.index === null) append(draft.values);
        else update(draft.index, draft.values);
        setDraft(null);
    };

    return (
        <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Additional services can be offered with the bookable options (e.g. hotel rooms, etc.).
            </Typography>
            {fields.length > 0 && (
                <Table size="small" sx={{ mb: 2 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>title</TableCell>
                            <TableCell>Value</TableCell>
                            <TableCell>Kapazität</TableCell>
                            <TableCell align="right" />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fields.map((f: any, i) => (
                            <TableRow key={f.id} sx={{ bgcolor: ROW_BG, '&:hover': { bgcolor: ROW_BG_HOVER } }}>
                                <TableCell>{f.name}</TableCell>
                                <TableCell>€ {Number(f.price).toFixed(2)}</TableCell>
                                <TableCell>{f.capacity}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => openEdit(i)}><EditIcon fontSize="small" /></IconButton>
                                    <IconButton size="small" onClick={() => remove(i)}><DeleteIcon fontSize="small" /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {!draft && (
                <IconButton onClick={openAdd} title="Neue zubuchbare Option" sx={{ color: MATUKIO_BLUE }}>
                    <AddCircleIcon fontSize="large" />
                </IconButton>
            )}

            {draft && (
                <Box sx={{ border: '1px solid #ddd', p: 2.5, maxWidth: 640 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <MuiTextField
                            label="Title" fullWidth size="small"
                            value={draft.values.name}
                            onChange={e => setDraft({ ...draft, values: { ...draft.values, name: e.target.value } })}
                        />
                        <MuiTextField
                            label="Value (€)" type="number" fullWidth size="small"
                            value={draft.values.price}
                            onChange={e => setDraft({ ...draft, values: { ...draft.values, price: Number(e.target.value) } })}
                        />
                        <MuiTextField
                            label="Kapazität" type="number" fullWidth size="small"
                            value={draft.values.capacity}
                            onChange={e => setDraft({ ...draft, values: { ...draft.values, capacity: Number(e.target.value) } })}
                        />
                    </Box>
                    <MuiTextField
                        label="Beschreibung" fullWidth size="small" multiline sx={{ mb: 2 }}
                        value={draft.values.description || ''}
                        onChange={e => setDraft({ ...draft, values: { ...draft.values, description: e.target.value } })}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="outlined" onClick={cancel}>Cancel</Button>
                        <Button variant="contained" onClick={apply} sx={{ bgcolor: MATUKIO_BLUE, '&:hover': { bgcolor: MATUKIO_BLUE } }}>Apply</Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
};
