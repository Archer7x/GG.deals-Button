console.log(
  "%c[GG.deals]%c GG.deals Button Addon active!",
  "color: #1e90ff; font-weight: bold;",
);

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

// Create Button
// ==============================
async function createButton() {
  const gameName = await getGameName(); // Warte auf englischen Namen

  // Check if game name could be retrieved
  if (!gameName) {
    console.warn(
      "%c[GG.deals]%c Could not determine game name - button creation aborted",
      "color: #ff6b6b; font-weight: bold;",
    );
    throwError();
    return; // Exit early if no game name found
  }

  let gameLink;
  let btnText = "GG.deals";
  let btnClass = "btn";
  let btnElement = "a";
  let toolTip = `Open "${gameName}" on GG.deals`;

  if (!isERROR) {
    if (isGGDeals()) {
      btnText = "View on SteamDB";
      btnClass = "game-header-store-link badge";
      toolTip = `Open "${gameName}" on Steamdb`;
      gameLink = ggTOsteamdbLink();
      // ==============================
    } else if (isSteamStore()) {
      btnClass = "btnv6_blue_hoverfade btn_medium";
      gameLink = await nameTOggLink(gameName);
      // ==============================
    } else if (isSteamDB()) {
      gameLink = await nameTOggLink(gameName);
      // ==============================
    } else if (isGOG()) {
      btnText = "View on GG.deals";
      gameLink = await nameTOggLink(gameName);
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
  console.log(
    "%c[GG.deals]%c GG.deals Button created!",
    "color: #1e90ff; font-weight: bold;",
  );
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
    try {
      const wishlistButton = document.querySelector(
        '[class*="wishlist-button"]',
      );
      if (wishlistButton && wishlistButton.parentElement) {
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
      } else {
        // Fallback: Button direkt am Anfang des body einfügen
        console.warn(
          "[GG.deals] Wishlist button not found on GOG.com, using fallback placement",
        );
        document.body.insertBefore(button, document.body.firstChild);
      }
    } catch (error) {
      console.error("[GG.deals] Error placing button on GOG.com:", error);
      document.body.insertBefore(button, document.body.firstChild);
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

// Get GG.deals Link on Game Title
// ==============================
async function nameTOggLink(gameTitle) {
  let ggURL = `https://gg.deals/game/${slugify(gameTitle)}`;
  console.log(
    "%c[GG.deals]%c Slugifyed= " + slugify(gameTitle),
    "color: #1e90ff; font-weight: bold;",
    "",
  );

  try {
    // Sende Message an Background Script
    const response = await browser.runtime.sendMessage({
      action: "fetchGGDeals",
      url: ggURL,
      gameTitle: gameTitle,
    });

    if (response.success) {
      if (response.has404) {
        console.log(
          "%c[GG.deals]%c 404 Error - Using fallback search...",
          "color: #ff6b6b; font-weight: bold;",
          "",
        );
        ggURL = response.url;
        if (response.url) {
          console.log(
            "%c[GG.deals]%c URL found: " + ggURL,
            "color: #51cf66; font-weight: bold;",
            "",
          );
        }
      } else {
        console.log(
          "%c[GG.deals]%c ✓ GG.deals page verified successfully",
          "color: #51cf66; font-weight: bold;",
          "",
        );
        ggURL = response.url;
      }
      return ggURL;
    } else {
      console.error(
        "%c[GG.deals]%c Fehler: " + response.error,
        "color: #ff6b6b; font-weight: bold;",
        "",
      );
      return ggURL;
    }
  } catch (error) {
    console.error(
      "%c[GG.deals]%c Exception: " + error.message,
      "color: #ff6b6b; font-weight: bold;",
      "",
    );
    return ggURL;
  }
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
      await createButton();
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
