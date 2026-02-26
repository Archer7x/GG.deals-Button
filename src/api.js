// API Helper Functions
// ==============================

const API_KEY = "WPcGYlQytF-78ycmsG6IlyxKNHZvvRZL";
const API_BASE_URL = "https://api.gg.deals/v1/prices/by-steam-app-id/";
const DEFAULT_REGION = "de"; // Optional: de, gb, us, etc.

/**
 * Fetch price data from GG.deals API by Steam App ID(s)
 * @param {string|number|Array} steamIds - Steam App ID or array of IDs
 * @param {string} region - Optional region code (de, gb, us, etc.)
 * @returns {Promise<Object|null>} Price data or null if error
 */
async function fetchGamePrice(steamIds, region = DEFAULT_REGION) {
  try {
    // Convert single ID to array
    const ids = Array.isArray(steamIds) ? steamIds : [steamIds];
    
    // Validate max 100 IDs per request
    if (ids.length > 100) {
      console.warn(
        `%c[GG.deals API]%c Max 100 IDs per request, got ${ids.length}`,
        "color: #1e90ff; font-weight: bold;",
        ""
      );
      return null;
    }

    const idsParam = ids.join(",");
    const url = new URL(API_BASE_URL);
    url.searchParams.append("ids", idsParam);
    url.searchParams.append("key", API_KEY);
    url.searchParams.append("region", region);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      console.error(
        `%c[GG.deals API]%c Request failed:`,
        "color: #1e90ff; font-weight: bold;",
        result.data?.message || "Unknown error"
      );
      return null;
    }

    // Log rate limit info
    const rateLimit = response.headers.get("x-ratelimit-remaining");
    if (rateLimit) {
      console.log(
        `%c[GG.deals API]%c Rate limit remaining: ${rateLimit}`,
        "color: #1e90ff; font-weight: bold;",
        ""
      );
    }

    console.log(
      `%c[GG.deals API]%c Successfully fetched prices for ${ids.length} game(s)`,
      "color: #1e90ff; font-weight: bold;",
      ""
    );

    return result.data;
  } catch (error) {
    console.error(
      `%c[GG.deals API]%c Error fetching prices:`,
      "color: #1e90ff; font-weight: bold;",
      error
    );
    return null;
  }
}

/**
 * Display price information on the page
 * @param {string|number} steamId - Steam App ID
 * @param {string} selector - CSS selector where to insert the price
 * @param {string} region - Optional region code
 */
async function displayGamePrice(steamId, selector, region = DEFAULT_REGION) {
  const container = document.querySelector(selector);
  if (!container) return;

  const priceData = await fetchGamePrice(steamId, region);
  if (!priceData || !priceData[steamId]) {
    console.warn(`%c[GG.deals API]%c No data found for Steam ID: ${steamId}`, "color: #1e90ff; font-weight: bold;", "");
    return;
  }

  const game = priceData[steamId];
  const priceElement = document.createElement("div");
  priceElement.id = "gg-deals-price-info";
  priceElement.style.cssText = `
    margin-top: 10px;
    padding: 8px 12px;
    background: #f0f0f0;
    border-left: 4px solid #1e90ff;
    border-radius: 4px;
    font-weight: 600;
    color: #333;
  `;

  const currentRetail = game.prices.currentRetail || "N/A";
  const currentKeyshops = game.prices.currentKeyshops || "N/A";
  const currency = game.prices.currency || "USD";

  priceElement.innerHTML = `
    <strong><a href="${game.url}" target="_blank">${game.title}</a></strong><br>
    <small>
      Retail: <strong>${currentRetail}</strong> ${currency} | 
      Keyshops: <strong>${currentKeyshops}</strong> ${currency}
    </small>
  `;

  container.appendChild(priceElement);
}
