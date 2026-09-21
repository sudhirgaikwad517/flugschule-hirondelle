import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';

export const Header = () => {
  const location = useLocation();
  const pathname = location.pathname;

  // Old site's nav hover (.nav > li > a:hover, custom.css) never changes
  // text color - only a light white overlay on the item itself
  // (rgba(255,255,255,0.2)) and a barely-visible text-shadow deepening,
  // applied instantly with no transition. No color/transition here either.
  // Active items no longer get a persistent background - only bold text -
  // so hover still shows the same overlay on every item, active or not.
  const getNavClass = (path: string) => {
    const isActive = path === '/' ? pathname === '/' : pathname.startsWith(path);
    return `text-[14px] uppercase tracking-widest flex items-center gap-1 text-white pl-2.5 pr-[14px] py-1.5 rounded-md hover:bg-white/20 ${
      isActive ? 'font-bold' : 'font-normal'
    }`;
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const reisenTours = ['Brasilien', 'Kolumbien', 'Südafrika', 'Bassano', 'Griechenland', 'Slowenien', 'Bergamo', 'Savoye', 'Vogesen', 'Pfalz'];
  const reisenImages: Record<string, string> = {
    Brasilien: '/images/reisen/brasilien.jpg',
    Kolumbien: '/images/reisen/kolumbien.jpg',
    Südafrika: '/images/reisen/suedafrika.jpg',
    Bassano: '/images/reisen/bassano.jpg',
    Griechenland: '/images/reisen/griechenland.jpg',
    Slowenien: '/images/reisen/slowenien.jpg',
    Bergamo: '/images/reisen/bergamo.jpg',
    Savoye: '/images/reisen/savoye.jpg',
    Vogesen: '/images/reisen/vogesen.jpg',
    Pfalz: '/images/reisen/pfalz.jpg'
  };

  // Admin-created pages (Admin > Seiten) - fetched once so any published,
  // nav-visible page automatically appears in the "SEITEN" dropdown below
  // with no code change. Empty list -> dropdown simply doesn't render.
  const [dynamicPages, setDynamicPages] = useState<{ slug: string; title: string; navLabel?: string | null }[]>([]);

  useEffect(() => {
    fetch('/api/pages/public')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setDynamicPages(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const toggleMobileMenu = (menu: string) => {
    if (expandedMobileMenu === menu) setExpandedMobileMenu(null);
    else setExpandedMobileMenu(menu);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        setUser(JSON.parse(userStr));
      } else {
        setUser(null);
      }
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
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
    // Optional: redirect to home or login page if currently on a protected route
  };

  return (
    <header
      className="w-full fixed top-0 left-0 z-50 font-luxurysans shadow-sm print:hidden"
      style={{ background: 'linear-gradient(180deg, #4FA8C7 0%, #2B6E86 100%)' }}
    >



      {/* Main Navigation - old site's logo sits absolutely positioned over
          the banner images (see Banner.tsx), not in this bar, so there's
          no logo slot here anymore. */}
      <div
        className={`transition-colors duration-300 h-[40px] flex items-center`}
      >
        <div className="container mx-auto max-w-[1200px] px-4 md:px-8">
          <nav className="flex items-center justify-end">

            {/* Old site's nav sits inside the same centered max-w-[1200px]
                container as the logo and page content below it, with items
                spread from that container's left edge to its right edge
                (not bunched at one side) - so HOME lines up with the logo
                and content edge, matching the old site exactly. */}
            <div className="hidden xl:flex items-center justify-between w-full">

              <Link to="/" className={getNavClass('/')}>
                <span className="flex items-center justify-center">
                  H
                  {/* Old site's actual icotitleslide.png (white ring +
                      swallow silhouette, cropped tight to its own content -
                      the source file ships with ~20% transparent padding on
                      every side, which was quietly shrinking the visible
                      ring back down near text-size even at a bigger
                      container) standing in for the "O", sized clearly
                      larger than the surrounding letters and sitting close
                      to them, matching the live site. */}
                  <span className="w-7 h-7 flex items-center justify-center shrink-0">
                    <img src="/icotitleslide.png" alt="O" className="w-full h-full object-contain" />
                  </span>
                  ME
                </span>
              </Link>

              {/* Ausbildung Dropdown - plain single-column list like Infos,
                  not a full-width mega menu with promo images (those two
                  images didn't belong to any real submenu page). Item
                  order matches the live site's actual Ausbildung submenu
                  exactly (verified against its own flat menu markup):
                  Schnupperkurs, L-Schein, A-Schein, B-Schein, Winde,
                  Tandem, Ausbildungskonzept. */}
              <div className="relative group h-[40px] flex items-center">
                <Link to="/ausbildung" className={getNavClass('/ausbildung')}>
                  AUSBILDUNG <ChevronDown className="w-3 h-3" />
                </Link>
                <div className="absolute top-[40px] left-0 w-64 bg-luxury-gold border-t border-black/10 hidden group-hover:block px-0 py-4 shadow-2xl">
                  <ul className="flex flex-col">
                    <li><Link to="/ausbildung/schnupperkurs" className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">Schnupper-/Einsteigerkurs</Link></li>
                    <li><Link to="/ausbildung/l-schein" className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">L-Schein (Grundkurs)</Link></li>
                    <li><Link to="/ausbildung/a-schein" className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">A-Schein</Link></li>
                    <li><Link to="/ausbildung/b-schein" className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">B-Schein</Link></li>
                    <li><Link to="/ausbildung/windenschein" className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">Winde</Link></li>
                    <li><Link to="/ausbildung/tandemschein" className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">Tandem</Link></li>
                    <li><Link to="/ausbildung/ausbildungskonzept" className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">Ausbildungskonzept</Link></li>
                  </ul>
                </div>
              </div>

              {/* Performance Dropdown */}
              <div className="relative group h-[40px] flex items-center">
                <Link to="/performance" className={getNavClass('/performance')}>
                  PERFORMANCE <ChevronDown className="w-3 h-3" />
                </Link>
                <div className="absolute top-[40px] right-0 w-56 bg-luxury-gold border-t border-black/10 hidden group-hover:block px-0 py-4 shadow-2xl">
                  <ul className="flex flex-col">
                    <li><Link to="/performance/sicherheitstraining" className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">Sicherheit</Link></li>
                    <li><Link to="/performance/rettungsgeraetetraining" className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">Rettungsgeräte</Link></li>
                    <li><Link to="/performance/refresher" className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">Refresher</Link></li>
                    <li><Link to="/performance/groundhandling" className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">Groundhandling</Link></li>
                  </ul>
                </div>
              </div>

              {/* Mega Menu: Reisen */}
              <div className="group h-[40px] flex items-center">
                <Link to="/reisen" className={getNavClass('/reisen')}>
                  REISEN <ChevronDown className="w-3 h-3" />
                </Link>

                {/* All 10 tours in one static row - no slider/arrows, just
                    smaller thumbnails so every item fits on screen at once. */}
                <div className="absolute top-[40px] left-0 w-full bg-luxury-gold border-t border-black/10 hidden group-hover:block transition-all shadow-2xl z-50">
                  <div className="container mx-auto max-w-[1600px] px-8 py-8">
                    <div className="flex gap-3">
                      {reisenTours.map((tour) => (
                        <Link
                          to={tour === 'Brasilien' ? '/reisen/brasilien-tour' : tour === 'Kolumbien' ? '/reisen/kolumbien-tour' : tour === 'Südafrika' ? '/reisen/suedafrika-tour' : tour === 'Bassano' ? '/reisen/bassano-tour' : tour === 'Griechenland' ? '/reisen/griechenland-tour' : tour === 'Slowenien' ? '/reisen/slowenien-tour' : tour === 'Bergamo' ? '/reisen/bergamo-tour' : tour === 'Savoye' ? '/reisen/savoye-tour' : tour === 'Vogesen' ? '/reisen/vogesen-tour' : tour === 'Pfalz' ? '/reisen/pfalz-tour' : `/reisen#${tour.toLowerCase()}`}
                          key={tour}
                          className="block flex-1 min-w-0 text-center group/tour cursor-pointer"
                        >
                          <div className="w-full h-[100px] overflow-hidden mb-2">
                            <img src={reisenImages[tour]} alt={tour} className="w-full h-full object-cover transition-transform duration-700 group-hover/tour:scale-110" />
                          </div>
                          <h5 className="font-luxury text-black text-sm truncate">{tour}</h5>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Link to="/buchungskalender" className={getNavClass('/buchungskalender')}>
                BUCHUNGSKALENDER
              </Link>

              <Link to="/tandem" className={getNavClass('/tandem')}>
                TANDEM
              </Link>

              {/* Service Dropdown */}
              <div className="relative group h-[40px] flex items-center">
                <Link to="/service" className={getNavClass('/service')}>
                  SERVICE <ChevronDown className="w-3 h-3" />
                </Link>
                <div className="absolute top-[40px] right-0 w-64 bg-luxury-gold border-t border-black/10 hidden group-hover:block px-0 py-4 shadow-2xl">
                  <ul className="flex flex-col">
                    <li><Link to="/service/2-jahres-check" className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">Checks</Link></li>
                    <li><Link to="/service/rettungspacken" className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">Rettungspacken</Link></li>
                    <li><Link to="/service/trimmtuning" className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">Trimmen</Link></li>
                    <li><Link to="/service/reparatur" className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">Reparaturen</Link></li>
                    <li><Link to="/service/service-auftrag" className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">Service-Auftrag</Link></li>
                  </ul>
                </div>
              </div>

              {/* Infos Dropdown */}
              <div className="relative group h-[40px] flex items-center">
                <Link to="/infos" className={getNavClass('/infos')}>
                  INFOS <ChevronDown className="w-3 h-3" />
                </Link>
                <div className="absolute top-[40px] left-0 w-64 bg-luxury-gold border-t border-black/10 hidden group-hover:block px-0 py-4 shadow-2xl">
                  <ul className="flex flex-col">
                    <li><Link to="/infos#kontakt" className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">Kontakt & Anfahrt</Link></li>
                    <li><Link to="/infos/team" className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">Team</Link></li>
                    <li><Link to="/infos/gelaende" className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">Gelände</Link></li>
                    <li><Link to="/infos/wetter" className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">Wetter</Link></li>
                    <li><Link to="/infos/medien" className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">Medien</Link></li>
                    <li><Link to="/downloads" className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">Downloads</Link></li>
                    <li><Link to="/infos/gruppenevents" className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">Gruppenevents</Link></li>
                    <li><Link to="/infos/gutscheine" className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">Gutscheine</Link></li>
                    <li><Link to="/infos/versicherungen" className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">Versicherungen</Link></li>
                  </ul>
                </div>
              </div>

              {/* Seiten Dropdown - admin-created pages (Admin > Seiten), only rendered when at least one exists */}
              {dynamicPages.length > 0 && (
                <div className="relative group h-[40px] flex items-center">
                  <span className={getNavClass('__seiten__')}>
                    SEITEN <ChevronDown className="w-3 h-3" />
                  </span>
                  <div className="absolute top-[40px] right-0 w-64 bg-luxury-gold border-t border-black/10 hidden group-hover:block px-0 py-4 shadow-2xl">
                    <ul className="flex flex-col">
                      {dynamicPages.map((page) => (
                        <li key={page.slug}>
                          <Link to={`/${page.slug}`} className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">
                            {page.navLabel || page.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <Link to="/shop" className={getNavClass('/shop')}>
                SHOP
              </Link>

              {user ? (
                <div className="relative group h-[40px] flex items-center ml-2">
                  <span className="cursor-pointer border border-[#394553] text-[#394553] text-[11px] uppercase tracking-[0.15em] font-semibold px-4 py-2 hover:bg-[#394553] hover:text-white transition-all rounded-sm flex items-center gap-1">
                    {user.name ? user.name.split(' ')[0] : 'KONTO'} <ChevronDown className="w-3 h-3" />
                  </span>
                  <div className="absolute top-[40px] right-0 w-48 bg-luxury-gold border-t border-black/10 hidden group-hover:block px-0 py-4 shadow-2xl">
                    <ul className="flex flex-col">
                      <li><Link to="/profil" className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">Mein Profil</Link></li>
                      <li><button onClick={handleLogout} className="block w-full text-left px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10">Logout</button></li>
                    </ul>
                  </div>
                </div>
              ) : (
                <Link to="/anmeldung" className={getNavClass('/anmeldung')}>
                  KONTO
                </Link>
              )}

            </div>

            {/* Mobile Menu Toggle */}
            <div className="xl:hidden flex items-center justify-end">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white p-2"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </nav>
        </div>

        {/* Mobile Sidebar Menu (CozyStay Reference Style) */}
        <div className={`fixed inset-0 z-[100] transition-opacity duration-500 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          {/* Dark Backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsMobileMenuOpen(false)}></div>

          {/* Sliding Drawer */}
          <div className={`absolute top-0 left-0 w-[360px] max-w-[85vw] h-full bg-[#f4f5f6] overflow-y-auto transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="px-10 py-12 flex flex-col min-h-full">

              {/* Top Bar inside Menu */}
              <div className="flex justify-between items-start pb-10 border-b border-gray-200 mb-10">
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors -ml-2 mt-1">
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
                <div className="flex items-center justify-center">
                  <img src="/logo.svg" alt="Flugschule Hirondelle" className="h-16 w-56 md:w-[240px] object-contain" />
                </div>
                <div className="w-5"></div>
              </div>

              {/* Menu Items List */}
              <div className="flex flex-col space-y-4 flex-grow">

                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-800 text-[26px] font-luxury hover:text-hirondelle-blue transition-colors py-1 block">
                  Home
                </Link>

                {/* Ausbildung */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center w-full text-gray-800 text-[26px] font-luxury">
                    <Link to="/ausbildung" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-hirondelle-blue transition-colors py-1 flex-1">
                      Ausbildung
                    </Link>
                    <button onClick={() => toggleMobileMenu('ausbildung')} aria-label="Ausbildung Untermenü umschalten" className="p-2 -mr-2">
                      <ChevronRight className={`w-4 h-4 text-gray-800 transition-transform ${expandedMobileMenu === 'ausbildung' ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                  <div className={`overflow-hidden transition-all duration-300 ${expandedMobileMenu === 'ausbildung' ? 'max-h-[800px] mt-2 mb-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="flex flex-col space-y-4 pl-4 py-2">
                      <Link to="/ausbildung/schnupperkurs" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Schnupper-/Einsteigerkurs</Link>
                      <Link to="/ausbildung/l-schein" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">L-Schein (Grundkurs)</Link>
                      <Link to="/ausbildung/a-schein" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">A-Schein</Link>
                      <Link to="/ausbildung/b-schein" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">B-Schein</Link>
                      <Link to="/ausbildung/windenschein" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Winde</Link>
                      <Link to="/ausbildung/tandemschein" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Tandem</Link>
                      <Link to="/ausbildung/ausbildungskonzept" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Ausbildungskonzept</Link>
                    </div>
                  </div>
                </div>

                {/* Performance */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center w-full text-gray-800 text-[26px] font-luxury">
                    <Link to="/performance" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-hirondelle-blue transition-colors py-1 flex-1">
                      Performance
                    </Link>
                    <button onClick={() => toggleMobileMenu('performance')} aria-label="Performance Untermenü umschalten" className="p-2 -mr-2">
                      <ChevronRight className={`w-4 h-4 text-gray-800 transition-transform ${expandedMobileMenu === 'performance' ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                  <div className={`overflow-hidden transition-all duration-300 ${expandedMobileMenu === 'performance' ? 'max-h-[400px] mt-2 mb-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="flex flex-col space-y-4 pl-4 py-2">
                      <Link to="/performance/sicherheitstraining" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Sicherheit</Link>
                      <Link to="/performance/rettungsgeraetetraining" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Rettungsgeräte</Link>
                      <Link to="/performance/refresher" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Refresher</Link>
                      <Link to="/performance/groundhandling" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Groundhandling</Link>
                    </div>
                  </div>
                </div>

                {/* Reisen */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center w-full text-gray-800 text-[26px] font-luxury">
                    <Link to="/reisen" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-hirondelle-blue transition-colors py-1 flex-1">
                      Reisen
                    </Link>
                    <button onClick={() => toggleMobileMenu('reisen')} aria-label="Reisen Untermenü umschalten" className="p-2 -mr-2">
                      <ChevronRight className={`w-4 h-4 text-gray-800 transition-transform ${expandedMobileMenu === 'reisen' ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                  <div className={`overflow-hidden transition-all duration-300 ${expandedMobileMenu === 'reisen' ? 'max-h-[800px] mt-2 mb-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="flex flex-col space-y-4 pl-4 py-2">
                      {reisenTours.map(tour => (
                        <Link 
                          key={tour} 
                          to={tour === 'Brasilien' ? '/reisen/brasilien-tour' : tour === 'Kolumbien' ? '/reisen/kolumbien-tour' : tour === 'Südafrika' ? '/reisen/suedafrika-tour' : tour === 'Bassano' ? '/reisen/bassano-tour' : tour === 'Griechenland' ? '/reisen/griechenland-tour' : tour === 'Slowenien' ? '/reisen/slowenien-tour' : tour === 'Bergamo' ? '/reisen/bergamo-tour' : tour === 'Savoye' ? '/reisen/savoye-tour' : tour === 'Vogesen' ? '/reisen/vogesen-tour' : tour === 'Pfalz' ? '/reisen/pfalz-tour' : `/reisen#${tour.toLowerCase()}`} 
                          onClick={() => setIsMobileMenuOpen(false)} 
                          className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue"
                        >
                          {tour}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Service */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center w-full text-gray-800 text-[26px] font-luxury">
                    <Link to="/service" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-hirondelle-blue transition-colors py-1 flex-1">
                      Service
                    </Link>
                    <button onClick={() => toggleMobileMenu('service')} aria-label="Service Untermenü umschalten" className="p-2 -mr-2">
                      <ChevronRight className={`w-4 h-4 text-gray-800 transition-transform ${expandedMobileMenu === 'service' ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                  <div className={`overflow-hidden transition-all duration-300 ${expandedMobileMenu === 'service' ? 'max-h-[400px] mt-2 mb-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="flex flex-col space-y-4 pl-4 py-2">
                      <Link to="/service/2-jahres-check" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Checks</Link>
                      <Link to="/service/rettungspacken" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Rettungspacken</Link>
                      <Link to="/service/trimmtuning" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Trimmen</Link>
                      <Link to="/service/reparatur" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Reparaturen</Link>
                      <Link to="/service/service-auftrag" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Service-Auftrag</Link>
                    </div>
                  </div>
                </div>

                {/* Infos */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center w-full text-gray-800 text-[26px] font-luxury">
                    <Link to="/infos" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-hirondelle-blue transition-colors py-1 flex-1">
                      Infos
                    </Link>
                    <button onClick={() => toggleMobileMenu('infos')} aria-label="Infos Untermenü umschalten" className="p-2 -mr-2">
                      <ChevronRight className={`w-4 h-4 text-gray-800 transition-transform ${expandedMobileMenu === 'infos' ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                  <div className={`overflow-hidden transition-all duration-300 ${expandedMobileMenu === 'infos' ? 'max-h-[600px] mt-2 mb-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="flex flex-col space-y-4 pl-4 py-2">
                      <Link to="/infos#kontakt" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Kontakt & Anfahrt</Link>
                      <Link to="/infos/team" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Team</Link>
                      <Link to="/infos/gelaende" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Gelände</Link>
                      <Link to="/infos/wetter" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Wetter</Link>
                      <Link to="/infos/medien" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Medien</Link>
                      <Link to="/downloads" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Downloads</Link>
                      <Link to="/infos/gruppenevents" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Gruppenevents</Link>
                      <Link to="/infos/gutscheine" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Gutscheine</Link>
                      <Link to="/infos/versicherungen" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Versicherungen</Link>
                    </div>
                  </div>
                </div>

                {/* Seiten - admin-created pages (Admin > Seiten), only rendered when at least one exists */}
                {dynamicPages.length > 0 && (
                  <div className="flex flex-col">
                    <button onClick={() => toggleMobileMenu('seiten')} className="flex justify-between items-center w-full text-gray-800 text-[26px] font-luxury hover:text-hirondelle-blue transition-colors text-left py-1">
                      Seiten
                      <ChevronRight className={`w-4 h-4 text-gray-800 transition-transform ${expandedMobileMenu === 'seiten' ? 'rotate-90' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${expandedMobileMenu === 'seiten' ? 'max-h-[600px] mt-2 mb-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="flex flex-col space-y-4 pl-4 py-2">
                        {dynamicPages.map((page) => (
                          <Link key={page.slug} to={`/${page.slug}`} onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">
                            {page.navLabel || page.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Direct Links */}
                <Link to="/buchungskalender" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-800 text-[26px] font-luxury hover:text-hirondelle-blue transition-colors py-1">
                  Buchungskalender
                </Link>
                <Link to="/tandem" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-800 text-[26px] font-luxury hover:text-hirondelle-blue transition-colors py-1">
                  Tandem
                </Link>
                <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-800 text-[26px] font-luxury hover:text-hirondelle-blue transition-colors py-1">
                  Shop
                </Link>
                
                {user ? (
                  <div className="flex flex-col">
                    <button onClick={() => toggleMobileMenu('account')} className="flex justify-between items-center w-full text-gray-800 text-[26px] font-luxury hover:text-hirondelle-blue transition-colors text-left py-1">
                      {user.name || 'Konto'}
                      <ChevronRight className={`w-4 h-4 text-gray-800 transition-transform ${expandedMobileMenu === 'account' ? 'rotate-90' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${expandedMobileMenu === 'account' ? 'max-h-[400px] mt-2 mb-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="flex flex-col space-y-4 pl-4 py-2">
                        <Link to="/profil" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Mein Profil</Link>
                        <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-left text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Logout</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link to="/anmeldung" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-800 text-[26px] font-luxury hover:text-hirondelle-blue transition-colors py-1">
                    Login
                  </Link>
                )}

              </div>

              {/* Bottom Contact (Matches reference exactly) */}
              <div className="mt-16 pt-8 text-gray-800 font-light">
                <p className="font-luxury text-[20px] text-gray-800 mb-3">Flugschule Hirondelle</p>
                <p className="text-[14px] leading-relaxed mb-4 text-gray-600">
                  Weinheim, 69469,<br />
                  Deutschland
                </p>
                <Link to="/infos#kontakt" onClick={() => setIsMobileMenuOpen(false)} className="text-[11px] font-bold text-gray-800 hover:text-hirondelle-blue transition-colors border-b border-gray-300 hover:border-hirondelle-blue pb-1 mb-10 inline-block uppercase tracking-wider">
                  ROUTE BERECHNEN
                </Link>

                <p className="text-[15px] font-medium leading-relaxed mb-1">
                  +49 6201 12345
                </p>
                <p className="text-[15px] leading-relaxed mb-8 text-gray-600">
                  info@flugschule-hirondelle.de
                </p>

                <div className="flex gap-4 mb-8">
                  <a href="https://www.facebook.com/fshirondelle" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-500 hover:text-hirondelle-blue transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg></a>
                  <a href="https://www.youtube.com/channel/UCOwo0Wh2zoX_7nyArBdk_IQ/videos" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-gray-500 hover:text-hirondelle-blue transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg></a>
                </div>

                <p className="text-[13px] text-gray-500 font-medium">
                  &copy; Copyright Flugschule Hirondelle.
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
