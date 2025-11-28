# Full Security System - EGP Autofill

## What this package contains
- `server/` - Node.js server (Express) with Google OAuth, verify endpoint, admin endpoints.
- `extension/` - Chrome extension that requires login & server verification before injecting `content.js`.
- `server/.env.example` - environment variables example (set these in Vercel).

## Quick deploy steps
1. Create a GitHub repo and push this folder.
2. Deploy `server/` to Vercel (Import GitHub repo -> select root or `server` folder).
3. Set Vercel Environment Variables:
   - GOOGLE_CLIENT_ID=73897084142-17tst7c549refg38j6uiunps58mbjodv.apps.googleusercontent.com
   - GOOGLE_CLIENT_SECRET=your-google-client-secret
   - REDIRECT_URI=https://<your-vercel-domain>/auth/callback
   - JWT_SECRET=some-long-secret
   - OWNER_EMAIL=youremail@gmail.com
   - BASE_URL=https://<your-vercel-domain>
4. Deploy and note your Vercel domain (replace `<your-vercel-domain>`).
5. In `extension/popup.js` set `BASE_URL` to your Vercel domain.
6. Load extension in Chrome (Developer mode -> Load unpacked -> select `extension/` folder).
7. Owner: open the extension popup, click Login -> then open `https://<your-vercel-domain>/admin.html` to approve pending users.

## Notes
- The `content.js` is exactly your original script (unchanged) and will only be injected after a successful verification.
- lowdb (JSON file) is used for simplicity. For production use a real database.
