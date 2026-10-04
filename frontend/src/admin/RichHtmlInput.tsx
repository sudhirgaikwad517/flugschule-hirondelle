import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Box, IconButton, TextField, Typography, Tooltip } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import LinkIcon from '@mui/icons-material/Link';
import FormatClearIcon from '@mui/icons-material/FormatClear';
import CodeIcon from '@mui/icons-material/Code';
import EditIcon from '@mui/icons-material/Edit';

// Standalone WYSIWYG + raw-HTML-source editor, built directly on the same
// TipTap packages ra-input-rich-text itself uses (StarterKit/Underline/Link)
// rather than importing RichTextInput from ra-input-rich-text, since that
// component's useInput() hook requires a react-admin <Form> context -
// HomeContentEditor.tsx (and its siblings) are plain useState/fetch pages,
// not react-admin <SimpleForm> pages, so there's no such context here.
//
// The "HTML-Code" toggle is the one thing ra-input-rich-text has no
// equivalent for out of the box (confirmed: its default toolbar is
// LevelSelect/FormatButtons/ColorButtons/ListButtons/LinkButtons/
// ImageButtons/QuoteButtons/ClearButtons only, no source view) - it's the
// Joomla "Editor an/aus" button a client specifically asked to be able to
// reproduce, swapping the canvas for a plain textarea bound to the exact
// same HTML string, so arbitrary style="..."/class="..." can be typed
// directly. SafeHtml (which already renders every field this feeds) already
// allows both attributes through DOMPurify.
interface RichHtmlInputProps {
  label: string;
  value: string;
  onChange: (html: string) => void;
  helperText?: string;
  minRows?: number;
}

const ToolbarButton = ({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) => (
  <Tooltip title={title}>
    <IconButton
      size="small"
      onMouseDown={(e) => e.preventDefault()} // keep the editor's text selection from collapsing before the click fires
      onClick={onClick}
      sx={{ bgcolor: active ? 'action.selected' : 'transparent', borderRadius: 1 }}
    >
      {children}
    </IconButton>
  </Tooltip>
);

export const RichHtmlInput = ({ label, value, onChange, helperText, minRows = 6 }: RichHtmlInputProps) => {
  const [htmlMode, setHtmlMode] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Underline, Link.configure({ openOnClick: false, autolink: false })],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Keeps the canvas in sync whenever `value` changes from outside the
  // editor's own typing - loading fresh data, or coming back from HTML
  // mode after the admin edited the raw source directly.
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, value, htmlMode]);

  const setLink = () => {
    const previousUrl = editor?.getAttributes('link').href || '';
    const url = window.prompt('Link-Ziel (z.B. /ausbildung/schnupperkurs oder https://...)', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor?.chain().focus().unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ color: '#666' }}>{label}</Typography>
        <IconButton
          size="small"
          onClick={() => setHtmlMode((m) => !m)}
          title={htmlMode ? 'Zurück zum Editor' : 'HTML-Code bearbeiten'}
        >
          {htmlMode ? <EditIcon fontSize="small" /> : <CodeIcon fontSize="small" />}
        </IconButton>
      </Box>

      {htmlMode ? (
        <TextField
          fullWidth
          multiline
          minRows={minRows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          sx={{ fontFamily: 'monospace', '& textarea': { fontFamily: 'monospace', fontSize: 13 } }}
          helperText={helperText || 'Rohes HTML - z.B. <p style="color:#c00; font-size:18px" class="meine-klasse">Text</p>'}
        />
      ) : (
        <Box sx={{ border: '1px solid #c4c4c4', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', gap: 0.25, p: 0.5, borderBottom: '1px solid #eee', flexWrap: 'wrap' }}>
            <ToolbarButton title="Fett" active={editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()}>
              <FormatBoldIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarButton title="Kursiv" active={editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()}>
              <FormatItalicIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarButton title="Unterstrichen" active={editor?.isActive('underline')} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
              <FormatUnderlinedIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarButton title="Liste" active={editor?.isActive('bulletList')} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
              <FormatListBulletedIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarButton title="Link" active={editor?.isActive('link')} onClick={setLink}>
              <LinkIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarButton title="Formatierung entfernen" onClick={() => editor?.chain().focus().clearNodes().unsetAllMarks().run()}>
              <FormatClearIcon fontSize="small" />
            </ToolbarButton>
          </Box>
          <Box
            sx={{
              p: 1.5,
              minHeight: 80,
              cursor: 'text',
              '& .ProseMirror': { outline: 'none' },
              '& a': { color: '#428bca' },
            }}
            onClick={() => editor?.commands.focus()}
          >
            <EditorContent editor={editor} />
          </Box>
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
