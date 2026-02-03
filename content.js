// Extrahiere den Spieltitel aus der Seite
function getGameTitle() {
  return (
    document.getElementById("appHubAppName")?.textContent.trim() ||
    document.querySelector(".apphub_AppName")?.textContent.trim() ||
    document.querySelector("h1")?.textContent.trim() ||
    null
  );
}

// Erstelle einen Button und füge ihn zur Seite hinzu
function addGGDealsButton() {
  if (document.getElementById("gg-deals-button")) {
    return;
  }

  const gameTitle = getGameTitle();
  if (!gameTitle) {
    return;
  }

  const isStoresteampowered =
    window.location.hostname === "store.steampowered.com";

  // Erstelle einen Link
  const button = document.createElement("a");
  button.id = "gg-deals-button";
  button.href = "#";

  if (isStoresteampowered) {
    button.className = "btnv6_blue_hoverfade btn_medium";
    button.innerHTML = "<span>GG.deals</span>";
  } else {
    button.className = "btn";
    button.textContent = "GG.deals";
  }

  button.title = `Suche "${gameTitle}" auf GG.deals`;

  // Klick-Event
  button.addEventListener("click", function (e) {
    e.preventDefault();
    const ggDealsUrl = `https://gg.deals/game/${slugify(gameTitle)}`; // Direkt die game seite öffnen `https://gg.deals/search/?title=${encodeURIComponent(gameTitle)}`;
    window.open(ggDealsUrl, "_blank");
  });

  if (isStoresteampowered) {
    // Auf Steam Store: VOR dem Community Hub Button einfügen
    const container = document.querySelector(".apphub_OtherSiteInfo");
    const buttons = container?.querySelectorAll("a");

    // Suche nach Community Hub Button
    let communityButton = null;
    if (buttons) {
      for (let btn of buttons) {
        if (btn.textContent.includes("Community")) {
          communityButton = btn;
          break;
        }
      }
    }

    if (communityButton) {
      communityButton.before(button);
      // Füge einen Text-Node mit Leerraum ein, wie bei den SteamDB Buttons
      communityButton.before(document.createTextNode(" "));
    } else if (container) {
      // Fallback: In Container einfügen
      container.appendChild(button);
    }
  } else {
    // Auf SteamDB: Nach Store-Button einfügen
    const storeButtons = Array.from(
      document.querySelectorAll('a[href*="store.steampowered.com"]'),
    );
    const storeButton =
      storeButtons.find((btn) => btn.querySelector("svg.octicon-steam")) ||
      storeButtons[storeButtons.length - 1];

    if (storeButton) {
      storeButton.after(button);
    }
  }
}

// Mehrmals versuchen
addGGDealsButton();
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", addGGDealsButton);
}
window.addEventListener("load", addGGDealsButton);
setTimeout(addGGDealsButton, 500);
setTimeout(addGGDealsButton, 1500);
