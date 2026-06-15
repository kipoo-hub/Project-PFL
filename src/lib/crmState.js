// ─── CRM State Management Utility ─────────────────────────────────────────────

const KEYS = {
  VACCINES: 'vet_crm_vaccines',
  FOLLOWUPS: 'vet_crm_followups',
  MEMBERS: 'vet_crm_members',
  GUESTS: 'vet_crm_guests',
  APPOINTMENTS: 'vet_crm_appointments',
  LEADS: 'vet_crm_leads',
  BLASTS: 'vet_crm_blasts',
  TICKETS: 'vet_crm_tickets',
  QUEUES: 'vet_crm_queues',
  SLA_CHATS: 'vet_crm_sla_chats',
  SLA_CONFIG: 'vet_crm_sla_config'
};

// Date helpers
const getRelativeDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const getRelativeDateString = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

// Initial Data Generators
const initVaccines = () => [
  { id: 'VAC-001', petName: 'Buddy', species: 'Anjing', ownerName: 'Budi Santoso', email: 'budi@email.com', phone: '0812-1234-5678', vaccineType: 'Vaksin Rabies', dueDate: getRelativeDate(3), daysRemaining: 3, status: 'Belum Diingatkan' },
  { id: 'VAC-002', petName: 'Luna', species: 'Kucing', ownerName: 'Siti Rahayu', email: 'siti@email.com', phone: '0813-2345-6789', vaccineType: 'Vaksin Tricat (F3)', dueDate: getRelativeDate(1), daysRemaining: 1, status: 'Belum Diingatkan' },
  { id: 'VAC-003', petName: 'Mochi', species: 'Kelinci', ownerName: 'Rendi Pratama', email: 'rendi@email.com', phone: '0815-9999-8888', vaccineType: 'Vaksin RHDV2', dueDate: getRelativeDate(7), daysRemaining: 7, status: 'Belum Diingatkan' },
  { id: 'VAC-004', petName: 'Rex', species: 'Anjing', ownerName: 'Budi Santoso', email: 'budi@email.com', phone: '0812-1234-5678', vaccineType: 'Vaksin DHPPiL', dueDate: getRelativeDate(12), daysRemaining: 12, status: 'Sudah Diingatkan' },
  { id: 'VAC-005', petName: 'Cleo', species: 'Kucing', ownerName: 'Dewi Kusuma', email: 'dewi@email.com', phone: '0815-4567-8901', vaccineType: 'Vaksin Leukemia', dueDate: getRelativeDate(-2), daysRemaining: -2, status: 'Belum Diingatkan' }
];

const initFollowups = () => [
  { id: 'FLP-001', petName: 'Rocky', ownerName: 'Hendra Gunawan', phone: '0818-7890-1234', visitDate: getRelativeDate(-1), doctor: 'Dr. Rizal', service: 'Pemeriksaan', status: 'Belum', notes: '' },
  { id: 'FLP-002', petName: 'Koko', ownerName: 'Ahmad Wijaya', phone: '0814-3456-7890', visitDate: getRelativeDate(-2), doctor: 'Dr. Maya', service: 'Perawatan', status: 'Sudah Dihubungi', notes: 'Kondisi Koko membaik pasca grooming bulu, nafsu makan tinggi.' },
  { id: 'FLP-003', petName: 'Max', ownerName: 'Budi Santoso', phone: '0812-1234-5678', visitDate: getRelativeDate(-3), doctor: 'Dr. Rizal', service: 'Vaksinasi', status: 'Tidak Perlu', notes: 'Selesai vaksin rabies tahunan. Tidak ada keluhan pasca vaksin.' }
];

const initMembers = () => [
  { id: 'MB-001', name: 'Rina Marlina', email: 'rina.marlina@gmail.com', phone: '0823-1111-2222', stage: 'BARU', registeredAt: '2026-06-01', visits: 0, pets: ['Kiki (Kucing Anggora)'], totalTransaksi: 0 },
  { id: 'MB-002', name: 'Dani Prasetyo', email: 'dani.pras@gmail.com', phone: '0826-7777-8888', stage: 'BARU', registeredAt: '2026-05-28', visits: 0, pets: ['Rocky (Anjing Husky)'], totalTransaksi: 0 },
  { id: 'MB-003', name: 'Siti Rahayu', email: 'siti@email.com', phone: '0813-2345-6789', stage: 'AKTIF', registeredAt: '2026-03-15', visits: 1, pets: ['Luna (Kucing Persia)'], totalTransaksi: 450000 },
  { id: 'MB-004', name: 'Hendra Gunawan', email: 'hendra@email.com', phone: '0818-7890-1234', stage: 'AKTIF', registeredAt: '2026-04-10', visits: 2, pets: ['Rocky (Anjing Rottweiler)'], totalTransaksi: 850000 },
  { id: 'MB-005', name: 'Budi Santoso', email: 'budi@email.com', phone: '0812-1234-5678', stage: 'SETIA', registeredAt: '2025-01-20', visits: 6, pets: ['Max (Anjing Golden)', 'Rex (Anjing Labrador)'], totalTransaksi: 4850000 },
  { id: 'MB-006', name: 'Dewi Kusuma', email: 'dewi@email.com', phone: '0815-4567-8901', stage: 'SETIA', registeredAt: '2025-06-12', visits: 4, pets: ['Cleo (Kucing Maine Coon)'], totalTransaksi: 3200000 },
  { id: 'MB-007', name: 'Faisal Rahman', email: 'faisal@email.com', phone: '0819-2222-3333', stage: 'TIDAK AKTIF', registeredAt: '2025-08-05', visits: 3, pets: ['Tweety (Burung Kenari)'], totalTransaksi: 750000 },
  { id: 'MB-008', name: 'Yuni Astuti', email: 'yuni@email.com', phone: '0820-4444-5555', stage: 'TIDAK AKTIF', registeredAt: '2025-09-10', visits: 1, pets: ['Mochi (Kelinci Mini)'], totalTransaksi: 200000 }
];

