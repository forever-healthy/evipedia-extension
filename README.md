![Version 0.1.0](https://img.shields.io/badge/Version-0.1.0-green.svg)
[![Forever Healthy](https://img.shields.io/badge/(c)_2026-Forever_Healthy-573D7D.svg)](https://forever-healthy.org)
![evipedia.ai](./docs/evipedia-header.png)

# Evipedia Chrome Extension

A Chrome extension that brings [evipedia.ai](https://evipedia.ai) evidence-review highlighting to any web page you browse.

When you hover over a recognised health intervention name, the extension shows a compact card summarising Evipedia's evidence review — with a click-through to the full review. No configuration required on the websites you visit.

## Install

> Chrome Web Store listing coming soon.

Until then, load the extension unpacked from the [latest GitHub release](https://github.com/forever-healthy/evipedia-chrome/releases):

1. Download and unzip the release archive.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** → select the unzipped folder.

## How it works

The extension scans the text of every page you visit and highlights any term that matches a known evipedia review name (canonical or alternate). Hovering a highlighted term shows a card with the review summary; clicking it opens the full review on evipedia.ai.

The highlights are applied client-side — no page content is sent anywhere. The extension fetches the review index once from `https://evipedia.ai/reviews.json` (the same public endpoint the embeddable widget uses), then resolves all terms from memory.

The hover card is rendered inside a Shadow DOM so it never affects the page's own styles.

## Popup controls

Click the Evipedia icon in your browser toolbar to:

- **Toggle highlighting globally** — on/off for all sites.
- **Toggle highlighting on this site** — exclude (or re-include) the current domain.

## License

MIT — see [LICENSE](./LICENSE).
