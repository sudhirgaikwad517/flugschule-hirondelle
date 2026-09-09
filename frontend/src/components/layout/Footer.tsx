import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const Footer = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [tandemNewsletter, setTandemNewsletter] = useState(false);

  const [statusMsg, setStatusMsg] = useState('');

  // Mirrors Header.tsx's exact auth-state pattern (same localStorage keys
  // and 'auth-change' event) - not a new/separate auth mechanism, just
  // reflecting the same login state to show Log out / Log in like the
  // reference footer does next to the Subscribe button.
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };
    loadUser();
    window.addEventListener('storage', loadUser);
    window.addEventListener('auth-change', loadUser);
    return () => {
      window.removeEventListener('storage', loadUser);
      window.removeEventListener('auth-change', loadUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    window.dispatchEvent(new Event('auth-change'));
  };

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

  const NAV_LINKS = [
    { to: '/', label: 'Home' },
    { to: '/ausbildung', label: 'Ausbildung' },
    { to: '/infos/wetter', label: 'Wetter' },
    { to: '/infos/team', label: 'Team' },
    { to: '/infos#kontakt', label: 'Kontakt' },
    { to: '/reisen', label: 'Reisen' },
    { to: '/shop', label: 'Shop' },
    { to: '/infos/medien', label: 'Medien' },
    { to: '/ausbildung#tandem', label: 'Tandem' },
    { to: '/impressum', label: 'Impressum' },
    { to: '/buchungskalender', label: 'Kalender' },
    { to: '/service#2-jahres-check', label: 'Checks' },
    { to: '/infos/gelaende', label: 'Gelände' },
    { to: '/faq', label: 'FAQ' },
    { to: '/datenschutz', label: 'Datenschutzerklärung' },
  ];

  return (
    <footer
      className="text-white pt-14 pb-10 font-luxurysans print:hidden"
      style={{ background: 'linear-gradient(180deg, #4FA8C7 0%, #2B6E86 100%)' }}
    >
      <div className="container mx-auto px-6 md:px-10 max-w-[1400px]">
        <div className="flex flex-col md:flex-row gap-12 md:gap-16">

          {/* Left: Newsletter signup + account */}
          <div className="w-full md:w-[38%]">
            <form onSubmit={handleSubscribe}>
              <div className="flex flex-col gap-2 mb-5">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-white font-light">
                  <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} className="w-3.5 h-3.5 accent-white" />
                  Newsletter
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-white font-light">
                  <input type="checkbox" checked={tandemNewsletter} onChange={(e) => setTandemNewsletter(e.target.checked)} className="w-3.5 h-3.5 accent-white" />
                  Tandemflüge Newsletter
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-white mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white text-black text-sm p-2 outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-white mb-1">E-Mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white text-black text-sm p-2 outline-none"
                  required
                />
              </div>

              <div className="flex items-start gap-2 mb-5">
                <input type="checkbox" id="privacy" className="w-3.5 h-3.5 mt-0.5 accent-white" required />
                <label htmlFor="privacy" className="text-xs text-white font-light leading-snug">
                  Ich akzeptiere die <Link to="/agb" className="underline hover:text-luxury-gold transition-colors">Allgemeinen Geschäftsbedingungen</Link> und die <Link to="/datenschutz" className="underline hover:text-luxury-gold transition-colors">Datenschutzerklärung</Link>.
                </label>
              </div>

              <div className="flex items-center gap-5">
                <button type="submit" className="bg-white/15 hover:bg-white/25 transition-colors text-white text-sm font-medium px-6 py-2.5">
                  Abonnieren
                </button>
                {isLoggedIn ? (
                  <button type="button" onClick={handleLogout} className="text-sm text-white/90 hover:text-white transition-colors">
                    Abmelden
                  </button>
                ) : (
                  <Link to="/anmeldung" className="text-sm text-white/90 hover:text-white transition-colors">
                    Anmelden
                  </Link>
                )}
              </div>

              {statusMsg && (
                <div className="mt-3 text-sm text-luxury-gold font-bold">
                  {statusMsg}
                </div>
              )}
            </form>
          </div>

          {/* Right: bird emblem, nav link grid, social icons */}
          <div className="w-full md:w-[62%] flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-white/50"></div>
              <div className="w-14 h-14 rounded-full border-2 border-white overflow-hidden flex-shrink-0">
                {/* google.png's own blue circle sits too close in tone to
                    this footer's own blue gradient to read clearly - visually
                    confirmed low-contrast. bird-badge.png recolors the same
                    source silhouette (region-classified by luminance, not a
                    plain filter) to a white circle with the bird in the
                    brand's own blue accent (matches the swallow tint already
                    used in logo.svg), which reads crisply against this
                    background instead of nearly disappearing into it. */}
                <img src="/bird-badge.png" alt="Flugschule Hirondelle" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 h-px bg-white/50"></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-6 gap-y-3 text-sm font-light mb-8">
              {NAV_LINKS.map((link) => (
                <Link key={link.to} to={link.to} className="underline hover:text-luxury-gold transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white/50"></div>
              <div className="flex gap-3">
                <a href="#" aria-label="Facebook" className="w-8 h-8 rounded-full border border-white flex items-center justify-center hover:bg-white/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z"/></svg>
                </a>
                <a href="#" aria-label="YouTube" className="w-8 h-8 rounded-full border border-white flex items-center justify-center hover:bg-white/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.56A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14C4.5 20.5 12 20.5 12 20.5s7.5 0 9.38-.56a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/></svg>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};
