/*
  # Create Core Tables for Sydney Planner

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `name` (text)
      - `is_god_mode` (boolean, default false) - admin flag
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `venues`
      - `id` (uuid, primary key)
      - `fsq_id` (text, nullable) - Foursquare place ID
      - `name` (text)
      - `category` (text)
      - `address` (text)
      - `lat` (double precision)
      - `lng` (double precision)
      - `rating` (text)
      - `distance` (text)
      - `image` (text)
      - `description` (text)
      - `phone` (text, nullable)
      - `website` (text, nullable)
      - `hours` (jsonb, nullable)
      - `photos` (jsonb, default '[]')
      - `tips` (jsonb, default '[]')
      - `categories` (jsonb, default '[]')
      - `is_foursquare` (boolean, default false)
      - `added_by` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `checkins`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `venue_id` (text)
      - `venue_name` (text)
      - `venue_category` (text)
      - `venue_address` (text)
      - `venue_lat` (double precision)
      - `venue_lng` (double precision)
      - `venue_image` (text)
      - `rating` (integer)
      - `comment` (text, default '')
      - `photos` (jsonb, default '[]')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `saves`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `venue_id` (text)
      - `venue_name` (text)
      - `venue_category` (text)
      - `venue_image` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Authenticated users can read/write their own data
    - God mode users (fabianwinterbine@gmail.com) can access all data
    - Venues readable by all authenticated users, writable by creator or god mode
*/

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '',
  is_god_mode boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Venues table (saved from Foursquare or manually created)
CREATE TABLE IF NOT EXISTS venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fsq_id text,
  name text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  lat double precision NOT NULL DEFAULT 0,
  lng double precision NOT NULL DEFAULT 0,
  rating text NOT NULL DEFAULT '0',
  distance text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  phone text,
  website text,
  hours jsonb,
  photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  tips jsonb NOT NULL DEFAULT '[]'::jsonb,
  categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_foursquare boolean NOT NULL DEFAULT false,
  added_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all venues"
  ON venues FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert venues"
  ON venues FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = added_by);

CREATE POLICY "Venue creator or god mode can update"
  ON venues FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = added_by
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_god_mode = true
    )
  )
  WITH CHECK (
    auth.uid() = added_by
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_god_mode = true
    )
  );

CREATE POLICY "Venue creator or god mode can delete"
  ON venues FOR DELETE
  TO authenticated
  USING (
    auth.uid() = added_by
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_god_mode = true
    )
  );

-- Checkins table
CREATE TABLE IF NOT EXISTS checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venue_id text NOT NULL DEFAULT '',
  venue_name text NOT NULL DEFAULT '',
  venue_category text NOT NULL DEFAULT '',
  venue_address text NOT NULL DEFAULT '',
  venue_lat double precision NOT NULL DEFAULT 0,
  venue_lng double precision NOT NULL DEFAULT 0,
  venue_image text NOT NULL DEFAULT '',
  rating integer NOT NULL DEFAULT 0,
  comment text NOT NULL DEFAULT '',
  photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own checkins"
  ON checkins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins"
  ON checkins FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins"
  ON checkins FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own checkins"
  ON checkins FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- God mode users can access all checkins
CREATE POLICY "God mode can read all checkins"
  ON checkins FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_god_mode = true
    )
  );

-- Saves table
CREATE TABLE IF NOT EXISTS saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venue_id text NOT NULL DEFAULT '',
  venue_name text NOT NULL DEFAULT '',
  venue_category text NOT NULL DEFAULT '',
  venue_image text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own saves"
  ON saves FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saves"
  ON saves FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saves"
  ON saves FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_venues_fsq_id ON venues(fsq_id);
CREATE INDEX IF NOT EXISTS idx_venues_added_by ON venues(added_by);
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_venue_id ON checkins(venue_id);
CREATE INDEX IF NOT EXISTS idx_saves_user_id ON saves(user_id);
CREATE INDEX IF NOT EXISTS idx_saves_venue_id ON saves(venue_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Create a function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, is_god_mode)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email = 'fabianwinterbine@gmail.com'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;
