import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Banner } from '../components/common/Banner';

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
    fetch(`/api/fixed-page-settings/public/${kind}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (!cancelled) setSettings(data); })
      .catch(() => { if (!cancelled) setSettings(null); });
    return () => { cancelled = true; };
  }, [kind]);

  if (settings === undefined || settings === null) return <>{children}</>;

  if (settings.status === 'draft') {
    return (
      <div className="w-full bg-white pb-20">
        <Banner />
        <div className="container mx-auto px-4 py-20 text-center text-gray-500">
          Diese Seite existiert nicht.
        </div>
      </div>
    );
  }

  if (defaultSlug !== null && settings.slug && settings.slug !== defaultSlug) {
    return <Navigate to={`/${settings.slug}`} replace />;
  }

  return <>{children}</>;
};
