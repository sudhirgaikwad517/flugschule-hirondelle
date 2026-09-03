import {
  List,
  Datagrid,
  TextField,
  DateField,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  useRecordContext,
  useNotify,
  Button
} from 'react-admin';
import { RichTextInput } from 'ra-input-rich-text';
import { Send } from 'lucide-react';
import { useState } from 'react';

const SendCampaignButton = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const [loading, setLoading] = useState(false);

  if (!record || record.status === 'SENT') return null;

  const handleSend = async () => {
      if (!window.confirm(`Möchten Sie diese E-Mail wirklich an die Liste "${record.targetList}" senden?`)) {
          return;
      }
      setLoading(true);
      try {
          const token = localStorage.getItem('token');
          const response = await fetch(`/api/newslettercampaigns/${record.id}/send`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          
          if (!response.ok) {
              const data = await response.json();
              throw new Error(data.message || 'Fehler beim Senden');
          }
          
          notify('Newsletter wurde erfolgreich versendet!', { type: 'success' });
          window.location.reload(); // Refresh to update status
      } catch (error: any) {
          notify(`Fehler: ${error.message}`, { type: 'error' });
      } finally {
          setLoading(false);
      }
  };

  return (
      <Button 
          label="Senden" 
          onClick={handleSend} 
          disabled={loading} 
          style={{ color: '#007BFF', fontWeight: 'bold' }}
      >
          <Send size={16} style={{ marginRight: 8 }} />
          Senden
      </Button>
  );
};

export const NewsletterCampaignList = () => (
  <List title="Newsletter-Kampagnen">
      <Datagrid rowClick="edit">
          <TextField source="subject" label="Betreff" />
          <TextField source="targetList" label="Zielgruppe" />
          <TextField source="status" label="Status" />
          <DateField source="sentAt" label="Gesendet am" showTime emptyText="Noch nicht gesendet" />
          <DateField source="createdAt" label="Erstellt am" />
          <SendCampaignButton />
      </Datagrid>
  </List>
);

export const NewsletterCampaignEdit = () => (
  <Edit title="Kampagne bearbeiten">
      <SimpleForm>
          <TextInput source="subject" label="Betreff" fullWidth required />
          <SelectInput source="targetList" label="Zielgruppe" choices={[
              { id: 'ALL', name: 'Alle Abonnenten' },
              { id: 'GENERAL', name: 'Nur Allgemeiner Newsletter' },
              { id: 'TANDEM', name: 'Nur Tandem-Newsletter' }
          ]} required />
          <RichTextInput source="body" label="E-Mail Inhalt (HTML)" />
      </SimpleForm>
  </Edit>
);

export const NewsletterCampaignCreate = () => (
  <Create title="Neue Kampagne erstellen">
      <SimpleForm>
          <TextInput source="subject" label="Betreff" fullWidth required />
          <SelectInput source="targetList" label="Zielgruppe" choices={[
              { id: 'ALL', name: 'Alle Abonnenten' },
              { id: 'GENERAL', name: 'Nur Allgemeiner Newsletter' },
              { id: 'TANDEM', name: 'Nur Tandem-Newsletter' }
          ]} defaultValue="GENERAL" required />
          <RichTextInput source="body" label="E-Mail Inhalt (HTML)" />
      </SimpleForm>
  </Create>
);
