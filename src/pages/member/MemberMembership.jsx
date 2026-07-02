import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { supabase } from '../../lib/supabase';
import { jadwalService, queueService, billService } from '../../lib/supabaseService';
import GuestNavbar from '../guest/components/GuestNavbar';
import GuestFooter from '../guest/components/GuestFooter';
import '../guest/guest.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getAge = (birthDateStr) => {
  if (!birthDateStr) return 'Umur tidak diketahui';
  const birthDate = new Date(birthDateStr);
  const today = new Date();
  let ageYears = today.getFullYear() - birthDate.getFullYear();
  let ageMonths = today.getMonth() - birthDate.getMonth();
  if (ageMonths < 0 || (ageMonths === 0 && today.getDate() < birthDate.getDate())) {
    ageYears--;
    ageMonths += 12;
  }
  return ageYears > 0 ? `${ageYears} tahun ${ageMonths > 0 ? `${ageMonths} bulan` : ''}` : `${ageMonths} bulan`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const formatRupiah = (val) => 'Rp ' + new Intl.NumberFormat('id-ID').format(val || 0);

const getApptDateParts = (dateStr) => {
  try {
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    return { day: String(d.getDate()).padStart(2, '0'), month: months[d.getMonth()] };
  } catch (_) {
    return { day: '00', month: '---' };
  }
};

// ─── Tier Config ──────────────────────────────────────────────────────────────
const TIER_CONFIG = {
  Bronze: { color: '#CD7F32', bg: '#FFF8F0', light: '#FEF3E7', minPoints: 0, icon: '🥉',
    benefits: ['Akses dasar fitur member', 'Riwayat medis digital', 'Booking janji online'] },
  Silver: { color: '#A0A0A0', bg: '#F8F9FA', light: '#F1F3F5', minPoints: 500, icon: '🥈',
    benefits: ['Semua fitur Bronze', '+ Diskon 10% layanan', '+ Prioritas booking', '+ Chat dokter gratis'] },
  Gold: { color: '#FFD700', bg: '#FFFDF0', light: '#FFF8DC', minPoints: 1000, icon: '🥇',
    benefits: ['Semua fitur Silver', '+ Diskon 20% layanan', '+ Grooming gratis per 6 bln', '+ Vaksinasi tahunan gratis', '+ Prioritas respon chat'] },
};

const getTier = (points) => points >= 1000 ? 'Gold' : points >= 500 ? 'Silver' : 'Bronze';
const getNextTier = (t) => t === 'Bronze' ? 'Silver' : t === 'Silver' ? 'Gold' : null;
const getPointsToNext = (points, t) => t === 'Bronze' ? 500 - points : t === 'Silver' ? 1000 - points : 0;
const getProgress = (points, t) => t === 'Bronze' ? Math.min(100, (points / 500) * 100) : t === 'Silver' ? Math.min(100, ((points - 500) / 500) * 100) : 100;

