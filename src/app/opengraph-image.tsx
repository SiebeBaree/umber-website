import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SLOGAN } from "../lib/site";

export const alt = "Umber. The best AI models. One free studio.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/*
 * The hero conveyor, frozen: a band of example generations across the lower
 * half, smallest at the centre seam and growing outward until the outer
 * cards crop off the edges. The og renderer cannot decode webp or turn
 * cards in 3D, so the band uses pre-converted jpegs from _og/ and fakes the
 * perspective with size alone.
 */
const BAND = {
  y: 474, // vertical centre of the band
  heights: [72, 108, 168], // seam -> edge
  gaps: [16, 26], // like the hero, the gap opens as cards travel outward
  seam: 4, // half of the centre gap, where cards all but touch
};

// Seam -> edge, matching BAND.heights.
const CARDS = {
  left: ["umber-8b5d71a7", "umber-7cf6578f", "umber-86637b9a"],
  right: ["umber-bb55469d", "umber-fd680b1e", "umber-74734a28"],
};

function cardRects(side: "left" | "right") {
  const rects = [];
  let cursor = size.width / 2 + BAND.seam;
  for (const [i, height] of BAND.heights.entries()) {
    const width = Math.round((height * 16) / 9);
    rects.push({
      left: side === "right" ? cursor : size.width - cursor - width,
      top: BAND.y - height / 2,
      width,
      height,
    });
    cursor += width + (BAND.gaps[i] ?? 0);
  }
  return rects;
}

async function cardUri(name: string) {
  const jpeg = await readFile(join(process.cwd(), `src/app/_og/${name}.jpg`));
  return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
}

// The slogan is set in Instrument Serif like the hero headline. The font is
// fetched once at build time; if the fetch fails the image falls back to the
// bundled sans rather than failing the build.
async function instrumentSerif(text: string) {
  const css = await (
    await fetch(
      `https://fonts.googleapis.com/css2?family=Instrument+Serif&text=${encodeURIComponent(text)}`,
    )
  ).text();
  const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
  if (!url) throw new Error("No truetype URL in the Google Fonts response");
  return await (await fetch(url[1])).arrayBuffer();
}

export default async function Image() {
  const lockup = await readFile(
    join(process.cwd(), "public/brand/lockup.svg"),
    "utf8",
  );

  const band = (["left", "right"] as const).flatMap((side) =>
    cardRects(side).map((rect, i) => ({ rect, name: CARDS[side][i] })),
  );
  const uris = new Map(
    await Promise.all(
      [...CARDS.left, ...CARDS.right].map(
        async (name) => [name, await cardUri(name)] as const,
      ),
    ),
  );

  const fonts = [];
  try {
    fonts.push({
      name: "Instrument Serif",
      data: await instrumentSerif(SLOGAN),
      style: "normal" as const,
      weight: 400 as const,
    });
  } catch {}

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 76,
        backgroundColor: "#cbdaf2",
        // The living canvas, frozen: soft white blobs drifting on the blue.
        backgroundImage:
          "radial-gradient(560px 400px at 16% 18%, rgba(255,255,255,0.85), rgba(255,255,255,0) 70%), radial-gradient(700px 480px at 86% 80%, rgba(255,255,255,0.7), rgba(255,255,255,0) 70%), radial-gradient(480px 360px at 72% 8%, rgba(255,255,255,0.5), rgba(255,255,255,0) 70%)",
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: satori renders plain img */}
      <img
        src={`data:image/svg+xml,${encodeURIComponent(lockup)}`}
        width={440}
        height={170}
        alt=""
      />
      <div
        style={{
          marginTop: 24,
          fontSize: 46,
          fontFamily: fonts.length ? "Instrument Serif" : undefined,
          color: "#1c2333",
          letterSpacing: "-0.01em",
        }}
      >
        {SLOGAN}
      </div>
      {band.map(({ rect, name }) => (
        // biome-ignore lint/performance/noImgElement: satori renders plain img
        <img
          key={`${name}-${rect.left}`}
          src={uris.get(name)}
          alt=""
          style={{
            position: "absolute",
            ...rect,
            borderRadius: 14,
            objectFit: "cover",
            boxShadow: "0 18px 44px -20px rgba(28,41,90,0.45)",
          }}
        />
      ))}
    </div>,
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
