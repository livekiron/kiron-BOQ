import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: ${process.env.BASE_URL}/api/auth/callback,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();

  if (tokenData.error) {
    return res.status(400).json(tokenData);
  }

  // Get User Info
  const userRes = await fetch(
    https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}
  );
  const userData = await userRes.json();

  const allowed = process.env.ALLOWED_EMAILS.split(",");

  if (!allowed.includes(userData.email)) {
    return res.status(403).send("Access denied");
  }

  // Generate signed login token
  const loginToken = jwt.sign(
    {
      email: userData.email,
      name: userData.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.send(`
    <script>
      localStorage.setItem("kiron_boq_token", "${loginToken}");
      window.close();
    </script>
    Login Successful. You can close this window.
  `);
}
