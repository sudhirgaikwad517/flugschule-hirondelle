import { Banner } from '../components/common/Banner';
import { SafeHtml } from '../components/common/SafeHtml';

// Pure presentational body shared by LegalPage.tsx (the 4 hardcoded routes,
// which redirect if the admin has renamed the slug) and FixedPageRouter.tsx
// (rendering a legal page reached directly by its current, possibly
// renamed, slug - no redirect check needed there since that IS the current
// URL already).
export const LegalPageContent = ({ title, content }: { title: string; content: string }) => (
  <div className="w-full bg-white font-luxurysans pb-20">
    <Banner />
    <section className="pt-16 md:pt-24 pb-12">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1200px]">
        <div className="mb-12">
          <h1 className="font-luxury text-3xl md:text-4xl lg:text-5xl text-luxury-dark uppercase mb-6 tracking-wide">
            {title}
          </h1>
          <div className="w-full h-px bg-[#53a8c7] opacity-40"></div>
        </div>
        <SafeHtml className="legal-page-content" html={content} />
      </div>
    </section>
  </div>
);
