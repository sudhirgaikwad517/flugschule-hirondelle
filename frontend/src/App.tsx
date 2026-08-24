import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
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
import { Wetter } from './pages/Wetter';
import { Medien } from './pages/Medien';
import { Gruppenevents } from './pages/Gruppenevents';
import { Gutscheine } from './pages/Gutscheine';
import { Versicherungen } from './pages/Versicherungen';
import { AdminApp } from './admin/AdminApp';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="events" element={<Events />} />
          <Route path="ausbildung" element={<Ausbildung />} />
          <Route path="ausbildung/schnupperkurs" element={<Schnupperkurs />} />
          <Route path="ausbildung/l-schein" element={<LSchein />} />
          <Route path="ausbildung/a-schein" element={<ASchein />} />
          <Route path="ausbildung/b-schein" element={<BSchein />} />
          <Route path="ausbildung/windenschein" element={<Windenschein />} />
          <Route path="ausbildung/tandemschein" element={<Tandemschein />} />
          <Route path="ausbildung/ausbildungskonzept" element={<Ausbildungskonzept />} />
          <Route path="performance" element={<Performance />} />
          <Route path="performance/sicherheitstraining" element={<Sicherheitstraining />} />
          <Route path="performance/rettungsgeraetetraining" element={<Rettungsgeraetetraining />} />
          <Route path="performance/refresher" element={<Refresher />} />
          <Route path="performance/groundhandling" element={<Groundhandling />} />
          <Route path="reisen" element={<Reisen />} />
          <Route path="reisen/brasilien-tour" element={<BrasilienTour />} />
          <Route path="reisen/kolumbien-tour" element={<KolumbienTour />} />
          <Route path="reisen/suedafrika-tour" element={<SuedafrikaTour />} />
          <Route path="reisen/bassano-tour" element={<BassanoTour />} />
          <Route path="reisen/griechenland-tour" element={<GriechenlandTour />} />
          <Route path="reisen/slowenien-tour" element={<SlowenienTour />} />
          <Route path="reisen/bergamo-tour" element={<BergamoTour />} />
          <Route path="reisen/savoye-tour" element={<SavoyeTour />} />
          <Route path="reisen/vogesen-tour" element={<VogesenTour />} />
          <Route path="reisen/pfalz-tour" element={<PfalzTour />} />
          <Route path="buchungskalender" element={<Buchungskalender />} />
          <Route path="buchungskalender/:eventId" element={<Buchungskalender />} />
          <Route path="tandem" element={<Tandem />} />
          <Route path="service" element={<Service />} />
          <Route path="service/2-jahres-check" element={<ZweiJahresCheck />} />
          <Route path="service/rettungspacken" element={<Rettungspacken />} />
          <Route path="service/trimmtuning" element={<Trimmtuning />} />
          <Route path="service/reparatur" element={<ReparaturService />} />
          <Route path="service/service-auftrag" element={<ServiceAuftrag />} />
          <Route path="infos" element={<Infos />} />
          <Route path="infos/team" element={<Team />} />
          <Route path="infos/gelaende" element={<Gelaende />} />
          <Route path="infos/wetter" element={<Wetter />} />
          <Route path="infos/medien" element={<Medien />} />
          <Route path="infos/gruppenevents" element={<Gruppenevents />} />
          <Route path="infos/gutscheine" element={<Gutscheine />} />
          <Route path="infos/versicherungen" element={<Versicherungen />} />
          <Route path="shop" element={<Shop />} />
          <Route path="anmeldung" element={<Anmeldung />} />
          <Route path="profil" element={<Profil />} />
          {/* Future Routes */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

