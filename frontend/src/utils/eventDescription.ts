// 373 of 1306 published events carry this exact duplicate: old Matukio's
// article body embeds its own leading <img> (migrated as-is into
// shortDescription/description) whose file is the SAME one the event's own
// imageUrl/detailImageUrl field already points to - rendering it once as the
// dedicated thumbnail/hero image AND again inline in the description text.
// Strips only the specific <img> tag(s) matching the hero image's own
// filename; any other, genuinely different image embedded in the
// description is left untouched. Shared by EventDetailsView.tsx (detail
// page) and Events.tsx (list card) - both show this same shortDescription
// HTML next to the event's own thumbnail.
export function stripDuplicateHeroImage(
  html: string | null | undefined,
  event: { imageUrl?: string | null; detailImageUrl?: string | null }
): string {
  if (!html) return html || '';
  const heroImg = event.detailImageUrl || event.imageUrl;
  const heroBasename = heroImg?.split('/').pop();
  if (!heroBasename) return html;
  return html.replace(/<img[^>]*>/gi, (tag: string) => {
    const src = tag.match(/src=["']([^"']+)["']/i)?.[1];
    return src && src.split('/').pop() === heroBasename ? '' : tag;
  });
}
