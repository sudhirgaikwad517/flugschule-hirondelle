import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export const BookingSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-sm shadow-xl max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>

        <h1 className="font-luxury text-3xl text-luxury-dark mb-4">Vielen Dank!</h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          Ihre Buchung und Zahlung waren erfolgreich. Sie erhalten in Kürze eine Bestätigungs-E-Mail mit allen Details.
        </p>

        <div className="space-y-4">
          <Link
            to="/"
            className="block w-full py-3 bg-luxury-gold text-white font-semibold rounded-sm hover:bg-[#aa883e] transition-colors"
          >
            Zurück zur Startseite
          </Link>
          <button
            onClick={() => navigate('/buchungskalender')}
            className="block w-full py-3 border border-gray-300 text-gray-700 font-semibold rounded-sm hover:bg-gray-50 transition-colors"
          >
            Weitere Termine ansehen
          </button>
        </div>
      </div>
    </div>
  );
};
