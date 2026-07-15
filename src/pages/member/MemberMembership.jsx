import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { supabase } from '../../lib/supabase';
import { jadwalService, queueService, billService, pasienService, ticketService } from '../../lib/supabaseService';
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

  // New States for QuickActions
  const [pets, setPets] = useState([]);
  const [allBills, setAllBills] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [openQueueModal, setOpenQueueModal] = useState(false);
  const [openTicketModal, setOpenTicketModal] = useState(false);
  const [openBillsModal, setOpenBillsModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  // Modal forms
  const [queueForm, setQueueForm] = useState({ petName: '', service: 'Pemeriksaan Umum' });
  const [ticketForm, setTicketForm] = useState({ title: '', petName: '', category: 'Medis', urgency: 'Sedang', description: '' });
  const [replyMessage, setReplyMessage] = useState('');

  const fetchTickets = async () => {
    const memberUser = JSON.parse(localStorage.getItem('memberUser') || '{}');
    const email = memberUser.email || member?.email;
    if (!email) return;
    try {
      const ticketsData = await ticketService.getByEmail(email);
      setTickets(ticketsData || []);
      if (selectedTicket) {
        const updated = (ticketsData || []).find(t => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (e) {
      console.error('Error fetching tickets:', e);
    }
  };

  const fetchQueuesAndBills = async () => {
    if (!member?.id) return;
    const memberUser = JSON.parse(localStorage.getItem('memberUser') || '{}');
    const email = memberUser.email || member.email;
    try {
      const [queues, billsData] = await Promise.all([
        queueService.getByEmail(email),
        billService.getByMemberId(member.id)
      ]);
      setActiveQueue((queues || []).find(q => q.status === 'Menunggu' || q.status === 'Dipanggil') || null);
      setBills((billsData || []).filter(b => b.status === 'Belum Dibayar').slice(0, 3));
      setAllBills(billsData || []);
    } catch (e) {
      console.error('Error fetching queues and bills:', e);
    }
  };

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
        setAllBills(billsData || []);

        const queues = await queueService.getByEmail(email);
        setActiveQueue((queues || []).find(q => q.status === 'Menunggu' || q.status === 'Dipanggil') || null);

        // Load pets
        const petsData = await pasienService.getByMemberId(member.id);
        setPets(petsData || []);
        if (petsData?.length > 0) {
          setQueueForm(prev => ({ ...prev, petName: petsData[0].nama }));
          setTicketForm(prev => ({ ...prev, petName: petsData[0].nama }));
        }

        // Load tickets
        const ticketsData = await ticketService.getByEmail(email);
        setTickets(ticketsData || []);
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

  const handleCreateQueue = async (e) => {
    e.preventDefault();
    if (!queueForm.petName) {
      alert('Pilih hewan peliharaan terlebih dahulu.');
      return;
    }
    const memberUser = JSON.parse(localStorage.getItem('memberUser') || '{}');
    const emailStr = memberUser.email || member?.email || email;
    try {
      setLoading(true);
      await queueService.add({
        ownerName: name,
        email: emailStr,
        petName: queueForm.petName,
        service: queueForm.service,
        type: 'Datang Sekarang'
      });
      setOpenQueueModal(false);
      await fetchQueuesAndBills();
      alert('Nomor antrian berhasil diambil!');
    } catch (err) {
      console.error('Error creating queue:', err);
      alert('Gagal mengambil antrian.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!ticketForm.title.trim() || !ticketForm.description.trim()) {
      alert('Harap isi subjek dan deskripsi keluhan.');
      return;
    }
    const memberUser = JSON.parse(localStorage.getItem('memberUser') || '{}');
    const emailStr = memberUser.email || member?.email || email;
    try {
      setLoading(true);
      const newTicket = await ticketService.create({
        petName: ticketForm.petName || 'Tidak Ada',
        ownerName: name,
        email: emailStr,
        category: ticketForm.category,
        title: ticketForm.title,
        urgency: ticketForm.urgency,
        description: ticketForm.description
      });
      if (newTicket) {
        setTicketForm({ title: '', petName: pets[0]?.nama || '', category: 'Medis', urgency: 'Sedang', description: '' });
        setIsCreatingTicket(false);
        await fetchTickets();
        alert('Tiket bantuan berhasil dibuat!');
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
      alert('Gagal membuat tiket keluhan.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTicketReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;
    try {
      const success = await ticketService.reply(
        selectedTicket.id,
        replyMessage,
        'member',
        name
      );
      if (success) {
        setReplyMessage('');
        await fetchTickets();
      } else {
        alert('Gagal mengirim pesan.');
      }
    } catch (err) {
      console.error('Error replying to ticket:', err);
      alert('Gagal membalas tiket.');
    }
  };

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
      <style>{`
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

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
              <QuickAction icon="📅" label="Buat Janji Temu"     desc="Booking layanan dokter hewan"      onClick={() => navigate('/member/janji', { state: { openBookingModal: true } })}   color="#3b5bdb" />
              <QuickAction icon="🔢" label="Ambil Antrian"        desc="Daftar antrian kunjungan langsung" onClick={() => setOpenQueueModal(true)} color="#16a34a" />
              <QuickAction icon="🐾" label="Tambah Hewan"         desc="Daftarkan hewan peliharaan baru"   onClick={() => navigate('/member/hewan', { state: { openAddModal: true } })}   color="#f76707" />
              <QuickAction icon="💬" label="Chat Dokter"          desc="Konsultasi via chat langsung"       onClick={() => navigate('/member/chat')}    color="#7048e8" />
              <QuickAction icon="🎫" label="Buat Tiket Keluhan"   desc="Laporkan masalah atau komplain"    onClick={() => { setOpenTicketModal(true); setIsCreatingTicket(true); }}   color="#e03131" />
              <QuickAction icon="🧾" label="Lihat Tagihan"        desc="Cek riwayat & status pembayaran"   onClick={() => setOpenBillsModal(true)} color="#0ca678" />
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
                <SectionTitle action={<PillBtn label="Lihat Semua" onClick={() => setOpenBillsModal(true)} color="#0ca678" bg="#f0fdf4" border="#a7f3d0" />}>
                  🧾 Tagihan Belum Dibayar
                </SectionTitle>
                {bills.length === 0 ? (
                  <EmptyState emoji="✅" text="Tidak ada tagihan yang perlu dibayar. Semua beres!" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {bills.map((bill) => (
                      <div 
                        key={bill.id} 
                        onClick={() => { setSelectedBill(bill); setOpenBillsModal(true); }}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '12px 16px', borderRadius: 12,
                          background: '#fff7ed', border: '1px solid #fed7aa',
                          cursor: 'pointer', transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#ffedd5'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff7ed'}
                      >
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

      {/* ── Modal Ambil Antrian ── */}
      {openQueueModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={() => setOpenQueueModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }} />
          <div style={{ position: 'relative', zIndex: 10, background: 'white', borderRadius: 20, width: '100%', maxWidth: 460, padding: 28, boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', animation: 'scaleUp 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.5rem' }}>🔢</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Ambil Nomor Antrian</h3>
              </div>
              <button onClick={() => setOpenQueueModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>
            
            <form onSubmit={handleCreateQueue} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: 6 }}>Pilih Hewan Peliharaan</label>
                {pets.length === 0 ? (
                  <div style={{ padding: '12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, fontSize: '0.78rem', color: '#b45309' }}>
                    Belum ada hewan terdaftar. Silakan tambah hewan terlebih dahulu.
                  </div>
                ) : (
                  <select 
                    value={queueForm.petName} 
                    onChange={e => setQueueForm(prev => ({ ...prev, petName: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '0.85rem', outline: 'none' }}
                  >
                    {pets.map(p => (
                      <option key={p.id} value={p.nama}>{p.nama} ({p.spesies})</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: 6 }}>Jenis Layanan</label>
                <select 
                  value={queueForm.service} 
                  onChange={e => setQueueForm(prev => ({ ...prev, service: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="Pemeriksaan Umum">🩺 Pemeriksaan Umum</option>
                  <option value="Vaksinasi">💉 Vaksinasi</option>
                  <option value="Grooming">✂️ Grooming</option>
                  <option value="Tindakan Medis / Bedah">🩹 Tindakan Medis / Bedah</option>
                  <option value="Penitipan Hewan">Penitipan Hewan</option>
                </select>
              </div>

              <div style={{ padding: '12px 14px', background: '#eff6ff', borderRadius: 12, border: '1px solid #bfdbfe', fontSize: '0.78rem', color: '#1e3a8a', lineHeight: 1.5 }}>
                ℹ️ <strong>Informasi:</strong> Antrian ini bersifat <em>real-time</em> ("Datang Sekarang"). Mohon segera menuju klinik setelah mengambil nomor antrian.
              </div>

              <button 
                type="submit" 
                disabled={pets.length === 0} 
                style={{ 
                  width: '100%', padding: '12px', background: pets.length === 0 ? '#cbd5e1' : '#16a34a', 
                  color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '0.88rem', 
                  cursor: pets.length === 0 ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
                  boxShadow: pets.length === 0 ? 'none' : '0 4px 14px rgba(22,163,74,0.3)' 
                }}
              >
                Konfirmasi & Ambil Nomor Antrian
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Tiket Keluhan ── */}
      {openTicketModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={() => setOpenTicketModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }} />
          <div style={{ position: 'relative', zIndex: 10, background: 'white', borderRadius: 20, width: '100%', maxWidth: 840, height: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', overflow: 'hidden', animation: 'scaleUp 0.3s ease' }}>
            
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.5rem' }}>🎫</span>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Pusat Bantuan & Tiket Keluhan</h3>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>Hubungi customer service dan sampaikan kendala Anda.</div>
                </div>
              </div>
              <button onClick={() => setOpenTicketModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            {/* Split Content */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              
              {/* Left Column: Ticket List */}
              <div style={{ width: 280, borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
                <div style={{ padding: 14, borderBottom: '1px solid #edf2f7' }}>
                  <button 
                    onClick={() => { setIsCreatingTicket(true); setSelectedTicket(null); }}
                    style={{ width: '100%', padding: '9px', background: '#e03131', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(224,49,49,0.2)' }}
                  >
                    ＋ Buat Tiket Baru
                  </button>
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {tickets.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: '0.78rem' }}>
                      Belum ada riwayat tiket bantuan.
                    </div>
                  ) : (
                    tickets.map(t => {
                      const isActive = selectedTicket?.id === t.id && !isCreatingTicket;
                      const statusColors = {
                        'Baru': { bg: '#e0f2fe', color: '#0369a1' },
                        'Dalam Proses': { bg: '#fef3c7', color: '#d97706' },
                        'Selesai': { bg: '#dcfce7', color: '#15803d' }
                      }[t.status] || { bg: '#f1f5f9', color: '#475569' };

                      return (
                        <div 
                          key={t.id} 
                          onClick={() => { setSelectedTicket(t); setIsCreatingTicket(false); }}
                          style={{ 
                            padding: 12, borderRadius: 12, border: '1px solid #edf2f7', cursor: 'pointer',
                            background: isActive ? 'white' : 'transparent', 
                            boxShadow: isActive ? '0 4px 10px rgba(0,0,0,0.04)' : 'none',
                            transition: 'all 0.15s'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94a3b8' }}>#{t.id.slice(0, 8)}</span>
                            <span style={{ fontSize: '0.6rem', fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: statusColors.bg, color: statusColors.color }}>{t.status}</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 }}>{t.title}</div>
                          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Kategori: {t.category} · {t.createdAt}</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Detail or Create Form */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
                {isCreatingTicket ? (
                  /* Form Pembuatan Tiket Baru */
                  <form onSubmit={handleCreateTicket} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', flex: 1 }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>Kirim Tiket Keluhan Baru</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 5 }}>Hewan Terkait</label>
                        <select 
                          value={ticketForm.petName} 
                          onChange={e => setTicketForm(prev => ({ ...prev, petName: e.target.value }))}
                          style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '0.8rem', outline: 'none' }}
                        >
                          <option value="Tidak Ada">Tidak Ada Hewan</option>
                          {pets.map(p => <option key={p.id} value={p.nama}>{p.nama}</option>)}
                        </select>
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 5 }}>Kategori Masalah</label>
                        <select 
                          value={ticketForm.category} 
                          onChange={e => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
                          style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '0.8rem', outline: 'none' }}
                        >
                          <option value="Medis">Masalah Medis / Dokter</option>
                          <option value="Keuangan">Pembayaran & Tagihan</option>
                          <option value="Pelayanan">Sikap / Kualitas Staf</option>
                          <option value="Fasilitas">Fasilitas & Kebersihan</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 5 }}>Subjek Keluhan</label>
                        <input 
                          type="text" required placeholder="Contoh: Kesalahan nominal invoice"
                          value={ticketForm.title} onChange={e => setTicketForm(prev => ({ ...prev, title: e.target.value }))}
                          style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 5 }}>Tingkat Urgensi</label>
                        <select 
                          value={ticketForm.urgency} 
                          onChange={e => setTicketForm(prev => ({ ...prev, urgency: e.target.value }))}
                          style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '0.8rem', outline: 'none' }}
                        >
                          <option value="Rendah">Rendah</option>
                          <option value="Sedang">Sedang</option>
                          <option value="Tinggi">Tinggi</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 5 }}>Deskripsi Detail Masalah</label>
                      <textarea 
                        rows={4} required placeholder="Tuliskan secara lengkap detail masalah, kronologi, serta ekspektasi solusi Anda..."
                        value={ticketForm.description} onChange={e => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '0.8rem', outline: 'none', resize: 'vertical', lineHeight: 1.5, boxSizing: 'border-box' }}
                      />
                    </div>

                    <button 
                      type="submit" 
                      style={{ 
                        marginTop: 10, padding: '12px', background: '#e03131', color: 'white', border: 'none', 
                        borderRadius: 12, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', 
                        boxShadow: '0 4px 14px rgba(224,49,49,0.3)', transition: 'background 0.2s' 
                      }}
                    >
                      Kirim Tiket Keluhan
                    </button>
                  </form>
                ) : selectedTicket ? (
                  /* Tampilan Detail Tiket & Chatbox Percakapan */
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Header Detail Tiket */}
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>{selectedTicket.title}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
                            Kategori: <strong>{selectedTicket.category}</strong> &nbsp;·&nbsp; Urgensi: <strong style={{ color: selectedTicket.urgency === 'Tinggi' ? '#e03131' : '#d97706' }}>{selectedTicket.urgency}</strong> &nbsp;·&nbsp; Pasien: <strong>{selectedTicket.petName}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chat Area */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {(selectedTicket.conversations || []).map((msg, idx) => {
                        const isAdmin = msg.role === 'admin';
                        return (
                          <div 
                            key={msg.id || idx} 
                            style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: isAdmin ? 'flex-start' : 'flex-end',
                              maxWidth: '75%',
                              alignSelf: isAdmin ? 'flex-start' : 'flex-end'
                            }}
                          >
                            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', marginBottom: 4, padding: '0 4px' }}>
                              {isAdmin ? msg.senderName : 'Anda'}
                            </div>
                            <div 
                              style={{ 
                                padding: '10px 14px', 
                                borderRadius: 14, 
                                fontSize: '0.8rem', 
                                lineHeight: 1.5,
                                background: isAdmin ? '#f1f5f9' : '#e03131',
                                color: isAdmin ? '#1e293b' : 'white',
                                borderTopLeftRadius: isAdmin ? 0 : 14,
                                borderTopRightRadius: isAdmin ? 14 : 0
                              }}
                            >
                              {msg.message}
                            </div>
                            <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: 4, padding: '0 4px' }}>
                              {msg.time}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Chat Input */}
                    {selectedTicket.status !== 'Selesai' ? (
                      <form onSubmit={handleSendTicketReply} style={{ padding: 14, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10, background: 'white' }}>
                        <input 
                          type="text" required placeholder="Tulis balasan pesan Anda di sini..."
                          value={replyMessage} onChange={e => setReplyMessage(e.target.value)}
                          style={{ flex: 1, padding: '10px 16px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: '0.82rem', outline: 'none' }}
                        />
                        <button 
                          type="submit" 
                          style={{ padding: '0 18px', background: '#e03131', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                          Kirim ➔
                        </button>
                      </form>
                    ) : (
                      <div style={{ padding: 16, background: '#f0fdf4', borderTop: '1px solid #bbf7d0', textAlign: 'center', fontSize: '0.78rem', color: '#15803d', fontWeight: 600 }}>
                        🔒 Tiket keluhan ini telah diselesaikan. Anda tidak dapat mengirim balasan lagi.
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', padding: 24, textAlign: 'center' }}>
                    <span style={{ fontSize: '3rem', marginBottom: 10 }}>🎫</span>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Pilih salah satu tiket keluhan di sebelah kiri atau buat tiket bantuan baru.</div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ── Modal Riwayat & Detail Tagihan ── */}
      {openBillsModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={() => { setOpenBillsModal(false); setSelectedBill(null); }} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }} />
          <div style={{ position: 'relative', zIndex: 10, background: 'white', borderRadius: 20, width: '100%', maxWidth: selectedBill ? 720 : 540, transition: 'all 0.3s ease', display: 'flex', overflow: 'hidden', maxHeight: '82vh', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', animation: 'scaleUp 0.3s ease' }}>
            
            {/* Daftar Tagihan */}
            <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', minWidth: 280, maxHeight: '82vh' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.4rem' }}>🧾</span>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Daftar Tagihan Anda</h3>
                </div>
                {!selectedBill && <button onClick={() => setOpenBillsModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>}
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {allBills.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8', fontSize: '0.82rem' }}>
                    Tidak ada riwayat tagihan terdaftar.
                  </div>
                ) : (
                  allBills.map(bill => {
                    const isSelected = selectedBill?.id === bill.id;
                    const isPaid = bill.status === 'Lunas';
                    return (
                      <div 
                        key={bill.id} 
                        onClick={() => setSelectedBill(bill)}
                        style={{ 
                          padding: '14px 16px', borderRadius: 14, border: `1.5px solid ${isSelected ? '#10b981' : '#edf2f7'}`, 
                          cursor: 'pointer', background: isSelected ? '#f0fdf4' : '#f8fafc',
                          transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: 2 }}>{bill.service}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{bill.invoiceNo} · {formatDate(bill.date)}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 14 }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: isPaid ? '#15803d' : '#ea580c', marginBottom: 4 }}>{formatRupiah(bill.amount)}</div>
                          <span style={{ 
                            fontSize: '0.6rem', fontWeight: 800, padding: '2px 8px', borderRadius: 6,
                            background: isPaid ? '#dcfce7' : '#fff7ed', 
                            color: isPaid ? '#15803d' : '#ea580c',
                            border: `1.5px solid ${isPaid ? '#bbf7d0' : '#fed7aa'}`
                          }}>{bill.status}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Detail Tagihan (di sebelah kanan jika dipilih) */}
            {selectedBill && (
              <div style={{ flex: 1, borderLeft: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', background: '#fafafa', maxHeight: '82vh' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>Detail Rincian Tagihan</span>
                  <button onClick={() => setSelectedBill(null)} style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Status Box */}
                  <div style={{ padding: 14, background: selectedBill.status === 'Lunas' ? '#f0fdf4' : '#fff7ed', borderRadius: 12, border: `1px solid ${selectedBill.status === 'Lunas' ? '#bbf7d0' : '#fed7aa'}`, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: selectedBill.status === 'Lunas' ? '#15803d' : '#ea580c', letterSpacing: '0.05em' }}>Status Tagihan</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 850, color: selectedBill.status === 'Lunas' ? '#15803d' : '#ea580c', marginTop: 2 }}>{selectedBill.status}</div>
                  </div>

                  {/* Info Ringkas */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.78rem', color: '#475569' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Nomor Invoice:</span><strong style={{ color: '#1e293b' }}>{selectedBill.invoiceNo}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tanggal Terbit:</span><strong style={{ color: '#1e293b' }}>{formatDate(selectedBill.date)}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Layanan Medis:</span><strong style={{ color: '#1e293b' }}>{selectedBill.service}</strong></div>
                  </div>

                  {/* Rincian Item */}
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Itemized Breakdown</div>
                    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #edf2f7', overflow: 'hidden' }}>
                      {selectedBill.details && selectedBill.details.length > 0 ? (
                        selectedBill.details.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: idx < selectedBill.details.length - 1 ? '1px solid #f1f5f9' : 'none', fontSize: '0.78rem' }}>
                            <span style={{ color: '#475569' }}>{item.name || item.item}</span>
                            <span style={{ fontWeight: 700, color: '#1e293b' }}>{formatRupiah(item.price || item.amount || 0)}</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', fontSize: '0.78rem' }}>
                          <span style={{ color: '#475569' }}>Tarif Layanan Pokok</span>
                          <span style={{ fontWeight: 700, color: '#1e293b' }}>{formatRupiah(selectedBill.amount)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Total Tagihan */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px dashed #e2e8f0', paddingTop: 16, marginTop: 8 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Total Pembayaran:</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1e293b' }}>{formatRupiah(selectedBill.amount)}</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      <GuestFooter />
    </div>
  );
}
