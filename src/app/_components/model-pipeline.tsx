"use client";

import { useEffect, useRef, useState } from "react";
import { AI_IMAGES } from "./ai-images";
import { type ProviderId, ProviderMark } from "./provider-mark";

/*
 * The constellation: every provider Umber can talk to sits in a glass circle
 * on an arc that wraps around the Umber mark, each one connected to it by a
 * gently curved hairline. On a loop, one provider lights up and sends a
 * packet of data along its wire; Umber spins while the generation renders,
 * then passes the result down to a frame below, where the image develops.
 *
 * Everything lives in one fixed 1000x830 coordinate space. The stage keeps
 * that aspect ratio, so SVG geometry (viewBox units) and HTML nodes
 * (percentage offsets) stay perfectly registered at every size. The data
 * packets are SVG circles riding `offset-path` along the exact wire curves,
 * which also keeps them underneath the glass nodes.
 */

interface Provider {
  readonly id: ProviderId;
  readonly name: string;
  /** The model of theirs the demo pretends to render. */
  readonly flagship: string;
}

// Ordered left to right along the arc.
const ARC: readonly Provider[] = [
  { id: "recraft", name: "Recraft", flagship: "Recraft V4.1" },
  { id: "alibaba", name: "Alibaba", flagship: "Qwen Image" },
  { id: "bytedance", name: "ByteDance", flagship: "Seedream 4.5" },
  { id: "google", name: "Google", flagship: "Nano Banana 2" },
  { id: "openai", name: "OpenAI", flagship: "GPT Image 2" },
  {
    id: "blackForestLabs",
    name: "Black Forest Labs",
    flagship: "FLUX.2 [pro]",
  },
  { id: "kuaishou", name: "Kuaishou", flagship: "Kling Image 2.1" },
  { id: "runway", name: "Runway", flagship: "Gen-4 Image" },
  { id: "ideogram", name: "Ideogram", flagship: "Ideogram 4.0" },
];

// Every model in the app, image and video shuffled together into two lanes
// of equal length so the strips move at the same pace.
const LANE_A: readonly [string, ProviderId][] = [
  ["Nano Banana 2", "google"],
  ["Sora 2 Pro", "openai"],
  ["FLUX.2 [pro]", "blackForestLabs"],
  ["Kling 2.6", "kuaishou"],
  ["GPT Image 1.5", "openai"],
  ["Seedance 2.0", "bytedance"],
  ["Qwen Image", "alibaba"],
  ["Veo 3.1", "google"],
  ["Recraft V4.1", "recraft"],
  ["Gen-4.5", "runway"],
  ["Nano Banana", "google"],
  ["GPT Image 1", "openai"],
  ["Wan 2.6", "alibaba"],
  ["Ideogram V3", "ideogram"],
  ["Kling Image 2.1", "kuaishou"],
];

const LANE_B: readonly [string, ProviderId][] = [
  ["Veo 3.1 Fast", "google"],
  ["GPT Image 2", "openai"],
  ["Seedream 4.5", "bytedance"],
  ["Sora 2", "openai"],
  ["Ideogram 4.0", "ideogram"],
  ["Kling 2.5 Turbo", "kuaishou"],
  ["Gen-4 Image", "runway"],
  ["Seedance 1.0 Pro", "bytedance"],
  ["FLUX.1 Kontext [pro]", "blackForestLabs"],
  ["Nano Banana Pro", "google"],
  ["Gen-4 Turbo", "runway"],
  ["Recraft V3", "recraft"],
  ["GPT Image 1 Mini", "openai"],
  ["Seedream 4.0", "bytedance"],
  ["FLUX 1.1 [pro]", "blackForestLabs"],
];

// One real generation per cycle, drawn round-robin from the shared pool.
function artSrc(i: number) {
  return AI_IMAGES[i % AI_IMAGES.length];
}

/* ------------------------------------------------------------- Geometry */

