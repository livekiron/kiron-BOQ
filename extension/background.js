chrome.runtime.onInstalled.addListener(() => {
  console.log("EGP Auth extension installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.cmd === "OPEN_OAUTH") {
    const state = Math.random().toString(36).slice(2);

    const url = `${message.baseUrl}/auth/start?state=${encodeURIComponent(state)}`;

    chrome.windows.create(
      { url: url, type: "popup", width: 600, height: 700 },
      () => sendResponse({ ok: true })
    );

    return true;
  }
});