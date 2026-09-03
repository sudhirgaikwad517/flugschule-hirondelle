import React, { useState } from 'react';
import { Banner } from '../components/common/Banner';

export const Tandem = () => {
  const [showVideo, setShowVideo] = useState(false);
  return (
    <div className="w-full bg-white pb-20">
      <Banner />

      <div className="container mx-auto px-4 py-8 max-w-[1200px]">
        {/* Main Title */}
        <div className="text-center mb-16 mt-8">
          <h1 className="font-luxury text-4xl md:text-5xl lg:text-6xl text-luxury-dark mb-6 tracking-wide break-words hyphens-auto uppercase">
            EIN TANDEMFLUG MIT DEM GLEITSCHIRM?
          </h1>
          <div className="w-24 h-px bg-luxury-gold mx-auto mb-8"></div>
        </div>

        {/* 2-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-12 mb-16">
          {/* Left Column (Video & Text) */}
          <div className="w-full lg:w-3/5">
            {/* Video */}
            <div className="relative w-full aspect-video bg-black mb-12 group overflow-hidden rounded-sm shadow-xl">
              {showVideo ? (
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/o1MzMmYM_ls?autoplay=1"
                  title="Tandemflug in der Pfalz - Flugschule Hirondelle"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <button type="button" onClick={() => setShowVideo(true)} className="w-full h-full block cursor-pointer">
                  <div className="absolute inset-4 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div>
                  <img
                    src="/images/tandem-page/hero.jpg"
                    alt="Tandemflug in der Pfalz"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-colors group-hover:bg-black/20">
                    <div className="w-20 h-20 rounded-full border border-white/80 flex items-center justify-center backdrop-blur-sm group-hover:border-luxury-gold transition-colors">
                      <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-2 group-hover:border-l-luxury-gold transition-colors"></div>
                    </div>
                  </div>
                  <div className="absolute top-6 left-6 flex items-center gap-4 z-20 text-left">
                    <div className="w-12 h-12 bg-luxury-gold/80 rounded-full flex items-center justify-center text-white font-luxury text-2xl backdrop-blur-sm border border-white/30">A</div>
                    <div className="text-white drop-shadow-md">
                      <div className="font-luxury text-xl tracking-wide">Tandemflug in der Pfalz</div>
                      <div className="text-xs uppercase tracking-widest opacity-90">Alexander Schlink</div>
                    </div>
                  </div>
                </button>
              )}
            </div>

            <h3 className="text-xl md:text-2xl italic text-luxury-gold font-luxury mb-6 leading-relaxed max-w-4xl">
              "Der erste Schritt, um sicher in die Luft zu kommen!"
            </h3>
            
            <div className="space-y-6 text-[15px] font-light text-gray-500 leading-relaxed text-justify">
              <p>Ein ganz besonderes Erlebnis erwartet euch bei einem Tandemflug mit einem unserer Piloten hier in der Region Rhein/Main/Neckar, Odenwald oder Pfalz.</p>
              <p>Da wir fürs Tandemfliegen spezielle Wind- und Wetterbedingungen brauchen und nur ganz bestimmte Gelände hier in der Region dafür nutzen können, kann es schon mal sein, dass man etwas auf einen passenden Termin warten muss. Aber es lohnt sich - versprochen :-)</p>
              <p>Wir fliegen im Moment mainly in Heidelberg, Schriesheim und in Erlau (Odenwald). Ab und zu auch in der Pfalz bei Annweiler, an der Madenburg oder auch an der Winde bei Speyer bzw. in Offenbach bei Landau.</p>
              <p>Je nach Wetterbedingungen und welcher unserer Piloten gerade Zeit hat, wählen wir den Flugort aus - das ist leider nicht wählbar. Die Termine sind ganzwöchig von Montag bis Sonntag und auch ganzjährig, also nicht nur im Sommer. Im Winter sind auch ab und an schöne Flüge möglich. Einziges Manko - man muss sich etwas dicker anziehen...</p>
              <p>Da wir mit der Flugschule sehr oft im Ausland unterwegs sind und die Tandemflüge oft von unterwegs abwickeln, haben wir ein spezielles System für die Abwicklung der Termine.</p>
            </div>
          </div>

          {/* Right Column (Pricing & Impressions) */}
          <div className="w-full lg:w-2/5">
            {/* Pricing Box */}
            <div className="mb-8 border border-gray-200 rounded-sm overflow-hidden shadow-sm">
              <div className="bg-luxury-slate text-luxury-gold text-center py-4 uppercase tracking-widest font-semibold text-[11px]">
                TANDEMFLÜGE
              </div>
              <div className="bg-white p-6 flex justify-between items-center text-gray-800 border-b border-luxury-gold">
                <span className="text-[14px] font-light text-gray-500">Tandemflug - Barzahlung vor Ort</span>
                <span className="font-luxury text-2xl text-luxury-dark">150,- €</span>
              </div>
            </div>

            {/* Warning Text */}
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-12 rounded-sm shadow-sm">
              <p className="text-red-800 text-[13px] leading-relaxed font-light">
                <span className="font-bold uppercase tracking-widest block mb-1">Achtung:</span> 
                Wir verkaufen keine Gutscheine für Tandemflüge - es können nur bereits erworbene Gutscheine eingelöst werden. Wer ohne Gutschein mitfliegen will, einfach unten in den Tandemnewsletter eintragen und dann beim Termin bar zahlen.
              </p>
            </div>

            {/* Impressions */}
            <div className="mb-8">
              <h3 className="font-luxury text-2xl text-luxury-dark mb-4 uppercase tracking-wide">IMPRESSIONEN</h3>
              <div className="w-12 h-px bg-luxury-gold mb-6"></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="overflow-hidden rounded-sm relative group"><div className="absolute inset-2 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div><img src="/images/tandem-page/gallery-1.jpg" alt="Impression 1" className="w-full h-auto transition-transform duration-1000 group-hover:scale-105" /></div>
                <div className="overflow-hidden rounded-sm mt-8 relative group"><div className="absolute inset-2 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div><img src="/images/tandem-page/gallery-2.jpg" alt="Impression 2" className="w-full h-auto transition-transform duration-1000 group-hover:scale-105" /></div>
                <div className="overflow-hidden rounded-sm -mt-8 relative group"><div className="absolute inset-2 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div><img src="/images/tandem-page/gallery-3.jpg" alt="Impression 3" className="w-full h-auto transition-transform duration-1000 group-hover:scale-105" /></div>
                <div className="overflow-hidden rounded-sm relative group"><div className="absolute inset-2 border border-white/40 pointer-events-none z-10 transition-colors group-hover:border-luxury-gold/50"></div><img src="/images/tandem-page/gallery-4.jpg" alt="Impression 4" className="w-full h-auto transition-transform duration-1000 group-hover:scale-105" /></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-20">
          <h2 className="font-luxury text-3xl text-luxury-dark mb-4 uppercase tracking-wide">TERMIN VEREINBAREN - SO FUNKTIONIERT'S...</h2>
          <div className="w-12 h-px bg-luxury-gold mb-8"></div>

          <div className="space-y-6 text-[15px] font-light text-gray-500 leading-relaxed mb-10 max-w-4xl text-justify">
            <p>Gleitschirmfliegen ist wetterabhängig. Wir brauchen Wind in richtiger Stärke und aus der geeigneten Richtung. Weil es selbst den besten Wetterfröschen kaum möglich ist, das Wetter auf längere Sicht abzuschätzen, bieten wir euch ein eigenes System zur Terminvereinbarung an, um die vereinbarten Tandemflüge sicher durchzuführen.</p>
            <p>Wir haben daher zur Terminvereinbarung einen Tandem-Newsletter auf unserer Homepage unten eingerichtet. In diesen Tandemnewsletter (wichtig - nicht in den allgemeinen Newsletter eintragen!!!) tragt ihr euch ein.</p>
            <p>Wenn wir passendes Wetter (nur Sonne reicht nicht) zum Tandemfliegen sehen und auch Zeit haben, die Flüge durchzuführen, schicken wir eine E-Mail an alle, die sich im Tandemnewsletter angemeldet haben. An so einem Termin bieten wir in der Regel zwischen 3-5 Flüge pro Tag an. Wenn ihr zu diesem Termin Lust und Zeit habt, meldet ihr euch schnellstmöglich mit den in unserer Mail gefragten Details zurück und bekommt dann von uns nochmal Rückantwort via E-Mail mit dem genauen Treffpunkt und der Uhrzeit. Ganz wichtig: es bekommen nur die Schnellsten eine Rückantwort die auch den Zuschlag für den Flug bekommen.</p>
            <p>Falls ihr jemanden mit einem Tandemflug beschenken wollt, könnt ihr gerne selbst einen Gutschein basteln und diesen verschenken. Bezahlt wird allerdings bar vor Ort beim Tandempiloten. Wir haben in der Vergangenheit oft Gutscheine ausgestellt, die die Beschenkten dann mitunter nicht einlösen konnten, da deren Freizeit nicht zu unseren Terminen gepasst haben.</p>
            <p>Wir haben über die Jahre schon viel ausprobiert wie wir die Abwicklung organisieren können und dies ist der beste und einzige Weg. Da es für uns nur wie oben beschrieben funktioniert, vereinbaren wir auch keine Wunschtermine und vergeben auch auf telefonische Nachfrage keine Tandemtermine.</p>
            <p>Falls jemand noch schneller in die Luft möchte können wir euch alternativ unseren <a href="#" className="text-luxury-gold hover:underline font-semibold">Schnupperkurs</a> wärmstens empfehlen.</p>
          </div>

          {/* Newsletter Form */}
          <div className="bg-white border border-gray-200 p-8 rounded-sm shadow-sm max-w-2xl text-center">
            <h3 className="font-luxury text-2xl text-luxury-dark mb-4 uppercase tracking-wide">TANDEM-NEWSLETTER</h3>
            <p className="text-gray-500 font-light text-[14px] mb-6">Tragen Sie Ihre E-Mail Adresse ein, um über neue Tandem-Termine informiert zu werden.</p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const email = (form.elements.namedItem('email') as HTMLInputElement).value;
              
              try {
                const res = await fetch('/api/newsletters/subscribe', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email, listType: 'TANDEM' })
                });
                
                const data = await res.json();
                if (res.ok) {
                  alert('Erfolgreich zum Tandem-Newsletter angemeldet!');
                  form.reset();
                } else {
                  alert(data.message || 'Ein Fehler ist aufgetreten');
                }
              } catch (err) {
                alert('Netzwerkfehler. Bitte versuchen Sie es später erneut.');
              }
            }} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <input 
                type="email" 
                name="email"
                placeholder="Ihre E-Mail Adresse" 
                required
                className="w-full sm:w-2/3 px-4 py-3 border border-gray-300 focus:outline-none focus:border-luxury-gold rounded-sm font-light"
              />
              <button 
                type="submit" 
                className="px-8 py-3 bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors duration-300 uppercase tracking-widest text-[10px] font-semibold rounded-sm w-full sm:w-auto"
              >
                ANMELDEN
              </button>
            </form>
          </div>
        </div>

        {/* Pilots */}
        <h3 className="font-luxury text-2xl text-luxury-dark mb-4 uppercase tracking-wide">UNSERE TANDEMPILOTEN</h3>
        <div className="w-12 h-px bg-luxury-gold mb-10"></div>
        
        <div className="flex flex-wrap gap-12 md:gap-16 mb-20">
          {[
            { name: 'Alex', img: '/images/team/schlink.jpg' },
            { name: 'Markus', img: '/images/team/markus.jpg' },
            { name: 'Karl-Peter', img: '/images/team/karlpeter.jpg' },
            { name: 'Tobi', img: '/images/team/tobi.jpg' }
          ].map((pilot) => (
            <div key={pilot.name} className="flex flex-col items-center gap-4 group cursor-pointer">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-[4px] border-white shadow-lg group-hover:border-luxury-gold transition-colors duration-500 relative">
                <img src={pilot.img} alt={pilot.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
              </div>
              <span className="font-luxury text-xl text-luxury-dark">{pilot.name}</span>
            </div>
          ))}
        </div>

        {/* Services & Prerequisites */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl">
          <div>
            <h2 className="font-luxury text-2xl text-luxury-dark mb-4 uppercase tracking-wide">UNSERE LEISTUNGEN</h2>
            <div className="w-12 h-px bg-luxury-gold mb-6"></div>
            <ul className="list-disc list-outside ml-5 space-y-3 text-[15px] font-light text-gray-500">
              <li>Tandemflug hier in der Region (kurze Anfahrtswege)</li>
              <li>Erfahrene Tandempiloten</li>
              <li>Aktuelle Tandemausrüstung</li>
            </ul>
          </div>

          <div>
            <h2 className="font-luxury text-2xl text-luxury-dark mb-4 uppercase tracking-wide">VORAUSSETZUNG</h2>
            <div className="w-12 h-px bg-luxury-gold mb-6"></div>
            <ul className="list-disc list-outside ml-5 space-y-3 text-[15px] font-light text-gray-500">
              <li>Passagiere ab 50 kg bis 100 kg</li>
              <li>Keine Altersbeschränkung aber gut zu Fuß - man muss 10-20 m rennen können ;-)!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
