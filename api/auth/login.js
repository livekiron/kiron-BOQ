export default async function handler(req, res) {
  const redirect = encodeURIComponent(
    ${process.env.BASE_URL}/api/auth/callback
  );

  const url =
    https://accounts.google.com/o/oauth2/v2/auth +
    ?client_id=${process.env.GOOGLE_CLIENT_ID} +
    &redirect_uri=${redirect} +
    &response_type=code +
    &scope=email%20profile +
    &access_type=offline;

  return res.redirect(url);
}
