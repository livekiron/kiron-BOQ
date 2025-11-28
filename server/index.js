// server/index.js
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const cors = require("cors");
const { Low, JSONFile } = require("lowdb");
const { nanoid } = require("nanoid");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI; // e.g. https://your-vercel-domain/auth/callback
const JWT_SECRET = process.env.JWT_SECRET || "change-me";
const OWNER_EMAIL = process.env.OWNER_EMAIL;
const BASE_URL = process.env.BASE_URL || "";

// lowdb (simple JSON DB). For production use real DB.
const dbFile = path.join(process.cwd(), "db.json");
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

async function initDB() {
  await db.read();
  db.data = db.data || { users: [], pending: [] };
  await db.write();
}
initDB();

/**
 * Start Google OAuth (redirect to Google)
 * Example: GET /auth/start
 */
app.get("/auth/start", (req, res) => {
  const state = req.query.state || nanoid();
  const url = https://accounts.google.com/o/oauth2/v2/auth? +
    client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)} +
    &response_type=code +
    &scope=${encodeURIComponent("openid email profile")} +
    &redirect_uri=${encodeURIComponent(REDIRECT_URI)} +
    &state=${encodeURIComponent(state)} +
    &prompt=select_account;
  return res.redirect(url);
});

/**
 * OAuth callback - exchange code for tokens and return short JWT to client via postMessage
 */
app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing code");

  try {
    const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code"
      })
    });

    const tokenJson = await tokenResp.json();
    if (!tokenJson.access_token) {
      console.error("token exchange failed", tokenJson);
      return res.status(500).json(tokenJson);
    }

    // get userinfo
    const profileResp = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: Bearer ${tokenJson.access_token} }
    });
    const profile = await profileResp.json();
    const email = profile.email;

    const payload = { email, iss: "egp-ext", iat: Math.floor(Date.now() / 1000) };
    const shortToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });

    // return small html that posts message to opener (extension popup)
    const html = `<!doctype html><html><body>
      <script>
        (function(){
          const token = ${JSON.stringify(shortToken)};
          try {
            if (window.opener) {
              window.opener.postMessage({ type: "EGP_AUTH", token }, "*");
              window.close();
            } else {
              document.body.innerText = "Login successful. Token: " + token;
            }
          } catch(e) {
            document.body.innerText = "Login successful. Token: " + token;
          }
        })();
      </script>
    </body></html>`;
    res.setHeader("Content-Type", "text/html");
    return res.send(html);
  } catch (err) {
    console.error("auth callback error", err);
    return res.status(500).send("Server error");
  }
});

/**
 * /api/verify
 * Body: { token: <jwt-from-callback>, deviceId: <uuid-from-extension> }
 * Response:
 *   - { ok: true, allowed: true, bound: true, email }
 *   - { ok: false, allowed: false, pending: true }
 *   - { ok: false, allowed: false, message: "..." }
 */
app.post("/api/verify", async (req, res) => {
  const { token, deviceId } = req.body;
  if (!token || !deviceId) return res.status(400).json({ ok: false, error: "missing token or deviceId" });

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ ok: false, error: "invalid token" });
  }

  const email = payload.email;
  await db.read();
  db.data = db.data || { users: [], pending: [] };

  let user = db.data.users.find(u => u.email === email);
  if (!user) {
    // create pending request if not exists
    if (!db.data.pending.find(p => p.email === email)) {
      db.data.pending.push({ email, requestedAt: Date.now() });
      await db.write();
    }
    return res.json({ ok: false, allowed: false, pending: true, message: "Permission pending from owner." });
  }

  if (!user.allowed) return res.json({ ok: false, allowed: false, message: "Not allowed by owner." });

  // bind device if first time
  if (!user.deviceId) {
    user.deviceId = deviceId;
    user.boundAt = Date.now();
    await db.write();
    return res.json({ ok: true, allowed: true, bound: true, email });
  }

  // same device?
  if (user.deviceId === deviceId) {
    return res.json({ ok: true, allowed: true, bound: true, email });
  } else {
    return res.json({ ok: false, allowed: false, message: "This Gmail is already bound to another device." });
  }
});

/**
 * Admin endpoints — owner must supply Authorization: Bearer <token-from-callback>
 */
function authOwner(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ ok: false, error: "no auth" });
  const parts = auth.split(" ");
  if (parts.length !== 2) return res.status(401).json({ ok: false, error: "bad auth" });
  try {
    const payload = jwt.verify(parts[1], JWT_SECRET);
    if (payload.email !== OWNER_EMAIL) return res.status(403).json({ ok: false, error: "not owner" });
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, error: "invalid token" });
  }
}

app.get("/admin/pending", authOwner, async (req, res) => {
  await db.read();
  res.json({ ok: true, pending: db.data.pending || [], users: db.data.users || [] });
});

app.post("/admin/grant", authOwner, async (req, res) => {
  const email = req.body.email;
  if (!email) return res.status(400).json({ ok: false, error: "missing email" });
  await db.read();
  db.data.users = db.data.users || [];
  let user = db.data.users.find(u => u.email === email);
  if (!user) {
    user = { email, allowed: true, deviceId: null, grantedAt: Date.now() };
    db.data.users.push(user);
  } else {
    user.allowed = true;
    user.grantedAt = Date.now();
  }
  db.data.pending = (db.data.pending || []).filter(p => p.email !== email);
  await db.write();
  res.json({ ok: true, user });
});

app.post("/admin/revoke", authOwner, async (req, res) => {
  const email = req.body.email;
  if (!email) return res.status(400).json({ ok: false, error: "missing email" });
  await db.read();
  db.data.users = (db.data.users || []).map(u => {
    if (u.email === email) return { ...u, allowed: false };
    return u;
  });
  await db.write();
  res.json({ ok: true });
});

app.post("/api/whoami", (req, res) => {
  const { token } = req.body;
  try {
    const p = jwt.verify(token, JWT_SECRET);
    res.json({ ok: true, payload: p });
  } catch (e) {
    res.status(400).json({ ok: false, error: "invalid token" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));