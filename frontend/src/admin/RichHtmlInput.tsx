import { useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Box, IconButton, TextField, Typography, Tooltip } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import EditIcon from '@mui/icons-material/Edit';

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

// Standalone WYSIWYG + raw-HTML-source editor built on the real TinyMCE
// engine (self-hosted via vite-plugin-static-copy, see vite.config.ts) -
// the exact same software Joomla's own editor runs on, not react-admin's
// RichTextInput (that needs a react-admin <Form> context, which these plain
// useState/fetch admin pages don't have).
//
// An earlier version of this component was built on TipTap/ProseMirror
// instead. That engine only round-trips its OWN recognized node schema
// (paragraph/heading/list/image/table/...) - any custom <div> layout
// outside that schema (card grids, background-image styles, absolute
// positioning) got silently stripped the moment its WYSIWYG canvas parsed
// it, even though the raw HTML stored in the database was untouched.
// TinyMCE is contentEditable-based rather than schema-based, so it doesn't
// have this limitation - it renders and round-trips arbitrary HTML/CSS
// structure, matching what Joomla's real editor does.
interface RichHtmlInputProps {
  label: string;
  value: string;
  onChange: (html: string) => void;
  helperText?: string;
  minRows?: number;
  // Defaults this field to the raw HTML-source view on first render (still
  // one click away from the WYSIWYG view) - useful for fields that mostly
  // get edited as whole blocks of markup/CSS.
  defaultHtmlMode?: boolean;
}

export const RichHtmlInput = ({ label, value, onChange, helperText, minRows = 6, defaultHtmlMode = false }: RichHtmlInputProps) => {
  const [htmlMode, setHtmlMode] = useState(defaultHtmlMode);

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ color: '#666' }}>{label}</Typography>
        <Tooltip title={htmlMode ? 'Zurück zum Editor' : 'HTML-Quelltext bearbeiten'}>
          <IconButton size="small" onClick={() => setHtmlMode((m) => !m)}>
            {htmlMode ? <EditIcon fontSize="small" /> : <CodeIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {htmlMode ? (
        <TextField
          fullWidth
          multiline
          minRows={minRows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          sx={{ fontFamily: 'monospace', '& textarea': { fontFamily: 'monospace', fontSize: 13 } }}
          helperText={helperText || 'Rohes HTML/CSS - z.B. <p style="color:#c00; font-size:18px" class="meine-klasse">Text</p>'}
        />
      ) : (
        <Box sx={{ border: '1px solid #c4c4c4', borderRadius: 1, overflow: 'hidden', '& .tox-tinymce': { border: 'none' } }}>
          <Editor
            licenseKey="gpl"
            tinymceScriptSrc="/tinymce/tinymce.min.js"
            value={value}
            onEditorChange={(html) => onChange(html)}
            init={{
              height: Math.max(minRows * 24, 320),
              menubar: false,
              branding: false,
              promotion: false,
              relative_urls: false,
              remove_script_host: false,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                'searchreplace', 'visualblocks', 'visualchars', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'help', 'wordcount', 'preview', 'nonbreaking',
              ],
              toolbar:
                'undo redo | blocks | bold italic underline strikethrough | forecolor backcolor | ' +
                'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | ' +
                'link image media table charmap | insertdatetime preview customPrint | ' +
                'removeformat searchreplace code visualblocks fullscreen help',
              content_style: 'body { font-family: inherit; font-size: 14px; }',
              setup: (editor) => {
                // TinyMCE dropped the old "print" plugin/button from its
                // open-source core bundle - re-added here the same way the
                // previous TipTap-based toolbar did it: open a new window
                // with just this field's HTML and trigger the browser's
                // print dialog.
                editor.ui.registry.addButton('customPrint', {
                  icon: 'print',
                  tooltip: 'Drucken',
                  onAction: () => {
                    const printWindow = window.open('', '_blank', 'width=900,height=700');
                    if (!printWindow) return;
                    printWindow.document.write(`<!DOCTYPE html><html><head><title>${label || 'Inhalt'}</title>
                      <style>body{font-family:sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.6;}
                      img{max-width:100%;} table{border-collapse:collapse;width:100%;} td,th{border:1px solid #ccc;padding:6px;}</style>
                      </head><body>${editor.getContent()}</body></html>`);
                    printWindow.document.close();
                    printWindow.focus();
                    printWindow.print();
                  },
                });
              },
              images_upload_handler: (blobInfo) =>
                new Promise((resolve, reject) => {
                  const formData = new FormData();
                  formData.append('file', blobInfo.blob(), blobInfo.filename());
                  fetch('/api/upload', { method: 'POST', headers: authHeaders(), body: formData })
                    .then((res) => res.json().then((data) => ({ res, data })))
                    .then(({ res, data }) => {
                      if (res.ok && data.url) resolve(data.url);
                      else reject(data.message || 'Fehler beim Bild-Upload');
                    })
                    .catch(() => reject('Netzwerkfehler beim Bild-Upload'));
                }),
            }}
          />
        </Box>
      )}
      {!htmlMode && helperText && (
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};
