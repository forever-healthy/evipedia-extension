// popup.js — evipedia Chrome Extension popup

(function () {
  "use strict";

  var cbEnabled = document.getElementById("cb-enabled");
  var cbSite    = document.getElementById("cb-site");
  var cbOnce    = document.getElementById("cb-once");
  var rowSite   = document.getElementById("row-site");
  var rowGlobal = document.getElementById("row-global");
  var rowOnce   = document.getElementById("row-once");
  var domainEl  = document.getElementById("current-domain");

  var currentDomain = null;
  var settings = null;

  // Load settings and the active tab's hostname, then render.
  Promise.all([
    new Promise(function (resolve) {
      chrome.storage.sync.get({
        enabled: true,
        excludedDomains: [],
        autoLinkOnce: false
      }, resolve);
    }),
    new Promise(function (resolve) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var tab = tabs && tabs[0];
        if (tab && tab.url) {
          try {
            var u = new URL(tab.url);
            // Per-site exclusion only makes sense for real web pages. file://,
            // chrome://, chrome-extension://, about: etc. have no meaningful
            // domain, so resolve null and the row stays hidden for them.
            resolve((u.protocol === "http:" || u.protocol === "https:") ? u.hostname : null);
          } catch (e) { resolve(null); }
        } else {
          resolve(null);
        }
      });
    })
  ]).then(function (results) {
    settings = results[0];
    currentDomain = results[1];
    render();
  });

  function render() {
    cbEnabled.checked = settings.enabled;
    rowGlobal.classList.toggle("dimmed", false);

    // "Highlight once" maps directly to autoLinkOnce. Disabled when highlighting
    // is off globally.
    cbOnce.checked = settings.autoLinkOnce;
    rowOnce.classList.toggle("dimmed", !settings.enabled);

    if (currentDomain) {
      rowSite.hidden = false;
      domainEl.textContent = currentDomain;
      var excluded = settings.excludedDomains.indexOf(currentDomain) !== -1;
      cbSite.checked = settings.enabled && !excluded;
      rowSite.classList.toggle("dimmed", !settings.enabled);
    } else {
      rowSite.hidden = true;
    }
  }

  // Global enable/disable toggle.
  cbEnabled.addEventListener("change", function () {
    settings.enabled = cbEnabled.checked;
    chrome.storage.sync.set({ enabled: settings.enabled }, function () {
      render();
      reloadActiveTab();
    });
  });

  // Per-site toggle — adds/removes the domain from the excludedDomains list.
  cbSite.addEventListener("change", function () {
    if (!currentDomain) return;
    var excluded = settings.excludedDomains.indexOf(currentDomain) !== -1;
    if (cbSite.checked && excluded) {
      settings.excludedDomains = settings.excludedDomains.filter(function (d) {
        return d !== currentDomain;
      });
    } else if (!cbSite.checked && !excluded) {
      settings.excludedDomains = settings.excludedDomains.concat([currentDomain]);
    }
    chrome.storage.sync.set({ excludedDomains: settings.excludedDomains }, function () {
      reloadActiveTab();
    });
  });

  // Highlight-once toggle — maps directly to autoLinkOnce.
  cbOnce.addEventListener("change", function () {
    settings.autoLinkOnce = cbOnce.checked;
    chrome.storage.sync.set({ autoLinkOnce: settings.autoLinkOnce }, function () {
      reloadActiveTab();
    });
  });

  function reloadActiveTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs && tabs[0] && tabs[0].id) {
        chrome.tabs.reload(tabs[0].id);
      }
    });
  }

})();
