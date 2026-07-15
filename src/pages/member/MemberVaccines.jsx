import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { vaccineService } from '../../lib/supabaseService';
import GuestNavbar from '../guest/components/GuestNavbar';
import GuestFooter from '../guest/components/GuestFooter';
import '../guest/guest.css';

const BADGE_CFG = {
  done:    { text: 'Selesai ✓',       bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  overdue: { text: 'Terlambat ⚠️',    bg: '#fff1f2', color: '#e11d48', border: '#fecdd3' },
  soon:    { text: 'Jatuh Tempo ⏰',   bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  sched:   { text: 'Terjadwal 🗓️',    bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
};

const getBadge = (v) => {
  if (v.status === 'Sudah Diingatkan') return BADGE_CFG.done;
  if (v.daysRemaining < 0) return BADGE_CFG.overdue;
  if (v.daysRemaining <= 7) return BADGE_CFG.soon;
  return BADGE_CFG.sched;
};

const StatCard = ({ emoji, label, value, color }) => (
  <div style={{ background: 'white', borderRadius: 14, border: '1px solid #edf2f7', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
    <div>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e293b' }}>{value}</div>
    </div>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '18', border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>{emoji}</div>
  </div>
);

const selStyle = { padding: '7px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '0.8rem', outline: 'none', background: 'white', color: '#1e293b', cursor: 'pointer' };

export default function MemberVaccines() {
  const { member: authMember } = useMemberAuth();
  const navigate = useNavigate();
  const member = (() => { try { return JSON.parse(localStorage.getItem('memberUser')); } catch { return authMember; } })() || authMember;

  const [vaccines, setVaccines] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPet, setFilterPet] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    const load = async () => {
      if (!member?.email) return;
      setLoading(true); setError(null);
      try {
        const list = await vaccineService.getByEmail(member.email);
        setVaccines(list || []);
        const seen = new Set(), uniquePets = [];
        (list || []).forEach(v => { if (v.petName && !seen.has(v.petName)) { seen.add(v.petName); uniquePets.push({ id: v.petName, nama: v.petName, spesies: v.species || '' }); } });
        setPets(uniquePets);
      } catch { setError('Gagal memuat data vaksinasi.'); }
      finally { setLoading(false); }
    };
    load();
  }, [member?.email]);

  const totalCount = vaccines.length;
  const doneCount = vaccines.filter(v => v.status === 'Sudah Diingatkan').length;
  const overdueCount = vaccines.filter(v => v.status === 'Belum Diingatkan' && v.daysRemaining < 0).length;
  const soonCount = vaccines.filter(v => v.status === 'Belum Diingatkan' && v.daysRemaining >= 0 && v.daysRemaining <= 7).length;

  const filtered = vaccines.filter(v => {
    const matchPet = filterPet === 'All' || v.petName?.toLowerCase() === filterPet.toLowerCase();
    const isOverdue = v.daysRemaining < 0 && v.status === 'Belum Diingatkan';
    const isSoon = v.daysRemaining >= 0 && v.daysRemaining <= 7 && v.status === 'Belum Diingatkan';
    const isScheduled = v.daysRemaining > 7 && v.status === 'Belum Diingatkan';
    const isDone = v.status === 'Sudah Diingatkan';
    let matchStatus = true;
    if (filterStatus === 'overdue') matchStatus = isOverdue;
    else if (filterStatus === 'soon') matchStatus = isSoon;
    else if (filterStatus === 'sched') matchStatus = isScheduled;
    else if (filterStatus === 'done') matchStatus = isDone;
    return matchPet && matchStatus;
  });

  if (loading) return (
    <div className="guest-page"><GuestNavbar />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #16a34a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <GuestFooter />
    </div>
  );

  return (
    <div className="guest-page">
      <GuestNavbar />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } } @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>

      <main style={{ paddingTop: 96, paddingBottom: 80, background: '#f4f7fc', minHeight: '60vh' }}>
        <div className="guest-container">
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 22 }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#16a34a', marginBottom: 6 }}>Kalender Imunisasi</div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Jadwal Vaksinasi</h1>
              <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>Pantau dan kelola jadwal imunisasi tahunan hewan kesayangan Anda.</p>
            </div>
            <button onClick={() => navigate('/member/janji', { state: { openBookingModal: true } })} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 12, border: 'none',
              background: '#16a34a', color: 'white', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer', boxShadow: '0 3px 10px rgba(22,163,74,0.25)',
            }}>💉 Booking Vaksinasi</button>
          </div>

          {error && <div style={{ padding: 14, background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 12, color: '#e11d48', marginBottom: 16, fontSize: '0.83rem' }}>{error}</div>}

          {/* Warning Banner */}
          {(overdueCount > 0 || soonCount > 0) && (
            <div style={{
              background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)', border: '1px solid #fecdd3', borderRadius: 14,
              padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
            }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>⚠️</span>
                <div>
                  <div style={{ fontWeight: 800, color: '#9f1239', fontSize: '0.88rem' }}>Peringatan Jadwal Vaksinasi!</div>
                  <div style={{ fontSize: '0.78rem', color: '#e11d48', marginTop: 2 }}>
                    {overdueCount > 0 && <strong>{overdueCount} vaksin terlambat</strong>}{overdueCount > 0 && soonCount > 0 && ' & '}{soonCount > 0 && <strong>{soonCount} hampir jatuh tempo</strong>}. Segera buat janji vaksinasi.
                  </div>
                </div>
              </div>
              <button onClick={() => navigate('/member/janji', { state: { openBookingModal: true } })} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: '#e11d48', color: 'white', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>Buat Janji Sekarang</button>
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
            <StatCard emoji="💉" label="Total Vaksin" value={totalCount} color="#0ea5e9" />
            <StatCard emoji="✅" label="Selesai" value={doneCount} color="#16a34a" />
            <StatCard emoji="⏰" label="Jatuh Tempo (7 Hari)" value={soonCount} color="#d97706" />
            <StatCard emoji="🚨" label="Terlambat" value={overdueCount} color="#e11d48" />
          </div>

          {/* Filter */}
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #edf2f7', padding: '12px 18px', marginBottom: 18, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hewan:</span>
              <select value={filterPet} onChange={e => setFilterPet(e.target.value)} style={selStyle}>
                <option value="All">Semua ({pets.length})</option>
                {pets.map(p => <option key={p.id} value={p.nama}>{p.nama} ({p.spesies})</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status:</span>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selStyle}>
                <option value="All">Semua Status</option>
                <option value="overdue">Terlambat ⚠️</option>
                <option value="soon">Jatuh Tempo ⏰</option>
                <option value="sched">Terjadwal 🗓️</option>
                <option value="done">Selesai ✓</option>
              </select>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #edf2f7', padding: '20px 24px', boxShadow: '0 1px 6px rgba(15,23,42,0.05)' }}>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#1e293b', marginBottom: 18 }}>📅 Timeline Vaksinasi</div>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>💉</div>
                <div style={{ fontSize: '0.85rem' }}>Tidak ada jadwal vaksinasi yang cocok dengan filter ini.</div>
              </div>
            ) : (
              <div style={{ position: 'relative', paddingLeft: 24, borderLeft: '2px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {filtered.map(v => {
                  const badge = getBadge(v);
                  const isOverdue = v.daysRemaining < 0 && v.status === 'Belum Diingatkan';
                  const isSoon = v.daysRemaining >= 0 && v.daysRemaining <= 7 && v.status === 'Belum Diingatkan';
                  const dotColor = v.status === 'Sudah Diingatkan' ? '#16a34a' : isOverdue ? '#e11d48' : isSoon ? '#d97706' : '#94a3b8';
                  return (
                    <div key={v.id} style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: -32, top: 10, width: 14, height: 14, borderRadius: '50%', background: dotColor, border: '3px solid white', boxShadow: `0 0 0 2px ${dotColor}40`, animation: isOverdue ? 'pulse-dot 1.5s infinite' : 'none' }} />
                      <div style={{ background: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#1e293b' }}>{v.vaccineType}</span>
                            <span style={{ fontSize: '0.62rem', color: '#94a3b8', background: 'white', border: '1px solid #e2e8f0', padding: '1px 7px', borderRadius: 6 }}>ID: {v.id}</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 4 }}>
                            🐾 <strong style={{ color: '#16a34a' }}>{v.petName}</strong> · {v.species}
                          </div>
                          <div style={{ display: 'flex', gap: 16, fontSize: '0.72rem', color: '#94a3b8' }}>
                            <span>📅 {v.dueDate}</span>
                            {v.status === 'Belum Diingatkan' && (
                              <span>{isOverdue ? `⏳ ${Math.abs(v.daysRemaining)} hari terlambat` : `⏳ ${v.daysRemaining} hari lagi`}</span>
                            )}
                          </div>
                        </div>
                        <span style={{ padding: '4px 12px', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 700, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, whiteSpace: 'nowrap' }}>{badge.text}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <GuestFooter />
    </div>
  );
}
