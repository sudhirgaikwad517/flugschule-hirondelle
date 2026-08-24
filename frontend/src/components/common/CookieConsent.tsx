import React, { useState, useEffect } from 'react';

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show after a slight delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 w-[calc(100%-2rem)] md:w-[450px] bg-white rounded-lg shadow-2xl z-[9999] border border-gray-100 p-6 flex flex-col font-sans">
      <h3 className="text-[16px] font-semibold text-gray-800 mb-3">Hinweis zum Datenschutz</h3>
      
      <p className="text-[13px] text-gray-600 leading-relaxed mb-4">
        Wir verwenden Cookies und ähnliche Technologien, um Ihre Präferenzen zu
        speichern, die Effektivität unserer Kampagnen zu messen und nicht
        persönliche Daten zu analysieren, um die Leistung unserer Website zu
        verbessern. Indem Sie „Akzeptieren“ auswählen, erklären Sie sich mit der
        Verwendung aller Cookies einverstanden. Um Ihre Cookie-Einstellungen
        festzulegen, klicken Sie auf „Cookie-Einstellungen“. Sie können Ihre Cookie-
        Einstellungen jederzeit unter „Mein Konto“ → „Cookie-Einverständnis“ oder
        unten auf der Website ändern.
      </p>
      
      <a href="#" className="text-[13px] text-[#53a8c7] hover:underline mb-6 inline-block">
        Lesen Sie unsere Datenschutzrichtlinie.
      </a>
      
      <div className="flex gap-4 mb-4">
        <button 
          onClick={handleAccept}
          className="flex-1 border border-gray-300 rounded-sm py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Akzeptieren
        </button>
        <button 
          onClick={handleDecline}
          className="flex-1 border border-gray-300 rounded-sm py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Ablehnen
        </button>
      </div>
      
      <div className="text-center">
        <button className="text-[13px] text-[#53a8c7] hover:underline">
          Cookie-Einstellungen
        </button>
      </div>
    </div>
  );
};
