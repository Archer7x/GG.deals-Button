// Settings keys
const SETTINGS_KEYS = {
  openNewTab: 'openNewTab',
  steamStore: 'steamStore',
  steamdb: 'steamdb',
  ggdeals: 'ggdeals'
};

// Load settings from storage
async function loadSettings() {
  try {
    const settings = await chrome.storage.sync.get(Object.values(SETTINGS_KEYS));
    
    // Set default values if not found
    const defaults = {
      openNewTab: true,
      steamStore: true,
      steamdb: false,
      ggdeals: true
    };
    
    Object.keys(defaults).forEach(key => {
      const element = document.getElementById(key);
      if (element) {
        element.checked = settings[key] !== undefined ? settings[key] : defaults[key];
      }
    });
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Save settings to storage
async function saveSetting(key, value) {
  try {
    await chrome.storage.sync.set({ [key]: value });
  } catch (error) {
    console.error('Error saving setting:', error);
  }
}

// Initialize event listeners
function initializeListeners() {
  Object.keys(SETTINGS_KEYS).forEach(key => {
    const element = document.getElementById(key);
    if (element) {
      element.addEventListener('change', (e) => {
        saveSetting(key, e.target.checked);
      });
    }
  });
}

// Initialize when popup loads\ndocument.addEventListener('DOMContentLoaded', () => {\n  loadSettings();\n  initializeListeners();\n});
 * If the extension couldn't inject the script, handle the error.
 */
(async function runOnPopupOpened() {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    
    await browser.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["/content_scripts/beastify.js"],
    });
    listenForClicks();
  } catch (e) {
    reportExecuteScriptError(e);
  }
})();