// ─── Quick Action Card ────────────────────────────────────────────────────────
const QuickAction = ({ icon, label, desc, onClick, color }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
      background: 'white', borderRadius: 14, border: `1px solid ${color}20`,
      cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', width: '100%',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 4px 12px ${color}20`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = `${color}20`; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    <div style={{
      width: 44, height: 44, borderRadius: 12, background: `${color}15`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{label}</div>
      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 1 }}>{desc}</div>
    </div>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MemberMembership() {
  const { member } = useMemberAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [pointHistory, setPointHistory] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [activeQueue, setActiveQueue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!member?.id) return;
      setLoading(true);
      try {
        const [profileData, points] = await Promise.all([
          supabase.from('profiles').select('*').eq('user_id', member.id).single(),
          supabase.from('point_transactions').select('*').eq('user_id', member.id).order('created_at', { ascending: false }).limit(10),
        ]);
        if (profileData.data) setProfile(profileData.data);
        setPointHistory(points.data || []);

        // Fetch appointments
        const appts = await jadwalService.getByMemberId(member.id);
        const upcoming = (appts || []).filter(a => a.status === 'Menunggu' || a.status === 'Dikonfirmasi');
        setAppointments(upcoming.slice(0, 3));

        // Fetch bills
        const memberUser = JSON.parse(localStorage.getItem('memberUser') || '{}');
        const email = memberUser.email || member.email;
        const billsData = await billService.getByMemberId(member.id);
        const pendingBills = (billsData || []).filter(b => b.status === 'Belum Dibayar');
        setBills(pendingBills.slice(0, 3));                // Fetch active queue (with demo email fallback)
                const effectiveEmail = email === 'demo@email.com' ? 'budi@email.com' : email;
                const queues = await queueService.getByEmail(effectiveEmail);
                const active = (queues || []).find(q => q.status === 'Menunggu' || q.status === 'Dipanggil');
                setActiveQueue(active || null);
      } catch (err) {
        console.error('Error fetching membership data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [member?.id]);

  const points = profile?.total_poin ?? 0;
  const currentTier = profile?.tier || getTier(points);
  const tierConfig = TIER_CONFIG[currentTier] || TIER_CONFIG.Bronze;
  const nextTier = getNextTier(currentTier);
  const nextTierConfig = nextTier ? TIER_CONFIG[nextTier] : null;
  const pointsToNext = getPointsToNext(points, currentTier);
  const progress = getProgress(points, currentTier);

  const getName = () => {
    const stored = localStorage.getItem('memberUser');
    if (stored) { try { return JSON.parse(stored).name; } catch (_) {} }
    return member?.name || profile?.name || 'Member';
  };
  const getEmail = () => {
    const stored = localStorage.getItem('memberUser');
    if (stored) { try { return JSON.parse(stored).email; } catch (_) {} }
    return member?.email || profile?.email || '';
  };
  const name = getName();
  const email = getEmail();

  if (loading) {
    return (
      <div className="guest-page">
        <GuestNavbar />
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#16a34a', fontSize: '1rem' }}>Memuat data membership...</div>
        </div>
        <GuestFooter />
      </div>
    );
  }

  return (
    <div className="guest-page">
      <GuestNavbar />

      <main style={{ paddingTop: '100px', paddingBottom: '80px', background: '#f8fafc', minHeight: '60vh' }}>
        <div className="guest-container">
          {/* ── Header ── */}
          <div className="scroll-animate animate-in" style={{ marginBottom: 32 }}>
            <div className="section-eyebrow" style={{ marginBottom: 12 }}>
              <div className="section-eyebrow__dot" />
              Member Area
            </div>
            <h1 className="section-title" style={{ margin: '0 0 8px' }}>
              Halo, {name.split(' ')[0]}! <span className="section-title--gradient">🐾</span>
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: 560, lineHeight: 1.7 }}>
              Kelola membership, lakukan transaksi, dan pantau aktivitas klinik Anda di sini.
            </p>
          </div>

          {/* ── Quick Actions ── */}
          <div className="scroll-animate animate-in" style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>⚡ Aksi Cepat</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
              <QuickAction icon="📅" label="Buat Janji Temu" desc="Booking layanan dokter hewan" onClick={() => navigate('/member/janji')} color="#3b5bdb" />
              <QuickAction icon="🔢" label="Ambil Antrian" desc="Daftar antrian kunjungan" onClick={() => navigate('/member/antrian')} color="#16a34a" />
              <QuickAction icon="🐾" label="Tambah Hewan" desc="Daftarkan hewan peliharaan baru" onClick={() => navigate('/member/hewan')} color="#f76707" />
              <QuickAction icon="💬" label="Chat Dokter" desc="Konsultasi via chat" onClick={() => navigate('/member/chat')} color="#7048e8" />
              <QuickAction icon="🎫" label="Buat Tiket Keluhan" desc="Laporkan masalah atau komplain" onClick={() => navigate('/member/tiket')} color="#e03131" />
              <QuickAction icon="🧾" label="Lihat Tagihan" desc="Cek riwayat & status pembayaran" onClick={() => navigate('/member/tagihan')} color="#0ca678" />
            </div>
          </div>

          {/* ── Main Grid: Points + Transaksi ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>

            {/* ── LEFT COLUMN: Points Card ── */}
            <div className="scroll-animate animate-in">
              {/* Points Card */}
              <div style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: 24, padding: 32,
                border: `1px solid ${tierConfig.light}`,
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                  background: `linear-gradient(90deg, ${tierConfig.color}, ${currentTier === 'Gold' ? '#FFA500' : currentTier === 'Silver' ? '#C0C0C0' : '#CD7F32'})`,
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 4 }}>
                      Bergabung sejak {formatDate(profile?.created_at)}
                    </div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{name}</h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 2 }}>{email}</p>
                  </div>
                  <div style={{
                    width: 60, height: 60, borderRadius: 16,
                    background: tierConfig.bg, border: `2px solid ${tierConfig.light}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem',
                  }}>
                    {tierConfig.icon}
                  </div>
                </div>

                <div style={{ textAlign: 'center', padding: '20px 0', marginBottom: 20 }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>TOTAL POIN ANDA</div>
                  <div style={{
                    fontSize: '3.5rem', fontWeight: 900,
                    background: `linear-gradient(135deg, ${tierConfig.color}, ${currentTier === 'Gold' ? '#FFA500' : currentTier === 'Silver' ? '#808080' : '#A0522D'})`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text', lineHeight: 1.1,
                  }}>
                    {points.toLocaleString('id-ID')}
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8,
                    background: tierConfig.bg, border: `1px solid ${tierConfig.light}`,
                    padding: '4px 14px', borderRadius: 9999, fontSize: '0.8rem', fontWeight: 700, color: tierConfig.color,
                  }}>
                    {tierConfig.icon} Member {currentTier}
                  </div>
                </div>

                {nextTier && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 6 }}>
                      <span style={{ color: '#64748b', fontWeight: 500 }}>
                        {nextTierConfig.icon} Menuju {nextTier}
                      </span>
                      <span style={{ color: '#1e293b', fontWeight: 700 }}>{pointsToNext.toLocaleString('id-ID')} poin lagi</span>
                    </div>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 4,
                        background: `linear-gradient(90deg, ${tierConfig.color}, ${nextTierConfig.color})`,
                        width: `${progress}%`, transition: 'width 0.8s ease',
                      }} />
                    </div>
                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 8, textAlign: 'center' }}>
                      💳 Setiap transaksi Rp10.000 = 1 poin
                    </p>
                  </div>
                )}
              </div>

              {/* Point History */}
              <div style={{ background: 'white', borderRadius: 16, padding: 24, marginTop: 20, border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>📊 Riwayat Poin</h3>
                {pointHistory.length === 0 ? (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>🏁</div>
                    <p>Belum ada riwayat poin. Mulai bertransaksi untuk mengumpulkan poin!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {pointHistory.map((pt) => (
                      <div key={pt.id} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 12px', borderRadius: 10,
                        background: pt.jenis === 'earn' ? '#F0FDF4' : '#FEF2F2',
                        border: `1px solid ${pt.jenis === 'earn' ? '#BBF7D0' : '#FECACA'}`,
                      }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: pt.jenis === 'earn' ? '#16a34a20' : '#DC262620',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
                        }}>
                          {pt.jenis === 'earn' ? '➕' : '➖'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>{pt.keterangan || pt.sumber}</div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                            {formatDate(pt.created_at)}{pt.nominal_transaksi > 0 && ` · ${formatRupiah(pt.nominal_transaksi)}`}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: pt.jenis === 'earn' ? '#16a34a' : '#DC2626' }}>
                          {pt.jenis === 'earn' ? '+' : '-'}{pt.poin}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cara Dapat Poin */}
              <div style={{ background: 'white', borderRadius: 16, padding: 24, marginTop: 20, border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>💡 Cara Mendapatkan Poin</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { icon: '💳', label: 'Transaksi', desc: 'Setiap Rp10.000 = 1 poin', color: '#16a34a' },
                    { icon: '🎉', label: 'Bonus Registrasi', desc: 'Dapatkan 50 poin saat mendaftar', color: '#3b5bdb' },
                    { icon: '🎂', label: 'Ulang Tahun Hewan', desc: 'Bonus 25 poin di hari spesial', color: '#f76707' },
                    { icon: '👥', label: 'Referral', desc: 'Ajak teman, dapatkan 100 poin', color: '#7048e8' },
                  ].map((item) => (
                    <div key={item.label} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                        {item.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>{item.label}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN: Transaksi Features ── */}
            <div className="scroll-animate animate-in" style={{ animationDelay: '0.2s' }}>
              {/* Active Queue Card */}
              {activeQueue && (
                <div style={{ background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)', borderRadius: 16, padding: 20, marginBottom: 20, border: '1px solid #BBF7D0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{ fontSize: '1.8rem' }}>🔢</div>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#16a34a' }}>ANTRIAN AKTIF</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#166534' }}>Nomor {activeQueue.queueNumber}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', background: '#16a34a', color: 'white', padding: '3px 12px', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 700 }}>
                      {activeQueue.status}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#047857', display: 'flex', gap: 16 }}>
                    <span>🐾 {activeQueue.petName}</span>
                    <span>📋 {activeQueue.service}</span>
                    <span>⏰ {activeQueue.registeredTime}</span>
                  </div>
                </div>
              )}

              {/* Upcoming Appointments */}
              <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 20, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>📅 Janji Temu Terdekat</h3>
                  <button onClick={() => navigate('/member/janji')} style={{
                    fontSize: '0.75rem', fontWeight: 600, color: '#16a34a', background: '#F0FDF4',
                    border: '1px solid #BBF7D0', padding: '4px 12px', borderRadius: 9999, cursor: 'pointer',
                  }}>
                    + Buat Baru
                  </button>
                </div>
                {appointments.length === 0 ? (
                  <div style={{ padding: '16px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>📅</div>
                    Belum ada janji temu. Booking sekarang!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {appointments.map((appt) => {
                      const dp = getApptDateParts(appt.date);
                      return (
                        <div key={appt.id} style={{
                          display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 12,
                          background: '#f8fafc', border: '1px solid #f1f5f9', alignItems: 'center', cursor: 'pointer',
                        }}
                          onClick={() => navigate('/member/janji')}
                          onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                          onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                        >
                          <div style={{
                            width: 40, height: 40, borderRadius: 10, background: '#16a34a',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>{dp.day}</div>
                            <div style={{ fontSize: '0.5rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' }}>{dp.month}</div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>{appt.service} — {appt.petName}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
                              {appt.time} WIB · {appt.doctor}
                            </div>
                          </div>
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 700, padding: '2px 10px', borderRadius: 9999,
                            background: appt.status === 'Dikonfirmasi' ? '#F0FDF4' : '#FFF4E6',
                            color: appt.status === 'Dikonfirmasi' ? '#16a34a' : '#f76707',
                          }}>
                            {appt.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pending Bills */}
              <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 20, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>🧾 Tagihan Menunggu</h3>
                  <button onClick={() => navigate('/member/tagihan')} style={{
                    fontSize: '0.75rem', fontWeight: 600, color: '#0ca678', background: '#F0FDF4',
                    border: '1px solid #BBF7D0', padding: '4px 12px', borderRadius: 9999, cursor: 'pointer',
                  }}>
                    Lihat Semua
                  </button>
                </div>
                {bills.length === 0 ? (
                  <div style={{ padding: '16px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>✅</div>
                    Tidak ada tagihan yang belum dibayar.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {bills.map((bill) => (
                      <div key={bill.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 14px', borderRadius: 10, background: '#FFF7ED', border: '1px solid #FED7AA',
                      }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>{bill.service}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>
                            {bill.invoiceNo} · {formatDate(bill.date)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ea580c' }}>{formatRupiah(bill.amount)}</div>
                          <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#ea580c', background: '#FFF7ED', padding: '1px 8px', borderRadius: 9999 }}>
                            {bill.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tier Benefits */}
              <div style={{ background: 'white', borderRadius: 16, padding: 24, border: `1px solid ${tierConfig.light}` }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>
                  {tierConfig.icon} Keuntungan Member {currentTier}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {tierConfig.benefits.map((b, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#475569' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={tierConfig.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {b}
                    </li>
                  ))}
                </ul>

                {nextTierConfig && (
                  <div style={{ marginTop: 16, padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>TIER BERIKUTNYA</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: '1.3rem' }}>{nextTierConfig.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>Member {nextTier}</span>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {nextTierConfig.benefits.map((b, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#64748b' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── FAQ ── */}
          <div className="scroll-animate animate-in" style={{ marginTop: 40, animationDelay: '0.4s' }}>
            <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>❓ Pertanyaan Umum</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {[
                  { q: 'Bagaimana cara mendapatkan poin?', a: 'Setiap transaksi Rp10.000 akan menghasilkan 1 poin. Poin otomatis ditambahkan saat transaksi selesai.' },
                  { q: 'Apakah poin bisa hangus?', a: 'Poin tidak akan hangus selama akun Anda aktif. Lakukan setidaknya 1 transaksi setiap 12 bulan.' },
                  { q: 'Kapan tier saya naik?', a: 'Tier naik otomatis saat poin mencapai batas: 500 poin untuk Silver, 1000 poin untuk Gold.' },
                  { q: 'Bagaimana cara booking janji?', a: 'Klik tombol "Buat Janji Temu" di atas atau buka menu Janji Temu di sidebar. Pilih layanan, dokter, dan jadwal yang diinginkan.' },
                ].map((faq, i) => (
                  <div key={i} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>{faq.q}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6 }}>{faq.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <GuestFooter />
    </div>
  );
}
