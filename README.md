# REWIND

A memory archive frontend. Supabase Auth and Postgres provide account login and shared cloud data.


## Deploy setup
1. Open your Supabase project dashboard.
2. Run the SQL file `supabase/schema.sql` in the SQL Editor.
3. In Authentication -> Users, create two user accounts (viewer and admin) using emails and passwords. The app itself does not have public signup.
4. Profiles are created automatically as viewer. After creating the intended admin account, run this in the SQL Editor with the correct email:
   `update public.profiles set role='admin' where id=(select id from auth.users where email='ADMIN_EMAIL_HERE');`
5. Confirm role in `public.profiles` and keep signup closed if the archive is invite-only.
6. Deploy the `rewind_src` folder to Cloudflare Pages. `_headers` contains security headers. Verify the deployed headers and all access-control behavior before storing private media.


## Important
- `supabase/config.js` contains the frontend project URL and publishable key. This key is browser-safe; never add service-role or secret keys to the app.
- Database policies protect writes, not just the interface. Do not grant viewer profiles admin roles from the client.
- Media currently accepts HTTPS links, including Google Drive. Drive files set to “anyone with the link” are not private; use a private Storage bucket and signed access for sensitive media.
- This is not fully production-verified: the SQL must be applied in the dashboard, users/roles configured, and deployment and security tests performed.
