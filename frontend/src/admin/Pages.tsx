import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmailEditor from 'react-email-editor';
import { useNotify } from 'react-admin';
import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// "Seiten" - the CMS feature that lets an admin create an entirely new page
// from scratch (title, URL slug, description, header image, content) that
// goes live at its own URL with no code change - unlike PageContent/
// PageGallery/PageMedia (Komponenten group) which only edit EXISTING
// hardcoded pages. The body is authored with the same Unlayer drag-and-drop
// editor used for the AcyMailing newsletter templates (see
// frontend/src/admin/AcyMailing/Templates.tsx for the reference
// implementation this mirrors) via the `react-email-editor` package, run in
// `displayMode: 'web'` (div/flex-based responsive HTML) rather than
// 'email' (table-based) since this renders on a live webpage, not in an
// email client. `body` stores the exported HTML actually shown on the
// public page; `design` stores Unlayer's own JSON so a saved page can be
// reloaded into the editor for further edits.
//
// This is a bespoke screen (plain fetch, not react-admin's data provider/
// <Edit>/<Create>) because the Unlayer widget needs to fill the whole
// screen and doesn't fit react-admin's per-field <Input> model - same
// reasoning as AcyTemplates.tsx. Registered as a CustomRoute at /admin/pages
// in AdminApp.tsx (not a <Resource list/edit/create>). To revert: delete
// this file, its CustomRoutes entry in AdminApp.tsx, and its sidebar entry
// in CustomMenu.tsx.

// Kept in sync with backend/src/data/reservedSlugs.ts - every top-level
// static path segment App.tsx's router already uses. A page created with
// one of these slugs would be silently unreachable (shadowed by the
// existing static route), so it's rejected here AND on the backend.
const RESERVED_SLUGS = new Set([
  'news', 'downloads', 'partner', 'search', 'events', 'ausbildung', 'performance',
  'reisen', 'buchungskalender', 'tandem', 'service', 'infos', 'agb',
  'widerrufsbelehrung', 'faq', 'datenschutz', 'impressum', 'bewertung',
  'veranstaltungsorte', 'veranstaltungsort', 'veranstalter', 'shop', 'anmeldung',
  'profil', 'booking-success', 'booking-cancel', 'newsletter', 'admin',
]);

const normalizeSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Unlayer's exportHtml gives back a full document whose <head><style> block
// is the ONLY thing that makes .u-row/.u-col-* actually lay out as columns
// (display:flex + flex-basis percentages) - but that <style> tag never
// survives DOMPurify's sanitization on the public page (confirmed: even
// ADD_TAGS: ['style'] doesn't let it through), so saving just doc.body.
// innerHTML silently collapses every multi-column row to one column.
// Fix: mount the exported HTML for real (style tag included) in a hidden
// node attached to the live document, so the browser actually computes the
// layout, then copy the resulting display/flex-basis/max-width/width onto
// each row/column as an inline style="..." attribute - which DOES survive
// DOMPurify, since it's just a normal HTML attribute. This is necessarily a
// desktop-viewport snapshot: Unlayer's own mobile-stacking @media query
// can't be preserved this way, only the resulting property VALUES at
// today's admin-browser width, but that's still a large improvement over
// the columns not showing side-by-side at all.
const inlineUnlayerLayoutCss = (html: string): string => {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const styleText = Array.from(doc.head.querySelectorAll('style')).map((s) => s.textContent || '').join('\n');

    const tempStyle = document.createElement('style');
    tempStyle.textContent = styleText;
    document.head.appendChild(tempStyle);

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-99999px';
    container.style.top = '0';
    container.style.width = '1200px';
    container.innerHTML = doc.body.innerHTML;
    document.body.appendChild(container);

    container.querySelectorAll('.u-row').forEach((rowEl) => {
      const cs = getComputedStyle(rowEl);
      (rowEl as HTMLElement).style.display = cs.display;
      (rowEl as HTMLElement).style.flexWrap = 'wrap'; // let narrow viewports wrap instead of squeezing columns
      const rowWidth = (rowEl as HTMLElement).offsetWidth || 1;
      rowEl.querySelectorAll(':scope > .u-col').forEach((colEl) => {
        const pct = (((colEl as HTMLElement).offsetWidth / rowWidth) * 100).toFixed(4) + '%';
        (colEl as HTMLElement).style.flex = `1 1 ${pct}`;
        (colEl as HTMLElement).style.maxWidth = pct;
      });
    });

    const result = container.innerHTML;
    document.body.removeChild(container);
    document.head.removeChild(tempStyle);
    return result;
  } catch (e) {
    console.error('Failed to inline Unlayer layout CSS, saving as-is', e);
    try {
      return new DOMParser().parseFromString(html, 'text/html').body.innerHTML;
    } catch {
      return html;
    }
  }
};

