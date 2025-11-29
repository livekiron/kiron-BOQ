export default async function handler(req, res) {
  const fs = require('fs');
  const path = require('path');

  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Use POST' });

  const body = req.body || (await new Promise(r => { let d=''; req.on('data',c=>d+=c); req.on('end',()=>r(JSON.parse(d))); }));
  const email = (body.email || '').toLowerCase().trim();
  if (!email) return res.status(400).json({ success: false, message: 'Missing email' });

  const configPath = path.join(process.cwd(), 'data', 'config.json');
  const sessionsPath = path.join(process.cwd(), 'data', 'sessions.json');

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));

  config.blocked = (config.blocked || []).filter(e => e !== email);
  if (sessions[email]) delete sessions[email];

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  fs.writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2));

  res.json({ success: true, message: 'Unblocked and session removed' });
}
