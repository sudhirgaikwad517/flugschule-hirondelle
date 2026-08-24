import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banner } from '../components/common/Banner';

export const Profil = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      navigate('/anmeldung', { replace: true });
    }
  }, [navigate]);

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

        <div className="bg-white border border-gray-100 p-8 md:p-12 rounded-sm shadow-xl w-full max-w-2xl text-center">
          <h2 className="text-2xl font-luxury text-gray-800 mb-4">Willkommen!</h2>
          <p className="text-gray-600">
            Ihr Profilbereich wird derzeit überarbeitet. Bald finden Sie hier Ihre Buchungshistorie und können Ihre Daten verwalten.
          </p>
        </div>
      </div>
    </div>
  );
};
