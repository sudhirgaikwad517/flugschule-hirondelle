import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LegalPageContent } from './LegalPageContent';

// Renders an admin-editable legal text page (AGB / Widerrufsbelehrung /
// Datenschutz / Impressum), matching Matukio's agb_text/revoke_text
// configuration fields. `kind` is the stable internal identifier (never
// changes - it's what the 4 hardcoded App.tsx routes pass); the page's own
// `slug` is separately admin-editable (Admin > Rechtliche Seiten). If an
// admin has renamed the slug away from `kind`, redirect to the new URL -
// same "kind vs slug" redirect pattern as FixedPageGate.tsx.
export const LegalPage = ({ kind }: { kind: string }) => {
  // Tagged with the `kind` each fetch was actually for - this component
  // sits at the same spot in the route tree across a same-Layout
  // navigation between two of these 4 legal-page routes, so React reuses
  // the same instance. Deriving `page` below (by checking the fetch's own
  // tagged kind against the CURRENT kind, during render) means a stale
  // result from the PREVIOUS legal page can never be mistaken for this
  // one's - see FixedPageGate.tsx for the exact same race and fix.
  const [fetched, setFetched] = useState<{ kind: string; page: { slug: string; title: string; content: string } | null } | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/legalPages/public/by-kind/${kind}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => { if (!cancelled) setFetched({ kind, page: data }); })
      .catch(() => { if (!cancelled) setFetched({ kind, page: null }); });
    return () => { cancelled = true; };
  }, [kind]);

  const page = fetched?.kind === kind ? fetched.page : undefined;

  if (page === undefined) {
    return (
      <div className="w-full bg-white font-luxurysans pb-20 py-16 text-center text-gray-500">Lädt...</div>
    );
  }

  if (page && page.slug !== kind) {
    return <Navigate to={`/${page.slug}`} replace />;
  }

  if (!page) {
    return (
      <div className="w-full bg-white font-luxurysans pb-20 py-16 text-center text-gray-500">
        Diese Seite konnte nicht geladen werden.
      </div>
    );
  }

  return <LegalPageContent title={page.title} content={page.content} />;
};
