export default async function handler(req, res) {
  const fs = require('fs');
  const path = require('path');

  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Use POST' });

  const body = req.body || (await new Promise(r => { let d=''; req.on('data',c=>d+=c); req.on('end',()=>r(JSON.parse(d))); }));
  const email = (body.email || '').toLowerCase().trim();
  if (!email) return res.status(400).json({ success: false, message: 'Missing email' });

  const sessionsPath = path.join(process.cwd(), 'data', 'sessions.json');
  const sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));

  if (sessions[email]) {
    delete sessions[email];
    fs.writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2));
  }

  res.json({ success: true, message: 'Session removed' });
}
