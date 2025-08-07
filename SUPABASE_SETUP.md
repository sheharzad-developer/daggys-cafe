# Supabase Setup Guide for Phase 2

## Step 1: Get Your Supabase Project Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project or select your existing project
3. Go to **Settings** > **API**
4. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Project Reference ID** (the part before `.supabase.co`)
   - **anon/public key** (starts with `eyJ`)

## Step 2: Update Environment Variables

Update your `.env.local` file with the actual values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 3: Link Local Project to Remote Supabase

Run this command and follow the prompts:

```bash
supabase link --project-ref your-project-ref
```

Replace `your-project-ref` with your actual project reference ID.

## Step 4: Run the Migration

After linking, push the migration to create the profiles table:

```bash
supabase db push
```

## Step 5: Verify the Setup

1. Go to your Supabase dashboard
2. Navigate to **Table Editor**
3. You should see the new `profiles` table
4. Check that Row Level Security is enabled

## What the Migration Creates

- **profiles table** with user data fields
- **Row Level Security (RLS)** policies for data protection
- **Automatic profile creation** when users sign up
- **Updated_at trigger** for timestamp management

## Next Steps

After completing this setup, you can:
1. Install authentication packages
2. Create login/signup components
3. Build user profile management features

## Troubleshooting

- If linking fails, make sure you have the correct project reference ID
- If migration fails, check your database permissions
- Ensure you're using the correct Supabase project