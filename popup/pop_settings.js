// Get all checkboxes
const openNewTabCheckbox = document.getElementById("openNewTab");
const steamStoreCheckbox = document.getElementById("steamStore");
const steamdbCheckbox = document.getElementById("steamdb");
const gogCheckbox = document.getElementById("gog");
const ggdealsCheckbox = document.getElementById("ggdeals");

// Load settings from storage when popup opens
async function loadSettings() {
  const defaults = {
    openNewTab: true,
    steamStore: true,
    steamdb: true,
    gog: true,
    ggdeals: true,
  };
  const items = await browser.storage.local.get(defaults);
  openNewTabCheckbox.checked = items.openNewTab;
  steamStoreCheckbox.checked = items.steamStore;
  steamdbCheckbox.checked = items.steamdb;
  gogCheckbox.checked = items.gog;
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

  gogCheckbox.addEventListener("change", () => {
    browser.storage.local.set({ gog: gogCheckbox.checked });
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
