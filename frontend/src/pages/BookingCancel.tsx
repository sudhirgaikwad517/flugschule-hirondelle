import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export const BookingCancel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-sm shadow-xl max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <XCircle className="w-20 h-20 text-red-500" />
        </div>
        
        <h1 className="font-luxury text-3xl text-luxury-dark mb-4">Zahlung abgebrochen</h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Ihre Zahlung wurde abgebrochen. Ihre Buchung bleibt vorerst bestehen, ist jedoch nicht abgeschlossen. Bitte versuchen Sie es erneut oder wählen Sie eine andere Zahlungsmethode.
        </p>

        <div className="space-y-4">
          <button 
            onClick={() => navigate(-1)}
            className="block w-full py-3 bg-luxury-gold text-white font-semibold rounded-sm hover:bg-[#aa883e] transition-colors"
          >
            Zurück zur Kasse
          </button>
          <Link 
            to="/buchungskalender"
            className="block w-full py-3 border border-gray-300 text-gray-700 font-semibold rounded-sm hover:bg-gray-50 transition-colors"
          >
            Zurück zum Kalender
          </Link>
        </div>
      </div>
    </div>
  );
};
