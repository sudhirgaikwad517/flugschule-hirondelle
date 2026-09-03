import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Banner } from '../components/common/Banner';
import { Check } from 'lucide-react';

interface PageMedia {
  headerImageUrl: string | null;
  contentMediaType: 'IMAGE' | 'VIDEO';
  contentImageUrl: string | null;
  contentYoutubeUrl: string | null;
  galleryImages: string | null;
}

export const Sicherheitstraining = () => {
  const [media, setMedia] = useState<PageMedia | null>(null);

  useEffect(() => {
    fetch('/api/pagemedia/public/sicherheitstraining')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setMedia(data);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="w-full bg-white font-luxurysans">
      {/* Banner Component */}
      <Banner />

      {/* Main Content Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column (Content) */}
          <div className="lg:col-span-8 space-y-12">
            
            <div>
              <h1 className="font-luxury text-4xl md:text-5xl text-[#53a8c7] uppercase tracking-wider mb-2">
                SICHERHEITSTRAINING - GARDASEE
              </h1>
              <div className="w-full h-px bg-[#53a8c7]/30"></div>
            </div>

            {/* Featured Image or Video Slot */}
            <div className="w-full min-h-[400px] overflow-hidden rounded-sm shadow-sm group">
              {media?.contentMediaType === 'VIDEO' && media?.contentYoutubeUrl ? (
                <iframe
                  className="w-full h-[400px]"
                  src={media.contentYoutubeUrl}
                  title="Sicherheitstraining Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <img 
                  src={media?.contentImageUrl || "https://picsum.photos/id/1054/1000/600"} 
                  alt="Sicherheitstraining Gardasee" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              )}
            </div>

            {/* Content Blocks (Top Part) */}
            <div className="space-y-10 text-gray-600 font-light leading-relaxed text-justify">
              
              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic text-left">Sicherheitstraining am Gardasee...</h3>
                <div className="space-y-4">
                  <p>Mit unserem eigenen Sicherheitstraining am Gardasee bieten wir euch ein Gelände, in dem ihr von noch mehr Höhe für eure Trainingseinheiten profotiert.</p>
                  <p>Sicherheit beim Gleitschirmfliegen ist ein sehr wichtiges Thema. Wer sicher fliegt, fliegt auch mit Freude. Ein Sicherheitstraining ist die beste Gelegenheit, sich selbst und den Gleitschirm in besonderen Flugzuständen kennen zu lernen und die Flugtechnik zu verbessern. Fünf Tage für deine Sicherheit, für die Verbesserung von richtigen Reaktionen und deinem fliegerischem Können.</p>
                  <p>Am Südrand der italienischen Alpen liegt der wunderschöne Gardasee, den wir als Ausgangspunkt unseres Sicherheitstrainings genießen dürfen. Der Gardasee selbst bietet durch seine Lage außerdem Erholung mit Urlaubscharakter.</p>
                  <p>Durch kleine Gruppengrößen entsteht kein Streß. Es bleibt viel Zeit für eine ausgiebige Videoanalyse, gründliche Vorbereitung und Zeit für alle offenen Fragen. Bei uns ist das „Premium“ oder „VIP“ Training anderer Flugschulen der Standard, weil wir glauben, dass nur so genug Raum für alle Teilnehmer bleibt.</p>
                </div>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic text-left">Unser exclusives Sicherheitstraining bietet euch...</h3>
                <ul className="list-disc pl-5 space-y-2 text-left">
                  <li>5 Trainingstage – genügend Zeit um, das Trainingsziel entspannt und sicher zu erreichen</li>
                  <li>kleine Gruppen von 10 bis maximal 12 Teilnehmern, persönlich und effizient</li>
                  <li>garantiert sind 5 Trainingsflüge, bei wetterbedingtem Ausfall können die entsprechenden Flüge zu einem anderen Termin kostenlos nachgeholt werden. Durch die enorme Arbeitshöhe können doppelt so viele Übungen in einem Flug absolviert werden als in anderen Gebieten.</li>
                  <li>das Fluggebiet am Monte Baldo ist ein ideales Trainingsgelände aufgrund seiner 1.700 m Höhendifferenz mit riesigem, sicherem Startplatz in mehrere Richtungen, sowie dem großen Landeplatz, der einfach anzufliegen ist. Trotzdem weisen wir unsere Teilnehmer am Landeplatz per Funk ein.</li>
                  <li>für die Sicherheit sorgen ein professionelles Lehrteam und eine professionelle Wasserrettung. Wir verwenden Automatik-Schwimmwesten.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic text-left">Trainingsaufbau</h3>
                <ul className="list-disc pl-5 space-y-1 text-left">
                  <li>Einfliegen + Aufwärmtraining</li>
                  <li>Orientierung im 3-dimensionalen Raum</li>
                  <li>Abstiegsmethoden</li>
                  <li>Fliehkrafttraining</li>
                  <li>Klappertraining</li>
                  <li>Strömungsabriß (für Fortgeschrittene)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-4 space-y-12 mt-12 lg:mt-0">
            
            {/* Quick Links Blocks */}
            <div className="flex flex-col">
              <Link to="/performance" className="bg-[#e67e22] hover:opacity-90 text-white text-center py-3 font-semibold text-[15px] transition-opacity border-b border-white/20">
                Streckenflugtraining
              </Link>
              <Link to="/performance/sicherheitstraining" className="bg-[#e74c3c] hover:opacity-90 text-white text-center py-3 font-semibold text-[15px] transition-opacity border-b border-white/20">
                Sicherheitstraining
              </Link>
              <Link to="/performance" className="bg-[#27ae60] hover:opacity-90 text-white text-center py-3 font-semibold text-[15px] transition-opacity border-b border-white/20">
                Thermik- und Flugtechniktraining
              </Link>
              <Link to="/performance" className="bg-[#53a8c7] hover:opacity-90 text-white text-center py-3 font-semibold text-[15px] transition-opacity">
                Rettungsgerätetraining
              </Link>
            </div>

            {/* Booking Card */}
            <div className="bg-[#FAF9F7] border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#53a8c7] transform origin-left transition-transform duration-500 scale-x-0 group-hover:scale-x-100"></div>
              
              <div className="p-8">
                <Link 
                  to="/events?category=Performance%20Training"
                  className="block w-full bg-[#53a8c7] hover:bg-[#4396b5] text-white text-center py-3 rounded-full text-lg font-semibold transition-colors mb-10 shadow-md flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                  Kurs buchen
                </Link>

                <div className="space-y-6 mb-8">
                  <div className="border-b border-gray-200 pb-6">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div className="text-gray-600 font-light text-[13px]">
                        <p className="font-bold text-luxury-dark mb-1">Kurspreis</p>
                        <p>Eigene Ausrüstung erforderlich</p>
                      </div>
                      <p className="font-bold text-luxury-dark text-lg whitespace-nowrap mt-0.5">950,- €</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-gray-600 font-light text-[13px] leading-relaxed">
                      <p className="font-bold text-luxury-dark mb-1">Zusatzkosten</p>
                      <p>Unterkunft / Verpflegung, Seilbahn für die Auffahrt</p>
                    </div>
                  </div>
                </div>
              </div>

              <Link 
                to="/events?category=Performance%20Training" 
                className="w-full block bg-[#394553] hover:bg-luxury-gold text-white text-center py-4 px-2 text-sm font-semibold transition-colors leading-relaxed"
              >
                Termin siehe Kalender
              </Link>
            </div>

            {/* Voucher Box */}
            <div>
               <h3 className="font-luxury text-2xl text-[#53a8c7] mb-4 uppercase tracking-wider border-b border-gray-200 pb-4">
                 Training Verschenken
               </h3>
               <p className="text-gray-500 font-light text-sm mb-4">
                 Das Sicherheitstraining ist auch als Geschenk-Gutschein möglich.
               </p>
               <div className="w-full h-[180px] rounded-sm overflow-hidden shadow-sm relative group cursor-pointer border border-gray-200">
                  <img src="/images/gutscheine/gutschein.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gutschein" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                     <p className="text-white font-luxury text-3xl font-bold italic opacity-90 drop-shadow-md tracking-wider">GUTSCHEIN</p>
                  </div>
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-sm">
                     <p className="text-luxury-dark text-[10px] font-bold uppercase tracking-widest">Flugschule Hirondelle</p>
                  </div>
               </div>
            </div>

            {/* Impressions Gallery */}
            {media?.galleryImages && Array.isArray(media.galleryImages) && media.galleryImages.length > 0 && (
              <div>
                 <h3 className="font-luxury text-2xl text-[#53a8c7] mb-6 uppercase tracking-wider border-b border-gray-200 pb-4">
                   Impressionen
                 </h3>
                 <div className="grid grid-cols-2 gap-2">
                   {media.galleryImages.map((img: string, index: number) => (
                     <div key={index} className="aspect-square overflow-hidden group cursor-pointer bg-gray-100">
                       <img 
                         src={img} 
                         alt={`Impression ${index + 1}`} 
                         className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                       />
                     </div>
                   ))}
                 </div>
              </div>
            )}

          </div>

        </div>

        {/* Bottom Full-Width Content (To avoid empty right space) */}
        <div className="max-w-[1200px] mx-auto mt-16 lg:mt-24">
          <hr className="border-gray-100 mb-16" />
          
          <div className="space-y-16 text-gray-600 font-light leading-relaxed text-justify">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic text-left">Trainingsablauf</h3>
                <div className="space-y-4">
                  <p>Anreisetag ist der Samstag, das Training selbst beginnt am Sonntag. Der erste Kurstag (Sonntag) ist vorgesehen, um das Fluggelände kennen zu lernen und die Flugmanöver theoretisch durchzusprechen. Das Training beginnt mit einer umfassenden Ausrüstungskontrolle und Gurtzeugeinstellung, Retter-Probeauslösung und Funk-/Schwimmwestenausgabe, Landeplatzbesprechung und Gefahreneinweisung im Falle einer Wasserlandung. Bei einem Eingewöhnungsflug werden die ersten Übungen geflogen.</p>
                  <p>Ab dem 2. - 5. Tag werden täglich zuerst die jeweiligen Übungen besprochen, dann erflogen und anschließend durch Videoanalyse ausgewertet.</p>
                  <p>Pro Trainingstag sind 2-3 Flüge vorgesehen, am ersten und letzten Tag jeweils einer.</p>
                </div>
              </div>

              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic text-left">Flugübungen</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ul className="list-disc pl-5 space-y-2 text-left">
                    <li>Nicken und abfangen</li>
                    <li>Rollen und abfangen</li>
                    <li>Frontklapper unbeschleunigt und beschleunigt</li>
                    <li>Seitenklapper unbeschleunigt und beschleunigt</li>
                    <li>Einleitphase Steilspirale</li>
                    <li>Ohren anlegen und beschleunigen</li>
                  </ul>
                  <ul className="list-disc pl-5 space-y-2 text-left">
                    <li>B-Leinen Stall</li>
                    <li>Steilspirale (optional)</li>
                    <li>Trudeln (optional)</li>
                    <li>Fullstall (optional)</li>
                    <li>Retter werfen (optional)</li>
                    <li>weitere Manöver auf Anfrage</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="max-w-4xl">
              <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic text-left">Das Sicherheitstraining-Team besteht aus...</h3>
              <p className="mb-8">
                Das Team bei den exclusiven Sicherheitstrainings besteht aus dem Trainingsleiter, einem erfahrenen Startleiter und einem Kameramann für die Videoaufzeichnungen. Wir arbeiten mit mind. zwei Fluglehrern, einem am Startplatz und dem Trainingsleiter direkt am See, so dass dieser im Falle einer Wasserlandung schnell mit dem einsatzbereiten Rettungsboot in kürzester Zeit bei dir ist. Der Fluglehrer am Startplatz steht für alle noch offenen Fragen zur Verfügung, gibt dir wertvolle Tipps beim Start und sorgt für einen reibungslosen und stressfreien Ablauf am Startplatz. Nach dem Start begleitet er dich über Funk, bis der Fluglehrer am See übernimmt und du die im Vorfeld vereinbarten Flugfiguren beginnen kannst. Die Übungen werden von unserem Kameramann auf Video aufgenommen. Während deiner Flüge bekommst du in der Luft über Funk Hilfen und Anweisungen zu deinen Übungen und sofortige Korrekturen bei eventuellen Fehlern. Da immer nur ein Teilnehmer Übungen durchführt, kann auf das Flugkönnen jedes Einzelnen genauestens eingegangen werden.
              </p>
              <div className="flex items-center gap-6 bg-gray-50 p-6 rounded-sm border border-gray-100 shadow-sm inline-flex">
                <img src="/images/team/schlink.jpg" alt="Alex Schlink" className="w-20 h-20 rounded-full object-cover border-2 border-luxury-gold/30" />
                <p className="font-medium text-[15px] text-luxury-dark text-left">Startleiter: Alex, Performance-Trainer<br/>und Ausbildungsleiter der Flugschule Hirondelle</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="font-luxury text-2xl text-luxury-dark mb-4 italic text-left">Unterkunft / Region</h3>
                <div className="space-y-4">
                  <p>Das besonders günstige Mikroklima des Gardasees ermöglicht fast täglich Flüge vom Monte Baldo, Sommer wie Winter.</p>
                  <p>Die moderne Panorama – Seilbahn befördert die Piloten sicher und schnell zum Startplatz – im Falle langer Wartezeiten fahren wir mit unseren Teilnehmern direkt zur Mittelstation.</p>
                  <p>Das mediterrane Klima in Malcesine lädt nach dem Fliegen zum entspannten Spaziergang im malerischen Ort Malcesine ein und die wunderschöne Umgebung bietet auch nicht fliegender Begleitung vielseitige Möglichkeiten zur Urlaubsgestaltung.</p>
                  <p>Zur Übernachtung stehen mehrere Hotels zur Verfügung, aber auch Ferienappartments und Campingplätze sind in nächster Umgebung zahlreich vorhanden. So kann das exclusive Sicherheitstraining am Gardasee/Monte Baldo auch zum Urlaubsziel für die ganze Familie werden. Die Reservierung des Hotels erfolgt über uns.</p>
                  <p className="font-medium text-luxury-dark pt-2 text-left">Im Rahmen des Sicherheitstrainings ist eine eigene Ausrüstung erforderlich!</p>
                </div>
              </div>

              <div>
                <h2 className="font-luxury text-3xl text-[#53a8c7] mb-8 uppercase text-left">Unsere Leistungen</h2>
                <ul className="space-y-4 text-left">
                  {[
                    'Kompetente Fachbetreuung durch einen zertifizierten Sicherheitstrainer',
                    'Umfassende Betreuung am Starplatz durch Alex Schlink (Performancetrainer)',
                    'Aufzeichnung der Flugmanöver mit anschließender Videoanalyse',
                    'Ohnmachtssichere Automatikschwimmwesten (ohne Einschränkung der Bewegungsfreiheit)',
                    'Funkverbindung',
                    'Ausführlicher Theorieunterricht inkl. täglichem Briefing der bevorstehenden Flugmanöver',
                    'Leistungsstarkes Rettungsboot',
                    'Mentale Vorbereitung auf die einzelnen Flugfiguren',
                    'exkl. Anreise, Unterkunft, Verpflegung, Seilbahn'
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-3 text-gray-600 font-light">
                      <Check className="w-5 h-5 text-luxury-gold shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
