import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { Download, Calendar, Pencil, X } from 'lucide-react';

export const Profil = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

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

  useEffect(() => {
    if (!token) {
      setIsAuthenticated(false);
      navigate('/anmeldung', { replace: true });
      return;
    }
    loadBookings();
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

                        {(customer.firstName || customer.email) && (
                          <p className="text-gray-500 text-sm mt-2">
                            <span className="font-semibold">Kontakt:</span> {customer.firstName} {customer.lastName}
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
                <input className="border border-gray-300 rounded-sm px-3 py-2 text-sm" placeholder="Vorname" value={editForm.firstName || ''} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} />
                <input className="border border-gray-300 rounded-sm px-3 py-2 text-sm" placeholder="Nachname" value={editForm.lastName || ''} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} />
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
