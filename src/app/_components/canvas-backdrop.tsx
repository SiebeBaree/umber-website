/**
 * The living canvas behind every page, matching the app
 * (packages/ui/src/components/layout/canvas-backdrop.tsx): a cool blue field
 * with soft white blobs drifting across it, and film grain laid over the top.
 *
 * The app draws each blob as a solid circle behind a 80-100px gaussian blur.
 * Compositing those blurs every animation frame is what killed older phone
 * GPUs, so here the same soft glow is painted directly as a radial gradient
 * (on a pseudo-element scaled past the box, since a blur also bleeds outside
 * its element). Visually equivalent, but it rasterises once.
 */
export function CanvasBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="drift-a canvas-glow absolute -top-[14%] -left-[6%] size-[30rem] [--glow-o:0.85]" />
      <div className="drift-b canvas-glow absolute -right-[8%] -bottom-[16%] size-[34rem] [--glow-o:0.70]" />
      <div className="drift-c canvas-glow absolute top-[34%] left-[42%] size-[24rem] [--glow-o:0.55]" />

      <div className="film-grain absolute inset-0 opacity-70" />
    </div>
  );
}
