import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { jadwalService, pasienService } from '../../lib/supabaseService';
import GuestNavbar from '../guest/components/GuestNavbar';
import GuestFooter from '../guest/components/GuestFooter';
import '../guest/guest.css';

// ─── Constants ─────────────────────────────────────────────────────────────────
const SERVICES = [
  { id: 'srv1', title: 'Konsultasi Dokter Hewan', desc: 'Pemeriksaan kesehatan, diagnosis, dan resep obat.', icon: '🩺', cost: 'Rp 75.000' },
  { id: 'srv2', title: 'Vaksinasi', desc: 'Imunisasi rabies, tricat, leukemia, dll.', icon: '💉', cost: 'Rp 150.000 - Rp 250.000' },
  { id: 'srv3', title: 'Grooming', desc: 'Mandi antijamur, potong bulu, potong kuku, dll.', icon: '✂️', cost: 'Rp 80.000 - Rp 150.000' },
  { id: 'srv4', title: 'Operasi / Tindakan Medis', desc: 'Sterilisasi, penanganan luka jahitan.', icon: '🩹', cost: 'Mulai Rp 500.000' },
  { id: 'srv5', title: 'Rawat Inap / Penitipan', desc: 'Perawatan medis rawat inap & penitipan sehat.', icon: '🏥', cost: 'Rp 100.000 - Rp 150.000/malam' },
  { id: 'srv6', title: 'Pemeriksaan Darah', desc: 'Tes laboratorium lengkap, kolesterol, ginjal.', icon: '🔬', cost: 'Rp 200.000' },
];
const DOCTORS = [
  { id: 'doc1', name: 'Dr. Rizal',  title: 'Spesialis Bedah & Umum',  avatar: '👨‍⚕️' },
  { id: 'doc2', name: 'Dr. Maya',   title: 'Dermatologi & Internis',   avatar: '👩‍⚕️' },
  { id: 'doc3', name: 'Dr. Sarah',  title: 'Spesialis Gigi & Umum',   avatar: '👩‍⚕️' },
];
const TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  'Dikonfirmasi': { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'Menunggu':     { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  'Selesai':      { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
  'Dibatalkan':   { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3' },
};

// ─── Sub-components ────────────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{ background: 'white', borderRadius: 16, border: '1px solid #edf2f7', boxShadow: '0 1px 6px rgba(15,23,42,0.05)', ...style }}>
    {children}
  </div>
);

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' };
  return (
    <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: '0.65rem', fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
};

const GreenBtn = ({ children, onClick, style = {} }) => (
  <button onClick={onClick} style={{
    display: 'inline-flex', alignItems: 'center', gap: 7,
    padding: '10px 20px', borderRadius: 12, border: 'none',
    background: '#16a34a', color: 'white', fontWeight: 700, fontSize: '0.83rem',
    cursor: 'pointer', boxShadow: '0 3px 10px rgba(22,163,74,0.25)', transition: 'all 0.2s', ...style,
  }}>
    {children}
  </button>
);

const FieldLabel = ({ children }) => (
  <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 6 }}>{children}</div>
);

const inputStyle = { width: '100%', padding: '9px 14px', boxSizing: 'border-box', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '0.83rem', color: '#1e293b', outline: 'none', background: 'white' };
const petEmoji = (sp) => ({ anjing: '🐕', kucing: '🐈', kelinci: '🐇', burung: '🦜' }[sp?.toLowerCase()] || '🐾');

