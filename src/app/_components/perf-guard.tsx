"use client";

import { useEffect } from "react";

/*
 * The site is animated glass on top of a living backdrop, which older phone
 * GPUs cannot composite at full frame rate. Rather than guess at devices,
 * this measures: a little after load — once the hero's intro burst has
 * settled into its cruise — it counts real animation frames for a second
 * and a half. If the device cannot hold a healthy rate, <html> gets the
 * `perf-lite` class and the stylesheet swaps the per-frame GPU work
 * (backdrop-filter, animated blurs, idle sways) for cheap equivalents.
 * The verdict is kept for the session so later visits skip the probe.
 */

const STORAGE_KEY = "umber-perf-lite";
const SETTLE_MS = 2500; // let the hero intro finish before judging
const SAMPLE_MS = 1500;
const MIN_FPS = 40; // healthy 60Hz devices sit near 60; jank lives below 40

export function PerfGuard() {
  useEffect(() => {
    // Reduced motion already runs almost nothing worth measuring.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const verdict = sessionStorage.getItem(STORAGE_KEY);
    if (verdict === "lite") {
      document.documentElement.classList.add("perf-lite");
      return;
    }
    if (verdict === "full") return;

    let raf = 0;
    let frames = 0;
    let start = 0;
    const step = (now: number) => {
      if (start === 0) start = now;
      frames += 1;
      if (now - start < SAMPLE_MS) {
        raf = requestAnimationFrame(step);
        return;
      }
      // A background tab gets throttled frames; that says nothing about
      // the device, so no verdict is stored and the next load re-measures.
      if (document.visibilityState !== "visible") return;
      const fps = (frames * 1000) / (now - start);
      const lite = fps < MIN_FPS;
      sessionStorage.setItem(STORAGE_KEY, lite ? "lite" : "full");
      if (lite) document.documentElement.classList.add("perf-lite");
    };
    const timer = window.setTimeout(() => {
      raf = requestAnimationFrame(step);
    }, SETTLE_MS);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
