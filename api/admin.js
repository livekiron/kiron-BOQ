// api/admin.js
import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

const DB_PATH = path.join(process.cwd(), 'data.sqlite');

function openDb() { return new sqlite3.Database(DB_PATH); }

export default function handler(req, res) {
  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(403).json({ ok:false, error:'admin_key_missing_or_invalid' });
  }

  const db = openDb();
  if (req.method === 'GET') {
    db.all('SELECT * FROM registrations', [], (err, rows) => {
      db.close();
      if (err) return res.status(500).json({ ok:false, error: err.message });
      res.json({ ok:true, rows });
    });
  } else if (req.method === 'POST') {
    const { action, email } = req.body || {};
    if (!action || !email) {
      db.close();
      return res.status(400).json({ ok:false, error:'action and email required' });
    }
    if (action === 'block') {
      db.run('UPDATE registrations SET blocked = 1 WHERE email = ?', [email], function(err) {
        db.close();
        if (err) return res.status(500).json({ ok:false, error: err.message });
        res.json({ ok:true, msg:'blocked' });
      });
    } else if (action === 'unblock') {
      db.run('UPDATE registrations SET blocked = 0 WHERE email = ?', [email], function(err) {
        db.close();
        if (err) return res.status(500).json({ ok:false, error: err.message });
        res.json({ ok:true, msg:'unblocked' });
      });
    } else {
      db.close();
      res.status(400).json({ ok:false, error:'unknown action' });
    }
  } else {
    db.close();
    res.status(405).json({ ok:false, error:'method not allowed' });
  }
}
