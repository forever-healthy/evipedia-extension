# Evipedia Extension - Change Log


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
