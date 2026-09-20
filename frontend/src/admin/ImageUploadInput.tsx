import React, { useState } from 'react';
import { useInput, useNotify } from 'react-admin';

// Generic image upload field using the app's existing /api/upload endpoint
// (same pattern already proven in PageMedia.tsx) - reused here so event
// images are a real upload instead of a raw URL text field, matching old
// Matukio's media-picker fields.
export const ImageUploadInput = ({ source, label, helperText }: { source: string; label: string; helperText?: string }) => {
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
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        field.onChange(data.url);
        notify('Bild erfolgreich hochgeladen', { type: 'success' });
      } else {
        notify(data.message || 'Fehler beim Upload', { type: 'warning' });
      }
    } catch {
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
      {helperText && <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.6)', marginTop: '4px' }}>{helperText}</div>}

      {currentUrl && (
        <div style={{ marginTop: '10px' }}>
          <img src={currentUrl} alt="Preview" style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>
      )}
    </div>
  );
};
