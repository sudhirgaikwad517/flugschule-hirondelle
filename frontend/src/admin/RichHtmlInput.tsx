import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import { Box, IconButton, TextField, Typography, Tooltip, CircularProgress, Select, MenuItem, Divider } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import LinkIcon from '@mui/icons-material/Link';
import ImageIcon from '@mui/icons-material/Image';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import FormatClearIcon from '@mui/icons-material/FormatClear';
import CodeIcon from '@mui/icons-material/Code';
import EditIcon from '@mui/icons-material/Edit';

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

// Standalone WYSIWYG + raw-HTML-source editor, built directly on the same
// TipTap packages ra-input-rich-text itself uses (StarterKit/Underline/Link/
// TextStyle/Color/Highlight/TextAlign/Image) rather than importing
// RichTextInput from ra-input-rich-text, since that component's useInput()
// hook requires a react-admin <Form> context - HomeContentEditor.tsx (and
// its siblings) are plain useState/fetch pages, not react-admin
// <SimpleForm> pages, so there's no such context here.
//
// The "HTML-Code" toggle is the one thing ra-input-rich-text has no
// equivalent for out of the box - it's the Joomla "Editor an/aus" button a
// client specifically asked to be able to reproduce, swapping the canvas
// for a plain textarea bound to the exact same HTML string, so arbitrary
// style="..."/class="..." can be typed directly. SafeHtml (which renders
// every field this feeds) already allows both attributes through DOMPurify.
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

const ToolbarDivider = () => <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />;

export const RichHtmlInput = ({ label, value, onChange, helperText, minRows = 6 }: RichHtmlInputProps) => {
  const [htmlMode, setHtmlMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const highlightInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: false }),
      Image,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
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

  // Images are inserted directly into the document at the cursor (matching
  // Joomla's own article editor's image button), not managed as a separate
  // upload slot outside the text - fits the "one big free-form page" model
  // this is for, where there's no fixed layout left to hang dedicated image
  // fields off of.
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !editor) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', headers: authHeaders(), body: formData });
      const data = await res.json();
      if (res.ok) editor.chain().focus().setImage({ src: data.url }).run();
      else window.alert(data.message || 'Fehler beim Bild-Upload');
    } catch {
      window.alert('Netzwerkfehler beim Bild-Upload');
    } finally {
      setUploading(false);
    }
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, p: 0.5, borderBottom: '1px solid #eee', flexWrap: 'wrap' }}>
            <ToolbarButton title="Rückgängig" onClick={() => editor?.chain().focus().undo().run()}>
              <UndoIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarButton title="Wiederholen" onClick={() => editor?.chain().focus().redo().run()}>
              <RedoIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarDivider />
            <Select
              size="small"
              value={editor?.isActive('heading', { level: 2 }) ? 'h2' : editor?.isActive('heading', { level: 3 }) ? 'h3' : 'p'}
              onChange={(e) => {
                const v = e.target.value;
                if (v === 'p') editor?.chain().focus().setParagraph().run();
                else editor?.chain().focus().toggleHeading({ level: v === 'h2' ? 2 : 3 }).run();
              }}
              sx={{ fontSize: 13, mr: 0.5, '.MuiSelect-select': { py: 0.5 } }}
            >
              <MenuItem value="p">Absatz</MenuItem>
              <MenuItem value="h2">Überschrift</MenuItem>
              <MenuItem value="h3">Unterüberschrift</MenuItem>
            </Select>
            <ToolbarDivider />
            <ToolbarButton title="Fett" active={editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()}>
              <FormatBoldIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarButton title="Kursiv" active={editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()}>
              <FormatItalicIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarButton title="Unterstrichen" active={editor?.isActive('underline')} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
              <FormatUnderlinedIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarButton title="Durchgestrichen" active={editor?.isActive('strike')} onClick={() => editor?.chain().focus().toggleStrike().run()}>
              <StrikethroughSIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarButton title="Textfarbe" onClick={() => colorInputRef.current?.click()}>
              <FormatColorTextIcon fontSize="small" />
            </ToolbarButton>
            <input
              ref={colorInputRef}
              type="color"
              defaultValue="#000000"
              onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
              style={{ width: 0, height: 0, opacity: 0, position: 'absolute' }}
            />
            <ToolbarButton title="Hervorheben" active={editor?.isActive('highlight')} onClick={() => highlightInputRef.current?.click()}>
              <FormatColorFillIcon fontSize="small" />
            </ToolbarButton>
            <input
              ref={highlightInputRef}
              type="color"
              defaultValue="#fff59d"
              onChange={(e) => editor?.chain().focus().toggleHighlight({ color: e.target.value }).run()}
              style={{ width: 0, height: 0, opacity: 0, position: 'absolute' }}
            />
            <ToolbarDivider />
            <ToolbarButton title="Links ausrichten" active={editor?.isActive({ textAlign: 'left' })} onClick={() => editor?.chain().focus().setTextAlign('left').run()}>
              <FormatAlignLeftIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarButton title="Zentrieren" active={editor?.isActive({ textAlign: 'center' })} onClick={() => editor?.chain().focus().setTextAlign('center').run()}>
              <FormatAlignCenterIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarButton title="Rechts ausrichten" active={editor?.isActive({ textAlign: 'right' })} onClick={() => editor?.chain().focus().setTextAlign('right').run()}>
              <FormatAlignRightIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarButton title="Blocksatz" active={editor?.isActive({ textAlign: 'justify' })} onClick={() => editor?.chain().focus().setTextAlign('justify').run()}>
              <FormatAlignJustifyIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton title="Aufzählung" active={editor?.isActive('bulletList')} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
              <FormatListBulletedIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarButton title="Nummerierte Liste" active={editor?.isActive('orderedList')} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
              <FormatListNumberedIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarButton title="Zitat" active={editor?.isActive('blockquote')} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
              <FormatQuoteIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarButton title="Trennlinie" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
              <HorizontalRuleIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton title="Link" active={editor?.isActive('link')} onClick={setLink}>
              <LinkIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarButton title="Bild einfügen" onClick={() => fileInputRef.current?.click()}>
              {uploading ? <CircularProgress size={16} /> : <ImageIcon fontSize="small" />}
            </ToolbarButton>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageUpload} />
            <ToolbarDivider />
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
              '& img': { maxWidth: '100%', borderRadius: 1 },
              '& blockquote': { borderLeft: '3px solid #ccc', pl: 2, ml: 0, color: '#666', fontStyle: 'italic' },
              '& hr': { border: 'none', borderTop: '1px solid #ddd', my: 2 },
              '& mark': { borderRadius: '2px', px: '2px' },
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
