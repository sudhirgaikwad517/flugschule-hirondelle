import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { SafeHtml } from '../components/common/SafeHtml';
import { Eye, Download, ArrowLeft } from 'lucide-react';

// Old's real "Datenanzeige im Frontend" tab (visform-frontend-details) -
// a logged-in submitter's own past entries for this form (`allowfedv` +
// the always-on, non-subscription "own records only" behavior - see
// serviceorders.routes.ts's /my-submissions). Every column-visibility
// toggle here (displayId/displayCreated(Time)/displayIp/displayModifiedAt
// (Time)/displayIsModified) is real, deep-verified against the same real,
// non-AEF-gated XML fields.

type DisplayMode = '0' | '1' | '2' | '3'; // None / Both / List only / Detail only
const showInList = (m: DisplayMode) => m === '1' || m === '2';
const showInDetail = (m: DisplayMode) => m === '1' || m === '3';
// `image` is a real <input type="image"> submit button (deep-verified),
// not a photo/file upload field - carries no data, same as submit/reset/fieldsep.
const STRUCTURAL_TYPES = new Set(['submit', 'reset', 'fieldsep', 'image']);

const FORM_ID = 'service-auftrag';

interface FieldDef { id: string; label: string; type: string; order: number; frontDisplay?: DisplayMode }

const formatValue = (field: FieldDef, raw: any): string => {
  if (field.type === 'checkbox') return raw ? 'Ja' : 'Nein';
  if (field.type === 'multicheckbox') return Array.isArray(raw) ? raw.join(', ') : String(raw ?? '-');
  if (field.type === 'file') return raw ? String(raw) : '-';
  return String(raw ?? '-');
};
interface FrontendSettings {
  allowFrontendDataView: boolean;
  displayIp: DisplayMode;
  displayId: DisplayMode;
  displayCreated: DisplayMode;
  displayCreatedTime: DisplayMode;
  displayModifiedAt: DisplayMode;
  displayModifiedAtTime: DisplayMode;
  displayIsModified: DisplayMode;
  displayDetail: boolean;
  detailTitle: string;
  detailLinkIcon: 'download' | 'eye';
  listTitle: string;
  listDescription: string;
}

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('de-DE');
const fmtDateTime = (iso: string) => new Date(iso).toLocaleString('de-DE');

