console.log(
  "%c[GG.deals]%c GG.deals Button Addon loaded!",
  "color: #1e90ff; font-weight: bold;",
  "",
);
// API gg.deals J23MlmhqnTEgyKQZistC1oAmyWjoD4kQ
let isERROR = false;
let newTab = true;

// Load settings from storage
async function loadSettings() {
  const defaults = {
    openNewTab: false,
    steamStore: true,
    steamdb: true,
    gog: true,
    ggdeals: true,
  };
  const items = await browser.storage.local.get(defaults);
  newTab = items.openNewTab;
  return items;
}

// Check if button should be shown on current site
function shouldShowButton(settings) {
  if (isSteamStore()) {
    return settings.steamStore;
  } else if (isSteamDB()) {
    return settings.steamdb;
  } else if (isGOG()) {
    return settings.gog;
  } else if (isGGDeals()) {
    return settings.ggdeals;
  }
  return false;
}

// Page Detection
// ==============================
const isGGDeals = () => location.hostname.includes("gg.deals");
const isSteamStore = () => location.hostname === "store.steampowered.com";
const isSteamDB = () => location.hostname.includes("steamdb.info");
const isGOG = () => location.hostname.includes("gog.com");

// Get Game Title
// ==============================
function getGameName() {
  if (isSteamStore()) {
    return document.querySelector(".apphub_AppName").textContent.trim();
  } else if (isSteamDB()) {
    return document.querySelector("h1").textContent.trim();
  } else if (isGOG()) {
    return document.querySelector("h1").textContent.trim();
  } else if (isGGDeals()) {
    return document
      .querySelector('.breadcrumbs-list li:last-child span[itemprop="name"]')
      .textContent.trim();
  } else {
    throwError();
  }
}

// Create Button
// ==============================
function createButton() {
  let gameLink;
  let btnText = "GG.deals";
  let btnClass = "btn";
  let btnElement = "a";
  let toolTip = `Open "${getGameName()}" on GG.deals`;

  if (!isERROR) {
    if (isGGDeals()) {
      btnText = "View on SteamDB";
      btnClass = "game-header-store-link badge";
      toolTip = `Open "${getGameName()}" on Steamdb`;
      gameLink = ggTOsteamdbLink();
      // ==============================
    } else if (isSteamStore()) {
      btnClass = "btnv6_blue_hoverfade btn_medium";
      gameLink = nameTOggLink(getGameName());
      // ==============================
    } else if (isSteamDB()) {
      gameLink = nameTOggLink(getGameName());
      // ==============================
    } else if (isGOG()) {
      btnText = "View on GG.deals";
      gameLink = nameTOggLink(getGameName());
      // ==============================
    } else {
      throwError();
    }
  }

  // Button values
  const gameBtn = document.createElement(btnElement);
  gameBtn.className = btnClass;
  gameBtn.id = "gg-deals-button";
  gameBtn.href = gameLink;
  gameBtn.title = toolTip;
  gameBtn.target = newTab ? "_blank" : "_self";
  // Add inner span for correct styling
  const span = document.createElement("span");
  span.textContent = btnText;
  gameBtn.appendChild(span);

  // Place button on page
  placeButton(gameBtn);
}

// Place Button - Site Specific
// ==============================
function placeButton(button) {
  if (isSteamStore()) {
    const container = document.querySelector(".apphub_OtherSiteInfo");
    const communityHubBtn = Array.from(
      container?.querySelectorAll("a") || [],
    ).find(
      (a) =>
        a.textContent.toLowerCase().includes("community") &&
        a.href.includes("steamcommunity.com"),
    );

    if (communityHubBtn) {
      communityHubBtn.before(button);
      communityHubBtn.before(document.createTextNode(" "));
    } else if (container) {
      const lastChild = container.lastChild;
      if (lastChild) {
        container.insertBefore(button, lastChild);
      }
    }
  } else if (isSteamDB()) {
    const nav = document.querySelector("nav.app-links");

    if (nav) {
      const storeBtn = nav.querySelector('a[href*="store.steampowered.com"]');
      if (storeBtn) {
        storeBtn.after(button);
      } else {
        nav.appendChild(button); // Fallback
      }
    }
  } else if (isGOG()) {
    const wishlistButton = document.querySelector('[class*="wishlist-button"]');
    if (wishlistButton) {
      // Container um Wishlist-Button erstellen
      const container = document.createElement("div");
      container.style.cssText =
        "display: flex; gap: 10px; align-items: center;";

      // Original-Button in Container verschieben
      wishlistButton.parentElement.insertBefore(container, wishlistButton);
      container.appendChild(wishlistButton);
      wishlistButton.style.cssText = "flex: 1 !important;";
      // GG.deals Button hinzufügen
      container.appendChild(button);
    }
  } else if (isGGDeals()) {
    const gameInfoHeading = document.querySelector(".game-info-heading");
    if (gameInfoHeading) {
      gameInfoHeading.appendChild(button);
    } else {
      document.body.insertBefore(button, document.body.firstChild); // Fallback
    }
  } else {
    document.body.insertBefore(button, document.body.firstChild);
  }
}

// Slugify game name
// ==============================
function slugify(str) {
  return str
    .replace(/director's/gi, "directors") // Special case: remove apostrophe from DIRECTOR'S
    .replace(/:/g, "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "-") // replace special characters with dash
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Get GG.deals Link on Game Title
// ==============================
function nameTOggLink(gameTitle) {
  return `https://gg.deals/game/${slugify(gameTitle)}`;
}

// Get SteamDB Link on GG.deals
// ==============================
function ggTOsteamdbLink() {
  const scoreGradeLink = document.querySelector(
    'a.score-grade[href*="store.steampowered.com"]',
  );
  if (scoreGradeLink) {
    const href = scoreGradeLink.getAttribute("href");
    const appId = href.match(/\/app\/(\d+)/)?.[1];
    if (appId) {
      console.log(
        `%c[GG.deals]%c https://steamdb.info/app/${appId}/`,
        "color: #1e90ff; font-weight: bold;",
        "",
      );
      return `https://steamdb.info/app/${appId}/`;
    }
  }
  return null;
}

// Error Handling
// ==============================
function throwError() {
  isERROR = true;
  buttonText = "ERROR";
  toolTip = "Couldn't find game title";
}

// Update button state without reload
async function updateButton() {
  const settings = await loadSettings();
  const button = document.getElementById("gg-deals-button");

  if (shouldShowButton(settings)) {
    // Create button if it doesn't exist
    if (!button) {
      createButton();
    } else {
      // Update target if only newTab changed
      button.target = newTab ? "_blank" : "_self";
    }
  } else {
    // Remove button if it should not be shown
    button?.remove();
  }
}

// Toggle button visibility based on settings with reload
async function toggleButton() {
  const settings = await loadSettings();
  const button = document.getElementById("gg-deals-button");
  const shouldShow = shouldShowButton(settings);
  const buttonExists = !!button;

  // Only reload if button visibility changed
  if (shouldShow !== buttonExists) {
    location.reload();
  } else {
    // Just update target if only newTab changed
    await updateButton();
  }
}

// Initialize button on page load or call immediately if already loaded
async function initButton() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateButton);
  } else {
    await updateButton();
  }
}

// Listen for storage changes and update button with reload if needed
browser.storage.onChanged.addListener(toggleButton);

// Initialize
initButton();
