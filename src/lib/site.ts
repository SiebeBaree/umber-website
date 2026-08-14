/*
 * The single source of truth for the site's public identity. Every canonical
 * URL, sitemap entry, robots rule, Open Graph tag and llms.txt line derives
 * from these constants.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://umber.s4.nu";

export const SITE_NAME = "Umber";

export const SITE_TITLE = "Umber | Free Open Source AI Image & Video Generator";

export const SITE_DESCRIPTION =
  "Generate AI images and videos with your own API keys. 30 models from 9 labs, no subscription, no markup. Free and open source on macOS, Windows and Linux.";

export const SLOGAN = "The best AI models. One free studio.";

export const GITHUB_URL = "https://github.com/SiebeBaree/umber";
export const LICENSE_URL = `${GITHUB_URL}/blob/main/LICENSE`;

export const PROVIDERS = [
  "Google",
  "OpenAI",
  "Black Forest Labs",
  "ByteDance",
  "Kuaishou (Kling)",
  "Alibaba",
  "Runway",
  "Ideogram",
  "Recraft",
];
