import React, { useState, useEffect } from 'react';

interface Ticket {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface EventBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  initialQuantities?: Record<string, number>;
}

export const EventBookingModal: React.FC<EventBookingModalProps> = ({ isOpen, onClose, event, initialQuantities = {} }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [bookingStatus, setBookingStatus] = useState('PENDING');
  
  const [formData, setFormData] = useState({
    salutation: 'Bitte wählen',
    fullName: '',
    birthDate: '',
    sizeWeight: '',
    phone: '',
    email: '',
    street: '',
    zip: '',
    city: '',
    remarks: '',
    paymentMethod: 'Bitte auswählen'
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      
      // Calculate initial price to see if it's free
      let initialPrice = 0;
      if (event?.tickets) {
        Object.entries(initialQuantities).forEach(([ticketId, qty]) => {
          const ticket = event.tickets.find((t: Ticket) => t.id === ticketId);
          initialPrice += (ticket ? ticket.price * qty : 0);
        });
      }

      setFormData({
        salutation: 'Bitte wählen',
        fullName: '',
        birthDate: '',
        sizeWeight: '',
        phone: '',
        email: '',
        street: '',
        zip: '',
        city: '',
        remarks: '',
        paymentMethod: initialPrice === 0 ? 'Kostenlos' : 'Bitte auswählen'
      });
    }
  }, [isOpen, event, initialQuantities]);

  if (!isOpen || !event) return null;

  const totalPrice = Object.entries(initialQuantities).reduce((total, [ticketId, qty]) => {
    const ticket = event.tickets?.find((t: Ticket) => t.id === ticketId);
    return total + (ticket ? ticket.price * qty : 0);
  }, 0);

  const totalTickets = Object.values(initialQuantities).reduce((a, b) => a + b, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (formData.salutation === 'Bitte wählen' || !formData.fullName || !formData.birthDate || !formData.sizeWeight || !formData.phone || !formData.email || !formData.street || !formData.zip || !formData.city) {
        alert("Bitte füllen Sie alle Pflichtfelder aus.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (formData.paymentMethod === 'Bitte auswählen') {
        alert("Bitte wählen Sie eine Zahlungsmethode aus.");
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const items = Object.entries(initialQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([ticketId, qty]) => ({ ticketId, quantity: qty }));

    try {
      const payload = {
        eventId: event.id,
        items,
        totalPrice,
        customerDetails: {
          salutation: formData.salutation,
          fullName: formData.fullName,
          birthDate: formData.birthDate,
          sizeWeight: formData.sizeWeight,
          phone: formData.phone,
          email: formData.email,
          street: formData.street,
          zip: formData.zip,
          city: formData.city
        },
        paymentMethod: formData.paymentMethod,
        remarks: formData.remarks
      };

      const res = await fetch('http://localhost:5555/api/bookings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setBookingId(data.id.split('-')[0].toUpperCase()); // Shortened display ID
        setBookingStatus(data.status);
        setStep(4);
      } else {
        alert("Fehler bei der Buchung. Bitte versuchen Sie es später erneut.");
      }
    } catch (error) {
      alert("Fehler bei der Buchung. Bitte überprüfen Sie Ihre Verbindung.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white max-w-4xl w-full rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header matching the event details style */}
        <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-start relative">
          <div>
            <h2 className="font-luxury text-3xl text-luxury-dark mb-2 tracking-wide uppercase">{event.title}</h2>
            <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              {new Date(event.start || event.startDate).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })}
              {event.end && event.end !== event.start ? ` bis ${new Date(event.end || event.endDate).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })}` : ''}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-luxury-dark transition-colors text-3xl leading-none"
            title="Schließen"
          >
            &times;
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between relative max-w-2xl mx-auto">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gray-200 -z-10 -translate-y-1/2"></div>
            <div className={`absolute top-1/2 left-0 h-[2px] bg-luxury-gold -z-10 -translate-y-1/2 transition-all duration-500`} style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>

            {/* Steps */}
            {[
              { num: 1, label: 'Anmeldung' },
              { num: 2, label: 'Bezahlung' },
              { num: 3, label: 'Buchung' }
            ].map(s => (
              <div key={s.num} className="flex flex-col items-center bg-gray-50 px-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-colors duration-300 ${
                  step === s.num || (step === 4 && s.num === 3) ? 'bg-luxury-gold text-white' : (step > s.num ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-500')
                }`}>
                  {s.num}
                </div>
                <span className={`text-sm ${step >= s.num ? 'text-luxury-dark font-semibold' : 'text-gray-500'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto flex-1 bg-white">
          
          {step === 1 && (
            <form onSubmit={handleNextStep}>
              
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-sm">
                <p className="text-red-700 text-sm font-semibold mb-2">Hinweis: Buchungen auf Warteliste sind ebenfalls verbindlich. Manchmal können wir euch die Teilnahme erst kurzfristig bestätigen. Wenn ihr nicht könnt, bitte bis spätestens 3 Tage vor dem Kurs Wartelistenbuchung absagen. Andernfalls müssen wir euch den Kurspreis berechnen.</p>
                <p className="text-gray-600 text-xs leading-relaxed">Wir empfehlen zur Absicherung für Stornos / Absagen den Abschluss einer Seminarversicherung bzw. für unsere mehrtätigen Kurse / Reisen zusätzlich eine Reiseversicherung. Diese kann auch nach Buchung abgeschlossen werden. Infos dazu findet ihr auf unserer Seite sowie in eurer Buchungsbestätigung, die ihr nach Buchungsabschluss per E-Mail erhaltet.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Anrede *</label>
                  <select 
                    name="salutation" 
                    value={formData.salutation} 
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-white"
                    required
                  >
                    <option value="Bitte wählen">Bitte wählen</option>
                    <option value="Herr">Herr</option>
                    <option value="Frau">Frau</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Vorname Nachname *</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Geburtsdatum *</label>
                    <input type="text" placeholder="TT.MM.JJJJ" name="birthDate" value={formData.birthDate} onChange={handleInputChange} required className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Größe in cm / Gewicht in kg *</label>
                    <input type="text" name="sizeWeight" value={formData.sizeWeight} onChange={handleInputChange} required className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Telefon / Mobil *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">E-Mail *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold" />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 mt-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Straße *</label>
                  <input type="text" name="street" value={formData.street} onChange={handleInputChange} required className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold mb-6" />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Postleitzahl *</label>
                      <input type="text" name="zip" value={formData.zip} onChange={handleInputChange} required className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Ort *</label>
                      <input type="text" name="city" value={formData.city} onChange={handleInputChange} required className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 mt-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Bemerkung / Gutscheincode</label>
                  <textarea name="remarks" value={formData.remarks} onChange={handleInputChange} rows={4} className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold resize-none" />
                </div>
              </div>

              <div className="flex justify-end mt-8 border-t border-gray-200 pt-6">
                <button 
                  type="submit"
                  className="px-10 py-3 bg-[#5bc0de] text-white hover:bg-[#46b8da] transition-colors rounded-sm shadow-sm"
                >
                  Weiter
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleNextStep} className="max-w-2xl mx-auto flex flex-col h-full min-h-[400px]">
              <div className="flex-1 space-y-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Zahlungsmethode<span className="text-gray-500 font-normal"> Eine der Optionen muss ausgewählt sein.</span>
                  </label>
                  <select 
                    name="paymentMethod" 
                    value={formData.paymentMethod} 
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-white"
                    required
                  >
                    {totalPrice === 0 ? (
                      <option value="Kostenlos">Kostenlos (0,00 €)</option>
                    ) : (
                      <>
                        <option value="Bitte auswählen">Bitte auswählen</option>
                        <option value="Gutschein">Gutschein</option>
                        <option value="Überweisung">Überweisung</option>
                        <option value="Barzahlung">Barzahlung vor Ort</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Anzahl</label>
                  <input 
                    type="text" 
                    value={totalTickets} 
                    disabled 
                    className="w-full p-2.5 border border-gray-300 rounded-sm bg-gray-50 text-gray-700" 
                  />
                  {event.title?.toUpperCase().includes('TENERIFFA') && (
                    <p className="text-gray-600 text-xs mt-2 italic">* Die Veranstaltung ist ausgebucht - Ihre Buchung wird auf der Warteliste vermerkt.</p>
                  )}
                </div>
              </div>

              <div className="mt-12 flex justify-end">
                <div className="text-right w-full">
                  <p className="text-gray-600 mb-4">Gesamtpreis: € {totalPrice.toFixed(2)}</p>
                  <div className="flex justify-end gap-4 border-t border-gray-200 pt-4">
                    <button 
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors rounded-sm shadow-sm"
                    >
                      Zurück
                    </button>
                    <button 
                      type="submit"
                      className="px-8 py-2 bg-[#5bc0de] text-white hover:bg-[#46b8da] transition-colors rounded-sm shadow-sm"
                    >
                      Weiter
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="max-w-3xl mx-auto flex flex-col h-full min-h-[400px]">
              
              <div className="flex-1 space-y-8">
                {/* User Data Box */}
                <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
                  <div className="p-6">
                    <h3 className="font-luxury text-2xl text-luxury-dark mb-6">Bestätigung</h3>
                    
                    <div className="grid grid-cols-[1fr_2fr] gap-y-3 text-[13px]">
                      <div className="font-semibold text-gray-700">Anrede</div>
                      <div className="text-gray-600">{formData.salutation}</div>
                      
                      <div className="font-semibold text-gray-700">Vorname Nachname</div>
                      <div className="text-gray-600">{formData.fullName}</div>
                      
                      <div className="font-semibold text-gray-700">Geburtsdatum</div>
                      <div className="text-gray-600">{formData.birthDate}</div>
                      
                      <div className="font-semibold text-gray-700">Größe in cm / Gewicht in kg</div>
                      <div className="text-gray-600">{formData.sizeWeight}</div>
                      
                      <div className="font-semibold text-gray-700">Telefon / Mobil</div>
                      <div className="text-gray-600">{formData.phone}</div>
                      
                      <div className="font-semibold text-gray-700">E-Mail</div>
                      <div className="text-gray-600">{formData.email}</div>
                      
                      <div className="font-semibold text-gray-700">Straße</div>
                      <div className="text-gray-600">{formData.street}</div>
                      
                      <div className="font-semibold text-gray-700">Postleitzahl</div>
                      <div className="text-gray-600">{formData.zip}</div>
                      
                      <div className="font-semibold text-gray-700">Ort</div>
                      <div className="text-gray-600">{formData.city}</div>
                      
                      <div className="font-semibold text-gray-700">Bemerkung / Gutscheincode</div>
                      <div className="text-gray-600">{formData.remarks || '-'}</div>
                    </div>
                  </div>
                </div>

                {/* Price Box */}
                <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
                  <div className="p-6">
                    <div className="grid grid-cols-[1fr_auto] gap-y-4 text-sm mb-6 border-b border-gray-100 pb-6">
                      <div className="font-semibold text-gray-700">Anzahl</div>
                      <div className="font-semibold text-gray-700 text-right">Gesamtpreis</div>
                      
                      <div className="text-gray-600">{totalTickets}</div>
                      <div className="text-gray-600 text-right">€ {totalPrice.toFixed(2)}</div>
                    </div>
                    
                    <div className="grid grid-cols-[1fr_auto] gap-y-4 text-sm">
                      <div className="font-semibold text-gray-700 text-right">Gesamt</div>
                      <div className="font-semibold text-gray-700 text-right w-24">€ {totalPrice.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                {/* AGB Toggle */}
                <div className="flex items-center gap-4 mt-6">
                  <button 
                    type="button"
                    onClick={() => setAgbAccepted(!agbAccepted)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${agbAccepted ? 'bg-[#5bc0de]' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${agbAccepted ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <span className="text-sm text-[#5bc0de] font-semibold cursor-pointer" onClick={() => setAgbAccepted(!agbAccepted)}>
                    Ich akzeptiere die AGB.
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-12 flex justify-end">
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors rounded-sm shadow-sm"
                  >
                    Zurück
                  </button>
                  <button 
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !agbAccepted}
                    className="px-8 py-2 bg-[#5bc0de] text-white hover:bg-[#46b8da] disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-sm shadow-sm"
                  >
                    {isSubmitting ? 'Wird gebucht...' : 'Zahlungspflichtig buchen'}
                  </button>
                </div>
              </div>

            </div>
          )}

          {step === 4 && (
            <div className="max-w-3xl mx-auto flex flex-col h-full min-h-[400px]">
              
              {/* Alert Banner */}
              {event.title?.toUpperCase().includes('TENERIFFA') ? (
                <div className="bg-[#dff0d8] border border-[#d6e9c6] text-[#3c763d] p-4 rounded-sm mb-8 flex justify-between items-center">
                  <span>Ihre Buchung war erfolgreich! Da die maximale Teilnehmerzahl bereits erreicht war, wurden Sie auf die Warteliste gesetzt.</span>
                  <button onClick={onClose} className="text-[#3c763d] hover:opacity-70 font-bold">&times;</button>
                </div>
              ) : (
                <div className="bg-[#dff0d8] border border-[#d6e9c6] text-[#3c763d] p-4 rounded-sm mb-8 flex justify-between items-center">
                  <span>Ihre Buchung war erfolgreich!</span>
                  <button onClick={onClose} className="text-[#3c763d] hover:opacity-70 font-bold">&times;</button>
                </div>
              )}

              {/* Event Booking Details */}
              <div className="mb-12">
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4">Ihre Buchungsdetails</h3>
                <div className="grid grid-cols-[1fr_2fr] gap-y-1 text-sm text-gray-700">
                  <div className="text-gray-500">Veranstaltung</div>
                  <div className="text-[#5bc0de]">{event.title}</div>
                  
                  <div className="text-gray-500">Buchungs-ID</div>
                  <div>{bookingId}</div>
                  
                  <div className="text-gray-500">Beginn</div>
                  <div>{new Date(event.start || event.startDate).toLocaleString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                  
                  <div className="text-gray-500">Ende</div>
                  <div>{event.end ? new Date(event.end || event.endDate).toLocaleString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}</div>
                  
                  <div className="text-gray-500">Status</div>
                  <div>{bookingStatus === 'WAITLIST' ? 'Buchung auf Warteliste' : 'Buchung bestätigt'}</div>
                  
                  <div className="text-gray-500">Ihre Gebühren</div>
                  <div>€ {totalPrice.toFixed(2)}</div>
                  
                  <div className="text-gray-500">Zahlungsmethode</div>
                  <div>{formData.paymentMethod}</div>
                  
                  <div className="text-gray-500">Ihr Zahlungsstatus</div>
                  <div>Offen</div>
                </div>
              </div>

              {/* User Booking Details */}
              <div className="mb-12">
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4">Ihre Buchungsdetails</h3>
                <div className="grid grid-cols-[1fr_2fr] gap-y-1 text-sm text-gray-700">
                  <div className="text-gray-500">Anrede</div>
                  <div>{formData.salutation}</div>
                  
                  <div className="text-gray-500">Vorname Nachname</div>
                  <div>{formData.fullName}</div>
                  
                  <div className="text-gray-500">Geburtsdatum</div>
                  <div>{formData.birthDate}</div>
                  
                  <div className="text-gray-500">Gewicht in kg</div>
                  <div>{formData.sizeWeight}</div>
                  
                  <div className="text-gray-500">Telefon / Mobil</div>
                  <div>{formData.phone}</div>
                  
                  <div className="text-gray-500">E-Mail</div>
                  <div>{formData.email}</div>
                  
                  <div className="text-gray-500">Straße</div>
                  <div>{formData.street}</div>
                  
                  <div className="text-gray-500">Postleitzahl</div>
                  <div>{formData.zip}</div>
                  
                  <div className="text-gray-500">Ort</div>
                  <div>{formData.city}</div>
                  
                  <div className="text-gray-500">Bemerkung / Gutscheincode</div>
                  <div>{formData.remarks}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-200 pt-6">
                <button 
                  onClick={() => window.print()}
                  className="w-full py-2 mb-4 border border-gray-300 text-[#5bc0de] hover:bg-gray-50 transition-colors rounded-sm text-sm"
                >
                  Drucken
                </button>
                <div className="flex gap-4">
                  <button 
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded-sm text-sm"
                  >
                    Kalender-Datei
                  </button>
                  <button 
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded-sm text-sm"
                  >
                    Buchung stornieren
                  </button>
                  <div className="flex-1"></div>
                  <button 
                    onClick={onClose}
                    className="px-8 py-2 bg-luxury-gold text-white hover:bg-opacity-90 transition-colors rounded-sm text-sm"
                  >
                    Schließen
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};
