export default async function handler(req, res) {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).send("Missing code");
  }

  res.send("Login Successful! You may close this window.");
}