import { Banner } from '../components/common/Banner';

export const ServiceAuftrag = () => {
  return (
    <div className="w-full bg-white font-luxurysans pb-20">
      <Banner />

      {/* Main Content Section */}
      <section className="pt-16 md:pt-24 pb-16 md:pb-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1200px]">
          
          {/* Title and Intro */}
          <div className="max-w-4xl mb-12">
            <p className="text-luxury-gold uppercase tracking-[0.2em] text-xs font-semibold mb-3">
              SERVICE
            </p>
            <h1 className="font-luxury text-4xl md:text-5xl text-luxury-dark uppercase mb-6">
              Service-Auftrag
            </h1>
            <div className="w-24 h-px bg-luxury-gold mb-8"></div>
            
            <div className="text-gray-600 font-light space-y-6 leading-relaxed text-[15px]">
              <p>
                Bitte ausgefüllten Auftrag ausdrucken und zusammen mit der Ausrüstung in unserer Flugschule in Weinheim oder alternativ in Landau vorbeibringen.
              </p>
              <p>
                <strong className="block text-luxury-dark font-medium mb-1">69469 Weinheim, Untergasse 27:</strong>
                bitte wegen Öffnungszeiten Newsletter beachten
              </p>
              <p>
                <strong className="block text-luxury-dark font-medium mb-1">76829 Landau, Am Birnbach 6:</strong>
                Termin bitte telefonisch (+49 (0)6201 8452097) oder per E-Mail (info@fs-hirondelle.de) vereinbaren
              </p>
            </div>
          </div>

          {/* Form Container */}
          <div className="w-full">
            <form className="bg-white p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-xl border border-gray-100 relative overflow-hidden">
              {/* Decorative top bar */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#53a8c7] to-[#C19B76]"></div>

              <p className="text-[#cc0000] text-xs font-semibold tracking-wider mb-8 uppercase">Pflichtfeld *</p>

              <div className="space-y-6">
                {/* Personal Data Fields */}
                {[
                  { id: 'name', label: 'Name' },
                  { id: 'strasse', label: 'Straße' },
                  { id: 'plz', label: 'PLZ' },
                  { id: 'ort', label: 'Ort' },
                  { id: 'handy', label: 'Handynr.' },
                  { id: 'email', label: 'E-Mail', type: 'email' },
                ].map((field) => (
                  <div key={field.id} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 group">
                    <label htmlFor={field.id} className="md:w-1/3 text-sm text-gray-700 font-medium group-focus-within:text-[#53a8c7] transition-colors">
                      {field.label} <span className="text-[#cc0000]">*</span>
                    </label>
                    <div className="md:w-2/3">
                      <input
                        type={field.type || 'text'}
                        id={field.id}
                        required
                        className="w-full bg-white border border-gray-300 px-5 py-3 text-[15px] focus:outline-none focus:border-[#53a8c7] focus:ring-2 focus:ring-[#53a8c7]/20 transition-all rounded-md"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent my-12"></div>

              {/* Gleitschirm-Check Section */}
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
                  <div className="md:w-1/3"></div>
                  <div className="md:w-2/3 flex items-center gap-3">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <input type="checkbox" id="gleitschirm_check" className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded cursor-pointer checked:bg-[#53a8c7] checked:border-[#53a8c7] transition-all" />
                      <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <label htmlFor="gleitschirm_check" className="text-[15px] text-gray-800 font-medium cursor-pointer">Gleitschirm-Check</label>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 group">
                  <label htmlFor="gs_hersteller" className="md:w-1/3 text-sm text-gray-700 font-medium group-focus-within:text-[#53a8c7] transition-colors">
                    Hersteller / Typ des Gleitschirms
                  </label>
                  <div className="md:w-2/3">
                    <input type="text" id="gs_hersteller" className="w-full bg-white border border-gray-300 px-5 py-3 text-[15px] focus:outline-none focus:border-[#53a8c7] focus:ring-2 focus:ring-[#53a8c7]/20 transition-all rounded-md" />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 group">
                  <label htmlFor="gs_farbe" className="md:w-1/3 text-sm text-gray-700 font-medium group-focus-within:text-[#53a8c7] transition-colors">
                    Farbe des Gleitschirms
                  </label>
                  <div className="md:w-2/3">
                    <input type="text" id="gs_farbe" className="w-full bg-white border border-gray-300 px-5 py-3 text-[15px] focus:outline-none focus:border-[#53a8c7] focus:ring-2 focus:ring-[#53a8c7]/20 transition-all rounded-md" />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8 group">
                  <label htmlFor="gs_anmerkung" className="md:w-1/3 text-sm text-gray-700 font-medium pt-3 group-focus-within:text-[#53a8c7] transition-colors">
                    Anmerkung / Hinweise
                  </label>
                  <div className="md:w-2/3">
                    <textarea 
                      id="gs_anmerkung" 
                      rows={3}
                      placeholder="z. B. Leine defekt, bitte austauschen / Loch im Obersegel etc."
                      className="w-full bg-white border border-gray-300 px-5 py-3 text-[15px] focus:outline-none focus:border-[#53a8c7] focus:ring-2 focus:ring-[#53a8c7]/20 transition-all rounded-md resize-y placeholder:text-gray-400"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent my-12"></div>

              {/* Rettung packen Section */}
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
                  <div className="md:w-1/3"></div>
                  <div className="md:w-2/3 flex items-center gap-3">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <input type="checkbox" id="rettung_packen" className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded cursor-pointer checked:bg-[#53a8c7] checked:border-[#53a8c7] transition-all" />
                      <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <label htmlFor="rettung_packen" className="text-[15px] text-gray-800 font-medium cursor-pointer">Rettung packen</label>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 group">
                  <label htmlFor="ret_hersteller" className="md:w-1/3 text-sm text-gray-700 font-medium group-focus-within:text-[#53a8c7] transition-colors">
                    Hersteller / Typ der Rettung
                  </label>
                  <div className="md:w-2/3">
                    <input 
                      type="text" 
                      id="ret_hersteller" 
                      placeholder="Wir packen alle Standardretter vom Typ Rund- bzw. Kreuzkappen. Retter, die nicht bei uns gekauft wurden bitte ggf. vorab abklären."
                      className="w-full bg-white border border-gray-300 px-5 py-3 text-[15px] focus:outline-none focus:border-[#53a8c7] focus:ring-2 focus:ring-[#53a8c7]/20 transition-all rounded-md placeholder:text-gray-400 placeholder:text-sm" 
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 group">
                  <label htmlFor="ret_alter" className="md:w-1/3 text-sm text-gray-700 font-medium group-focus-within:text-[#53a8c7] transition-colors">
                    Alter der Rettung
                  </label>
                  <div className="md:w-2/3">
                    <input 
                      type="text" 
                      id="ret_alter" 
                      placeholder="ca. in Jahren"
                      className="w-full bg-white border border-gray-300 px-5 py-3 text-[15px] focus:outline-none focus:border-[#53a8c7] focus:ring-2 focus:ring-[#53a8c7]/20 transition-all rounded-md placeholder:text-gray-400" 
                    />
                  </div>
                </div>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent my-12"></div>

              {/* Sonstiges & Abgabe Section */}
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 group">
                  <label htmlFor="sonstiges" className="md:w-1/3 text-sm text-gray-700 font-medium group-focus-within:text-[#53a8c7] transition-colors">
                    Sonstiges
                  </label>
                  <div className="md:w-2/3">
                    <input type="text" id="sonstiges" className="w-full bg-white border border-gray-300 px-5 py-3 text-[15px] focus:outline-none focus:border-[#53a8c7] focus:ring-2 focus:ring-[#53a8c7]/20 transition-all rounded-md" />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8 pt-4">
                  <label className="md:w-1/3 text-sm text-gray-700 font-medium pt-1">
                    Abgabe in
                  </label>
                  <div className="md:w-2/3 space-y-4">
                    <label className="flex items-start gap-4 cursor-pointer group">
                      <div className="relative flex items-center justify-center w-5 h-5 mt-0.5">
                        <input type="radio" name="abgabe" id="abgabe_weinheim" className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full cursor-pointer checked:border-[#53a8c7] transition-all" />
                        <div className="absolute w-2.5 h-2.5 bg-[#53a8c7] rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                      </div>
                      <span className="text-[15px] text-gray-700 group-hover:text-gray-900 transition-colors">Weinheim &gt; zwecks Termin Newsletter beachten</span>
                    </label>
                    
                    <label className="flex items-start gap-4 cursor-pointer group">
                      <div className="relative flex items-center justify-center w-5 h-5 mt-0.5">
                        <input type="radio" name="abgabe" id="abgabe_landau" className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full cursor-pointer checked:border-[#53a8c7] transition-all" />
                        <div className="absolute w-2.5 h-2.5 bg-[#53a8c7] rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                      </div>
                      <span className="text-[15px] text-gray-700 group-hover:text-gray-900 transition-colors">Landau &gt; jederzeit möglich - Termin bitte telefonisch anfragen</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12 mt-8">
                <button type="reset" className="w-full sm:w-auto px-10 py-3.5 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-semibold rounded-md transition-all shadow-sm text-sm uppercase tracking-wide">
                  Zurücksetzen
                </button>
                <button type="button" className="w-full sm:w-auto px-10 py-3.5 bg-[#53a8c7] hover:bg-[#4396b5] text-white font-semibold rounded-md transition-all shadow-md hover:shadow-lg text-sm uppercase tracking-wide">
                  Auftrag absenden
                </button>
              </div>

            </form>
          </div>

        </div>
      </section>

    </div>
  );
};
