/*
# Relax profiles FK for seed data

The profiles.id FK to auth.users(id) prevents inserting demo profiles that
aren't linked to real auth accounts. Drop the FK so seed data works. Real
users created via signup will still insert their own profile row with their
auth.users id — it just won't cascade-delete if the auth user is deleted.
*/

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
