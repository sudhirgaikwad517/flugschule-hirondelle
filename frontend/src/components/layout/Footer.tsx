import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';
import { useState } from 'react';

export const Footer = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [tandemNewsletter, setTandemNewsletter] = useState(false);

  const [statusMsg, setStatusMsg] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (!newsletter && !tandemNewsletter) {
      setStatusMsg('Bitte wählen Sie mindestens einen Newsletter aus.');
      return;
    }
    try {
      if (newsletter) {
        await fetch('/api/newsletters/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, listType: 'GENERAL' })
        });
      }
      if (tandemNewsletter) {
        await fetch('/api/newsletters/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, listType: 'TANDEM' })
        });
      }
      setStatusMsg('Erfolgreich abonniert!');
      setEmail('');
      setName('');
    } catch (err) {
      setStatusMsg('Fehler beim Abonnieren');
    }
  };

  return (
    <footer className="bg-[#111] text-white pt-24 pb-8 font-luxurysans print:hidden">
      <div className="container mx-auto px-8 max-w-[1400px]">
        
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-24">
          
          {/* Left: Branding & Kontakt */}
          <div className="w-full md:w-1/3">
            <div className="bg-white px-8 py-3 rounded-2xl inline-flex items-center justify-center mb-8 shadow-md">
              <img src="/logo.svg" alt="Flugschule Hirondelle" className="h-14 w-56 object-contain" />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed font-light mb-8 max-w-sm">
              Die 1988 gegründete Flugschule Hirondelle ist eine der führenden Gleitschirmschulen im Herzen Deutschlands. Wir bieten moderne Ausbildung und exklusiven Zugang zu den besten Fluggebieten, um Sie in einer idyllischen Umgebung unter unberührtem Himmel in ein wahres Flugerlebnis eintauchen zu lassen.
            </p>
            <h3 className="font-luxury text-xl mb-4 text-white/80">Kontakt</h3>
            <div className="text-sm text-gray-400 leading-relaxed font-light space-y-1 mb-8">
              <p>E-Mail: info@flugschule-hirondelle.de</p>
              <p>Tel: +49 6201 12345</p>
              <p>Fax: +49 6201 12346</p>
              <p>Weinheim, 69469, Deutschland</p>
            </div>
            {/* Social Icons (Only FB and YT as per original) */}
            <div className="flex gap-4">
              <a href="#" className="text-white hover:text-luxury-gold transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="text-white hover:text-luxury-gold transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
              </a>
            </div>
          </div>

          {/* Center: Quick Links (Matching exactly the original right section) */}
          <div className="w-full md:w-1/3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 text-sm text-gray-400 font-light">
              <Link to="/" className="hover:text-luxury-gold transition-colors">Home</Link>
              <Link to="/ausbildung" className="hover:text-luxury-gold transition-colors">Ausbildung</Link>
              <Link to="/infos/wetter" className="hover:text-luxury-gold transition-colors">Wetter</Link>
              <Link to="/infos/team" className="hover:text-luxury-gold transition-colors">Team</Link>
              <Link to="/infos#kontakt" className="hover:text-luxury-gold transition-colors">Kontakt</Link>
              
              <Link to="/reisen" className="hover:text-luxury-gold transition-colors">Reisen</Link>
              <Link to="/shop" className="hover:text-luxury-gold transition-colors">Shop</Link>
              <Link to="/infos/medien" className="hover:text-luxury-gold transition-colors">Medien</Link>
              <Link to="/ausbildung#tandem" className="hover:text-luxury-gold transition-colors">Tandem</Link>
              <Link to="/impressum" className="hover:text-luxury-gold transition-colors">Impressum</Link>
              
              <Link to="/buchungskalender" className="hover:text-luxury-gold transition-colors">Kalender</Link>
              <Link to="/service#2-jahres-check" className="hover:text-luxury-gold transition-colors">Checks</Link>
              <Link to="/infos/gelaende" className="hover:text-luxury-gold transition-colors">Gelände</Link>
              <Link to="/faq" className="hover:text-luxury-gold transition-colors">FAQ</Link>
              <Link to="/datenschutz" className="hover:text-luxury-gold transition-colors">Datenschutzerklärung</Link>
            </div>
          </div>

          {/* Right: Newsletter (Matching exactly the original left section) */}
          <div className="w-full md:w-1/3">
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="flex flex-col gap-2 mb-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-400 font-light hover:text-white transition-colors">
                  <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} className="w-3 h-3 bg-transparent border-white/40" />
                  Newsletter
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-400 font-light hover:text-white transition-colors">
                  <input type="checkbox" checked={tandemNewsletter} onChange={(e) => setTandemNewsletter(e.target.checked)} className="w-3 h-3 bg-transparent border-white/40" />
                  Tandemflüge Newsletter
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white text-black p-2 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">E-Mail</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white text-black p-2 outline-none"
                  required
                />
              </div>

              <div className="flex items-start gap-3 mt-6">
                <input type="checkbox" id="privacy" className="w-4 h-4 mt-1 bg-transparent border-white/40" required />
                <label htmlFor="privacy" className="text-xs text-gray-400 font-light leading-snug">
                  Ich akzeptiere die <Link to="/agb" className="font-bold underline hover:text-white transition-colors">Allgemeinen Geschäftsbedingungen</Link> und die <Link to="/datenschutz" className="font-bold underline hover:text-white transition-colors">Datenschutzerklärung</Link>
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 bg-white/10 hover:bg-luxury-gold transition-colors text-white text-xs font-bold uppercase tracking-widest py-3 text-center">
                  Abonnieren
                </button>
              </div>
              
              {statusMsg && (
                <div className="mt-2 text-sm text-luxury-gold font-bold">
                  {statusMsg}
                </div>
              )}
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-[11px] uppercase tracking-widest font-semibold text-white/60">
          <div className="flex gap-6 mb-4 md:mb-0">
            <Link to="/datenschutz" className="hover:text-white transition-colors">DATENSCHUTZ</Link>
            <Link to="/impressum" className="hover:text-white transition-colors">IMPRESSUM</Link>
            <Link to="/agb" className="hover:text-white transition-colors">AGB</Link>
          </div>
          <div className="normal-case tracking-normal font-light text-sm text-gray-500">
            &copy; Copyright Flugschule Hirondelle. Alle Rechte vorbehalten.
          </div>
        </div>

      </div>
    </footer>
  );
};
