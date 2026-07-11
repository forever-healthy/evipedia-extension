/*!
 * evipedia Chrome Extension — content script
 * (c) 2026 Forever Healthy Foundation — MIT License
 *
 * Adapted from evipedia-widget (widget.js). Highlights known intervention
 * terms on any web page and shows a hover card linking to evipedia.ai.
 */
(function () {
  "use strict";

  // Prevent double-injection on dynamic navigations.
  if (window.__evipediaExtension) return;
  window.__evipediaExtension = true;

  var VERSION = "0.1.0";
  var BASE_URL = "https://evipedia.ai";
  var ATTR = "data-evipedia";

  var DEFAULTS = {
    enabled: true,
    excludedDomains: [],
    mode: "auto",
    minAutoLength: 3,
    autoLinkOnce: false,
    showDelay: 120,
    hideDelay: 220
  };

  // See widget.js for the rationale behind these two layers of false-positive control.
  var AUTO_STOPWORDS = { "his": 1, "gal": 1, "sar": 1 };

  var config = null;
  var indexPromise = null;
  var ui = null;
  var linkedTerms = {};

  // Auto highlighting is paint-only via the CSS Custom Highlight API: we register
  // Ranges (no DOM mutation), so highlighting never changes page layout. Because
  // a highlight is not an element it has no hover events — a single pointer
  // listener hit-tests the pointer against each term's Range geometry instead.
  var highlightRanges = [];   // { range, review } for each auto-highlighted term
  var highlightObj = null;    // the CSS Highlight registered under HIGHLIGHT_NAME
  var hoverHit = null;        // range item the pointer is currently over
  var hoverShowTimer = null;
  var pointerX = 0, pointerY = 0, movePending = false, hoverEnabled = false;
  var HIGHLIGHT_NAME = "evipedia";

  // ---- data layer (identical to widget.js) ----------------------------------

  function norm(s) {
    return String(s == null ? "" : s).trim().toLowerCase().replace(/\s+/g, "-");
  }

  function isAcronymName(name) {
    var s = String(name == null ? "" : name).trim();
    if (!s || /\s/.test(s)) return false;
    var upper = (s.match(/[A-Z]/g) || []).length;
    var lower = (s.match(/[a-z]/g) || []).length;
    return upper > 0 && upper > lower;
  }

  function permalinkTail(permalink) {
    var parts = String(permalink || "").split(/[?#]/)[0].split("/").filter(Boolean);
    return parts.length ? parts[parts.length - 1] : "";
  }

  var PAGE_SUFFIX = /_(?:er_qa|qrs_qa|er|qrs)$/;
  function stripPageSuffix(pathname) {
    var p = String(pathname || "").replace(/\/+$/, "");
    var i = p.lastIndexOf("/");
    return p.slice(0, i + 1) + p.slice(i + 1).replace(PAGE_SUFFIX, "");
  }

  function reviewUrl(permalink) {
    try {
      var u = new URL(permalink, BASE_URL + "/");
      return (u.protocol === "https:" || u.protocol === "http:") ? u.href : BASE_URL;
    } catch (e) {
      return BASE_URL;
    }
  }

  function isLocalHost(hostname) {
    var h = String(hostname || "").toLowerCase();
    return h === "localhost" || h === "127.0.0.1" || h === "::1" || h === "[::1]" ||
           h.slice(-10) === ".localhost" || h.slice(-6) === ".local";
  }

  function pointsToCurrentPage(review) {
    try {
      var a = new URL(reviewUrl(review.permalink));
      var b = new URL(window.location.href);
      if (a.host.toLowerCase() !== b.host.toLowerCase() && !isLocalHost(b.hostname)) return false;
      var ap = a.pathname.replace(/\/+$/, "");
      var bp = b.pathname.replace(/\/+$/, "");
      return ap === bp || ap === stripPageSuffix(bp);
    } catch (e) {
      return false;
    }
  }

  function buildIndex(reviews) {
    var data = { byKey: {}, names: [], acronymForms: {} };
    if (!Array.isArray(reviews)) return data;
    // Whether a review's topic is the general "… for Health & Longevity" one
    // (vs. a condition-specific angle like "… to Treat Cancer"). canonical_topic
    // is optional in reviews.json — absent → false, so this is a no-op until the
    // upstream field lands.
    function isGeneralTopic(review) {
      var t = String(review.canonical_topic || "").toLowerCase();
      return t.indexOf("health & longevity") !== -1 ||
             t.indexOf("health and longevity") !== -1;
    }
    var strong = {}; // keys claimed by Pass 1 — never overridden by an alternate
    function claim(k, review) {
      var key = norm(k);
      if (key && !data.byKey[key]) { data.byKey[key] = review; strong[key] = true; }
    }
    // When an ALTERNATE name matches two reviews (e.g. "Ascorbic Acid" is an
    // alternate of both "Vitamin C" and "High-Dose Vitamin C to Treat Cancer"),
    // prefer the general health-&-longevity review over a condition-specific one.
    // Any other collision keeps first-in-array order, as before.
    function claimAlt(k, review) {
      var key = norm(k);
      if (!key || strong[key]) return;                 // strong keys always win
      var cur = data.byKey[key];
      if (!cur || (isGeneralTopic(review) && !isGeneralTopic(cur)))
        data.byKey[key] = review;
    }
    // Pass 1: strong keys — slug, id, canonical name, permalink tail.
    reviews.forEach(function (review) {
      [review.slug, review.id, review.canonical_name, permalinkTail(review.permalink)]
        .forEach(function (k) { claim(k, review); });
    });
    // Pass 2: alternate names — only for keys no strong key already took, with
    // the generic-preference tie-break above when two alternates collide.
    reviews.forEach(function (review) {
      (Array.isArray(review.alternate_names) ? review.alternate_names : [])
        .forEach(function (k) { claimAlt(k, review); });
    });
    reviews.forEach(function (review) {
      var humanNames = [review.canonical_name].concat(
        Array.isArray(review.alternate_names) ? review.alternate_names : []);
      humanNames.forEach(function (nm) {
        if (!nm) return;
        data.names.push(nm);
        if (isAcronymName(nm)) {
          var k = norm(nm);
          (data.acronymForms[k] || (data.acronymForms[k] = [])).push(String(nm).trim());
        }
      });
    });
    return data;
  }

  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch(BASE_URL + "/reviews.json")
        .then(function (r) {
          if (!r.ok) throw new Error("reviews.json HTTP " + r.status);
          return r.json();
        })
        .then(function (raw) { return buildIndex(raw); })
        .catch(function () { return { byKey: {}, names: [] }; });
    }
    return indexPromise;
  }

  // ---- card UI (Shadow DOM) -------------------------------------------------
  // NB: diverges from widget.js — the card is built with DOM APIs/textContent
  // instead of innerHTML+escapeHtml (see render()), so escapeHtml is not needed.

  var ABBR = /^(?:e\.g|i\.e|vs|etc|approx|cf|al|Dr|Mr|Mrs|Ms|Prof|Fig)$/i;
  function firstSentence(text) {
    var s = String(text == null ? "" : text).replace(/\s+/g, " ").trim();
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);
      if (c !== "." && c !== "!" && c !== "?") continue;
      var next = s.charAt(i + 1);
      if (next && next !== " ") continue;
      var lastWord = s.slice(0, i).split(" ").pop().replace(/^[^A-Za-z]+/, "");
      if (ABBR.test(lastWord)) continue;
      if (/^[A-Z]$/.test(lastWord)) continue;
      return s.slice(0, i + 1);
    }
    return s;
  }

  function createUI() {
    var host = document.createElement("div");
    host.setAttribute("data-evipedia-cardhost", "");
    document.body.appendChild(host);
    var root = host.attachShadow({ mode: "open" });
    root.innerHTML =
      "<style>" +
      ":host{all:initial}" +
      ".card{position:fixed;top:0;left:0;width:320px;max-width:calc(100vw - 24px);" +
        "background:#fff;color:#202122;border:1px solid #c8ccd1;border-radius:10px;" +
        "box-shadow:0 6px 24px rgba(0,0,0,.18);font:14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;" +
        "opacity:0;transform:translateY(4px);transition:opacity .13s,transform .13s;pointer-events:none;z-index:2147483647;overflow:hidden}" +
      ".card.on{opacity:1;transform:translateY(0);pointer-events:auto}" +
      ".body{padding:12px 14px 14px}" +
      ".kicker{font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:#72777d;margin:0 0 4px}" +
      ".title{font-weight:700;font-size:16px;margin:0 0 6px}" +
      ".conclusion{margin:0 0 10px;color:#202122;display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden}" +
      ".more{color:#3366cc;text-decoration:none;font-weight:600;font-size:13px}" +
      ".more:hover{text-decoration:underline}" +
      "@media (prefers-color-scheme: dark){" +
        ".card{background:#1b1b1b;color:#e6e6e6;border-color:#3a3a3a}" +
        ".kicker{color:#9aa0a6}.conclusion{color:#e6e6e6}.more{color:#7aa7ec}}" +
      "</style>" +
      '<div class="card"><div class="content"></div></div>';

    var card = root.querySelector(".card");
    var content = root.querySelector(".content");
    var hideTimer;

    function position(anchor) {
      var r = anchor.getBoundingClientRect();
      var cw = card.offsetWidth, ch = card.offsetHeight, pad = 8;
      // Use fixed positioning — no scrollY/scrollX offset needed.
      var top = r.bottom + pad;
      if (r.bottom + ch + pad > window.innerHeight && r.top - ch - pad > 0) {
        top = r.top - ch - pad;
      }
      var left = r.left;
      left = Math.max(12, Math.min(left, window.innerWidth - cw - 12));
      card.style.top = top + "px";
      card.style.left = left + "px";
    }

    function render(review) {
      // Build with DOM APIs + textContent (no innerHTML) so untrusted review
      // fields can never be interpreted as markup — also silences AMO's
      // "unsafe innerHTML assignment" lint.
      function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text != null) n.textContent = text;
        return n;
      }
      var body = el("div", "body");
      body.appendChild(el("p", "kicker", "evipedia · evidence review"));
      body.appendChild(el("p", "title", review.canonical_name));
      body.appendChild(el("p", "conclusion", firstSentence(review.er_conclusion)));
      var more = el("a", "more", "See the review →");
      more.href = reviewUrl(review.permalink);
      more.target = "_blank";
      more.rel = "noopener";
      body.appendChild(more);
      content.textContent = "";
      content.appendChild(body);
    }

    card.addEventListener("mouseenter", function () { clearTimeout(hideTimer); });
    card.addEventListener("mouseleave", function () { hideTimer = setTimeout(hide, config.hideDelay); });

    // anchor is anything with getBoundingClientRect() — a term element (manual
    // mode) or a Range (auto mode via the Highlight API).
    function show(anchor, review) {
      clearTimeout(hideTimer);
      render(review);
      card.classList.add("on");
      position(anchor);
    }

    function hide() { card.classList.remove("on"); }
    function scheduleHide() { hideTimer = setTimeout(hide, config.hideDelay); }

    return { show: show, scheduleHide: scheduleHide, host: host };
  }

  // ---- term binding & scanning (identical to widget.js) --------------------

  function bind(term, review) {
    var showTimer;
    term.addEventListener("mouseenter", function () {
      showTimer = setTimeout(function () { ui.show(term, review); }, config.showDelay);
    });
    term.addEventListener("mouseleave", function () {
      clearTimeout(showTimer);
      ui.scheduleHide();
    });
  }

  function ensureAffordanceStyles() {
    if (document.getElementById("evipedia-ext-style")) return;
    var style = document.createElement("style");
    style.id = "evipedia-ext-style";
    // .evipedia-term styles manual-mode term elements. ::highlight() paints the
    // auto-mode Ranges — only a limited property set is honoured there (color,
    // background, text-decoration, text-shadow); cursor is not, so auto terms
    // carry the dotted underline but not the help cursor.
    style.textContent =
      ".evipedia-term{text-decoration:underline;text-decoration-style:dotted;" +
      "text-decoration-thickness:1px;text-underline-offset:2px;cursor:help}" +
      "::highlight(" + HIGHLIGHT_NAME + "){text-decoration:underline dotted;" +
      "text-decoration-thickness:1px;text-underline-offset:2px}";
    (document.head || document.documentElement).appendChild(style);
  }

  function enhance(term, review) {
    term.__evipediaBound = true;
    term.classList.add("evipedia-term");
    bind(term, review);
  }

  function manualScan(data) {
    var terms = document.querySelectorAll("[" + ATTR + "]");
    var enhanced = 0;
    Array.prototype.forEach.call(terms, function (term) {
      if (term.__evipediaBound) return;
      var review = data.byKey[norm(term.getAttribute(ATTR))];
      if (!review || pointsToCurrentPage(review)) return;
      enhance(term, review);
      enhanced++;
    });
    return enhanced;
  }

  function escapeRegExp(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Build a regex fragment for one name that treats spaces and hyphens as
  // interchangeable separators, so "Medium-Chain Triglycerides" also matches
  // "medium chain triglycerides" on the page (and vice versa). norm() already
  // collapses both to the same key, so the byKey lookup still resolves.
  function namePattern(name) {
    return escapeRegExp(name).replace(/[\s-]+/g, "[\\s-]+");
  }

  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, INPUT: 1,
    A: 1, BUTTON: 1, SELECT: 1, OPTION: 1, CODE: 1, PRE: 1, KBD: 1, SAMP: 1 };

  function autoPattern(data) {
    if (data.__pattern !== undefined) return data.__pattern;
    var uniq = {};
    data.names.forEach(function (n) {
      var t = String(n == null ? "" : n).trim();
      if (t.length >= config.minAutoLength && !AUTO_STOPWORDS[t.toLowerCase()]) {
        uniq[t.toLowerCase()] = t;
      }
    });
    var list = Object.keys(uniq).map(function (k) { return uniq[k]; });
    list.sort(function (a, b) { return b.length - a.length; });
    data.__pattern = list.length
      ? new RegExp("(^|[^A-Za-z0-9])(" + list.map(namePattern).join("|") + ")(?![A-Za-z0-9])", "gi")
      : null;
    return data.__pattern;
  }

  // No layout/display checks are needed: the Highlight API paints Ranges without
  // touching the DOM, so highlighting inside flex, grid or -webkit-line-clamp
  // containers is safe. We only skip text where highlighting is unwanted or
  // meaningless (non-visual tags, editable regions, already-highlighted spans).
  function autoEligible(node) {
    if (!node.nodeValue || !/\S/.test(node.nodeValue)) return false;
    for (var p = node.parentNode; p && p.nodeType === 1; p = p.parentNode) {
      if (SKIP_TAGS[p.tagName]) return false;
      if (p.isContentEditable) return false;
      if (p.classList && p.classList.contains("evipedia-term")) return false;
      if (p.hasAttribute && (p.hasAttribute(ATTR) ||
          p.hasAttribute("data-evipedia-cardhost"))) return false;
    }
    return true;
  }

  function highlightSupported() {
    return typeof Highlight !== "undefined" && window.CSS && CSS.highlights;
  }

  function ensureHighlight() {
    if (!highlightObj) {
      highlightObj = new Highlight();
      CSS.highlights.set(HIGHLIGHT_NAME, highlightObj);
    }
    return highlightObj;
  }

  // Register a Range for every term match in this text node. No DOM mutation, so
  // the node's offsets stay valid across matches and the page layout is untouched.
  function autoHighlight(node, data, pattern, hl) {
    var text = node.nodeValue;
    pattern.lastIndex = 0;
    var added = 0, m;
    while ((m = pattern.exec(text))) {
      var name = m[2];
      var start = m.index + m[1].length;
      var key = norm(name);
      var forms = data.acronymForms[key];
      if (forms && forms.indexOf(name) === -1) continue;
      var review = data.byKey[key];
      if (!review) continue;
      if (pointsToCurrentPage(review)) continue;
      if (config.autoLinkOnce && linkedTerms[key]) continue;
      var range = document.createRange();
      range.setStart(node, start);
      range.setEnd(node, start + name.length);
      hl.add(range);
      highlightRanges.push({ range: range, review: review });
      added++;
      if (config.autoLinkOnce) linkedTerms[key] = true;
    }
    return added;
  }

  // ---- pointer hit-testing for auto (Range) highlights ----------------------

  function rangeAt(x, y) {
    for (var i = 0; i < highlightRanges.length; i++) {
      var it = highlightRanges[i];
      var bb = it.range.getBoundingClientRect();
      if (!bb.width && !bb.height) continue;
      if (x < bb.left || x > bb.right || y < bb.top || y > bb.bottom) continue;
      var rects = it.range.getClientRects();
      for (var j = 0; j < rects.length; j++) {
        var r = rects[j];
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return it;
      }
    }
    return null;
  }

  function processHover() {
    movePending = false;
    var hit = rangeAt(pointerX, pointerY);
    if (hit) {
      if (hoverHit === hit) return;
      hoverHit = hit;
      clearTimeout(hoverShowTimer);
      hoverShowTimer = setTimeout(function () {
        ui.show(hit.range, hit.review);
      }, config.showDelay);
    } else if (hoverHit) {
      hoverHit = null;
      clearTimeout(hoverShowTimer);
      ui.scheduleHide();
    }
  }

  function onPointerMove(e) {
    if (!highlightRanges.length) return;
    // Ignore movement over the card itself; it manages its own show/hide timers.
    if (ui && ui.host && e.composedPath && e.composedPath().indexOf(ui.host) !== -1) return;
    pointerX = e.clientX;
    pointerY = e.clientY;
    if (movePending) return;
    movePending = true;
    requestAnimationFrame(processHover);
  }

  function enableHover() {
    if (hoverEnabled) return;
    hoverEnabled = true;
    document.addEventListener("mousemove", onPointerMove, { passive: true });
  }

  function autoScan(data) {
    if (!highlightSupported()) return 0;
    var pattern = autoPattern(data);
    if (!pattern || !document.body) return 0;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var nodes = [], node;
    while ((node = walker.nextNode())) if (autoEligible(node)) nodes.push(node);
    var hl = ensureHighlight();
    var added = 0;
    nodes.forEach(function (n) { added += autoHighlight(n, data, pattern, hl); });
    if (added) enableHover();
    return added;
  }

  // The evipedia widget (evipedia.ai/widget.js) does this very same highlighting
  // when a site embeds it. If a page already loads the widget, stand down
  // entirely so the two never fight over the same terms. Detection is DOM-based
  // on purpose: this content script runs in an isolated world and can't see the
  // page's window.evipedia global, but it CAN see the <script src=".../widget.js">
  // tag that puts the widget on the page in the first place.
  function widgetPresent() {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].src;
      if (!src) continue;
      try {
        var u = new URL(src, location.href);
        if (/(^|\.)evipedia\.ai$/i.test(u.hostname) && /(^|\/)widget\.js$/i.test(u.pathname)) {
          return true;
        }
      } catch (e) { /* ignore unparseable src */ }
    }
    return false;
  }

  function scan() {
    return loadIndex().then(function (data) {
      manualScan(data);
      if (config.mode === "auto") autoScan(data);
    });
  }

  // ---- bootstrap ------------------------------------------------------------

  function start(settings) {
    var hostname = window.location.hostname;
    var excluded = (settings.excludedDomains || []).indexOf(hostname) !== -1;
    if (!settings.enabled || excluded) return;

    config = {
      mode: settings.mode || DEFAULTS.mode,
      minAutoLength: settings.minAutoLength != null ? settings.minAutoLength : DEFAULTS.minAutoLength,
      autoLinkOnce: settings.autoLinkOnce != null ? settings.autoLinkOnce : DEFAULTS.autoLinkOnce,
      showDelay: settings.showDelay != null ? settings.showDelay : DEFAULTS.showDelay,
      hideDelay: settings.hideDelay != null ? settings.hideDelay : DEFAULTS.hideDelay
    };

    function run() {
      // Stand down entirely if the page already runs the evipedia widget, so the
      // two never fight over the same terms. Checked here (not in scan) so that on
      // a widget page the extension injects no style, no card host, nothing — its
      // inactivity is observable: none of our DOM markers appear.
      if (widgetPresent()) return;
      ensureAffordanceStyles();
      if (!ui) ui = createUI();
      scan();
    }

    if (document.readyState !== "loading") run();
    else document.addEventListener("DOMContentLoaded", run);
  }

  // Read settings once on injection, then start.
  chrome.storage.sync.get(DEFAULTS, start);

  // Allow popup to query whether the content script is alive on this tab.
  chrome.runtime.onMessage.addListener(function (msg, _sender, reply) {
    if (msg.action === "ping") reply({ active: !!config });
  });

})();