export default function MemberAppointments() {
  const { member: authMember } = useMemberAuth();
  const location = useLocation();
  const member = (() => { try { return JSON.parse(localStorage.getItem('memberUser')); } catch { return authMember; } })() || authMember;

  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedPet, setSelectedPet] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');

  const load = async () => {
    if (!member?.id) return;
    setLoading(true); setError(null);
    try {
      const [appts, memberPets] = await Promise.all([jadwalService.getByMemberId(member.id), pasienService.getByMemberId(member.id)]);
      setAppointments(appts || []);
      setPets(memberPets || []);
      if (memberPets?.length > 0 && !selectedPet) setSelectedPet(memberPets[0].nama);
    } catch { setError('Gagal memuat data janji temu.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    if (location.state?.openBookingModal) {
      if (location.state.selectPet) setSelectedPet(location.state.selectPet);
      setIsWizardOpen(true); setStep(1);
      window.history.replaceState({}, document.title);
    }
  }, [member?.id, location.state]);

  const handleCancel = async (id) => {
    if (window.confirm('Batalkan janji temu ini?')) { await jadwalService.cancel(id); load(); }
  };
  const startBooking = () => {
    setSelectedService(null); if (pets.length > 0) setSelectedPet(pets[0].nama);
    setSelectedDoctor(null); setSelectedDate(''); setSelectedTime(''); setNotes(''); setStep(1); setIsWizardOpen(true);
  };
  const next = () => {
    if (step === 1 && !selectedService) { alert('Pilih layanan dahulu.'); return; }
    if (step === 2 && (!selectedPet || !selectedDoctor)) { alert('Pilih hewan & dokter dahulu.'); return; }
    if (step === 3 && (!selectedDate || !selectedTime)) { alert('Pilih tanggal & jam dahulu.'); return; }
    setStep(s => s + 1);
  };
  const confirmBooking = async () => {
    await jadwalService.create({ petName: selectedPet, service: selectedService.title, doctor: selectedDoctor.name, date: selectedDate, time: selectedTime, notes, memberId: member.id });
    setIsWizardOpen(false); load();
  };

  const upcoming = appointments.filter(a => a.status === 'Menunggu' || a.status === 'Dikonfirmasi');
  const past = appointments.filter(a => a.status === 'Selesai');
  const cancelled = appointments.filter(a => a.status === 'Dibatalkan');
  const TABS = [{ id: 'upcoming', label: `Mendatang (${upcoming.length})` }, { id: 'past', label: `Selesai (${past.length})` }, { id: 'cancelled', label: `Dibatalkan (${cancelled.length})` }];
  const currentList = activeTab === 'upcoming' ? upcoming : activeTab === 'past' ? past : cancelled;

  if (loading) return (
    <div className="guest-page"><GuestNavbar />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, border: '3px solid #16a34a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Memuat janji temu…</span>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <GuestFooter />
    </div>
  );

  return (
    <div className="guest-page">
      <GuestNavbar />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }.appt-row:hover { background: #f8fafc !important; }`}</style>

      <main style={{ paddingTop: 96, paddingBottom: 80, background: '#f4f7fc', minHeight: '60vh' }}>
        <div className="guest-container">
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#16a34a', marginBottom: 6 }}>Manajemen Jadwal</div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Janji Temu Medis</h1>
              <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>Jadwalkan kunjungan atau pantau riwayat janji temu klinis.</p>
            </div>
            <GreenBtn onClick={startBooking}>📅 Buat Janji Baru</GreenBtn>
          </div>

          {error && <div style={{ padding: 14, background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 12, color: '#e11d48', marginBottom: 16, fontSize: '0.83rem' }}>{error}</div>}

          {/* Tabs */}
          <Card style={{ overflow: 'hidden', marginBottom: 0 }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  flex: 1, padding: '14px 16px', background: 'none', border: 'none',
                  borderBottom: `3px solid ${activeTab === t.id ? '#16a34a' : 'transparent'}`,
                  color: activeTab === t.id ? '#16a34a' : '#94a3b8',
                  fontWeight: activeTab === t.id ? 700 : 600, fontSize: '0.83rem', cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ padding: 20 }}>
              {currentList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>📋</div>
                  <div style={{ fontSize: '0.85rem' }}>Tidak ada data janji temu di sini.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {currentList.map(appt => (
                    <div key={appt.id} className="appt-row" style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
                      padding: '14px 16px', borderRadius: 12, background: '#f8fafc', border: '1px solid #edf2f7', transition: 'background 0.15s',
                    }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', background: 'white', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: 6 }}>{appt.id}</span>
                          <StatusBadge status={appt.status} />
                        </div>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.88rem', marginBottom: 4 }}>
                          {appt.service} — <span style={{ color: '#16a34a' }}>{appt.petName}</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', fontSize: '0.75rem', color: '#64748b' }}>
                          <span>📅 {appt.date}</span>
                          <span>⏰ {appt.time} WIB</span>
                          <span>👨‍⚕️ {appt.doctor}</span>
                        </div>
                        {appt.notes && <div style={{ marginTop: 6, padding: '6px 10px', background: 'white', borderRadius: 8, fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', border: '1px solid #f1f5f9' }}>"{appt.notes}"</div>}
                      </div>
                      {(appt.status === 'Menunggu' || appt.status === 'Dikonfirmasi') && (
                        <button onClick={() => handleCancel(appt.id)} style={{
                          padding: '7px 14px', borderRadius: 10, border: '1.5px solid #fecdd3', background: '#fff1f2',
                          color: '#e11d48', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                        }}>
                          🚫 Batalkan
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>

      {/* ── Booking Wizard Modal ── */}
      {isWizardOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={() => setIsWizardOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', zIndex: 10, background: 'white', borderRadius: 20, width: '100%', maxWidth: 580, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0' }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>Pendaftaran Janji Temu</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>Selesaikan {4} langkah pemesanan jadwal dokter.</div>
              </div>
              <button onClick={() => setIsWizardOpen(false)} style={{ width: 30, height: 30, border: '1px solid #e2e8f0', borderRadius: 8, background: 'white', cursor: 'pointer', color: '#64748b', fontSize: '1rem' }}>✕</button>
            </div>

            {/* Stepper */}
            <div style={{ display: 'flex', padding: '16px 24px', gap: 0, alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
              {[{ s: 1, label: 'Layanan' }, { s: 2, label: 'Pasien & Dokter' }, { s: 3, label: 'Jadwal' }, { s: 4, label: 'Konfirmasi' }].map((si, idx, arr) => (
                <React.Fragment key={si.s}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 800, border: '2px solid',
                      background: step >= si.s ? '#16a34a' : 'white', color: step >= si.s ? 'white' : '#94a3b8', borderColor: step >= si.s ? '#16a34a' : '#e2e8f0',
                    }}>{si.s}</div>
                    <div style={{ fontSize: '0.62rem', fontWeight: 700, color: step >= si.s ? '#1e293b' : '#94a3b8' }}>{si.label}</div>
                  </div>
                  {idx < arr.length - 1 && <div style={{ flex: 1, height: 2, background: step > si.s ? '#16a34a' : '#e2e8f0', marginBottom: 16 }} />}
                </React.Fragment>
              ))}
            </div>

            {/* Step Contents */}
            <div style={{ padding: '20px 24px', minHeight: 280 }}>
              {/* STEP 1: Layanan */}
              {step === 1 && (
                <div>
                  <FieldLabel>Pilih Kategori Layanan</FieldLabel>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {SERVICES.map(srv => (
                      <div key={srv.id} onClick={() => setSelectedService(srv)} style={{
                        padding: '12px 14px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s',
                        border: `2px solid ${selectedService?.id === srv.id ? '#16a34a' : '#e2e8f0'}`,
                        background: selectedService?.id === srv.id ? '#f0fdf4' : 'white',
                        display: 'flex', gap: 10,
                      }}>
                        <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{srv.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1e293b', marginBottom: 2 }}>{srv.title}</div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: 4 }}>{srv.desc}</div>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '2px 8px', borderRadius: 9999 }}>{srv.cost}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: Hewan & Dokter */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <FieldLabel>Pilih Pasien (Hewan Peliharaan)</FieldLabel>
                    {pets.length === 0 ? (
                      <div style={{ padding: 14, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, fontSize: '0.8rem', color: '#92400e' }}>
                        Belum ada hewan terdaftar. Tutup modal dan tambahkan hewan terlebih dahulu.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {pets.map(p => (
                          <div key={p.id} onClick={() => setSelectedPet(p.nama)} style={{
                            padding: '10px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                            border: `2px solid ${selectedPet === p.nama ? '#16a34a' : '#e2e8f0'}`,
                            background: selectedPet === p.nama ? '#f0fdf4' : 'white', transition: 'all 0.15s',
                          }}>
                            <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: 4 }}>{petEmoji(p.spesies)}</span>
                            <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#1e293b' }}>{p.nama}</span>
                            <span style={{ display: 'block', fontSize: '0.65rem', color: '#94a3b8' }}>{p.spesies}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <FieldLabel>Pilih Dokter Spesialis</FieldLabel>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {DOCTORS.map(doc => (
                        <div key={doc.id} onClick={() => setSelectedDoctor(doc)} style={{
                          flex: 1, padding: '12px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                          border: `2px solid ${selectedDoctor?.id === doc.id ? '#16a34a' : '#e2e8f0'}`,
                          background: selectedDoctor?.id === doc.id ? '#f0fdf4' : 'white', transition: 'all 0.15s',
                        }}>
                          <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: 4 }}>{doc.avatar}</span>
                          <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#1e293b' }}>{doc.name}</div>
                          <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 2 }}>{doc.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Tanggal & Waktu */}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <FieldLabel>Pilih Tanggal</FieldLabel>
                      <input type="date" min={new Date().toISOString().split('T')[0]} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <FieldLabel>Pilih Jam Layanan</FieldLabel>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                        {TIME_SLOTS.map(t => (
                          <button key={t} type="button" onClick={() => setSelectedTime(t)} style={{
                            padding: '8px 4px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                            border: `2px solid ${selectedTime === t ? '#16a34a' : '#e2e8f0'}`,
                            background: selectedTime === t ? '#16a34a' : 'white', color: selectedTime === t ? 'white' : '#475569',
                          }}>{t}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Catatan / Keluhan</FieldLabel>
                    <textarea rows={3} placeholder="Tuliskan keluhan peliharaan Anda..." value={notes} onChange={e => setNotes(e.target.value)} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
                  </div>
                </div>
              )}

              {/* STEP 4: Konfirmasi */}
              {step === 4 && (
                <div>
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '18px 20px', marginBottom: 14, textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 6 }}>📄</div>
                    <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.9rem' }}>Ringkasan Janji Temu</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>Periksa kembali sebelum mengonfirmasi.</div>
                  </div>
                  {[['Layanan', selectedService?.title], ['Peliharaan', selectedPet], ['Dokter', `${selectedDoctor?.name} (${selectedDoctor?.title})`], ['Tanggal', selectedDate], ['Waktu', `${selectedTime} WIB`]].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.83rem' }}>
                      <span style={{ color: '#64748b' }}>{k}</span>
                      <span style={{ fontWeight: 700, color: '#1e293b' }}>{v}</span>
                    </div>
                  ))}
                  {notes && <div style={{ marginTop: 10, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>"{notes}"</div>}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'grid', gridTemplateColumns: step > 1 ? '1fr 1fr' : '1fr', gap: 10, padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
              {step > 1 && <button type="button" onClick={() => setStep(s => s - 1)} style={{ padding: '10px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer' }}>Kembali</button>}
              {step < 4
                ? <button type="button" onClick={next} style={{ padding: '10px', borderRadius: 12, border: 'none', background: '#16a34a', color: 'white', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer' }}>Lanjut →</button>
                : <button type="button" onClick={confirmBooking} style={{ padding: '10px', borderRadius: 12, border: 'none', background: '#16a34a', color: 'white', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer' }}>✅ Konfirmasi & Daftarkan</button>
              }
            </div>
          </div>
        </div>
      )}
      <GuestFooter />
    </div>
  );
}
