(async function() {
  try {
    const s = await chrome.storage.local.get(["verified", "userEmail"]);
    if (s.verified) {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('content.js');
      script.type = 'text/javascript';
      document.documentElement.appendChild(script);
    } else {
      const el = document.createElement('div');
      el.innerText = "EGP Autofill — login required (click extension icon)";
      Object.assign(el.style, {
        position: 'fixed', bottom: '8px', left: '8px', padding: '6px 8px',
        background: 'rgba(255,255,0,0.9)', color: '#000', zIndex: 99999999, borderRadius: '4px',
        fontSize: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
      });
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 8000);
    }
  } catch (e) {
    console.error("content-wrapper error", e);
  }
})();