const STAGE_W = 1000;
const STAGE_H = 1050;
const UMBER = { x: 500, y: 400 };
// The frame is the centrepiece: 78% of the stage wide, 3:2, sitting just
// below Umber with a short wire between them.
const OUTPUT = { x: 500, y: 769 };

// The providers wrap around the Umber mark on a flattened arc — a little
// tighter than a half circle, so the end nodes sit above Umber's shoulder.
const NODES = ARC.map((_, i) => {
  const theta = (Math.PI * (155 - i * (130 / (ARC.length - 1)))) / 180;
  return {
    x: UMBER.x + 430 * Math.cos(theta),
    y: UMBER.y - 300 * Math.sin(theta),
  };
});

function round(n: number) {
  return Math.round(n * 10) / 10;
}

/**
 * A wire from a provider to Umber: a quadratic curve whose control point is
 * nudged sideways off the straight chord, so each wire bows gently away
 * from the centre line. The apex wire stays straight by symmetry.
 */
function wirePath(i: number) {
  const p = NODES[i];
  const vx = UMBER.x - p.x;
  const vy = UMBER.y - p.y;
  const len = Math.hypot(vx, vy);
  const side = Math.sign(p.x - UMBER.x);
  const bend = len * 0.09;
  const cx = (p.x + UMBER.x) / 2 + (vy / len) * bend * side;
  const cy = (p.y + UMBER.y) / 2 - (vx / len) * bend * side;
  return `M ${round(p.x)} ${round(p.y)} Q ${round(cx)} ${round(cy)} ${UMBER.x} ${UMBER.y}`;
}

const DELIVER_PATH = `M ${UMBER.x} ${UMBER.y} L ${OUTPUT.x} 520`;

function left(x: number) {
  return `${((x / STAGE_W) * 100).toFixed(4)}%`;
}
function top(y: number) {
  return `${((y / STAGE_H) * 100).toFixed(4)}%`;
}

/* ------------------------------------------------------------- Timeline */

type Phase =
  | "pick" // a provider lights up
  | "send" // its packet glides along the wire
  | "load" // Umber spins while the model renders
  | "deliver" // the result glides down to the frame
  | "reveal" // the image develops
  | "hold" // admire it
  | "fade" // everything eases back to calm
  | "rest"; // a breath before the next provider takes a turn

const TIMELINE: readonly [Phase, number][] = [
  ["pick", 750],
  ["send", 950],
  ["load", 2000],
  ["deliver", 700],
  ["reveal", 1500],
  ["hold", 2400],
  ["fade", 1400],
  ["rest", 700],
];

