# kiron-BOQ - OAuth verify + BOQ autofill

## Summary
This package contains:
- Vercel serverless API for Google OAuth verify + registration/block logic
- Chrome extension that uses Google OAuth to verify user before running content.js

## Quick steps

1. Deploy backend to Vercel:
   - Create a new Vercel project and connect this repository.
   - Add Environment Variables in Vercel Project Settings:
     - `GOOGLE_CLIENT_ID` (optional; if not set, a default client_id is included in the code)
     - `ADMIN_KEY` (a strong secret for admin endpoints)
     - `PUBLIC_ORIGIN` (optional; your deployed domain, e.g. https://kiron-boq.vercel.app)

   - Push to GitHub and let Vercel auto-deploy.

2. Update extension:
   - Open `extension/popup.js` and replace `SERVER_BASE` value with your deployed Vercel domain, e.g.:
     ```
     const SERVER_BASE = 'https://kiron-boq.vercel.app';
     ```

   - Load the extension (Chrome/Edge):
     - Go to chrome://extensions
     - Enable Developer mode
     - Load unpacked → select the `extension/` folder from this package.

3. Notes about persistence
   - The included backend uses a local SQLite database (`data.sqlite`) for quick testing.
   - On Vercel serverless environment this file may not persist across invocations. For production use **Supabase** or managed Postgres and update `api/verify.js` accordingly.

## Files included
- /api : serverless function files
- /extension : Chrome extension files (manifest, popup, gate, content)
- vercel.json, README.md

## Security notes
- Do NOT commit any sensitive secrets (client_secret, service role keys) into the repo.
- Use Vercel environment variables for secrets.

