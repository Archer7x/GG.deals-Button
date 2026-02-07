// Get all checkboxes
const openNewTabCheckbox = document.getElementById("openNewTab");
const steamStoreCheckbox = document.getElementById("steamStore");
const steamdbCheckbox = document.getElementById("steamdb");
const ggdealsCheckbox = document.getElementById("ggdeals");

// Load settings from storage when popup opens
async function loadSettings() {
  const defaults = {
    openNewTab: true,
    steamStore: true,
    steamdb: true,
    ggdeals: true,
  };
  const items = await browser.storage.local.get(defaults);
  openNewTabCheckbox.checked = items.openNewTab;
  steamStoreCheckbox.checked = items.steamStore;
  steamdbCheckbox.checked = items.steamdb;
  ggdealsCheckbox.checked = items.ggdeals;
}

// Save setting when checkbox changes
function setupEventListeners() {
  openNewTabCheckbox.addEventListener("change", () => {
    browser.storage.local.set({ openNewTab: openNewTabCheckbox.checked });
  });

  steamStoreCheckbox.addEventListener("change", () => {
    browser.storage.local.set({ steamStore: steamStoreCheckbox.checked });
  });

  steamdbCheckbox.addEventListener("change", () => {
    browser.storage.local.set({ steamdb: steamdbCheckbox.checked });
  });

  ggdealsCheckbox.addEventListener("change", () => {
    browser.storage.local.set({ ggdeals: ggdealsCheckbox.checked });
  });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  setupEventListeners();
});
