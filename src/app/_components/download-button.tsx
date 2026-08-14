"use client";

export function DownloadButton({
  size = "md",
  children = "Download for free",
}: {
  size?: "md" | "lg";
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => alert("Umber is coming soon. Stay tuned!")}
      className={`group inline-flex items-center justify-center gap-2 rounded-full bg-accent font-medium text-accent-ink shadow-[0_8px_24px_-10px_var(--umber-accent)] transition-all hover:bg-accent-strong active:scale-[0.98] ${
        size === "lg" ? "h-13 px-8 text-base" : "h-10 px-5 text-sm"
      }`}
    >
      {children}
      <svg
        className="size-4 transition-transform group-hover:translate-y-0.5"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M8 2v8m0 0 3-3m-3 3L5 7m-2.5 5.5h11"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
