export default function handler(req, res) {
  const { state } = req.query;

  const GOOGLE_CLIENT_ID =
    "211687593638-p3h4h5u2hh59svp428k2r9n49803ao4v.apps.googleusercontent.com";

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


