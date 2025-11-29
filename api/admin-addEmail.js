export default async function handler(req, res) {
  const fs = require('fs');
  const path = require('path');

  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Use POST' });

  const body = req.body || (await new Promise(r => { let d=''; req.on('data',c=>d+=c); req.on('end',()=>r(JSON.parse(d))); }));
  const email = (body.email || '').toLowerCase().trim();
  if (!email) return res.status(400).json({ success: false, message: 'Missing email' });

  const configPath = path.join(process.cwd(), 'data', 'config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  config.allowed = Array.isArray(config.allowed) ? config.allowed : [];
  if (!config.allowed.includes(email)) {
    config.allowed.push(email);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }

  res.json({ success: true, message: 'Email added to allowed list', config });
}
