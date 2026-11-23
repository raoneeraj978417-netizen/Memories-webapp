# REWIND deployment and security checklist

## Implemented in this project package
- Supabase JS v2 browser client with the provided project URL and publishable key.
- Password/email sign-in via Supabase Auth (no hard-coded demo passcodes).
- Profile role lookup after authentication; requested Viewer/Admin UI role must match the database role.
- Cloud reads and writes for archive years, memories, and home settings.
- Session persistence/refresh through Supabase Auth.
- Login password/email fields cleared when returning to profiles, switching roles, signing in, or logging out.
- HTTPS-only checks for user-supplied media and background image links.
- RLS SQL baseline and profile creation trigger; archive writes restricted to admin role.
- Cloudflare Pages `_headers` security headers included.

## Not done / external steps required
- `supabase/schema.sql` has not been run in the user's Supabase project by this code package.
- Auth accounts must be created in Supabase Auth dashboard (email + password); this UI is sign-in only.
- Admin role must be assigned to the intended account using the documented SQL operation, only after that user exists.
- Cloudflare Pages deployment and live header testing are not performed.
- Media currently uses HTTPS links (including Google Drive links); no private Storage bucket integration yet.
- No automated tests or penetration test have been run. This is a hardened prototype, not a certified security product.

## Setup procedure
1. Supabase Dashboard -> SQL Editor -> run `supabase/schema.sql`.
2. Authentication -> Users -> create the intended viewer and administrator accounts.
3. For each created user, profiles are inserted automatically with role `viewer` by the trigger.
4. Assign admin to the chosen admin account only, using the query below after replacing the admin email:
   `update public.profiles set role='admin' where id=(select id from auth.users where email='ADMIN_EMAIL_HERE');`
5. Confirm the role in `public.profiles`; keep public sign-up disabled if accounts are invite-only.
6. Deploy the project directory to Cloudflare Pages. Verify the deployed `_headers` response and test login, viewer read-only, admin CRUD, logout, session expiration, and unauthenticated direct API requests.


## Critical safeguards
- The publishable key is expected in browser code. Never expose a `service_role` key, database password, or secret API key.
- RLS policies are the enforcement boundary. UI hiding is not security.
- Do not use `profiles` self-update policy or client-side role assignment.
- If the archive is sensitive, migrate media to a private Supabase Storage bucket with signed URLs; Google Drive links shared as “anyone with the link” are not private.
