import {
  PLATFORM_LABELS,
  type Platform,
  type Release,
} from "../../lib/release";

const PLATFORMS: Platform[] = ["mac", "windows", "linux"];

/*
 * The line under the hero buttons: which version is current, and a way to grab
 * a build other than your own. When GitHub cannot be reached the badge simply
 * is not there and the platform names still work, because `/download` falls
 * back to the releases page on its own.
 */
export function ReleaseLine({ release }: { release: Release | null }) {
  return (
    <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[13px] text-muted">
      {release ? (
        <a
          href={release.notesUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={`Umber ${release.version} release notes`}
          className="glass-control inline-flex items-center gap-1.5 rounded-full py-1 pr-2.5 pl-2 font-medium text-ink"
        >
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-accent"
          />
          v{release.version}
        </a>
      ) : null}
      <span className="flex items-center gap-2">
        {PLATFORMS.map((platform, index) => (
          <span className="flex items-center gap-2" key={platform}>
            {index > 0 ? <span aria-hidden="true">·</span> : null}
            <a
              className="underline-offset-4 hover:text-ink hover:underline"
              href={`/download?os=${platform}`}
            >
              {PLATFORM_LABELS[platform]}
            </a>
          </span>
        ))}
      </span>
    </p>
  );
}
