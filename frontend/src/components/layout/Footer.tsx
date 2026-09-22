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

  // Admin-managed (Admin > Menü > Footer tab) - was a hardcoded NAV_LINKS
  // array here (Home, Reisen, Kalender, Ausbildung, Shop, Checks, Wetter,
  // Medien, Gelände, Team, Tandem, FAQ, Kontakt, Impressum,
  // Datenschutzerklärung), now fetched from the same MenuItem model as the
  // header nav (see menu.routes.ts, MenuItem.location === 'footer').
  const [footerLinks, setFooterLinks] = useState<{ id: string; label: string; url: string; target: string }[]>([]);

  useEffect(() => {
    fetch('/api/footerlinks/public')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setFooterLinks(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

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
                <label className="flex items-center gap-2 cursor-pointer text-sm text-white font-semibold">
                  <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} className="w-3.5 h-3.5 accent-white" />
                  Newsletter
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-white font-semibold">
                  <input type="checkbox" checked={tandemNewsletter} onChange={(e) => setTandemNewsletter(e.target.checked)} className="w-3.5 h-3.5 accent-white" />
                  Tandemflüge Newsletter
                </label>
              </div>

              <div className="mb-4 max-w-xs">
                <label className="block text-sm text-white font-semibold mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white text-black text-sm p-2 outline-none"
                />
              </div>

              <div className="mb-4 max-w-xs">
                <label className="block text-sm text-white font-semibold mb-1">E-Mail</label>
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
                <label htmlFor="privacy" className="text-xs text-white font-semibold leading-snug">
                  Ich akzeptiere die <Link to="/agb" className="underline hover:text-luxury-gold transition-colors">Allgemeinen Geschäftsbedingungen</Link> und die <Link to="/datenschutz" className="underline hover:text-luxury-gold transition-colors">Datenschutzerklärung</Link>.
                </label>
              </div>

              <div className="flex items-center gap-5">
                <button type="submit" className="bg-white/15 hover:bg-white/25 transition-colors text-white text-sm font-medium px-6 py-2.5">
                  Abonnieren
                </button>
                {isLoggedIn ? (
                  <button type="button" onClick={handleLogout} className="text-sm font-medium text-white/90 hover:text-white transition-colors">
                    Abmelden
                  </button>
                ) : (
                  <Link to="/anmeldung" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
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
              <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                {/* Old site's actual icotitleslide.png (white ring + swallow
                    silhouette, no fill) - same asset as the header's HOME
                    icon and the banner caption, for one consistent bird
                    mark across the site instead of the ad-hoc bird-badge.png. */}
                <img src="/icotitleslide.png" alt="Flugschule Hirondelle" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 h-px bg-white/50"></div>
            </div>

            {/* 5 columns filled top-to-bottom then next column (grid-flow-col
                + grid-rows-3), matching the live site's real footer sitemap
                exactly: column 1 is Home/Reisen/Kalender, column 2 is
                Ausbildung/Shop/Checks, and so on - not a left-to-right,
                row-by-row fill, which regroups the same 15 links wrong. */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 md:grid-rows-3 md:grid-flow-col gap-x-6 gap-y-3 text-sm font-semibold mb-8">
              {footerLinks.map((link) => {
                const linkProps = link.target === '_blank' ? { target: '_blank', rel: 'noopener noreferrer' } : {};
                return (
                  <Link key={link.id} to={link.url} className="underline hover:text-luxury-gold transition-colors whitespace-nowrap" {...linkProps}>
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white/50"></div>
              <div className="flex gap-3">
                <a href="https://www.facebook.com/fshirondelle" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-full border border-white flex items-center justify-center hover:bg-white/10 transition-colors">
                  {/* Plain "f" glyph, not the self-contained circular
                      facebook badge path - that one already draws its own
                      outer ring, which doubled up with this wrapper's own
                      border into a nested-circle look. */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396z"/></svg>
                </a>
                <a href="https://www.youtube.com/channel/UCOwo0Wh2zoX_7nyArBdk_IQ/videos" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-8 h-8 rounded-full border border-white flex items-center justify-center hover:bg-white/10 transition-colors">
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
