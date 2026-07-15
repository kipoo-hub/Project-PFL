import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { supabase } from '../../lib/supabase';
import { jadwalService, queueService, billService } from '../../lib/supabaseService';
import GuestNavbar from '../guest/components/GuestNavbar';
import GuestFooter from '../guest/components/GuestFooter';
import '../guest/guest.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
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
  Bronze: {
    color: '#b45309', bg: '#fef3c7', accent: '#d97706', icon: '🥉',
    gradient: 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #d97706 100%)',
    benefits: ['Akses dasar fitur member', 'Riwayat medis digital', 'Booking janji online'],
  },
  Silver: {
    color: '#475569', bg: '#f1f5f9', accent: '#64748b', icon: '🥈',
    gradient: 'linear-gradient(135deg, #334155 0%, #64748b 50%, #94a3b8 100%)',
    benefits: ['Semua fitur Bronze', 'Diskon 10% layanan', 'Prioritas booking', 'Chat dokter gratis'],
  },
  Gold: {
    color: '#854d0e', bg: '#fef9c3', accent: '#ca8a04', icon: '🥇',
    gradient: 'linear-gradient(135deg, #78350f 0%, #ca8a04 50%, #fbbf24 100%)',
    benefits: ['Semua fitur Silver', 'Diskon 20% layanan', 'Grooming gratis per 6 bulan', 'Vaksinasi tahunan gratis', 'Prioritas respon chat'],
  },
};

const getTier = (points) => points >= 1000 ? 'Gold' : points >= 500 ? 'Silver' : 'Bronze';
const getNextTier = (t) => t === 'Bronze' ? 'Silver' : t === 'Silver' ? 'Gold' : null;
const getPointsToNext = (points, t) => t === 'Bronze' ? 500 - points : t === 'Silver' ? 1000 - points : 0;
const getProgress = (points, t) =>
  t === 'Bronze' ? Math.min(100, (points / 500) * 100) :
  t === 'Silver' ? Math.min(100, ((points - 500) / 500) * 100) : 100;

// ─── Quick Action ─────────────────────────────────────────────────────────────
const QuickAction = ({ icon, label, desc, onClick, color }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        gap: 10, padding: '18px 16px',
        background: hovered ? `${color}10` : 'white',
        borderRadius: 16, border: `1.5px solid ${hovered ? color : '#e8edf3'}`,
        cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left', width: '100%',
        boxShadow: hovered ? `0 6px 20px ${color}20` : '0 1px 4px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: `${color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.83rem', fontWeight: 700, color: '#1e293b', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>{desc}</div>
      </div>
    </button>
  );
};

// ─── Section Title ────────────────────────────────────────────────────────────
const SectionTitle = ({ children, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{children}</h3>
    {action}
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ emoji, text }) => (
  <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8' }}>
    <div style={{ fontSize: '2rem', marginBottom: 8 }}>{emoji}</div>
    <div style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>{text}</div>
  </div>
);

// ─── Pill Button ──────────────────────────────────────────────────────────────
const PillBtn = ({ label, onClick, color = '#16a34a', bg = '#f0fdf4', border = '#bbf7d0' }) => (
  <button onClick={onClick} style={{
    fontSize: '0.73rem', fontWeight: 600, color, background: bg,
    border: `1px solid ${border}`, padding: '4px 14px', borderRadius: 9999, cursor: 'pointer',
  }}>
    {label}
  </button>
);

