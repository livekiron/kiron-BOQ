export default function handler(req, res) {
  const { state } = req.query;

  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const REDIRECT_URI = "https://boq-1-click-auto-fill-5-and-n-a-and-six.vercel.app/api/auth/callback";

  const url =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    ?client_id=${GOOGLE_CLIENT_ID} +
    &redirect_uri=${encodeURIComponent(REDIRECT_URI)} +
    "&response_type=code" +
    "&scope=openid%20email%20profile" +
    &state=${state};

  res.redirect(url);
}