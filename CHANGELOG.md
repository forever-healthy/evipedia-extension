# Evipedia Extension - Change Log


### v0.3.4 — 2026-07-11

* Removed the redundant `<all_urls>` **host permission**. The content script still runs on all
  sites (via `content_scripts` matches) to highlight terms, but the extension no longer holds
  broad fetch/cookie access — the only host permission is `https://evipedia.ai/*`. No behavior
  change; reduces the permission footprint and the Chrome Web Store "broad host permissions" flag.

### v0.3.3 — 2026-07-11

* Extension description now reads "health **and longevity** intervention terms" to better
  reflect the review coverage (store-listing + manifest copy).
* Added an extension privacy policy at `docs/privacy.html`
  (`https://forever-healthy.github.io/evipedia-extension/privacy.html`) for the store listings.

### v0.3.2 — 2026-07-10

* **Safari support (beta)** — added a Safari build; install temporarily via *Develop →
  Add Temporary Extension* on the unzipped `evipedia-safari.zip`. Requires Safari 17.4+.
* `/build` now also packages the `evipedia-chrome.zip` and `evipedia-safari.zip` downloads
  (manifest at zip root).

### v0.3.1 — 2026-07-10

* **Firefox now installs permanently** — ships as a Mozilla-signed `.xpi`
  (`releases/evipedia-firefox.xpi`); install via `about:addons` → *Install Add-on From
  File*. No more temporary loading.

### v0.3.0 — 2026-07-10

* **Firefox support** — added a Firefox build in **`dist/firefox`** (load it via `about:debugging` → *Load Temporary Add-on*, select `manifest.json`). Requires Firefox 140+.
* Shares the exact same highlighting/popup code as the Chrome build; no functional changes

### v0.2.0 — 2026-07-10

* Repackaged for multi-browser: load the **`dist/chrome`** folder from the download in `chrome://extensions` (previously the top-level folder)
* No functional changes to highlighting or the popup

### v0.1.2 — 2026-07-09

* Prefer the general Health & Longevity review when an alternate name matches more than one

### v0.1.1 — 2026-07-09

* Add a "Give feedback" link to the popup

### v0.1.0 — 2026-07-09

* 1st BETA release
