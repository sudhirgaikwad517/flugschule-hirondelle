import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';

// Shape returned by GET /api/menu/public (MenuItem + published MenuSubItem[]).
interface MenuSubNavItem {
  id: string;
  label: string;
  url: string;
  target: string;
  imageUrl?: string | null;
}
interface MenuNavItem extends MenuSubNavItem {
  subItems: MenuSubNavItem[];
}

// One admin-managed top-level nav entry: a hover dropdown when it has
// sub-items, otherwise a plain link - replaces what used to be individually
// hardcoded Ausbildung/Performance/Reisen/Service/Infos blocks below. When
// EVERY sub-item has an imageUrl set (Admin > Menü), it renders as a
// full-width image-tile mega menu instead of a plain text list - this is
// what keeps the old hardcoded Reisen tour-thumbnail menu working, now
// admin-editable rather than a one-off special case in this file. A plain
// dropdown is centered under the item (not left/right-pinned like the old
// per-item markup) so it never depends on where admin-managed items land.
const NavDropdown = ({ item, getNavClass }: { item: MenuNavItem; getNavClass: (path: string) => string }) => {
  const linkProps = item.target === '_blank' ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  if (item.subItems.length === 0) {
    return (
      <Link to={item.url} className={getNavClass(item.url)} {...linkProps}>
        {item.label.toUpperCase()}
      </Link>
    );
  }

  const isImageMenu = item.subItems.length > 0 && item.subItems.every((sub) => !!sub.imageUrl);

  if (isImageMenu) {
    return (
      <div className="group h-[40px] flex items-center">
        <Link to={item.url} className={getNavClass(item.url)} {...linkProps}>
          {item.label.toUpperCase()} <ChevronDown className="w-3 h-3" />
        </Link>
        <div className="absolute top-[40px] left-0 w-full bg-luxury-gold border-t border-black/10 hidden group-hover:block transition-all shadow-2xl z-50">
          <div className="container mx-auto max-w-[1600px] px-8 py-8">
            <div className="flex gap-3">
              {item.subItems.map((sub) => {
                const subLinkProps = sub.target === '_blank' ? { target: '_blank', rel: 'noopener noreferrer' } : {};
                return (
                  <Link
                    to={sub.url}
                    key={sub.id}
                    className="block flex-1 min-w-0 text-center group/tour cursor-pointer"
                    {...subLinkProps}
                  >
                    <div className="w-full h-[100px] overflow-hidden mb-2">
                      <img src={sub.imageUrl!} alt={sub.label} className="w-full h-full object-cover transition-transform duration-700 group-hover/tour:scale-110" />
                    </div>
                    <h5 className="font-luxury text-black text-sm truncate">{sub.label}</h5>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group h-[40px] flex items-center">
      <Link to={item.url} className={getNavClass(item.url)} {...linkProps}>
        {item.label.toUpperCase()} <ChevronDown className="w-3 h-3" />
      </Link>
      <div className="absolute top-[40px] left-1/2 -translate-x-1/2 w-64 bg-luxury-gold border-t border-black/10 hidden group-hover:block px-0 py-4 shadow-2xl">
        <ul className="flex flex-col">
          {item.subItems.map((sub) => {
            const subLinkProps = sub.target === '_blank' ? { target: '_blank', rel: 'noopener noreferrer' } : {};
            return (
              <li key={sub.id}>
                <Link to={sub.url} className="block px-8 py-3 text-black/70 hover:text-black text-sm transition-colors border-b border-black/10" {...subLinkProps}>
                  {sub.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

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

  // Admin-managed header nav (Admin > Menü) - the Ausbildung/Performance/
  // Reisen/Buchungskalender/Tandem/Service/Infos entries below all come
  // from here now, each with its own optional sub-items rendered as a
  // hover dropdown. Shop, "Seiten" above and the Konto/login menu stay
  // hardcoded since they carry behavior beyond a plain label+link. See
  // MenuItem/MenuSubItem in schema.prisma and menu.routes.ts.
  const [menuItems, setMenuItems] = useState<MenuNavItem[]>([]);

  useEffect(() => {
    fetch('/api/menu/public')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMenuItems(Array.isArray(data) ? data : []))
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

              {/* Admin-managed nav (Admin > Menü) - Ausbildung, Performance,
                  Reisen, Buchungskalender, Tandem, Service, Infos and any
                  future items/order come from here now (see NavDropdown
                  above). The Reisen entry used to be a full-width mega menu
                  with tour thumbnails; that's a per-item design the generic
                  admin-managed dropdown doesn't reproduce, so it now renders
                  as a plain dropdown list like the others. */}
              {menuItems.map((item) => (
                <NavDropdown key={item.id} item={item} getNavClass={getNavClass} />
              ))}

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

                {/* Admin-managed nav (Admin > Menü) - same items/order as the
                    desktop NavDropdown loop above, rendered here as
                    accordions keyed by item.id instead of a hardcoded name
                    (see toggleMobileMenu). */}
                {menuItems.map((item) => {
                  const itemLinkProps = item.target === '_blank' ? { target: '_blank', rel: 'noopener noreferrer' } : {};
                  if (item.subItems.length === 0) {
                    return (
                      <Link key={item.id} to={item.url} onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-800 text-[26px] font-luxury hover:text-hirondelle-blue transition-colors py-1" {...itemLinkProps}>
                        {item.label}
                      </Link>
                    );
                  }
                  return (
                    <div key={item.id} className="flex flex-col">
                      <div className="flex justify-between items-center w-full text-gray-800 text-[26px] font-luxury">
                        <Link to={item.url} onClick={() => setIsMobileMenuOpen(false)} className="hover:text-hirondelle-blue transition-colors py-1 flex-1" {...itemLinkProps}>
                          {item.label}
                        </Link>
                        <button onClick={() => toggleMobileMenu(item.id)} aria-label={`${item.label} Untermenü umschalten`} className="p-2 -mr-2">
                          <ChevronRight className={`w-4 h-4 text-gray-800 transition-transform ${expandedMobileMenu === item.id ? 'rotate-90' : ''}`} />
                        </button>
                      </div>
                      <div className={`overflow-hidden transition-all duration-300 ${expandedMobileMenu === item.id ? 'max-h-[800px] mt-2 mb-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="flex flex-col space-y-4 pl-4 py-2">
                          {item.subItems.map((sub) => {
                            const subLinkProps = sub.target === '_blank' ? { target: '_blank', rel: 'noopener noreferrer' } : {};
                            return (
                              <Link key={sub.id} to={sub.url} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-600 text-[15px] font-light hover:text-hirondelle-blue" {...subLinkProps}>
                                {sub.imageUrl && (
                                  <img src={sub.imageUrl} alt="" className="w-10 h-10 object-cover rounded shrink-0" />
                                )}
                                {sub.label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}

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
