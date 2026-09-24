import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapLink from '@tiptap/extension-link';
import { Box, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import CodeIcon from '@mui/icons-material/Code';

// A small WYSIWYG editor for the "(HTML erlaubt)" text fields across the
// content editors (AusbildungContentEditor.tsx etc.) - lets an admin see
// bold/italic/links rendered live instead of hand-writing HTML tags, while
// keeping the output as the exact same plain HTML string those fields
// already store (rendered elsewhere via SafeHtml). Built on the TipTap
// packages ra-input-rich-text (react-admin's own rich text input) already
// pulls in, rather than adding a new dependency.
//
// ONLY use this for fields that are genuinely just paragraph text with the
// occasional <a>/<strong>/<em> - e.g. Ausbildung's introHtml, Team's
// ausbildungHtml/reisenHtml/shopIntroHtml, Gutscheine's bullet1Html/
// bullet2Html, Versicherungen's paragraph2Html etc. Do NOT use this for the
// Gelände articles' `html` field or anything else containing <div>/
// <iframe>/<img class="voll">/<ul> structural markup - TipTap's schema only
// knows paragraph/bold/italic/link, so loading richer markup into it and
// saving would silently strip everything else, corrupting the content. The
// "Quelltext" toggle below is a safety net: it always shows/edits the exact
// same underlying HTML string as a plain textarea, so nothing is ever
// hidden behind the WYSIWYG view - if a field would lose something round-
// tripping through TipTap, switching to Quelltext and back makes that loss
// immediately visible before saving.
export const RichTextField = ({
  label,
  value,
  onChange,
  helperText,
  minHeight = 90,
}: {
  label: string;
  value: string;
  onChange: (html: string) => void;
  helperText?: string;
  minHeight?: number;
}) => {
  const [sourceMode, setSourceMode] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      TiptapLink.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Keeps the editor in sync when `value` changes from outside (initial
  // content arriving after an async fetch, or switching back from Quelltext)
  // without fighting the user's own typing - onUpdate above already keeps
  // `value` equal to the editor's own HTML while they type, so this only
  // fires on a genuine external change.
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    const url = window.prompt('Link-URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>{label}</Typography>
      {sourceMode ? (
        <TextField
          fullWidth
          multiline
          minRows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="HTML"
        />
      ) : (
        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.5, py: 0.25, bgcolor: '#f8f8f8', borderBottom: '1px solid #eee' }}>
            <Tooltip title="Fett">
              <IconButton size="small" onClick={() => editor?.chain().focus().toggleBold().run()} color={editor?.isActive('bold') ? 'primary' : 'default'}>
                <FormatBoldIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Kursiv">
              <IconButton size="small" onClick={() => editor?.chain().focus().toggleItalic().run()} color={editor?.isActive('italic') ? 'primary' : 'default'}>
                <FormatItalicIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Link setzen">
              <IconButton size="small" onClick={setLink} color={editor?.isActive('link') ? 'primary' : 'default'}>
                <LinkIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Link entfernen">
              <IconButton size="small" onClick={() => editor?.chain().focus().unsetLink().run()} disabled={!editor?.isActive('link')}>
                <LinkOffIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Box sx={{ flex: 1 }} />
            <Tooltip title="Quelltext (HTML) anzeigen/bearbeiten">
              <IconButton size="small" onClick={() => setSourceMode(true)}>
                <CodeIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            sx={{
              px: 1.5,
              py: 1,
              minHeight,
              fontSize: '0.95rem',
              '& p': { margin: 0, marginBottom: '0.5em' },
              '& p:last-child': { marginBottom: 0 },
              '& a': { color: '#428bca' },
              '& .ProseMirror': { outline: 'none' },
            }}
          >
            <EditorContent editor={editor} />
          </Box>
        </Box>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.25 }}>
        {helperText && <Typography variant="caption" sx={{ color: '#888' }}>{helperText}</Typography>}
        {sourceMode && (
          <Typography
            variant="caption"
            sx={{ color: '#428bca', cursor: 'pointer', ml: 'auto' }}
            onClick={() => setSourceMode(false)}
          >
            Zurück zur Vorschau
          </Typography>
        )}
      </Box>
    </Box>
  );
};
