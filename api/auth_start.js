// api/auth_start.js
export default function handler(req, res) {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "211687593638-p3h4h5u2hh59svp428k2r9n49803ao4v.apps.googleusercontent.com";
  if (!GOOGLE_CLIENT_ID) return res.status(500).send("Missing GOOGLE_CLIENT_ID env");

  const origin = process.env.PUBLIC_ORIGIN || `https://${req.headers.host}`;
  const redirectUri = `${origin}/api/oauth_callback`;

  const scope = encodeURIComponent("openid email profile");
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=id_token&scope=${scope}&nonce=nonce&prompt=select_account&include_granted_scopes=true`;

  res.writeHead(302, { Location: url });
  res.end();
}
