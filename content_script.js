console.log(
  "%c[GG.deals]%c GG.deals Button Addon geladen!",
  "color: #1e90ff; font-weight: bold;",
  "",
);
// API gg.deals J23MlmhqnTEgyKQZistC1oAmyWjoD4kQ
let isERROR = false;
let newTab = true;

// Page Detection
// ==============================
const isGGDeals = () => location.hostname.includes("gg.deals");
const isSteamStore = () => location.hostname === "store.steampowered.com";
const isSteamDB = () => location.hostname.includes("steamdb.info");

// Get Game Title
// ==============================
function getGameName() {
  if (isSteamStore()) {
    return document.querySelector(".apphub_AppName").textContent;
  } else if (isSteamDB()) {
    return document.querySelector("h1").textContent;
  } else if (isGGDeals()) {
    return document.querySelector(
      '.breadcrumbs-list li:last-child span[itemprop="name"]',
    ).textContent;
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
      btnText = "SteamDB";
      btnElement = "a";
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

    if (container) {
      // Find Community Hub button and insert before it
      const communityHubBtn = Array.from(container.querySelectorAll("a")).find(
        (a) => a.textContent.includes("Communityhub"),
      );

      if (communityHubBtn) {
        container.insertBefore(button, communityHubBtn);
        communityHubBtn.before(document.createTextNode(" "));
      } else {
        container.appendChild(button); // Fallback
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

// Clean Gamename
// ==============================
function slugify(str) {
  return str
    .replace(/:/g, "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
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
        `%c[GG.deals]%c https://steamdb.info/app/${appId}/`, //! reuse for API call
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

// Rufe createButton sofort auf oder warte auf DOMContentLoaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", createButton);
} else {
  // Seite ist bereits geladen, rufe sofort auf
  createButton();
}
