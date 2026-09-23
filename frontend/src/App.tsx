import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { News } from './pages/News';
import { NewsDetail } from './pages/NewsDetail';
import { Downloads } from './pages/Downloads';
import { Partner } from './pages/Partner';
import { Search } from './pages/Search';
import { Events } from './pages/Events';
import { Ausbildung } from './pages/Ausbildung';
import { Performance } from './pages/Performance';
import { Reisen } from './pages/Reisen';
import { Buchungskalender } from './pages/Buchungskalender';
import { Tandem } from './pages/Tandem';
import { Service } from './pages/Service';
import { Infos } from './pages/Infos';
import { Shop } from './pages/Shop';
import { Anmeldung } from './pages/Anmeldung';
import { Profil } from './pages/Profil';
import { Schnupperkurs } from './pages/Schnupperkurs';
import { LSchein } from './pages/LSchein';
import { ASchein } from './pages/ASchein';
import { BSchein } from './pages/BSchein';
import { Windenschein } from './pages/Windenschein';
import { Tandemschein } from './pages/Tandemschein';
import { Ausbildungskonzept } from './pages/Ausbildungskonzept';
import { Sicherheitstraining } from './pages/Sicherheitstraining';
import { Rettungsgeraetetraining } from './pages/Rettungsgeraetetraining';
import { Refresher } from './pages/Refresher';
import { Groundhandling } from './pages/Groundhandling';
import { BrasilienTour } from './pages/BrasilienTour';
import { KolumbienTour } from './pages/KolumbienTour';
import { SuedafrikaTour } from './pages/SuedafrikaTour';
import { BassanoTour } from './pages/BassanoTour';
import { GriechenlandTour } from './pages/GriechenlandTour';
import { SlowenienTour } from './pages/SlowenienTour';
import { BergamoTour } from './pages/BergamoTour';
import { SavoyeTour } from './pages/SavoyeTour';
import { VogesenTour } from './pages/VogesenTour';
import { PfalzTour } from './pages/PfalzTour';
import { ZweiJahresCheck } from './pages/ZweiJahresCheck';
import { Rettungspacken } from './pages/Rettungspacken';
import { Trimmtuning } from './pages/Trimmtuning';
import { ReparaturService } from './pages/ReparaturService';
import { ServiceAuftrag } from './pages/ServiceAuftrag';
import { Team } from './pages/Team';
import { Gelaende } from './pages/Gelaende';
import { GelaendeDetail } from './pages/GelaendeDetail';
import { Wetter } from './pages/Wetter';
import { Medien } from './pages/Medien';
import { Gruppenevents } from './pages/Gruppenevents';
import { Gutscheine } from './pages/Gutscheine';
import { Versicherungen } from './pages/Versicherungen';
import { LegalPage } from './pages/LegalPage';
import { FAQ } from './pages/FAQ';
import { RatingPage } from './pages/RatingPage';
import { LocationDetail } from './pages/LocationDetail';
import { Locations } from './pages/Locations';
import { OrganizerDetail } from './pages/OrganizerDetail';
import { Organizers } from './pages/Organizers';
import { AdminApp } from './admin/AdminApp';
import { ErrorBoundary } from './pages/ErrorBoundary';
import { BookingSuccess } from './pages/BookingSuccess';
import { BookingCancel } from './pages/BookingCancel';
import { Abmelden } from './pages/Abmelden';
import { TrackingStoppen } from './pages/TrackingStoppen';
import { Bestaetigen } from './pages/Bestaetigen';
import { FixedPageRouter } from './pages/FixedPageRouter';
import { FixedPageGate } from './pages/FixedPageGate';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<FixedPageGate kind="home" defaultSlug={null}><Home /></FixedPageGate>} />
          <Route path="news" element={<News />} />
          <Route path="news/:slug" element={<NewsDetail />} />
          <Route path="downloads" element={<Downloads />} />
          <Route path="partner" element={<Partner />} />
          <Route path="search" element={<Search />} />
          <Route path="events" element={
            <ErrorBoundary>
              <Events />
            </ErrorBoundary>
          } />
          <Route path="ausbildung" element={<FixedPageGate kind="ausbildung" defaultSlug="ausbildung"><Ausbildung /></FixedPageGate>} />
          <Route path="ausbildung/schnupperkurs" element={<FixedPageGate kind="schnupperkurs" defaultSlug="schnupperkurs"><Schnupperkurs /></FixedPageGate>} />
          <Route path="ausbildung/l-schein" element={<FixedPageGate kind="l-schein" defaultSlug="l-schein"><LSchein /></FixedPageGate>} />
          <Route path="ausbildung/a-schein" element={<FixedPageGate kind="a-schein" defaultSlug="a-schein"><ASchein /></FixedPageGate>} />
          <Route path="ausbildung/b-schein" element={<FixedPageGate kind="b-schein" defaultSlug="b-schein"><BSchein /></FixedPageGate>} />
          <Route path="ausbildung/windenschein" element={<FixedPageGate kind="windenschein" defaultSlug="windenschein"><Windenschein /></FixedPageGate>} />
          <Route path="ausbildung/tandemschein" element={<FixedPageGate kind="tandemschein" defaultSlug="tandemschein"><Tandemschein /></FixedPageGate>} />
          <Route path="ausbildung/ausbildungskonzept" element={<FixedPageGate kind="ausbildungskonzept" defaultSlug="ausbildungskonzept"><Ausbildungskonzept /></FixedPageGate>} />
          <Route path="performance" element={<FixedPageGate kind="performance" defaultSlug="performance"><Performance /></FixedPageGate>} />
          <Route path="performance/sicherheitstraining" element={<FixedPageGate kind="sicherheitstraining" defaultSlug="sicherheitstraining"><Sicherheitstraining /></FixedPageGate>} />
          <Route path="performance/rettungsgeraetetraining" element={<FixedPageGate kind="rettungsgeraetetraining" defaultSlug="rettungsgeraetetraining"><Rettungsgeraetetraining /></FixedPageGate>} />
          <Route path="performance/refresher" element={<Refresher />} />
          <Route path="performance/groundhandling" element={<FixedPageGate kind="groundhandling" defaultSlug="groundhandling"><Groundhandling /></FixedPageGate>} />
          <Route path="reisen" element={<FixedPageGate kind="reisen" defaultSlug="reisen"><Reisen /></FixedPageGate>} />
          <Route path="reisen/brasilien-tour" element={<FixedPageGate kind="brasilien-tour" defaultSlug="brasilien-tour"><BrasilienTour /></FixedPageGate>} />
          <Route path="reisen/kolumbien-tour" element={<FixedPageGate kind="kolumbien-tour" defaultSlug="kolumbien-tour"><KolumbienTour /></FixedPageGate>} />
          <Route path="reisen/suedafrika-tour" element={<FixedPageGate kind="suedafrika-tour" defaultSlug="suedafrika-tour"><SuedafrikaTour /></FixedPageGate>} />
          <Route path="reisen/bassano-tour" element={<FixedPageGate kind="bassano-tour" defaultSlug="bassano-tour"><BassanoTour /></FixedPageGate>} />
          <Route path="reisen/griechenland-tour" element={<FixedPageGate kind="griechenland-tour" defaultSlug="griechenland-tour"><GriechenlandTour /></FixedPageGate>} />
          <Route path="reisen/slowenien-tour" element={<FixedPageGate kind="slowenien-tour" defaultSlug="slowenien-tour"><SlowenienTour /></FixedPageGate>} />
          <Route path="reisen/bergamo-tour" element={<FixedPageGate kind="bergamo-tour" defaultSlug="bergamo-tour"><BergamoTour /></FixedPageGate>} />
          <Route path="reisen/savoye-tour" element={<FixedPageGate kind="savoye-tour" defaultSlug="savoye-tour"><SavoyeTour /></FixedPageGate>} />
          <Route path="reisen/vogesen-tour" element={<FixedPageGate kind="vogesen-tour" defaultSlug="vogesen-tour"><VogesenTour /></FixedPageGate>} />
          <Route path="reisen/pfalz-tour" element={<FixedPageGate kind="pfalz-tour" defaultSlug="pfalz-tour"><PfalzTour /></FixedPageGate>} />
          <Route path="buchungskalender" element={<Buchungskalender />} />
          <Route path="buchungskalender/:eventId" element={<Buchungskalender />} />
          <Route path="tandem" element={<Tandem />} />
          <Route path="service" element={<FixedPageGate kind="service" defaultSlug="service"><Service /></FixedPageGate>} />
          <Route path="service/2-jahres-check" element={<FixedPageGate kind="2-jahres-check" defaultSlug="2-jahres-check"><ZweiJahresCheck /></FixedPageGate>} />
          <Route path="service/rettungspacken" element={<FixedPageGate kind="rettungspacken" defaultSlug="rettungspacken"><Rettungspacken /></FixedPageGate>} />
          <Route path="service/trimmtuning" element={<FixedPageGate kind="trimmtuning" defaultSlug="trimmtuning"><Trimmtuning /></FixedPageGate>} />
          <Route path="service/reparatur" element={<FixedPageGate kind="reparatur" defaultSlug="reparatur"><ReparaturService /></FixedPageGate>} />
          <Route path="service/service-auftrag" element={<ServiceAuftrag />} />
          <Route path="infos" element={<FixedPageGate kind="infos" defaultSlug="infos"><Infos /></FixedPageGate>} />
          <Route path="infos/team" element={<FixedPageGate kind="team" defaultSlug="team"><Team /></FixedPageGate>} />
          <Route path="infos/gelaende" element={<FixedPageGate kind="gelaende" defaultSlug="gelaende"><Gelaende /></FixedPageGate>} />
          <Route path="infos/gelaende/:slug" element={<GelaendeDetail />} />
          <Route path="infos/wetter" element={<FixedPageGate kind="wetter" defaultSlug="wetter"><Wetter /></FixedPageGate>} />
          <Route path="infos/medien" element={<FixedPageGate kind="medien" defaultSlug="medien"><Medien /></FixedPageGate>} />
          <Route path="infos/gruppenevents" element={<FixedPageGate kind="gruppenevents" defaultSlug="gruppenevents"><Gruppenevents /></FixedPageGate>} />
          <Route path="infos/gutscheine" element={<FixedPageGate kind="gutscheine" defaultSlug="gutscheine"><Gutscheine /></FixedPageGate>} />
          <Route path="infos/versicherungen" element={<FixedPageGate kind="versicherungen" defaultSlug="versicherungen"><Versicherungen /></FixedPageGate>} />
          <Route path="agb" element={<LegalPage slug="agb" />} />
          <Route path="widerrufsbelehrung" element={<LegalPage slug="widerruf" />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="datenschutz" element={<LegalPage slug="datenschutz" />} />
          <Route path="impressum" element={<LegalPage slug="impressum" />} />
          <Route path="bewertung/:bookingId" element={<RatingPage />} />
          <Route path="veranstaltungsorte" element={<Locations />} />
          <Route path="veranstaltungsort/:id" element={<LocationDetail />} />
          <Route path="veranstalter" element={<Organizers />} />
          <Route path="veranstalter/:id" element={<OrganizerDetail />} />
          <Route path="shop" element={<Shop />} />
          <Route path="anmeldung" element={<Anmeldung />} />
          <Route path="profil" element={<Profil />} />
          <Route path="booking-success" element={<BookingSuccess />} />
          <Route path="booking-cancel" element={<BookingCancel />} />
          <Route path="newsletter/abmelden" element={<Abmelden />} />
          <Route path="newsletter/tracking-stoppen" element={<TrackingStoppen />} />
          <Route path="newsletter/bestaetigen" element={<Bestaetigen />} />
          {/* Seiten CMS - admin-created pages, and true same-design
              duplicates of the 6 fixed pages (Admin > Seiten >
              "Duplizieren"). Must stay last: react-router ranks static path
              segments above a same-depth dynamic one regardless of
              declaration order, so this can't shadow any route above, but
              keeping it last matches that intent for readability. See
              FixedPageRouter.tsx, which checks fixed-page duplicates first
              and falls back to DynamicPage (Seiten/Unlayer CMS). */}
          <Route path=":slug" element={<FixedPageRouter />} />
          {/* Future Routes */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

