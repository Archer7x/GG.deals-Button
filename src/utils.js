// Utilities

// Page Detection
// ==============================
const isGGDeals = () => location.hostname.includes("gg.deals");
const isSteamStore = () => location.hostname === "store.steampowered.com";
const isSteamDB = () => location.hostname.includes("steamdb.info");
const isGOG = () => location.hostname.includes("gog.com");

// Get Steam App ID
// ==============================
function getSteamID() {
  if (isSteamStore()) {
    // Extract from URL: https://store.steampowered.com/app/686810/...
    const match = window.location.href.match(/\/app\/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }
}

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

// Slugify game name
// ==============================
function slugify(str) {
  return str
    .replace(/director's/gi, "directors") // Special case: remove apostrophe from DIRECTOR'S CUT
    .replace(/:/g, "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "-") // replace special characters with dash
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
