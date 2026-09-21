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

interface ResolvedDuplicate {
  kind: string;
  contentId: string;
  title: string;
}

// Every catch-all ":slug" request goes through here first: if the slug is a
// true same-design duplicate of one of the 6 fixed pages (Admin > Seiten >
// "Duplizieren" on Startseite/Ausbildung/Performance/Reisen/Service/Infos -
// see FixedPageDuplicate model / fixedPageDuplicates.routes.ts), render the
// exact same hardcoded component the original page uses, pointed at the
// copied content via contentId - this is what makes the duplicate's design
// pixel-identical, since it's the same component. Otherwise fall back to
// DynamicPage (the Seiten/Unlayer CMS flow), unchanged.
export const FixedPageRouter = () => {
  const { slug } = useParams<{ slug: string }>();
  const [resolved, setResolved] = useState<ResolvedDuplicate | null | undefined>(undefined);

  useEffect(() => {
    setResolved(undefined);
    fetch(`/api/fixed-page-duplicates/public/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setResolved(data))
      .catch(() => setResolved(null));
  }, [slug]);

  if (resolved === undefined) return null;

  if (resolved) {
    const Component = KIND_COMPONENTS[resolved.kind];
    if (Component) return <Component contentId={resolved.contentId} />;
  }

  return <DynamicPage />;
};