// ─── Card Wrapper ─────────────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{
    background: 'white', borderRadius: 18, padding: 24,
    border: '1px solid #edf2f7',
    boxShadow: '0 1px 6px rgba(15,23,42,0.05)',
    ...style,
  }}>
    {children}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MemberMembership() {
  const { member } = useMemberAuth();
  const navigate = useNavigate();

  const [profile, setProfile]         = useState(null);
  const [pointHistory, setPointHistory] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills]             = useState([]);
  const [activeQueue, setActiveQueue] = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!member?.id) return;
      setLoading(true);
      try {
        const [profileData, points] = await Promise.all([
          supabase.from('profiles').select('*').eq('user_id', member.id).single(),
          supabase.from('point_transactions').select('*').eq('user_id', member.id)
            .order('created_at', { ascending: false }).limit(5),
        ]);
        if (profileData.data) setProfile(profileData.data);
        setPointHistory(points.data || []);

        const appts = await jadwalService.getByMemberId(member.id);
        setAppointments(
          (appts || []).filter(a => a.status === 'Menunggu' || a.status === 'Dikonfirmasi').slice(0, 3)
        );

        const memberUser = JSON.parse(localStorage.getItem('memberUser') || '{}');
        const email = memberUser.email || member.email;
        const billsData = await billService.getByMemberId(member.id);
        setBills((billsData || []).filter(b => b.status === 'Belum Dibayar').slice(0, 3));

        const queues = await queueService.getByEmail(email);
        setActiveQueue((queues || []).find(q => q.status === 'Menunggu' || q.status === 'Dipanggil') || null);
      } catch (err) {
        console.error('Error fetching membership data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [member?.id]);

  const points        = profile?.total_poin ?? 0;
  const currentTier   = profile?.tier || getTier(points);
  const tierCfg       = TIER_CONFIG[currentTier] || TIER_CONFIG.Bronze;
  const nextTier      = getNextTier(currentTier);
  const nextTierCfg   = nextTier ? TIER_CONFIG[nextTier] : null;
  const pointsToNext  = getPointsToNext(points, currentTier);
  const progress      = getProgress(points, currentTier);

  const getName = () => {
    try { return JSON.parse(localStorage.getItem('memberUser') || '{}').name || member?.name || profile?.name || 'Member'; }
    catch (_) { return member?.name || 'Member'; }
  };
  const getEmail = () => {
    try { return JSON.parse(localStorage.getItem('memberUser') || '{}').email || member?.email || ''; }
    catch (_) { return member?.email || ''; }
  };
  const name  = getName();
  const email = getEmail();

  if (loading) return (
    <div className="guest-page">
      <GuestNavbar />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, border: '4px solid #16a34a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: '#64748b', fontSize: '0.88rem' }}>Memuat data membership…</span>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <GuestFooter />
    </div>
  );

  return (
    <div className="guest-page">
      <GuestNavbar />

      <main style={{ paddingTop: 96, paddingBottom: 80, background: '#f4f7fc', minHeight: '60vh' }}>
        <div className="guest-container">

          {/* ── Hero Header ─────────────────────────────────────────────── */}
          <div style={{
            background: 'white', borderRadius: 20, padding: '28px 32px', marginBottom: 24,
            border: '1px solid #edf2f7', boxShadow: '0 2px 12px rgba(15,23,42,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 16,
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#16a34a', marginBottom: 6 }}>
                Member Area 🐾
              </div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                Halo, {name.split(' ')[0]}!
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                Kelola membership, pantau janji temu, dan nikmati berbagai keuntungan member.
              </p>
            </div>
            {/* Tier Badge */}
            <div style={{
              background: tierCfg.gradient, color: 'white',
              borderRadius: 16, padding: '12px 20px',
              display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              minWidth: 160,
            }}>
              <span style={{ fontSize: '1.8rem' }}>{tierCfg.icon}</span>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Member Tier</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{currentTier}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.85, marginTop: 1 }}>{points.toLocaleString('id-ID')} poin</div>
              </div>
            </div>
          </div>

          {/* ── Active Queue Alert ───────────────────────────────────────── */}
          {activeQueue && (
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              border: '1.5px solid #86efac',
              borderRadius: 16, padding: '16px 22px', marginBottom: 24,
              display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
              boxShadow: '0 2px 10px rgba(22,163,74,0.12)',
            }}>
              <div style={{ fontSize: '2rem' }}>🔔</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.9rem' }}>
                  Antrian Aktif — Nomor <span style={{ fontSize: '1.1rem' }}>{activeQueue.queueNumber}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#15803d', marginTop: 2 }}>
                  🐾 {activeQueue.petName} &nbsp;·&nbsp; 📋 {activeQueue.service} &nbsp;·&nbsp; ⏰ {activeQueue.registeredTime}
                </div>
              </div>
              <span style={{
                background: '#16a34a', color: 'white',
                padding: '4px 14px', borderRadius: 9999,
                fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap',
              }}>
                {activeQueue.status}
              </span>
            </div>
          )}

          {/* ── Quick Actions ────────────────────────────────────────────── */}
          <Card style={{ marginBottom: 24 }}>
            <SectionTitle>⚡ Aksi Cepat</SectionTitle>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
            }}>
              <QuickAction icon="📅" label="Buat Janji Temu"     desc="Booking layanan dokter hewan"      onClick={() => navigate('/member/janji')}   color="#3b5bdb" />
              <QuickAction icon="🔢" label="Ambil Antrian"        desc="Daftar antrian kunjungan langsung" onClick={() => navigate('/member/antrian')} color="#16a34a" />
              <QuickAction icon="🐾" label="Tambah Hewan"         desc="Daftarkan hewan peliharaan baru"   onClick={() => navigate('/member/hewan')}   color="#f76707" />
              <QuickAction icon="💬" label="Chat Dokter"          desc="Konsultasi via chat langsung"       onClick={() => navigate('/member/chat')}    color="#7048e8" />
              <QuickAction icon="🎫" label="Buat Tiket Keluhan"   desc="Laporkan masalah atau komplain"    onClick={() => navigate('/member/tiket')}   color="#e03131" />
              <QuickAction icon="🧾" label="Lihat Tagihan"        desc="Cek riwayat & status pembayaran"   onClick={() => navigate('/member/tagihan')} color="#0ca678" />
            </div>
          </Card>

          {/* ── Main Grid ───────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20, alignItems: 'start' }}>

            {/* ── LEFT COLUMN ─────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Points Progress Card */}
              <div style={{
                background: 'white', borderRadius: 18, overflow: 'hidden',
                border: '1px solid #edf2f7', boxShadow: '0 1px 6px rgba(15,23,42,0.05)',
              }}>
                {/* Gradient Top Strip */}
                <div style={{ background: tierCfg.gradient, padding: '20px 24px 28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                        Bergabung {formatDate(profile?.created_at)}
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>{name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{email}</div>
                    </div>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: 'rgba(255,255,255,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.7rem',
                    }}>
                      {tierCfg.icon}
                    </div>
                  </div>
                  {/* Points Big Number */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Total Poin</div>
                    <div style={{ fontSize: '3.2rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{points.toLocaleString('id-ID')}</div>
                  </div>
                </div>

                {/* Progress Bar Section */}
                <div style={{ padding: '20px 24px' }}>
                  {nextTier ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
                          {nextTierCfg.icon} Menuju {nextTier}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#1e293b', fontWeight: 700 }}>
                          {pointsToNext.toLocaleString('id-ID')} poin lagi
                        </span>
                      </div>
                      <div style={{ height: 8, background: '#f1f5f9', borderRadius: 8, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 8,
                          background: `linear-gradient(90deg, ${tierCfg.color}, ${nextTierCfg.accent})`,
                          width: `${progress}%`, transition: 'width 1s ease',
                        }} />
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 8, textAlign: 'center' }}>
                        💳 Setiap transaksi Rp10.000 = 1 poin
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '8px 0' }}>
                      <span style={{ fontSize: '0.85rem', color: tierCfg.color, fontWeight: 700 }}>
                        🏆 Anda telah mencapai tier tertinggi!
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Benefits Card */}
              <Card>
                <SectionTitle>{tierCfg.icon} Keuntungan Member {currentTier}</SectionTitle>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 0 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {tierCfg.benefits.map((b, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.83rem', color: '#334155' }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: 6,
                        background: `${tierCfg.color}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={tierCfg.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      {b}
                    </li>
                  ))}
                </ul>

                {nextTierCfg && (
                  <div style={{ marginTop: 16, padding: '14px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                      Bonus Tier Berikutnya — {nextTierCfg.icon} {nextTier}
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {nextTierCfg.benefits.map((b, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#64748b' }}>
                          <div style={{ width: 16, height: 16, borderRadius: 4, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>

              {/* How to Get Points */}
              <Card>
                <SectionTitle>💡 Cara Mendapatkan Poin</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { icon: '💳', label: 'Transaksi',          desc: 'Setiap Rp10.000 = 1 poin',           color: '#16a34a' },
                    { icon: '🎉', label: 'Bonus Registrasi',   desc: 'Dapatkan 50 poin saat mendaftar',      color: '#3b5bdb' },
                    { icon: '🎂', label: 'Ulang Tahun Hewan',  desc: 'Bonus 25 poin di hari spesial',        color: '#f76707' },
                    { icon: '👥', label: 'Referral',            desc: 'Ajak teman, dapatkan 100 poin',       color: '#7048e8' },
                  ].map((item) => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: `${item.color}12`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0,
                      }}>
                        {item.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>{item.label}</div>
                        <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: 1 }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* ── RIGHT COLUMN ────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Upcoming Appointments */}
              <Card>
                <SectionTitle action={<PillBtn label="+ Buat Baru" onClick={() => navigate('/member/janji')} />}>
                  📅 Janji Temu Terdekat
                </SectionTitle>
                {appointments.length === 0 ? (
                  <EmptyState emoji="📅" text="Belum ada janji temu mendatang. Booking sekarang!" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {appointments.map((appt) => {
                      const dp = getApptDateParts(appt.date);
                      return (
                        <div key={appt.id}
                          onClick={() => navigate('/member/janji')}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 14,
                            padding: '12px 14px', borderRadius: 12,
                            background: '#f8fafc', border: '1px solid #edf2f7',
                            cursor: 'pointer', transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                          onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                        >
                          <div style={{
                            width: 44, height: 44, borderRadius: 12, background: '#16a34a',
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', flexShrink: 0,
                          }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>{dp.day}</div>
                            <div style={{ fontSize: '0.5rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' }}>{dp.month}</div>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.83rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {appt.service} — {appt.petName}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
                              {appt.time} WIB · {appt.doctor}
                            </div>
                          </div>
                          <span style={{
                            flexShrink: 0, fontSize: '0.65rem', fontWeight: 700,
                            padding: '3px 10px', borderRadius: 9999,
                            background: appt.status === 'Dikonfirmasi' ? '#f0fdf4' : '#fff4e6',
                            color: appt.status === 'Dikonfirmasi' ? '#16a34a' : '#f76707',
                            border: `1px solid ${appt.status === 'Dikonfirmasi' ? '#bbf7d0' : '#fed7aa'}`,
                          }}>
                            {appt.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* Pending Bills */}
              <Card>
                <SectionTitle action={<PillBtn label="Lihat Semua" onClick={() => navigate('/member/tagihan')} color="#0ca678" bg="#f0fdf4" border="#a7f3d0" />}>
                  🧾 Tagihan Belum Dibayar
                </SectionTitle>
                {bills.length === 0 ? (
                  <EmptyState emoji="✅" text="Tidak ada tagihan yang perlu dibayar. Semua beres!" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {bills.map((bill) => (
                      <div key={bill.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 16px', borderRadius: 12,
                        background: '#fff7ed', border: '1px solid #fed7aa',
                      }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {bill.service}
                          </div>
                          <div style={{ fontSize: '0.71rem', color: '#64748b', marginTop: 2 }}>
                            {bill.invoiceNo} · {formatDate(bill.date)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ea580c' }}>{formatRupiah(bill.amount)}</div>
                          <span style={{
                            fontSize: '0.62rem', fontWeight: 700, color: '#ea580c',
                            background: '#fff7ed', border: '1px solid #fed7aa',
                            padding: '1px 8px', borderRadius: 9999,
                          }}>
                            {bill.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Point History */}
              <Card>
                <SectionTitle>📊 Riwayat Poin Terbaru</SectionTitle>
                {pointHistory.length === 0 ? (
                  <EmptyState emoji="🏁" text="Belum ada riwayat poin. Mulai bertransaksi untuk mengumpulkan poin!" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {pointHistory.map((pt) => (
                      <div key={pt.id} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px', borderRadius: 10,
                        background: pt.jenis === 'earn' ? '#f0fdf4' : '#fef2f2',
                        border: `1px solid ${pt.jenis === 'earn' ? '#bbf7d0' : '#fecaca'}`,
                      }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: pt.jenis === 'earn' ? '#16a34a20' : '#dc262620',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0,
                        }}>
                          {pt.jenis === 'earn' ? '➕' : '➖'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {pt.keterangan || pt.sumber}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 1 }}>
                            {formatDate(pt.created_at)}{pt.nominal_transaksi > 0 && ` · ${formatRupiah(pt.nominal_transaksi)}`}
                          </div>
                        </div>
                        <div style={{
                          fontSize: '0.92rem', fontWeight: 800, flexShrink: 0,
                          color: pt.jenis === 'earn' ? '#16a34a' : '#dc2626',
                        }}>
                          {pt.jenis === 'earn' ? '+' : '-'}{pt.poin}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* ── FAQ ─────────────────────────────────────────────────────── */}
          <Card style={{ marginTop: 24 }}>
            <SectionTitle>❓ Pertanyaan Umum</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { q: 'Bagaimana cara mendapatkan poin?',
                  a: 'Setiap transaksi Rp10.000 akan menghasilkan 1 poin. Poin otomatis ditambahkan saat transaksi selesai.' },
                { q: 'Apakah poin bisa hangus?',
                  a: 'Poin tidak akan hangus selama akun Anda aktif. Lakukan minimal 1 transaksi setiap 12 bulan.' },
                { q: 'Kapan tier saya naik?',
                  a: 'Tier naik otomatis saat poin mencapai batas: 500 poin untuk Silver, 1000 poin untuk Gold.' },
                { q: 'Bagaimana cara booking janji?',
                  a: 'Klik "Buat Janji Temu" di atas atau buka menu Janji Temu. Pilih layanan, dokter, dan jadwal yang Anda inginkan.' },
              ].map((faq, i) => (
                <div key={i} style={{
                  padding: '14px 18px', background: '#f8fafc',
                  borderRadius: 12, border: '1px solid #edf2f7',
                }}>
                  <div style={{ fontSize: '0.83rem', fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>{faq.q}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.6 }}>{faq.a}</div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </main>

      <GuestFooter />
    </div>
  );
}
