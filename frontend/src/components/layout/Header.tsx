import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';

export const Header = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const getNavClass = (path: string) => {
    const isActive = path === '/' ? pathname === '/' : pathname.startsWith(path);
    return `text-[10.5px] uppercase tracking-widest font-semibold flex items-center gap-1 transition-colors pl-2.5 pr-[14px] py-1.5 rounded-md ${
      isActive 
        ? 'bg-hirondelle-blue/10 text-hirondelle-blue' 
        : 'text-gray-800 hover:text-hirondelle-blue hover:bg-black/5'
    }`;
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [reisenIndex, setReisenIndex] = useState(0);
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

  const toggleMobileMenu = (menu: string) => {
    if (expandedMobileMenu === menu) setExpandedMobileMenu(null);
    else setExpandedMobileMenu(menu);
  };

  const nextReisen = () => {
    if (reisenIndex < reisenTours.length - 5) setReisenIndex(reisenIndex + 1);
  };

  const prevReisen = () => {
    if (reisenIndex > 0) setReisenIndex(reisenIndex - 1);
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
    <header className="w-full fixed top-0 left-0 z-50 font-luxurysans bg-[#f4f5f6] shadow-sm print:hidden">



      {/* Main Navigation */}
      <div 
        className={`transition-colors duration-300 h-[80px] flex items-center`}
      >
        <div className="w-full px-4 md:px-8">
          <nav className="flex items-center justify-between">

            {/* Left: Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="block">
                <img src="/logo.svg" alt="Flugschule Hirondelle" className="h-16 w-56 md:h-[72px] md:w-[280px] object-contain" />
              </Link>
            </div>

            {/* Right: All Menu Items */}
            <div className="hidden xl:flex items-center justify-end gap-1 2xl:gap-3">

              <Link to="/" className={getNavClass('/')}>
                <span className="flex items-center justify-center">
                  H<img src="/google.png" alt="O" className="w-[13px] h-[13px] object-contain mx-[1.5px] -mt-[1px]" />ME
                </span>
              </Link>

              {/* Mega Menu: Ausbildung */}
              <div className="group h-[80px] flex items-center">
                <Link to="/ausbildung" className={getNavClass('/ausbildung')}>
                  AUSBILDUNG <ChevronDown className="w-3 h-3" />
                </Link>

                {/* Full Width Dropdown via Absolute */}
                <div className="absolute top-[80px] left-0 w-full bg-[#111] border-t border-white/10 hidden group-hover:block transition-all shadow-2xl z-50">
                  <div className="container mx-auto max-w-7xl px-8 py-12 flex gap-12">
                    <div className="flex-1 grid grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-white text-[11px] uppercase tracking-[0.2em] font-bold mb-6">EINSTIEG & GRUNDLAGEN</h4>
                        <ul className="space-y-4">
                          <li><Link to="/ausbildung/schnupperkurs" className="text-gray-400 hover:text-luxury-gold text-sm transition-colors">Schnupper-/Einsteigerkurs</Link></li>
                          <li><Link to="/ausbildung/l-schein" className="text-gray-400 hover:text-luxury-gold text-sm transition-colors">L-Schein (Grundkurs)</Link></li>
                          <li><Link to="/ausbildung/ausbildungskonzept" className="text-gray-400 hover:text-luxury-gold text-sm transition-colors">Ausbildungskonzept</Link></li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-white text-[11px] uppercase tracking-[0.2em] font-bold mb-6">WEITERBILDUNG</h4>
                        <ul className="space-y-4">
                          <li><Link to="/ausbildung/a-schein" className="text-gray-400 hover:text-luxury-gold text-sm transition-colors">A-Schein</Link></li>
                          <li><Link to="/ausbildung/b-schein" className="text-gray-400 hover:text-luxury-gold text-sm transition-colors">B-Schein</Link></li>
                          <li><Link to="/ausbildung/windenschein" className="text-gray-400 hover:text-luxury-gold text-sm transition-colors">Winde</Link></li>
                          <li><Link to="/ausbildung/tandemschein" className="text-gray-400 hover:text-luxury-gold text-sm transition-colors">Tandem</Link></li>
                        </ul>
                      </div>
                    </div>
                    <div className="flex-1 flex gap-4">
                      <div className="relative flex-1 h-[300px] overflow-hidden group/card cursor-pointer">
                        <img src="/images/tandemschein/hero.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105" alt="Tandem" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute bottom-6 left-6 right-6">
                          <p className="text-white text-[10px] uppercase tracking-widest font-bold mb-1">ERLEBNIS</p>
                          <h5 className="font-luxury text-white text-2xl">Tandemflüge</h5>
                        </div>
                      </div>
                      <div className="relative flex-1 h-[300px] overflow-hidden group/card cursor-pointer">
                        <img src="/images/performance/sicherheitstraining.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105" alt="Performance" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute bottom-6 left-6 right-6">
                          <p className="text-white text-[10px] uppercase tracking-widest font-bold mb-1">TRAINING</p>
                          <h5 className="font-luxury text-white text-2xl">Performance</h5>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Dropdown */}
              <div className="relative group h-[80px] flex items-center">
                <Link to="/performance" className={getNavClass('/performance')}>
                  PERFORMANCE <ChevronDown className="w-3 h-3" />
                </Link>
                <div className="absolute top-[80px] right-0 w-56 bg-[#111] border-t border-white/10 hidden group-hover:block px-0 py-4 shadow-2xl">
                  <ul className="flex flex-col">
                    <li><Link to="/performance/sicherheitstraining" className="block px-8 py-3 text-gray-400 hover:text-luxury-gold text-sm transition-colors border-b border-white/5">Sicherheit</Link></li>
                    <li><Link to="/performance/rettungsgeraetetraining" className="block px-8 py-3 text-gray-400 hover:text-luxury-gold text-sm transition-colors border-b border-white/5">Rettungsgeräte</Link></li>
                    <li><Link to="/performance/refresher" className="block px-8 py-3 text-gray-400 hover:text-luxury-gold text-sm transition-colors border-b border-white/5">Refresher</Link></li>
                    <li><Link to="/performance/groundhandling" className="block px-8 py-3 text-gray-400 hover:text-luxury-gold text-sm transition-colors border-b border-white/5">Groundhandling</Link></li>
                  </ul>
                </div>
              </div>

              {/* Mega Menu: Reisen */}
              <div className="group h-[80px] flex items-center">
                <Link to="/reisen" className={getNavClass('/reisen')}>
                  REISEN <ChevronDown className="w-3 h-3" />
                </Link>

                <div className="absolute top-[80px] left-0 w-full bg-[#111] border-t border-white/10 hidden group-hover:block transition-all shadow-2xl z-50">
                  <div className="container mx-auto max-w-7xl px-8 py-12 relative">
                    {/* Prev Button */}
                    <button onClick={(e) => { e.preventDefault(); prevReisen(); }} className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10 ${reisenIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}>
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>

                    <div className="overflow-hidden w-full px-8">
                      <div className="flex transition-transform duration-500 ease-in-out gap-4" style={{ transform: `translateX(-${reisenIndex * (100 / 5)}%)` }}>
                        {reisenTours.map((tour, idx) => (
                          <Link 
                            to={tour === 'Brasilien' ? '/reisen/brasilien-tour' : tour === 'Kolumbien' ? '/reisen/kolumbien-tour' : tour === 'Südafrika' ? '/reisen/suedafrika-tour' : tour === 'Bassano' ? '/reisen/bassano-tour' : tour === 'Griechenland' ? '/reisen/griechenland-tour' : tour === 'Slowenien' ? '/reisen/slowenien-tour' : tour === 'Bergamo' ? '/reisen/bergamo-tour' : tour === 'Savoye' ? '/reisen/savoye-tour' : tour === 'Vogesen' ? '/reisen/vogesen-tour' : tour === 'Pfalz' ? '/reisen/pfalz-tour' : `/reisen#${tour.toLowerCase()}`} 
                            key={tour} 
                            className="block flex-none w-[calc(20%-12.8px)] text-center group/tour cursor-pointer"
                          >
                            <div className="w-full h-[200px] overflow-hidden mb-4">
                              <img src={reisenImages[tour]} alt={tour} className="w-full h-full object-cover transition-transform duration-700 group-hover/tour:scale-110" />
                            </div>
                            <h5 className="font-luxury text-white text-xl">{tour}</h5>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Next Button */}
                    <button onClick={(e) => { e.preventDefault(); nextReisen(); }} className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10 ${reisenIndex >= reisenTours.length - 5 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}>
                      <ChevronRight className="w-6 h-6 text-white" />
                    </button>
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
              <div className="relative group h-[80px] flex items-center">
                <Link to="/service" className={getNavClass('/service')}>
                  SERVICE <ChevronDown className="w-3 h-3" />
                </Link>
                <div className="absolute top-[80px] right-0 w-64 bg-[#111] border-t border-white/10 hidden group-hover:block px-0 py-4 shadow-2xl">
                  <ul className="flex flex-col">
                    <li><Link to="/service/2-jahres-check" className="block px-8 py-3 text-gray-400 hover:text-luxury-gold text-sm transition-colors border-b border-white/5">2-Jahres-Check</Link></li>
                    <li><Link to="/service/rettungspacken" className="block px-8 py-3 text-gray-400 hover:text-luxury-gold text-sm transition-colors border-b border-white/5">Rettungspacken</Link></li>
                    <li><Link to="/service/trimmtuning" className="block px-8 py-3 text-gray-400 hover:text-luxury-gold text-sm transition-colors border-b border-white/5">Trimmen</Link></li>
                    <li><Link to="/service/reparatur" className="block px-8 py-3 text-gray-400 hover:text-luxury-gold text-sm transition-colors border-b border-white/5">Reparaturen</Link></li>
                    <li><Link to="/service/service-auftrag" className="block px-8 py-3 text-gray-400 hover:text-luxury-gold text-sm transition-colors border-b border-white/5">Service-Auftrag</Link></li>
                  </ul>
                </div>
              </div>

              {/* Infos Dropdown */}
              <div className="relative group h-[80px] flex items-center">
                <Link to="/infos" className={getNavClass('/infos')}>
                  INFOS <ChevronDown className="w-3 h-3" />
                </Link>
                <div className="absolute top-[80px] left-0 w-64 bg-[#111] border-t border-white/10 hidden group-hover:block px-0 py-4 shadow-2xl">
                  <ul className="flex flex-col">
                    <li><Link to="/news" className="block px-8 py-3 text-gray-400 hover:text-luxury-gold text-sm transition-colors border-b border-white/5">Aktuelles (News)</Link></li>
                    <li><Link to="/infos#kontakt" className="block px-8 py-3 text-gray-400 hover:text-luxury-gold text-sm transition-colors border-b border-white/5">Kontakt & Anfahrt</Link></li>
                    <li><Link to="/infos/team" className="block px-8 py-3 text-gray-400 hover:text-luxury-gold text-sm transition-colors border-b border-white/5">Team</Link></li>
                    <li><Link to="/infos/gelaende" className="block px-8 py-3 text-gray-400 hover:text-luxury-gold text-sm transition-colors border-b border-white/5">Gelände</Link></li>
                    <li><Link to="/infos/wetter" className="block px-8 py-3 text-gray-400 hover:text-luxury-gold text-sm transition-colors border-b border-white/5">Wetter</Link></li>
                    <li><Link to="/infos/medien" className="block px-8 py-3 text-gray-400 hover:text-luxury-gold text-sm transition-colors border-b border-white/5">Medien</Link></li>
                    <li><Link to="/downloads" className="block px-8 py-3 text-gray-400 hover:text-luxury-gold text-sm transition-colors border-b border-white/5">Downloads</Link></li>
                    <li><Link to="/partner" className="block px-8 py-3 text-gray-400 hover:text-luxury-gold text-sm transition-colors border-b border-white/5">Partner & Links</Link></li>
                    <li><Link to="/infos/gutscheine" className="block px-8 py-3 text-gray-400 hover:text-luxury-gold text-sm transition-colors border-b border-white/5">Gutscheine</Link></li>
                    <li><Link to="/infos/versicherungen" className="block px-8 py-3 text-gray-400 hover:text-luxury-gold text-sm transition-colors border-b border-white/5">Versicherungen</Link></li>
                  </ul>
                </div>
              </div>

              <Link to="/shop" className={getNavClass('/shop')}>
                SHOP
              </Link>

              {user ? (
                <div className="relative group h-[80px] flex items-center ml-2">
                  <span className="cursor-pointer border border-[#394553] text-[#394553] text-[11px] uppercase tracking-[0.15em] font-semibold px-4 py-2 hover:bg-[#394553] hover:text-white transition-all rounded-sm flex items-center gap-1">
                    {user.name ? user.name.split(' ')[0] : 'KONTO'} <ChevronDown className="w-3 h-3" />
                  </span>
                  <div className="absolute top-[80px] right-0 w-48 bg-[#111] border-t border-white/10 hidden group-hover:block px-0 py-4 shadow-2xl">
                    <ul className="flex flex-col">
                      <li><Link to="/profil" className="block px-8 py-3 text-gray-400 hover:text-luxury-gold text-sm transition-colors border-b border-white/5">Mein Profil</Link></li>
                      <li><button onClick={handleLogout} className="block w-full text-left px-8 py-3 text-gray-400 hover:text-luxury-gold text-sm transition-colors border-b border-white/5">Logout</button></li>
                    </ul>
                  </div>
                </div>
              ) : (
                <Link to="/anmeldung" className={getNavClass('/anmeldung')}>
                  KONTO
                </Link>
              )}

              <Link to="/search" className="text-gray-800 hover:text-hirondelle-blue hover:bg-black/5 p-2 rounded-full transition-colors ml-2">
                <Search className="w-5 h-5" />
              </Link>

            </div>

            {/* Mobile Menu Toggle */}
            <div className="xl:hidden flex items-center justify-end">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-800 p-2"
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
                  <button onClick={() => toggleMobileMenu('ausbildung')} className="flex justify-between items-center w-full text-gray-800 text-[26px] font-luxury hover:text-hirondelle-blue transition-colors text-left py-1">
                    Ausbildung
                    <ChevronRight className={`w-4 h-4 text-gray-800 transition-transform ${expandedMobileMenu === 'ausbildung' ? 'rotate-90' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${expandedMobileMenu === 'ausbildung' ? 'max-h-[800px] mt-2 mb-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="flex flex-col space-y-4 pl-4 py-2">
                      <Link to="/ausbildung/schnupperkurs" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Schnupper-/Einsteigerkurs</Link>
                      <Link to="/ausbildung/l-schein" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">L-Schein (Grundkurs)</Link>
                      <Link to="/ausbildung/ausbildungskonzept" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Ausbildungskonzept</Link>
                      <Link to="/ausbildung/a-schein" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">A-Schein</Link>
                      <Link to="/ausbildung/b-schein" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">B-Schein</Link>
                      <Link to="/ausbildung/windenschein" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Winde</Link>
                      <Link to="/ausbildung/tandemschein" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Tandem</Link>
                    </div>
                  </div>
                </div>

                {/* Performance */}
                <div className="flex flex-col">
                  <button onClick={() => toggleMobileMenu('performance')} className="flex justify-between items-center w-full text-gray-800 text-[26px] font-luxury hover:text-hirondelle-blue transition-colors text-left py-1">
                    Performance
                    <ChevronRight className={`w-4 h-4 text-gray-800 transition-transform ${expandedMobileMenu === 'performance' ? 'rotate-90' : ''}`} />
                  </button>
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
                  <button onClick={() => toggleMobileMenu('reisen')} className="flex justify-between items-center w-full text-gray-800 text-[26px] font-luxury hover:text-hirondelle-blue transition-colors text-left py-1">
                    Reisen
                    <ChevronRight className={`w-4 h-4 text-gray-800 transition-transform ${expandedMobileMenu === 'reisen' ? 'rotate-90' : ''}`} />
                  </button>
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
                  <button onClick={() => toggleMobileMenu('service')} className="flex justify-between items-center w-full text-gray-800 text-[26px] font-luxury hover:text-hirondelle-blue transition-colors text-left py-1">
                    Service
                    <ChevronRight className={`w-4 h-4 text-gray-800 transition-transform ${expandedMobileMenu === 'service' ? 'rotate-90' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${expandedMobileMenu === 'service' ? 'max-h-[400px] mt-2 mb-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="flex flex-col space-y-4 pl-4 py-2">
                      <Link to="/service/2-jahres-check" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">2-Jahres-Check</Link>
                      <Link to="/service/rettungspacken" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Rettungspacken</Link>
                      <Link to="/service/trimmtuning" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Trimmen</Link>
                      <Link to="/service/reparatur" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Reparaturen</Link>
                      <Link to="/service/service-auftrag" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Service-Auftrag</Link>
                    </div>
                  </div>
                </div>

                {/* Infos */}
                <div className="flex flex-col">
                  <button onClick={() => toggleMobileMenu('infos')} className="flex justify-between items-center w-full text-gray-800 text-[26px] font-luxury hover:text-hirondelle-blue transition-colors text-left py-1">
                    Infos
                    <ChevronRight className={`w-4 h-4 text-gray-800 transition-transform ${expandedMobileMenu === 'infos' ? 'rotate-90' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${expandedMobileMenu === 'infos' ? 'max-h-[600px] mt-2 mb-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="flex flex-col space-y-4 pl-4 py-2">
                      <Link to="/news" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Aktuelles (News)</Link>
                      <Link to="/infos#kontakt" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Kontakt & Anfahrt</Link>
                      <Link to="/infos/team" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Team</Link>
                      <Link to="/infos/gelaende" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Gelände</Link>
                      <Link to="/infos/wetter" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Wetter</Link>
                      <Link to="/infos/medien" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Medien</Link>
                      <Link to="/downloads" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Downloads</Link>
                      <Link to="/partner" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Partner & Links</Link>
                      <Link to="/infos/gutscheine" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Gutscheine</Link>
                      <Link to="/infos/versicherungen" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 text-[15px] font-light hover:text-hirondelle-blue">Versicherungen</Link>
                    </div>
                  </div>
                </div>

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
                  <a href="#" className="text-gray-500 hover:text-hirondelle-blue transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg></a>
                  <a href="#" className="text-gray-500 hover:text-hirondelle-blue transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg></a>
                  <a href="#" className="text-gray-500 hover:text-hirondelle-blue transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg></a>
                  <a href="#" className="text-gray-500 hover:text-hirondelle-blue transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg></a>
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
