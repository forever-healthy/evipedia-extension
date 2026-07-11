![Version 0.3.6](https://img.shields.io/badge/Version-0.3.6-green.svg)
![Status: Beta](https://img.shields.io/badge/status-beta-orange.svg)
[![Forever Healthy](https://img.shields.io/badge/(c)_2026-Forever_Healthy-573D7D.svg)](https://forever-healthy.org)
![evipedia.ai](./docs/evipedia-header.png)

# Evipedia Browser Extension (BETA)

A browser extension for **Chrome**, **Firefox**, and **Safari** that brings [evipedia.ai](https://evipedia.ai) evidence-review highlighting to any web page you browse.

Annoyed of manually decoding a supplement label with numerous compounds, reading a blog post about some therapy, or an X-post that name-drops a peptide — and having to look up every item manually? 

Don't look any further. The Evipedia browser extension has you sorted.

It scans whatever page you're on, recognizes any intervention Evipedia covers, and underlines it right there in the text. Hover for an instant evidence summary, or click through to the full review — no more switching tabs to look things up by hand.

The extension currently recognizes **3,700+ terms across 500+ evidence reviews**.

> **BETA** Feedback and bug reports are welcome via [GitHub issues](https://github.com/forever-healthy/evipedia-extension/issues).

## Install

> Chrome Web Store, Firefox Add-ons, and Safari App Store listings coming soon.

All builds use the CSS Custom Highlight API, so they require a recent browser: **Chrome 105+**, **Firefox 140+**, or **Safari 17.4+**.

### Chrome

1. Download **[evipedia-chrome.zip](https://github.com/forever-healthy/evipedia-extension/raw/main/releases/evipedia-chrome.zip)** and unzip it.
2. Open `chrome://extensions`
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the unzipped **`evipedia-chrome`** folder (the one containing `manifest.json`).

### Firefox

Firefox loads unpacked extensions **temporarily** — they're removed when Firefox restarts. (A permanent, auto-updating install via the Firefox Add-ons gallery is coming soon.)

1. Download **[evipedia-firefox.zip](https://github.com/forever-healthy/evipedia-extension/raw/main/releases/evipedia-firefox.zip)** and unzip it.
2. Open `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on…** and select the **`manifest.json`** inside the unzipped **`evipedia-firefox`** folder.

### Safari

Safari only installs unpacked extensions **temporarily** — they're removed when you quit Safari, so you re-add each session.

1. Download **[evipedia-safari.zip](https://github.com/forever-healthy/evipedia-extension/raw/main/releases/evipedia-safari.zip)** and unzip it.
2. **Settings → Developer** → check **Allow unsigned extensions**.
3. In the same pane, click **Add Temporary Extension…** → select the unzipped **`evipedia-safari`** folder.
4. **Settings → Extensions** → enable **Evipedia** and grant it access to websites.

Steps 2–3 reset every time you quit Safari.

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
