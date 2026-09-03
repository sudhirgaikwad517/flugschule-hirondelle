import React, { useState } from 'react';
import {
  List,
  Datagrid,
  TextField,
  EditButton,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  RadioButtonGroupInput,
  SelectInput,
  useRecordContext,
  useNotify,
  useInput,
  ArrayInput,
  SimpleFormIterator
} from 'react-admin';

// List of predefined static pages that have media slots
const PAGE_CHOICES = [
  { id: 'sicherheitstraining', name: 'Performance - Sicherheitstraining' },
  { id: 'rettungsgeraetetraining', name: 'Performance - Rettungsgerätetraining' },
  { id: 'refresher', name: 'Performance - Refresher' },
  { id: 'groundhandling', name: 'Performance - Groundhandling' },
  { id: 'tandem', name: 'Tandemfliegen' },
  { id: 'schnupperkurs', name: 'Ausbildung - Schnupperkurs' },
  { id: 'l-schein', name: 'Ausbildung - L-Schein' },
  { id: 'a-schein', name: 'Ausbildung - A-Schein' },
  { id: 'b-schein', name: 'Ausbildung - B-Schein' },
  { id: 'windenschein', name: 'Ausbildung - Winde' },
  { id: 'tandemschein', name: 'Ausbildung - Tandem' },
];

const MediaPreview = ({ source }: { source: string }) => {
  const record = useRecordContext();
  if (!record || !record[source]) return null;
  return (
    <img src={record[source]} alt="Preview" style={{ width: '100px', height: 'auto', borderRadius: '4px' }} />
  );
};

// Custom Image Upload component using our /api/upload endpoint
const ImageUploadInput = (props: any) => {
  const { source, label } = props;
  const { field } = useInput({ source });
  const [uploading, setUploading] = useState(false);
  const notify = useNotify();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('auth');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        field.onChange(data.url);
        notify('Bild erfolgreich hochgeladen', { type: 'success' });
      } else {
        notify(data.message || 'Fehler beim Upload', { type: 'warning' });
      }
    } catch (error) {
      notify('Netzwerkfehler beim Upload', { type: 'warning' });
    } finally {
      setUploading(false);
    }
  };

  const currentUrl = field.value;

  return (
    <div style={{ marginBottom: '1.5rem', width: '100%' }}>
      <label style={{ display: 'block', fontSize: '12px', color: 'rgba(0, 0, 0, 0.6)', marginBottom: '8px' }}>{label}</label>
      <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
      {uploading && <span style={{ marginLeft: '10px', fontSize: '12px' }}>Lädt hoch...</span>}
      
      {currentUrl && (
        <div style={{ marginTop: '10px' }}>
          <img src={currentUrl} alt="Preview" style={{ maxWidth: '200px', borderRadius: '4px', border: '1px solid #ccc' }} />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Gespeicherte URL: {currentUrl}</div>
        </div>
      )}
    </div>
  );
};

export const PageMediaList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="slug" label="Seiten-Kennung (Slug)" />
      <TextField source="contentMediaType" label="Media Typ" />
      <MediaPreview source="headerImageUrl" />
      <EditButton />
    </Datagrid>
  </List>
);

export const PageMediaEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <SelectInput source="slug" choices={PAGE_CHOICES} label="Seite auswählen" fullWidth />
        
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px', width: '100%', marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0 }}>Header Bild (Top Banner)</h3>
          <ImageUploadInput source="headerImageUrl" label="Bild hochladen" />
        </div>

        <div style={{ padding: '20px', background: '#e3f2fd', borderRadius: '8px', width: '100%', marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0 }}>Content Media (Zentrales Bild / Video)</h3>
          <RadioButtonGroupInput 
            source="contentMediaType" 
            label="Was soll auf der Seite angezeigt werden?" 
            choices={[
              { id: 'IMAGE', name: 'Bild (Image)' },
              { id: 'VIDEO', name: 'YouTube Video' }
            ]} 
          />
          
          <div style={{ marginTop: '20px' }}>
             <ImageUploadInput source="contentImageUrl" label="Bild hochladen (Wenn Image ausgewählt ist)" />
             <TextInput source="contentYoutubeUrl" label="YouTube Embed Link (z.B. https://www.youtube.com/embed/...)" fullWidth />
          </div>
        </div>

        <div style={{ padding: '20px', background: '#fff3e0', borderRadius: '8px', width: '100%', marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0 }}>Impressionen (Bildergalerie)</h3>
          <p style={{ fontSize: '13px', color: '#666', marginTop: 0 }}>Fügen Sie hier Bilder für die Galerie am Ende der Seite hinzu.</p>
          <ArrayInput source="galleryImages" label="Bilder">
            <SimpleFormIterator>
              <ImageUploadInput source="" label="Bild" />
            </SimpleFormIterator>
          </ArrayInput>
        </div>

      </SimpleForm>
    </Edit>
  );
};

export const PageMediaCreate = () => (
  <Create>
    <SimpleForm>
        <SelectInput source="slug" choices={PAGE_CHOICES} label="Seite auswählen" fullWidth />
        
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px', width: '100%', marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0 }}>Header Bild (Top Banner)</h3>
          <ImageUploadInput source="headerImageUrl" label="Bild hochladen" />
        </div>

        <div style={{ padding: '20px', background: '#e3f2fd', borderRadius: '8px', width: '100%', marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0 }}>Content Media (Zentrales Bild / Video)</h3>
          <RadioButtonGroupInput 
            source="contentMediaType" 
            label="Was soll auf der Seite angezeigt werden?" 
            choices={[
              { id: 'IMAGE', name: 'Bild (Image)' },
              { id: 'VIDEO', name: 'YouTube Video' }
            ]} 
            defaultValue="IMAGE"
          />
          
          <div style={{ marginTop: '20px' }}>
             <ImageUploadInput source="contentImageUrl" label="Bild hochladen (Wenn Image ausgewählt ist)" />
             <TextInput source="contentYoutubeUrl" label="YouTube Embed Link (z.B. https://www.youtube.com/embed/...)" fullWidth />
          </div>
        </div>

        <div style={{ padding: '20px', background: '#fff3e0', borderRadius: '8px', width: '100%', marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0 }}>Impressionen (Bildergalerie)</h3>
          <p style={{ fontSize: '13px', color: '#666', marginTop: 0 }}>Fügen Sie hier Bilder für die Galerie am Ende der Seite hinzu.</p>
          <ArrayInput source="galleryImages" label="Bilder">
            <SimpleFormIterator>
              <ImageUploadInput source="" label="Bild" />
            </SimpleFormIterator>
          </ArrayInput>
        </div>
    </SimpleForm>
  </Create>
);
