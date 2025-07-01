/*
  # Create AWBstocks table for Air Waybill management

  1. New Tables
    - `AWBstocks`
      - `id` (uuid, primary key)
      - `awb_number` (varchar(11), unique) - Complete 11-digit AWB number
      - `prefix` (varchar(3)) - 3-digit airline prefix
      - `serial_number` (varchar(7)) - 7-digit serial number
      - `check_digit` (integer) - Check digit for validation
      - `airline_code` (varchar(10)) - IATA airline code
      - `airline_name` (varchar(100)) - Full airline name
      - `description` (text) - Optional description
      - `status` (varchar(20)) - Status (active, used, reserved, etc.)
      - `warnings` (text) - Any validation warnings
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `AWBstocks` table
    - Add policies for authenticated users to perform CRUD operations

  3. Indexes
    - Index on awb_number for fast lookups
    - Index on prefix for airline-based queries
    - Index on status for filtering
*/

CREATE TABLE IF NOT EXISTS AWBstocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  awb_number varchar(11) UNIQUE NOT NULL,
  prefix varchar(3) NOT NULL,
  serial_number varchar(7) NOT NULL,
  check_digit integer NOT NULL,
  airline_code varchar(10),
  airline_name varchar(100),
  description text,
  status varchar(20) NOT NULL DEFAULT 'active',
  warnings text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE AWBstocks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Users can read AWBstocks"
  ON AWBstocks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert AWBstocks"
  ON AWBstocks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update AWBstocks"
  ON AWBstocks
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete AWBstocks"
  ON AWBstocks
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_awbstocks_awb_number ON AWBstocks(awb_number);
CREATE INDEX IF NOT EXISTS idx_awbstocks_prefix ON AWBstocks(prefix);
CREATE INDEX IF NOT EXISTS idx_awbstocks_status ON AWBstocks(status);
CREATE INDEX IF NOT EXISTS idx_awbstocks_airline_code ON AWBstocks(airline_code);

-- Create function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column_awbstocks()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_awbstocks_updated_at
  BEFORE UPDATE ON AWBstocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column_awbstocks();