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
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import {
  Box,
  IconButton,
  TextField,
  Typography,
  Tooltip,
  CircularProgress,
  Select,
  MenuItem,
  Divider,
  Menu,
  Popover,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
} from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import SubscriptIcon from '@mui/icons-material/Subscript';
import SuperscriptIcon from '@mui/icons-material/Superscript';
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
import TableChartIcon from '@mui/icons-material/TableChart';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import FormatClearIcon from '@mui/icons-material/FormatClear';
import CodeIcon from '@mui/icons-material/Code';
import EditIcon from '@mui/icons-material/Edit';
import FunctionsIcon from '@mui/icons-material/Functions';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import FindReplaceIcon from '@mui/icons-material/FindReplace';
import PrintIcon from '@mui/icons-material/Print';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

// Special characters a Joomla/TinyMCE "Sonderzeichen" picker typically
// offers - common typographic/currency/math symbols, not a full Unicode
// table.
const SPECIAL_CHARS = [
  '©', '®', '™', '€', '£', '¥', '¢', '§', '¶', '†', '‡', '•', '…', '‰',
  '′', '″', '‹', '›', '«', '»', '–', '—', '¡', '¿', '×', '÷', '±', '≠',
  '≤', '≥', '∞', '√', '∑', '∏', 'α', 'β', 'γ', 'δ', 'Ω', 'π', '¼', '½', '¾',
];

// Standalone WYSIWYG + raw-HTML-source editor, built directly on TipTap
// (the same packages ra-input-rich-text itself uses, plus Table/Subscript/
// Superscript) rather than importing RichTextInput from ra-input-rich-text,
// since that component's useInput() hook requires a react-admin <Form>
// context - HomeContentEditor.tsx (and its siblings) are plain useState/
// fetch pages, not react-admin <SimpleForm> pages, so there's no such
// context here.
//
// This replaced an attempt at using the Unlayer drag-and-drop "Seiten"
// editor for free-form page bodies: Unlayer's canvas runs in an isolated
// iframe that never loads this site's own CSS (so anything beyond
// Unlayer's own built-in blocks looked broken while editing even though it
// rendered fine once published), and hand-building its internal design
// JSON for a migrated page crashed the whole admin app the moment anything
// touched it (missing internal bookkeeping fields Unlayer expects - see
// Pages.tsx's own history for the exact failure). A single full-featured
// text editor matching Joomla's real TinyMCE toolbar - including a raw
// HTML/CSS source view - sidesteps both problems entirely: everything
// renders through this app's own CSS because it never leaves this app.
interface RichHtmlInputProps {
  label: string;
  value: string;
  onChange: (html: string) => void;
  helperText?: string;
  minRows?: number;
  // ProseMirror (the engine under every TipTap/rich-text editor, Joomla's
  // TinyMCE included) only ever round-trips its OWN recognized node types
  // (paragraph/heading/list/image/table/...) - any custom <div> structure
  // outside that schema (absolute-positioned cards, a flex/grid layout,
  // inline background-image styles) gets silently unwrapped/stripped the
  // moment the WYSIWYG canvas parses it, even though the raw HTML stored in
  // the database is untouched. Confirmed directly: a real card-grid layout
  // came out as stacked plain images once rendered through the canvas.
  // Defaulting a field known to hold that kind of markup to the HTML-code
  // view keeps it 100% intact - the WYSIWYG view stays one click away for
  // simple text tweaks, but should never be trusted with structural edits
  // on content like this.
  defaultHtmlMode?: boolean;
}