interface PageRow {
  id: string;
  title: string;
  slug: string;
  metaDescription?: string | null;
  headerImageUrl?: string | null;
  body?: string | null;
  design?: string | null;
  status: string;
  showInNav: boolean;
  navLabel?: string | null;
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

// A 401/403 (expired/invalid token) was showing up as a generic "Fehler
// beim Duplizieren"/"...Löschen" with no indication the real problem was
// just needing to log back in - this makes that case say so explicitly,
// falling back to the backend's own error/message field otherwise.
const describeApiError = (res: Response, data: any, fallback: string): string => {
  if (res.status === 401 || res.status === 403) return 'Sitzung abgelaufen - bitte neu anmelden und erneut versuchen.';
  return data?.error || data?.message || fallback;
};

// The site's other main pages already have a hand-built React/Tailwind
// design (see Home.tsx, Ausbildung.tsx, etc.) and their own dedicated
// data-only editors (HomeContentEditor.tsx and siblings) - they were never
// part of the Page/Unlayer model above. Listed here too, WordPress-Pages-
// style, purely so the admin has ONE list to click into instead of hunting
// through a sidebar submenu. "Löschen" here can't remove the page itself -
// e.g. /ausbildung is a real route in App.tsx that always exists - so it
// deletes the saved customization row instead (DELETE deletePath), which
// resets the page back to its hardcoded default text/images/links.
const FIXED_PAGES = [
  { title: 'Startseite', editPath: '/admin/home-content', previewPath: '/', deletePath: '/api/homecontent/default', kind: 'home' },
  { title: 'Ausbildung', editPath: '/admin/ausbildung-content', previewPath: '/ausbildung', deletePath: '/api/sitepagecontent/ausbildung', kind: 'ausbildung' },
  { title: 'Performance', editPath: '/admin/performance-content', previewPath: '/performance', deletePath: '/api/sitepagecontent/performance', kind: 'performance' },
  { title: 'Reisen', editPath: '/admin/reisen-content', previewPath: '/reisen', deletePath: '/api/sitepagecontent/reisen', kind: 'reisen' },
  { title: 'Service', editPath: '/admin/service-content', previewPath: '/service', deletePath: '/api/sitepagecontent/service', kind: 'service' },
  { title: 'Infos / Kontakt', editPath: '/admin/infos-content', previewPath: '/infos', deletePath: '/api/sitepagecontent/infos', kind: 'infos' },
];

// The 6 fixed pages' titles are fixed German text, so a plain substring
// search would miss an admin typing the English word instead (e.g.
// "contact" for "Infos / Kontakt") - these extra terms (both languages)
// are matched in addition to the visible title/URL. Custom Seiten pages
// need no such list since their title is whatever the admin typed.
const FIXED_PAGE_SEARCH_TERMS: Record<string, string[]> = {
  home: ['home', 'startseite', 'start'],
  ausbildung: ['ausbildung', 'training', 'education', 'courses', 'schulung'],
  performance: ['performance', 'leistung'],
  reisen: ['reisen', 'travel', 'trips', 'tours', 'reise'],
  service: ['service', 'dienstleistung'],
  infos: ['infos', 'kontakt', 'info', 'contact', 'information'],
};

const textMatches = (query: string, ...values: Array<string | null | undefined>) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return values.some((v) => (v || '').toLowerCase().includes(q));
};

