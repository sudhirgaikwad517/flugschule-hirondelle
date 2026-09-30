import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Banner, BannerPositionContext } from '../components/common/Banner';

interface PageSettings {
  slug: string | null;
  title: string;
  status: string;
}

// Wraps each of the 6 fixed pages' hardcoded routes in App.tsx (path=
// "ausbildung" etc.). Admin > Seiten lets these pages' title/URL/publish-
// status be edited (see FixedPageSettings model / fixedPageSettings.routes.ts)
// without ever touching the route itself - every existing Header/Footer
// link and every sub-route under it (e.g. ausbildung/schnupperkurs) keeps
// working unmodified:
// - status "draft" shows a "Diese Seite existiert nicht" message here
//   instead of the real page.
// - a renamed slug (different from `defaultSlug`) redirects this old,
//   hardcoded URL to the new one - which resolves via FixedPageRouter.tsx's
//   ":slug" catch-all, the same mechanism a "Seiten > Duplizieren" copy uses.
// Fails open (renders the real page) on a slow/failed settings fetch or a
// missing/null `defaultSlug` (home, which never redirects) - a page should
// never go dark just because this one extra request didn't come back yet.
export const FixedPageGate = ({
  kind,
  defaultSlug,
  children,
}: {
  kind: string;
  defaultSlug: string | null;
  children: ReactNode;
}) => {
  const [settings, setSettings] = useState<PageSettings | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    // Reset before fetching, not just on resolve - this component sits at
    // the same spot in the route tree across a same-Layout navigation (e.g.
    // clicking a "Weiterlesen" card from /service to /service/2-jahres-check),
    // so React reuses the same instance and its `settings` state would
    // otherwise still hold the PREVIOUS page's slug for one render. That
    // stale slug then gets compared against the NEW page's defaultSlug,
    // sees a mismatch, and fires a spurious redirect back to the old page.
    setSettings(undefined);
    fetch(`/api/fixed-page-settings/public/${kind}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (!cancelled) setSettings(data); })
      .catch(() => { if (!cancelled) setSettings(null); });
    return () => { cancelled = true; };
  }, [kind]);

  if (settings === undefined || settings === null) {
    return <BannerPositionContext.Provider value={kind}>{children}</BannerPositionContext.Provider>;
  }

  if (settings.status === 'draft') {
    return (
      <BannerPositionContext.Provider value={kind}>
        <div className="w-full bg-white pb-20">
          <Banner />
          <div className="container mx-auto px-4 py-20 text-center text-gray-500">
            Diese Seite existiert nicht.
          </div>
        </div>
      </BannerPositionContext.Provider>
    );
  }

  if (defaultSlug !== null && settings.slug && settings.slug !== defaultSlug) {
    return <Navigate to={`/${settings.slug}`} replace />;
  }

  return <BannerPositionContext.Provider value={kind}>{children}</BannerPositionContext.Provider>;
};
