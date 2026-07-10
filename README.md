![Version 0.3.1](https://img.shields.io/badge/Version-0.3.1-green.svg)
![Status: Beta](https://img.shields.io/badge/status-beta-orange.svg)
[![Forever Healthy](https://img.shields.io/badge/(c)_2026-Forever_Healthy-573D7D.svg)](https://forever-healthy.org)
![evipedia.ai](./docs/evipedia-header.png)

# Evipedia Browser Extension (BETA)

A browser extension for **Chrome** and **Firefox** that brings [evipedia.ai](https://evipedia.ai) evidence-review highlighting to any web page you browse.

Annoyed of manualy decoding a supplement label with noumerous compounds, reading a blog post about some therapy, or an X-post that name-drops a peptide — and having to look up every item manually? 

Don't look any further. The Evipedia browser extension has you sorted.

It scans whatever page you're on, recognizes any intervention Evipedia covers, and underlines it right there in the text. Hover for an instant evidence summary, or click through to the full review — no more switching tabs to look things up by hand.

The extension currently recognizes **3,700+ terms across 500+ evidence reviews**.

> **BETA** This is an early release. Term matching is still being tuned, so you may occasionally see a missed or unexpected highlight. Feedback and bug reports are welcome via [GitHub issues](https://github.com/forever-healthy/evipedia-extension/issues).

## Install

> Chrome Web Store and Firefox Add-ons listings coming soon.

Both builds use the CSS Custom Highlight API, so they require a recent browser: **Chrome 105+** or **Firefox 140+**.

Download the [latest ZIP](https://github.com/forever-healthy/evipedia-extension/archive/refs/heads/main.zip) and unzip it, then follow the steps for your browser.

### Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the **`dist/chrome`** folder inside the unzipped download — i.e. `evipedia-extension-main/dist/chrome`.

> ⚠️ Select the **`dist/chrome`** subfolder, **not** the top-level `evipedia-extension-main` folder. Chrome needs the folder that directly contains `manifest.json`; pointing it at the top-level folder will fail.

### Firefox

The Firefox build is a **signed `.xpi`**, so it installs permanently.

1. Open `about:addons`
2. Click the gear ⚙ icon → **Install Add-on From File…**
3. Select **`releases/evipedia-firefox.xpi`** from the unzipped download — i.e. `evipedia-extension-main/releases/evipedia-firefox.xpi`.
4. Confirm the install prompt.

Once installed, open the [live demo page](https://forever-healthy.github.io/evipedia-extension/) to see the extension highlight terms in action.

## How it works

The extension scans the text of every page visited and highlights any term that matches a known evipedia review name (canonical or alternate). Hovering a highlighted term shows a card with the review summary; clicking it opens the full review on evipedia.ai.

The highlights are applied client-side — no page content is sent anywhere. The extension fetches the review index once from `https://evipedia.ai/reviews.json` (the same public endpoint that the embeddable widget uses) and then resolves all terms from memory.

## Privacy

Everything runs locally on the user machine. The extension reads the text of the pages visited only in the browser to find matches — that text is never transmitted. No page content, URLs, browsing history, or personal data is ever sent to Evipedia or anyone else.

Its only network request is a one-time download of the public review index (`/reviews.json`) from evipedia.ai — an ordinary file fetch that carries no user data. All matching, highlighting, and hover cards are computed entirely on-device.

It also never modifies the page's DOM or HTML — highlights are drawn as an overlay, leaving the site exactly as delivered.

## Popup controls

Click the Evipedia icon in the browser toolbar to:

- **Toggle highlighting globally** — on/off for all sites.
- **Highlight only once** — mark only the first occurrence of each term on a page, instead of every occurrence.
- **Toggle highlighting on this site** — exclude (or re-include) the current domain.

## License

MIT — see [LICENSE](./LICENSE).
