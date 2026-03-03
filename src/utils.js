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
    try {
      const h1 = document.querySelector("h1");
      if (!h1) {
        console.warn("[GG.deals] No h1 found on SteamDB page");
        return null;
      }
      return h1.textContent.trim();
    } catch (error) {
      console.error("[GG.deals] Error getting SteamDB title:", error);
      return null;
    }
  } else if (isGOG()) {
    try {
      // Try multiple selectors for GOG.com
      let name = document.querySelector("h1")?.textContent.trim();
      
      // Fallback selectors if h1 didn't work
      if (!name) {
        name = document.querySelector('[data-gameTitle]')?.getAttribute('data-gameTitle');
      }
      if (!name) {
        name = document.querySelector('.productCardImg')?.getAttribute('alt');
      }
      if (!name) {
        name = document.querySelector('.image')?.getAttribute('alt');
      }
      
      if (!name) {
        console.warn("[GG.deals] Could not find game title on GOG.com");
        return null;
      }
      
      console.log(
        "%c[GG.deals]%c GOG Title= " + name,
        "color: #1e90ff; font-weight: bold;",
        "",
      );
      return name;
    } catch (error) {
      console.error("[GG.deals] Error getting GOG title:", error);
      return null;
    }
  } else if (isGGDeals()) {
    try {
      const element = document.querySelector('.breadcrumbs-list li:last-child span[itemprop="name"]');
      if (!element) {
        console.warn("[GG.deals] No breadcrumb found on GG.deals");
        return null;
      }
      return element.textContent.trim();
    } catch (error) {
      console.error("[GG.deals] Error getting GG.deals title:", error);
      return null;
    }
  } else {
    throwError();
  }
}

// Slugify game name
// ==============================
function slugify(str) {
  return (
    str
      .trim()
      .replace(/\./g, "-") // Replace dots with dash
      .replace(/:/g, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // replace special characters with dash
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
  );
}
