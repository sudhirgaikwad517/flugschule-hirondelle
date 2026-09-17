import { Link } from 'react-router-dom';

interface GutscheinBoxProps {
  heading: string;
  description: string;
  headingClassName?: string;
}

// Shared "buy this as a gift voucher" sidebar box, used on every course/tour
// detail page. Previously duplicated inline with small drifts (some pages
// had no image at all, some had a different overlay style, none of them
// actually linked anywhere despite the cursor-pointer styling) - this is
// the one consistent version, always linking to /infos/gutscheine.
export const GutscheinBox = ({ heading, description, headingClassName = 'text-luxury-dark' }: GutscheinBoxProps) => (
  <div>
    <h3 className={`font-luxury text-2xl ${headingClassName} mb-4 uppercase tracking-wider border-b border-gray-200 pb-4`}>
      {heading}
    </h3>
    <p className="text-gray-500 font-light text-sm mb-4">
      {description}
    </p>
    <Link to="/infos/gutscheine" className="relative w-full rounded-sm overflow-hidden group cursor-pointer block">
      <img src="/images/gutscheine/gutschein.jpg" className="w-full h-auto transition-transform duration-700 group-hover:scale-105" alt="Gutschein" />
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-[#0088cc] flex items-center justify-center">
        <div className="rotate-[-90deg] text-white font-bold tracking-widest whitespace-nowrap">Gutschein</div>
      </div>
    </Link>
  </div>
);