// A TRUE same-design duplicate of one of the 6 fixed pages above (see
// FixedPageDuplicate model / fixedPageDuplicates.routes.ts): rendered by the
// exact same hardcoded component as the original (FixedPageRouter.tsx on
// the frontend), so its design is pixel-identical - unlike "Duplizieren" on
// a custom Seiten/Unlayer page below, which copies real Unlayer blocks.
interface FixedDuplicateRow {
  id: string;
  slug: string;
  kind: string;
  title: string;
  showInNav: boolean;
  navLabel?: string | null;
}

// Live settings for one of the 6 fixed pages themselves - see
// FixedPageSettings model / fixedPageSettings.routes.ts.
interface FixedPageSettingsRow {
  kind: string;
  slug: string | null;
  title: string;
  status: string;
}

export const PagesManager = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const emailEditorRef = useRef<any>(null);

  const [pages, setPages] = useState<PageRow[]>([]);
  const [fixedDuplicates, setFixedDuplicates] = useState<FixedDuplicateRow[]>([]);
  const [fixedSettings, setFixedSettings] = useState<Record<string, FixedPageSettingsRow>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [editing, setEditing] = useState<PageRow | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugError, setSlugError] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [headerImageUrl, setHeaderImageUrl] = useState('');
  const [status, setStatus] = useState('published');
  const [showInNav, setShowInNav] = useState(true);
  const [navLabel, setNavLabel] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchPages = () => {
    setLoading(true);
    fetch('/api/pages?_start=0&_end=200', { headers: authHeaders() })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setPages(Array.isArray(data) ? data : []))
      .catch(() => notify('Fehler beim Laden der Seiten', { type: 'error' }))
      .finally(() => setLoading(false));
  };

  const fetchFixedDuplicates = () => {
    fetch('/api/fixed-page-duplicates', { headers: authHeaders() })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setFixedDuplicates(Array.isArray(data) ? data : []))
      .catch(() => notify('Fehler beim Laden der Seiten-Duplikate', { type: 'error' }));
  };

  // Live title/URL/status for the 6 fixed pages THEMSELVES (editable via
  // "Seiten-Einstellungen" in their content editors - see
  // FixedPageSettings model / fixedPageSettings.routes.ts), keyed by kind
  // so each FIXED_PAGES row can show its current values instead of the
  // hardcoded defaults once an admin has renamed/drafted one.
  const fetchFixedSettings = () => {
    fetch('/api/fixed-page-settings', { headers: authHeaders() })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const byKind: Record<string, FixedPageSettingsRow> = {};
        (Array.isArray(data) ? data : []).forEach((row: FixedPageSettingsRow) => { byKind[row.kind] = row; });
        setFixedSettings(byKind);
      })
      .catch(() => notify('Fehler beim Laden der Seiten-Einstellungen', { type: 'error' }));
  };

  useEffect(fetchPages, []);
  useEffect(fetchFixedDuplicates, []);
  useEffect(fetchFixedSettings, []);

  const openCreate = () => {
    setEditing(null);
    setTitle('');
    setSlug('');
    setSlugError('');
    setMetaDescription('');
    setHeaderImageUrl('');
    setStatus('published');
    setShowInNav(true);
    setNavLabel('');
    setIsEditorOpen(true);
  };

  const openEdit = (page: PageRow) => {
    setEditing(page);
    setTitle(page.title);
    setSlug(page.slug);
    setSlugError('');
    setMetaDescription(page.metaDescription || '');
    setHeaderImageUrl(page.headerImageUrl || '');
    setStatus(page.status);
    setShowInNav(page.showInNav);
    setNavLabel(page.navLabel || '');
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditing(null);
  };

  const onEditorLoad = () => {
    if (editing?.design) {
      try {
        emailEditorRef.current?.editor?.loadDesign(JSON.parse(editing.design));
      } catch (e) {
        console.error('Failed to parse page design JSON', e);
      }
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', headers: authHeaders(), body: formData });
      const data = await res.json();
      if (res.ok) setHeaderImageUrl(data.url);
      else notify(data.message || 'Fehler beim Upload', { type: 'warning' });
    } catch {
      notify('Netzwerkfehler beim Upload', { type: 'warning' });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleSlugBlur = () => {
    const normalized = normalizeSlug(slug || title);
    setSlug(normalized);
    setSlugError(RESERVED_SLUGS.has(normalized) ? `"${normalized}" ist reserviert und kann nicht verwendet werden.` : '');
  };

  const handleSave = () => {
    if (!title.trim()) {
      notify('Titel ist erforderlich', { type: 'warning' });
      return;
    }
    const normalizedSlug = normalizeSlug(slug || title);
    if (RESERVED_SLUGS.has(normalizedSlug)) {
      notify(`"${normalizedSlug}" ist reserviert und kann nicht verwendet werden.`, { type: 'warning' });
      return;
    }

    setSaving(true);
    emailEditorRef.current?.editor?.exportHtml(async (data: { design: any; html: string }) => {
      const { design, html } = data;
      // Unlayer's exportHtml returns a full HTML document - only the <body>
      // content is embedded into the page template (which already has its
      // own <html>/<head>/nav/footer), so pull just that out. The <head>'s
      // <style> block can't come along for the ride (DOMPurify strips any
      // <style> tag on render, even with ADD_TAGS - confirmed empirically),
      // but that block is what makes a multi-column row (.u-row/.u-col-*)
      // actually sit side-by-side instead of collapsing to one column. Fix:
      // inlineUnlayerLayoutCss below renders the exported HTML in a real,
      // hidden DOM node so the browser computes the layout for real, then
      // bakes the resulting display/flex-basis/width values onto each
      // element as inline style="..." (which DOES survive DOMPurify).
      const bodyHtml = inlineUnlayerLayoutCss(html);

      try {
        const url = editing ? `/api/pages/${editing.id}` : '/api/pages';
        const method = editing ? 'PUT' : 'POST';
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({
            title,
            slug: normalizedSlug,
            metaDescription,
            headerImageUrl,
            status,
            showInNav,
            navLabel,
            body: bodyHtml,
            design: JSON.stringify(design),
          }),
        });
        const resData = await res.json().catch(() => ({}));
        if (!res.ok) {
          notify(resData.error || 'Fehler beim Speichern', { type: 'error' });
          return;
        }
        notify('Seite gespeichert', { type: 'success' });
        closeEditor();
        fetchPages();
      } catch {
        notify('Netzwerkfehler beim Speichern', { type: 'error' });
      } finally {
        setSaving(false);
      }
    });
  };

  const handleDuplicate = async (page: PageRow) => {
    try {
      const res = await fetch(`/api/pages/${page.id}/duplicate`, { method: 'POST', headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        notify(describeApiError(res, data, 'Fehler beim Duplizieren'), { type: 'error' });
        return;
      }
      notify(`Duplikat erstellt: "${data.title}" - auf "Bearbeiten" klicken um sie umzubenennen`, { type: 'success' });
      fetchPages();
    } catch {
      notify('Netzwerkfehler beim Duplizieren', { type: 'error' });
    }
  };

  const handleDuplicateFixed = async (page: (typeof FIXED_PAGES)[number]) => {
    try {
      const res = await fetch('/api/fixed-page-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ kind: page.kind }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        notify(describeApiError(res, data, 'Fehler beim Duplizieren'), { type: 'error' });
        return;
      }
      notify(`Duplikat erstellt: "${data.title}" - mit exakt dem gleichen Design wie "${page.title}". Auf "Bearbeiten" klicken um Inhalte anzupassen oder umzubenennen.`, { type: 'success' });
      fetchFixedDuplicates();
    } catch {
      notify('Netzwerkfehler beim Duplizieren', { type: 'error' });
    }
  };

  const handleDuplicateFixedDuplicate = async (dup: FixedDuplicateRow) => {
    try {
      const res = await fetch(`/api/fixed-page-duplicates/${dup.id}/duplicate`, { method: 'POST', headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        notify(describeApiError(res, data, 'Fehler beim Duplizieren'), { type: 'error' });
        return;
      }
      notify(`Duplikat erstellt: "${data.title}" - auf "Bearbeiten" klicken um sie umzubenennen`, { type: 'success' });
      fetchFixedDuplicates();
    } catch {
      notify('Netzwerkfehler beim Duplizieren', { type: 'error' });
    }
  };

  const handleDeleteFixedDuplicate = async (dup: FixedDuplicateRow) => {
    try {
      const res = await fetch(`/api/fixed-page-duplicates/${dup.id}`, { method: 'DELETE', headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        notify(describeApiError(res, data, 'Fehler beim Löschen'), { type: 'error' });
        return;
      }
      notify('In den Papierkorb verschoben', { type: 'success' });
      fetchFixedDuplicates();
    } catch {
      notify('Netzwerkfehler beim Löschen', { type: 'error' });
    }
  };

  const handleDelete = async (page: PageRow) => {
    try {
      const res = await fetch(`/api/pages/${page.id}`, { method: 'DELETE', headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        notify(describeApiError(res, data, 'Fehler beim Löschen'), { type: 'error' });
        return;
      }
      notify('In den Papierkorb verschoben', { type: 'success' });
      fetchPages();
    } catch {
      notify('Netzwerkfehler beim Löschen', { type: 'error' });
    }
  };

  const handleResetFixedPage = async (page: (typeof FIXED_PAGES)[number]) => {
    try {
      const [contentRes, settingsRes] = await Promise.all([
        fetch(page.deletePath, { method: 'DELETE', headers: authHeaders() }),
        fetch(`/api/fixed-page-settings/${page.kind}`, { method: 'DELETE', headers: authHeaders() }),
      ]);
      const data = await contentRes.json().catch(() => ({}));
      if (!contentRes.ok) {
        notify(describeApiError(contentRes, data, 'Fehler beim Löschen'), { type: 'error' });
        return;
      }
      if (!settingsRes.ok) {
        notify('Inhalte zurückgesetzt, aber Titel/URL/Status konnten nicht zurückgesetzt werden', { type: 'warning' });
      } else {
        notify(`"${page.title}" in den Papierkorb verschoben`, { type: 'success' });
      }
      fetchFixedSettings();
    } catch {
      notify('Netzwerkfehler beim Löschen', { type: 'error' });
    }
  };

  if (isEditorOpen) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 96px)' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', bgcolor: '#fff' }}>
          <IconButton onClick={closeEditor} title="Zurück"><ArrowBackIcon /></IconButton>
          <TextField label="Titel" value={title} onChange={(e) => setTitle(e.target.value)} size="small" fullWidth={false} sx={{ width: 180 }} />
          <TextField
            label="URL"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            onBlur={handleSlugBlur}
            error={!!slugError}
            helperText={slugError || 'z.B. ueber-uns'}
            size="small"
            fullWidth={false}
            sx={{ width: 180 }}
          />
          <TextField
            label="Kurzbeschreibung"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            size="small"
            fullWidth={false}
            sx={{ width: 200 }}
          />
          <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} size="small" fullWidth={false} sx={{ width: 140 }}>
            <MenuItem value="published">Veröffentlicht</MenuItem>
            <MenuItem value="draft">Entwurf</MenuItem>
          </TextField>
          <FormControlLabel
            control={<Switch checked={showInNav} onChange={(e) => setShowInNav(e.target.checked)} />}
            label="Im Menü"
            sx={{ flexShrink: 0 }}
          />
          <TextField
            label="Menü-Beschriftung"
            value={navLabel}
            onChange={(e) => setNavLabel(e.target.value)}
            size="small"
            fullWidth={false}
            sx={{ width: 160 }}
            helperText="Leer = Titel"
          />
          <Button
            component="label"
            size="small"
            variant="outlined"
            startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />}
            disabled={uploading}
          >
            {headerImageUrl ? 'Titelbild ersetzen' : 'Titelbild hochladen'}
            <input type="file" accept="image/*" hidden onChange={handleUpload} />
          </Button>
          {headerImageUrl && <Box component="img" src={headerImageUrl} alt="" sx={{ height: 36, borderRadius: 1 }} />}
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
            Speichern
          </Button>
        </Box>
        <Box sx={{ flex: 1 }}>
          <EmailEditor
            ref={emailEditorRef}
            onLoad={onEditorLoad}
            style={{ minHeight: '100%' }}
            options={{ locale: 'de-DE', displayMode: 'web' }}
          />
        </Box>
      </Box>
    );
  }

  const filteredFixedPages = FIXED_PAGES.filter((page) => {
    const live = fixedSettings[page.kind];
    return textMatches(
      search,
      page.title,
      page.previewPath,
      live?.title,
      live?.slug ? `/${live.slug}` : null,
      ...(FIXED_PAGE_SEARCH_TERMS[page.kind] || [])
    );
  });
  const filteredFixedDuplicates = fixedDuplicates.filter((dup) =>
    textMatches(search, dup.title, `/${dup.slug}`, dup.navLabel, ...(FIXED_PAGE_SEARCH_TERMS[dup.kind] || []))
  );
  const filteredPages = pages.filter((page) => textMatches(search, page.title, page.slug, page.metaDescription, page.navLabel));
  const noResults =
    !loading &&
    !!search.trim() &&
    filteredFixedPages.length === 0 &&
    filteredFixedDuplicates.length === 0 &&
    filteredPages.length === 0;

  // One combined, paginated list (fixed pages + their duplicates + custom
  // Seiten pages) so a single "Zeilen pro Seite" control (matching
  // Gallery.tsx's react-admin pagination) covers everything, instead of
  // three separately-scrolling sections.
  type DisplayRow =
    | { key: string; rowKind: 'fixed'; page: (typeof FIXED_PAGES)[number] }
    | { key: string; rowKind: 'duplicate'; dup: FixedDuplicateRow }
    | { key: string; rowKind: 'custom'; page: PageRow };
  const allRows: DisplayRow[] = [
    ...filteredFixedPages.map((page): DisplayRow => ({ key: `fixed:${page.kind}`, rowKind: 'fixed', page })),
    ...filteredFixedDuplicates.map((dup): DisplayRow => ({ key: `dup:${dup.id}`, rowKind: 'duplicate', dup })),
    ...(loading ? [] : filteredPages.map((page): DisplayRow => ({ key: `custom:${page.id}`, rowKind: 'custom', page }))),
  ];
  const pageCount = Math.max(1, Math.ceil(allRows.length / perPage));
  const clampedPage = Math.min(page, pageCount);
  const startIdx = (clampedPage - 1) * perPage;
  const pageRows = allRows.slice(startIdx, startIdx + perPage);
  const rangeStart = allRows.length === 0 ? 0 : startIdx + 1;
  const rangeEnd = Math.min(startIdx + perPage, allRows.length);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">Seiten</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RestoreFromTrashIcon />} onClick={() => navigate('/admin/trash')}>Papierkorb</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Neue Seite</Button>
        </Box>
      </Box>
      <TextField
        placeholder="Suchen (Titel oder URL - auf Deutsch oder Englisch)"
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        size="small"
        fullWidth
        sx={{ mb: 2 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: '#999' }} />
              </InputAdornment>
            ),
          },
        }}
      />
      <Paper variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Titel</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Im Menü</TableCell>
              <TableCell align="right">Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {noResults && (
              <TableRow><TableCell colSpan={5} align="center">Keine Seiten gefunden für "{search}".</TableCell></TableRow>
            )}
            {loading && pageRows.length === 0 && (
              <TableRow><TableCell colSpan={5} align="center">Lädt...</TableCell></TableRow>
            )}
            {pageRows.map((row) => {
              if (row.rowKind === 'fixed') {
                const { page } = row;
                const live = fixedSettings[page.kind];
                const title = live?.title || page.title;
                const previewPath = live?.slug ? `/${live.slug}` : page.previewPath;
                return (
                  <TableRow key={row.key} hover onClick={() => navigate(page.editPath)} sx={{ cursor: 'pointer' }}>
                    <TableCell>{title}</TableCell>
                    <TableCell>{previewPath}</TableCell>
                    <TableCell>{live?.status === 'draft' ? 'Entwurf' : 'Veröffentlicht'}</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        size="small"
                        component="a"
                        href={previewPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Vorschau (öffnet die Seite in einem neuen Tab)"
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => navigate(page.editPath)} title="Bearbeiten">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDuplicateFixed(page)} title="Duplizieren (erstellt eine neue Seite mit exakt dem gleichen Design/Layout)">
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleResetFixedPage(page)} title="Löschen (setzt Inhalte, Titel, URL und Status auf die Standardwerte zurück)">
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              }
              if (row.rowKind === 'duplicate') {
                const { dup } = row;
                const original = FIXED_PAGES.find((p) => p.kind === dup.kind);
                const editPath = original ? `${original.editPath}/${dup.slug}` : undefined;
                return (
                  <TableRow
                    key={row.key}
                    hover
                    onClick={() => editPath && navigate(editPath)}
                    sx={{ cursor: editPath ? 'pointer' : 'default' }}
                  >
                    <TableCell>{dup.title}</TableCell>
                    <TableCell>{`/${dup.slug}`}</TableCell>
                    <TableCell>Veröffentlicht</TableCell>
                    <TableCell>{dup.showInNav ? 'Ja' : 'Nein'}</TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        size="small"
                        component="a"
                        href={`/${dup.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Vorschau (öffnet die Seite in einem neuen Tab)"
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                      {editPath && (
                        <IconButton size="small" onClick={() => navigate(editPath)} title="Bearbeiten">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton size="small" onClick={() => handleDuplicateFixedDuplicate(dup)} title="Duplizieren (erstellt eine weitere Kopie mit gleichem Design/Inhalt)">
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteFixedDuplicate(dup)} title="Löschen">
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              }
              const { page } = row;
              return (
                <TableRow key={row.key} hover onClick={() => openEdit(page)} sx={{ cursor: 'pointer' }}>
                  <TableCell>
                    {page.title}
                    {page.slug === 'home' && (
                      <Typography component="span" variant="caption" sx={{ color: '#0ea5e9', ml: 1 }}>
                        (Startseite)
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{page.slug === 'home' ? '/' : `/${page.slug}`}</TableCell>
                  <TableCell>{page.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}</TableCell>
                  <TableCell>{page.showInNav ? 'Ja' : 'Nein'}</TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      size="small"
                      component="a"
                      href={page.slug === 'home' ? '/' : `/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Vorschau (öffnet die Seite in einem neuen Tab)"
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => openEdit(page)} title="Bearbeiten">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDuplicate(page)} title="Duplizieren (erstellt eine Kopie mit gleichem Design/Inhalt)">
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(page)} title="Löschen">
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 2, px: 2, py: 1, borderTop: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: '#666' }}>Zeilen pro Seite:</Typography>
            <TextField
              select
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
              size="small"
              variant="standard"
              sx={{ width: 56 }}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </TextField>
          </Box>
          <Typography variant="body2" sx={{ color: '#666' }}>
            {rangeStart}-{rangeEnd} von {allRows.length}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton size="small" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={clampedPage <= 1}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <Box
                key={n}
                onClick={() => setPage(n)}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  bgcolor: n === clampedPage ? '#e2e8f0' : 'transparent',
                  fontWeight: n === clampedPage ? 700 : 400,
                  '&:hover': { bgcolor: '#f1f5f9' },
                }}
              >
                {n}
              </Box>
            ))}
            <IconButton size="small" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={clampedPage >= pageCount}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
