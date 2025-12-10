# Highlights Persistence Setup Guide

## ✅ Step 1: Database Schema

The SQL migration file `supabase_migration_highlights.sql` has been created. 

**Action Required:** Run this SQL in your Supabase SQL Editor to create the `highlights` table.

The table includes:
- `id` (UUID, primary key)
- `user_id` (UUID, references auth.users)
- `title` (TEXT)
- `cover_image` (TEXT)
- `stories` (JSONB) - stores array of story objects
- `created_at` and `updated_at` timestamps

## ✅ Step 2: Code Refactoring

The code has been refactored to:
- ✅ Fetch highlights from Supabase on component mount
- ✅ Persist new highlights to Supabase when created
- ✅ Update highlights in Supabase when stories are added
- ✅ Clear highlights when user logs out

## ⚠️ Step 3: Row Level Security (RLS) Policies

**IMPORTANT:** The SQL migration includes RLS policies, but you should verify they are working correctly:

### Current Policies:
1. **SELECT Policy:** Users can view all highlights (public)
2. **INSERT Policy:** Users can only insert their own highlights
3. **UPDATE Policy:** Users can only update their own highlights
4. **DELETE Policy:** Users can only delete their own highlights

### Testing RLS:
1. Sign in as User A
2. Create a highlight
3. Sign in as User B
4. Try to update User A's highlight - should fail
5. Try to view User A's highlight - should succeed (public viewing)

### If RLS is not working:
- Check that RLS is enabled: `ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;`
- Verify policies are created: Check Supabase Dashboard → Authentication → Policies
- Test with different user accounts

## 📝 Notes

- The `stories` field is stored as JSONB, allowing flexible story data
- The `cover_image` is automatically set to the first story's image if not provided
- Highlights are fetched automatically when a user logs in
- All highlight operations are now persisted to Supabase

## 🔧 Troubleshooting

If highlights are not persisting:
1. Check browser console for errors
2. Verify Supabase connection in `.env` file
3. Check Supabase logs for database errors
4. Ensure the `highlights` table exists and has correct schema
5. Verify RLS policies are not blocking operations