const initGuests = () => [
  { id: 'GST-001', name: 'Guest Visitor #142', ip: '192.168.1.55', time: '10 menit lalu', page: '/guest' },
  { id: 'GST-002', name: 'Guest Visitor #143', ip: '180.252.12.90', time: '45 menit lalu', page: '/guest#layanan' },
  { id: 'GST-003', name: 'Guest Visitor #144', ip: '112.215.89.4', time: '2 jam lalu', page: '/guest' }
];

const initLeads = () => [
  { id: 'LD-001', visitorName: 'Ratih Kumala', source: '/guest', lastActive: 'Hari ini, 10:15', visitCount: 3, status: 'Baru', phone: '0812-7777-6666', email: 'ratih@email.com', isNewToday: true },
  { id: 'LD-002', visitorName: 'Prasetyo Wibowo', source: '/guest#layanan', lastActive: 'Hari ini, 08:30', visitCount: 5, status: 'Baru', phone: '0813-8888-7777', email: 'prasetyo@email.com', isNewToday: true },
  { id: 'LD-003', visitorName: 'Visitor #145', source: '/guest', lastActive: 'Hari ini, 14:20', visitCount: 1, status: 'Baru', phone: '0815-5555-4444', email: 'visitor145@email.com', isNewToday: true },
  { id: 'LD-004', visitorName: 'Intan Permata', source: '/guest#tentang-kami', lastActive: 'Kemarin, 16:45', visitCount: 2, status: 'Dihubungi', phone: '0819-3333-2222', email: 'intan@email.com' },
  { id: 'LD-005', visitorName: 'Bambang Tri', source: '/guest#kontak', lastActive: 'Kemarin, 11:10', visitCount: 4, status: 'Dihubungi', phone: '0821-2222-1111', email: 'bambang@email.com' },
  { id: 'LD-006', visitorName: 'Susi Susanti', source: '/guest', lastActive: '3 hari lalu', visitCount: 6, status: 'Konversi', phone: '0811-1111-2222', email: 'susi@email.com' },
  { id: 'LD-007', visitorName: 'Visitor #148', source: '/guest#layanan', lastActive: '4 hari lalu', visitCount: 1, status: 'Tidak Tertarik', phone: '0878-1234-5678', email: 'visitor148@email.com' },
  { id: 'LD-008', visitorName: 'Hendra Wijaya', source: '/guest', lastActive: 'Hari ini, 09:12', visitCount: 3, status: 'Baru', phone: '0812-9876-5432', email: 'hendra.w@email.com', isNewToday: true },
  { id: 'LD-009', visitorName: 'Diana Lestari', source: '/guest#layanan', lastActive: 'Hari ini, 11:05', visitCount: 2, status: 'Baru', phone: '0813-1122-3344', email: 'diana@email.com', isNewToday: true },
  { id: 'LD-010', visitorName: 'Visitor #152', source: '/guest', lastActive: 'Kemarin, 18:22', visitCount: 1, status: 'Baru', phone: '0815-4455-6677', email: 'visitor152@email.com' },
  { id: 'LD-011', visitorName: 'Aditya Pratama', source: '/guest#kontak', lastActive: 'Kemarin, 15:40', visitCount: 3, status: 'Dihubungi', phone: '0817-5566-7788', email: 'aditya@email.com' },
  { id: 'LD-012', visitorName: 'Kurniawan', source: '/guest#layanan', lastActive: '2 hari lalu', visitCount: 4, status: 'Dihubungi', phone: '0818-8899-0011', email: 'kurniawan@email.com' },
  { id: 'LD-013', visitorName: 'Visitor #155', source: '/guest', lastActive: '3 hari lalu', visitCount: 1, status: 'Baru', phone: '0819-0011-2233', email: 'visitor155@email.com' },
  { id: 'LD-014', visitorName: 'Yulia Ningsih', source: '/guest', lastActive: '4 hari lalu', visitCount: 5, status: 'Tidak Tertarik', phone: '0822-3344-5566', email: 'yulia@email.com' },
  { id: 'LD-015', visitorName: 'Rian Hidayat', source: '/guest#layanan', lastActive: '5 hari lalu', visitCount: 2, status: 'Konversi', phone: '0811-5566-7788', email: 'rian@email.com' }
];

const initBlastHistory = () => [
  { id: 'BLS-001', date: getRelativeDate(-5), type: 'WhatsApp', recipientCount: 6, message: 'Halo! Jangan lewatkan promo Grooming Full di bulan Juni ini. Hanya Rp 150.000 untuk anjing dan kucing!', status: 'Selesai' },
  { id: 'BLS-002', date: getRelativeDate(-12), type: 'Email', recipientCount: 8, message: 'Subject: Pengingat Penting Vaksinasi Tahunan Sahabat Berbulu Anda\n\nHalo, kami dari Veterinario mengingatkan pentingnya melengkapi vaksinasi tahunan peliharaan Anda untuk menjaga kekebalan tubuhnya dari berbagai virus.', status: 'Selesai' }
];

