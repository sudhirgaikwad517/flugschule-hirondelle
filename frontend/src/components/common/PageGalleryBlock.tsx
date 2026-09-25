import { usePageGallery } from '../../hooks/usePageGallery';
import { useLightbox } from './Lightbox';

// Renders the admin-managed gallery (Admin > Galerie) for a given slug,
// same 3-column grid + lightbox as the hand-built pages (see ASchein.tsx
// etc.) - used to embed a gallery inside a Seiten (Unlayer drag-drop) page,
// where a placeholder div (inserted via the "Galerie einfügen" button in
// Pages.tsx) gets replaced with this component via a React portal, see
// DynamicPage.tsx. No fallback images here: an unconfigured gallery on a
// brand-new Seiten page should render nothing, not a foreign page's photos.
export const PageGalleryBlock = ({ slug }: { slug: string }) => {
  const { openGallery } = useLightbox();
  const images = usePageGallery(slug, []);

  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-2">
      {images.map((img, index) => (
        <div
          key={img}
          className="relative aspect-square overflow-hidden group cursor-zoom-in bg-gray-100"
          onClick={() => openGallery(images.map((g) => ({ src: g, alt: 'Impression' })), index)}
        >
          <img
            src={img}
            alt="Impression"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      ))}
    </div>
  );
};
