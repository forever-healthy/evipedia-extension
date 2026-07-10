// background.js — evipedia Chrome Extension service worker
// Sets default storage values on first install.

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "install") {
    chrome.storage.sync.set({
      enabled: true,
      excludedDomains: [],
      mode: "auto",
      minAutoLength: 3,
      autoLinkOnce: false,
      showDelay: 120,
      hideDelay: 220
    });
  }
});
