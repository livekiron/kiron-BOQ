// gate.js
(function() {
  const check = setInterval(() => {
    const verified = localStorage.getItem('verified');
    if (verified === '1') {
      clearInterval(check);
      window.__ALLOW_CONTENT_JS = true;
    }
  }, 300);
})();
