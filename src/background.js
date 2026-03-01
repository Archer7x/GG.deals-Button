// Background Script für sichere Fetch-Anfragen (umgeht CSP der Webseite)

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchGGDeals") {
    (async () => {
      try {
        const response = await fetch(message.url);

        // Prüfe HTTP-Status-Code
        console.log(
          "%c[GG.deals]%c HTTP Status: " + response.status,
          "color: #1e90ff; font-weight: bold;",
          "",
        );

        // Wenn Status 404, dann Suchseite fetchen
        if (response.status === 404) {
          console.warn(
            "%c[GG.deals]%c 404 Error erkannt - Suche auf Suchseite...",
            "color: #ff6b6b; font-weight: bold;",
            "",
          );

          // Fetche Suchseite mit gameTitle
          const searchUrl = `https://gg.deals/search/?title=${encodeURIComponent(message.gameTitle)}`;
          const searchResponse = await fetch(searchUrl);
          const searchHtml = await searchResponse.text();
          const searchDoc = new DOMParser().parseFromString(searchHtml, "text/html");

          // Extrahiere href aus games-list
          const gamesList = searchDoc.getElementById("games-list");
          const href = gamesList?.querySelector(".full-link")?.getAttribute("href");

          if (href) {
            console.log(
              "%c[GG.deals]%c ✓ Spiel auf Suchseite gefunden: " + href,
              "color: #51cf66; font-weight: bold;",
              "",
            );
            sendResponse({ success: true, has404: true, url: `https://gg.deals${href}` });
          } else {
            console.warn(
              "%c[GG.deals]%c Spiel auf Suchseite nicht gefunden",
              "color: #ff6b6b; font-weight: bold;",
              "",
            );
            sendResponse({ success: true, has404: false, url: message.url });
          }
          return;
        }

        console.log(
          "%c[GG.deals]%c Seite existiert - kein 404",
          "color: #51cf66; font-weight: bold;",
          "",
        );
        sendResponse({ success: true, has404: false, url: message.url });
      } catch (error) {
        console.error(
          "%c[GG.deals]%c Fehler beim Laden: " + error.message,
          "color: #ff6b6b; font-weight: bold;",
          "",
        );
        sendResponse({
          success: false,
          error: error.message,
          url: message.url,
        });
      }
    })();
    return true; // Sagt Firefox, dass die Response asynchron kommt
  }
});
