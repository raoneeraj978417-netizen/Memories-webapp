# REWIND status for this package

## Included in this source package
- Removed visible demo passcode hint and hardcoded passcode authentication.
- Supabase email/password sign-in.
- Profile-role verification: Viewer/Admin choice must match the authenticated account's database role.
- Cloud archive JSON read/write to Supabase table `archive_state`.
- RLS baseline in `supabase/schema.sql`: authenticated reads, admin-only inserts/updates, self-only profile read, no client profile role updates.
- Legacy browser data migration: only when cloud archive row is absent and an Admin signs in.
- Realtime subscription for cloud archive updates.
- Account menu password change via Supabase Auth.
- Password and email fields cleared on back, sign-in, and logout.
- HTTPS-only media URL filtering.
- Vercel security headers in `vercel.json`.

## Required before launch
- Run SQL in Supabase dashboard.
- Create both accounts in Supabase Auth.
- Promote intended Admin profile via SQL and verify.
- Confirm signup is disabled/invite-only.
- Confirm Realtime is enabled.
- Deploy and test login, viewer restrictions, admin changes, password change, and cross-device refresh/sync.

## Important limitations
- Not browser-tested or deployed by this package creation. RLS and Supabase API calls must be tested against your actual project.
- Viewer users can read the shared archive; only Admin can write it.
- The archive row stores all memories as JSON. This is fine for a small archive prototype but should migrate to normalized tables as the archive grows.
- Google Drive "anyone with the link" assets are not private.
- Password change uses native browser prompts rather than a polished settings modal.
