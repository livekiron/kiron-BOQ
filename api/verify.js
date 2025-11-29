// api/verify.js
import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import fetch from 'node-fetch';

const DB_PATH = path.join(process.cwd(), 'data.sqlite');

function openDb() {
  const db = new sqlite3.Database(DB_PATH);
  return db;
}

function initIfNeeded() {
  if (!fs.existsSync(DB_PATH)) {
    const db = openDb();
    db.serialize(() => {
      db.run(`CREATE TABLE registrations (
        email TEXT PRIMARY KEY,
        deviceId TEXT,
        registeredAt INTEGER,
        blocked INTEGER DEFAULT 0,
        loginCount INTEGER DEFAULT 0
      )`);
    });
    db.close();
  }
}

initIfNeeded();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'POST only' });

  const { id_token, deviceId } = req.body || {};
  if (!id_token || !deviceId) return res.status(400).json({ ok:false, error:'id_token and deviceId required' });

  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "211687593638-p3h4h5u2hh59svp428k2r9n49803ao4v.apps.googleusercontent.com";
  if (!GOOGLE_CLIENT_ID) return res.status(500).json({ ok:false, error:'server misconfigured (GOOGLE_CLIENT_ID)' });

  try {
    const infoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`);
    const info = await infoRes.json();
    if (info.error_description || info.aud !== GOOGLE_CLIENT_ID) {
      return res.status(401).json({ ok:false, error:'invalid_token' });
    }

    const email = info.email;
    const email_verified = info.email_verified === 'true' || info.email_verified === true;

    if (!email || !email_verified) return res.status(400).json({ ok:false, error:'email_not_verified' });

    const db = openDb();

    db.get('SELECT * FROM registrations WHERE email = ?', [email], (err, row) => {
      if (err) {
        db.close();
        return res.status(500).json({ ok:false, error: err.message });
      }

      if (row && row.blocked) {
        db.close();
        return res.json({ ok:false, allowed:false, reason:'email_blocked' });
      }

      db.get('SELECT * FROM registrations WHERE deviceId = ?', [deviceId], (err2, devRow) => {
        if (err2) {
          db.close();
          return res.status(500).json({ ok:false, error: err2.message });
        }

        if (!row) {
          if (devRow && devRow.email && devRow.email !== email) {
            db.close();
            return res.json({ ok:false, allowed:false, reason:'device_in_use_by_other_email' });
          }

          const now = Math.floor(Date.now()/1000);
          db.run('INSERT INTO registrations (email, deviceId, registeredAt, blocked, loginCount) VALUES (?,?,?,?,?)',
            [email, deviceId, now, 0, 1], function(err3) {
              db.close();
              if (err3) return res.status(500).json({ ok:false, error: err3.message });
              return res.json({ ok:true, allowed:true, newlyRegistered:true, email });
            });
        } else {
          if (row.deviceId === deviceId) {
            const newCount = (row.loginCount || 0) + 1;
            const willBlock = newCount > 1 ? 1 : 0; // block on second login
            const updatedLoginCount = newCount;
            db.run('UPDATE registrations SET loginCount = ?, blocked = ? WHERE email = ?',
              [updatedLoginCount, willBlock, email], function(uErr) {
                db.close();
                if (uErr) return res.status(500).json({ ok:false, error:uErr.message });
                if (willBlock) return res.json({ ok:false, allowed:false, reason:'auto_block_on_second_login' });
                return res.json({ ok:true, allowed:true, newlyRegistered:false, loginCount: updatedLoginCount, email });
              });
          } else {
            db.run('UPDATE registrations SET blocked = 1 WHERE email = ?', [email], function(uErr) {
              db.close();
              if (uErr) return res.status(500).json({ ok:false, error: uErr.message });
              return res.json({ ok:false, allowed:false, reason:'email_used_on_different_device_and_blocked' });
            });
          }
        }
      });
    });

  } catch (e) {
    return res.status(500).json({ ok:false, error: e.message });
  }
}
