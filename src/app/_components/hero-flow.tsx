"use client";

import { useEffect, useRef, useState } from "react";
import { AI_IMAGES } from "./ai-images";
import { DownloadButton } from "./download-button";

/*
 * The hero choreography, copied from the reference motion: 16:9 cards are
 * born at a seam in the exact centre and travel outward in a continuous,
 * never-pausing conveyor, growing and turning edge-on in 3D perspective
 * until they slide off the sides. The flow starts several times faster than
 * its cruising speed and eases down, so the band assembles in about a
 * second, at which point the rest of the UI fades in as one and scrolling
 * unlocks.
 *
 * The band is animated imperatively in requestAnimationFrame: card
 * positions derive from a single progress value per card, and each frame
 * packs the cards outward from the seam using their actual projected
 * widths, so they stay exactly adjacent while they grow.
 */

// Ten unique cards per side. Once a side has shown its ten, it continues
// with the other side's ten, so the halves keep trading images forever.
// Each card pairs a generation with a tint that holds the frame until the
// file has arrived.
const TINTS = [
  "#c2703d",
  "#8a9a5b",
  "#5b7c99",
  "#d9a05b",
  "#9b6a6c",
  "#6f7d5c",
  "#c9a227",
  "#7d6b91",
  "#a85751",
  "#5e8a7a",
  "#b78d5e",
  "#846c5b",
  "#8f9d77",
  "#ad7f5a",
  "#6d8a96",
  "#a08558",
  "#7a6a8f",
  "#bc8f68",
  "#5f7f6a",
  "#b06f5f",
];
const CARDS = AI_IMAGES.map((src, i) => ({ src, tint: TINTS[i] }));
const LEFT_CARDS = CARDS.slice(0, 10);
const RIGHT_CARDS = CARDS.slice(10);
const SEQUENCES = {
  left: [...LEFT_CARDS, ...RIGHT_CARDS],
  right: [...RIGHT_CARDS, ...LEFT_CARDS],
};

const ASPECT = 16 / 9;
const BASE_H = 120; // px; real size comes from scale()
const SPACING = 1 / 5; // progress distance between neighbours
const CRUISE = 1 / 4.5; // progress per second once settled
const INTRO_BOOST = 7; // how many times faster the flow starts
const INTRO_SECONDS = 1.5;

// Card geometry as a function of progress p (0 at the seam, 1 at the edge).
// Height grows without a cap: a card keeps getting bigger for as long as
// any part of it is on screen, and only stops existing once it is fully
// off. The rotation does cap, at 72 degrees: past that, foreshortening
// would visibly shrink a card again as it travelled outward.
function heightSvh(p: number) {
  return 7 + 46 * (p / 0.9) ** 2.2;
}
function angleDeg(p: number) {
  const q = Math.min(p / 0.9, 1);
  return 12 + 60 * q ** 0.6;
}

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

type Card = { el: HTMLDivElement; p: number };
type Side = { host: HTMLDivElement; cards: Card[]; spawned: number };

