/**
 * The living canvas behind every page, copied verbatim from the app
 * (packages/ui/src/components/layout/canvas-backdrop.tsx): a cool blue field
 * with soft white blobs drifting across it, and film grain laid over the top.
 */
export function CanvasBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="drift-a absolute -top-[14%] -left-[6%] size-[30rem] rounded-full bg-white/85 blur-[90px]" />
      <div className="drift-b absolute -right-[8%] -bottom-[16%] size-[34rem] rounded-full bg-white/70 blur-[100px]" />
      <div className="drift-c absolute top-[34%] left-[42%] size-[24rem] rounded-full bg-white/55 blur-[80px]" />

      <div className="film-grain absolute inset-0 opacity-70" />
    </div>
  );
}