const initTickets = () => [
  {
    id: 'TKT-001',
    petName: 'Buddy',
    ownerName: 'Budi Santoso',
    email: 'budi@email.com',
    category: 'Billing',
    title: 'Kesalahan Nominal Tagihan Vaksin',
    urgency: 'Tinggi',
    priority: 'Tinggi',
    status: 'Baru',
    createdAt: getRelativeDate(-1),
    conversations: [
      { role: 'member', senderName: 'Budi Santoso', message: 'Halo admin, saya melihat ada perbedaan nominal tagihan vaksin Buddy kemarin. Di kuitansi tertulis Rp 250.000 tapi kartu kredit terpotong Rp 350.000.', time: 'Kemarin, 14:00' }
    ]
  },
  {
    id: 'TKT-002',
    petName: 'Luna',
    ownerName: 'Siti Rahayu',
    email: 'siti@email.com',
    category: 'Dokter',
    title: 'Pertanyaan Resep Obat Luna',
    urgency: 'Sedang',
    priority: 'Sedang',
    status: 'Dalam Proses',
    createdAt: getRelativeDate(-2),
    conversations: [
      { role: 'member', senderName: 'Siti Rahayu', message: 'Dok, obat sirup untuk Luna diminum sebelum atau sesudah makan ya? Di labelnya agak pudar tulisannya.', time: '2 hari lalu, 09:00' },
      { role: 'admin', senderName: 'Dr. Rizal', message: 'Halo Bu Siti, obat sirup multivitamin Luna sebaiknya diberikan setelah makan ya Bu, sehari 2 kali 1.5 ml.', time: '2 hari lalu, 10:15' },
      { role: 'member', senderName: 'Siti Rahayu', message: 'Baik dok, terima kasih infonya. Akan segera saya berikan.', time: '2 hari lalu, 11:00' }
    ]
  },
  {
    id: 'TKT-003',
    petName: 'Cleo',
    ownerName: 'Dewi Kusuma',
    email: 'dewi@email.com',
    category: 'Fasilitas',
    title: 'AC Ruang Tunggu Kurang Dingin',
    urgency: 'Rendah',
    priority: 'Rendah',
    status: 'Selesai',
    createdAt: getRelativeDate(-5),
    conversations: [
      { role: 'member', senderName: 'Dewi Kusuma', message: 'Kemarin waktu antre grooming Cleo, AC di ruang tunggu utama agak panas/kurang dingin ya. Mohon dicek.', time: '5 hari lalu, 11:30' },
      { role: 'admin', senderName: 'Admin Taufiq', message: 'Terima kasih masukannya Bu Dewi. Tim teknisi kami baru saja melakukan servis AC ruang tunggu utama pagi ini. Suhu sekarang sudah kembali dingin dan nyaman.', time: '4 hari lalu, 09:30' },
      { role: 'member', senderName: 'Dewi Kusuma', message: 'Bagus kalau begitu, terima kasih respon cepatnya!', time: '4 hari lalu, 10:00' }
    ]
  },
  {
    id: 'TKT-004',
    petName: 'Max',
    ownerName: 'Budi Santoso',
    email: 'budi@email.com',
    category: 'Layanan',
    title: 'Jadwal Grooming Terlambat Mulai',
    urgency: 'Sedang',
    priority: 'Sedang',
    status: 'Ditutup',
    createdAt: getRelativeDate(-4),
    conversations: [
      { role: 'member', senderName: 'Budi Santoso', message: 'Saya booking grooming jam 10 pagi tapi baru dikerjakan jam 11. Sayang sekali waktunya terbuang.', time: '4 hari lalu, 13:00' },
      { role: 'admin', senderName: 'Admin Taufiq', message: 'Kami memohon maaf atas keterlambatan kemarin karena adanya lonjakan pasien darurat sebelum jam Anda. Tiket ini kami tutup dan kami berikan voucher diskon 10% untuk grooming berikutnya.', time: '3 hari lalu, 14:00' }
    ]
  },
  {
    id: 'TKT-005',
    petName: 'Rex',
    ownerName: 'Budi Santoso',
    email: 'budi@email.com',
    category: 'Lainnya',
    title: 'Pendaftaran Member Tidak Masuk',
    urgency: 'Tinggi',
    priority: 'Tinggi',
    status: 'Baru',
    createdAt: getRelativeDate(0),
    conversations: [
      { role: 'member', senderName: 'Budi Santoso', message: 'Saya mencoba mendaftarkan Rex di akun saya tapi datanya tidak muncul di dashboard member.', time: 'Hari ini, 08:30' }
    ]
  },
  {
    id: 'TKT-006',
    petName: 'Mochi',
    ownerName: 'Rendi Pratama',
    email: 'rendi@email.com',
    category: 'Dokter',
    title: 'Mochi Lemas Pasca Vaksin',
    urgency: 'Tinggi',
    priority: 'Kritis',
    status: 'Dalam Proses',
    createdAt: getRelativeDate(-1),
    conversations: [
      { role: 'member', senderName: 'Rendi Pratama', message: 'Dok, setelah Mochi divaksin kemarin, dia lemas sekali dan tidak mau makan wortel kesukaannya. Apakah ini efek samping normal?', time: 'Kemarin, 19:00' },
      { role: 'admin', senderName: 'Dr. Rizal', message: 'Halo Pak Rendi, lemas ringan 24 jam pasca vaksinasi adalah reaksi wajar. Pastikan Mochi tetap minum air. Jika lemas berlanjut hingga hari ini atau ada bengkak di bekas suntikan, harap segera bawa kembali ke klinik untuk kami periksa.', time: 'Kemarin, 20:15' }
    ]
  },
  {
    id: 'TKT-007',
    petName: 'Luna',
    ownerName: 'Siti Rahayu',
    email: 'siti@email.com',
    category: 'Fasilitas',
    title: 'Bau Kurang Sedap di Area Kandang',
    urgency: 'Rendah',
    priority: 'Rendah',
    status: 'Baru',
    createdAt: getRelativeDate(0),
    conversations: [
      { role: 'member', senderName: 'Siti Rahayu', message: 'Area kandang inap agak tercium bau menyengat siang ini. Mungkin ventilasi atau pembersihan kandangnya bisa ditingkatkan.', time: 'Hari ini, 11:20' }
    ]
  },
  {
    id: 'TKT-008',
    petName: 'Rocky',
    ownerName: 'Dani Prasetyo',
    email: 'dani.pras@gmail.com',
    category: 'Layanan',
    title: 'Pencatatan Riwayat Medis Rocky Salah',
    urgency: 'Tinggi',
    priority: 'Tinggi',
    status: 'Baru',
    createdAt: getRelativeDate(0),
    conversations: [
      { role: 'member', senderName: 'Dani Prasetyo', message: 'Saya melihat rekam medis Rocky tanggal 10 Juni kemarin. Tertulis diberikan obat cacing padahal kemarin hanya pemeriksaan telinga. Mohon koreksinya.', time: 'Hari ini, 10:00' }
    ]
  }
];

