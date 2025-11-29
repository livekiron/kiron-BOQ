// background.js - create/keep a deviceId and provide a login helper
chrome.runtime.onInstalled.addListener(() => {
  console.log('BOQ Auth Lock extension installed');
});

function getDeviceId() {
  return new Promise(resolve => {
    chrome.storage.local.get(['boq_device_id'], result => {
      if (result && result.boq_device_id) return resolve(result.boq_device_id);
      const id = (crypto && crypto.randomUUID) ? crypto.randomUUID() : ('id-' + Math.random().toString(36).slice(2) + Date.now().toString(36));
      chrome.storage.local.set({ boq_device_id: id }, () => resolve(id));
    });
  });
}

// Expose a simple login function to content script via messages
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'BOQ_VERIFY') {
    (async () => {
      const deviceId = await getDeviceId();
      const email = (msg.email || '').toLowerCase();
      const server = msg.server || 'https://kiron-boq.vercel.app';
      try {
        const resp = await fetch(server + '/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, deviceId })
        });
        const data = await resp.json();
        sendResponse(data);
      } catch (e) {
        sendResponse({ success: false, message: e.message });
      }
    })();
    return true; // keep channel open for async response
  }
});
