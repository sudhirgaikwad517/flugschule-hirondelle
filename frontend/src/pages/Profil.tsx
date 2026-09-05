import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { Download, Calendar, Pencil, X, User as UserIcon, Lock } from 'lucide-react';

const ACCOUNT_FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'phone', label: 'Telefon / Mobil' },
  { key: 'address1', label: 'Adresse (Straße, Nr.)' },
  { key: 'location', label: 'Ort' },
  { key: 'postalCode', label: 'PLZ' },
  { key: 'country', label: 'Land' },
  { key: 'birthDate', label: 'Geburtsdatum' },
  { key: 'weight', label: 'Gewicht (kg)' },
];

export const Profil = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const [account, setAccount] = useState<any>(null);
  const [accountForm, setAccountForm] = useState<any>({});
  const [accountLoading, setAccountLoading] = useState(true);
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountMessage, setAccountMessage] = useState<string | null>(null);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const token = localStorage.getItem('token');

  const loadBookings = () => {
    setLoading(true);
    fetch('/api/bookings/my-bookings', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setBookings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const loadAccount = () => {
    setAccountLoading(true);
    fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setAccount(data);
        setAccountForm(data);
        setAccountLoading(false);
      })
      .catch(err => {
        console.error(err);
        setAccountLoading(false);
      });
  };

  const saveAccount = async () => {
    setAccountSaving(true);
    setAccountMessage(null);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(accountForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Fehler beim Speichern');
      setAccount(data);
      setAccountForm(data);
      setAccountMessage('Ihre Daten wurden gespeichert.');
    } catch (error: any) {
      setAccountMessage(error.message || 'Fehler beim Speichern der Daten.');
    } finally {
      setAccountSaving(false);
    }
  };

  const savePassword = async () => {
    setPasswordMessage(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ text: 'Die neuen Passwörter stimmen nicht überein.', error: true });
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await fetch('/api/auth/me/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Fehler beim Ändern des Passworts');
      setPasswordMessage({ text: 'Passwort erfolgreich geändert.' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (error: any) {
      setPasswordMessage({ text: error.message || 'Fehler beim Ändern des Passworts.', error: true });
    } finally {
      setPasswordSaving(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setIsAuthenticated(false);
      navigate('/anmeldung', { replace: true });
      return;
    }
    loadBookings();
    loadAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleDownload = async (bookingId: string, type: 'invoice' | 'ticket') => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/${type}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Download failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type === 'invoice' ? 'Rechnung' : 'Ticket'}_${bookingId.split('-')[0].toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Fehler beim Herunterladen der Datei.');
    }
  };

  const openEdit = (booking: any) => {
    setEditingBooking(booking);
    setEditForm(booking.customerDetails || {});
  };

  const closeEdit = () => {
    setEditingBooking(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingBooking) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/bookings/${editingBooking.id}/my-details`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Fehler beim Speichern');
      }
      closeEdit();
      loadBookings();
    } catch (error: any) {
      alert(error.message || 'Fehler beim Speichern der Details.');
    } finally {
      setSaving(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!window.confirm('Möchten Sie diese Buchung wirklich stornieren?')) return;
    setCancellingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Fehler beim Stornieren');
      }
      loadBookings();
    } catch (error: any) {
      alert(error.message || 'Fehler beim Stornieren der Buchung.');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Bestätigt</span>;
      case 'PENDING': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Ausstehend</span>;
      case 'WAITLIST': return <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">Warteliste</span>;
      case 'CANCELLED': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Storniert</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="w-full bg-[#FAF9F7] pb-20 min-h-screen">
      <Banner />

      <div className="container mx-auto px-4 py-8 max-w-[1200px] flex flex-col items-center">
        {/* Main Title */}
        <div className="text-center mb-12 mt-8 w-full">
          <h1 className="font-luxury text-4xl md:text-5xl lg:text-6xl text-luxury-dark mb-6 tracking-wide uppercase">
            MEIN PROFIL
          </h1>
          <div className="w-24 h-px bg-luxury-gold mx-auto"></div>
        </div>

        <div className="bg-white border border-gray-100 p-8 md:p-12 rounded-sm shadow-xl w-full max-w-4xl mb-10">
          <h2 className="text-2xl font-luxury text-gray-800 mb-6 flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-luxury-gold" /> Meine Kontodaten
          </h2>

          {accountLoading ? (
            <p className="text-gray-600 py-4">Lade Kontodaten...</p>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">E-Mail</label>
                <input
                  className="w-full border border-gray-200 bg-gray-50 rounded-sm px-3 py-2 text-sm text-gray-500"
                  value={account?.email || ''}
                  disabled
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {ACCOUNT_FIELDS.map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{f.label}</label>
                    <input
                      className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-luxury-gold"
                      value={accountForm[f.key] || ''}
                      onChange={e => setAccountForm({ ...accountForm, [f.key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>

              {accountMessage && (
                <p className="text-sm mb-4 text-luxury-gold font-semibold">{accountMessage}</p>
              )}

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={saveAccount}
                  disabled={accountSaving}
                  className="px-6 py-2.5 bg-luxury-gold hover:bg-[#aa883e] text-white rounded-sm text-sm font-semibold disabled:opacity-50 transition-colors"
                >
                  {accountSaving ? 'Speichere...' : 'Daten speichern'}
                </button>
                <button
                  onClick={() => setShowPasswordForm(v => !v)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-sm text-sm font-semibold transition-colors"
                >
                  <Lock className="w-4 h-4" /> Passwort ändern
                </button>
              </div>

              {showPasswordForm && (
                <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="password"
                    placeholder="Aktuelles Passwort"
                    className="border border-gray-300 rounded-sm px-3 py-2 text-sm"
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                  <input
                    type="password"
                    placeholder="Neues Passwort"
                    className="border border-gray-300 rounded-sm px-3 py-2 text-sm"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                  <input
                    type="password"
                    placeholder="Neues Passwort bestätigen"
                    className="border border-gray-300 rounded-sm px-3 py-2 text-sm"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                  <div className="md:col-span-3 flex items-center gap-4">
                    <button
                      onClick={savePassword}
                      disabled={passwordSaving}
                      className="px-6 py-2.5 bg-luxury-dark hover:bg-luxury-gold text-white rounded-sm text-sm font-semibold disabled:opacity-50 transition-colors"
                    >
                      {passwordSaving ? 'Speichere...' : 'Passwort speichern'}
                    </button>
                    {passwordMessage && (
                      <p className={`text-sm font-semibold ${passwordMessage.error ? 'text-red-600' : 'text-luxury-gold'}`}>{passwordMessage.text}</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-white border border-gray-100 p-8 md:p-12 rounded-sm shadow-xl w-full max-w-4xl">
          <h2 className="text-2xl font-luxury text-gray-800 mb-6">Meine Buchungen</h2>

          {loading ? (
            <p className="text-gray-600 text-center py-8">Lade Buchungen...</p>
          ) : bookings.length === 0 ? (
            <p className="text-gray-600 text-center py-8">Sie haben noch keine Buchungen vorgenommen.</p>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking: any) => {
                const canModify = booking.status === 'CONFIRMED' || booking.status === 'PENDING';
                const customer = booking.customerDetails || {};
                return (
                  <div key={booking.id} className="border border-gray-200 rounded-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">{booking.event.title}</h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        <p className="text-gray-600 text-sm mb-1 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(booking.event.startDate).toLocaleDateString('de-DE')} - {new Date(booking.event.endDate).toLocaleDateString('de-DE')}
                        </p>
                        <p className="text-gray-500 text-sm">Buchungs-ID: {booking.id.split('-')[0].toUpperCase()}</p>

                        {booking.items && booking.items.length > 0 && (
                          <ul className="text-gray-600 text-sm mt-2 list-disc list-inside">
                            {booking.items.map((item: any) => (
                              <li key={item.id}>
                                {item.quantity}x {item.ticket?.name}{item.ticket?.price ? ` (à ${item.ticket.price.toFixed(2)} €)` : ''}
                              </li>
                            ))}
                          </ul>
                        )}

                        <p className="text-gray-500 text-sm mt-2">
                          <span className="font-semibold">Gesamtpreis:</span> {booking.totalPrice.toFixed(2)} €
                        </p>

                        {(customer.fullName || customer.name || customer.email) && (
                          <p className="text-gray-500 text-sm mt-2">
                            <span className="font-semibold">Kontakt:</span> {customer.fullName || customer.name}
                            {customer.email ? ` · ${customer.email}` : ''}
                            {customer.phone ? ` · ${customer.phone}` : ''}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-row md:flex-col gap-3">
                        {canModify && (
                          <>
                            <button
                              onClick={() => handleDownload(booking.id, 'invoice')}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-sm text-sm font-semibold transition-colors"
                            >
                              <Download className="w-4 h-4" /> Rechnung (PDF)
                            </button>

                            {booking.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleDownload(booking.id, 'ticket')}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-luxury-gold hover:bg-[#aa883e] text-white rounded-sm text-sm font-semibold transition-colors"
                              >
                                <Download className="w-4 h-4" /> Ticket (PDF)
                              </button>
                            )}

                            <button
                              onClick={() => openEdit(booking)}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-sm text-sm font-semibold transition-colors"
                            >
                              <Pencil className="w-4 h-4" /> Details bearbeiten
                            </button>

                            <button
                              onClick={() => cancelBooking(booking.id)}
                              disabled={cancellingId === booking.id}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-sm text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                              <X className="w-4 h-4" /> {cancellingId === booking.id ? 'Storniere...' : 'Stornieren'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {editingBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Kontaktdaten bearbeiten</h3>
              <button onClick={closeEdit} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <select className="border border-gray-300 rounded-sm px-3 py-2 text-sm" value={editForm.salutation || 'Bitte wählen'} onChange={e => setEditForm({ ...editForm, salutation: e.target.value })}>
                  <option>Bitte wählen</option>
                  <option>Herr</option>
                  <option>Frau</option>
                  <option>Divers</option>
                </select>
                <input className="border border-gray-300 rounded-sm px-3 py-2 text-sm" placeholder="Name" value={editForm.fullName || ''} onChange={e => setEditForm({ ...editForm, fullName: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" className="border border-gray-300 rounded-sm px-3 py-2 text-sm" placeholder="Geburtsdatum" value={editForm.birthDate ? String(editForm.birthDate).slice(0, 10) : ''} onChange={e => setEditForm({ ...editForm, birthDate: e.target.value })} />
                <input className="border border-gray-300 rounded-sm px-3 py-2 text-sm" placeholder="Größe/Gewicht" value={editForm.sizeWeight || ''} onChange={e => setEditForm({ ...editForm, sizeWeight: e.target.value })} />
              </div>
              <input className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm" placeholder="E-Mail" value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
              <input className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm" placeholder="Telefon" value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
              <input className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm" placeholder="Straße" value={editForm.street || ''} onChange={e => setEditForm({ ...editForm, street: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input className="border border-gray-300 rounded-sm px-3 py-2 text-sm" placeholder="PLZ" value={editForm.zip || ''} onChange={e => setEditForm({ ...editForm, zip: e.target.value })} />
                <input className="border border-gray-300 rounded-sm px-3 py-2 text-sm" placeholder="Stadt" value={editForm.city || ''} onChange={e => setEditForm({ ...editForm, city: e.target.value })} />
              </div>
              <input className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm" placeholder="Land" value={editForm.country || ''} onChange={e => setEditForm({ ...editForm, country: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={closeEdit} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800">Abbrechen</button>
              <button onClick={saveEdit} disabled={saving} className="px-4 py-2 bg-luxury-gold hover:bg-[#aa883e] text-white rounded-sm text-sm font-semibold disabled:opacity-50">
                {saving ? 'Speichere...' : 'Speichern'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