const initQueues = () => [
  { id: 'Q-001', queueNumber: 'A-001', ownerName: 'Budi Santoso', petName: 'Buddy', service: 'Konsultasi Dokter', registeredTime: '08:05 WIB', status: 'Selesai', type: 'Datang Sekarang' },
  { id: 'Q-002', queueNumber: 'A-002', ownerName: 'Siti Rahayu', petName: 'Luna', service: 'Vaksinasi', registeredTime: '08:12 WIB', status: 'Selesai', type: 'Datang Sekarang' },
  { id: 'Q-003', queueNumber: 'A-003', ownerName: 'Rendi Pratama', petName: 'Mochi', service: 'Konsultasi Dokter', registeredTime: '08:30 WIB', status: 'Selesai', type: 'Datang Sekarang' },
  { id: 'Q-004', queueNumber: 'A-004', ownerName: 'Dewi Kusuma', petName: 'Cleo', service: 'Grooming', registeredTime: '08:45 WIB', status: 'Selesai', type: 'Jadwalkan', appointmentTime: '09:00 WIB' },
  { id: 'Q-005', queueNumber: 'A-005', ownerName: 'Dani Prasetyo', petName: 'Rocky', service: 'Konsultasi Dokter', registeredTime: '09:15 WIB', status: 'Selesai', type: 'Datang Sekarang' },
  { id: 'Q-006', queueNumber: 'A-006', ownerName: 'Hendra Gunawan', petName: 'Rocky', service: 'Vaksinasi', registeredTime: '09:40 WIB', status: 'Selesai', type: 'Datang Sekarang' },
  { id: 'Q-007', queueNumber: 'A-007', ownerName: 'Faisal Rahman', petName: 'Tweety', service: 'Konsultasi Dokter', registeredTime: '10:05 WIB', status: 'Selesai', type: 'Jadwalkan', appointmentTime: '10:00 WIB' },
  { id: 'Q-008', queueNumber: 'A-008', ownerName: 'Yuni Astuti', petName: 'Mochi', service: 'Grooming', registeredTime: '10:30 WIB', status: 'Selesai', type: 'Datang Sekarang' },
  { id: 'Q-009', queueNumber: 'A-009', ownerName: 'Rina Marlina', petName: 'Kiki', service: 'Konsultasi Dokter', registeredTime: '11:15 WIB', status: 'Selesai', type: 'Datang Sekarang' },
  { id: 'Q-010', queueNumber: 'A-010', ownerName: 'Hendra Gunawan', petName: 'Rocky', service: 'Konsultasi Dokter', registeredTime: '13:00 WIB', status: 'Dilayani', type: 'Datang Sekarang' },
  { id: 'Q-011', queueNumber: 'A-011', ownerName: 'Dewi Kusuma', petName: 'Cleo', service: 'Pemeriksaan Darah', registeredTime: '13:45 WIB', status: 'Dipanggil', type: 'Datang Sekarang' },
  { id: 'Q-012', queueNumber: 'A-012', ownerName: 'Siti Rahayu', petName: 'Luna', service: 'Vaksinasi', registeredTime: '14:10 WIB', status: 'Menunggu', type: 'Jadwalkan', appointmentTime: '14:30 WIB' },
  { id: 'Q-013', queueNumber: 'A-013', ownerName: 'Budi Santoso', petName: 'Max', service: 'Grooming', registeredTime: '14:25 WIB', status: 'Menunggu', type: 'Datang Sekarang' },
  { id: 'Q-014', queueNumber: 'A-014', ownerName: 'Dani Prasetyo', petName: 'Rocky', service: 'Konsultasi Dokter', registeredTime: '14:40 WIB', status: 'Menunggu', type: 'Datang Sekarang' },
  { id: 'Q-015', queueNumber: 'A-015', ownerName: 'Ratih Kumala', petName: 'Ciko', service: 'Grooming', registeredTime: '15:10 WIB', status: 'Menunggu', type: 'Jadwalkan', appointmentTime: '15:30 WIB' }
];

const initSLAChats = () => [
  { id: 'CH-001', ownerName: 'Budi Santoso', petName: 'Buddy', doctorName: 'Dr. Rizal', chatReceivedTime: '10:00 WIB', firstResponseTime: '10:12 WIB', responseDuration: 12, statusSLA: 'Tepat Waktu', statusChat: 'Selesai' },
  { id: 'CH-002', ownerName: 'Siti Rahayu', petName: 'Luna', doctorName: 'Dr. Maya', chatReceivedTime: '10:30 WIB', firstResponseTime: '11:15 WIB', responseDuration: 45, statusSLA: 'Terlambat', statusChat: 'Selesai' },
  { id: 'CH-003', ownerName: 'Rendi Pratama', petName: 'Mochi', doctorName: 'Dr. Sarah', chatReceivedTime: '11:00 WIB', firstResponseTime: '11:25 WIB', responseDuration: 25, statusSLA: 'Tepat Waktu', statusChat: 'Selesai' },
  { id: 'CH-004', ownerName: 'Dewi Kusuma', petName: 'Cleo', doctorName: 'Dr. Rizal', chatReceivedTime: '13:00 WIB', firstResponseTime: '13:28 WIB', responseDuration: 28, statusSLA: 'Tepat Waktu', statusChat: 'Selesai' },
  { id: 'CH-005', ownerName: 'Dani Prasetyo', petName: 'Rocky', doctorName: 'Dr. Maya', chatReceivedTime: '13:15 WIB', firstResponseTime: '13:25 WIB', responseDuration: 10, statusSLA: 'Tepat Waktu', statusChat: 'Selesai' },
  { id: 'CH-006', ownerName: 'Hendra Gunawan', petName: 'Rocky', doctorName: 'Dr. Sarah', chatReceivedTime: '14:00 WIB', firstResponseTime: null, responseDuration: 35, statusSLA: 'Terlambat', statusChat: 'Aktif' },
  { id: 'CH-007', ownerName: 'Faisal Rahman', petName: 'Tweety', doctorName: 'Dr. Rizal', chatReceivedTime: '14:20 WIB', firstResponseTime: null, responseDuration: 15, statusSLA: 'Tepat Waktu', statusChat: 'Aktif' },
  { id: 'CH-008', ownerName: 'Yuni Astuti', petName: 'Mochi', doctorName: 'Dr. Maya', chatReceivedTime: '14:32 WIB', firstResponseTime: null, responseDuration: 28, statusSLA: 'Hampir Terlambat', statusChat: 'Aktif' },
  { id: 'CH-009', ownerName: 'Rina Marlina', petName: 'Kiki', doctorName: 'Dr. Sarah', chatReceivedTime: '09:00 WIB', firstResponseTime: '09:15 WIB', responseDuration: 15, statusSLA: 'Tepat Waktu', statusChat: 'Selesai' },
  { id: 'CH-010', ownerName: 'Dani Prasetyo', petName: 'Rocky', doctorName: 'Dr. Rizal', chatReceivedTime: '09:30 WIB', firstResponseTime: '09:42 WIB', responseDuration: 12, statusSLA: 'Tepat Waktu', statusChat: 'Selesai' },
  { id: 'CH-011', ownerName: 'Budi Santoso', petName: 'Max', doctorName: 'Dr. Maya', chatReceivedTime: '14:35 WIB', firstResponseTime: null, responseDuration: 40, statusSLA: 'Terlambat', statusChat: 'Aktif' },
  { id: 'CH-012', ownerName: 'Dewi Kusuma', petName: 'Cleo', doctorName: 'Dr. Sarah', chatReceivedTime: '14:15 WIB', firstResponseTime: null, responseDuration: 25, statusSLA: 'Hampir Terlambat', statusChat: 'Aktif' },
  { id: 'CH-013', ownerName: 'Siti Rahayu', petName: 'Luna', doctorName: 'Dr. Rizal', chatReceivedTime: '08:15 WIB', firstResponseTime: '08:35 WIB', responseDuration: 20, statusSLA: 'Tepat Waktu', statusChat: 'Selesai' },
  { id: 'CH-014', ownerName: 'Rendi Pratama', petName: 'Mochi', doctorName: 'Dr. Maya', chatReceivedTime: '08:45 WIB', firstResponseTime: '09:20 WIB', responseDuration: 35, statusSLA: 'Terlambat', statusChat: 'Selesai' },
  { id: 'CH-015', ownerName: 'Budi Santoso', petName: 'Buddy', doctorName: 'Dr. Sarah', chatReceivedTime: '14:45 WIB', firstResponseTime: null, responseDuration: 5, statusSLA: 'Tepat Waktu', statusChat: 'Aktif' }
];

