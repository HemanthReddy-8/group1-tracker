# Group 1 Exam Study Tracker

A real-time daily study tracker for Group 1 exam prep. Two roles: **Admin** (monitors her friend's progress live) and **User** (tracks her own study slots).

## Tech Stack

- React + Vite + Tailwind CSS
- Supabase (Auth + Realtime Database)
- Vercel (deployment)

---

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Note your **Project URL** and **anon public key** from Project Settings → API.

---

### 2. Run SQL to create the table + RLS policies

Open **SQL Editor** in Supabase and run:

```sql
-- Create table
CREATE TABLE IF NOT EXISTS public.daily_progress (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date        DATE        NOT NULL,
  slots       JSONB       NOT NULL DEFAULT '{}',
  note        TEXT        NOT NULL DEFAULT '',
  total_done  INTEGER     NOT NULL DEFAULT 0,
  total_hrs   FLOAT       NOT NULL DEFAULT 0,
  completion  INTEGER     NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT daily_progress_user_date_key UNIQUE (user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;

-- Users can insert their own rows
CREATE POLICY "users_insert_own"
  ON public.daily_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users AND admin can read rows
-- Replace 'your-admin@email.com' with your actual admin email
CREATE POLICY "users_select"
  ON public.daily_progress FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR (SELECT email FROM auth.users WHERE id = auth.uid()) = 'your-admin@email.com'
  );

-- Users can update their own rows
CREATE POLICY "users_update_own"
  ON public.daily_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own rows (used by Reset Day)
CREATE POLICY "users_delete_own"
  ON public.daily_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

> **Important:** Replace `your-admin@email.com` in the SELECT policy with the real admin email.

---

### 3. Enable Realtime on the table

In Supabase dashboard → **Database → Replication**, find `daily_progress` and toggle **Realtime ON**.

Alternatively, run:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_progress;
```

---

### 4. Create the two user accounts

In Supabase → **Authentication → Users**, click **Add User** and create:
- Admin account (the email you set as `VITE_ADMIN_EMAIL`)
- Friend's account (any other email)

---

### 5. Set environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ADMIN_EMAIL=your-admin@email.com
```

---

### 6. Install dependencies and run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

- Logging in with `VITE_ADMIN_EMAIL` → redirects to `/monitor`
- Any other account → redirects to `/tracker`

---

### 7. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

In **Vercel Project Settings → Environment Variables**, add the same three vars:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_EMAIL`

The `vercel.json` already handles SPA routing rewrites.

---

## Features

### User View (`/tracker`)
- View today's 9 study slots with time, subject tag
- Mark each slot as **Done** or **Skip** (or Reset)
- Auto-saves to Supabase 1.5 s after any change
- **Edit Schedule** button to customise, add, or delete slots (stored in browser)
- Notes textarea synced to Supabase
- Sync status indicator (green / amber / red dot)
- **Reset Day** to clear all progress

### Admin View (`/monitor`)
- Real-time dashboard — updates instantly when friend marks a slot
- Live / Connecting badge
- 4-stat grid: Slots completed · Study time · Skipped · Day %
- Slot-by-slot list with colour-coded status pills
- Her notes (if any)
- Manual Refresh button

---

## File Structure

```
src/
  components/
    SlotCard.jsx        – individual slot with Done/Skip/Reset
    StatusPill.jsx      – coloured tag badge
    ProgressBar.jsx     – day progress bar
    StatsGrid.jsx       – stats cards row
    Toast.jsx           – slide-in notifications
    ScheduleEditor.jsx  – modal to edit/add/delete slots
  pages/
    Login.jsx           – email + password login
    Tracker.jsx         – user tracking view
    Monitor.jsx         – admin realtime monitor
  lib/
    supabase.js         – Supabase client
    defaultSlots.js     – default schedule + localStorage helpers
  App.jsx               – routing + auth state
  main.jsx              – React entry point
  index.css             – Tailwind + fonts + animations
index.html
vite.config.js
tailwind.config.js
postcss.config.js
vercel.json
.env.example
```
