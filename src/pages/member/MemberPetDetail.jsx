import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { pasienService, jadwalService, medicalRecordService, vaccineService } from '../../lib/supabaseService';
import GuestNavbar from '../guest/components/GuestNavbar';
import GuestFooter from '../guest/components/GuestFooter';
import '../guest/guest.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const petEmoji = (sp) => ({ anjing: '🐕', kucing: '🐈', kelinci: '🐇', burung: '🦜' }[sp?.toLowerCase()] || '🐾');
const petAccent = (sp) => ({ anjing: { bg: '#fef3c7', color: '#b45309' }, kucing: { bg: '#e0f2fe', color: '#0369a1' }, kelinci: { bg: '#f5f3ff', color: '#6d28d9' } }[sp?.toLowerCase()] || { bg: '#dcfce7', color: '#15803d' });

const getAge = (d) => {
  if (!d) return '-';
  const b = new Date(d), t = new Date();
  let y = t.getFullYear() - b.getFullYear(), m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) { y--; m += 12; }
  return y > 0 ? `${y} tahun${m > 0 ? ` ${m} bln` : ''}` : `${m} bulan`;
};

const STATUS_BADGE = {
  Sehat:              { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'Vaksin Jatuh Tempo': { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  'Perlu Perhatian':  { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3' },
};

const APPT_BADGE = {
  Dikonfirmasi: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  Menunggu:     { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  Selesai:      { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
  Dibatalkan:   { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3' },
};

export default function MemberPetDetail() {
  const { id } = useParams();
  const { member } = useMemberAuth();
  const navigate = useNavigate();

  const [pet, setPet] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const memberUser = JSON.parse(localStorage.getItem('memberUser'));
        const memberId = memberUser?.id;
        if (!memberId) { setPet(null); return; }
        const memberPets = await pasienService.getByMemberId(memberId);
        const found = memberPets.find(p => p.id === id);
        if (!found) { setPet(null); return; }
        setPet(found);
        const [allAppts, allRecords, allVaccines] = await Promise.all([
          jadwalService.getByMemberId(memberId),
          medicalRecordService.getByMemberId(memberId),
          vaccineService.getAll(),
        ]);
        setAppointments(allAppts.filter(a => a.petName?.toLowerCase() === found.nama?.toLowerCase()));
        setRecords(allRecords.filter(r => r.petName?.toLowerCase() === found.nama?.toLowerCase()));
        setVaccines(allVaccines.filter(v => v.petName?.toLowerCase() === found.nama?.toLowerCase()));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [id, member]);

  if (loading) return (
    <div className="guest-page"><GuestNavbar />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #16a34a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <GuestFooter />
    </div>
  );

  if (!pet) return (
    <div className="guest-page"><GuestNavbar />
      <main style={{ paddingTop: 96, paddingBottom: 80, background: '#f4f7fc', minHeight: '60vh' }}>
        <div className="guest-container">
          <div style={{ background: 'white', borderRadius: 18, border: '1px solid #edf2f7', padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
            <h3 style={{ fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>Hewan Tidak Ditemukan</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: 340, margin: '0 auto 24px' }}>Profil hewan tidak ada atau Anda tidak memiliki akses.</p>
            <button onClick={() => navigate('/member/hewan')} style={{ padding: '10px 24px', borderRadius: 12, border: 'none', background: '#16a34a', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Kembali ke Daftar</button>
          </div>
        </div>
      </main>
      <GuestFooter />
    </div>
  );

  const accent = petAccent(pet.spesies);
  const statusCfg = STATUS_BADGE[pet.status] || { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
  const TABS = [{ id: 'summary', label: 'Ringkasan', icon: '📝' }, { id: 'medical', label: 'Rekam Medis', icon: '📋' }, { id: 'vaccines', label: 'Vaksinasi', icon: '💉' }, { id: 'appointments', label: 'Janji Temu', icon: '📅' }];

  return (
    <div className="guest-page">
      <GuestNavbar />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <main style={{ paddingTop: 96, paddingBottom: 80, background: '#f4f7fc', minHeight: '60vh' }}>
        <div className="guest-container">
          {/* Back */}
          <button onClick={() => navigate('/member/hewan')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748b', fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer', marginBottom: 18, padding: 0 }}>
            ← Kembali ke Daftar Hewan
          </button>

          {/* Pet Header Card */}
          <div style={{ background: 'white', borderRadius: 18, border: '1px solid #edf2f7', overflow: 'hidden', marginBottom: 20, boxShadow: '0 2px 10px rgba(15,23,42,0.06)' }}>
            {/* Banner */}
            <div style={{ height: 100, background: `linear-gradient(135deg, ${accent.bg}, white)`, position: 'relative', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
              <div style={{ position: 'absolute', top: 14, right: 16 }}>
                <span style={{ padding: '4px 12px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 700, background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}>
                  {pet.status}
                </span>
              </div>
              {/* Avatar overlapping */}
              <div style={{ width: 72, height: 72, borderRadius: 18, background: accent.bg, border: `2px solid ${accent.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transform: 'translateY(24px)', zIndex: 2, flexShrink: 0 }}>
                {petEmoji(pet.spesies)}
              </div>
            </div>
            {/* Info */}
            <div style={{ padding: '30px 24px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>{pet.nama}</h1>
                <p style={{ color: '#94a3b8', fontSize: '0.83rem', margin: 0 }}>{pet.spesies} · {pet.ras || 'Blasteran'} · {getAge(pet.tanggalLahir)}</p>
              </div>
              <button onClick={() => navigate('/member/janji', { state: { openBookingModal: true, selectPet: pet.nama } })} style={{
                padding: '9px 18px', borderRadius: 12, border: 'none', background: '#16a34a', color: 'white',
                fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(22,163,74,0.25)',
              }}>📅 Buat Janji Temu</button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ background: 'white', borderRadius: 18, border: '1px solid #edf2f7', overflow: 'hidden', boxShadow: '0 1px 6px rgba(15,23,42,0.05)' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', overflowX: 'auto' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '13px 20px',
                  background: 'none', border: 'none', borderBottom: `3px solid ${activeTab === t.id ? '#16a34a' : 'transparent'}`,
                  color: activeTab === t.id ? '#16a34a' : '#94a3b8', fontWeight: activeTab === t.id ? 800 : 600,
                  fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
                }}>
                  <span>{t.icon}</span> {t.label}
                </button>
              ))}
            </div>

            <div style={{ padding: 22 }}>
              {/* ─── SUMMARY ─── */}
              {activeTab === 'summary' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.88rem', marginBottom: 12 }}>Informasi Dasar</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10 }}>
                      {[['Nama Lengkap', pet.nama], ['Spesies', pet.spesies], ['Ras / Breed', pet.ras || '-'], ['Tanggal Lahir', pet.tanggalLahir || '-'], ['Jenis Kelamin', pet.jenisKelamin], ['Berat Badan', pet.berat ? `${pet.berat} kg` : '-'], ['Warna Bulu', pet.warna || '-'], ['Sterilisasi', pet.sterilisasi ? 'Sudah Steril' : 'Belum Steril']].map(([k, v]) => (
                        <div key={k} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #edf2f7' }}>
                          <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8', marginBottom: 4 }}>{k}</div>
                          <div style={{ fontSize: '0.83rem', fontWeight: 700, color: '#1e293b' }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 18 }}>
                    <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.88rem', marginBottom: 10 }}>Status Kesehatan</div>
                    <div style={{ padding: '14px 16px', background: statusCfg.bg, border: `1px solid ${statusCfg.border}`, borderRadius: 12, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{pet.status === 'Sehat' ? '🟢' : pet.status === 'Vaksin Jatuh Tempo' ? '🟡' : '🔴'}</span>
                      <div>
                        <div style={{ fontWeight: 800, color: statusCfg.color, fontSize: '0.88rem', marginBottom: 4 }}>Status: {pet.status}</div>
                        <div style={{ fontSize: '0.78rem', color: statusCfg.color, opacity: 0.85, lineHeight: 1.5 }}>
                          {pet.status === 'Sehat' ? 'Hewan peliharaan Anda dalam kondisi prima. Berikan asupan makanan sehat dan pemeriksaan berkala.'
                            : pet.status === 'Vaksin Jatuh Tempo' ? 'Jadwal imunisasi sudah jatuh tempo. Segera buat janji vaksinasi agar kekebalan terjaga.'
                            : 'Membutuhkan perhatian klinis. Silakan hubungi dokter hewan jika ada gejala mengkhawatirkan.'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── MEDICAL ─── */}
              {activeTab === 'medical' && (
                <div>
                  <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.88rem', marginBottom: 12 }}>Riwayat Pemeriksaan Medis</div>
                  {records.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '36px', background: '#f8fafc', borderRadius: 12, border: '1.5px dashed #e2e8f0', color: '#94a3b8', fontSize: '0.83rem' }}>
                      📋 Belum ada rekam medis untuk {pet.nama}.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {records.map(rec => (
                        <div key={rec.id} style={{ background: 'white', border: '1px solid #edf2f7', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f8fafc', paddingBottom: 10, marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ padding: '2px 8px', background: '#f0fdf4', color: '#16a34a', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700 }}>{rec.id}</span>
                              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{rec.date}</span>
                            </div>
                            <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>👨‍⚕️ {rec.doctor}</span>
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Diagnosis</span>
                            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem', marginTop: 3 }}>{rec.diagnosis}</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {[['Tindakan', rec.action], ['Terapi', rec.treatment]].map(([k, v]) => (
                              <div key={k}>
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{k}</span>
                                <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: 2 }}>{v}</div>
                              </div>
                            ))}
                          </div>
                          {rec.notes && <div style={{ marginTop: 10, padding: '8px 12px', background: '#fffbeb', borderRadius: 8, fontSize: '0.75rem', color: '#92400e', fontStyle: 'italic' }}>📝 {rec.notes}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── VACCINES ─── */}
              {activeTab === 'vaccines' && (
                <div>
                  <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.88rem', marginBottom: 12 }}>Jadwal & Riwayat Imunisasi</div>
                  {vaccines.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '36px', background: '#f8fafc', borderRadius: 12, border: '1.5px dashed #e2e8f0', color: '#94a3b8', fontSize: '0.83rem' }}>
                      💉 Belum ada data vaksinasi untuk {pet.nama}.
                    </div>
                  ) : (
                    <div style={{ border: '1px solid #edf2f7', borderRadius: 12, overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #edf2f7' }}>
                            {['Jenis Vaksin', 'Jatuh Tempo', 'Sisa / Telat', 'Status'].map(h => (
                              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {vaccines.map(v => {
                            const isOverdue = v.daysRemaining < 0;
                            const done = v.status === 'Sudah Diingatkan';
                            const badge = done ? { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', text: 'Selesai' } : isOverdue ? { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3', text: 'Terlambat' } : { bg: '#fffbeb', color: '#d97706', border: '#fde68a', text: 'Jatuh Tempo' };
                            return (
                              <tr key={v.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                <td style={{ padding: '10px 14px', fontWeight: 700, color: '#1e293b' }}>{v.vaccineType}</td>
                                <td style={{ padding: '10px 14px', color: '#64748b' }}>{v.dueDate}</td>
                                <td style={{ padding: '10px 14px', color: '#64748b' }}>{done ? '-' : isOverdue ? `${Math.abs(v.daysRemaining)} hari terlambat` : `${v.daysRemaining} hari lagi`}</td>
                                <td style={{ padding: '10px 14px' }}>
                                  <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 700, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>{badge.text}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ─── APPOINTMENTS ─── */}
              {activeTab === 'appointments' && (
                <div>
                  <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.88rem', marginBottom: 12 }}>Riwayat Janji Temu</div>
                  {appointments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '36px', background: '#f8fafc', borderRadius: 12, border: '1.5px dashed #e2e8f0', color: '#94a3b8', fontSize: '0.83rem' }}>
                      📅 Belum ada janji temu untuk {pet.nama}.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {appointments.map(appt => {
                        const ab = APPT_BADGE[appt.status] || { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
                        return (
                          <div key={appt.id} style={{ background: 'white', border: '1px solid #edf2f7', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                            <div>
                              <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem', marginBottom: 4 }}>{appt.service}</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 14px', fontSize: '0.75rem', color: '#64748b' }}>
                                <span>📅 {appt.date}</span>
                                <span>⏰ {appt.time} WIB</span>
                                <span>👨‍⚕️ {appt.doctor}</span>
                              </div>
                              {appt.notes && <div style={{ marginTop: 6, fontSize: '0.73rem', color: '#64748b', fontStyle: 'italic' }}>"{appt.notes}"</div>}
                            </div>
                            <span style={{ padding: '4px 12px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 700, background: ab.bg, color: ab.color, border: `1px solid ${ab.border}`, whiteSpace: 'nowrap' }}>{appt.status}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <GuestFooter />
    </div>
  );
}
