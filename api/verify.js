export default function handler(req, res) {
  const { email, uid } = req.query;

  // Allowed Gmail List
  const allowed = [
    "srship205@gmail.com",
    "srship206@gmail.com"
    
  ];

  if (!allowed.includes(email)) {
    return res.status(403).json({
      success: false,
      message: "Email not allowed"
    });
  }

  return res.status(200).json({
    success: true,
    message: "Verified",
    email,
    uid
  });
}
