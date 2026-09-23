import { useEffect, useState, type ComponentType } from 'react';
import { useParams } from 'react-router-dom';
import { Home } from './Home';
import { Ausbildung } from './Ausbildung';
import { Performance } from './Performance';
import { Reisen } from './Reisen';
import { Service } from './Service';
import { Infos } from './Infos';
import { Team } from './Team';
import { Gelaende } from './Gelaende';
import { Wetter } from './Wetter';
import { Medien } from './Medien';
import { Gruppenevents } from './Gruppenevents';
import { Gutscheine } from './Gutscheine';
import { Versicherungen } from './Versicherungen';
import { Schnupperkurs } from './Schnupperkurs';
import { LSchein } from './LSchein';
import { ASchein } from './ASchein';
import { BSchein } from './BSchein';
import { Windenschein } from './Windenschein';
import { Tandemschein } from './Tandemschein';
import { Ausbildungskonzept } from './Ausbildungskonzept';
import { Sicherheitstraining } from './Sicherheitstraining';
import { Rettungsgeraetetraining } from './Rettungsgeraetetraining';
import { Groundhandling } from './Groundhandling';
import { BrasilienTour } from './BrasilienTour';
import { KolumbienTour } from './KolumbienTour';
import { SuedafrikaTour } from './SuedafrikaTour';
import { BassanoTour } from './BassanoTour';
import { GriechenlandTour } from './GriechenlandTour';
import { SlowenienTour } from './SlowenienTour';
import { BergamoTour } from './BergamoTour';
import { SavoyeTour } from './SavoyeTour';
import { VogesenTour } from './VogesenTour';
import { PfalzTour } from './PfalzTour';
import { ZweiJahresCheck } from './ZweiJahresCheck';
import { Rettungspacken } from './Rettungspacken';
import { Trimmtuning } from './Trimmtuning';
import { ReparaturService } from './ReparaturService';
import { Billings } from './Billings';
import { Erlau } from './Erlau';
import { Gadern } from './Gadern';
import { LindenfelsGelaende } from './Lindenfels';
import { NonrodNordost } from './NonrodNordost';
import { Nonrod } from './Nonrod';
import { Stauf } from './Stauf';
import { Winterkasten } from './Winterkasten';
import { BadKreuznach } from './BadKreuznach';
import { Herrenteich } from './Herrenteich';
import { DynamicPage } from './DynamicPage';

const KIND_COMPONENTS: Record<string, ComponentType<{ contentId?: string }>> = {
  home: Home,
  ausbildung: Ausbildung,
  performance: Performance,
  reisen: Reisen,
  service: Service,
  infos: Infos,
  team: Team,
  gelaende: Gelaende,
  wetter: Wetter,
  medien: Medien,
  gruppenevents: Gruppenevents,
  gutscheine: Gutscheine,
  versicherungen: Versicherungen,
  schnupperkurs: Schnupperkurs,
  'l-schein': LSchein,
  'a-schein': ASchein,
  'b-schein': BSchein,
  windenschein: Windenschein,
  tandemschein: Tandemschein,
  ausbildungskonzept: Ausbildungskonzept,
  sicherheitstraining: Sicherheitstraining,
  rettungsgeraetetraining: Rettungsgeraetetraining,
  groundhandling: Groundhandling,
  'brasilien-tour': BrasilienTour,
  'kolumbien-tour': KolumbienTour,
  'suedafrika-tour': SuedafrikaTour,
  'bassano-tour': BassanoTour,
  'griechenland-tour': GriechenlandTour,
  'slowenien-tour': SlowenienTour,
  'bergamo-tour': BergamoTour,
  'savoye-tour': SavoyeTour,
  'vogesen-tour': VogesenTour,
  'pfalz-tour': PfalzTour,
  '2-jahres-check': ZweiJahresCheck,
  rettungspacken: Rettungspacken,
  trimmtuning: Trimmtuning,
  reparatur: ReparaturService,
  billings: Billings,
  erlau: Erlau,
  gadern: Gadern,
  lindenfels: LindenfelsGelaende,
  'nonrod-nordost': NonrodNordost,
  nonrod: Nonrod,
  stauf: Stauf,
  winterkasten: Winterkasten,
  'bad-kreuznach': BadKreuznach,
  herrenteich: Herrenteich,
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
