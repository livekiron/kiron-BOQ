export default function handler(req, res) {
  const { state } = req.query;

  const GOOGLE_CLIENT_ID =
    "211687593638-nhqqkfqj53vaiosgd5dm2f3hvhjt0sc0.apps.googleusercontent.com";

  const REDIRECT_URI = "https://kiron-boq.vercel.app/api/auth/callback";

  const url =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    ?client_id=${GOOGLE_CLIENT_ID} +
    &redirect_uri=${encodeURIComponent(REDIRECT_URI)} +
    "&response_type=code" +
    "&scope=openid%20email%20profile" +
    &state=${state};

  res.redirect(url);
}