export function HeroFlow({ nav }: { nav: React.ReactNode }) {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!leftRef.current || !rightRef.current) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const sides: Record<"left" | "right", Side> = {
      left: { host: leftRef.current, cards: [], spawned: 0 },
      right: { host: rightRef.current, cards: [], spawned: 0 },
    };

    const spawn = (name: "left" | "right", p: number) => {
      const side = sides[name];
      const el = document.createElement("div");
      // Anchored to the seam edge of the side's clipping container, so a
      // newborn card slides out from behind the centre line.
      el.style.cssText = `position:absolute;${
        name === "left" ? "right" : "left"
      }:0;top:50%;width:${BASE_H * ASPECT}px;height:${
        BASE_H
      }px;margin-${name === "left" ? "right" : "left"}:${
        (-BASE_H * ASPECT) / 2
      }px;margin-top:${
        -BASE_H / 2
      }px;border-radius:10px;will-change:transform;box-shadow:0 18px 44px -20px rgb(28 41 90/0.45)`;
      const card = SEQUENCES[name][side.spawned % SEQUENCES[name].length];
      el.style.backgroundColor = card.tint;
      el.style.backgroundImage = `url(${card.src})`;
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
      side.host.appendChild(el);
      side.cards.unshift({ el, p });
      side.spawned++;
    };

    const layout = (name: "left" | "right") => {
      const side = sides[name];
      const W = side.host.clientWidth * 2; // full band width
      const H = side.host.clientHeight;
      const dir = name === "left" ? -1 : 1;
      const geometry = (p: number) => {
        const scale = ((heightSvh(p) / 100) * H) / BASE_H;
        const angle = angleDeg(p);
        const projectedW =
          BASE_H * scale * ASPECT * Math.cos((angle * Math.PI) / 180);
        return { scale, angle, projectedW };
      };
      // The newest card is still part-way behind the seam: the strip stays
      // unbroken at the centre and emerges instead of popping in.
      const first = side.cards[0];
      let cursor = first
        ? -geometry(Math.min(first.p, 1)).projectedW *
          (1 - Math.min(first.p / SPACING, 1))
        : 0;
      for (let i = 0; i < side.cards.length; i++) {
        const card = side.cards[i];
        const p = card.p;
        const { scale, angle, projectedW } = geometry(p);
        const x = cursor + projectedW / 2;
        // The gap starts at exactly zero so cards touch at the seam and a
        // spawn inserts no width, then it opens up as a card travels out.
        cursor += projectedW + W * 0.033 * p ** 1.5;
        card.el.style.transform = `translateX(${dir * x}px) rotateY(${
          -dir * angle
        }deg) scale(${scale})`;
        card.el.style.zIndex = String(i);
        // Perspective projection keeps part of a rotated card visible well
        // past its computed extent, so only cull with a full card of slack.
        if (x - projectedW / 2 > W / 2 + BASE_H * ASPECT * scale) card.p = 2;
      }
    };

    let raf = 0;
    let last = performance.now();
    let elapsed = reduced ? INTRO_SECONDS : 0;

    if (reduced) {
      // No animation to wait for: materialise the settled band.
      for (const name of ["left", "right"] as const) {
        for (let i = 0; i < 9; i++) spawn(name, (9 - i) * SPACING);
        layout(name);
      }
      setReady(true);
    }

    const step = (dt: number) => {
      elapsed += dt;
      // Ready is tied to animation time, not wall clock, so a tab that
      // loads in the background plays the intro when it is first seen.
      if (elapsed >= INTRO_SECONDS) setReady(true);
      const boost =
        elapsed >= INTRO_SECONDS
          ? 1
          : 1 + INTRO_BOOST * (1 - easeInOutQuad(elapsed / INTRO_SECONDS));
      const v = CRUISE * boost;

      for (const name of ["left", "right"] as const) {
        const side = sides[name];
        for (const card of side.cards) card.p += v * dt;
        if (!side.cards.length || side.cards[0].p >= SPACING) {
          spawn(name, side.cards.length ? side.cards[0].p - SPACING : 0);
        }
        while (side.cards.length && side.cards[side.cards.length - 1].p >= 2) {
          const gone = side.cards.pop();
          gone?.el.remove();
        }
        layout(name);
      }
    };

    const frame = (now: number) => {
      step(Math.min((now - last) / 1000, 0.1));
      last = now;
      raf = requestAnimationFrame(frame);
    };

    // Debug handle: advance the simulation by hand, e.g. from devtools.
    (window as { __heroStep?: (s: number) => void }).__heroStep = (
      s: number,
    ) => {
      for (let t = 0; t < s; t += 1 / 60) step(1 / 60);
    };

    if (!reduced) {
      raf = requestAnimationFrame((now) => {
        last = now;
        frame(now);
      });
    }
    return () => {
      cancelAnimationFrame(raf);
      sides.left.host.replaceChildren();
      sides.right.host.replaceChildren();
      delete (window as { __heroStep?: (s: number) => void }).__heroStep;
    };
  }, []);

  // The page holds still until the opening animation has finished.
  useEffect(() => {
    if (ready) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [ready]);

  return (
    <section className="relative h-svh overflow-hidden">
      {/* The card band: one clipping container per side, so cards can
          emerge from behind the centre seam without crossing it. Card sizes
          derive from this container's height, so on phones it becomes a
          fixed strip in the free zone between the headline and the copy
          below, keeping the band clear of both. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 bottom-0 max-sm:top-[24svh] max-sm:bottom-auto max-sm:h-[32svh]"
      >
        <div
          ref={leftRef}
          className="absolute inset-y-0 left-0 right-1/2 overflow-hidden"
          style={{ perspective: "2400px", perspectiveOrigin: "100% 50%" }}
        />
        <div
          ref={rightRef}
          className="absolute inset-y-0 left-1/2 right-0 overflow-hidden"
          style={{ perspective: "2400px", perspectiveOrigin: "0% 50%" }}
        />
      </div>

      {/* Everything else fades in together once the burst has landed. */}
      <div
        className={`hero-ui transition-opacity duration-700 ease-out ${
          ready ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {nav}

        <div className="absolute inset-x-0 top-[13svh] px-6 text-center">
          <h1 className="font-display mx-auto max-w-4xl text-[2.9rem] leading-[1.04] tracking-tight text-balance sm:text-6xl md:text-7xl">
            The best AI models.
            <br />
            One free studio.
          </h1>
        </div>

        <div className="absolute inset-x-0 bottom-[7svh] flex flex-col items-center gap-7 px-6 text-center">
          <p className="max-w-md text-pretty text-ink/80 sm:text-lg">
            Umber is a free, open source desktop app for AI image and video
            generation. Bring your own API keys, pay the labs at cost and keep
            every creation on your device.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <DownloadButton size="lg" />
            <a
              href="https://github.com/SiebeBaree/umber"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-control inline-flex h-13 items-center justify-center gap-2.5 rounded-full px-8 text-base font-medium"
            >
              <svg
                viewBox="0 0 16 16"
                className="size-4.5"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.42 7.42 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
              Star on GitHub
            </a>
          </div>
          <p className="text-[13px] text-muted">macOS · Windows · Linux</p>
        </div>
      </div>

      {/* Without JavaScript there is no animation to wait for. */}
      <noscript>
        <style>{`.hero-ui { opacity: 1 !important; }`}</style>
      </noscript>
    </section>
  );
}
