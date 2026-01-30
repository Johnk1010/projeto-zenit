/*
  # Zenit Massoterapia - Initial Database Schema

  ## Overview
  This migration creates the core database structure for the Zenit massage therapy appointment system.

  ## New Tables
  
  ### 1. profiles
  - `id` (uuid, primary key, references auth.users)
  - `full_name` (text)
  - `phone` (text)
  - `role` (text) - 'client' or 'therapist'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. services
  - `id` (uuid, primary key)
  - `name` (text) - e.g., "Massagem Sueca", "Massagem Relaxante"
  - `description` (text)
  - `duration_minutes` (integer) - duration in minutes
  - `price` (numeric) - service price
  - `is_active` (boolean) - whether service is currently offered
  - `created_at` (timestamptz)

  ### 3. appointments
  - `id` (uuid, primary key)
  - `client_id` (uuid, references profiles)
  - `service_id` (uuid, references services)
  - `start_time` (timestamptz) - appointment start date/time
  - `end_time` (timestamptz) - appointment end date/time
  - `status` (text) - 'pending', 'confirmed', 'completed', 'cancelled'
  - `notes` (text) - optional notes from client
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Profiles: Users can read/update their own profile, authenticated users can read all profiles
  - Services: Everyone can read active services, only authenticated users can manage
  - Appointments: Users can create and view their own appointments, therapists can view all

  ## Important Notes
  1. Uses auth.users from Supabase Auth for user management
  2. Profiles extend user information with role and contact details
  3. Time slots will be calculated dynamically based on business hours and existing appointments
  4. All timestamps use timestamptz for proper timezone handling
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'therapist')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  duration_minutes integer NOT NULL DEFAULT 60,
  price numeric(10,2) NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Services policies
CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage services"
  ON services FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Appointments policies
CREATE POLICY "Users can view own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'therapist'
    )
  );

CREATE POLICY "Users can create own appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Users can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'therapist'
    )
  )
  WITH CHECK (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'therapist'
    )
  );

-- Insert some default services
INSERT INTO services (name, description, duration_minutes, price, is_active)
VALUES
  ('Massagem Relaxante', 'Massagem suave para aliviar o estresse e promover relaxamento profundo', 60, 120.00, true),
  ('Massagem Terapêutica', 'Massagem focada em aliviar dores musculares e tensões específicas', 60, 150.00, true),
  ('Massagem Sueca', 'Técnica clássica que combina movimentos suaves e profundos', 90, 180.00, true),
  ('Massagem Desportiva', 'Ideal para atletas, focada em recuperação muscular', 60, 140.00, true),
  ('Reflexologia', 'Massagem nos pés que estimula pontos reflexos do corpo', 45, 100.00, true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