const ToolbarButton = ({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
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

export const RichHtmlInput = ({ label, value, onChange, helperText, minRows = 6, defaultHtmlMode = false }: RichHtmlInputProps) => {
  const [htmlMode, setHtmlMode] = useState(defaultHtmlMode);
  const [uploading, setUploading] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [tableMenuAnchor, setTableMenuAnchor] = useState<HTMLElement | null>(null);
  const [charsAnchor, setCharsAnchor] = useState<HTMLElement | null>(null);
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
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
      Subscript,
      Superscript,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Keeps the canvas in sync whenever `value` changes from outside the
  // editor's own typing - loading fresh data, or coming back from HTML
  // mode / Suchen & Ersetzen after the admin edited the raw source/text
  // directly.
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

  const insertDateTime = () => {
    const text = new Date().toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });
    editor?.chain().focus().insertContent(text).run();
  };

  // Opens a new window with just this field's current HTML (plus the
  // site's own luxury-page typography, so headings/paragraphs/images don't
  // print as unstyled text) and triggers the browser's print dialog -
  // closest equivalent to Joomla's toolbar "Drucken" button for a single
  // field rather than the whole admin page.
  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${label || 'Inhalt'}</title>
      <style>body{font-family:sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.6;}
      img{max-width:100%;} table{border-collapse:collapse;width:100%;} td,th{border:1px solid #ccc;padding:6px;}</style>
      </head><body>${editor?.getHTML() || ''}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Simple whole-field text replace, not a navigable find/highlight like a
  // full ProseMirror search plugin would give - operates on the raw HTML
  // string directly (so formatting outside the matched text is untouched)
  // rather than through editor commands, since ProseMirror has no built-in
  // "replace this substring" API. Good enough for "fix a typo everywhere on
  // this page" without pulling in a dedicated search extension.
  const handleReplaceAll = () => {
    if (!findText) return;
    const occurrences = value.split(findText).length - 1;
    const updated = value.split(findText).join(replaceText);
    onChange(updated);
    setFindReplaceOpen(false);
    window.alert(occurrences > 0 ? `${occurrences} Stelle(n) ersetzt.` : 'Kein Treffer gefunden.');
  };

  const insertTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    setTableMenuAnchor(null);
  };

  return (
    <Box
      sx={
        fullscreen
          ? { position: 'fixed', inset: 0, zIndex: 1300, bgcolor: 'white', p: 2, overflow: 'auto' }
          : { mb: 2 }
      }
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ color: '#666' }}>{label}</Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={fullscreen ? 'Vollbild verlassen' : 'Vollbild'}>
            <IconButton size="small" onClick={() => setFullscreen((f) => !f)}>
              {fullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <IconButton
            size="small"
            onClick={() => setHtmlMode((m) => !m)}
            title={htmlMode ? 'Zurück zum Editor' : 'HTML-Code bearbeiten (Editor an/aus)'}
          >
            {htmlMode ? <EditIcon fontSize="small" /> : <CodeIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>

      {htmlMode ? (
        <TextField
          fullWidth
          multiline
          minRows={fullscreen ? 30 : minRows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          sx={{ fontFamily: 'monospace', '& textarea': { fontFamily: 'monospace', fontSize: 13 } }}
          helperText={helperText || 'Rohes HTML/CSS - z.B. <p style="color:#c00; font-size:18px" class="meine-klasse">Text</p>'}
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: fullscreen ? 'calc(100% - 50px)' : 'auto' }}>
          {defaultHtmlMode && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              Dieser Inhalt enthält ein komplexes Layout (eigene CSS-Klassen, Hintergrundbilder). Der visuelle Editor kann solche Strukturen verändern oder entfernen - für Layout-Änderungen bitte den HTML-Code benutzen, nur für einfache Text-Korrekturen hier wechseln.
            </Alert>
          )}
          <Box sx={{ border: '1px solid #c4c4c4', borderRadius: 1, display: 'flex', flexDirection: 'column', flex: fullscreen ? 1 : undefined, overflow: fullscreen ? 'hidden' : undefined }}>
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
            <ToolbarButton title="Tiefgestellt" active={editor?.isActive('subscript')} onClick={() => editor?.chain().focus().toggleSubscript().run()}>
              <SubscriptIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarButton title="Hochgestellt" active={editor?.isActive('superscript')} onClick={() => editor?.chain().focus().toggleSuperscript().run()}>
              <SuperscriptIcon fontSize="small" />
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
            <ToolbarButton title="Tabelle" onClick={(e) => setTableMenuAnchor(e.currentTarget)}>
              <TableChartIcon fontSize="small" />
            </ToolbarButton>
            <Menu anchorEl={tableMenuAnchor} open={!!tableMenuAnchor} onClose={() => setTableMenuAnchor(null)}>
              <MenuItem onClick={insertTable}>Tabelle einfügen (3×3)</MenuItem>
              <Divider />
              <MenuItem onClick={() => { editor?.chain().focus().addColumnAfter().run(); setTableMenuAnchor(null); }}>Spalte danach einfügen</MenuItem>
              <MenuItem onClick={() => { editor?.chain().focus().deleteColumn().run(); setTableMenuAnchor(null); }}>Spalte löschen</MenuItem>
              <MenuItem onClick={() => { editor?.chain().focus().addRowAfter().run(); setTableMenuAnchor(null); }}>Zeile danach einfügen</MenuItem>
              <MenuItem onClick={() => { editor?.chain().focus().deleteRow().run(); setTableMenuAnchor(null); }}>Zeile löschen</MenuItem>
              <Divider />
              <MenuItem onClick={() => { editor?.chain().focus().deleteTable().run(); setTableMenuAnchor(null); }}>Tabelle löschen</MenuItem>
            </Menu>
            <ToolbarButton title="Sonderzeichen" onClick={(e) => setCharsAnchor(e.currentTarget)}>
              <FunctionsIcon fontSize="small" />
            </ToolbarButton>
            <Popover anchorEl={charsAnchor} open={!!charsAnchor} onClose={() => setCharsAnchor(null)}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 0.5, p: 1, maxWidth: 320 }}>
                {SPECIAL_CHARS.map((ch) => (
                  <Button
                    key={ch}
                    size="small"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { editor?.chain().focus().insertContent(ch).run(); setCharsAnchor(null); }}
                    sx={{ minWidth: 0, p: 0.5, fontSize: 16 }}
                  >
                    {ch}
                  </Button>
                ))}
              </Box>
            </Popover>
            <ToolbarDivider />
            <ToolbarButton title="Suchen & Ersetzen" onClick={() => setFindReplaceOpen(true)}>
              <FindReplaceIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarButton title="Datum/Uhrzeit einfügen" onClick={insertDateTime}>
              <AccessTimeIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarButton title="Drucken" onClick={handlePrint}>
              <PrintIcon fontSize="small" />
            </ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton title="Formatierung entfernen" onClick={() => editor?.chain().focus().clearNodes().unsetAllMarks().run()}>
              <FormatClearIcon fontSize="small" />
            </ToolbarButton>
          </Box>
          <Box
            sx={{
              p: 1.5,
              minHeight: 80,
              flex: fullscreen ? 1 : undefined,
              overflow: fullscreen ? 'auto' : undefined,
              cursor: 'text',
              '& .ProseMirror': { outline: 'none' },
              '& a': { color: '#428bca' },
              '& img': { maxWidth: '100%', borderRadius: 1 },
              '& blockquote': { borderLeft: '3px solid #ccc', pl: 2, ml: 0, color: '#666', fontStyle: 'italic' },
              '& hr': { border: 'none', borderTop: '1px solid #ddd', my: 2 },
              '& mark': { borderRadius: '2px', px: '2px' },
              '& table': { borderCollapse: 'collapse', width: '100%', my: 1 },
              '& td, & th': { border: '1px solid #ccc', padding: '6px 8px', position: 'relative' },
              '& th': { bgcolor: '#f5f5f5', fontWeight: 600 },
            }}
            onClick={() => editor?.commands.focus()}
          >
            <EditorContent editor={editor} />
          </Box>
        </Box>
        </Box>
      )}
      {!htmlMode && helperText && (
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
          {helperText}
        </Typography>
      )}

      <Dialog open={findReplaceOpen} onClose={() => setFindReplaceOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Suchen & Ersetzen</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Suchen" value={findText} onChange={(e) => setFindText(e.target.value)} fullWidth autoFocus />
          <TextField label="Ersetzen durch" value={replaceText} onChange={(e) => setReplaceText(e.target.value)} fullWidth />
          <Typography variant="caption" color="text.secondary">
            Ersetzt alle Vorkommen im HTML-Text (keine einzelne Navigation wie "weitersuchen").
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFindReplaceOpen(false)}>Abbrechen</Button>
          <Button variant="contained" onClick={handleReplaceAll} disabled={!findText}>Alle ersetzen</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
