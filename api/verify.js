export default function handler(req, res) {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email missing"
    });
  }

  // Allowed Gmail list
  const allowed = [
    "srship205@gmail.com",
    "srship206@gmail.com"
  ];

  // Check Email
  if (!allowed.includes(email)) {
    return res.status(403).json({
      success: false,
      message: "Email not allowed"
    });
  }

  return res.status(200).json({
    success: true,
    message: "Verified Access"
  });
}
