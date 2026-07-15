import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { pasienService } from '../../lib/supabaseService';
import GuestNavbar from '../guest/components/GuestNavbar';
import GuestFooter from '../guest/components/GuestFooter';
import '../guest/guest.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const petEmoji = (sp) => ({ anjing: '🐕', kucing: '🐈', kelinci: '🐇', burung: '🦜' }[sp?.toLowerCase()] || '🐾');
const petColor = (sp) => ({ anjing: { bg: '#fef3c7', color: '#b45309' }, kucing: { bg: '#e0f2fe', color: '#0369a1' }, kelinci: { bg: '#f5f3ff', color: '#6d28d9' } }[sp?.toLowerCase()] || { bg: '#f0fdf4', color: '#15803d' });

const getAge = (d) => {
  if (!d) return 'Umur tidak diketahui';
  const b = new Date(d), t = new Date();
  let y = t.getFullYear() - b.getFullYear(), m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) { y--; m += 12; }
  return y > 0 ? `${y} tahun${m > 0 ? ` ${m} bln` : ''}` : `${m} bulan`;
};

const STATUS_CFG = {
  'Sehat':             { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'Vaksin Jatuh Tempo':{ bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  'Perlu Perhatian':   { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3' },
};

const FieldLabel = ({ children }) => <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 6 }}>{children}</div>;
const inputStyle = { width: '100%', padding: '9px 14px', boxSizing: 'border-box', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '0.83rem', color: '#1e293b', outline: 'none', background: 'white' };
const selStyle = { ...inputStyle };

export default function MemberPets() {
  const navigate = useNavigate();
  const location = useLocation();

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [nama, setNama] = useState('');
  const [spesies, setSpesies] = useState('Anjing');
  const [ras, setRas] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState('Jantan');
  const [berat, setBerat] = useState('');
  const [warna, setWarna] = useState('');
  const [sterilisasi, setSterilisasi] = useState(false);

  const getMember = () => { try { return JSON.parse(localStorage.getItem('memberUser')); } catch { return null; } };

  const loadPets = async () => {
    setLoading(true); setError(null);
    try {
      const member = getMember();
      if (!member?.id) { setPets([]); return; }
      setPets(await pasienService.getByMemberId(member.id) || []);
    } catch { setError('Gagal memuat data hewan. Coba lagi.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadPets();
    if (location.state?.openAddModal) { openAddModal(); window.history.replaceState({}, document.title); }
  }, [location.state]);

  const openAddModal = () => {
    setEditingPet(null); setNama(''); setSpesies('Anjing'); setRas(''); setTanggalLahir('');
    setJenisKelamin('Jantan'); setBerat(''); setWarna(''); setSterilisasi(false); setIsModalOpen(true);
  };
  const openEditModal = (pet, e) => {
    e.stopPropagation(); setEditingPet(pet); setNama(pet.nama || ''); setSpesies(pet.spesies || 'Anjing');
    setRas(pet.ras || ''); setTanggalLahir(pet.tanggalLahir || ''); setJenisKelamin(pet.jenisKelamin || 'Jantan');
    setBerat(pet.berat || ''); setWarna(pet.warna || ''); setSterilisasi(pet.sterilisasi || false); setIsModalOpen(true);
  };
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Hapus hewan ini?')) { try { await pasienService.delete(id); loadPets(); } catch { alert('Gagal menghapus.'); } }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const member = getMember();
    const data = { nama, spesies, ras, tanggalLahir, jenisKelamin, berat: parseFloat(berat) || 0, warna, sterilisasi };
    try {
      editingPet ? await pasienService.update(editingPet.id, data) : await pasienService.add({ ...data, memberId: member?.id });
      setIsModalOpen(false); loadPets();
    } catch { alert('Gagal menyimpan.'); }
  };

  return (
    <div className="guest-page">
      <GuestNavbar />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } } .pet-card:hover { box-shadow: 0 8px 24px rgba(15,23,42,0.12) !important; transform: translateY(-3px) !important; }`}</style>

      <main style={{ paddingTop: 96, paddingBottom: 80, background: '#f4f7fc', minHeight: '60vh' }}>
        <div className="guest-container">
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#16a34a', marginBottom: 6 }}>Manajemen Hewan</div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Hewan Peliharaan Saya</h1>
              <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>Kelola profil dan pantau status kesehatan peliharaan Anda.</p>
            </div>
            <button onClick={openAddModal} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 12, border: 'none',
              background: '#16a34a', color: 'white', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(22,163,74,0.25)',
            }}>
              ＋ Tambah Hewan
            </button>
          </div>

          {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div style={{ width: 40, height: 40, border: '3px solid #16a34a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>}
          {error && <div style={{ padding: 14, background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 12, color: '#e11d48', fontSize: '0.83rem' }}>{error}</div>}

          {!loading && !error && (
            pets.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 18, border: '1px solid #edf2f7', padding: '60px 24px', textAlign: 'center', boxShadow: '0 1px 6px rgba(15,23,42,0.05)' }}>
                <div style={{ width: 80, height: 80, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '2.2rem' }}>🐾</div>
                <h3 style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.1rem', marginBottom: 8 }}>Belum Ada Hewan Peliharaan</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: 380, margin: '0 auto 24px', lineHeight: 1.6 }}>Daftarkan hewan kesayangan Anda untuk mulai mengelola rekam medis dan jadwal kunjungan.</p>
                <button onClick={openAddModal} style={{ padding: '10px 24px', borderRadius: 12, border: '1.5px solid #bbf7d0', background: '#f0fdf4', color: '#16a34a', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                  ＋ Tambah Sekarang
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
                {pets.map(pet => {
                  const pc = petColor(pet.spesies);
                  const sc = STATUS_CFG[pet.status] || { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
                  return (
                    <div key={pet.id} className="pet-card" onClick={() => navigate(`/member/hewan/${pet.id}`)} style={{
                      background: 'white', borderRadius: 18, border: '1px solid #edf2f7', overflow: 'hidden',
                      cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 6px rgba(15,23,42,0.05)',
                    }}>
                      {/* Card Top Banner */}
                      <div style={{ height: 72, background: `linear-gradient(135deg, ${pc.bg}, white)`, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '0 18px 10px' }}>
                        <div style={{
                          width: 54, height: 54, borderRadius: 14, fontSize: '1.7rem',
                          background: pc.bg, border: `2px solid ${pc.color}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateY(18px)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}>{petEmoji(pet.spesies)}</div>
                        <div style={{ marginLeft: 'auto' }}>
                          <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: '0.65rem', fontWeight: 700, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{pet.status}</span>
                        </div>
                      </div>
                      {/* Card Body */}
                      <div style={{ padding: '24px 18px 16px' }}>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b', marginBottom: 2 }}>{pet.nama}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 14 }}>{pet.spesies} · {pet.ras || 'Blasteran'}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 0', borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                          {[['Umur', getAge(pet.tanggalLahir)], ['Berat', pet.berat ? `${pet.berat} kg` : '-'], ['Kelamin', pet.jenisKelamin], ['Sterilisasi', pet.sterilisasi ? 'Sudah' : 'Belum']].map(([k, v]) => (
                            <div key={k}>
                              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{k}</div>
                              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>{v}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 12, borderTop: '1px solid #f8fafc' }}>
                          <button onClick={e => openEditModal(pet, e)} style={{ flex: 1, padding: '7px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>✏️ Edit</button>
                          <button onClick={e => { e.stopPropagation(); navigate(`/member/hewan/${pet.id}`); }} style={{ flex: 1, padding: '7px', borderRadius: 10, border: 'none', background: '#f0fdf4', color: '#16a34a', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>👁️ Detail</button>
                          <button onClick={e => handleDelete(pet.id, e)} style={{ padding: '7px 10px', borderRadius: 10, border: 'none', background: '#fff1f2', color: '#e11d48', fontSize: '0.75rem', cursor: 'pointer' }}>🗑️</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', zIndex: 10, background: 'white', borderRadius: 20, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{editingPet ? '✏️ Edit Data Hewan' : '🐾 Daftarkan Hewan Baru'}</div>
              <button onClick={() => setIsModalOpen(false)} style={{ width: 30, height: 30, border: '1px solid #e2e8f0', borderRadius: 8, background: 'white', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '18px 24px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <FieldLabel>Nama Hewan</FieldLabel>
                <input type="text" required placeholder="Contoh: Buddy, Luna, Mochi" value={nama} onChange={e => setNama(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <FieldLabel>Jenis Hewan</FieldLabel>
                  <select value={spesies} onChange={e => setSpesies(e.target.value)} style={selStyle}>
                    {['Anjing 🐕', 'Kucing 🐈', 'Kelinci 🐇', 'Burung 🦜', 'Lainnya 🐾'].map(s => <option key={s} value={s.split(' ')[0]}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <FieldLabel>Ras / Breed</FieldLabel>
                  <input type="text" placeholder="Contoh: Golden, Persia" value={ras} onChange={e => setRas(e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <FieldLabel>Tanggal Lahir</FieldLabel>
                  <input type="date" required value={tanggalLahir} onChange={e => setTanggalLahir(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <FieldLabel>Jenis Kelamin</FieldLabel>
                  <select value={jenisKelamin} onChange={e => setJenisKelamin(e.target.value)} style={selStyle}>
                    <option>Jantan</option><option>Betina</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <FieldLabel>Berat Badan (kg)</FieldLabel>
                  <input type="number" step="0.1" placeholder="Contoh: 12.5" value={berat} onChange={e => setBerat(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <FieldLabel>Warna Bulu</FieldLabel>
                  <input type="text" placeholder="Contoh: Golden, Cokelat" value={warna} onChange={e => setWarna(e.target.value)} style={inputStyle} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', paddingTop: 4 }}>
                <input type="checkbox" checked={sterilisasi} onChange={e => setSterilisasi(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#16a34a' }} />
                <span style={{ fontSize: '0.83rem', fontWeight: 600, color: '#475569' }}>Sudah Disterilisasi (Kastrasi/Steril)</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer' }}>Batal</button>
                <button type="submit" style={{ padding: '10px', borderRadius: 12, border: 'none', background: '#16a34a', color: 'white', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer' }}>{editingPet ? 'Simpan Perubahan' : 'Daftarkan Hewan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <GuestFooter />
    </div>
  );
}
