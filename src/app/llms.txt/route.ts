import {
  GITHUB_URL,
  LICENSE_URL,
  PROVIDERS,
  SITE_DESCRIPTION,
  SITE_URL,
} from "../../lib/site";

/*
 * llms.txt (llmstxt.org): a plain-markdown summary served for AI crawlers
 * and assistants, so answers about Umber come from these facts instead of
 * guesses. Built from the same constants as the rest of the site.
 */
const BODY = `# Umber

> ${SITE_DESCRIPTION}

Umber is a native desktop studio for AI image and video generation. There is
no Umber server and no Umber account: you connect your own API keys and the
app talks to each AI lab directly.

Key facts:

- Price: free. Open source under the MIT license. The only money spent goes
  to the AI labs, at their list price per generation. Umber adds no markup.
- Models: the newest image and video models from ${PROVIDERS.join(
  ", ",
)}. One API key is enough to start.
- Cost preview: the exact price of every generation is shown before it runs,
  so a session costs cents instead of a monthly plan.
- Privacy: API keys are encrypted into the operating system's keychain and
  sent only to the lab they belong to. Prompts and generations go straight
  from your machine to the provider. The gallery is stored locally with the
  prompt, model and settings behind every result.
- Platforms: macOS, Windows and Linux.
- No subscription, no credits bundle, no lock-in. Compared with a typical
  $30/month AI subscription, Umber costs $0 plus the per-generation lab fees.

## Links

- [Website](${SITE_URL}): overview, model catalog and download
- [Download](${SITE_URL}/download): redirects to the newest installer for the
  visitor's platform. Add \`?os=mac\`, \`?os=windows\` or \`?os=linux\` to pick one.
- [GitHub repository](${GITHUB_URL}): source code, issues and releases
- [MIT License](${LICENSE_URL})

## FAQ

- Is Umber really free? Yes. MIT licensed, no markup, no cut. You only pay
  the labs for what you generate.
- Can Umber see my keys, prompts or images? No. Keys live in your OS
  keychain, requests go straight to the provider and the gallery stays on
  your device.
- Do I need a key for every provider? No, one is enough. The model picker
  shows what each key unlocks.
`;

export const dynamic = "force-static";

export function GET() {
  return new Response(BODY, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
