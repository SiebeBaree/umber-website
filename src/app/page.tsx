import Image from "next/image";
import { getLatestRelease, type Release } from "../lib/release";
import {
  GITHUB_URL,
  LICENSE_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "../lib/site";
import { AI_IMAGES } from "./_components/ai-images";
import { CanvasBackdrop } from "./_components/canvas-backdrop";
import { DownloadButton } from "./_components/download-button";
import { FaqItem } from "./_components/faq-item";
import { HeroFlow } from "./_components/hero-flow";
import { ModelPipeline } from "./_components/model-pipeline";
import { Nav } from "./_components/nav";
import { ReleaseLine } from "./_components/release-line";

const IMG_W = 2736;
const IMG_H = 1536;

// One list feeds both the FAQ section and its structured data, so what
// Google reads always matches what the page shows.
const FAQ_ITEMS = [
  {
    q: "Is Umber really free?",
    a: "Yes. Umber is open source under the MIT license. The only costs are the API fees you pay the labs directly for what you generate. Umber adds no markup and takes no cut.",
  },
  {
    q: "Which providers can I connect?",
    a: "Google, OpenAI, Black Forest Labs, ByteDance, Kuaishou (Kling), Alibaba, Runway, Ideogram, Recraft, xAI, Reve and MiniMax (Hailuo).",
  },
  {
    q: "Can Umber see my keys, prompts or images?",
    a: "No. Keys are encrypted into your OS keychain and requests go straight from your computer to the provider. Your gallery lives on your device. There is no Umber server or account in the middle.",
  },
  {
    q: "Do I need a key for every provider?",
    a: "One is enough. The model picker shows what each key unlocks and walks you through adding more whenever you want them.",
  },
  {
    q: "What platforms does it run on?",
    a: "macOS, Windows and Linux, as a native desktop app.",
  },
];

const jsonLd = (release: Release | null) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#app`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "macOS, Windows, Linux",
      // Only claimed when a real release backs it up.
      ...(release ? { softwareVersion: release.version } : {}),
      downloadUrl: `${SITE_URL}/download`,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      isAccessibleForFree: true,
      license: LICENSE_URL,
      sameAs: [GITHUB_URL],
      author: { "@type": "Person", name: "Siebe Baree", url: GITHUB_URL },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
});

function SectionHeading({
  title,
  lede,
}: {
  title: React.ReactNode;
  lede?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-4xl font-semibold tracking-tight text-balance sm:text-[2.75rem] sm:leading-[1.1]">
        {title}
      </h2>
      {lede ? (
        <p className="mt-5 text-lg leading-relaxed text-pretty text-muted">
          {lede}
        </p>
      ) : null}
    </div>
  );
}

