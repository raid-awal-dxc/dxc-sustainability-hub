# Sustainability Hub (GitHub Pages)

Client-only sustainability training platform with Supabase Auth + DB

Features:

- Supabase Auth (register/login)
- Modules, lessons, curated reading
- Quizzes & scoring (pass threshold)
- Progress tracking (enrollments)
- Certificates (PNG/PDF)
- **Light/Dark theme toggle** with SVG icons, smooth transitions, and **auto logo swap**

## Setup

1. Create Supabase project.
2. Run `supabase/schema.sql` (then `supabase/seed.sql`).

## Local Development

1. Open the folder in VS Code.
2. Start a local static server from the repo root, for example `python -m http.server 8000`.
3. Visit `http://localhost:8000` and edit the HTML/CSS/JS files directly. Refresh the browser to see changes immediately.
4. Keep the Supabase config in `assets/js/config.js`. The runtime defaults now keep local testing local and use the deployed site origin when published.
5. Push to GitHub when you want the live site to update.

## Local Auth Redirects (Important)

If clicking Login sends you to the live site, add your localhost callback URL in Supabase:

1. In Supabase Dashboard, go to Authentication -> URL Configuration.
2. Keep your production Site URL as your live domain.
3. Add these to Redirect URLs:
   - `http://localhost:8000/login.html`
   - `http://127.0.0.1:8000/login.html`
4. Save, then retry local sign-in.

Without these allowlisted redirect URLs, OAuth can fall back to the production site.

## Local Certificate Preview

When developing certificate styling/layout, you can bypass auth on localhost only:

- `http://localhost:8000/certificate.html?preview=1&name=Jane%20Doe&module_title=Climate%20Foundations&score=92&code=LOCAL-001`

This preview mode is only enabled on localhost and does not affect production.

Security: Keep RLS enabled; only use the anon key client-side.
