// Background Script - speichert nur den Spielnamen für 404-Detection im Content Script

browser.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "fetchGGDeals") {
    // Speichere Spielname für das Content Script auf gg.deals
    const slugifiedName = message.gameTitle.toLowerCase().replace(/\s+/g, "-");
    browser.storage.local.set({
      lastGameTitle: message.gameTitle,
      lastGameSlug: slugifiedName,
      lastGameURL: message.url,
    });

    console.log(
      "%c[GG.deals]%c Navigating to: " + message.url,
      "color: #1e90ff; font-weight: bold;",
      "",
    );

    return Promise.resolve({
      success: true,
      url: message.url,
    });
  }
});