export const MeineEintraege = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [settings, setSettings] = useState<FrontendSettings | null>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!token) {
      navigate('/anmeldung', { replace: true });
      return;
    }
    fetch(`/api/serviceorders/my-submissions/${FORM_ID}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          const body = await res.json().catch(() => ({}));
          if (res.status === 401) { navigate('/anmeldung', { replace: true }); return null; }
          setError(body.message || 'Diese Ansicht ist für dieses Formular nicht aktiviert.');
          return null;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (!json) return;
        setFormTitle(json.form?.title || '');
        setFields([...(json.form?.fields || [])].sort((a: FieldDef, b: FieldDef) => a.order - b.order));
        setSettings(json.form?.settings?.frontend || null);
        setOrders(json.orders || []);
      })
      .catch(() => setError('Fehler beim Laden Ihrer Einträge.'))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  const DetailIcon = settings?.detailLinkIcon === 'download' ? Download : Eye;
  // Old's real per-field "Frontend-Anzeige" toggle (visfields list) drives
  // this, not a hardcoded slice of the field list.
  const listFields = fields.filter((f) => !STRUCTURAL_TYPES.has(f.type) && showInList(f.frontDisplay || '0'));

  return (
    <div className="w-full bg-white font-luxurysans pb-20">
      <Banner />
      <section className="pt-16 md:pt-24 pb-16 md:pb-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1200px]">
          <div className="max-w-4xl mb-10">
            <p className="text-luxury-heading uppercase tracking-[0.2em] text-xs font-semibold mb-3">SERVICE</p>
            <h1 className="font-luxury text-4xl md:text-5xl text-luxury-dark uppercase mb-6">
              {settings?.listTitle || 'Meine Einträge'}
            </h1>
            <div className="w-24 h-px bg-luxury-gold mb-8"></div>
            {settings?.listDescription && (
              <SafeHtml html={settings.listDescription} className="text-gray-600 font-light leading-relaxed text-[15px]" />
            )}
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500">Wird geladen...</div>
          ) : error ? (
            <div className="text-center py-16 text-gray-500">{error}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 text-gray-500">Sie haben noch keine Einträge für {formTitle || 'dieses Formular'} übermittelt.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                  <tr>
                    {settings && showInList(settings.displayId) && <th className="px-5 py-3">ID</th>}
                    {listFields.map((f) => (
                      <th key={f.id} className="px-5 py-3">{f.label}</th>
                    ))}
                    {settings && showInList(settings.displayCreated) && <th className="px-5 py-3">Erstellt am</th>}
                    {settings && showInList(settings.displayIp) && <th className="px-5 py-3">IP-Adresse</th>}
                    {settings?.displayDetail && <th className="px-5 py-3"></th>}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-t border-gray-100 hover:bg-gray-50/60 transition-colors">
                      {settings && showInList(settings.displayId) && <td className="px-5 py-3 text-gray-500">{o.id.slice(0, 8)}</td>}
                      {listFields.map((f) => (
                        <td key={f.id} className="px-5 py-3 text-gray-700">{formatValue(f, o.data?.[f.id])}</td>
                      ))}
                      {settings && showInList(settings.displayCreated) && (
                        <td className="px-5 py-3 text-gray-500">
                          {showInList(settings.displayCreatedTime) ? fmtDateTime(o.createdAt) : fmtDate(o.createdAt)}
                        </td>
                      )}
                      {settings && showInList(settings.displayIp) && <td className="px-5 py-3 text-gray-500">{o.ip || '-'}</td>}
                      {settings?.displayDetail && (
                        <td className="px-5 py-3 text-right">
                          <RouterLink
                            to={`/service/${FORM_ID}/meine-eintraege/${o.id}`}
                            className="inline-flex items-center gap-1 text-[#53a8c7] hover:text-[#4396b5]"
                          >
                            <DetailIcon size={16} />
                          </RouterLink>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export const MeineEintraegeDetail = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      navigate('/anmeldung', { replace: true });
      return;
    }
    fetch(`/api/serviceorders/my-submissions/${FORM_ID}/${orderId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (res.status === 401) { navigate('/anmeldung', { replace: true }); return null; }
        if (!res.ok) { setError('Eintrag nicht gefunden.'); return null; }
        return res.json();
      })
      .then((json) => {
        if (!json) return;
        setFormTitle(json.form?.settings?.frontend?.detailTitle || json.form?.title || '');
        setFields([...(json.form?.fields || [])].sort((a: FieldDef, b: FieldDef) => a.order - b.order));
        setOrder(json.order);
      })
      .catch(() => setError('Fehler beim Laden des Eintrags.'))
      .finally(() => setLoading(false));
  }, [token, orderId, navigate]);

  return (
    <div className="w-full bg-white font-luxurysans pb-20">
      <Banner />
      <section className="pt-16 md:pt-24 pb-16 md:pb-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1200px]">
          <RouterLink to={`/service/${FORM_ID}/meine-eintraege`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8">
            <ArrowLeft size={16} /> Zurück zur Übersicht
          </RouterLink>

          {loading ? (
            <div className="text-center py-20 text-gray-500">Wird geladen...</div>
          ) : error ? (
            <div className="text-center py-16 text-gray-500">{error}</div>
          ) : (
            <div className="max-w-3xl">
              <h1 className="font-luxury text-3xl md:text-4xl text-luxury-dark uppercase mb-6">{formTitle}</h1>
              <div className="w-24 h-px bg-luxury-gold mb-8"></div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] divide-y divide-gray-100">
                {fields.filter((f) => !STRUCTURAL_TYPES.has(f.type) && showInDetail(f.frontDisplay || '0')).map((f) => (
                  <div key={f.id} className="flex flex-col sm:flex-row gap-1 sm:gap-8 px-6 py-4">
                    <div className="sm:w-1/3 text-sm text-gray-500">{f.label}</div>
                    <div className="sm:w-2/3 text-gray-800">
                      {f.type === 'file' && order.data?.[f.id] ? (
                        <a href={order.data[f.id]} target="_blank" rel="noopener noreferrer" className="text-[#53a8c7] underline">Datei ansehen</a>
                      ) : formatValue(f, order.data?.[f.id])}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
