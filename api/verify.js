export default async function handler(req, res) {
  const fs = require('fs');
  const path = require('path');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed, use POST' });
  }

  const body = req.body || (await new Promise(r => { let d=''; req.on('data',c=>d+=c); req.on('end',()=>r(JSON.parse(d))); }));
  const email = (body.email || '').toLowerCase().trim();
  const deviceId = (body.deviceId || '').toString();

  if (!email || !deviceId) return res.status(400).json({ success: false, message: 'Missing email or deviceId' });

  const configPath = path.join(process.cwd(), 'data', 'config.json');
  const sessionsPath = path.join(process.cwd(), 'data', 'sessions.json');

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));

  // Blocked check
  if (Array.isArray(config.blocked) && config.blocked.includes(email)) {
    return res.status(403).json({ success: false, message: 'This email is blocked' });
  }

  // Allowed check
  if (Array.isArray(config.allowed) && config.allowed.length > 0 && !config.allowed.includes(email)) {
    return res.status(403).json({ success: false, message: 'This email is not allowed' });
  }

  // No existing session -> bind to deviceId
  if (!sessions[email]) {
    sessions[email] = deviceId;
    fs.writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2));
    return res.json({ success: true, message: 'Login allowed, session created' });
  }

  // Same device -> OK
  if (sessions[email] === deviceId) {
    return res.json({ success: true, message: 'Already logged in on this device' });
  }

  // Different device -> auto-block the email
  if (!Array.isArray(config.blocked)) config.blocked = [];
  if (!config.blocked.includes(email)) {
    config.blocked.push(email);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }
  return res.status(403).json({ success: false, message: 'Email auto-blocked due to login from another device' });
}
