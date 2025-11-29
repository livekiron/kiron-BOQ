import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(
  "786752712312-1e705ru8ud2gnh9m4l01sie8l050317b.apps.googleusercontent.com"
);

// এখানে যে 10টি Gmail চলবে সেগুলো লিখবেন
const ALLOWED_USERS = [
  "srship2025@gmail.com",
  "srship2026@gmail.com"
  
];

// প্রতি PC এর জন্য unique lock
const pcDatabase = {};

export default async function handler(req, res) {
  try {
    const { token, pcId } = req.body;

    if (!token || !pcId) {
      return res.status(400).json({ error: "Token or PC ID missing" });
    }

    // Token Verify
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience:
        "786752712312-1e705ru8ud2gnh9m4l01sie8l050317b.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();
    const email = payload.email;

    // 10 allowed user check
    if (!ALLOWED_USERS.includes(email)) {
      return res.status(403).json({ error: "This Gmail is not allowed" });
    }

    // PC Block system
    if (!pcDatabase[pcId]) {
      pcDatabase[pcId] = email; 
    } else if (pcDatabase[pcId] !== email) {
      return res.status(403).json({ error: "This PC already used — BLOCKED" });
    }

    return res.status(200).json({
      success: true,
      email,
      message: "Verified successfully",
    });

  } catch (err) {
    return res.status(500).json({ error: "Token verify failed", details: err });
  }
}
