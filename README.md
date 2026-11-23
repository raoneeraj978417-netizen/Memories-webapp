# REWIND

A private memory archive frontend with Supabase Auth and cloud archive sync.

## Required setup before deploy

1. In Supabase Dashboard -> SQL Editor, run `supabase/schema.sql`.
2. In Supabase Authentication -> Users, create two users (Viewer and Admin) with email/password.
3. Profiles are created automatically as `viewer` by the trigger.
4. Promote ONLY the intended admin user from SQL Editor:
   ```sql
   update public.profiles
   set role='admin'
   where id=(select id from auth.users where email='ADMIN_EMAIL_HERE');
   ```
5. Verify the admin profile's role. Keep public signup disabled.
6. In Vercel, deploy the project as a static site from the project root. `vercel.json` provides headers.
7. Test Viewer and Admin accounts, direct RLS permissions, upload, edit, delete, logout, password update, and second-device sync before storing private memories.

## Cloud behavior

- Supabase Auth validates email/password; there are no hardcoded demo passwords or public sign-up UI.
- The selected Viewer/Admin profile is verified against the user's role stored in `profiles`.
- `archive_state` stores a shared JSON archive (`id='main'`).
- RLS lets authenticated users read the archive and only profile admins insert/update it.
- Admin saves update the cloud row. Realtime subscriptions update viewers' UI when changes are broadcast (requires Supabase Realtime enabled for archive_state).
- Legacy local data is migrated to the cloud when the archive row does not exist and an Admin signs in. Existing browser data is not automatically merged with an existing cloud archive.

## Change password

After sign-in, open the account menu and choose Change password. Supabase Auth updates the signed-in account password. The app never displays or stores account passwords.

## Security notes

- The Supabase publishable key in `app.js` is browser-safe; database RLS is the actual permission boundary.
- Do not add service-role keys, secret keys, or database passwords to frontend code.
- Drive links must be HTTPS but Drive links set to "anyone with link" remain public to anyone who possesses them.
- This package has not undergone independent penetration testing. Apply SQL and run the tests before treating it as production secure.
