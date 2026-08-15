"use client";

import { useId, useState } from "react";

/*
 * One FAQ row that opens and closes smoothly. A native <details> snaps: its
 * content height cannot be transitioned everywhere (Safari has no
 * `interpolate-size`), so this animates the reliable way — a grid row
 * easing between 0fr and 1fr — behind the same disclosure semantics
 * (button + aria-expanded + region). The answer stays in the DOM either
 * way, so crawlers read the full text.
 */
export function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="border-b border-ink/15 py-5">
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-4 text-left font-medium tracking-tight"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {q}
        <svg
          viewBox="0 0 16 16"
          className={`size-4 shrink-0 text-muted transition-transform duration-300 ease-out ${
            open ? "rotate-45" : ""
          }`}
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M8 3v10M3 8h10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        id={panelId}
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p
            className={`mt-3 max-w-2xl text-[15px] leading-relaxed text-muted transition-opacity duration-300 ease-out ${
              open ? "opacity-100" : "opacity-0"
            }`}
          >
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}
