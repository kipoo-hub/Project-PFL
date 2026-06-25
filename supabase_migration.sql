-- ============================================================
-- SUPABASE MIGRATION SCRIPT - PetCare CRM Full Integration
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================

-- Enable UUID extension (already enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- TABLE: pasien (Hewan Pasien)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pasien (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  nama TEXT NOT NULL,
  spesies TEXT NOT NULL,
  ras TEXT,
  tanggal_lahir DATE,
  jenis_kelamin TEXT,
  berat NUMERIC(5,2),
  warna TEXT,
  sterilisasi BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'Sehat',
  foto TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE: jadwal_temu (Appointments / Jadwal)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jadwal_temu (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  pasien_id UUID REFERENCES pasien(id) ON DELETE SET NULL,
  pet_name TEXT,
  spesies TEXT,
  pemilik TEXT,
  email TEXT,
  telepon TEXT,
  layanan TEXT NOT NULL,
  dokter TEXT,
  tanggal DATE NOT NULL,
  waktu TIME NOT NULL,
  status TEXT DEFAULT 'Menunggu',
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE: vaksin (Vaccine Reminders)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vaksin (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  pet_name TEXT NOT NULL,
  species TEXT,
  owner_name TEXT,
  email TEXT,
  phone TEXT,
  vaccine_type TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'Belum Diingatkan',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE: followups (Follow-up Kunjungan)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS followups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_name TEXT NOT NULL,
  owner_name TEXT,
  phone TEXT,
  visit_date DATE,
  doctor TEXT,
  service TEXT,
  status TEXT DEFAULT 'Belum',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE: leads (Lead Management)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_name TEXT,
  source TEXT,
  last_active TEXT,
  visit_count INT DEFAULT 1,
  status TEXT DEFAULT 'Baru',
  phone TEXT,
  email TEXT,
  is_new_today BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE: blasts (Riwayat Pesan Massal)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  recipient_count INT DEFAULT 0,
  message TEXT,
  status TEXT DEFAULT 'Selesai',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE: tickets (Tiket Keluhan)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_name TEXT,
  owner_name TEXT,
  email TEXT,
  category TEXT,
  title TEXT NOT NULL,
  urgency TEXT DEFAULT 'Sedang',
  priority TEXT DEFAULT 'Sedang',
  status TEXT DEFAULT 'Baru',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE: ticket_conversations (Percakapan Tiket)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  sender_name TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE: queues (Antrian Digital)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS queues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  queue_number TEXT NOT NULL,
  owner_name TEXT,
  email TEXT,
  pet_name TEXT,
  service TEXT,
  registered_time TEXT,
  status TEXT DEFAULT 'Menunggu',
  type TEXT DEFAULT 'Datang Sekarang',
  appointment_time TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE: sla_chats (SLA Monitor)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sla_chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_name TEXT,
  pet_name TEXT,
  doctor_name TEXT,
  chat_received_time TEXT,
  first_response_time TEXT,
  response_duration INT,
  status_sla TEXT DEFAULT 'Tepat Waktu',
  status_chat TEXT DEFAULT 'Aktif',
  is_escalated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE: medical_records (Rekam Medis)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  pet_name TEXT,
  visit_date DATE,
  doctor TEXT,
  diagnosis TEXT,
  action TEXT,
  treatment TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE: chats (Chat Member-Dokter)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  doctor_name TEXT,
  doctor_title TEXT,
  doctor_online BOOLEAN DEFAULT false,
  unread_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE: chat_messages (Pesan Chat)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE: bills (Tagihan Member)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  invoice_no TEXT,
  service TEXT,
  amount NUMERIC(12,2),
  status TEXT DEFAULT 'Belum Dibayar',
  details JSONB DEFAULT '[]',
  bill_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE: pipeline_members (Member CRM Pipeline)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pipeline_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  stage TEXT DEFAULT 'BARU',
  registered_at DATE DEFAULT CURRENT_DATE,
  visits INT DEFAULT 0,
  pets TEXT[] DEFAULT '{}',
  total_transaksi NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- SEED DATA
-- ─────────────────────────────────────────────

-- Seed: pasien
INSERT INTO pasien (nama, spesies, ras, jenis_kelamin, berat, warna, sterilisasi, status, foto) VALUES
('Max', 'Anjing', 'Golden Retriever', 'Jantan', 28, 'Golden', true, 'Sehat', '🐕'),
('Luna', 'Kucing', 'Persia', 'Betina', 4.2, 'Abu-abu', true, 'Vaksin Jatuh Tempo', '🐈'),
('Koko', 'Burung', 'Lovebird', 'Jantan', 0.08, 'Hijau', false, 'Sehat', '🦜'),
('Cleo', 'Kucing', 'Maine Coon', 'Betina', 6.5, 'Coklat', true, 'Kritis', '🐈'),
('Buddy', 'Anjing', 'Beagle', 'Jantan', 12, 'Tricolor', false, 'Sehat', '🐕'),
('Putih', 'Kelinci', 'Holland Lop', 'Betina', 1.8, 'Putih', false, 'Sehat', '🐇'),
('Rocky', 'Anjing', 'Rottweiler', 'Jantan', 42, 'Hitam', true, 'Sembuh', '🐕'),
('Mochi', 'Kucing', 'British Shorthair', 'Betina', 4.8, 'Abu-abu', false, 'Kritis', '🐈'),
('Tweety', 'Burung', 'Kenari', 'Jantan', 0.02, 'Kuning', false, 'Sehat', '🦜'),
('Bella', 'Anjing', 'Poodle', 'Betina', 5, 'Putih', true, 'Sembuh', '🐕');

-- Seed: vaksin
INSERT INTO vaksin (pet_name, species, owner_name, email, phone, vaccine_type, due_date, status) VALUES
('Buddy', 'Anjing', 'Budi Santoso', 'budi@email.com', '0812-1234-5678', 'Vaksin Rabies', CURRENT_DATE + 3, 'Belum Diingatkan'),
('Luna', 'Kucing', 'Siti Rahayu', 'siti@email.com', '0813-2345-6789', 'Vaksin Tricat (F3)', CURRENT_DATE + 1, 'Belum Diingatkan'),
('Mochi', 'Kelinci', 'Rendi Pratama', 'rendi@email.com', '0815-9999-8888', 'Vaksin RHDV2', CURRENT_DATE + 7, 'Belum Diingatkan'),
('Rex', 'Anjing', 'Budi Santoso', 'budi@email.com', '0812-1234-5678', 'Vaksin DHPPiL', CURRENT_DATE + 12, 'Sudah Diingatkan'),
('Cleo', 'Kucing', 'Dewi Kusuma', 'dewi@email.com', '0815-4567-8901', 'Vaksin Leukemia', CURRENT_DATE - 2, 'Belum Diingatkan');

-- Seed: followups
INSERT INTO followups (pet_name, owner_name, phone, visit_date, doctor, service, status, notes) VALUES
('Rocky', 'Hendra Gunawan', '0818-7890-1234', CURRENT_DATE - 1, 'Dr. Rizal', 'Pemeriksaan', 'Belum', ''),
('Koko', 'Ahmad Wijaya', '0814-3456-7890', CURRENT_DATE - 2, 'Dr. Maya', 'Perawatan', 'Sudah Dihubungi', 'Kondisi Koko membaik pasca grooming bulu, nafsu makan tinggi.'),
('Max', 'Budi Santoso', '0812-1234-5678', CURRENT_DATE - 3, 'Dr. Rizal', 'Vaksinasi', 'Tidak Perlu', 'Selesai vaksin rabies tahunan. Tidak ada keluhan pasca vaksin.');

-- Seed: leads
INSERT INTO leads (visitor_name, source, last_active, visit_count, status, phone, email, is_new_today) VALUES
('Ratih Kumala', '/guest', 'Hari ini, 10:15', 3, 'Baru', '0812-7777-6666', 'ratih@email.com', true),
('Prasetyo Wibowo', '/guest#layanan', 'Hari ini, 08:30', 5, 'Baru', '0813-8888-7777', 'prasetyo@email.com', true),
('Intan Permata', '/guest#tentang-kami', 'Kemarin, 16:45', 2, 'Dihubungi', '0819-3333-2222', 'intan@email.com', false),
('Bambang Tri', '/guest#kontak', 'Kemarin, 11:10', 4, 'Dihubungi', '0821-2222-1111', 'bambang@email.com', false),
('Susi Susanti', '/guest', '3 hari lalu', 6, 'Konversi', '0811-1111-2222', 'susi@email.com', false);

-- Seed: queues
INSERT INTO queues (queue_number, owner_name, email, pet_name, service, registered_time, status, type) VALUES
('A-001', 'Budi Santoso', 'budi@email.com', 'Buddy', 'Konsultasi Dokter', '08:05 WIB', 'Selesai', 'Datang Sekarang'),
('A-002', 'Siti Rahayu', 'siti@email.com', 'Luna', 'Vaksinasi', '08:12 WIB', 'Selesai', 'Datang Sekarang'),
('A-003', 'Rendi Pratama', 'rendi@email.com', 'Mochi', 'Konsultasi Dokter', '08:30 WIB', 'Selesai', 'Datang Sekarang'),
('A-004', 'Dewi Kusuma', 'dewi@email.com', 'Cleo', 'Grooming', '08:45 WIB', 'Dilayani', 'Datang Sekarang'),
('A-005', 'Dani Prasetyo', 'dani.pras@gmail.com', 'Rocky', 'Konsultasi Dokter', '09:15 WIB', 'Dipanggil', 'Datang Sekarang'),
('A-006', 'Hendra Gunawan', 'hendra@email.com', 'Rocky', 'Vaksinasi', '09:40 WIB', 'Menunggu', 'Datang Sekarang'),
('A-007', 'Faisal Rahman', 'faisal@email.com', 'Tweety', 'Konsultasi Dokter', '10:05 WIB', 'Menunggu', 'Jadwalkan'),
('A-008', 'Yuni Astuti', 'yuni@email.com', 'Mochi', 'Grooming', '10:30 WIB', 'Menunggu', 'Datang Sekarang');

-- Seed: sla_chats
INSERT INTO sla_chats (owner_name, pet_name, doctor_name, chat_received_time, first_response_time, response_duration, status_sla, status_chat) VALUES
('Budi Santoso', 'Buddy', 'Dr. Rizal', '10:00 WIB', '10:12 WIB', 12, 'Tepat Waktu', 'Selesai'),
('Siti Rahayu', 'Luna', 'Dr. Maya', '10:30 WIB', '11:15 WIB', 45, 'Terlambat', 'Selesai'),
('Rendi Pratama', 'Mochi', 'Dr. Sarah', '11:00 WIB', '11:25 WIB', 25, 'Tepat Waktu', 'Selesai'),
('Dewi Kusuma', 'Cleo', 'Dr. Rizal', '13:00 WIB', '13:28 WIB', 28, 'Tepat Waktu', 'Selesai'),
('Hendra Gunawan', 'Rocky', 'Dr. Sarah', '14:00 WIB', NULL, 35, 'Terlambat', 'Aktif'),
('Yuni Astuti', 'Mochi', 'Dr. Maya', '14:32 WIB', NULL, 28, 'Hampir Terlambat', 'Aktif'),
('Budi Santoso', 'Max', 'Dr. Maya', '14:35 WIB', NULL, 40, 'Terlambat', 'Aktif');

-- Seed: pipeline_members
INSERT INTO pipeline_members (name, email, phone, stage, visits, pets, total_transaksi) VALUES
('Rina Marlina', 'rina.marlina@gmail.com', '0823-1111-2222', 'BARU', 0, ARRAY['Kiki (Kucing Anggora)'], 0),
('Dani Prasetyo', 'dani.pras@gmail.com', '0826-7777-8888', 'BARU', 0, ARRAY['Rocky (Anjing Husky)'], 0),
('Siti Rahayu', 'siti@email.com', '0813-2345-6789', 'AKTIF', 1, ARRAY['Luna (Kucing Persia)'], 450000),
('Hendra Gunawan', 'hendra@email.com', '0818-7890-1234', 'AKTIF', 2, ARRAY['Rocky (Anjing Rottweiler)'], 850000),
('Budi Santoso', 'budi@email.com', '0812-1234-5678', 'SETIA', 6, ARRAY['Max (Anjing Golden)', 'Rex (Anjing Labrador)'], 4850000),
('Dewi Kusuma', 'dewi@email.com', '0815-4567-8901', 'SETIA', 4, ARRAY['Cleo (Kucing Maine Coon)'], 3200000),
('Faisal Rahman', 'faisal@email.com', '0819-2222-3333', 'TIDAK AKTIF', 3, ARRAY['Tweety (Burung Kenari)'], 750000),
('Yuni Astuti', 'yuni@email.com', '0820-4444-5555', 'TIDAK AKTIF', 1, ARRAY['Mochi (Kelinci Mini)'], 200000);

-- ─────────────────────────────────────────────
-- ENABLE REALTIME for Queue and Tickets
-- ─────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE queues;
ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE ticket_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
