import { Banner } from '../components/common/Banner';
import { FormRenderer } from '../components/common/FormRenderer';

const FORM_ID = 'service-auftrag';

// The fixed /service/service-auftrag page - now just its own page-hero
// heading (eyebrow/title/divider, matching every other fixed page's look)
// wrapped around the reusable FormRenderer (see that file for the actual
// dynamic field-rendering logic, shared with PageFormBlock.tsx so an admin-
// built "Seite" can embed this - or any other - form too).
export const ServiceAuftrag = () => (
  <div className="w-full bg-white font-luxurysans pb-20">
    <Banner />
    <section className="pt-16 md:pt-24 pb-16 md:pb-20">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1200px]">
        <div className="max-w-4xl">
          <p className="text-luxury-heading uppercase tracking-[0.2em] text-xs font-semibold mb-3">
            SERVICE
          </p>
          <h1 className="font-luxury text-4xl md:text-5xl text-luxury-dark uppercase mb-6">
            Service-Auftrag
          </h1>
          <div className="w-24 h-px bg-luxury-gold mb-8"></div>
        </div>
        <FormRenderer formId={FORM_ID} />
      </div>
    </section>
  </div>
);
