/*
 * Example generations shown across the site: the hero conveyor, the model
 * constellation's output frame and the section collages all draw from this
 * one pool. All files are 2736x1536 webp.
 */
export const AI_IMAGES = [
  "/ai-images/umber-0a7ffe38.webp",
  "/ai-images/umber-4472e747.webp",
  "/ai-images/umber-4de70dff.webp",
  "/ai-images/umber-5718c2e5.webp",
  "/ai-images/umber-6d9d711d.webp",
  "/ai-images/umber-74734a28.webp",
  "/ai-images/umber-7b40dd03.webp",
  "/ai-images/umber-7cf6578f.webp",
  "/ai-images/umber-86637b9a.webp",
  "/ai-images/umber-8b5d71a7.webp",
  "/ai-images/umber-95576d0d.webp",
  "/ai-images/umber-b2243bf9.webp",
  "/ai-images/umber-bb55469d.webp",
  "/ai-images/umber-ca4b66c4.webp",
  "/ai-images/umber-cd6aaf30.webp",
  "/ai-images/umber-df592690.webp",
  "/ai-images/umber-efc9ad3f.webp",
  "/ai-images/umber-fc468008.webp",
  "/ai-images/umber-fd680b1e.webp",
  "/ai-images/umber-ff74827b.webp",
] as const;

/*
 * The same pool at 1368x768, for the animated surfaces (the hero conveyor
 * and the constellation's output frame) that paint images as raw CSS
 * backgrounds. The full-size files decode to ~17MB of texture each, which
 * overwhelms older phones; these decode to a quarter of that and are
 * indistinguishable on cards that are moving, rotated or under 700px wide.
 * Generated from the originals with sharp (resize 1368, webp quality 78).
 */
export const AI_IMAGES_SMALL = AI_IMAGES.map((src) =>
  src.replace("/ai-images/", "/ai-images/1368/"),
) as readonly string[];
