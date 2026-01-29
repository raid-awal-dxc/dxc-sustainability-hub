
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
3. Copy `assets/js/config.example.js` → `assets/js/config.js`; set `SUPABASE_URL` + `SUPABASE_ANON_KEY`.
4. Push to GitHub and enable Pages.

Security: Keep RLS enabled; only use the anon key client-side.
