# Evipedia Extension - Change Log


### v0.4.1 — 2026-09-21

* **Hover card on stacked highlights** — moving from a highlighted term down (or up) into its
  card no longer switches to, or hides behind, a highlight on the next line. The gap between
  term and card now counts as part of the card, and reaching the card cancels any pending switch.

* **Number ranges** — a term directly followed by "-" plus a digit is no longer matched, e.g.
  "C10" (an MCT alias) in the INCI name "C10-30 Alkyl Acrylate".

### v0.4.0 — 2026-09-21

* **Popup layout** — "evipedia.ai" (linked) at the top left, "Evidence reviews" at the top
  right, and the extension version (e.g. "v0.4.0") at the bottom right.

### v0.3.9 — 2026-09-18

* **Unicode word boundaries** — terms no longer match inside words with non-ASCII letters,
  e.g. "gegen" (a Kudzu alias) inside German "gegenüber".

* Stop-listed "gegen" (German for "against").

### v0.3.8 — 2026-09-18

* **Terms split across elements** — terms are now matched across adjacent inline elements,
  e.g. x.com search results render the query "glp-1" as `<span>GLP</span><span>-</span><span>1</span>`.
  Matching never crosses links, line breaks or block elements.

* **Plurals** — a trailing "s" now matches too ("GLP-1s", "statins"), looked up by the singular.

### v0.3.7 — 2026-09-18

* **Dynamic pages** — terms are now highlighted in content rendered after page load
  (single-page apps like x.com, infinite scroll, client-side navigation). A throttled
  `MutationObserver` scans added/edited text and drops highlights whose text was removed.

### v0.3.6 — 2026-07-11

* **Touch support** — tapping a highlighted term now opens its evidence card (and tapping
  away dismisses it) on touch devices, which have no hover: iOS/iPadOS Safari and Firefox for
  Android. Uses `pointerup` + the same range hit-test as hover; mouse/desktop is unchanged.

### v0.3.5 — 2026-07-11

* Firefox: added `gecko_android.strict_min_version: 142.0` so the
  `data_collection_permissions` key is only offered on Android versions that support it
  (silences the AMO "manifest key not supported by minimum Firefox for Android" warning).
  Desktop min stays 140.
* Hover card is now built with DOM APIs + `textContent` instead of `innerHTML` string
  concatenation (removes AMO's "unsafe innerHTML assignment" warning; no behavior change).
  The now-unused `escapeHtml` helper was dropped.

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
