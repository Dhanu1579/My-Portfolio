# Dhanush Portfolio

This is a lightweight Express portfolio site (Node.js) built with security-first defaults.

Quick start

1. Install dependencies

   npm install

2. Run locally

   npm start

Open: http://localhost:3000

Deployment

- Heroku: create an app and `git push heroku main` (Procfile is included).
- Vercel: link the project and use `vercel --prod` (set build command to `npm start`, or use the `node server.js` serverless option).

Notes

- The resume file used by the site is `public/resume.pdf` (kept in the repo).
- Security headers are applied via Helmet in `server.js`.
- The site respects `prefers-reduced-motion` and avoids heavy client-side dependencies for a handcrafted feel.

If you want me to deploy this to a free hosting provider and configure a domain, tell me which provider you prefer and I’ll prepare the steps.
