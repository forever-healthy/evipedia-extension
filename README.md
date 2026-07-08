![Version 0.1.0](https://img.shields.io/badge/Version-0.1.0-green.svg)
![Status: Beta](https://img.shields.io/badge/status-beta-orange.svg)
[![Forever Healthy](https://img.shields.io/badge/(c)_2026-Forever_Healthy-573D7D.svg)](https://forever-healthy.org)
![evipedia.ai](./docs/evipedia-header.png)

# BETA: Evipedia Chrome Extension

A Chrome extension that brings [evipedia.ai](https://evipedia.ai) evidence-review highlighting to any web page you browse.

Annoyed of reading a supplement label with noumerous compounds, a blog post about some therapy, or an x-post that name-drops a peptide — and having to look up every item manually? 

Don't look any further. The Evipedia Chrome extension has you sorted.

It scans whatever page you're on, recognizes any intervention Evipedia covers, and underlines it right there in the text. Hover for an instant evidence summary, or click through to the full review — no more switching tabs to look things up by hand.

The extension currently recognises **3,700+ terms across 500+ evidence reviews**.

> **BETA** This is an early release. Term matching is still being tuned, so you may occasionally see a missed or unexpected highlight. Feedback and bug reports are welcome via [GitHub issues](https://github.com/forever-healthy/evipedia-extension/issues).

## Install

> Chrome Web Store listing coming soon.

Requires **Chrome 105 or later** (the extension uses the CSS Custom Highlight API for highlighting).

Until then, install it manually:

1. Download the [latest ZIP](https://github.com/forever-healthy/evipedia-extension/archive/refs/heads/main.zip) and unzip it.
2. Open `chrome://extensions`
3. Enable **Developer mode**.
4. Click **Load unpacked** → select the unzipped folder.

## How it works

The extension scans the text of every page you visit and highlights any term that matches a known evipedia review name (canonical or alternate). Hovering a highlighted term shows a card with the review summary; clicking it opens the full review on evipedia.ai.

The highlights are applied client-side — no page content is sent anywhere. The extension fetches the review index once from `https://evipedia.ai/reviews.json` (the same public endpoint the embeddable widget uses), then resolves all terms from memory.

## Privacy

Everything runs locally on your machine. The extension reads the text of the pages you visit only in your own browser to find matches — that text is never transmitted. No page content, URLs, browsing history, or personal data is ever sent to Evipedia or anyone else.

Its only network request is a one-time download of the public review index (`reviews.json`) from evipedia.ai — an ordinary file fetch that carries none of your data. All matching, highlighting, and hover cards are computed entirely on-device.

It also never modifies the page's DOM or HTML — highlights are drawn as an overlay, leaving the site exactly as delivered.

## Popup controls

Click the Evipedia icon in your browser toolbar to:

- **Toggle highlighting globally** — on/off for all sites.
- **Highlight only once** — mark only the first occurrence of each term on a page, instead of every occurrence.
- **Toggle highlighting on this site** — exclude (or re-include) the current domain.

## License

MIT — see [LICENSE](./LICENSE).