const initSLAConfig = () => ({
  targetFirstResponse: 30,
  targetResolution: 24,
  operationalHoursStart: '08:00',
  operationalHoursEnd: '21:00'
});

// Helper to load/save
const loadData = (key, fallbackFn) => {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      const fallback = fallbackFn();
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('CRM load error', e);
    return fallbackFn();
  }
};

const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('CRM save error', e);
  }
};

export const crmState = {
  // Initialize all databases
  init: () => {
    loadData(KEYS.VACCINES, initVaccines);
    loadData(KEYS.FOLLOWUPS, initFollowups);
    loadData(KEYS.MEMBERS, initMembers);
    loadData(KEYS.GUESTS, initGuests);
    loadData(KEYS.LEADS, initLeads);
    loadData(KEYS.BLASTS, initBlastHistory);
    loadData(KEYS.TICKETS, initTickets);
    loadData(KEYS.QUEUES, initQueues);
    loadData(KEYS.SLA_CHATS, initSLAChats);
    loadData(KEYS.SLA_CONFIG, initSLAConfig);

    // Sync guest registers into pipeline
    const storedMember = localStorage.getItem('vet_member');
    if (storedMember) {
      try {
        const m = JSON.parse(storedMember);
        const members = loadData(KEYS.MEMBERS, initMembers);
        if (!members.find(x => x.email === m.email)) {
          members.push({
            id: m.id || `MB_${Date.now()}`,
            name: m.name,
            email: m.email,
            phone: m.phone || '0812-0000-0000',
            stage: 'BARU',
            registeredAt: m.registeredAt || new Date().toISOString().split('T')[0],
            visits: 0,
            pets: [],
            totalTransaksi: 0
          });
          saveData(KEYS.MEMBERS, members);
        }
      } catch (_) {}
    }
  },

  // ─── Vaccines ───
  getVaccines: () => {
    crmState.init();
    return loadData(KEYS.VACCINES, initVaccines);
  },

  sendVaccineReminder: (id) => {
    const list = crmState.getVaccines();
    const updated = list.map(v => v.id === id ? { ...v, status: 'Sudah Diingatkan' } : v);
    saveData(KEYS.VACCINES, updated);
    return updated;
  },

  // ─── Followups ───
  getFollowups: () => {
    crmState.init();
    return loadData(KEYS.FOLLOWUPS, initFollowups);
  },

  addFollowUpTask: (appt) => {
    const list = crmState.getFollowups();
    const newTask = {
      id: `FLP-${Date.now()}`,
      petName: appt.hewan,
      ownerName: appt.pemilik,
      phone: '0812-0000-0000', // Default dummy
      visitDate: new Date().toISOString().split('T')[0],
      doctor: appt.dokter || 'Dr. Rizal',
      service: appt.layanan,
      status: 'Belum',
      notes: ''
    };
    list.unshift(newTask);
    saveData(KEYS.FOLLOWUPS, list);
    return list;
  },

  updateFollowup: (id, status, notes) => {
    const list = crmState.getFollowups();
    const updated = list.map(f => f.id === id ? { ...f, status, notes } : f);
    saveData(KEYS.FOLLOWUPS, updated);
    return updated;
  },

  // ─── Leads ───
  getLeads: () => {
    crmState.init();
    return loadData(KEYS.LEADS, initLeads);
  },

  updateLeadStatus: (id, status) => {
    const list = crmState.getLeads();
    const idx = list.findIndex(l => l.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      saveData(KEYS.LEADS, list);

      // If converted, automatically register them as a member
      if (status === 'Konversi') {
        const lead = list[idx];
        const members = loadData(KEYS.MEMBERS, initMembers);
        if (!members.find(m => m.email === lead.email)) {
          members.push({
            id: `MB-${Date.now()}`,
            name: lead.visitorName,
            email: lead.email,
            phone: lead.phone,
            stage: 'BARU',
            registeredAt: new Date().toISOString().split('T')[0],
            visits: 0,
            pets: [],
            totalTransaksi: 0
          });
          saveData(KEYS.MEMBERS, members);
        }
      }
    }
    return list;
  },

  // ─── Segmentation ───
  getSegments: () => {
    crmState.init();
    const members = loadData(KEYS.MEMBERS, initMembers);
    const vaccines = crmState.getVaccines();

    const checkPetType = (m, type) => {
      if (!m.pets) return false;
      return m.pets.some(p => p.toLowerCase().includes(type.toLowerCase()));
    };

    const getMemberVaccineStatus = (m) => {
      const mVacs = vaccines.filter(v => v.email?.toLowerCase() === m.email?.toLowerCase());
      if (mVacs.length === 0) return 'Vaksin Lengkap';
      const hasOverdue = mVacs.some(v => v.daysRemaining < 0 && v.status === 'Belum Diingatkan');
      if (hasOverdue) return 'Vaksin Sudah Terlambat';
      const hasSoon = mVacs.some(v => v.daysRemaining >= 0 && v.daysRemaining <= 7 && v.status === 'Belum Diingatkan');
      if (hasSoon) return 'Vaksin Hampir Jatuh Tempo';
      return 'Vaksin Lengkap';
    };

    return {
      jenisHewan: [
        { name: 'Pemilik Anjing', count: members.filter(m => checkPetType(m, 'anjing') || checkPetType(m, 'dog')).length, value: 'anjing' },
        { name: 'Pemilik Kucing', count: members.filter(m => checkPetType(m, 'kucing') || checkPetType(m, 'cat')).length, value: 'kucing' },
        { name: 'Pemilik Kelinci', count: members.filter(m => checkPetType(m, 'kelinci') || checkPetType(m, 'rabbit')).length, value: 'kelinci' },
        { name: 'Lainnya', count: members.filter(m => !checkPetType(m, 'anjing') && !checkPetType(m, 'kucing') && !checkPetType(m, 'kelinci')).length, value: 'lainnya' }
      ],
      frekuensiKunjungan: [
        { name: 'Sangat Aktif (5+)', count: members.filter(m => m.visits >= 5).length, value: 'sangat_aktif' },
        { name: 'Aktif (3-4)', count: members.filter(m => m.visits >= 3 && m.visits <= 4).length, value: 'aktif' },
        { name: 'Jarang (1-2)', count: members.filter(m => m.visits >= 1 && m.visits <= 2).length, value: 'jarang' },
        { name: 'Belum Pernah (0)', count: members.filter(m => m.visits === 0).length, value: 'belum_pernah' }
      ],
      statusVaksin: [
        { name: 'Vaksin Lengkap', count: members.filter(m => getMemberVaccineStatus(m) === 'Vaksin Lengkap').length, value: 'lengkap' },
        { name: 'Vaksin Hampir Jatuh Tempo', count: members.filter(m => getMemberVaccineStatus(m) === 'Vaksin Hampir Jatuh Tempo').length, value: 'hampir_tempo' },
        { name: 'Vaksin Sudah Terlambat', count: members.filter(m => getMemberVaccineStatus(m) === 'Vaksin Sudah Terlambat').length, value: 'terlambat' }
      ],
      nilaiTransaksi: [
        { name: 'High Value (Rp 1jt+)', count: members.filter(m => (m.totalTransaksi || 0) >= 1000000).length, value: 'high' },
        { name: 'Medium (Rp 500rb - 1jt)', count: members.filter(m => (m.totalTransaksi || 0) >= 500000 && (m.totalTransaksi || 0) < 1000000).length, value: 'medium' },
        { name: 'Low Value (< Rp 500rb)', count: members.filter(m => (m.totalTransaksi || 0) < 500000).length, value: 'low' }
      ],
      pipelineStage: [
        { name: 'Guest', count: 145, value: 'guest' },
        { name: 'Baru', count: members.filter(m => m.stage === 'BARU').length, value: 'BARU' },
        { name: 'Aktif', count: members.filter(m => m.stage === 'AKTIF').length, value: 'AKTIF' },
        { name: 'Setia', count: members.filter(m => m.stage === 'SETIA').length, value: 'SETIA' },
        { name: 'Tidak Aktif', count: members.filter(m => m.stage === 'TIDAK AKTIF').length, value: 'TIDAK_AKTIF' }
      ]
    };
  },

  getMembersBySegment: (category, val) => {
    crmState.init();
    const members = loadData(KEYS.MEMBERS, initMembers);
    const vaccines = crmState.getVaccines();
    const guests = loadData(KEYS.GUESTS, initGuests);

    const checkPetType = (m, type) => {
      if (!m.pets) return false;
      return m.pets.some(p => p.toLowerCase().includes(type.toLowerCase()));
    };

    const getMemberVaccineStatus = (m) => {
      const mVacs = vaccines.filter(v => v.email?.toLowerCase() === m.email?.toLowerCase());
      if (mVacs.length === 0) return 'Vaksin Lengkap';
      const hasOverdue = mVacs.some(v => v.daysRemaining < 0 && v.status === 'Belum Diingatkan');
      if (hasOverdue) return 'Vaksin Sudah Terlambat';
      const hasSoon = mVacs.some(v => v.daysRemaining >= 0 && v.daysRemaining <= 7 && v.status === 'Belum Diingatkan');
      if (hasSoon) return 'Vaksin Hampir Jatuh Tempo';
      return 'Vaksin Lengkap';
    };

    if (category === 'jenisHewan') {
      if (val === 'lainnya') {
        return members.filter(m => !checkPetType(m, 'anjing') && !checkPetType(m, 'dog') && !checkPetType(m, 'kucing') && !checkPetType(m, 'cat') && !checkPetType(m, 'kelinci') && !checkPetType(m, 'rabbit'));
      }
      return members.filter(m => checkPetType(m, val));
    }
    
    if (category === 'frekuensiKunjungan') {
      if (val === 'sangat_aktif') return members.filter(m => m.visits >= 5);
      if (val === 'aktif') return members.filter(m => m.visits >= 3 && m.visits <= 4);
      if (val === 'jarang') return members.filter(m => m.visits >= 1 && m.visits <= 2);
      if (val === 'belum_pernah') return members.filter(m => m.visits === 0);
    }

    if (category === 'statusVaksin') {
      if (val === 'lengkap') return members.filter(m => getMemberVaccineStatus(m) === 'Vaksin Lengkap');
      if (val === 'hampir_tempo') return members.filter(m => getMemberVaccineStatus(m) === 'Vaksin Hampir Jatuh Tempo');
      if (val === 'terlambat') return members.filter(m => getMemberVaccineStatus(m) === 'Vaksin Sudah Terlambat');
    }

    if (category === 'nilaiTransaksi') {
      if (val === 'high') return members.filter(m => (m.totalTransaksi || 0) >= 1000000);
      if (val === 'medium') return members.filter(m => (m.totalTransaksi || 0) >= 500000 && (m.totalTransaksi || 0) < 1000000);
      if (val === 'low') return members.filter(m => (m.totalTransaksi || 0) < 500000);
    }

    if (category === 'pipelineStage') {
      if (val === 'guest') {
        return guests.map(g => ({ name: g.name, email: 'Guest Visitor', pets: ['-'], visits: 0, registeredAt: '-', totalTransaksi: 0, phone: '-' }));
      }
      const dbStage = val === 'TIDAK_AKTIF' ? 'TIDAK AKTIF' : val;
      return members.filter(m => m.stage === dbStage);
    }

    return [];
  },

  // ─── Blasts ───
  getBlastHistory: () => {
    crmState.init();
    return loadData(KEYS.BLASTS, initBlastHistory);
  },

  saveBlastHistory: (data) => {
    const list = crmState.getBlastHistory();
    const newEntry = {
      id: `BLS-${String(list.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      ...data,
      status: 'Selesai'
    };
    list.unshift(newEntry);
    saveData(KEYS.BLASTS, list);
    return list;
  },

  // ─── Pipeline Member ───
  getPipelineData: () => {
    crmState.init();
    const members = loadData(KEYS.MEMBERS, initMembers);
    const guests = loadData(KEYS.GUESTS, initGuests);

    const stages = {
      GUEST: guests.map(g => ({ ...g, stage: 'GUEST', pets: [], visits: 0, registeredAt: '-' })),
      BARU: members.filter(m => m.stage === 'BARU'),
      AKTIF: members.filter(m => m.stage === 'AKTIF'),
      SETIA: members.filter(m => m.stage === 'SETIA'),
      TIDAK_AKTIF: members.filter(m => m.stage === 'TIDAK AKTIF')
    };

    return stages;
  },

  moveMemberStage: (id, newStage) => {
    const members = loadData(KEYS.MEMBERS, initMembers);
    const updated = members.map(m => m.id === id ? { ...m, stage: newStage } : m);
    saveData(KEYS.MEMBERS, updated);
    return crmState.getPipelineData();
  },

  // ─── Tickets ───
  getTickets: () => {
    crmState.init();
    return loadData(KEYS.TICKETS, initTickets);
  },

  createTicket: (data) => {
    crmState.init();
    const list = loadData(KEYS.TICKETS, initTickets);
    const newId = `TKT-${String(list.length + 1).padStart(3, '0')}`;
    const newEntry = {
      id: newId,
      petName: data.petName,
      ownerName: data.ownerName,
      email: data.email,
      category: data.category,
      title: data.title,
      urgency: data.urgency,
      priority: data.urgency === 'Tinggi' ? 'Tinggi' : data.urgency === 'Sedang' ? 'Sedang' : 'Rendah',
      status: 'Baru',
      createdAt: new Date().toISOString().split('T')[0],
      conversations: [
        { role: 'member', senderName: data.ownerName, message: data.description, time: 'Hari ini, Baru saja' }
      ]
    };
    list.unshift(newEntry);
    saveData(KEYS.TICKETS, list);
    return list;
  },

  updateTicketStatus: (id, status) => {
    const list = loadData(KEYS.TICKETS, initTickets);
    const updated = list.map(t => t.id === id ? { ...t, status } : t);
    saveData(KEYS.TICKETS, updated);
    return updated;
  },

  updateTicketPriority: (id, priority) => {
    const list = loadData(KEYS.TICKETS, initTickets);
    const updated = list.map(t => t.id === id ? { ...t, priority } : t);
    saveData(KEYS.TICKETS, updated);
    return updated;
  },

  replyTicket: (id, message, role, senderName) => {
    const list = loadData(KEYS.TICKETS, initTickets);
    const d = new Date();
    const timeStr = `Hari ini, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const updated = list.map(t => {
      if (t.id === id) {
        const conversations = [...t.conversations, { role, senderName, message, time: timeStr }];
        let status = t.status;
        if (role === 'admin' && t.status === 'Baru') {
          status = 'Dalam Proses';
        }
        return { ...t, conversations, status };
      }
      return t;
    });
    saveData(KEYS.TICKETS, updated);
    return updated;
  },

  // ─── Queues ───
  getQueue: () => {
    crmState.init();
    return loadData(KEYS.QUEUES, initQueues);
  },

  addQueue: (data) => {
    crmState.init();
    const list = loadData(KEYS.QUEUES, initQueues);
    const countToday = list.length;
    const qNum = `A-${String(countToday + 1).padStart(3, '0')}`;
    const d = new Date();
    const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} WIB`;
    const newEntry = {
      id: `Q-${Date.now()}`,
      queueNumber: qNum,
      ownerName: data.ownerName,
      petName: data.petName,
      service: data.service,
      registeredTime: timeStr,
      status: 'Menunggu',
      type: data.type,
      appointmentTime: data.appointmentTime || null
    };
    list.push(newEntry);
    saveData(KEYS.QUEUES, list);
    return newEntry;
  },

  updateQueueStatus: (id, status) => {
    const list = loadData(KEYS.QUEUES, initQueues);
    const updated = list.map(q => q.id === id ? { ...q, status } : q);
    saveData(KEYS.QUEUES, updated);
    return updated;
  },

  resetQueue: () => {
    saveData(KEYS.QUEUES, []);
    return [];
  },

  // ─── SLA Chats ───
  getSLAData: () => {
    crmState.init();
    const chats = loadData(KEYS.SLA_CHATS, initSLAChats);
    const config = loadData(KEYS.SLA_CONFIG, initSLAConfig);

    const totalChats = chats.length;
    const compliantChats = chats.filter(c => c.statusSLA === 'Tepat Waktu').length;
    const lateChats = chats.filter(c => c.statusSLA === 'Terlambat').length;
    const complianceRate = totalChats > 0 ? Math.round((compliantChats / totalChats) * 100) : 100;

    const respondedChats = chats.filter(c => c.firstResponseTime !== null);
    const avgResponseTime = respondedChats.length > 0
      ? Math.round(respondedChats.reduce((sum, c) => sum + c.responseDuration, 0) / respondedChats.length)
      : 0;

    const violationsCount = chats.filter(c => c.statusChat === 'Aktif' && c.firstResponseTime === null && c.responseDuration > config.targetFirstResponse).length;

    const doctors = ['Dr. Rizal', 'Dr. Maya', 'Dr. Sarah'];
    const doctorStats = doctors.map(doc => {
      const docChats = chats.filter(c => c.doctorName === doc);
      const docTotal = docChats.length;
      const docCompliant = docChats.filter(c => c.statusSLA === 'Tepat Waktu').length;
      const docRate = docTotal > 0 ? Math.round((docCompliant / docTotal) * 100) : 100;

      const docResponded = docChats.filter(c => c.firstResponseTime !== null);
      const docAvg = docResponded.length > 0
        ? Math.round(docResponded.reduce((sum, c) => sum + c.responseDuration, 0) / docResponded.length)
        : 0;

      return { name: doc, complianceRate: docRate, avgResponseTime: docAvg, totalChats: docTotal };
    });

    const weeklyTrend = [
      { week: 'Mgg 1', rate: 84 },
      { week: 'Mgg 2', rate: 86 },
      { week: 'Mgg 3', rate: 89 },
      { week: 'Mgg 4', rate: 91 },
      { week: 'Mgg 5', rate: 88 },
      { week: 'Mgg 6', rate: 92 },
      { week: 'Mgg 7', rate: 90 },
      { week: 'Mgg 8', rate: complianceRate }
    ];

    return {
      chats,
      config,
      stats: {
        complianceRate,
        compliantCount: compliantChats,
        lateCount: lateChats,
        avgResponseTime,
        violationsCount
      },
      doctorStats,
      weeklyTrend
    };
  },

  escalateChat: (id) => {
    const chats = loadData(KEYS.SLA_CHATS, initSLAChats);
    const doctors = ['Dr. Rizal', 'Dr. Maya', 'Dr. Sarah'];
    const updated = chats.map(c => {
      if (c.id === id) {
        const currentDocIdx = doctors.indexOf(c.doctorName);
        const nextDoc = doctors[(currentDocIdx + 1) % doctors.length];
        return {
          ...c,
          doctorName: nextDoc,
          statusSLA: 'Tepat Waktu',
          responseDuration: 2,
          isEscalated: true
        };
      }
      return c;
    });
    saveData(KEYS.SLA_CHATS, updated);
    return updated;
  },

  updateSLAConfig: (config) => {
    saveData(KEYS.SLA_CONFIG, config);
    return config;
  },

  // ─── CRM Stats ───
  getCRMStats: () => {
    crmState.init();
    const vaccines = crmState.getVaccines();
    const followups = crmState.getFollowups();
    const pipeline = crmState.getPipelineData();
    const leads = crmState.getLeads();
    const blasts = crmState.getBlastHistory();

    const vaccinesExpiring = vaccines.filter(v => v.status === 'Belum Diingatkan' && v.daysRemaining <= 7).length;
    const pendingFollowups = followups.filter(f => f.status === 'Belum').length;

    const pipelineDistribution = [
      { name: 'Guest', value: 145 },
      { name: 'Baru', value: pipeline.BARU.length },
      { name: 'Aktif', value: pipeline.AKTIF.length },
      { name: 'Setia', value: pipeline.SETIA.length },
      { name: 'Tidak Aktif', value: pipeline.TIDAK_AKTIF.length }
    ];

    // Leads Stats
    const totalLeads = leads.length;
    const newLeadsToday = leads.filter(l => l.isNewToday && l.status === 'Baru').length;
    const contactedLeads = leads.filter(l => l.status === 'Dihubungi').length;
    const convertedLeadsCount = leads.filter(l => l.status === 'Konversi').length;
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeadsCount / totalLeads) * 100) : 0;

    // Blast Stats
    const blastHistoryThisMonth = blasts.length; // Simplified

    // Segment Stats
    const segments = crmState.getSegments();
    let maxSegment = { name: 'Belum Ada', count: 0 };
    Object.keys(segments).forEach(cat => {
      segments[cat].forEach(seg => {
        if (seg.name !== 'Guest' && seg.count > maxSegment.count) {
          maxSegment = { name: seg.name, count: seg.count };
        }
      });
    });

    const totalFollowups = followups.length;
    const resolvedFollowups = followups.filter(f => f.status === 'Sudah Dihubungi' || f.status === 'Tidak Perlu').length;
    const successRate = totalFollowups > 0 ? Math.round((resolvedFollowups / totalFollowups) * 100) : 0;
    const avgTime = 4.2;

    // Stage 3 Stats
    const tickets = loadData(KEYS.TICKETS, initTickets);
    const queues = loadData(KEYS.QUEUES, initQueues);
    const sla = crmState.getSLAData();

    const ticketsNew = tickets.filter(t => t.status === 'Baru').length;
    const slaRate = sla.stats.complianceRate;
    const activeQueueObj = queues.find(q => q.status === 'Dilayani');
    const activeQueue = activeQueueObj ? activeQueueObj.queueNumber : 'A-010';
    const waitingQueue = queues.filter(q => q.status === 'Menunggu' || q.status === 'Dipanggil').length;
    const slaViolations = sla.stats.violationsCount;

    return {
      vaccinesExpiring,
      pendingFollowups,
      pipelineDistribution,
      successRate,
      avgTime,
      newLeadsToday,
      totalLeads,
      contactedLeads,
      conversionRate,
      blastHistoryThisMonth,
      topSegmentName: maxSegment.name,
      topSegmentCount: maxSegment.count,
      
      // Stage 3
      ticketsNew,
      slaRate,
      activeQueue,
      waitingQueue,
      slaViolations
    };
  }
};
