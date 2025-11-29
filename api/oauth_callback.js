// api/oauth_callback.js
export default function handler(req, res) {
  const html = `<!doctype html>
  <html>
  <head><meta charset="utf-8"><title>OAuth Callback</title></head>
  <body>
    <script>
      // id_token will be in URL fragment as id_token=...
      const hash = location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const id_token = params.get('id_token');
      if (id_token && window.opener) {
        window.opener.postMessage({ type: 'oauth_id_token', id_token }, '*');
        setTimeout(() => { window.close(); }, 500);
      } else {
        document.body.innerText = 'No id_token found or no opener';
      }
    </script>
  </body>
  </html>`;
  res.setHeader('Content-Type', 'text/html');
  res.end(html);
}
