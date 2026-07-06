-- =====================================================
-- UPCHAAR - Complete Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10),
  blood_group VARCHAR(5),
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  specialty VARCHAR(100),
  department_id INT REFERENCES departments(id),
  qualification VARCHAR(200),
  experience_years INT DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  consultation_fee DECIMAL(10,2) DEFAULT 500,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL DEFAULT 'receptionist',
  department_id INT REFERENCES departments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- APPOINTMENTS & QUEUE
-- =====================================================

CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INT REFERENCES doctors(id) ON DELETE CASCADE,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'Scheduled'
    CHECK (status IN ('Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No-Show')),
  appointment_type VARCHAR(20) DEFAULT 'Online'
    CHECK (appointment_type IN ('Online', 'Walk-in', 'Emergency')),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS queue (
  id SERIAL PRIMARY KEY,
  appointment_id INT REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id INT REFERENCES doctors(id),
  token_number VARCHAR(20) NOT NULL,
  position INT NOT NULL,
  status VARCHAR(20) DEFAULT 'Waiting'
    CHECK (status IN ('Waiting', 'Calling', 'Completed', 'Skipped')),
  called_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS waiting_time (
  id SERIAL PRIMARY KEY,
  doctor_id INT REFERENCES doctors(id) UNIQUE,
  average_mins INT DEFAULT 15,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MEDICAL RECORDS
-- =====================================================

CREATE TABLE IF NOT EXISTS prescriptions (
  id SERIAL PRIMARY KEY,
  appointment_id INT REFERENCES appointments(id) ON DELETE SET NULL,
  doctor_id INT REFERENCES doctors(id),
  patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
  diagnosis TEXT,
  advice TEXT,
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medicines (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  manufacturer VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prescription_items (
  id SERIAL PRIMARY KEY,
  prescription_id INT REFERENCES prescriptions(id) ON DELETE CASCADE,
  medicine_id INT REFERENCES medicines(id),
  medicine_name VARCHAR(255),
  dosage VARCHAR(100),
  instructions TEXT,
  duration VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS patient_records (
  id SERIAL PRIMARY KEY,
  patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
  record_type VARCHAR(50)
    CHECK (record_type IN ('X-Ray', 'MRI', 'CT-Scan', 'Blood-Report', 'Prescription', 'Other')),
  file_url TEXT,
  file_name VARCHAR(255),
  uploaded_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medical_history (
  id SERIAL PRIMARY KEY,
  patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
  condition_name VARCHAR(200),
  diagnosed_date DATE,
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Resolved', 'Chronic')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab_reports (
  id SERIAL PRIMARY KEY,
  patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INT REFERENCES doctors(id),
  test_name VARCHAR(200) NOT NULL,
  report_date DATE,
  results TEXT,
  file_url TEXT,
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS voice_notes (
  id SERIAL PRIMARY KEY,
  doctor_id INT REFERENCES doctors(id),
  appointment_id INT REFERENCES appointments(id),
  file_url TEXT,
  transcript TEXT,
  length_seconds INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ABHA INTEGRATION
-- =====================================================

CREATE TABLE IF NOT EXISTS abha_profiles (
  id SERIAL PRIMARY KEY,
  patient_id INT REFERENCES patients(id) ON DELETE CASCADE UNIQUE,
  abha_number VARCHAR(20) UNIQUE,
  abha_address VARCHAR(100),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- BILLING & PAYMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS billing (
  id SERIAL PRIMARY KEY,
  appointment_id INT REFERENCES appointments(id),
  patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Partial', 'Cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  bill_id INT REFERENCES billing(id) ON DELETE CASCADE,
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'Cash'
    CHECK (payment_method IN ('Cash', 'Card', 'UPI', 'Online', 'Insurance')),
  transaction_ref VARCHAR(100),
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INVENTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  medicine_id INT REFERENCES medicines(id),
  quantity INT DEFAULT 0,
  unit VARCHAR(20) DEFAULT 'tablet',
  expiry_date DATE,
  reorder_level INT DEFAULT 10,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATIONS & FOLLOW-UPS
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  type VARCHAR(50) DEFAULT 'General'
    CHECK (type IN ('Appointment', 'Medicine', 'Follow-up', 'Queue', 'Report', 'General')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS followups (
  id SERIAL PRIMARY KEY,
  appointment_id INT REFERENCES appointments(id),
  followup_date DATE NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Missed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MULTILANGUAGE
-- =====================================================

CREATE TABLE IF NOT EXISTS languages (
  id SERIAL PRIMARY KEY,
  code VARCHAR(5) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- =====================================================
-- AUDIT LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id INT,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SEED DATA
-- =====================================================

INSERT INTO departments (name, description) VALUES
  ('General Medicine', 'General health consultations'),
  ('Pediatrics', 'Child healthcare'),
  ('Cardiology', 'Heart and cardiovascular diseases'),
  ('Orthopedics', 'Bones, joints, and muscles'),
  ('Dermatology', 'Skin conditions'),
  ('Gynecology', 'Women''s health')
ON CONFLICT DO NOTHING;

INSERT INTO languages (code, name) VALUES
  ('en', 'English'), ('hi', 'हिंदी'), ('mr', 'मराठी'), ('gu', 'ગુજરાતી'),
  ('ta', 'தமிழ்'), ('te', 'తెలుగు'), ('kn', 'ಕನ್ನಡ'), ('ml', 'മലയാളം'), ('bn', 'বাংলা')
ON CONFLICT DO NOTHING;

INSERT INTO doctors (name, email, specialty, qualification, experience_years, consultation_fee) VALUES
  ('Dr. Aarav Sharma', 'aarav@upchaar.in', 'General Physician', 'MBBS, MD', 12, 500),
  ('Dr. Ananya Patel', 'ananya@upchaar.in', 'Pediatrics', 'MBBS, DCH', 8, 600),
  ('Dr. Vikram Mehta', 'vikram@upchaar.in', 'Cardiology', 'MBBS, DM Cardiology', 15, 1200),
  ('Dr. Priya Nair', 'priya@upchaar.in', 'Dermatology', 'MBBS, MD Derm', 6, 700),
  ('Dr. Rajan Iyer', 'rajan@upchaar.in', 'Orthopedics', 'MBBS, MS Ortho', 10, 800)
ON CONFLICT DO NOTHING;

INSERT INTO medicines (name, type) VALUES
  ('Paracetamol 500mg', 'tablet'),
  ('Amoxicillin 500mg', 'capsule'),
  ('Ibuprofen 400mg', 'tablet'),
  ('Cetirizine 10mg', 'tablet'),
  ('Omeprazole 20mg', 'capsule'),
  ('Metformin 500mg', 'tablet'),
  ('Atorvastatin 10mg', 'tablet'),
  ('Azithromycin 500mg', 'tablet')
ON CONFLICT DO NOTHING;

-- =====================================================
-- ENABLE REALTIME
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE patients;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE queue;
ALTER PUBLICATION supabase_realtime ADD TABLE prescriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE billing;
ALTER PUBLICATION supabase_realtime ADD TABLE lab_reports;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read patients (backend handles fine-grained access via service key)
CREATE POLICY "Authenticated users can read patients" ON patients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert patients" ON patients
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update patients" ON patients
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read appointments" ON appointments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert appointments" ON appointments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update appointments" ON appointments
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read prescriptions" ON prescriptions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert prescriptions" ON prescriptions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "Service can insert notifications" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Allow all for doctors, queue, etc for simplicity (production should be more strict)
CREATE POLICY "Authenticated can access doctors" ON doctors FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can access queue" ON queue FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can access billing" ON billing FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can access lab_reports" ON lab_reports FOR ALL USING (auth.role() = 'authenticated');
