// Utilities

// Page Detection
// ==============================
const isGGDeals = () =>
  location.hostname === "gg.deals" && location.pathname.startsWith("/game/");
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
async function getGameName() {
  if (isSteamStore()) {
    const baseUrlMatch = window.location.href.match(
      /^https:\/\/store\.steampowered\.com\/app\/\d+\//,
    );
    if (!baseUrlMatch) return null;
    const baseUrl = baseUrlMatch[0];
    const englishUrl = baseUrl + "?l=english";
    try {
      const response = await fetch(englishUrl);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      let name = doc.querySelector(".apphub_AppName")?.textContent.trim();
      console.log(
        "%c[GG.deals]%c Name= " + name,
        "color: #1e90ff; font-weight: bold;",
        "",
      );
      return name;
    } catch (error) {
      console.error("[GG.deals] Error fetching English title:", error);
      return null;
    }
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
    .trim() // Remove leading and trailing whitespace
    .toLowerCase() // Convert to lowercase
    .replace(/\./g, "-") // Replace dots with dashes
    .replace(/:/g, "") // Remove colons
    .replace(/™/g, "") // Remove trademark symbol
    .replace(/©/g, "") // Remove copyright symbol
    .normalize("NFD") // Normalize Unicode to decomposed form
    .replace(/[\u0300-\u036f]/g, "") // Remove accents and diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove all special characters except space and dash
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .replace(/-+/g, "-") // Replace multiple consecutive dashes with single dash
    .replace(/-+$/, ""); // Remove dash if it's the last character
}
