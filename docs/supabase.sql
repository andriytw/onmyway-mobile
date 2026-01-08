-- Supabase Database Schema for Phase 2.1
-- Minimal setup: email/password auth + profiles.role + driver_status

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- Stores user profile data (minimal for Phase 2.1: only email + role)

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('DRIVER', 'PASSENGER_SENDER')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile (via trigger)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================================================
-- Trigger function to automatically create profile when user signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, NULL);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile when user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- DRIVER_STATUS TABLE
-- ============================================================================
-- Tracks online/offline status for drivers

CREATE TABLE IF NOT EXISTS driver_status (
  driver_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  -- Note: Driver validation is enforced via RLS policies and application logic
  -- PostgreSQL does not allow subqueries in CHECK constraints
);

-- Enable Row Level Security
ALTER TABLE driver_status ENABLE ROW LEVEL SECURITY;

-- Policy: Drivers can read their own status
CREATE POLICY "Drivers can read own status"
  ON driver_status FOR SELECT
  USING (
    auth.uid() = driver_id 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = driver_id 
      AND profiles.role = 'DRIVER'
    )
  );

-- Policy: Drivers can update their own status
CREATE POLICY "Drivers can update own status"
  ON driver_status FOR UPDATE
  USING (
    auth.uid() = driver_id 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = driver_id 
      AND profiles.role = 'DRIVER'
    )
  );

-- Policy: Drivers can insert their own status
CREATE POLICY "Drivers can insert own status"
  ON driver_status FOR INSERT
  WITH CHECK (
    auth.uid() = driver_id 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = driver_id 
      AND profiles.role = 'DRIVER'
    )
  );

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Performance indexes for common queries

-- Index for role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role) WHERE role IS NOT NULL;

-- Index for driver status lookups (online drivers)
CREATE INDEX IF NOT EXISTS idx_driver_status_online ON driver_status(is_online) WHERE is_online = true;

-- ============================================================================
-- HELPER FUNCTIONS (Optional, for future use)
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update updated_at on driver_status
CREATE TRIGGER update_driver_status_updated_at
  BEFORE UPDATE ON driver_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

