import React, { useState } from 'react';
import { Banner } from '../components/common/Banner';
import { KeyRound } from 'lucide-react';

import { useNavigate, useSearchParams } from 'react-router-dom';

export const Anmeldung = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address1, setAddress1] = useState('');
  const [locationStr, setLocationStr] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [weight, setWeight] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!isLogin) {
      if (!name || !username || !email || !password || !confirmPassword || !address1 || !locationStr || !country || !postalCode || !phone || !weight || !birthDate) {
        setErrorMsg('Bitte füllen Sie alle Pflichtfelder aus.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Die Passwörter stimmen nicht überein.');
        return;
      }
      if (!termsAccepted) {
        setErrorMsg('Sie müssen den Nutzungsbedingungen zustimmen.');
        return;
      }
    } else {
      if (!email || !password) {
        setErrorMsg('Bitte füllen Sie alle Pflichtfelder aus.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin 
        ? { email, password } 
        : { name, username, email, password, address1, location: locationStr, country, postalCode, phone, weight, birthDate };
      
      const res = await fetch(`${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('auth-change'));
        navigate(redirectUrl);
      } else {
        setErrorMsg(data.message || 'Authentifizierung fehlgeschlagen.');
      }
    } catch (err) {
      setErrorMsg('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#FAF9F7] pb-20 min-h-screen">
      <Banner />

      <div className="container mx-auto px-4 py-8 max-w-[1200px] flex flex-col items-center">
        {/* Main Title */}
        <div className="text-center mb-12 mt-8 w-full">
          <h1 className="font-luxury text-4xl md:text-5xl lg:text-6xl text-luxury-dark mb-6 tracking-wide uppercase">
            {isLogin ? 'LOGIN' : 'REGISTRIEREN'}
          </h1>
          <div className="w-24 h-px bg-luxury-gold mx-auto"></div>
        </div>

        <div className={`w-full flex flex-col gap-8 ${isLogin ? 'max-w-2xl' : ''}`}>
          
          {/* Login Form Box */}
          <div className="bg-white border border-gray-100 p-8 md:p-12 rounded-sm shadow-xl">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              {errorMsg && (
                <div className="bg-red-50 text-red-500 p-4 rounded-sm text-sm border border-red-200">
                  {errorMsg}
                </div>
              )}

              {!isLogin && (
                <>
                  <div className="border-b border-gray-200 pb-2 mb-2">
                    <h3 className="text-lg font-luxury text-gray-800">Benutzerregistrierung</h3>
                    <p className="text-xs text-gray-500">* Pflichtfeld</p>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] text-gray-700 font-semibold">Vorname Nachname *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] text-gray-700 font-semibold">Benutzername *</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold" />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] text-gray-700 font-semibold">Passwort * <span className="text-xs font-normal text-gray-500 ml-2">Mindestanzahl an Zeichen: 4</span></label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold" />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] text-gray-700 font-semibold">Passwort bestätigen *</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold" />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] text-gray-700 font-semibold">E-Mail-Adresse *</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold" />
                  </div>

                  <div className="border-b border-gray-200 pb-2 mb-2 mt-4">
                    <h3 className="text-lg font-luxury text-gray-800">Benutzerprofil</h3>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] text-gray-700 font-semibold">Adresse 1 *</label>
                    <input type="text" value={address1} onChange={(e) => setAddress1(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] text-gray-700 font-semibold">Ort *</label>
                    <input type="text" value={locationStr} onChange={(e) => setLocationStr(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] text-gray-700 font-semibold">Land *</label>
                    <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] text-gray-700 font-semibold">Postleitzahl *</label>
                    <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] text-gray-700 font-semibold">Telefon *</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] text-gray-700 font-semibold">Gewicht in kg *</label>
                    <input type="text" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] text-gray-700 font-semibold">Geboren am *</label>
                    <input type="text" placeholder="TT.MM.JJJJ" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold" />
                    <span className="text-xs text-gray-500">Tag.Monat.Jahr (z.B. 01.12.1980)</span>
                  </div>

                  <div className="border-b border-gray-200 pb-2 mb-2 mt-4">
                    <h3 className="text-lg font-luxury text-gray-800">Nutzungsbedingungen</h3>
                  </div>
                  
                  <div className="bg-[#e9f5f9] p-4 text-sm text-[#31708f] rounded-sm mb-4">
                    Mit der Registrierung auf dieser Website akzeptieren Sie die Nutzungsbedingungen.
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] text-gray-700 font-semibold mb-2">Ich habe die Nutzungsbedingungen und die Datenschutzrichtlinie gelesen und stimme ihnen zu. *</label>
                    <div className="flex items-center gap-2 ml-4">
                      <input type="radio" id="agree" name="terms" checked={termsAccepted} onChange={() => setTermsAccepted(true)} className="accent-[#337ab7]" />
                      <label htmlFor="agree" className="text-sm text-gray-700">Ich stimme zu</label>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <input type="radio" id="disagree" name="terms" checked={!termsAccepted} onChange={() => setTermsAccepted(false)} className="accent-[#337ab7]" />
                      <label htmlFor="disagree" className="text-sm text-gray-700">Ich stimme nicht zu</label>
                    </div>
                  </div>
                </>
              )}

              {isLogin && (
                <>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-[13px] text-gray-500 uppercase tracking-widest font-semibold flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                      E-Mail Adresse *
                    </label>
                    <input 
                      type="email" 
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border-b bg-transparent py-3 text-[15px] font-light text-gray-800 outline-none transition-colors border-gray-300 focus:border-luxury-gold"
                    />
                  </div>

                  <div className="flex flex-col gap-2 mt-4">
                    <label htmlFor="password" className="text-[13px] text-gray-500 uppercase tracking-widest font-semibold">
                      Passwort *
                    </label>
                    <input 
                      type="password" 
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border-b border-gray-300 bg-transparent py-3 text-[15px] font-light text-gray-800 outline-none focus:border-luxury-gold transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <input 
                      type="checkbox" 
                      id="remember" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-luxury-gold border-gray-300 rounded focus:ring-luxury-gold accent-luxury-gold"
                    />
                    <label htmlFor="remember" className="text-[14px] text-gray-500 font-light cursor-pointer select-none">
                      Angemeldet bleiben
                    </label>
                  </div>
                </>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-8 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm text-center disabled:opacity-50"
                >
                  {isLoading ? 'LÄDT...' : (isLogin ? 'LOGIN' : 'REGISTRIEREN')}
                </button>

                {isLogin && (
                  <button 
                    type="button"
                    className="w-full sm:w-auto px-8 py-3 bg-luxury-slate hover:bg-luxury-dark text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm flex items-center justify-center gap-3"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    PASSKEY VERWENDEN
                  </button>
                )}
              </div>

            </form>
          </div>

          {/* Additional Links Box */}
          <div className="bg-white border border-gray-100 p-8 rounded-sm shadow-sm flex flex-col gap-4 items-center">
            <a href="#" className="text-[13px] text-gray-500 font-light hover:text-luxury-gold transition-colors text-center">
              Passwort vergessen?
            </a>
            <div className="w-12 h-px bg-gray-200"></div>
            <a href="#" className="text-[13px] text-gray-500 font-light hover:text-luxury-gold transition-colors text-center">
              E-Mail Adresse vergessen?
            </a>
            <div className="w-12 h-px bg-gray-200"></div>
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg('');
              }}
              className="text-[13px] text-luxury-gold font-semibold hover:text-luxury-dark transition-colors text-center uppercase tracking-widest"
            >
              {isLogin ? 'Noch kein Benutzerkonto erstellt? Registrieren' : 'Bereits registriert? Login'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