export default async function Home() {
  const release = await getLatestRelease();

  return (
    <div id="top" className="flex flex-1 flex-col overflow-x-clip">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD built from constants
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd(release)).replace(/</g, "\\u003c"),
        }}
      />
      <CanvasBackdrop />

      <main className="flex-1">
        <HeroFlow
          nav={<Nav />}
          releaseLine={<ReleaseLine release={release} />}
        />

        {/* ---------------------------------------------------- Manifesto */}
        <section id="features" className="relative scroll-mt-24 py-28">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="font-display text-4xl leading-[1.12] text-balance sm:text-5xl">
              Your keys. The labs&rsquo; prices.{" "}
              <em className="text-accent">No one in between.</em>
            </h2>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-pretty text-muted">
              Umber talks to Google, OpenAI, Black Forest Labs and every other
              major lab directly, with API keys you own. No subscription, no
              markup, no account. An image costs the few cents the lab charges
              and everything you make stays on your machine.
            </p>
          </div>
        </section>

        {/* ------------------------------------------------------- Models */}
        <section id="models" className="relative scroll-mt-24 py-12">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              title="Pick a model the way you pick a brush"
              lede="The newest image and video models from every major lab, side by side. One key is enough to start."
            />
            <div className="mt-12">
              <ModelPipeline />
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------- Composer */}
        <section className="relative py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-2">
            <div>
              <h2 className="text-4xl font-semibold tracking-tight text-balance sm:text-[2.75rem] sm:leading-[1.1]">
                Know the cost before you create
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-pretty text-muted">
                Type a prompt, pick a size and let it run. Umber shows the exact
                price of every generation before you send it, so a whole session
                costs cents instead of a monthly plan.
              </p>
              <ul className="mt-7 space-y-2.5 text-[15px] text-ink/80">
                {[
                  "Every size from square to cinematic, up to 4K",
                  "Reference images to guide the result",
                  "Image and video from the same prompt box",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-[11px] h-px w-5 shrink-0 bg-accent"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mx-auto w-full max-w-xl">
              <Image
                alt="The Umber composer: a prompt reading “A cinematic photo of a neon-lit street after rain”, the Grok Imagine Image 2.0 model, 1:1 at 1K, and the price — $0.04 — shown before the generation is sent."
                className="w-full"
                height={862}
                sizes="(min-width: 1024px) 36rem, 90vw"
                src="/app/create.webp"
                width={1182}
              />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ Gallery */}
        <section className="relative py-12">
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-2">
            <div className="grid grid-cols-2 gap-4 max-lg:order-last">
              <div className="space-y-4">
                <Image
                  src={AI_IMAGES[11]}
                  alt=""
                  width={IMG_W}
                  height={IMG_H}
                  sizes="(min-width: 1024px) 17rem, 44vw"
                  className="rounded-xl shadow-[0_18px_40px_-18px_rgb(28_41_90/0.45)]"
                />
                <Image
                  src={AI_IMAGES[15]}
                  alt=""
                  width={IMG_W}
                  height={IMG_H}
                  sizes="(min-width: 1024px) 17rem, 44vw"
                  className="rounded-xl shadow-[0_18px_40px_-18px_rgb(28_41_90/0.45)]"
                />
              </div>
              <div className="space-y-4 pt-10">
                <Image
                  src={AI_IMAGES[16]}
                  alt=""
                  width={IMG_W}
                  height={IMG_H}
                  sizes="(min-width: 1024px) 17rem, 44vw"
                  className="rounded-xl shadow-[0_18px_40px_-18px_rgb(28_41_90/0.45)]"
                />
                <Image
                  src={AI_IMAGES[19]}
                  alt=""
                  width={IMG_W}
                  height={IMG_H}
                  sizes="(min-width: 1024px) 17rem, 44vw"
                  className="rounded-xl shadow-[0_18px_40px_-18px_rgb(28_41_90/0.45)]"
                />
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-semibold tracking-tight text-balance sm:text-[2.75rem] sm:leading-[1.1]">
                Your work stays with you
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-pretty text-muted">
                Every generation is saved on your device with the prompt, model
                and settings that made it, so you can pick any thread back up
                and run it again. Nothing is uploaded anywhere.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-pretty text-muted">
                Your keys get the same treatment: encrypted into your operating
                system&rsquo;s keychain, sent only to the lab they belong to.
              </p>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------- How it works */}
        <section id="how-it-works" className="relative scroll-mt-24 py-28">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading title="Creating in three steps" />
            <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Download Umber",
                  body: "Free on macOS, Windows and Linux. No account.",
                },
                {
                  step: "02",
                  title: "Connect a key",
                  body: "Guided setup for your provider, then the key is encrypted into your OS keychain.",
                },
                {
                  step: "03",
                  title: "Create",
                  body: "Prompt, generate, iterate. The lab bills you at cost.",
                },
              ].map((s) => (
                <div key={s.step} className="border-t border-ink/15 pt-6">
                  <span className="font-display text-2xl text-accent italic">
                    {s.step}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
            <div className="mx-auto mt-16 max-w-3xl">
              <Image
                alt="Umber's setup screen: logos for Google, OpenAI, Black Forest Labs and other providers ringing the Umber mark, above the heading “Bring your own keys” and a Connect a provider button."
                className="w-full"
                height={842}
                sizes="(min-width: 1024px) 48rem, 92vw"
                src="/app/byok.webp"
                width={1162}
              />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ Pricing */}
        <section id="pricing" className="relative scroll-mt-24 py-12">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              title="Free. Actually free."
              lede="Umber is MIT licensed software you download and keep. The only money you ever spend goes to the AI labs, at their list price."
            />
            <div className="mx-auto mt-14 grid max-w-4xl gap-5 md:grid-cols-2">
              <div className="glass rounded-3xl p-8 opacity-75">
                <h3 className="font-semibold tracking-tight text-muted">
                  A typical AI subscription
                </h3>
                <p className="mt-4 text-4xl font-semibold tracking-tight">
                  $30<span className="text-lg text-muted">/month</span>
                </p>
                <ul className="mt-6 space-y-3 text-[15px] text-muted">
                  {[
                    "A fixed bundle of credits, whether you use them or not",
                    "One vendor's models only",
                    "Your images live on their servers",
                    "Cancel and it all disappears",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <svg
                        viewBox="0 0 20 20"
                        className="mt-0.5 size-5 shrink-0 text-muted/60"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-raised relative rounded-3xl p-8 ring-2 ring-accent/60">
                <div className="flex items-center gap-2.5">
                  {/* biome-ignore lint/performance/noImgElement: static brand asset */}
                  <img
                    src="/brand/mark.svg"
                    alt=""
                    className="size-6"
                    width={64}
                    height={64}
                  />
                  <h3 className="font-semibold tracking-tight">Umber</h3>
                </div>
                <p className="mt-4 text-4xl font-semibold tracking-tight">
                  $0
                  <span className="text-lg text-muted">
                    {" "}
                    + pay labs per generation
                  </span>
                </p>
                <ul className="mt-6 space-y-3 text-[15px] text-ink/80">
                  {[
                    "Images from a few cents, billed by the provider at cost",
                    "The newest models from every major lab, side by side",
                    "Your gallery and keys never leave your device",
                    "MIT licensed, yours forever",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <svg
                        viewBox="0 0 20 20"
                        className="mt-0.5 size-5 shrink-0 text-accent"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.86-9.36a.75.75 0 0 0-1.22-.88l-2.96 4.1-1.4-1.4a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.14-.09l3.5-4.79Z"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <DownloadButton size="lg" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- FAQ */}
        <section id="faq" className="relative scroll-mt-24 py-28">
          <div className="mx-auto max-w-3xl px-6">
            <SectionHeading title="Fair questions" />
            <div className="mt-12 border-t border-ink/15">
              {FAQ_ITEMS.map((item) => (
                <FaqItem a={item.a} key={item.q} q={item.q} />
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- Final CTA */}
        <section className="relative px-6 pb-32 pt-8">
          <div className="mx-auto max-w-2xl text-center">
            {/* biome-ignore lint/performance/noImgElement: static brand asset */}
            <img
              src="/brand/mark.svg"
              alt=""
              className="mx-auto size-12"
              width={64}
              height={64}
            />
            <h2 className="mx-auto mt-6 max-w-xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Start creating in minutes
            </h2>
            <p className="mx-auto mt-5 max-w-md text-lg text-pretty text-muted">
              Free and open source. No account, no subscription.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <DownloadButton size="lg" />
              <a
                href="https://github.com/SiebeBaree/umber"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-control inline-flex h-13 items-center justify-center gap-2.5 rounded-full px-8 text-base font-medium"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* -------------------------------------------------------- Footer */}
      <footer className="relative border-t border-white/50 bg-white/30 py-10 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            {/* biome-ignore lint/performance/noImgElement: static brand asset */}
            <img
              src="/brand/lockup.svg"
              alt="Umber"
              className="h-6 w-auto"
              width={166}
              height={64}
            />
            <span className="text-sm text-muted">
              open source AI image and video studio
            </span>
          </div>
          <div className="flex items-center gap-5 text-sm text-muted">
            <a
              href="https://github.com/SiebeBaree/umber"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-ink"
            >
              GitHub
            </a>
            <a
              href="https://github.com/SiebeBaree/umber/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-ink"
            >
              Issues
            </a>
            <a
              href="https://github.com/SiebeBaree/umber/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-ink"
            >
              MIT License
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