export function ModelPipeline() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<Phase>("rest");
  const [active, setActive] = useState<number | null>(null);
  // The provider and artwork of the current cycle outlive `active`, which
  // clears during the fade, so nothing swaps content mid-transition.
  const [labelIdx, setLabelIdx] = useState(4);
  const [art, setArt] = useState(4);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // No choreography: rest with one provider lit and its result shown.
      setReduced(true);
      setActive(4);
      setPhase("hold");
      return;
    }
    // Hold the loop until the constellation is on screen, so the story is
    // seen from its first beat.
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The phase clock. Each pass through the timeline is one generation by
  // one provider; the next pass hands the turn to a random other one.
  useEffect(() => {
    if (!started || reduced) return;
    let step = 0;
    let timer = 0;
    let current: number | null = null;
    let cycles = 0;
    const tick = () => {
      const [name, duration] = TIMELINE[step];
      if (name === "pick") {
        current =
          current === null
            ? Math.floor(Math.random() * ARC.length)
            : (current + 1 + Math.floor(Math.random() * (ARC.length - 1))) %
              ARC.length;
        cycles += 1;
        setActive(current);
        setLabelIdx(current);
        const nextArt = cycles * 3 + current;
        setArt(nextArt);
        // Fetch the artwork while the fake render runs, so the reveal
        // never develops a half-loaded file.
        new window.Image().src = artSrc(nextArt);
      } else if (name === "fade") {
        // The ring, wire and artwork all ease out together.
        setActive(null);
      }
      setPhase(name);
      timer = window.setTimeout(() => {
        step = (step + 1) % TIMELINE.length;
        tick();
      }, duration);
    };
    tick();
    return () => clearTimeout(timer);
  }, [started, reduced]);

  const loading = phase === "load";
  // The artwork stays mounted through the rest beat, so its dissolve can
  // finish before the element leaves; it only unmounts once a new cycle
  // starts, when it is already invisible.
  const resultVisible =
    phase === "reveal" ||
    phase === "hold" ||
    phase === "fade" ||
    phase === "rest";
  const dissolving = phase === "fade" || phase === "rest";
  const labelProvider = ARC[labelIdx];

  return (
    <div ref={rootRef}>
      <div className="relative mx-auto aspect-[1000/1050] w-full max-w-4xl">
        {/* ------------------- The wiring, and the data riding it ------ */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
        >
          {ARC.map((p, i) => (
            <path
              d={wirePath(i)}
              fill="none"
              key={p.id}
              stroke="#ffffff"
              strokeOpacity={i === active ? 1 : 0.55}
              strokeWidth={i === active ? 2.5 : 2}
              style={{
                transition:
                  "stroke-opacity 600ms ease-out, stroke-width 600ms ease-out",
              }}
            />
          ))}
          <line
            stroke="#ffffff"
            strokeOpacity={0.55}
            strokeWidth={2}
            x1={UMBER.x}
            x2={OUTPUT.x}
            y1={UMBER.y}
            y2={OUTPUT.y}
          />
          {phase === "send" && !reduced && active !== null && (
            <DataPacket duration={950} path={wirePath(active)} />
          )}
          {phase === "deliver" && !reduced && (
            <DataPacket duration={700} path={DELIVER_PATH} />
          )}
        </svg>

        {/* --------------------------------------------- The providers */}
        {ARC.map((p, i) => {
          const isActive = i === active;
          return (
            <div
              className="absolute w-[7.4%] -translate-x-1/2 -translate-y-1/2"
              key={p.id}
              style={{ left: left(NODES[i].x), top: top(NODES[i].y) }}
            >
              <div
                className="node-bob"
                style={{ animationDelay: `${-i * 0.9}s` }}
              >
                <div
                  className={`glass-raised relative grid aspect-square w-full place-items-center rounded-full transition-all duration-500 ease-out ${
                    isActive
                      ? "scale-110 shadow-[0_10px_30px_-10px_rgb(49_100_228/0.5)] ring-2 ring-accent/60"
                      : ""
                  }`}
                  title={p.name}
                >
                  <ProviderMark
                    className={`w-[46%] transition-colors duration-500 ${
                      isActive ? "text-accent" : "text-ink/75"
                    }`}
                    provider={p.id}
                  />
                  <span className="sr-only">{p.name}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* ------------------------------------------------- The Umber */}
        <div
          className="absolute w-[11.8%] -translate-x-1/2 -translate-y-1/2"
          style={{ left: left(UMBER.x), top: top(UMBER.y) }}
        >
          <div
            className={`relative aspect-square transition-transform duration-700 ease-out ${
              loading ? "scale-[1.06]" : "scale-100"
            }`}
          >
            <div className="glass-raised absolute inset-0 grid place-items-center rounded-full">
              {/* biome-ignore lint/performance/noImgElement: static brand asset */}
              <img
                alt="Umber"
                className="w-[46%]"
                height={64}
                src="/brand/mark.svg"
                width={64}
              />
            </div>
            {/* The loading arc, orbiting just outside the glass. It never
                stops turning — only its opacity comes and goes — so it can
                fade out mid-spin instead of snapping back to its start. The
                size is explicit because WebKit does not stretch a replaced
                element to its insets the way Blink does. */}
            <svg
              aria-hidden="true"
              className={`spinner-turn absolute -top-[13%] -left-[13%] h-[126%] w-[126%] transition-opacity duration-700 ${
                loading ? "opacity-100" : "opacity-0"
              }`}
              viewBox="0 0 100 100"
            >
              <circle
                cx={50}
                cy={50}
                fill="none"
                opacity={0.18}
                r={46}
                stroke="var(--umber-accent)"
                strokeWidth={4.5}
              />
              <circle
                cx={50}
                cy={50}
                fill="none"
                pathLength={100}
                r={46}
                stroke="var(--umber-accent)"
                strokeDasharray="30 70"
                strokeLinecap="round"
                strokeWidth={4.5}
              />
            </svg>
          </div>
        </div>

        {/* ------------------------------------------------ The result */}
        <div
          className="absolute w-[78%] -translate-x-1/2 -translate-y-1/2"
          style={{ left: left(OUTPUT.x), top: top(OUTPUT.y) }}
        >
          <div className="glass-raised relative rounded-3xl p-[1.5%]">
            <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-white/30 shadow-[inset_0_2px_14px_rgb(28_41_90/0.07)]">
              {/* An empty canvas waiting for its image, glowing softly. */}
              <div
                aria-hidden="true"
                className="canvas-wait absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_45%,rgb(255_255_255/0.5),transparent)]"
              />
              {resultVisible && (
                <div
                  className={`absolute inset-0 ${
                    dissolving ? "art-dissolve" : "art-reveal"
                  }`}
                  key={art}
                  style={{
                    backgroundImage: `url(${artSrc(art)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              )}
              <div
                className={`absolute bottom-[4%] left-[3%] transition-all duration-500 ease-out ${
                  phase === "hold"
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-0"
                }`}
              >
                <div className="glass-raised flex items-center gap-3 rounded-xl px-3.5 py-2.5">
                  <ProviderMark
                    className="size-5 shrink-0 text-ink/70"
                    provider={labelProvider.id}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm leading-tight font-medium text-ink">
                      {labelProvider.flagship}
                    </p>
                    <p className="mt-0.5 truncate text-xs leading-tight text-muted">
                      {labelProvider.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Every model in the app, drifting past with its vendor's mark. */}
      <div
        className="mt-14 space-y-3"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        }}
      >
        <MarqueeLane direction="left" models={LANE_A} />
        <MarqueeLane direction="right" models={LANE_B} />
      </div>
    </div>
  );
}

/**
 * A packet of data riding a wire: a soft halo around a small core, gliding
 * along the wire's exact curve via offset-path. Living inside the SVG keeps
 * it underneath the glass nodes.
 */
function DataPacket({ path, duration }: { path: string; duration: number }) {
  const style = {
    offsetPath: `path('${path}')`,
    offsetRotate: "0deg",
    animationDuration: `${duration}ms`,
  } as React.CSSProperties;
  return (
    <g>
      <circle
        className="packet-run"
        fill="var(--umber-accent)"
        opacity={0.18}
        r={11}
        style={style}
      />
      <circle
        className="packet-run"
        fill="var(--umber-accent)"
        r={4.5}
        style={style}
      />
    </g>
  );
}

function MarqueeLane({
  models,
  direction,
}: {
  models: readonly [string, ProviderId][];
  direction: "left" | "right";
}) {
  return (
    <div className="overflow-hidden">
      <div
        className={`flex w-max gap-3 ${
          direction === "left" ? "marquee-left" : "marquee-right"
        }`}
      >
        {[0, 1].map((copy) => (
          <div aria-hidden={copy === 1} className="flex gap-3 pr-3" key={copy}>
            {models.map(([name, providerId]) => (
              <span
                className="flex items-center gap-2.5 rounded-full border border-white/70 bg-white/55 py-2 pr-4 pl-3.5 text-[13px] font-medium whitespace-nowrap text-ink/85"
                key={name}
              >
                <ProviderMark
                  className="size-4 shrink-0 text-ink/60"
                  provider={providerId}
                />
                {name}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
