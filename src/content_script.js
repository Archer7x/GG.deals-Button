console.log(
  "%c[GG.deals]%c GG.deals Button Addon active!",
  "color: #1e90ff; font-weight: bold;",
);
// API gg.deals J23MlmhqnTEgyKQZistC1oAmyWjoD4kQ
let isERROR = false;
let newTab = true;

// Fallback URL wenn 404 auf gg.deals
const FALLBACK_URL = "https://gg.deals/";

// Check if URL returns 404 via HTTP status
// ==============================
async function is404Page() {
  try {
    // Versuche nur den Headers zu abrufen (schneller)
    const response = await fetch(window.location.href, {
      method: "HEAD",
      credentials: "include",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    return response.status === 404;
  } catch (error) {
    // Fallback: Bei CORS oder anderen Fehlern versuche GET
    try {
      const response = await fetch(window.location.href, {
        method: "GET",
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      return response.status === 404;
    } catch (err) {
      // Bei Fehler annehmen dass Seite existiert
      console.log(
        `%c[GG.deals]%c Statuscheck fehlgeschlagen: ${err.message}`,
        "color: #1e90ff; font-weight: bold;",
        "",
      );
      return false;
    }
  }
}

// Redirect auf Fallback URL bei 404
// ==============================
function redirect404() {
  console.log(
    "%c[GG.deals]%c ⚠️ 404 erkannt - Leite weiter zu Fallback URL",
    "color: #ff6b6b; font-weight: bold;",
    "",
  );

  showNotification(
    "🔄 Spiel nicht gefunden - eine Alternative wird gesucht...",
    "warning",
  );

  // Kurze Verzögerung damit Notification angezeigt wird
  setTimeout(() => {
    if (window.history.length > 1) {
      // Zurück zur vorherigen Seite
      window.history.back();
    } else {
      // Fallback zu gg.deals
      window.location.href = FALLBACK_URL;
    }
  }, 500);
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

// Show notification to user
// ==============================
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
    ${type === "error" ? "background-color: #ff6b6b;" : type === "warning" ? "background-color: #ffa500;" : "background-color: #4ecdc4;"}
  `;

  document.body.appendChild(notification);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// Add animation styles
// ==============================
if (!document.querySelector("#gg-deals-animations")) {
  const style = document.createElement("style");
  style.id = "gg-deals-animations";
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// Create Button
// ==============================
async function createButton() {
  const gameName = await getGameName(); // Warte auf englischen Namen

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
      gameLink = nameTOggLink(gameName);
      // ==============================
    } else if (isSteamDB()) {
      gameLink = nameTOggLink(gameName);
      // ==============================
    } else if (isGOG()) {
      btnText = "View on GG.deals";
      gameLink = nameTOggLink(gameName);
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

// Check for 404 page and redirect if needed
// ==============================
async function check404Redirect() {
  if (isGGDeals() && (await is404Page())) {
    redirect404();
  }
}

// Listen for storage changes and update button with reload if needed
browser.storage.onChanged.addListener(toggleButton);

// Initialize
initButton();

// Check for 404 page after load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => check404Redirect(), 500); // Kleine Verzögerung um sicherzustellen dass DOM vollständig ist
  });
} else {
  setTimeout(() => check404Redirect(), 500);
}
