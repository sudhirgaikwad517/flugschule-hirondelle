import { 
  List, 
  Datagrid, 
  TextField, 
  DateField, 
  NumberField, 
  ReferenceField,
  ShowButton,
  Show,
  TopToolbar,
  ListButton,
  useRecordContext,
  useUpdate,
  useNotify,
  useRefresh
} from 'react-admin';
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableRow, Paper, Typography, Box, Grid, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Button, TextField as MuiTextField, Divider } from '@mui/material';

export const BookingList = () => (
  <List>
      <Datagrid rowClick="show" sx={{ overflowX: 'auto' }}>
          <TextField source="id" label="ID" />
          <ReferenceField source="userId" reference="users" label="Benutzer">
              <TextField source="name" />
          </ReferenceField>
          <ReferenceField source="eventId" reference="events" label="Event">
              <TextField source="title" />
          </ReferenceField>
          <TextField source="status" label="Status" />
          <NumberField source="totalPrice" label="Gesamtpreis (€)" options={{ style: 'currency', currency: 'EUR' }} />
          <DateField source="createdAt" label="Erstellt am" showTime />
          <ShowButton />
      </Datagrid>
  </List>
);

const BookingShowActions = () => (
    <TopToolbar>
        <ListButton />
    </TopToolbar>
);

const AdminActions = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const [update, { isLoading }] = useUpdate();
    const [status, setStatus] = useState('PENDING');
    const [details, setDetails] = useState<any>({});

    useEffect(() => {
        if (record) {
            setStatus(record.status);
            setDetails(record.customerDetails || {});
        }
    }, [record]);

    const handleSave = () => {
        if (!record) return;
        update(
            'bookings',
            { id: record.id, data: { status, customerDetails: details }, previousData: record },
            {
                onSuccess: () => {
                    notify('Buchung erfolgreich aktualisiert!', { type: 'success' });
                    refresh();
                },
                onError: (error: any) => notify(`Fehler: ${error.message}`, { type: 'error' })
            }
        );
    };

    const setField = (field: string) => (e: any) => {
        setDetails((prev: any) => ({ ...prev, [field]: e.target.value }));
    };

    if (!record) return null;

    return (
        <Card elevation={1} sx={{ mt: { xs: 2, md: 0 } }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>Verwaltung (Status)</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Hier können Sie den Status der Buchung anpassen, z.B. wenn eine Zahlung per Banküberweisung eingegangen ist.
                </Typography>
                
                <FormControl fullWidth margin="normal" size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        label="Status"
                    >
                        <MenuItem value="PENDING">Ausstehend (Pending)</MenuItem>
                        <MenuItem value="CONFIRMED">Bestätigt (Confirmed)</MenuItem>
                        <MenuItem value="WAITLIST">Warteliste (Waitlist)</MenuItem>
                        <MenuItem value="COMPLETED">Abgeschlossen (Completed)</MenuItem>
                        <MenuItem value="CANCELLED">Storniert (Cancelled)</MenuItem>
                    </Select>
                </FormControl>

                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>Kundendetails bearbeiten</Typography>
                <MuiTextField fullWidth margin="dense" size="small" label="Vorname" value={details.firstName || ''} onChange={setField('firstName')} />
                <MuiTextField fullWidth margin="dense" size="small" label="Nachname" value={details.lastName || ''} onChange={setField('lastName')} />
                <MuiTextField fullWidth margin="dense" size="small" label="E-Mail" value={details.email || ''} onChange={setField('email')} />
                <MuiTextField fullWidth margin="dense" size="small" label="Telefon" value={details.phone || ''} onChange={setField('phone')} />
                <MuiTextField fullWidth margin="dense" size="small" label="Straße" value={details.street || ''} onChange={setField('street')} />
                <MuiTextField fullWidth margin="dense" size="small" label="PLZ" value={details.zip || ''} onChange={setField('zip')} />
                <MuiTextField fullWidth margin="dense" size="small" label="Stadt" value={details.city || ''} onChange={setField('city')} />
                <MuiTextField fullWidth margin="dense" size="small" label="Land" value={details.country || ''} onChange={setField('country')} />

                <Box sx={{ mt: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={isLoading}
                        fullWidth
                    >
                        Speichern
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

const CustomBookingDetails = () => {
    const record = useRecordContext();
    if (!record) return null;

    return (
        <Box sx={{ p: 3, width: '100%' }}>
            <Typography variant="h6" gutterBottom>Buchungsdetails</Typography>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 8 }}>
                    <Paper elevation={1}>
                        <Table sx={{ tableLayout: 'fixed' }}>
                            <TableBody>
                        <TableRow>
                            <TableCell component="th" scope="row" style={{ fontWeight: 'bold', width: '30%' }}>ID</TableCell>
                            <TableCell>{record.id}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Benutzer ID</TableCell>
                            <TableCell>{record.userId}</TableCell>
                        </TableRow>
                        {record.event && (
                            <>
                                <TableRow>
                                    <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Event</TableCell>
                                    <TableCell>
                                        <strong>{record.event.title}</strong>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Kategorie</TableCell>
                                    <TableCell>{record.event.category}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Datum</TableCell>
                                    <TableCell>
                                        {new Date(record.event.startDate).toLocaleDateString('de-DE')} 
                                        {record.event.endDate && ` - ${new Date(record.event.endDate).toLocaleDateString('de-DE')}`}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Ort</TableCell>
                                    <TableCell>{record.event.location || '-'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Veranstalter</TableCell>
                                    <TableCell>{record.event.organizer || '-'}</TableCell>
                                </TableRow>
                            </>
                        )}
                        {!record.event && (
                            <TableRow>
                                <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Event ID</TableCell>
                                <TableCell>{record.eventId}</TableCell>
                            </TableRow>
                        )}
                        <TableRow>
                            <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell>{record.status}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Gesamtpreis</TableCell>
                            <TableCell>
                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(record.totalPrice || 0)}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Zahlungsart</TableCell>
                            <TableCell>{record.paymentMethod}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Erstellt am</TableCell>
                            <TableCell>{new Date(record.createdAt).toLocaleString('de-DE')}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Bemerkungen</TableCell>
                            <TableCell>{record.remarks || '-'}</TableCell>
                        </TableRow>
                        
                        {record.customerDetails && (
                            <TableRow>
                                <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Kundendetails (Rechnungsadresse)</TableCell>
                                <TableCell>
                                    {record.customerDetails.firstName} {record.customerDetails.lastName}<br />
                                    {record.customerDetails.street}<br />
                                    {record.customerDetails.zip} {record.customerDetails.city}<br />
                                    {record.customerDetails.country}<br />
                                    Tel: {record.customerDetails.phone}
                                </TableCell>
                            </TableRow>
                        )}
                        
                        {record.items && record.items.length > 0 && (
                            <TableRow>
                                <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Gekaufte Tickets</TableCell>
                                <TableCell>
                                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                        {record.items.map((item: any) => (
                                            <li key={item.id}>
                                                <strong>{item.quantity}x</strong> {item.ticket?.name} 
                                                {item.ticket?.price ? ` (à €${item.ticket.price.toFixed(2)})` : ''}
                                            </li>
                                        ))}
                                    </ul>
                                </TableCell>
                            </TableRow>
                        )}
                                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <AdminActions />
                </Grid>
            </Grid>
        </Box>
    );
};

export const BookingShow = () => (
  <Show actions={<BookingShowActions />}>
      <CustomBookingDetails />
  </Show>
);
