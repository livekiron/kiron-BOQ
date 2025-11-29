export default async function handler(req, res) {
  const fs = require('fs');
  const path = require('path');

  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Use GET' });

  const configPath = path.join(process.cwd(), 'data', 'config.json');
  const sessionsPath = path.join(process.cwd(), 'data', 'sessions.json');

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));

  res.json({ success: true, config, sessions });
}
