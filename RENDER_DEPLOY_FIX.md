# Render deployment settings for RO AI

This project is a Vite + Express application. Deploy it as a **Render Web Service**, not a Static Site.

## Render settings
- Root Directory: leave blank if `package.json` is at repository root.
- Build Command: `bun install && bun run build`
- Start Command: `bun run start`

The build script creates the frontend in `dist/` and the Express server bundle at `dist/server.cjs`. The server listens on `process.env.PORT` as required by Render.

## Environment variables
Configure these in Render Dashboard → your service → Environment:
- `GEMINI_API_KEY` (required for Gemini features)
- `SMTP_USER` (required for email/OTP)
- `SMTP_PASS` (required for email/OTP; use a newly generated app password)
- `SMTP_HOST` (optional; defaults to smtp.gmail.com)
- `SMTP_PORT` (optional; defaults to 465)
- `SMTP_SECURE` (optional; defaults based on port)
- `SMTP_FROM` (optional)
- `APP_URL` (optional, set to the deployed URL if used by the app)

Never commit `.env` or real secrets. The provided `.env.example` contains placeholders only.

## Redeploy
Commit and push the modified files to GitHub, then redeploy the latest commit on Render. Confirm the build logs show `bun run build` and that the `dist/server.cjs` bundle is generated before startup.

## Important security action
The uploaded archive contained credentials in `.env.example`. Treat any real credentials previously committed or shared as exposed: revoke/rotate the Gemini API key and SMTP app password, then set the new values only in Render Environment settings.
