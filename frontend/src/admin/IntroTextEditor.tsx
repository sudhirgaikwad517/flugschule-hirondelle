import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapLink from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Box, IconButton, TextField, Tooltip, Typography, Select, MenuItem } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatStrikethroughIcon from '@mui/icons-material/FormatStrikethrough';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import CodeIcon from '@mui/icons-material/Code';

// The richer sibling of RichTextField.tsx, built specifically for old
// Visforms' real "Einleitungstext" field (Formular bearbeiten > Allgemein
// tab) - the only field on this site that genuinely needs headings, since
// old's real content there is an <h1>Service-Auftrag</h1> followed by
// plain paragraphs (deep-verified against fs-hirondelle.de's live admin,
// view=visform&layout=edit&id=2). RichTextField.tsx explicitly disables
// headings and warns against structural markup - do NOT reuse it here, and
// do NOT reuse THIS component for the simple "(HTML erlaubt)" fields it
// already covers elsewhere (AusbildungContentEditor.tsx etc.), since those
// are proven to round-trip correctly through the simpler schema already.
//
// Deliberately does not implement table editing (old's toolbar shows a
// "Tabelle" menu) - no migrated form content actually uses one, and TipTap's
// table extensions are heavy for a feature nothing currently needs; the
// "Quelltext" toggle covers that gap if it's ever needed by hand.
const HEADING_CHOICES = [
  { value: 'p', label: 'Absatz' },
  { value: 'h1', label: 'Kopfzeile 1' },
  { value: 'h2', label: 'Kopfzeile 2' },
  { value: 'h3', label: 'Kopfzeile 3' },
];

export const IntroTextEditor = ({
  label,
  value,
  onChange,
  helperText,
  minHeight = 220,
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
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TiptapLink.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

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

  const currentBlock = editor
    ? editor.isActive('heading', { level: 1 }) ? 'h1'
      : editor.isActive('heading', { level: 2 }) ? 'h2'
      : editor.isActive('heading', { level: 3 }) ? 'h3'
      : 'p'
    : 'p';

  const setBlock = (v: string) => {
    if (!editor) return;
    if (v === 'p') editor.chain().focus().setParagraph().run();
    else editor.chain().focus().toggleHeading({ level: Number(v.slice(1)) as 1 | 2 | 3 }).run();
  };

  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>{label}</Typography>
      {sourceMode ? (
        <TextField
          fullWidth
          multiline
          minRows={6}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="HTML"
        />
      ) : (
        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, px: 0.5, py: 0.25, bgcolor: '#f8f8f8', borderBottom: '1px solid #eee' }}>
            <Select size="small" value={currentBlock} onChange={(e) => setBlock(e.target.value)} sx={{ height: 30, fontSize: '0.85rem', mr: 0.5 }}>
              {HEADING_CHOICES.map((h) => <MenuItem key={h.value} value={h.value} sx={{ fontSize: '0.85rem' }}>{h.label}</MenuItem>)}
            </Select>
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
            <Tooltip title="Unterstrichen">
              <IconButton size="small" onClick={() => editor?.chain().focus().toggleUnderline().run()} color={editor?.isActive('underline') ? 'primary' : 'default'}>
                <FormatUnderlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Durchgestrichen">
              <IconButton size="small" onClick={() => editor?.chain().focus().toggleStrike().run()} color={editor?.isActive('strike') ? 'primary' : 'default'}>
                <FormatStrikethroughIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Aufzählung">
              <IconButton size="small" onClick={() => editor?.chain().focus().toggleBulletList().run()} color={editor?.isActive('bulletList') ? 'primary' : 'default'}>
                <FormatListBulletedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Nummerierte Liste">
              <IconButton size="small" onClick={() => editor?.chain().focus().toggleOrderedList().run()} color={editor?.isActive('orderedList') ? 'primary' : 'default'}>
                <FormatListNumberedIcon fontSize="small" />
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
              '& h1': { fontSize: '1.6rem', fontWeight: 600, margin: '0.4em 0' },
              '& h2': { fontSize: '1.3rem', fontWeight: 600, margin: '0.4em 0' },
              '& h3': { fontSize: '1.1rem', fontWeight: 600, margin: '0.4em 0' },
              '& p': { margin: 0, marginBottom: '0.5em' },
              '& p:last-child': { marginBottom: 0 },
              '& a': { color: '#428bca' },
              '& ul, & ol': { paddingLeft: '1.5em', marginBottom: '0.5em' },
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
