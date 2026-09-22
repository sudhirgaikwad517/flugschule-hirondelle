import { useEffect, useState, type ComponentType } from 'react';
import { useParams } from 'react-router-dom';
import { Home } from './Home';
import { Ausbildung } from './Ausbildung';
import { Performance } from './Performance';
import { Reisen } from './Reisen';
import { Service } from './Service';
import { Infos } from './Infos';
import { DynamicPage } from './DynamicPage';

const KIND_COMPONENTS: Record<string, ComponentType<{ contentId?: string }>> = {
  home: Home,
  ausbildung: Ausbildung,
  performance: Performance,
  reisen: Reisen,
  service: Service,
  infos: Infos,
};

interface Resolved {
  kind: string;
  contentId?: string;
}

// Every catch-all ":slug" request goes through here first, checking two
// things a fixed page's slug can mean before falling back to DynamicPage
// (the Seiten/Unlayer CMS flow):
// 1. A true same-design duplicate (Admin > Seiten > "Duplizieren" on
//    Startseite/Ausbildung/Performance/Reisen/Service/Infos - see
//    FixedPageDuplicate model / fixedPageDuplicates.routes.ts) - renders the
//    same component as the original, pointed at the copied content via
//    contentId.
// 2. A RENAMED original fixed page (Admin > Seiten > editing Ausbildung's
//    own "Seiten-Einstellungen" - see FixedPageSettings model /
//    fixedPageSettings.routes.ts / FixedPageGate.tsx, which redirects the
//    old hardcoded route here) - renders the same component with no
//    contentId, so it reads the page's own real content, not a copy.
export const FixedPageRouter = () => {
  const { slug } = useParams<{ slug: string }>();
  const [resolved, setResolved] = useState<Resolved | null | undefined>(undefined);

  useEffect(() => {
    setResolved(undefined);
    Promise.all([
      fetch(`/api/fixed-page-duplicates/public/${slug}`).then((res) => (res.ok ? res.json() : null)),
      fetch(`/api/fixed-page-settings/public/by-slug/${slug}`).then((res) => (res.ok ? res.json() : null)),
    ])
      .then(([dup, primary]) => {
        if (dup) setResolved({ kind: dup.kind, contentId: dup.contentId });
        else if (primary) setResolved({ kind: primary.kind });
        else setResolved(null);
      })
      .catch(() => setResolved(null));
  }, [slug]);

  if (resolved === undefined) return null;

  if (resolved) {
    const Component = KIND_COMPONENTS[resolved.kind];
    if (Component) return <Component contentId={resolved.contentId} />;
  }

  return <DynamicPage />;
};
