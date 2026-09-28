import { FormRenderer } from './FormRenderer';

// Renders a real dynamic form (Admin > Formulare) inside an admin-built
// "Seite" (Pages.tsx/DynamicPage.tsx), same bridge as PageGalleryBlock.tsx:
// a placeholder div (inserted via the "Formular einfügen" button in
// Pages.tsx, carrying the chosen form's id as a data attribute) gets
// replaced with this real React component in DynamicPage.tsx. Reuses
// FormRenderer.tsx directly rather than a second field-rendering
// implementation, so this always behaves identically to the fixed
// /service/:formId page's own form.
export const PageFormBlock = ({ formId }: { formId: string }) => (
  <div className="my-6">
    <FormRenderer formId={formId} />
  </div>
);
