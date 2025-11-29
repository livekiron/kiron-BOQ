// popup.js
const SERVER_BASE = 'https://kiron-boq.vercel.app'; // <-- REPLACE with your deployed Vercel domain

const loginBtn = document.getElementById('loginBtn');
const statusDiv = document.getElementById('status');
const logoutBtn = document.getElementById('logoutBtn');

function getDeviceId() {
  let id = localStorage.getItem('deviceId');
  if (!id) {
    id = cryptoRandomUUID();
    localStorage.setItem('deviceId', id);
  }
  return id;
}
function cryptoRandomUUID() {
  if (crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c=='x'? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

loginBtn.addEventListener('click', () => {
  const w = window.open(SERVER_BASE + '/api/auth_start', 'oauth', 'width=500,height=600');
  window.addEventListener('message', async function onMsg(e) {
    try {
      const data = e.data || {};
      if (data.type === 'oauth_id_token') {
        const id_token = data.id_token;
        const deviceId = getDeviceId();
        statusDiv.textContent = 'Verifying...';
        const resp = await fetch(SERVER_BASE + '/api/verify', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ id_token, deviceId })
        });
        const j = await resp.json();
        if (j.ok && j.allowed) {
          localStorage.setItem('verified', '1');
          localStorage.setItem('verifiedEmail', j.email || '');
          statusDiv.textContent = 'Verified ✓';
        } else {
          localStorage.removeItem('verified');
          statusDiv.textContent = 'Denied: ' + (j.reason || j.error || 'not allowed');
          alert('Verify failed: ' + (j.reason || j.error || 'not allowed'));
        }
        window.removeEventListener('message', onMsg);
      }
    } catch (err) {
      console.error(err);
    }
  });
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('verified');
  localStorage.removeItem('verifiedEmail');
  statusDiv.textContent = 'Logged out (local)';
});

document.addEventListener('DOMContentLoaded', () => {
  const ok = localStorage.getItem('verified');
  statusDiv.textContent = ok ? 'Verified ✓' : 'Not verified';
});
